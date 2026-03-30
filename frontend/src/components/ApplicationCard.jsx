import formatDate from '../utils/formatDate'
import { FiBriefcase, FiCalendar, FiPhone, FiTrendingUp } from 'react-icons/fi'

const ApplicationCard = ({ application, actions }) => (
  <article className="card">
    <div className="row-between">
      <div>
        <h3>{application.fullName || application.tenantId?.name}</h3>
        <p className="muted-line">{application.propertyId?.title || 'Application'}</p>
      </div>
      <span className={`status-pill ${application.status}`}>{application.status}</span>
    </div>
    <div className="detail-stack">
      <p className="icon-line"><FiBriefcase /> Occupation: {application.occupation}</p>
      <p className="icon-line"><FiTrendingUp /> Income: Rs. {application.monthlyIncome}</p>
      <p className="icon-line"><FiPhone /> Phone: {application.phone}</p>
    </div>
    {application.message && <p className="muted-line">{application.message}</p>}
    <p className="meta-text icon-line"><FiCalendar /> Applied on {formatDate(application.appliedAt)}</p>
    {actions}
  </article>
)

export default ApplicationCard
