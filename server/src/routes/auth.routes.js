const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['tenant', 'landlord']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, phone, role } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Email already registered' });

      const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        role: role === 'landlord' ? 'landlord' : 'tenant',
      });

      const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
      const refreshToken = signRefreshToken({ sub: user._id.toString() });
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      if (user.isActive === false) {
        return res.status(403).json({ message: 'Account deactivated' });
      }

      const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
      const refreshToken = signRefreshToken({ sub: user._id.toString() });
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    res.json({ message: 'Logged out' });
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    res.json({ accessToken });
  } catch (e) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
