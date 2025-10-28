const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const redisClient = require('../config/redis');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
  try {
    // ✅ Читаем токен из httpOnly cookie (приоритет) или header (для мобилки)
    const token = req.cookies?.accessToken || 
                  (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access token required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка JWT токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Получение пользователя из базы данных
    const result = await pool.query(
      'SELECT id, username, role, first_name, last_name, avatar, phone, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const user = result.rows[0];

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

// ✅ ИСПРАВЛЕНО: Rate limiting для auth endpoints через Redis
const authRateLimit = async (req, res, next) => {
  try {
    const key = `auth_rl:${req.ip}:${req.path}`;
    const windowSeconds = 15 * 60; // 15 minutes in seconds
    const maxAttempts = 50;

    // Получаем текущее количество попыток из Redis
    const attempts = await redisClient.get(key);
    const currentAttempts = attempts ? parseInt(attempts) : 0;

    if (currentAttempts >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }

    // Используем setWithTTL для правильной работы с Redis
    await redisClient.setWithTTL(key, (currentAttempts + 1).toString(), windowSeconds);

    next();
  } catch (error) {
    console.error('Auth rate limit error:', error);
    // В случае ошибки Redis пропускаем запрос
    next();
  }
};

// Generate JWT token
const generateToken = (userId, username = null, expiresIn = '24h') => {
  const payload = { userId };
  if (username) {
    payload.username = username;
  }
  return jwt.sign(
    payload,
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
