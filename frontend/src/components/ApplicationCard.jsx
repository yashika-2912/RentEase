import formatDate from '../utils/formatDate'

const ApplicationCard = ({ application, actions }) => (
  <article className="card">
    <div className="row-between">
      <div>
        <h3>{application.fullName || application.tenantId?.name}</h3>
        <p className="muted-line">{application.propertyId?.title || 'Application'}</p>
      </div>
      <span className={`status-pill ${application.status}`}>{application.status}</span>
    </div>
    <p>Occupation: {application.occupation}</p>
    <p>Income: Rs. {application.monthlyIncome}</p>
    <p>Phone: {application.phone}</p>
    {application.message && <p className="muted-line">{application.message}</p>}
    <p className="meta-text">Applied on {formatDate(application.appliedAt)}</p>
    {actions}
  </article>
)

export default ApplicationCard
