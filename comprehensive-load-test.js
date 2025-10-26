#!/usr/bin/env node

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');

// Конфигурация
const CONFIG = {
  target: 'https://mebelplace.com.kz',
  totalUsers: 30,
  concurrentUsers: 5,
  testDuration: 600 // 10 минут
};

// Статистика
const stats = {
  users: [],
  totalRequests: 0,
  totalErrors: 0,
  startTime: Date.now()
};

// Создание тестовых файлов
const createTestFiles = () => {
  const fs = require('fs');
  const path = require('path');
  
  const testVideoPath = path.join(__dirname, 'test-video.mp4');
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  if (!fs.existsSync(testVideoPath)) {
    fs.writeFileSync(testVideoPath, 'fake video content for testing');
  }
  if (!fs.existsSync(testImagePath)) {
    fs.writeFileSync(testImagePath, 'fake image content for testing');
  }
  
  return { testVideoPath, testImagePath };
};

// ПОЛНЫЙ СЦЕНАРИЙ ПОЛЬЗОВАТЕЛЯ
async function simulateCompleteUserJourney(userId) {
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
    uploadedContent: [],
    role: null
  };
  
  const { testVideoPath, testImagePath } = createTestFiles();
  
  try {
    console.log(`🌐 User ${userId}: Starting complete journey...`);
    
    // 1. ЗАХОД НА САЙТ И РЕГИСТРАЦИЯ
    await page.goto(CONFIG.target, { waitUntil: 'networkidle' });
    userStats.actions.push('visited_homepage');
    
    // Регистрация
    await page.click('text=Регистрация');
    await page.waitForLoadState('networkidle');
    
    const phone = `+7778${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    const username = `testuser${userId}`;
    const password = 'testpass123';
    const isMaster = Math.random() > 0.6; // 40% мастеров, 60% клиентов
    userStats.role = isMaster ? 'master' : 'client';
    
    // Заполняем форму регистрации
    try {
      await page.selectOption('select', isMaster ? 'master' : 'client');
      await page.fill('input[placeholder*="+7"]', phone);
      await page.fill('input[placeholder*="username"]', username);
      await page.fill('input[placeholder*="пароль"]', password);
      await page.fill('input[placeholder*="Повторите"]', password);
      
      userStats.actions.push('filled_registration_form');
      console.log(`👤 User ${userId}: Filled registration (${userStats.role})`);
      
      await page.click('button:has-text("Отправить SMS")');
      await page.waitForTimeout(2000);
      userStats.actions.push('submitted_registration');
      
    } catch (error) {
      userStats.errors.push(`Registration failed: ${error.message}`);
      console.log(`❌ User ${userId}: Registration failed - ${error.message}`);
    }
    
    // 2. ВХОД В СИСТЕМУ
    try {
      await page.click('text=Войти');
      await page.waitForLoadState('networkidle');
      await page.fill('input[placeholder*="+7"]', phone);
      await page.fill('input[type="password"]', password);
      await page.click('button:has-text("Войти")');
      await page.waitForTimeout(3000);
      userStats.actions.push('attempted_login');
      console.log(`👤 User ${userId}: Attempted login`);
    } catch (error) {
      userStats.errors.push(`Login failed: ${error.message}`);
    }
    
    // 3. ПРОСМОТР ВИДЕО (TikTok-стиль)
    try {
      await page.goto(CONFIG.target, { waitUntil: 'networkidle' });
      
      // Ищем видео
      const videos = await page.locator('video').count();
      if (videos > 0) {
        await page.locator('video').first().click();
        await page.waitForTimeout(2000);
        userStats.actions.push('watched_video');
        console.log(`👤 User ${userId}: Watched video`);
        
        // Лайк
        try {
          const likeButton = page.locator('button').filter({ hasText: /лайк|❤|heart/i }).first();
          if (await likeButton.count() > 0) {
            await likeButton.click();
            userStats.actions.push('liked_video');
          }
        } catch (e) {}
      }
    } catch (error) {
      console.log(`👤 User ${userId}: Video watching failed - ${error.message}`);
    }
    
    // 4. ПОИСК И НАВИГАЦИЯ
    try {
      const searchInput = page.locator('input[placeholder*="Поиск"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('мебель кухня');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        userStats.actions.push('searched_furniture');
        console.log(`👤 User ${userId}: Searched for furniture`);
      }
    } catch (error) {
      console.log(`👤 User ${userId}: Search failed - ${error.message}`);
    }
    
    // 5. ПОЛНЫЙ СЦЕНАРИЙ ДЛЯ КЛИЕНТОВ
    if (!isMaster) {
      console.log(`👤 User ${userId}: Starting CLIENT scenario...`);
      
      // 5.1 ПРОСМОТР КАТАЛОГА МАСТЕРОВ
      try {
        await page.goto(`${CONFIG.target}/masters`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_masters_catalog');
        console.log(`👤 User ${userId}: Viewed masters catalog`);
        
        // Кликаем на профиль мастера
        const masterProfile = page.locator('a[href*="/master/"], .master-card').first();
        if (await masterProfile.count() > 0) {
          await masterProfile.click();
          await page.waitForLoadState('networkidle');
          userStats.actions.push('viewed_master_profile');
          console.log(`👤 User ${userId}: Viewed master profile`);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Masters catalog failed - ${error.message}`);
      }
      
      // 5.2 СОЗДАНИЕ ДЕТАЛЬНОГО ЗАКАЗА
      try {
        await page.goto(`${CONFIG.target}/orders/create`, { waitUntil: 'networkidle' });
        
        const orderData = {
          title: `Заказ кухни от клиента ${userId}`,
          description: `Нужна кухня 3 метра, цвет белый, материал МДФ, бюджет 150000 тенге. Срок до 1 декабря 2025 года.`,
          category: 'kitchen',
          region: 'Алматы',
          budget: '150000'
        };
        
        // Заполняем все поля заказа
        const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill(orderData.title);
        }
        
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
        if (await descInput.count() > 0) {
          await descInput.fill(orderData.description);
        }
        
        // Выбираем категорию
        const categorySelect = page.locator('select[name*="category"]').first();
        if (await categorySelect.count() > 0) {
          await categorySelect.selectOption('kitchen');
        }
        
        // Выбираем регион
        const regionSelect = page.locator('select[name*="region"]').first();
        if (await regionSelect.count() > 0) {
          await regionSelect.selectOption('Алматы');
        }
        
        // Бюджет
        const budgetInput = page.locator('input[name*="budget"], input[placeholder*="бюджет"]').first();
        if (await budgetInput.count() > 0) {
          await budgetInput.fill(orderData.budget);
        }
        
        userStats.actions.push('filled_detailed_order_form');
        console.log(`👤 User ${userId}: Filled detailed order form`);
        
        // Загружаем фото заказа
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(testImagePath);
          userStats.actions.push('uploaded_order_photo');
          userStats.uploadedContent.push('order_photo');
          console.log(`👤 User ${userId}: Uploaded order photo`);
        }
        
        // Отправляем заказ
        const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          userStats.actions.push('submitted_detailed_order');
          userStats.uploadedContent.push('order_created');
          console.log(`👤 User ${userId}: Created detailed order`);
        }
      } catch (error) {
        userStats.errors.push(`Order creation failed: ${error.message}`);
        console.log(`❌ User ${userId}: Order creation failed - ${error.message}`);
      }
      
      // 5.3 ПРОСМОТР СВОИХ ЗАКАЗОВ
      try {
        await page.goto(`${CONFIG.target}/user/orders`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_my_orders');
        console.log(`👤 User ${userId}: Viewed my orders`);
      } catch (error) {
        console.log(`👤 User ${userId}: My orders failed - ${error.message}`);
      }
      
      // 5.4 ЧАТ С МАСТЕРАМИ
      try {
        await page.goto(`${CONFIG.target}/chat`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_chat');
        console.log(`👤 User ${userId}: Accessed chat`);
        
        // Отправляем сообщение
        const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
        if (await messageInput.count() > 0) {
          await messageInput.fill(`Привет! Интересует ваш заказ. Могу обсудить детали?`);
          await messageInput.press('Enter');
          userStats.actions.push('sent_chat_message');
          console.log(`👤 User ${userId}: Sent chat message`);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Chat failed - ${error.message}`);
      }
      
      // 5.5 ПРОСМОТР УВЕДОМЛЕНИЙ
      try {
        await page.goto(`${CONFIG.target}/notifications`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_notifications');
        console.log(`👤 User ${userId}: Viewed notifications`);
      } catch (error) {
        console.log(`👤 User ${userId}: Notifications failed - ${error.message}`);
      }
    }
    
    // 6. ПОЛНЫЙ СЦЕНАРИЙ ДЛЯ МАСТЕРОВ
    if (isMaster) {
      console.log(`👤 User ${userId}: Starting MASTER scenario...`);
      
      // 6.1 НАСТРОЙКА ПРОФИЛЯ МАСТЕРА
      try {
        await page.goto(`${CONFIG.target}/profile`, { waitUntil: 'networkidle' });
        
        // Заполняем профиль мастера
        const nameInput = page.locator('input[name*="name"], input[placeholder*="имя"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill(`Мастер ${userId}`);
        }
        
        const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
        if (await bioInput.count() > 0) {
          await bioInput.fill(`Опытный мастер по изготовлению мебели. Специализируюсь на кухнях и шкафах. Работаю с МДФ, массивом дерева.`);
        }
        
        // Загружаем аватар
        const avatarInput = page.locator('input[type="file"]').first();
        if (await avatarInput.count() > 0) {
          await avatarInput.setInputFiles(testImagePath);
          userStats.actions.push('uploaded_avatar');
          userStats.uploadedContent.push('master_avatar');
        }
        
        userStats.actions.push('updated_master_profile');
        console.log(`👤 User ${userId}: Updated master profile`);
      } catch (error) {
        console.log(`👤 User ${userId}: Profile update failed - ${error.message}`);
      }
      
      // 6.2 ЗАГРУЗКА ПОРТФОЛИО ВИДЕО
      try {
        await page.goto(`${CONFIG.target}/create-video-ad`, { waitUntil: 'networkidle' });
        
        const videoData = {
          title: `Портфолио мастера ${userId} - Кухня из МДФ`,
          description: `Показываю процесс изготовления кухни из МДФ. Полный цикл от замеров до установки.`,
          category: 'kitchen'
        };
        
        // Заполняем форму видео
        const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill(videoData.title);
        }
        
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
        if (await descInput.count() > 0) {
          await descInput.fill(videoData.description);
        }
        
        // Выбираем категорию
        const categorySelect = page.locator('select[name*="category"]').first();
        if (await categorySelect.count() > 0) {
          await categorySelect.selectOption('kitchen');
        }
        
        // Загружаем видео
        const videoInput = page.locator('input[type="file"][accept*="video"]').first();
        if (await videoInput.count() > 0) {
          await videoInput.setInputFiles(testVideoPath);
          userStats.actions.push('selected_video_file');
          console.log(`👤 User ${userId}: Selected video file`);
        }
        
        userStats.actions.push('filled_video_form');
        console.log(`👤 User ${userId}: Filled video form`);
        
        // Отправляем видео
        const submitButton = page.locator('button[type="submit"], button:has-text("Загрузить")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(5000);
          userStats.actions.push('submitted_video');
          userStats.uploadedContent.push('video_uploaded');
          console.log(`👤 User ${userId}: Uploaded portfolio video`);
        }
      } catch (error) {
        userStats.errors.push(`Video upload failed: ${error.message}`);
        console.log(`❌ User ${userId}: Video upload failed - ${error.message}`);
      }
      
      // 6.3 ПРОСМОТР ЗАКАЗОВ КЛИЕНТОВ
      try {
        await page.goto(`${CONFIG.target}/master/orders`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_client_orders');
        console.log(`👤 User ${userId}: Viewed client orders`);
        
        // Откликаемся на заказ
        const respondButton = page.locator('button:has-text("Откликнуться"), button:has-text("Respond")').first();
        if (await respondButton.count() > 0) {
          await respondButton.click();
          await page.waitForLoadState('networkidle');
          
          // Заполняем отклик
          const responseText = `Готов выполнить ваш заказ! Опыт 5 лет, качественные материалы. Срок 2 недели.`;
          const responseInput = page.locator('textarea[placeholder*="отклик"], textarea[placeholder*="предложение"]').first();
          if (await responseInput.count() > 0) {
            await responseInput.fill(responseText);
          }
          
          // Отправляем отклик
          const submitResponseButton = page.locator('button:has-text("Отправить отклик")').first();
          if (await submitResponseButton.count() > 0) {
            await submitResponseButton.click();
            userStats.actions.push('responded_to_order');
            userStats.uploadedContent.push('order_response');
            console.log(`👤 User ${userId}: Responded to order`);
          }
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Order response failed - ${error.message}`);
      }
      
      // 6.4 ЧАТ С КЛИЕНТАМИ
      try {
        await page.goto(`${CONFIG.target}/chat`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_master_chat');
        console.log(`👤 User ${userId}: Accessed master chat`);
        
        // Отправляем сообщение клиенту
        const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
        if (await messageInput.count() > 0) {
          await messageInput.fill(`Здравствуйте! Готов обсудить ваш заказ. Могу показать примеры работ.`);
          await messageInput.press('Enter');
          userStats.actions.push('sent_master_message');
          console.log(`👤 User ${userId}: Sent master message`);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Master chat failed - ${error.message}`);
      }
      
      // 6.5 ПРОСМОТР СТАТИСТИКИ
      try {
        await page.goto(`${CONFIG.target}/master/analytics`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_analytics');
        console.log(`👤 User ${userId}: Viewed analytics`);
      } catch (error) {
        console.log(`👤 User ${userId}: Analytics failed - ${error.message}`);
      }
    }
    
    // 7. ОБЩИЕ ДЕЙСТВИЯ ДЛЯ ВСЕХ
    try {
      // Просмотр уведомлений
      await page.goto(`${CONFIG.target}/notifications`, { waitUntil: 'networkidle' });
      userStats.actions.push('viewed_notifications');
      console.log(`👤 User ${userId}: Viewed notifications`);
    } catch (error) {
      console.log(`👤 User ${userId}: Notifications failed - ${error.message}`);
    }
    
    userStats.endTime = Date.now();
    userStats.duration = userStats.endTime - userStats.startTime;
    
    console.log(`✅ User ${userId}: Completed ${userStats.role} journey in ${userStats.duration}ms`);
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

// Запуск полного теста
async function runComprehensiveLoadTest() {
  console.log('🚀 STARTING COMPREHENSIVE LOAD TEST FOR MEBELPLACE');
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
    const delay = i * 10000; // 10 секунд между пользователями
    
    setTimeout(async () => {
      const user = await simulateCompleteUserJourney(i + 1);
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
  
  // Статистика по ролям
  const clients = users.filter(u => u.role === 'client');
  const masters = users.filter(u => u.role === 'master');
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 COMPREHENSIVE LOAD TEST RESULTS');
  console.log('═'.repeat(80));
  console.log(`⏱️  Test Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`👥 Total Users: ${stats.users.length}`);
  console.log(`👤 Clients: ${clients.length}`);
  console.log(`🔨 Masters: ${masters.length}`);
  console.log(`🎬 Total Actions: ${totalActions}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`📁 Content Created: ${totalContent}`);
  console.log(`📊 Avg User Duration: ${avgDuration.toFixed(2)}ms`);
  
  // Детальная статистика
  const actionCounts = {};
  const contentCounts = {};
  const roleStats = { client: { actions: 0, content: 0 }, master: { actions: 0, content: 0 } };
  
  users.forEach(user => {
    user.actions.forEach(action => {
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    user.uploadedContent.forEach(content => {
      contentCounts[content] = (contentCounts[content] || 0) + 1;
    });
    
    if (user.role) {
      roleStats[user.role].actions += user.actions.length;
      roleStats[user.role].content += user.uploadedContent.length;
    }
  });
  
  console.log('\n📋 ACTION BREAKDOWN:');
  Object.entries(actionCounts).forEach(([action, count]) => {
    console.log(`  ${action}: ${count} times`);
  });
  
  console.log('\n📁 CONTENT CREATED:');
  Object.entries(contentCounts).forEach(([content, count]) => {
    console.log(`  ${content}: ${count} items`);
  });
  
  console.log('\n👥 ROLE STATISTICS:');
  console.log(`  Clients: ${roleStats.client.actions} actions, ${roleStats.client.content} content`);
  console.log(`  Masters: ${roleStats.master.actions} actions, ${roleStats.master.content} content`);
  
  // Оценка
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (totalErrors < totalActions * 0.1) {
    console.log('✅ EXCELLENT - Site handles all user scenarios perfectly!');
  } else if (totalErrors < totalActions * 0.3) {
    console.log('⚠️  GOOD - Some issues detected, but generally working');
  } else {
    console.log('❌ NEEDS OPTIMIZATION - Significant issues detected');
  }
  
  console.log('═'.repeat(80));
}

// Запуск
runComprehensiveLoadTest().catch(console.error);
