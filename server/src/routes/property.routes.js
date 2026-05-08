const express = require('express');
const { body, validationResult } = require('express-validator');
const Property = require('../models/Property');
const { authenticate, requireRole } = require('../middleware/auth');
const { sortByMatchScore } = require('../services/smartMatch.service');
const User = require('../models/User');
const { upload } = require('../middleware/upload');
const { initCloudinary, cloudinary } = require('../config/cloudinary');

const router = express.Router();

function buildPropertyFilter(query) {
  const filter = {};
  if (query.city) filter['address.city'] = new RegExp(query.city, 'i');
  if (query.type) filter.type = query.type;
  if (query.bedrooms) filter.bedrooms = Number(query.bedrooms);
  if (query.furnished !== undefined) filter.furnished = query.furnished === 'true';
  if (query.minRent) filter.rent = { ...filter.rent, $gte: Number(query.minRent) };
  if (query.maxRent) filter.rent = { ...filter.rent, $lte: Number(query.maxRent) };
  if (query.amenities) {
    const list = String(query.amenities).split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length) filter.amenities = { $all: list };
  }
  if (query.availableFrom) {
    filter.availableFrom = { $lte: new Date(query.availableFrom) };
  }
  return filter;
}

// Landlord's properties — must be before /:id
router.get('/landlord/mine', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const list = await Property.find({ landlord: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get(
  '/smart-match',
  authenticate,
  requireRole('tenant'),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const base = {
        isApproved: true,
        isAvailable: true,
        ...buildPropertyFilter(req.query),
      };
      const props = await Property.find(base).populate('landlord', 'name email phone');
      const scored = sortByMatchScore(props, user.preferences);
      res.json(scored);
    } catch (e) {
      next(e);
    }
  }
);

router.get('/', async (req, res, next) => {
  try {
    const sort = req.query.sort || 'newest';
    const filter = {
      isApproved: true,
      isAvailable: true,
      ...buildPropertyFilter(req.query),
    };
    let q = Property.find(filter).populate('landlord', 'name email phone');
    if (sort === 'price_asc') q = q.sort({ rent: 1 });
    else if (sort === 'price_desc') q = q.sort({ rent: -1 });
    else q = q.sort({ createdAt: -1 });
    const list = await q.exec();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Property.findById(req.params.id).populate('landlord', 'name email phone');
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authenticate,
  requireRole('landlord'),
  upload.array('images', 10),
  async (req, res, next) => {
    try {
      initCloudinary();
      const body = req.body;
      let address = { street: '', city: '', state: '', pincode: '', coordinates: { lat: 19.076, lng: 72.8777 } };
      if (body.address) {
        if (typeof body.address === 'string') {
          try {
            address = JSON.parse(body.address);
          } catch {
            address = { street: body.address };
          }
        } else {
          address = body.address;
        }
      }
      let images = [];
      if (Array.isArray(body.images)) {
        images = body.images;
      } else if (typeof body.images === 'string') {
        try {
          images = JSON.parse(body.images);
        } catch {
          images = [];
        }
      }
      if (req.files?.length && process.env.CLOUDINARY_CLOUD_NAME) {
        for (const file of req.files) {
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataUri = `data:${file.mimetype};base64,${b64}`;
          // eslint-disable-next-line no-await-in-loop
          const up = await cloudinary.uploader.upload(dataUri, { folder: 'rentease/properties' });
          images.push(up.secure_url);
        }
      }

      const property = await Property.create({
        landlord: req.user._id,
        title: body.title,
        description: body.description || '',
        type: body.type || 'apartment',
        rent: Number(body.rent),
        deposit: Number(body.deposit || 0),
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : undefined,
        address,
        bedrooms: Number(body.bedrooms || 1),
        bathrooms: Number(body.bathrooms || 1),
        area: Number(body.area || 0),
        amenities: (() => {
          if (!body.amenities) return [];
          if (Array.isArray(body.amenities)) return body.amenities;
          if (typeof body.amenities === 'string') {
            try {
              return JSON.parse(body.amenities);
            } catch {
              return body.amenities.split(',').map((s) => s.trim()).filter(Boolean);
            }
          }
          return [];
        })(),
        furnished: body.furnished === true || body.furnished === 'true',
        images,
        isAvailable: body.isAvailable !== 'false',
        isApproved: false,
      });
      res.status(201).json(property);
    } catch (e) {
      next(e);
    }
  }
);

router.put('/:id', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop || String(prop.landlord) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    Object.assign(prop, req.body);
    if (req.body.address && typeof req.body.address === 'object') {
      prop.address = { ...prop.address.toObject?.(), ...req.body.address };
    }
    await prop.save();
    res.json(prop);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop || String(prop.landlord) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    await prop.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
