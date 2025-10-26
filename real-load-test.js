#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Конфигурация теста
const CONFIG = {
  target: 'https://mebelplace.com.kz',
  totalUsers: 500,
  rampUpTime: 60, // секунд
  testDuration: 300, // секунд
  concurrentUsers: 50,
  videoIds: [
    '83bf658f-f504-416f-acaf-8b8052b8fe91',
    '20880709-ecc5-41f2-b801-9a7005a27549',
    '3cd91b71-e2ec-4889-b963-0ea2d4329dad'
  ]
};

// Статистика
const stats = {
  requests: 0,
  errors: 0,
  responseTimes: [],
  startTime: Date.now(),
  users: 0
};

// Функция для HTTP запроса
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'MebelPlace Load Test Bot',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        stats.requests++;
        stats.responseTimes.push(responseTime);
        
        if (res.statusCode >= 400) {
          stats.errors++;
        }
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data.substring(0, 100) // Первые 100 символов
        });
      });
    });
    
    req.on('error', (err) => {
      stats.errors++;
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      stats.errors++;
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Симуляция пользователя
async function simulateUser(userId) {
  const userStats = {
    requests: 0,
    errors: 0,
    startTime: Date.now()
  };
  
  try {
    // 1. Загрузка главной страницы
    console.log(`👤 User ${userId}: Loading homepage...`);
    await makeRequest(`${CONFIG.target}/`);
    userStats.requests++;
    
    // 2. Загрузка API видео
    console.log(`👤 User ${userId}: Loading video feed...`);
    await makeRequest(`${CONFIG.target}/api/videos/feed`);
    userStats.requests++;
    
    // 3. Переход к конкретному видео (TikTok-стиль)
    const videoId = CONFIG.videoIds[Math.floor(Math.random() * CONFIG.videoIds.length)];
    console.log(`👤 User ${userId}: Watching video ${videoId}...`);
    await makeRequest(`${CONFIG.target}/?videoId=${videoId}`);
    userStats.requests++;
    
    // 4. Загрузка информации о видео
    await makeRequest(`${CONFIG.target}/api/videos/${videoId}`);
    userStats.requests++;
    
    // 5. Симуляция просмотра (несколько запросов)
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      await makeRequest(`${CONFIG.target}/api/videos/${videoId}`);
      userStats.requests++;
    }
    
    // 6. Поиск
    console.log(`👤 User ${userId}: Searching...`);
    await makeRequest(`${CONFIG.target}/api/videos/feed?search=мебель`);
    userStats.requests++;
    
    // 7. Переход на страницу входа
    await makeRequest(`${CONFIG.target}/login`);
    userStats.requests++;
    
    console.log(`✅ User ${userId}: Completed ${userStats.requests} requests`);
    
  } catch (error) {
    console.log(`❌ User ${userId}: Error - ${error.message}`);
    userStats.errors++;
  }
  
  return userStats;
}

// Запуск теста
async function runLoadTest() {
  console.log('🚀 Starting REAL Load Test for MebelPlace');
  console.log(`📊 Target: ${CONFIG.target}`);
  console.log(`👥 Users: ${CONFIG.totalUsers}`);
  console.log(`⏱️  Duration: ${CONFIG.testDuration}s`);
  console.log(`🔄 Concurrent: ${CONFIG.concurrentUsers}`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  const users = [];
  
  // Создаем пользователей с интервалом
  for (let i = 0; i < CONFIG.totalUsers; i++) {
    const delay = (i / CONFIG.totalUsers) * CONFIG.rampUpTime * 1000;
    
    setTimeout(async () => {
      const user = simulateUser(i + 1);
      users.push(user);
      stats.users++;
      
      console.log(`👤 User ${i + 1} started (${stats.users} active users)`);
    }, delay);
    
    // Ограничиваем количество одновременных пользователей
    if (users.length >= CONFIG.concurrentUsers) {
      await Promise.race(users);
    }
  }
  
  // Ждем завершения теста
  await new Promise(resolve => setTimeout(resolve, CONFIG.testDuration * 1000));
  
  // Собираем результаты
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Статистика
  const avgResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
  const maxResponseTime = Math.max(...stats.responseTimes);
  const minResponseTime = Math.min(...stats.responseTimes);
  const requestsPerSecond = stats.requests / duration;
  const errorRate = (stats.errors / stats.requests) * 100;
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('═'.repeat(60));
  console.log(`⏱️  Test Duration: ${duration.toFixed(2)}s`);
  console.log(`👥 Total Users: ${stats.users}`);
  console.log(`📈 Total Requests: ${stats.requests}`);
  console.log(`⚡ Requests/sec: ${requestsPerSecond.toFixed(2)}`);
  console.log(`❌ Errors: ${stats.errors} (${errorRate.toFixed(2)}%)`);
  console.log(`📊 Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`📊 Min Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`📊 Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
  
  // Оценка производительности
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (errorRate < 1 && avgResponseTime < 1000) {
    console.log('✅ EXCELLENT - Ready for production!');
  } else if (errorRate < 5 && avgResponseTime < 2000) {
    console.log('⚠️  GOOD - Minor optimizations needed');
  } else {
    console.log('❌ NEEDS OPTIMIZATION - Performance issues detected');
  }
  
  console.log('═'.repeat(60));
}

// Запуск
runLoadTest().catch(console.error);
