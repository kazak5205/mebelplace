const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { 
  authenticateToken,
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authRateLimit 
} = require('../middleware/auth');
const smsService = require('../services/smsService');
const { avatarUpload, imageUpload, handleUploadError } = require('../middleware/upload');
const redisClient = require('../config/redis');
const router = express.Router();

// SMS коды теперь хранятся в Redis для масштабируемости
// const smsVerificationCodes = new Map(); // Старый подход

// POST /api/auth/register - User registration
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { 
      phone, username, password, 
      firstName, lastName, // для клиентов (role='user')
      companyName, companyAddress, companyDescription, companyType, // для мастеров (role='master')
      role = 'user' 
    } = req.body;

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

    // Дополнительная валидация для мастеров
    if (role === 'master' && !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required for masters',
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
    let result;
    if (role === 'master') {
      // Регистрация мастера с данными компании
      const finalCompanyType = companyType || 'master'; // Default: 'master'
      result = await pool.query(`
        INSERT INTO users (phone, username, password_hash, company_name, company_address, company_description, company_type, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, phone, username, company_name, company_address, company_description, company_type, role, created_at
      `, [phone, username, passwordHash, companyName, companyAddress, companyDescription, finalCompanyType, role]);
    } else {
      // Регистрация клиента с именем/фамилией
      result = await pool.query(`
        INSERT INTO users (phone, username, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, phone, username, first_name, last_name, role, created_at
      `, [phone, username, passwordHash, firstName, lastName, role]);
    }

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    // Формируем ответ в зависимости от роли
    const userData = {
      id: user.id,
      phone: user.phone,
      username: user.username,
      role: user.role,
      createdAt: user.created_at
    };

    if (role === 'master') {
      userData.companyName = user.company_name;
      userData.companyAddress = user.company_address;
      userData.companyDescription = user.company_description;
      userData.companyType = user.company_type; // Тип компании: master/company/shop
    } else {
      userData.firstName = user.first_name;
      userData.lastName = user.last_name;
    }

    // ✅ Определяем тип клиента (мобильный или веб)
    const userAgent = req.headers['user-agent'] || '';
    const isMobileClient = userAgent.includes('Dart') || 
                          req.headers['x-client-type'] === 'mobile';
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.secure;
    
    console.log('🔍 [REGISTER] User-Agent:', userAgent);
    console.log('🔍 [REGISTER] isMobileClient:', isMobileClient);
    console.log('🔍 [REGISTER] Will return tokens in:', isMobileClient ? 'JSON' : 'Cookies');
    
    // Для веб-клиента токены в httpOnly cookies (безопасно от XSS)
    if (!isMobileClient) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 минут
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
      });
    }

    // Для мобильного клиента токены в JSON
    const responseData = {
      user: userData
    };
    
    if (isMobileClient) {
      responseData.accessToken = accessToken;
      responseData.refreshToken = refreshToken;
    }

    res.status(201).json({
      success: true,
      data: responseData,
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
    let { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Normalize phone: 87XXXXXXXXX -> +77XXXXXXXXX
    if (phone.startsWith('8')) {
      phone = '+7' + phone.substring(1);
    }
    // Ensure phone starts with +
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    // Get user from database by phone
    const result = await pool.query(
      'SELECT id, email, username, password_hash, first_name, last_name, phone, role, company_name, company_address, company_description, company_type, avatar, is_active, is_verified FROM users WHERE phone = $1',
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
    const accessToken = generateToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    // ✅ Определяем тип клиента (мобильный или веб)
    const isMobileClient = req.headers['user-agent']?.includes('Dart') || 
                          req.headers['x-client-type'] === 'mobile';
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.secure;
    
    // Для веб-клиента токены в httpOnly cookies (безопасно от XSS)
    if (!isMobileClient) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }

    const userData = {
      id: user.id,
      phone: user.phone,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.is_verified
    };

    // Добавляем данные компании для мастеров
    if (user.role === 'master') {
      userData.companyName = user.company_name;
      userData.companyAddress = user.company_address;
      userData.companyDescription = user.company_description;
      userData.companyType = user.company_type || 'master';
    }

    // Для мобильного клиента токены в JSON
    const responseData = { user: userData };
    
    if (isMobileClient) {
      responseData.accessToken = accessToken;
      responseData.refreshToken = refreshToken;
    }

    res.json({
      success: true,
      data: responseData,
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
    // ✅ Читаем refreshToken из cookie
    const refreshToken = req.cookies?.refreshToken;

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
    const newAccessToken = generateToken(user.id, user.username);

    // ✅ Токен в httpOnly cookie
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.secure;
    
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isSecure, // ✅ HTTPS only в production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
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
    // ✅ Получаем токен из cookie (приоритет) или header (для мобилки)
    const token = req.cookies?.accessToken || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        timestamp: new Date().toISOString()
      });
    }
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Получаем пользователя из БД с полями компании
      const result = await pool.query(
        `SELECT id, email, username, first_name, last_name, phone, avatar, role, is_active, is_verified, 
         company_name, company_address, company_description, created_at 
         FROM users WHERE id = $1 AND is_active = true`,
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

      // Формируем ответ в зависимости от роли
      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isActive: user.is_active,
        isVerified: user.is_verified,
        createdAt: user.created_at
      };

      // Добавляем поля в зависимости от роли
      if (user.role === 'master') {
        userData.companyName = user.company_name;
        userData.companyAddress = user.company_address;
        userData.companyDescription = user.company_description;
      } else {
        userData.firstName = user.first_name;
        userData.lastName = user.last_name;
      }

      res.json({
        success: true,
        data: userData,
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
router.put('/profile', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
  console.log('🔵 Profile update request received');
  console.log('📁 File:', req.file ? req.file.filename : 'No file');
  console.log('📝 Body:', req.body);
  console.log('👤 User from auth:', req.user);
  
  try {
    // ✅ req.user уже доступен из authenticateToken middleware
    const userId = req.user.id;
    const { firstName, lastName, phone, bio, companyName, companyAddress, companyDescription, companyType } = req.body;
      
      // Формируем запрос на обновление только тех полей, которые переданы
      const updates = [];
      const values = [];
      let paramCount = 0;

      if (firstName !== undefined && firstName !== '') {
        updates.push(`first_name = $${++paramCount}`);
        values.push(firstName);
      }
      if (lastName !== undefined && lastName !== '') {
        updates.push(`last_name = $${++paramCount}`);
        values.push(lastName);
      }
    if (phone !== undefined && phone !== '') {
      updates.push(`phone = $${++paramCount}`);
      values.push(phone);
    }
    
    // Поля для мастеров
    if (bio !== undefined) {
      updates.push(`bio = $${++paramCount}`);
      values.push(bio);
    }
    if (companyName !== undefined) {
      updates.push(`company_name = $${++paramCount}`);
      values.push(companyName);
    }
    if (companyAddress !== undefined) {
      updates.push(`company_address = $${++paramCount}`);
      values.push(companyAddress);
    }
    if (companyDescription !== undefined) {
      updates.push(`company_description = $${++paramCount}`);
      values.push(companyDescription);
    }
    if (companyType !== undefined) {
      updates.push(`company_type = $${++paramCount}`);
      values.push(companyType);
    }
    
    // Если загружен файл аватара, добавляем его в обновление
    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      console.log('✅ Avatar file uploaded:', avatarUrl);
      updates.push(`avatar = $${++paramCount}`);
      values.push(avatarUrl);
    }
    
    console.log('📋 Updates to apply:', updates.length, updates);

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        timestamp: new Date().toISOString()
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await pool.query(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${++paramCount} AND is_active = true
      RETURNING id, email, username, first_name, last_name, phone, avatar, role, bio, 
                company_name, company_address, company_description, is_verified, created_at, updated_at
    `, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

    const user = result.rows[0];

    // Формируем ответ в зависимости от роли
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.is_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    if (user.role === 'master') {
      userData.bio = user.bio;
      userData.companyName = user.company_name;
      userData.companyAddress = user.company_address;
      userData.companyDescription = user.company_description;
    } else {
      userData.firstName = user.first_name;
      userData.lastName = user.last_name;
    }

    res.json({
      success: true,
      data: userData,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handler для загрузки файлов должен быть добавлен в index.js, не здесь

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    // ✅ Читаем refreshToken из cookie
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Remove refresh token from database
      await pool.query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );
    }

    // ✅ Очищаем cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

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

// POST /api/auth/forgot-password - Forgot password - отправка SMS кода
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

    // Проверяем существует ли пользователь с таким телефоном
    const userResult = await pool.query(
      'SELECT id, phone, username FROM users WHERE phone = $1 AND is_active = true',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User with this phone not found',
        timestamp: new Date().toISOString()
      });
    }

    // Генерируем 4-значный код
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохраняем код в Redis с TTL 10 минут (600 секунд)
    await redisClient.setWithTTL(`sms:password_reset:${phone}`, {
      code,
      expiresAt: expiresAt.toISOString(),
      type: 'password_reset'
    }, 600);

    // Отправляем SMS
    try {
      await smsService.sendSMS(phone, `MebelPlace: Ваш код для сброса пароля: ${code}. Действителен 10 минут.`);
      console.log(`✅ Password reset SMS sent to ${phone}, code: ${code}`);
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      // В режиме разработки продолжаем даже если SMS не отправлена
      console.log(`📱 DEV MODE: Password reset code for ${phone}: ${code}`);
    }

    res.json({
      success: true,
      message: 'SMS code sent to your number',
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

// POST /api/auth/reset-password - Reset password через SMS код
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;

    if (!phone || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Phone, code and new password are required',
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

    // Проверяем SMS код из Redis
    const storedDataStr = await redisClient.get(`sms:password_reset:${phone}`);
    
    if (!storedDataStr) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one',
        timestamp: new Date().toISOString()
      });
    }

    const storedData = JSON.parse(storedDataStr);

    if (storedData.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code type',
        timestamp: new Date().toISOString()
      });
    }

    if (new Date() > new Date(storedData.expiresAt)) {
      await redisClient.del(`sms:password_reset:${phone}`);
      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please request a new one',
        timestamp: new Date().toISOString()
      });
    }

    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        timestamp: new Date().toISOString()
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE phone = $2 RETURNING id, username',
      [passwordHash, phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Удаляем использованный код из Redis
    await redisClient.del(`sms:password_reset:${phone}`);
    
    console.log(`✅ Password reset successfully for phone: ${phone}`);

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

// POST /api/auth/send-sms-code - Send SMS verification code
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

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохраняем код в Redis с временем истечения (10 минут = 600 секунд)
    await redisClient.setWithTTL(`sms:verification:${phone}`, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    }, 600);

    // Отправляем SMS через существующий сервис
    const smsStartTime = Date.now();
    try {
      console.log(`📱 [${new Date().toISOString()}] Starting SMS send to ${phone}`);
      const smsResult = await smsService.sendVerificationCode(phone, code);
      const smsDuration = Date.now() - smsStartTime;
      console.log(`📱 [${new Date().toISOString()}] SMS sending result (took ${smsDuration}ms):`, smsResult);
    } catch (smsError) {
      const smsDuration = Date.now() - smsStartTime;
      console.error(`❌ [${new Date().toISOString()}] SMS sending error after ${smsDuration}ms:`, smsError.message);
      // Продолжаем даже если SMS не отправился - для тестирования
    }

    console.log(`📱 SMS code for ${phone}: ${code}`);

    res.json({
      success: true,
      message: 'SMS code sent successfully',
      // Для разработки возвращаем код (удалить в продакшене!)
      code: code,
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
        message: 'Phone and code are required',
        timestamp: new Date().toISOString()
      });
    }

    const storedDataStr = await redisClient.get(`sms:verification:${phone}`);

    if (!storedDataStr) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found for this phone',
        timestamp: new Date().toISOString()
      });
    }

    // ✅ redisClient.get() уже делает JSON.parse автоматически
    const storedData = storedDataStr;

    // Проверяем истечение срока
    if (Date.now() > storedData.expiresAt) {
      await redisClient.del(`sms:verification:${phone}`);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем количество попыток
    if (storedData.attempts >= 3) {
      await redisClient.del(`sms:verification:${phone}`);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new code',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем код
    if (storedData.code !== code) {
      storedData.attempts++;
      // Обновляем счетчик попыток в Redis
      await redisClient.setWithTTL(`sms:verification:${phone}`, storedData, 300);
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        timestamp: new Date().toISOString()
      });
    }

    // Код верный - удаляем из Redis
    await redisClient.del(`sms:verification:${phone}`);

    res.json({
      success: true,
      message: 'Phone verified successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify SMS code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify SMS code',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/auth/profile - Delete user account
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Soft delete: set is_active = false
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Clear user sessions
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

