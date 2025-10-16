import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Send response with token
export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    data: {
      token,
      user: user.toPublicJSON ? user.toPublicJSON() : user,
    },
    error: null,
  });
};
