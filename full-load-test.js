#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');

// Конфигурация
const CONFIG = {
  target: 'https://mebelplace.com.kz',
  totalUsers: 300,
  rampUpTime: 120, // 2 минуты на разгон
  testDuration: 600, // 10 минут тест
  concurrentUsers: 50,
  videoIds: [
    '83bf658f-f504-416f-acaf-8b8052b8fe91',
    '20880709-ecc5-41f2-b801-9a7005a27549',
    '3cd91b71-e2ec-4889-b963-0ea2d4329dad'
  ]
};

// Статистика
const stats = {
  totalRequests: 0,
  totalErrors: 0,
  responseTimes: [],
  errors: [],
  users: [],
  startTime: Date.now(),
  phases: {
    registration: { requests: 0, errors: 0, times: [] },
    login: { requests: 0, errors: 0, times: [] },
    videoViewing: { requests: 0, errors: 0, times: [] },
    fileUpload: { requests: 0, errors: 0, times: [] },
    chat: { requests: 0, errors: 0, times: [] },
    orders: { requests: 0, errors: 0, times: [] }
  }
};

// HTTP клиент с cookies
class HttpClient {
  constructor() {
    this.cookies = {};
    this.userAgent = 'MebelPlace Load Test Bot';
  }

  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const urlObj = new URL(url);
      
      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cookie': this.getCookieString(),
          ...options.headers
        }
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          // Сохраняем cookies
          if (res.headers['set-cookie']) {
            this.setCookies(res.headers['set-cookie']);
          }
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data,
            headers: res.headers
          });
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  getCookieString() {
    return Object.entries(this.cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  setCookies(cookieHeaders) {
    cookieHeaders.forEach(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        this.cookies[name.trim()] = value.trim();
      }
    });
  }
}

