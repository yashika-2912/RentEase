const cron = require('node-cron');
const Payment = require('../models/Payment');
const Lease = require('../models/Lease');
const { sendMail } = require('../services/email.service');

function startCronJobs() {
  // 1st of month: placeholder for generating payment records
  cron.schedule('0 0 1 * *', async () => {
    console.log('[cron] Monthly payment generation job (stub)');
    try {
      const active = await Lease.find({ status: 'active' });
      console.log(`[cron] Active leases: ${active.length}`);
    } catch (e) {
      console.error(e);
    }
  });

  // Daily: flag overdue
  cron.schedule('0 8 * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const res = await Payment.updateMany(
      { status: 'pending', dueDate: { $lt: today } },
      { $set: { status: 'overdue' } }
    );
    console.log('[cron] Overdue payments updated:', res.modifiedCount);
  });

  // Example reminder stub (would query leases/payments)
  cron.schedule('0 9 * * *', async () => {
    console.log('[cron] Daily rent reminder check (stub)');
  });

  console.log('Cron jobs scheduled');
}

module.exports = { startCronJobs };
