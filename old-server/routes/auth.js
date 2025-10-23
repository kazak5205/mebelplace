const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authRateLimit,
  authenticateToken
} = require('../middleware/auth');
const smsService = require('../services/smsService');
const router = express.Router();

// POST /api/auth/register - User registration via phone
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { phone, username, password, firstName, lastName, role = 'user' } = req.body;

    // Validation
    if (!phone || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone, username and password are required',
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

    // Generate SMS code
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    const smsCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const result = await pool.query(`
      INSERT INTO users (username, password_hash, first_name, last_name, role, phone, sms_code, sms_code_expiry, is_verified, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW())
      RETURNING id, username, first_name, last_name, role, phone, is_verified, created_at
    `, [username, passwordHash, firstName, lastName, role, phone, smsCode, smsCodeExpiry]);

    const user = result.rows[0];

    // Send SMS code
    try {
      await smsService.sendVerificationCode(phone, smsCode);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Continue anyway - user can still verify manually
    }

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
        }
      },
      message: 'User registered successfully. Please verify your phone with SMS code.',
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

// POST /api/auth/login - User login via phone + password (with optional SMS for unverified users)
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { phone, password, smsCode } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user from database
    const result = await pool.query(
      'SELECT id, username, password_hash, first_name, last_name, role, is_active, is_verified, phone, email, avatar, sms_code, sms_code_expiry FROM users WHERE phone = $1',
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

    // Verify password first
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user is already verified
    if (user.is_verified) {
      // User is verified - login without SMS
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token in database
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: `${user.first_name} ${user.last_name}`,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            isVerified: true
          },
          accessToken,
          refreshToken
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
      });
    }

    // User is NOT verified - require SMS code
    if (!smsCode) {
      // SMS code not provided - send SMS and ask for it
      const newSmsCode = Math.floor(100000 + Math.random() * 900000).toString();
      const smsCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save SMS code to user
      await pool.query(
        'UPDATE users SET sms_code = $1, sms_code_expiry = $2 WHERE id = $3',
        [newSmsCode, smsCodeExpiry, user.id]
      );

      // Send SMS
      try {
        await smsService.sendVerificationCode(phone, newSmsCode);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
      }

      return res.status(403).json({
        success: false,
        requiresSms: true,
        message: 'SMS verification required. Code sent to your phone.',
        timestamp: new Date().toISOString()
      });
    }

    // SMS code provided - verify it
    if (user.sms_code !== smsCode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid SMS code',
        timestamp: new Date().toISOString()
      });
    }

    // Check if SMS code is expired
    if (new Date() > new Date(user.sms_code_expiry)) {
      return res.status(401).json({
        success: false,
        message: 'SMS code expired',
        timestamp: new Date().toISOString()
      });
    }

    // Mark user as verified and clear SMS code
    await pool.query(
      'UPDATE users SET is_verified = true, sms_code = NULL, sms_code_expiry = NULL WHERE id = $1',
      [user.id]
    );

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
          email: user.email,
          username: user.username,
          name: `${user.first_name} ${user.last_name}`,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          isVerified: true
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

