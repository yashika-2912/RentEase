export const isTenant = (req, res, next) => {
  if (req.user?.role !== 'tenant') {
    return res.status(403).json({ message: 'Tenant access only' })
  }

  next()
}

export const isLandlord = (req, res, next) => {
  if (req.user?.role !== 'landlord') {
    return res.status(403).json({ message: 'Landlord access only' })
  }

  next()
}

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' })
  }

  next()
}
