#!/usr/bin/env node

const https = require('https');
const { performance } = require('perf_hooks');

// Конфигурация
const CONFIG = {
  target: 'https://mebelplace.com.kz',
  totalUsers: 100, // Начнем с меньшего количества
  concurrentUsers: 10,
  testDuration: 300 // 5 минут
};

// Статистика
const stats = {
  requests: 0,
  errors: 0,
  responseTimes: [],
  startTime: Date.now(),
  users: 0
};

// Простой HTTP запрос
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const urlObj = new URL(url);
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'MebelPlace Load Test',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
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
          dataLength: data.length
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
    id: userId,
    requests: 0,
    errors: 0,
    startTime: Date.now()
  };
  
  try {
    console.log(`👤 User ${userId}: Starting...`);
    
    // 1. Главная страница
    const homeResponse = await makeRequest(`${CONFIG.target}/`);
    userStats.requests++;
    console.log(`👤 User ${userId}: Homepage - ${homeResponse.statusCode} (${homeResponse.responseTime.toFixed(2)}ms)`);
    
    // 2. API видео
    try {
      const videoResponse = await makeRequest(`${CONFIG.target}/api/videos/feed`);
      userStats.requests++;
      console.log(`👤 User ${userId}: Video feed - ${videoResponse.statusCode} (${videoResponse.responseTime.toFixed(2)}ms)`);
    } catch (error) {
      console.log(`❌ User ${userId}: Video feed failed - ${error.message}`);
      userStats.errors++;
    }
    
    // 3. Конкретное видео
    const videoIds = [
      '83bf658f-f504-416f-acaf-8b8052b8fe91',
      '20880709-ecc5-41f2-b801-9a7005a27549',
      '3cd91b71-e2ec-4889-b963-0ea2d4329dad'
    ];
    const videoId = videoIds[Math.floor(Math.random() * videoIds.length)];
    
    try {
      const videoPageResponse = await makeRequest(`${CONFIG.target}/?videoId=${videoId}`);
      userStats.requests++;
      console.log(`👤 User ${userId}: Video page - ${videoPageResponse.statusCode} (${videoPageResponse.responseTime.toFixed(2)}ms)`);
    } catch (error) {
      console.log(`❌ User ${userId}: Video page failed - ${error.message}`);
      userStats.errors++;
    }
    
    // 4. API видео
    try {
      const videoApiResponse = await makeRequest(`${CONFIG.target}/api/videos/${videoId}`);
      userStats.requests++;
      console.log(`👤 User ${userId}: Video API - ${videoApiResponse.statusCode} (${videoApiResponse.responseTime.toFixed(2)}ms)`);
    } catch (error) {
      console.log(`❌ User ${userId}: Video API failed - ${error.message}`);
      userStats.errors++;
    }
    
    // 5. Страница входа
    try {
      const loginResponse = await makeRequest(`${CONFIG.target}/login`);
      userStats.requests++;
      console.log(`👤 User ${userId}: Login page - ${loginResponse.statusCode} (${loginResponse.responseTime.toFixed(2)}ms)`);
    } catch (error) {
      console.log(`❌ User ${userId}: Login page failed - ${error.message}`);
      userStats.errors++;
    }
    
    // 6. Страница регистрации
    try {
      const registerResponse = await makeRequest(`${CONFIG.target}/register`);
      userStats.requests++;
      console.log(`👤 User ${userId}: Register page - ${registerResponse.statusCode} (${registerResponse.responseTime.toFixed(2)}ms)`);
    } catch (error) {
      console.log(`❌ User ${userId}: Register page failed - ${error.message}`);
      userStats.errors++;
    }
    
    userStats.endTime = Date.now();
    userStats.duration = userStats.endTime - userStats.startTime;
    
    console.log(`✅ User ${userId}: Completed in ${userStats.duration}ms (${userStats.requests} requests, ${userStats.errors} errors)`);
    
    return userStats;
    
  } catch (error) {
    console.log(`💥 User ${userId}: Critical error - ${error.message}`);
    userStats.errors++;
    userStats.endTime = Date.now();
    return userStats;
  }
}

// Запуск теста
async function runLoadTest() {
  console.log('🚀 STARTING LOAD TEST FOR MEBELPLACE');
  console.log('═'.repeat(60));
  console.log(`🎯 Target: ${CONFIG.target}`);
  console.log(`👥 Total Users: ${CONFIG.totalUsers}`);
  console.log(`⏱️  Duration: ${CONFIG.testDuration}s`);
  console.log(`🔄 Concurrent: ${CONFIG.concurrentUsers}`);
  console.log('═'.repeat(60));
  
  const startTime = Date.now();
  const users = [];
  
  // Создаем пользователей
  for (let i = 0; i < CONFIG.totalUsers; i++) {
    // Запускаем пользователей с интервалом
    setTimeout(async () => {
      const user = await simulateUser(i + 1);
      users.push(user);
      stats.users++;
    }, i * 1000); // 1 секунда между пользователями
  }
  
  // Ждем завершения
  await new Promise(resolve => setTimeout(resolve, CONFIG.testDuration * 1000));
  
  // Анализ результатов
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  const totalRequests = users.reduce((sum, user) => sum + user.requests, 0);
  const totalErrors = users.reduce((sum, user) => sum + user.errors, 0);
  const avgResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
  const maxResponseTime = Math.max(...stats.responseTimes);
  const minResponseTime = Math.min(...stats.responseTimes);
  const requestsPerSecond = totalRequests / totalDuration;
  const errorRate = (totalErrors / totalRequests) * 100;
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('═'.repeat(60));
  console.log(`⏱️  Test Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`👥 Total Users: ${stats.users}`);
  console.log(`📈 Total Requests: ${totalRequests}`);
  console.log(`⚡ Requests/sec: ${requestsPerSecond.toFixed(2)}`);
  console.log(`❌ Total Errors: ${totalErrors} (${errorRate.toFixed(2)}%)`);
  console.log(`📊 Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`📊 Min Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`📊 Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
  
  // Распределение времени ответа
  const sortedTimes = stats.responseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  console.log('\n📊 RESPONSE TIME DISTRIBUTION:');
  console.log(`  50%: ${p50.toFixed(2)}ms`);
  console.log(`  90%: ${p90.toFixed(2)}ms`);
  console.log(`  95%: ${p95.toFixed(2)}ms`);
  console.log(`  99%: ${p99.toFixed(2)}ms`);
  
  // Оценка производительности
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (errorRate < 5 && avgResponseTime < 2000) {
    console.log('✅ EXCELLENT - Ready for production!');
  } else if (errorRate < 15 && avgResponseTime < 5000) {
    console.log('⚠️  GOOD - Minor optimizations needed');
  } else {
    console.log('❌ NEEDS OPTIMIZATION - Performance issues detected');
  }
  
  console.log('═'.repeat(60));
}

// Запуск
runLoadTest().catch(console.error);
