import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts')

if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true })
}

export const generateReceipt = ({ rentPayment, tenantName, propertyTitle }) =>
  new Promise((resolve, reject) => {
    const filename = `receipt-${rentPayment._id}.pdf`
    const filePath = path.join(receiptsDir, filename)
    const doc = new PDFDocument({ margin: 50 })
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)
    doc.fontSize(22).text('Rent Payment Receipt', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12)
    doc.text(`Receipt ID: ${rentPayment._id}`)
    doc.text(`Tenant: ${tenantName}`)
    doc.text(`Property: ${propertyTitle}`)
    doc.text(`Amount: Rs. ${rentPayment.amount}`)
    doc.text(`Period: ${rentPayment.month}`)
    doc.text(`Status: ${rentPayment.status}`)
    doc.text(`Paid At: ${rentPayment.paidAt ? new Date(rentPayment.paidAt).toLocaleString() : 'N/A'}`)
    doc.text(`Verified At: ${rentPayment.verifiedAt ? new Date(rentPayment.verifiedAt).toLocaleString() : 'N/A'}`)
    doc.end()

    stream.on('finish', () => resolve(`/uploads/receipts/${filename}`))
    stream.on('error', reject)
  })
