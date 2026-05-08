const express = require('express');
const Stripe = require('stripe');
const Payment = require('../models/Payment');
const Lease = require('../models/Lease');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

router.post('/create-intent', authenticate, requireRole('tenant'), async (req, res, next) => {
  try {
    const { leaseId, amount } = req.body;
    const lease = await Lease.findById(leaseId);
    if (!lease || String(lease.tenant) !== String(req.user._id)) {
      return res.status(400).json({ message: 'Invalid lease' });
    }
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ message: 'Stripe not configured' });
    }
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount || lease.monthlyRent) * 100),
      currency: process.env.STRIPE_CURRENCY || 'inr',
      metadata: { leaseId: String(lease._id), tenantId: String(req.user._id) },
    });
    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (e) {
    next(e);
  }
});

router.post('/confirm', authenticate, requireRole('tenant'), async (req, res, next) => {
  try {
    const { paymentIntentId, paymentRecordId } = req.body;
    const stripe = getStripe();
    if (stripe && paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status !== 'succeeded') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
    }
    if (paymentRecordId) {
      const p = await Payment.findById(paymentRecordId);
      if (!p || String(p.tenant) !== String(req.user._id)) {
        return res.status(400).json({ message: 'Invalid payment' });
      }
      p.status = 'paid';
      p.paidAt = new Date();
      if (paymentIntentId) p.stripePaymentIntentId = paymentIntentId;
      await p.save();
      return res.json(p);
    }
    res.json({ message: 'Nothing to update' });
  } catch (e) {
    next(e);
  }
});

