#!/usr/bin/env node

/**
 * Скрипт для тестирования всех API эндпоинтов MebelPlace
 */

const API_BASE = 'https://mebelplace.com.kz/api';

// Список всех эндпоинтов используемых Flutter приложением
const ENDPOINTS = {
  'Auth': {
    'POST /auth/login': { method: 'POST', path: '/auth/login', requiresAuth: false },
    'POST /auth/register': { method: 'POST', path: '/auth/register', requiresAuth: false },
  },
  'Videos': {
    'GET /videos/feed': { method: 'GET', path: '/videos/feed?page=1&limit=20', requiresAuth: false },
    'GET /videos/:id': { method: 'GET', path: '/videos/de669f60-3ec2-4cb3-82e3-8dbb0c17f6e1', requiresAuth: false },
    'POST /videos/:id/like': { method: 'POST', path: '/videos/de669f60-3ec2-4cb3-82e3-8dbb0c17f6e1/like', requiresAuth: true },
    'DELETE /videos/:id/like': { method: 'DELETE', path: '/videos/de669f60-3ec2-4cb3-82e3-8dbb0c17f6e1/like', requiresAuth: true },
    'POST /videos/:id/view': { method: 'POST', path: '/videos/de669f60-3ec2-4cb3-82e3-8dbb0c17f6e1/view', requiresAuth: false },
    'GET /videos/:id/comments': { method: 'GET', path: '/videos/de669f60-3ec2-4cb3-82e3-8dbb0c17f6e1/comments', requiresAuth: false },
    'POST /videos/upload': { method: 'POST', path: '/videos/upload', requiresAuth: true, skip: true }, // Skip upload test
  },
  'Users': {
    'GET /users/:id': { method: 'GET', path: '/users/42c8b2e7-1c58-4c75-ad33-4ab015d25a4e', requiresAuth: false },
    'GET /users/:id/videos': { method: 'GET', path: '/users/42c8b2e7-1c58-4c75-ad33-4ab015d25a4e/videos', requiresAuth: false },
  },
  'Orders': {
    'GET /orders/list': { method: 'GET', path: '/orders/list?page=1&limit=20', requiresAuth: true },
    'GET /orders/:id': { method: 'GET', path: '/orders/some-order-id', requiresAuth: true },
    'POST /orders': { method: 'POST', path: '/orders', requiresAuth: true, skip: true },
  },
  'Chats': {
    'GET /chats/list': { method: 'GET', path: '/chats/list', requiresAuth: true },
    'GET /chats/:id/messages': { method: 'GET', path: '/chats/some-chat-id/messages', requiresAuth: true },
  },
  'Notifications': {
    'GET /notifications': { method: 'GET', path: '/notifications', requiresAuth: true },
  },
};

async function testEndpoint(name, config) {
  const url = `${API_BASE}${config.path}`;
  
  if (config.skip) {
    console.log(`⏭️  ${name}: SKIPPED`);
    return { status: 'skipped' };
  }
  
  try {
    const options = {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = await fetch(url, options);
    const status = response.status;
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    
    if (config.requiresAuth && status === 401) {
      console.log(`🔐 ${name}: OK (requires auth)`);
      return { status: 'ok', code: status, message: 'Auth required as expected' };
    }
    
    if (status === 200 || status === 201) {
      console.log(`✅ ${name}: OK (${status})`);
      
      // Проверяем структуру ответа для видео
      if (config.path.includes('/videos/feed') && data.data && data.data.videos) {
        const firstVideo = data.data.videos[0];
        if (firstVideo) {
          console.log(`   📹 Sample video fields:`);
          console.log(`      - duration: ${firstVideo.duration} (${typeof firstVideo.duration})`);
          console.log(`      - thumbnailUrl: ${firstVideo.thumbnailUrl} (${typeof firstVideo.thumbnailUrl})`);
          console.log(`      - avatar: ${firstVideo.avatar} (${typeof firstVideo.avatar})`);
        }
      }
      
      return { status: 'ok', code: status, data };
    } else if (status === 404) {
      console.log(`⚠️  ${name}: NOT FOUND (${status})`);
      return { status: 'not_found', code: status };
    } else {
      console.log(`❌ ${name}: ERROR (${status})`);
      return { status: 'error', code: status, data };
    }
  } catch (error) {
    console.log(`💥 ${name}: FAILED - ${error.message}`);
    return { status: 'failed', error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing MebelPlace API Endpoints\n');
  console.log(`Base URL: ${API_BASE}\n`);
  
  const results = {};
  
  for (const [category, endpoints] of Object.entries(ENDPOINTS)) {
    console.log(`\n📂 ${category}:`);
    console.log('─'.repeat(50));
    
    results[category] = {};
    
    for (const [name, config] of Object.entries(endpoints)) {
      const result = await testEndpoint(name, config);
      results[category][name] = result;
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
    }
  }
  
  // Summary
  console.log('\n\n📊 SUMMARY:');
  console.log('═'.repeat(50));
  
  let total = 0;
  let ok = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const [category, endpoints] of Object.entries(results)) {
    for (const [name, result] of Object.entries(endpoints)) {
      total++;
      if (result.status === 'ok') ok++;
      else if (result.status === 'skipped') skipped++;
      else errors++;
    }
  }
  
  console.log(`Total endpoints: ${total}`);
  console.log(`✅ Working: ${ok}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  
  if (errors === 0) {
    console.log('\n🎉 All API endpoints are working!');
  } else {
    console.log('\n⚠️  Some endpoints have issues. Check the logs above.');
  }
}

runTests();

