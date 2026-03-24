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
