const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 [AUTH] Incoming request:', req.method, req.originalUrl);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 [AUTH] Token present:', !!token);

    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access token required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка JWT токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('🔐 [AUTH] Token decoded:', decoded);
    
    // Handle nested userId structure
    const userId = decoded.userId?.userId || decoded.userId || decoded.id;
    console.log('🔐 [AUTH] Extracted userId:', userId);
    
    // Получение пользователя из базы данных
    const result = await pool.query(
      'SELECT id, username, role, first_name, last_name, avatar, phone, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('❌ [AUTH] User not found in database for userId:', userId);
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const user = result.rows[0];
    console.log('✅ [AUTH] User found:', user.id, user.username, user.role);

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User account is deactivated',
        timestamp: new Date().toISOString()
      });
    }

    req.user = {
      id: user.id,
      userId: user.id,
      username: user.username,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      phone: user.phone
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Token expired',
        timestamp: new Date().toISOString()
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Authentication error',
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware для проверки роли
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Middleware для проверки владельца ресурса
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    if (req.user.userId !== resourceId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Middleware для опциональной аутентификации
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const result = await pool.query(
      'SELECT id, username, role, first_name, last_name, avatar, phone, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      const user = result.rows[0];
      req.user = {
        id: user.id,
        userId: user.id,
        username: user.username,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        phone: user.phone
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Rate limiting for auth endpoints
const authRateLimit = (req, res, next) => {
  const key = req.ip + ':' + req.path;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50;

  if (!req.rateLimit) {
    req.rateLimit = {};
  }

  if (!req.rateLimit[key]) {
    req.rateLimit[key] = { attempts: 0, resetTime: now + windowMs };
  }

  if (now > req.rateLimit[key].resetTime) {
    req.rateLimit[key] = { attempts: 0, resetTime: now + windowMs };
  }

  if (req.rateLimit[key].attempts >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }

  req.rateLimit[key].attempts++;
  next();
};

// Generate JWT token
const generateToken = (userId, expiresIn = '24h') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
  optionalAuth,
  authRateLimit,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};
