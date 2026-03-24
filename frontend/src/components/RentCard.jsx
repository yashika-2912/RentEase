import formatDate from '../utils/formatDate'

const RentCard = ({ rent, action }) => (
  <article className="card">
    <div className="row-between">
      <div>
        <h3>{rent.propertyId?.title || rent.month}</h3>
        <p className="muted-line">{rent.month}</p>
      </div>
      <span className={`status-pill ${rent.status}`}>{rent.status}</span>
    </div>
    <p>Amount: Rs. {rent.amount}</p>
    <p>Due: {formatDate(rent.dueDate)}</p>
    <p>Paid At: {formatDate(rent.paidAt)}</p>
    {action}
  </article>
)

export default RentCard