// POST /api/auth/simple-login - Simple login (without SMS) for development/testing
router.post('/simple-login', authRateLimit, async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user from database
    const result = await pool.query(
      'SELECT id, username, password_hash, first_name, last_name, role, email, phone, avatar, is_active, is_verified FROM users WHERE phone = $1',
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

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.first_name + ' ' + user.last_name,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          isVerified: user.is_verified
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simple login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/send-sms - Send SMS code for login
router.post('/send-sms', authRateLimit, async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user from database
    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE phone = $1',
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

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Generate new SMS code
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    const smsCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new SMS code
    await pool.query(
      'UPDATE users SET sms_code = $1, sms_code_expiry = $2 WHERE id = $3',
      [smsCode, smsCodeExpiry, user.id]
    );

    // Send SMS code
    try {
      await smsService.sendVerificationCode(phone, smsCode);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send SMS code',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'SMS code sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS code',
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

// POST /api/auth/forgot-password - Request password reset via SMS
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User with this phone number not found',
        timestamp: new Date().toISOString()
      });
    }

    // Generate SMS code
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    const smsCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save SMS code to user
    await pool.query(
      'UPDATE users SET sms_code = $1, sms_code_expiry = $2 WHERE phone = $3',
      [smsCode, smsCodeExpiry, phone]
    );

    // Send SMS
    try {
      await smsService.sendVerificationCode(phone, smsCode);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Continue anyway - user can still verify manually
    }

    res.json({
      success: true,
      message: 'SMS code sent to your phone',
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

// POST /api/auth/reset-password - Reset password with SMS code
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, smsCode, newPassword } = req.body;

    if (!phone || !smsCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Phone, SMS code and new password are required',
        timestamp: new Date().toISOString()
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        timestamp: new Date().toISOString()
      });
    }

    // Verify SMS code
    const userResult = await pool.query(
      'SELECT id, sms_code, sms_code_expiry FROM users WHERE phone = $1',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const user = userResult.rows[0];

    // Check if SMS code is valid
    if (user.sms_code !== smsCode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid SMS code',
        timestamp: new Date().toISOString()
      });
    }

    // Check if SMS code is expired
    if (new Date() > new Date(user.sms_code_expiry)) {
      return res.status(401).json({
        success: false,
        message: 'SMS code expired',
        timestamp: new Date().toISOString()
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear SMS code
    await pool.query(
      'UPDATE users SET password_hash = $1, sms_code = NULL, sms_code_expiry = NULL WHERE phone = $2',
      [passwordHash, phone]
    );

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

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userResult = await pool.query(
      'SELECT id, email, username, role, first_name, last_name, avatar, phone, is_verified, is_online, last_seen, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const user = userResult.rows[0];
    
    // Get subscribers count if user is master
    let subscribersCount = 0;
    if (user.role === 'master' || user.role === 'admin') {
      const subscribersResult = await pool.query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE channel_id = $1',
        [userId]
      );
      subscribersCount = parseInt(subscribersResult.rows[0].count) || 0;
    }
    
    res.json({
      success: true,
      data: {
        ...user,
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.username || 'User'),
        isOnline: user.is_online || false,
        lastSeen: user.last_seen,
        isActive: user.is_active !== false,
        subscribersCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/send-sms - Send SMS verification code
router.post('/send-sms', authRateLimit, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
        timestamp: new Date().toISOString()
      });
    }

    const code = smsService.generateCode();
    await smsService.sendVerificationCode(phone, code);

    res.json({
      success: true,
      message: 'SMS code sent',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/verify-sms - Verify SMS code
router.post('/verify-sms', authRateLimit, async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone and code are required',
        timestamp: new Date().toISOString()
      });
    }

    // Verify SMS code from users table
    const result = await pool.query(
      'SELECT id, sms_code, sms_code_expiry FROM users WHERE phone = $1 AND sms_code = $2 AND sms_code_expiry > NOW()',
      [phone, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired SMS code',
        timestamp: new Date().toISOString()
      });
    }

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = true WHERE phone = $1',
      [phone]
    );

    res.json({
      success: true,
      verified: true,
      message: 'Phone verified',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify SMS',
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/auth/me - Update current user profile
router.patch('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      specialties,
      location,
      companyDescription,
      slogan
    } = req.body;

    // Build dynamic UPDATE query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`username = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (specialties !== undefined) {
      updates.push(`specialties = $${paramCount}`);
      values.push(JSON.stringify(specialties));
      paramCount++;
    }

    if (location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(JSON.stringify(location));
      paramCount++;
    }

    if (companyDescription !== undefined) {
      updates.push(`company_description = $${paramCount}`);
      values.push(companyDescription);
      paramCount++;
    }

    if (slogan !== undefined) {
      updates.push(`slogan = $${paramCount}`);
      values.push(slogan);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        timestamp: new Date().toISOString()
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, username, role, first_name, last_name, avatar, phone, specialties, location, company_description, slogan, is_verified, created_at, updated_at
    `;

    const result = await pool.query(query, values);

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
        name: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        specialties: typeof user.specialties === 'string' ? JSON.parse(user.specialties) : user.specialties,
        location: typeof user.location === 'string' ? JSON.parse(user.location) : user.location,
        companyDescription: user.company_description,
        slogan: user.slogan,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/avatar - Upload avatar
const { imageUpload } = require('../middleware/upload');
router.post('/avatar', authenticateToken, imageUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided',
        timestamp: new Date().toISOString()
      });
    }

    const userId = req.user.id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar in database
    const result = await pool.query(
      'UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING avatar',
      [avatarPath, userId]
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
      data: {
        avatar: avatarPath
      },
      message: 'Avatar uploaded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

