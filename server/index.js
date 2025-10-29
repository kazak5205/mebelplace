const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Redis client для кэширования и real-time данных
const redisClient = require('./config/redis');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const orderRoutes = require('./routes/orders');
const chatRoutes = require('./routes/chat');
const pushRoutes = require('./routes/push');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const supportRoutes = require('./routes/support');
const { initDatabase } = require('./config/database');
const { setupSocket } = require('./config/socket');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://mebelplace.com.kz", "https://www.mebelplace.com.kz"]
      : ["http://localhost:5173", "http://localhost:8080", process.env.CLIENT_URL].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Trust proxy для работы за nginx
app.set('trust proxy', true);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:", "blob:"],  // Разрешаем видео
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://mebelplace.com.kz", "https://www.mebelplace.com.kz"]
    : ["http://localhost:5173", "http://localhost:8080", process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));

// ✅ ИСПРАВЛЕНО: Cookie parser для httpOnly cookies
app.use(cookieParser());

// ✅ ИСПРАВЛЕНО: Redis rate limiting (кастомная реализация для ioredis)
const redisRateLimiter = async (req, res, next) => {
  try {
    // ✅ Исключаем /api/auth/me из глобального rate limiter (легкий запрос для проверки авторизации)
    if (req.path === '/api/auth/me') {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate_limit:${ip}`;
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10000; // Увеличено с 1000 до 10000

    // Инкрементируем счётчик
    const current = await redisClient.incr(key);
    
    // Устанавливаем TTL только для первого запроса
    if (current === 1) {
      await redisClient.expire(key, Math.ceil(windowMs / 1000)); // Конвертируем мс в секунды
    }

    // Получаем TTL для заголовка
    const ttl = await redisClient.ttl(key) * 1000; // ttl в секундах, конвертируем в мс
    const resetTime = Date.now() + ttl;

    // Устанавливаем заголовки
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', Math.max(0, maxRequests - current));
    res.setHeader('RateLimit-Reset', new Date(resetTime).toISOString());

    if (current > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(ttl / 1000)
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // В случае ошибки пропускаем запрос
    next();
  }
};

app.use(redisRateLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Fix URL encoding for cyrillic characters
app.use((req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        try {
          // Try to fix double-encoded UTF-8
          const value = req.query[key];
          const decoded = decodeURIComponent(encodeURIComponent(value));
          if (decoded !== value && /[а-яА-ЯёЁ]/.test(decoded)) {
            req.query[key] = decoded;
          }
        } catch (e) {
          // If decoding fails, leave as is
        }
      }
    });
  }
  next();
});

// Serve static files (uploads)
// Сначала проверяем /app/server/uploads (новые файлы: аватары и т.д.)
app.use('/uploads', express.static('/app/server/uploads'));
// Затем проверяем /app/uploads (старые файлы: видео, превью)
app.use('/uploads', express.static('/app/uploads'));
// Специально для видео файлов
app.use('/uploads/videos', express.static('/app/uploads/videos'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);

// Pass io instance to routes that need it
if (chatRoutes.setIO) {
  chatRoutes.setIO(io);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Setup Socket.IO
setupSocket(io);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Socket.IO ready for real-time communication`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
