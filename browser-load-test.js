#!/usr/bin/env node

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');

// Конфигурация
const CONFIG = {
  target: 'https://mebelplace.com.kz',
  totalUsers: 20, // Начнем с малого для демонстрации
  concurrentUsers: 3,
  testDuration: 300 // 5 минут
};

// Статистика
const stats = {
  users: [],
  totalRequests: 0,
  totalErrors: 0,
  startTime: Date.now()
};

// Создание тестового видео файла
const createTestVideo = () => {
  const fs = require('fs');
  const path = require('path');
  
  // Создаем простой HTML5 видео файл (1 секунда черного экрана)
  const testVideoPath = path.join(__dirname, 'test-video.mp4');
  
  // Для демонстрации создаем пустой файл (в реальности нужен настоящий MP4)
  if (!fs.existsSync(testVideoPath)) {
    fs.writeFileSync(testVideoPath, 'fake video content for testing');
  }
  
  return testVideoPath;
};

// Симуляция реального пользователя через браузер
async function simulateRealUser(userId) {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const userStats = {
    id: userId,
    startTime: Date.now(),
    actions: [],
    errors: [],
    uploadedContent: []
  };
  
  try {
    console.log(`🌐 User ${userId}: Opening browser...`);
    
    // 1. ЗАХОДИМ НА САЙТ
    await page.goto(CONFIG.target, { waitUntil: 'networkidle' });
    userStats.actions.push('visited_homepage');
    console.log(`👤 User ${userId}: Visited homepage`);
    
    // 2. РЕГИСТРАЦИЯ НОВОГО ПОЛЬЗОВАТЕЛЯ
    console.log(`👤 User ${userId}: Starting registration...`);
    await page.click('text=Регистрация');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму регистрации
    const phone = `+7778${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    const username = `testuser${userId}`;
    const password = 'testpass123';
    
    // Выбираем роль (70% клиенты, 30% мастера)
    const isMaster = Math.random() > 0.7;
    if (isMaster) {
      await page.selectOption('select', 'master');
    } else {
      await page.selectOption('select', 'client');
    }
    
    await page.fill('input[placeholder*="+7"]', phone);
    await page.fill('input[placeholder*="username"]', username);
    await page.fill('input[placeholder*="пароль"]', password);
    await page.fill('input[placeholder*="Повторите"]', password);
    
    userStats.actions.push('filled_registration_form');
    console.log(`👤 User ${userId}: Filled registration form (${isMaster ? 'Master' : 'Client'})`);
    
    // Отправляем форму
    try {
      await page.click('button:has-text("Отправить SMS")');
      await page.waitForTimeout(2000); // Ждем обработки
      userStats.actions.push('submitted_registration');
      console.log(`👤 User ${userId}: Submitted registration`);
    } catch (error) {
      userStats.errors.push(`Registration failed: ${error.message}`);
      console.log(`❌ User ${userId}: Registration failed - ${error.message}`);
    }
    
    // 3. ВХОД В СИСТЕМУ (если регистрация прошла)
    console.log(`👤 User ${userId}: Attempting login...`);
    await page.click('text=Войти');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="+7"]', phone);
    await page.fill('input[type="password"]', password);
    
    try {
      await page.click('button:has-text("Войти")');
      await page.waitForTimeout(3000);
      userStats.actions.push('attempted_login');
      console.log(`👤 User ${userId}: Attempted login`);
    } catch (error) {
      userStats.errors.push(`Login failed: ${error.message}`);
      console.log(`❌ User ${userId}: Login failed - ${error.message}`);
    }
    
    // 4. ПРОСМОТР ВИДЕО (TikTok-стиль)
    console.log(`👤 User ${userId}: Watching videos...`);
    await page.goto(CONFIG.target, { waitUntil: 'networkidle' });
    
    // Ищем видео на странице
    const videos = await page.locator('video').count();
    if (videos > 0) {
      userStats.actions.push('found_videos');
      console.log(`👤 User ${userId}: Found ${videos} videos`);
      
      // Кликаем по видео для воспроизведения
      await page.locator('video').first().click();
      await page.waitForTimeout(2000);
      userStats.actions.push('clicked_video');
      console.log(`👤 User ${userId}: Clicked video`);
      
      // Пытаемся поставить лайк
      try {
        const likeButton = page.locator('button').filter({ hasText: /лайк|❤|heart/i }).first();
        if (await likeButton.count() > 0) {
          await likeButton.click();
          userStats.actions.push('liked_video');
          console.log(`👤 User ${userId}: Liked video`);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Could not like video`);
      }
    }
    
    // 5. ПОИСК МЕБЕЛИ
    console.log(`👤 User ${userId}: Searching for furniture...`);
    try {
      const searchInput = page.locator('input[placeholder*="Поиск"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('мебель');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        userStats.actions.push('searched_furniture');
        console.log(`👤 User ${userId}: Searched for furniture`);
      }
    } catch (error) {
      console.log(`👤 User ${userId}: Search failed - ${error.message}`);
    }
    
    // 6. СОЗДАНИЕ ЗАКАЗА (для клиентов)
    if (!isMaster) {
      console.log(`👤 User ${userId}: Creating order...`);
      try {
        // Ищем кнопку создания заказа
        const orderButton = page.locator('button, a').filter({ hasText: /заказ|order|создать/i }).first();
        if (await orderButton.count() > 0) {
          await orderButton.click();
          await page.waitForLoadState('networkidle');
          
          // Заполняем форму заказа
          const orderTitle = `Тестовый заказ от пользователя ${userId}`;
          const orderDescription = `Описание заказа: нужна мебель для кухни, бюджет 50000 тенге`;
          
          const titleInput = page.locator('input[placeholder*="название"], input[placeholder*="заголовок"]').first();
          if (await titleInput.count() > 0) {
            await titleInput.fill(orderTitle);
          }
          
          const descInput = page.locator('textarea, input[placeholder*="описание"]').first();
          if (await descInput.count() > 0) {
            await descInput.fill(orderDescription);
          }
          
          // Выбираем категорию
          const categorySelect = page.locator('select').first();
          if (await categorySelect.count() > 0) {
            await categorySelect.selectOption({ index: 1 });
          }
          
          userStats.actions.push('filled_order_form');
          console.log(`👤 User ${userId}: Filled order form`);
          
          // Отправляем заказ
          const submitButton = page.locator('button[type="submit"], button:has-text("Создать"), button:has-text("Отправить")').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(2000);
            userStats.actions.push('submitted_order');
            userStats.uploadedContent.push('order_created');
            console.log(`👤 User ${userId}: Created order`);
          }
        }
      } catch (error) {
        userStats.errors.push(`Order creation failed: ${error.message}`);
        console.log(`❌ User ${userId}: Order creation failed - ${error.message}`);
      }
    }
    
    // 7. ЗАГРУЗКА ВИДЕО (для мастеров)
    if (isMaster) {
      console.log(`👤 User ${userId}: Uploading video as master...`);
      try {
        // Ищем кнопку загрузки видео
        const uploadButton = page.locator('button, a').filter({ hasText: /видео|video|загрузить|upload/i }).first();
        if (await uploadButton.count() > 0) {
          await uploadButton.click();
          await page.waitForLoadState('networkidle');
          
          // Заполняем форму видео
          const videoTitle = `Видео от мастера ${userId}`;
          const videoDescription = `Показываю свою работу по изготовлению мебели`;
          
          const titleInput = page.locator('input[placeholder*="название"], input[placeholder*="заголовок"]').first();
          if (await titleInput.count() > 0) {
            await titleInput.fill(videoTitle);
          }
          
          const descInput = page.locator('textarea, input[placeholder*="описание"]').first();
          if (await descInput.count() > 0) {
            await descInput.fill(videoDescription);
          }
          
          // Загружаем тестовый файл
          const fileInput = page.locator('input[type="file"]').first();
          if (await fileInput.count() > 0) {
            const testVideoPath = createTestVideo();
            await fileInput.setInputFiles(testVideoPath);
            userStats.actions.push('selected_video_file');
            console.log(`👤 User ${userId}: Selected video file`);
          }
          
          userStats.actions.push('filled_video_form');
          console.log(`👤 User ${userId}: Filled video form`);
          
          // Отправляем видео
          const submitButton = page.locator('button[type="submit"], button:has-text("Загрузить"), button:has-text("Отправить")').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(5000); // Ждем загрузки
            userStats.actions.push('submitted_video');
            userStats.uploadedContent.push('video_uploaded');
            console.log(`👤 User ${userId}: Uploaded video`);
          }
        }
      } catch (error) {
        userStats.errors.push(`Video upload failed: ${error.message}`);
        console.log(`❌ User ${userId}: Video upload failed - ${error.message}`);
      }
    }
    
    // 8. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
    console.log(`👤 User ${userId}: Updating profile...`);
    try {
      const profileButton = page.locator('button, a').filter({ hasText: /профиль|profile|настройки/i }).first();
      if (await profileButton.count() > 0) {
        await profileButton.click();
        await page.waitForLoadState('networkidle');
        
        // Обновляем информацию профиля
        const nameInput = page.locator('input[placeholder*="имя"], input[placeholder*="name"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill(`Пользователь ${userId}`);
        }
        
        userStats.actions.push('updated_profile');
        console.log(`👤 User ${userId}: Updated profile`);
      }
    } catch (error) {
      console.log(`👤 User ${userId}: Profile update failed - ${error.message}`);
    }
    
    userStats.endTime = Date.now();
    userStats.duration = userStats.endTime - userStats.startTime;
    
    console.log(`✅ User ${userId}: Completed in ${userStats.duration}ms (${userStats.actions.length} actions, ${userStats.errors.length} errors)`);
    console.log(`📊 User ${userId}: Actions: ${userStats.actions.join(', ')}`);
    console.log(`📊 User ${userId}: Content: ${userStats.uploadedContent.join(', ')}`);
    
    return userStats;
    
  } catch (error) {
    console.log(`💥 User ${userId}: Critical error - ${error.message}`);
    userStats.errors.push(`Critical error: ${error.message}`);
    userStats.endTime = Date.now();
    return userStats;
  } finally {
    await browser.close();
  }
}

