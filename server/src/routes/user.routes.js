const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { upload } = require('../middleware/upload');
const { initCloudinary, cloudinary } = require('../config/cloudinary');

const router = express.Router();

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.put(
  '/profile',
  authenticate,
  [body('name').optional().trim(), body('phone').optional().trim()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, phone } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
      res.json(user);
    } catch (e) {
      next(e);
    }
  }
);

router.put('/preferences', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants have match preferences' });
    }
    const prefs = req.body || {};
    const user = await User.findById(req.user._id);
    user.preferences = { ...user.preferences?.toObject?.(), ...prefs };
    await user.save();
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.post('/avatar', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    initCloudinary();
    if (!req.file) return res.status(400).json({ message: 'No file' });
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(503).json({ message: 'Cloudinary not configured' });
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, { folder: 'rentease/avatars' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploaded.secure_url },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.get('/saved-properties', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedProperties',
      populate: { path: 'landlord', select: 'name email phone' }
    });
    res.json(user.savedProperties || []);
  } catch (e) {
    next(e);
  }
});

router.post('/saved-properties/:propertyId', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;

    if (!user.savedProperties) user.savedProperties = [];

    const isSaved = user.savedProperties.some(id => String(id) === String(propertyId));

    if (isSaved) {
      user.savedProperties = user.savedProperties.filter(id => String(id) !== String(propertyId));
    } else {
      user.savedProperties.push(propertyId);
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate({
      path: 'savedProperties',
      populate: { path: 'landlord', select: 'name email phone' }
    });

    res.json({
      message: isSaved ? 'Property removed from saved' : 'Property saved',
      isSaved: !isSaved,
      savedProperties: updatedUser.savedProperties || []
    });
  } catch (e) {
    next(e);
  }
});

router.get('/saved-properties/:propertyId/check', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;
    const isSaved = user.savedProperties?.some(id => String(id) === String(propertyId)) || false;
    res.json({ isSaved });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
