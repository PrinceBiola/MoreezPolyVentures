import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.toLowerCase().startsWith('bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        console.error('⚠️ Auth failure: Bearer token format invalid');
        return res.status(401).json({ message: 'Not authorized, token missing from header' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_polyventure_key');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.error('⚠️ Auth failure: User not found for ID', decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if user changed password after the token was issued
      if (req.user.changedPasswordAfter && req.user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({ message: 'User recently changed password! Please log in again.' });
      }

      return next();
    } catch (error) {
      console.error('⚠️ JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('⚠️ Auth failure: No Authorization header provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;
