const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const PlatformSettings = require('../models/PlatformSettings');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendMail } = require('../services/email.service');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const [users, properties, leases, payments, maintenance] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Lease.countDocuments({ status: 'active' }),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      MaintenanceRequest.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
    ]);
    const pendingApprovals = await Property.countDocuments({ isApproved: false });
    res.json({
      totalUsers: users,
      totalProperties: properties,
      activeLeases: leases,
      monthlyRevenue: payments[0]?.total || 0,
      pendingApprovals,
      openMaintenance: maintenance,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const q = req.query.search ? new RegExp(req.query.search, 'i') : null;
    const role = req.query.role;
    const filter = {};
    if (q) filter.$or = [{ name: q }, { email: q }];
    if (role && role !== 'all') filter.role = role;
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit });
  } catch (e) {
    next(e);
  }
});

router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select(
      '-password -refreshToken'
    );
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot delete self' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

router.get('/properties', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.city) filter['address.city'] = new RegExp(req.query.city, 'i');
    if (req.query.type) filter.type = req.query.type;
    if (req.query.approval === 'pending') filter.isApproved = false;
    if (req.query.approval === 'approved') filter.isApproved = true;
    const list = await Property.find(filter).populate('landlord', 'name email').sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/leases', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const list = await Lease.find(filter)
      .populate('property')
      .populate('tenant', 'name email phone')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/payments', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const list = await Payment.find(filter)
      .populate('tenant', 'name email')
      .populate('landlord', 'name email')
      .populate({ path: 'lease', populate: { path: 'property', select: 'title address' } })
      .sort({ dueDate: -1, createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/maintenance', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const list = await MaintenanceRequest.find(filter)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('landlord', 'name email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.put('/properties/:id/approve', async (req, res, next) => {
  try {
    const { approved, rejectionReason } = req.body;
    const prop = await Property.findById(req.params.id).populate('landlord');
    if (!prop) return res.status(404).json({ message: 'Not found' });
    prop.isApproved = !!approved;
    prop.rejectionReason = approved ? '' : rejectionReason || '';
    await prop.save();
    if (!approved && prop.landlord?.email) {
      await sendMail({
        to: prop.landlord.email,
        subject: 'Property listing update',
        text: `Your property "${prop.title}" was not approved. ${prop.rejectionReason || ''}`,
      });
    }
    res.json(prop);
  } catch (e) {
    next(e);
  }
});

router.delete('/properties/:id', async (req, res, next) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

router.get('/reports', async (req, res, next) => {
  try {
    const totalProps = await Property.countDocuments({ isApproved: true });
    const occupied = await Lease.countDocuments({ status: 'active' });
    const avg = await Property.aggregate([{ $match: { isApproved: true } }, { $group: { _id: null, avg: { $avg: '$rent' } } }]);
    const paid = await Payment.countDocuments({ status: 'paid' });
    const due = await Payment.countDocuments({ status: { $in: ['pending', 'overdue'] } });
    res.json({
      occupancyRate: totalProps ? Math.min(100, Math.round((occupied / totalProps) * 100)) : 0,
      avgRent: Math.round(avg[0]?.avg || 0),
      collectionRate: paid + due ? Math.round((paid / (paid + due)) * 100) : 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/settings', async (req, res, next) => {
  try {
    let s = await PlatformSettings.findOne();
    if (!s) s = await PlatformSettings.create({});
    res.json(s);
  } catch (e) {
    next(e);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    let s = await PlatformSettings.findOne();
    if (!s) s = new PlatformSettings();
    Object.assign(s, req.body);
    await s.save();
    res.json(s);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