// Полный сценарий пользователя
async function simulateFullUserJourney(userId) {
  const client = new HttpClient();
  const userStats = {
    id: userId,
    startTime: Date.now(),
    requests: 0,
    errors: 0,
    phases: {}
  };

  try {
    console.log(`👤 User ${userId}: Starting full journey...`);

    // ФАЗА 1: РЕГИСТРАЦИЯ
    console.log(`👤 User ${userId}: Phase 1 - Registration`);
    const regStart = performance.now();
    
    // 1.1 Заходим на страницу регистрации
    await client.request(`${CONFIG.target}/register`);
    userStats.requests++;
    stats.phases.registration.requests++;
    
    // 1.2 Заполняем форму регистрации
    const phone = `+7778${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    const username = `testuser${userId}`;
    const password = 'testpass123';
    
    const regData = JSON.stringify({
      phone: phone,
      username: username,
      password: password,
      role: Math.random() > 0.7 ? 'master' : 'client'
    });
    
    try {
      const regResponse = await client.request(`${CONFIG.target}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: regData
      });
      
      userStats.requests++;
      stats.phases.registration.requests++;
      
      if (regResponse.statusCode >= 400) {
        stats.phases.registration.errors++;
        userStats.errors++;
        console.log(`❌ User ${userId}: Registration failed - ${regResponse.statusCode}`);
      } else {
        console.log(`✅ User ${userId}: Registration successful`);
      }
    } catch (error) {
      stats.phases.registration.errors++;
      userStats.errors++;
      console.log(`❌ User ${userId}: Registration error - ${error.message}`);
    }
    
    const regEnd = performance.now();
    stats.phases.registration.times.push(regEnd - regStart);

    // ФАЗА 2: ВХОД В СИСТЕМУ
    console.log(`👤 User ${userId}: Phase 2 - Login`);
    const loginStart = performance.now();
    
    try {
      const loginData = JSON.stringify({
        phone: phone,
        password: password
      });
      
      const loginResponse = await client.request(`${CONFIG.target}/api/auth/simple-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: loginData
      });
      
      userStats.requests++;
      stats.phases.login.requests++;
      
      if (loginResponse.statusCode >= 400) {
        stats.phases.login.errors++;
        userStats.errors++;
        console.log(`❌ User ${userId}: Login failed - ${loginResponse.statusCode}`);
      } else {
        console.log(`✅ User ${userId}: Login successful`);
      }
    } catch (error) {
      stats.phases.login.errors++;
      userStats.errors++;
      console.log(`❌ User ${userId}: Login error - ${error.message}`);
    }
    
    const loginEnd = performance.now();
    stats.phases.login.times.push(loginEnd - loginStart);

    // ФАЗА 3: ПРОСМОТР ВИДЕО (TikTok-стиль)
    console.log(`👤 User ${userId}: Phase 3 - Video Viewing`);
    const videoStart = performance.now();
    
    try {
      // 3.1 Загружаем главную страницу
      await client.request(`${CONFIG.target}/`);
      userStats.requests++;
      stats.phases.videoViewing.requests++;
      
      // 3.2 Загружаем ленту видео
      const feedResponse = await client.request(`${CONFIG.target}/api/videos/feed`);
      userStats.requests++;
      stats.phases.videoViewing.requests++;
      
      if (feedResponse.statusCode >= 400) {
        stats.phases.videoViewing.errors++;
        userStats.errors++;
        console.log(`❌ User ${userId}: Video feed failed - ${feedResponse.statusCode}`);
      } else {
        console.log(`✅ User ${userId}: Video feed loaded`);
      }
      
      // 3.3 Переходим к конкретному видео
      const videoId = CONFIG.videoIds[Math.floor(Math.random() * CONFIG.videoIds.length)];
      await client.request(`${CONFIG.target}/?videoId=${videoId}`);
      userStats.requests++;
      stats.phases.videoViewing.requests++;
      
      // 3.4 Загружаем информацию о видео
      const videoResponse = await client.request(`${CONFIG.target}/api/videos/${videoId}`);
      userStats.requests++;
      stats.phases.videoViewing.requests++;
      
      if (videoResponse.statusCode >= 400) {
        stats.phases.videoViewing.errors++;
        userStats.errors++;
        console.log(`❌ User ${userId}: Video info failed - ${videoResponse.statusCode}`);
      } else {
        console.log(`✅ User ${userId}: Video info loaded`);
      }
      
      // 3.5 Симуляция просмотра (лайки, комментарии)
      await client.request(`${CONFIG.target}/api/videos/${videoId}/like`, { method: 'POST' });
      userStats.requests++;
      stats.phases.videoViewing.requests++;
      
    } catch (error) {
      stats.phases.videoViewing.errors++;
      userStats.errors++;
      console.log(`❌ User ${userId}: Video viewing error - ${error.message}`);
    }
    
    const videoEnd = performance.now();
    stats.phases.videoViewing.times.push(videoEnd - videoStart);

    // ФАЗА 4: ЗАГРУЗКА ФАЙЛОВ (для мастеров)
    if (Math.random() > 0.7) { // 30% пользователей - мастера
      console.log(`👤 User ${userId}: Phase 4 - File Upload (Master)`);
      const uploadStart = performance.now();
      
      try {
        // 4.1 Заходим на страницу загрузки видео
        await client.request(`${CONFIG.target}/create-video-ad`);
        userStats.requests++;
        stats.phases.fileUpload.requests++;
        
        // 4.2 Симуляция загрузки файла (без реального файла)
        const uploadData = JSON.stringify({
          title: `Test Video ${userId}`,
          description: `Test description for user ${userId}`,
          category: 'furniture'
        });
        
        const uploadResponse = await client.request(`${CONFIG.target}/api/videos/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: uploadData
        });
        
        userStats.requests++;
        stats.phases.fileUpload.requests++;
        
        if (uploadResponse.statusCode >= 400) {
          stats.phases.fileUpload.errors++;
          userStats.errors++;
          console.log(`❌ User ${userId}: File upload failed - ${uploadResponse.statusCode}`);
        } else {
          console.log(`✅ User ${userId}: File upload successful`);
        }
        
      } catch (error) {
        stats.phases.fileUpload.errors++;
        userStats.errors++;
        console.log(`❌ User ${userId}: File upload error - ${error.message}`);
      }
      
      const uploadEnd = performance.now();
      stats.phases.fileUpload.times.push(uploadEnd - uploadStart);
    }

    // ФАЗА 5: ЧАТЫ
    console.log(`👤 User ${userId}: Phase 5 - Chat`);
    const chatStart = performance.now();
    
    try {
      // 5.1 Загружаем список чатов
      const chatsResponse = await client.request(`${CONFIG.target}/api/chats/list`);
      userStats.requests++;
      stats.phases.chat.requests++;
      
      if (chatsResponse.statusCode >= 400) {
        stats.phases.chat.errors++;
        userStats.errors++;
        console.log(`❌ User ${userId}: Chat list failed - ${chatsResponse.statusCode}`);
      } else {
        console.log(`✅ User ${userId}: Chat list loaded`);
      }
      
    } catch (error) {
      stats.phases.chat.errors++;
      userStats.errors++;
      console.log(`❌ User ${userId}: Chat error - ${error.message}`);
    }
    
    const chatEnd = performance.now();
    stats.phases.chat.times.push(chatEnd - chatStart);

    // ФАЗА 6: ЗАКАЗЫ
    console.log(`👤 User ${userId}: Phase 6 - Orders`);
    const orderStart = performance.now();
    
    try {
      // 6.1 Загружаем ленту заказов
      const ordersResponse = await client.request(`${CONFIG.target}/api/orders/feed`);
      userStats.requests++;
      stats.phases.orders.requests++;
      
      if (ordersResponse.statusCode >= 400) {
        stats.phases.orders.errors++;
        userStats.errors++;
        console.log(`❌ User ${userId}: Orders failed - ${ordersResponse.statusCode}`);
      } else {
        console.log(`✅ User ${userId}: Orders loaded`);
      }
      
    } catch (error) {
      stats.phases.orders.errors++;
      userStats.errors++;
      console.log(`❌ User ${userId}: Orders error - ${error.message}`);
    }
    
    const orderEnd = performance.now();
    stats.phases.orders.times.push(orderEnd - orderStart);

    userStats.endTime = Date.now();
    userStats.duration = userStats.endTime - userStats.startTime;
    
    console.log(`✅ User ${userId}: Journey completed in ${userStats.duration}ms (${userStats.requests} requests, ${userStats.errors} errors)`);
    
    return userStats;
    
  } catch (error) {
    console.log(`💥 User ${userId}: Critical error - ${error.message}`);
    userStats.errors++;
    userStats.endTime = Date.now();
    return userStats;
  }
}

