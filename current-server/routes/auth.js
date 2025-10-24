const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authRateLimit 
} = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/register - User registration
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { phone, username, password, firstName, lastName, role = 'user' } = req.body;

    // Validation
    if (!phone || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone, username, and password are required',
        timestamp: new Date().toISOString()
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone = $1 OR username = $2',
      [phone, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone or username already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(`
      INSERT INTO users (phone, username, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, phone, username, first_name, last_name, role, created_at
    `, [phone, username, passwordHash, firstName, lastName, role]);

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          createdAt: user.created_at
        },
        accessToken,
        refreshToken
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user from database by phone
    const result = await pool.query(
      'SELECT id, email, username, password_hash, first_name, last_name, phone, role, is_active, is_verified FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isVerified: user.is_verified
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        timestamp: new Date().toISOString()
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const tokenResult = await pool.query(
      'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString()
      });
    }

    // Get user info
    const userResult = await pool.query(
      'SELECT id, email, username, first_name, last_name, role, is_active, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        timestamp: new Date().toISOString()
      });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newAccessToken = generateToken(user.id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isVerified: user.is_verified
        }
      },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Получаем пользователя из БД
      const result = await pool.query(
        'SELECT id, email, username, first_name, last_name, phone, avatar, role, is_active, is_verified, created_at FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      const user = result.rows[0];

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          isActive: user.is_active,
          isVerified: user.is_verified,
          createdAt: user.created_at
        },
        message: 'User retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const { firstName, lastName, phone, avatar } = req.body;

      // Формируем запрос на обновление только тех полей, которые переданы
      const updates = [];
      const values = [];
      let paramCount = 0;

      if (firstName !== undefined) {
        updates.push(`first_name = $${++paramCount}`);
        values.push(firstName);
      }
      if (lastName !== undefined) {
        updates.push(`last_name = $${++paramCount}`);
        values.push(lastName);
      }
      if (phone !== undefined) {
        updates.push(`phone = $${++paramCount}`);
        values.push(phone);
      }
      if (avatar !== undefined) {
        updates.push(`avatar = $${++paramCount}`);
        values.push(avatar);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
          timestamp: new Date().toISOString()
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(decoded.userId);

      const result = await pool.query(`
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${++paramCount} AND is_active = true
        RETURNING id, email, username, first_name, last_name, phone, avatar, role, is_verified, created_at, updated_at
      `, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      const user = result.rows[0];

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.is_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      await pool.query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );
    }

    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/verify-email - Verify email (stub for MVP)
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    // For MVP, just mark as verified
    const result = await pool.query(
      'UPDATE users SET is_verified = true WHERE email = $1 RETURNING id',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/send-sms-code - Send SMS verification code for registration
router.post('/send-sms-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
        timestamp: new Date().toISOString()
      });
    }

    // Import SMS service
    const smsService = require('../services/smsService');
    
    // Generate SMS code
    const code = smsService.generateCode();
    
    // Send SMS code
    const result = await smsService.sendVerificationCode(phone, code);

    res.json({
      success: true,
      message: 'SMS code sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send SMS code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS code',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/verify-sms - Verify SMS code
router.post('/verify-sms', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and code are required',
        timestamp: new Date().toISOString()
      });
    }

    // Import SMS service
    const smsService = require('../services/smsService');
    
    // Verify SMS code
    const result = await smsService.verifyCode(phone, code);

    if (result.success) {
      res.json({
        success: true,
        message: 'SMS code verified successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Invalid or expired SMS code',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Verify SMS code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify SMS code',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/forgot-password - Forgot password (stub for MVP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // For MVP, just return success
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/reset-password - Reset password (stub for MVP)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        timestamp: new Date().toISOString()
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
      [passwordHash, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;