router.get('/tenant/mine', authenticate, requireRole('tenant'), async (req, res, next) => {
  try {
    const list = await Payment.find({ tenant: req.user._id })
      .populate({ path: 'lease', populate: { path: 'property', select: 'title address' } })
      .sort({ year: -1, month: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/tenant/analytics', authenticate, requireRole('tenant'), async (req, res, next) => {
  try {
    const payments = await Payment.find({ tenant: req.user._id });
    const lease = await Lease.findOne({ tenant: req.user._id, status: 'active' });

    const totalPaid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalDue = payments.filter((p) => ['pending', 'overdue'].includes(p.status)).reduce((sum, p) => sum + p.amount, 0);
    const overdueCount = payments.filter((p) => p.status === 'overdue').length;
    const dueCount = payments.filter((p) => p.status === 'pending').length;

    const statusCounts = payments.reduce(
      (acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      },
      { paid: 0, pending: 0, overdue: 0, failed: 0 }
    );

    const months = [];
    const current = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
      months.push({ month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), paid: 0, overdue: 0 });
    }

    payments.forEach((payment) => {
      const idx = months.findIndex(
        (m) => m.month === new Date(payment.year, payment.month - 1).toLocaleString('default', { month: 'short' }) && m.year === payment.year
      );
      if (idx >= 0) {
        if (payment.status === 'paid') months[idx].paid += payment.amount;
        if (payment.status === 'overdue') months[idx].overdue += payment.amount;
      }
    });

    const leaseProgress = lease
      ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((Date.now() - lease.startDate.getTime()) / (lease.endDate.getTime() - lease.startDate.getTime())) * 100
          )
        )
      )
      : 0;

    res.json({
      rentDue: totalDue,
      totalPaid,
      onTimeRate: payments.length ? Math.round((statusCounts.paid / payments.length) * 100) : 100,
      leaseStatus: lease ? lease.status : 'pending',
      months: months.map((m) => ({ month: m.month, paid: m.paid, overdue: m.overdue })),
      statusCounts: [
        { status: 'Paid', count: statusCounts.paid },
        { status: 'Due', count: statusCounts.pending },
        { status: 'Overdue', count: statusCounts.overdue },
      ],
      leaseProgress: [
        { name: 'Completed', value: leaseProgress, color: '#22c55e' },
        { name: 'Remaining', value: 100 - leaseProgress, color: '#cbd5e1' },
      ],
      leaseInfo: {
        dueAmount: totalDue,
        nextPaymentDueInDays: Math.max(0, lease ? Math.ceil((new Date().setMonth(new Date().getMonth() + 1) - Date.now()) / 86400000) : 0),
        leaseEndsInMonths: lease ? Math.max(0, Math.round((lease.endDate.getTime() - Date.now()) / (30 * 86400000))) : 0,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/landlord/mine', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const list = await Payment.find({ landlord: req.user._id })
      .populate({ path: 'lease', populate: { path: 'property tenant', select: 'title address name email type' } })
      .sort({ year: -1, month: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get('/landlord/analytics', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const [payments, leases, properties] = await Promise.all([
      Payment.find({ landlord: req.user._id }).populate({ path: 'lease', populate: { path: 'property', select: 'type title' } }),
      Lease.find({ landlord: req.user._id, status: 'active' }).populate('property', 'type'),
      require('../models/Property').find({ landlord: req.user._id }),
    ]);

    const totalProperties = properties.length;
    const activeTenants = new Set(leases.map((lease) => String(lease.tenant))).size;
    const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;
    const paidPayments = payments.filter((p) => p.status === 'paid').length;
    const collectionRate = totalPayments ? Math.round((paidPayments / totalPayments) * 100) : 100;

    const rentDistribution = [];
    leases.forEach((lease) => {
      const amount = lease.monthlyRent || 0;
      const bucket =
        amount <= 10000
          ? '₹5-10k'
          : amount <= 20000
            ? '₹10-20k'
            : amount <= 35000
              ? '₹20-35k'
              : amount <= 50000
                ? '₹35-50k'
                : amount <= 80000
                  ? '₹50-80k'
                  : amount <= 100000
                    ? '₹80k-1L'
                    : '₹1L+';
      const bucketItem = rentDistribution.find((item) => item.bracket === bucket);
      if (bucketItem) bucketItem.tenants += 1;
      else rentDistribution.push({ bracket: bucket, tenants: 1 });
    });

    const typeMap = {};
    properties.forEach((property) => {
      const type = property.type || 'Other';
      if (!typeMap[type]) typeMap[type] = { available: 0, maintenance: 0, occupied: 0 };
      typeMap[type].available += 1;
    });
    leases.forEach((lease) => {
      const type = lease.property?.type || 'Other';
      if (!typeMap[type]) typeMap[type] = { available: 0, maintenance: 0, occupied: 0 };
      typeMap[type].occupied += 1;
    });
    const supplyDemand = Object.entries(typeMap).map(([type, counts]) => ({
      type,
      available: counts.available,
      maintenance: counts.maintenance,
      occupied: counts.occupied,
    }));

    const collectionRates = Object.values(
      payments.reduce((acc, payment) => {
        const type = payment.lease?.property?.type || 'Other';
        if (!acc[type]) acc[type] = { name: type, paid: 0, total: 0 };
        acc[type].total += 1;
        if (payment.status === 'paid') acc[type].paid += 1;
        return acc;
      }, {})
    ).map((item) => ({
      name: item.name,
      value: item.total ? Math.round((item.paid / item.total) * 100) : 0,
      color:
        item.name.toLowerCase().includes('1bhk')
          ? '#22c55e'
          : item.name.toLowerCase().includes('2bhk')
            ? '#38bdf8'
            : item.name.toLowerCase().includes('3bhk')
              ? '#f59e0b'
              : '#0ea5e9',
    }));

    const revenueTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${month.getFullYear()}-${month.getMonth() + 1}`;
      revenueTrend.push({ month: month.toLocaleString('default', { month: 'short' }), revenue: 0, signups: 0, key });
    }
    payments.forEach((payment) => {
      const monthLabel = new Date(payment.year, payment.month - 1).toLocaleString('default', { month: 'short' });
      const item = revenueTrend.find((entry) => entry.month === monthLabel);
      if (item && payment.status === 'paid') item.revenue += payment.amount;
    });

    res.json({
      totalProperties,
      activeTenants,
      totalRevenue,
      collectionRate,
      rentDistribution,
      supplyDemand,
      collectionRates,
      revenueTrend,
      keyMetrics: [
        { label: 'On-time rent collection', value: `${collectionRate}%`, color: '#22c55e' },
        { label: 'Active leases', value: String(leases.length), color: '#0ea5e9' },
        { label: 'Pending payments', value: String(payments.filter((p) => p.status !== 'paid').length), color: '#f59e0b' },
      ],
    });
  } catch (e) {
    next(e);
  }
});

router.put('/:id/manual-confirm', authenticate, requireRole('landlord'), async (req, res, next) => {
  try {
    const p = await Payment.findById(req.params.id);
    if (!p || String(p.landlord) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    p.status = 'paid';
    p.paidAt = new Date();
    await p.save();
    res.json(p);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