// Запуск полного теста
async function runFullLoadTest() {
  console.log('🚀 STARTING FULL LOAD TEST FOR MEBELPLACE');
  console.log('═'.repeat(80));
  console.log(`🎯 Target: ${CONFIG.target}`);
  console.log(`👥 Total Users: ${CONFIG.totalUsers}`);
  console.log(`⏱️  Duration: ${CONFIG.testDuration}s`);
  console.log(`🔄 Concurrent: ${CONFIG.concurrentUsers}`);
  console.log(`📊 Ramp-up: ${CONFIG.rampUpTime}s`);
  console.log('═'.repeat(80));
  
  const startTime = Date.now();
  const users = [];
  
  // Создаем пользователей с интервалом
  for (let i = 0; i < CONFIG.totalUsers; i++) {
    const delay = (i / CONFIG.totalUsers) * CONFIG.rampUpTime * 1000;
    
    setTimeout(async () => {
      const user = await simulateFullUserJourney(i + 1);
      users.push(user);
      stats.users.push(user);
      
      console.log(`👤 User ${i + 1} completed (${stats.users.length} total users)`);
    }, delay);
  }
  
  // Ждем завершения теста
  await new Promise(resolve => setTimeout(resolve, CONFIG.testDuration * 1000));
  
  // Собираем финальную статистику
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  // Анализ результатов
  const totalRequests = stats.users.reduce((sum, user) => sum + user.requests, 0);
  const totalErrors = stats.users.reduce((sum, user) => sum + user.errors, 0);
  const avgResponseTime = stats.users.reduce((sum, user) => sum + (user.duration || 0), 0) / stats.users.length;
  const requestsPerSecond = totalRequests / totalDuration;
  const errorRate = (totalErrors / totalRequests) * 100;
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 FULL LOAD TEST RESULTS');
  console.log('═'.repeat(80));
  console.log(`⏱️  Test Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`👥 Total Users: ${stats.users.length}`);
  console.log(`📈 Total Requests: ${totalRequests}`);
  console.log(`⚡ Requests/sec: ${requestsPerSecond.toFixed(2)}`);
  console.log(`❌ Total Errors: ${totalErrors} (${errorRate.toFixed(2)}%)`);
  console.log(`📊 Avg User Journey: ${avgResponseTime.toFixed(2)}ms`);
  
  console.log('\n📋 PHASE BREAKDOWN:');
  Object.entries(stats.phases).forEach(([phase, data]) => {
    if (data.requests > 0) {
      const avgTime = data.times.length > 0 ? data.times.reduce((a, b) => a + b, 0) / data.times.length : 0;
      const phaseErrorRate = (data.errors / data.requests) * 100;
      console.log(`  ${phase.toUpperCase()}: ${data.requests} requests, ${data.errors} errors (${phaseErrorRate.toFixed(1)}%), avg: ${avgTime.toFixed(2)}ms`);
    }
  });
  
  // Оценка производительности
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (errorRate < 5 && avgResponseTime < 30000) {
    console.log('✅ EXCELLENT - Ready for production!');
  } else if (errorRate < 15 && avgResponseTime < 60000) {
    console.log('⚠️  GOOD - Minor optimizations needed');
  } else {
    console.log('❌ NEEDS OPTIMIZATION - Performance issues detected');
  }
  
  // Сохраняем детальный отчет
  const report = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    results: {
      totalDuration,
      totalUsers: stats.users.length,
      totalRequests,
      totalErrors,
      errorRate,
      requestsPerSecond,
      avgResponseTime
    },
    phases: stats.phases,
    users: stats.users
  };
  
  fs.writeFileSync('load-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Detailed report saved to load-test-report.json');
  console.log('═'.repeat(80));
}

// Запуск
runFullLoadTest().catch(console.error);
