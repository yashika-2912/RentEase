import jwt from 'jsonwebtoken'

const generateToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )

export default generateToken
