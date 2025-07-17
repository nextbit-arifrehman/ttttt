// middlewares/verifyJWT.js
const { auth } = require('../utils/firebaseAdmin');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: No token provided',
      code: 'UNAUTHORIZED_NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    // Add user info to request with backend unique identifier
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email?.split('@')[0],
      photoURL: decodedToken.picture,
      backendId: `user_${decodedToken.uid}` // Unique backend identifier
    };
    
    next();
  } catch (error) {
    console.error('Login error:', error);
    return res.status(403).json({
        error: 'Forbidden: Invalid or expired token',
        code: 'FORBIDDEN_INVALID_TOKEN',
    });
  }
};

module.exports = verifyJWT;