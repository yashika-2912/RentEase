const express = require('express');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Property = require('../models/Property');
const { authenticate, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { initCloudinary, cloudinary } = require('../config/cloudinary');

const router = express.Router();

router.post('/', authenticate, requireRole('tenant'), upload.array('images', 5), async (req, res, next) => {
  try {
    initCloudinary();
    const { property, title, description, category, priority } = req.body;
    const prop = await Property.findById(property);
    if (!prop) return res.status(400).json({ message: 'Invalid property' });
    const images = [];
    if (req.files?.length && process.env.CLOUDINARY_CLOUD_NAME) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        // eslint-disable-next-line no-await-in-loop
        const up = await cloudinary.uploader.upload(dataUri, { folder: 'rentease/maintenance' });
        images.push(up.secure_url);
      }
    }
    const ticket = await MaintenanceRequest.create({
      property,
      tenant: req.user._id,
      landlord: prop.landlord,
      title,
      description: description || '',
      category: category || 'other',
      priority: priority || 'medium',
      images,
    });
    res.status(201).json(ticket);
  } catch (e) {
    next(e);
  }
});

router.get('/tenant/mine', authenticate, requireRole('tenant'), async (req, res, next) => {
  try {
    const list = await MaintenanceRequest.find({ tenant: req.user._id })
      .populate('property', 'title address')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/landlord/mine', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const list = await MaintenanceRequest.find({ landlord: req.user._id })
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/status', authenticate, requireRole('landlord', 'admin'), async (req, res, next) => {
  try {
    const { status, internalNotes } = req.body;
    const ticket = await MaintenanceRequest.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(ticket.landlord) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (status) ticket.status = status;
    if (internalNotes !== undefined) ticket.internalNotes = internalNotes;
    if (status === 'resolved' || status === 'closed') ticket.resolvedAt = new Date();
    await ticket.save();
    res.json(ticket);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authenticate, requireRole('tenant', 'admin'), async (req, res, next) => {
  try {
    const ticket = await MaintenanceRequest.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(ticket.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await ticket.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