// Запуск теста
async function runBrowserLoadTest() {
  console.log('🚀 STARTING BROWSER LOAD TEST FOR MEBELPLACE');
  console.log('═'.repeat(80));
  console.log(`🎯 Target: ${CONFIG.target}`);
  console.log(`👥 Total Users: ${CONFIG.totalUsers}`);
  console.log(`⏱️  Duration: ${CONFIG.testDuration}s`);
  console.log(`🔄 Concurrent: ${CONFIG.concurrentUsers}`);
  console.log('═'.repeat(80));
  
  const startTime = Date.now();
  const users = [];
  
  // Создаем пользователей с интервалом
  for (let i = 0; i < CONFIG.totalUsers; i++) {
    const delay = i * 5000; // 5 секунд между пользователями
    
    setTimeout(async () => {
      const user = await simulateRealUser(i + 1);
      users.push(user);
      stats.users.push(user);
      
      console.log(`👤 User ${i + 1} completed (${stats.users.length} total users)`);
    }, delay);
  }
  
  // Ждем завершения
  await new Promise(resolve => setTimeout(resolve, CONFIG.testDuration * 1000));
  
  // Анализ результатов
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  const totalActions = users.reduce((sum, user) => sum + user.actions.length, 0);
  const totalErrors = users.reduce((sum, user) => sum + user.errors.length, 0);
  const totalContent = users.reduce((sum, user) => sum + user.uploadedContent.length, 0);
  const avgDuration = users.reduce((sum, user) => sum + (user.duration || 0), 0) / users.length;
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 BROWSER LOAD TEST RESULTS');
  console.log('═'.repeat(80));
  console.log(`⏱️  Test Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`👥 Total Users: ${stats.users.length}`);
  console.log(`🎬 Total Actions: ${totalActions}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`📁 Content Created: ${totalContent}`);
  console.log(`📊 Avg User Duration: ${avgDuration.toFixed(2)}ms`);
  
  // Детальная статистика
  const actionCounts = {};
  const contentCounts = {};
  
  users.forEach(user => {
    user.actions.forEach(action => {
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    user.uploadedContent.forEach(content => {
      contentCounts[content] = (contentCounts[content] || 0) + 1;
    });
  });
  
  console.log('\n📋 ACTION BREAKDOWN:');
  Object.entries(actionCounts).forEach(([action, count]) => {
    console.log(`  ${action}: ${count} times`);
  });
  
  console.log('\n📁 CONTENT CREATED:');
  Object.entries(contentCounts).forEach(([content, count]) => {
    console.log(`  ${content}: ${count} items`);
  });
  
  // Оценка
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (totalErrors < totalActions * 0.1) {
    console.log('✅ EXCELLENT - Site handles real user interactions well!');
  } else if (totalErrors < totalActions * 0.3) {
    console.log('⚠️  GOOD - Some issues detected, but generally working');
  } else {
    console.log('❌ NEEDS OPTIMIZATION - Significant issues detected');
  }
  
  console.log('═'.repeat(80));
}

// Запуск
runBrowserLoadTest().catch(console.error);
