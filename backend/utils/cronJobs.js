import cron from 'node-cron'
import RentPayment from '../models/RentPayment.js'
import Notification from '../models/Notification.js'

const startCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    const overdueRents = await RentPayment.find({
      dueDate: { $lt: new Date() },
      status: 'pending',
    })

    for (const rent of overdueRents) {
      rent.status = 'overdue'
      await rent.save()

      const existingNotice = await Notification.findOne({
        userId: rent.tenantId,
        type: 'rent',
        message: `Your rent for ${rent.month} is overdue.`,
      })

      if (!existingNotice) {
        await Notification.create({
          userId: rent.tenantId,
          message: `Your rent for ${rent.month} is overdue.`,
          type: 'rent',
        })
      }
    }
  })
}

export default startCronJobs
