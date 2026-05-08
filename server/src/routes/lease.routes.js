const express = require('express');
const Lease = require('../models/Lease');
const Property = require('../models/Property');
const { authenticate, requireRole } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

router.post('/', authenticate, requireRole('landlord', 'admin'), async (req, res, next) => {
  try {
    const { property, tenant, startDate, endDate, monthlyRent, deposit, status } = req.body;
    const prop = await Property.findById(property);
    if (!prop || String(prop.landlord) !== String(req.user._id)) {
      if (req.user.role !== 'admin') return res.status(400).json({ message: 'Invalid property' });
    }
    const lease = await Lease.create({
      property,
      tenant,
      landlord: prop.landlord,
      startDate,
      endDate,
      monthlyRent,
      deposit: deposit ?? prop.deposit,
      status: status || 'pending',
    });
    await Notification.create({
      user: tenant,
      title: 'New lease',
      body: 'A lease has been created for you.',
    });
    res.status(201).json(lease);
  } catch (e) {
    next(e);
  }
});

router.get('/tenant/mine', authenticate, requireRole('tenant'), async (req, res, next) => {
  try {
    const list = await Lease.find({ tenant: req.user._id })
      .populate('property')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/landlord/mine', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const list = await Lease.find({ landlord: req.user._id })
      .populate('property')
      .populate('tenant', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('property')
      .populate('tenant', 'name email phone')
      .populate('landlord', 'name email phone');
    if (!lease) return res.status(404).json({ message: 'Not found' });
    const uid = String(req.user._id);
    if (
      req.user.role !== 'admin' &&
      String(lease.tenant?._id) !== uid &&
      String(lease.landlord?._id) !== uid
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(lease);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/status', authenticate, requireRole('landlord', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(lease.landlord) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    lease.status = status;
    await lease.save();
    res.json(lease);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/documents', authenticate, async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ message: 'Not found' });
    const uid = String(req.user._id);
    if (
      req.user.role !== 'admin' &&
      String(lease.tenant) !== uid &&
      String(lease.landlord) !== uid
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({
      leaseId: lease._id,
      documents: lease.documents || [],
      status: lease.status,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/documents', authenticate, requireRole('landlord', 'admin'), async (req, res, next) => {
  try {
    const { documents } = req.body;
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(lease.landlord) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!Array.isArray(documents)) {
      return res.status(400).json({ message: 'Documents must be an array' });
    }
    lease.documents = [...(lease.documents || []), ...documents];
    await lease.save();
    res.json(lease);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
