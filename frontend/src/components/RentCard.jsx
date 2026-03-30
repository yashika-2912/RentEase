import formatDate from '../utils/formatDate'
import { FiCalendar, FiCheckCircle, FiCreditCard } from 'react-icons/fi'

const RentCard = ({ rent, action }) => (
  <article className="card">
    <div className="row-between">
      <div>
        <h3>{rent.propertyId?.title || rent.month}</h3>
        <p className="muted-line">{rent.month}</p>
      </div>
      <span className={`status-pill ${rent.status}`}>{rent.status}</span>
    </div>
    <div className="detail-stack">
      <p className="icon-line"><FiCreditCard /> Amount: Rs. {rent.amount}</p>
      <p className="icon-line"><FiCalendar /> Due: {formatDate(rent.dueDate)}</p>
      <p className="icon-line"><FiCheckCircle /> Paid At: {formatDate(rent.paidAt)}</p>
    </div>
    {action}
  </article>
)

export default RentCard
