import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiBell } from 'react-icons/fi'
import axiosInstance from '../api/axiosInstance'
import formatDate from '../utils/formatDate'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications')
      setNotifications(data)
    } catch (error) {
      setNotifications([])
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter((item) => !item.isRead).length

  const handleReadAll = async () => {
    try {
      await axiosInstance.put('/notifications/read-all')
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      toast.success('Notifications cleared')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update notifications')
    }
  }

  return (
    <div className="notification-wrapper">
      <button type="button" className="icon-button" onClick={() => setOpen((prev) => !prev)}>
        <FiBell />
        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-header">
            <strong>Notifications</strong>
            <button type="button" onClick={handleReadAll}>
              Mark all read
            </button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 && <p className="empty-state">No notifications yet.</p>}
            {notifications.map((item) => (
              <article key={item._id} className={`notification-item ${item.isRead ? 'read' : ''}`}>
                <p>{item.message}</p>
                <span>{formatDate(item.createdAt)}</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
