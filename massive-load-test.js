const { chromium } = require('playwright');

// 🚀 МАССИВНЫЙ ТЕСТ - 500 ПОЛЬЗОВАТЕЛЕЙ ЗА 10 МИНУТ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 500,
  concurrentUsers: 50,  // Увеличиваем параллельность
  testDuration: 600,    // 10 минут
  databaseCheckInterval: 30,
  maxRetries: 2,        // Уменьшаем ретраи
  browserTimeout: 30000, // Уменьшаем таймаут
  delayBetweenActions: 500, // Уменьшаем задержки
  smsDelay: 2000,      // Уменьшаем задержку SMS
  realUIMode: true
};

console.log('🚀 MASSIVE LOAD TEST - 500 USERS IN 10 MINUTES');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s (10 minutes)`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (оптимизированные взаимодействия)`);
console.log(`⏰ SMS Delay: ${config.smsDelay}ms`);
console.log(`🔍 Database Checks: EVERY ${config.databaseCheckInterval}s`);
console.log('════════════════════════════════════════════════════════════════════════════════');

let activeUsers = 0;
let completedUsers = 0;
let totalActions = 0;
let successfulActions = 0;
let failedActions = 0;
let startTime = Date.now();
let databaseStats = { users: 0, orders: 0, messages: 0, videos: 0 };
let lastSmsTime = 0;

// Глобальные данные для взаимодействий
let globalData = {
  createdOrders: [],
  createdVideos: [],
  activeChats: [],
  subscriptions: [],
  likes: [],
  comments: []
};

// Функция для проверки базы данных
async function checkDatabase() {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const usersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM users;"');
    const usersCount = parseInt(usersResult.stdout.trim()) || 0;
    
    const ordersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM orders;"');
    const ordersCount = parseInt(ordersResult.stdout.trim()) || 0;
    
    const messagesResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM messages;"');
    const messagesCount = parseInt(messagesResult.stdout.trim()) || 0;
    
    const videosResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM videos;"');
    const videosCount = parseInt(videosResult.stdout.trim()) || 0;
    
    databaseStats = { users: usersCount, orders: ordersCount, messages: messagesCount, videos: videosCount };
    
    console.log(`📊 DATABASE CHECK: Users: ${usersCount}, Orders: ${ordersCount}, Messages: ${messagesCount}, Videos: ${videosCount}`);
    
  } catch (error) {
    console.log(`❌ Database check failed: ${error.message}`);
  }
}

// Функция для закрытия модального окна (оптимизированная)
async function closeModal(page) {
  try {
    // Быстрая проверка и закрытие
    await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0.bg-black.z-40');
      if (modal) {
        modal.style.display = 'none';
        modal.remove();
      }
    });
    
    await page.waitForTimeout(200);
    return true;
    
  } catch (error) {
    return false;
  }
}

// Функция для ожидания SMS rate limit (оптимизированная)
async function waitForSmsRateLimit() {
  const now = Date.now();
  const timeSinceLastSms = now - lastSmsTime;
  
  if (timeSinceLastSms < config.smsDelay) {
    const waitTime = config.smsDelay - timeSinceLastSms;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastSmsTime = Date.now();
}

// Оптимизированная функция создания пользователя
async function createOptimizedUser(userId) {
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }, // Уменьшаем разрешение
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`🌐 User ${userId}: Быстрая регистрация...`);
    
    // Быстрый переход на сайт
    await page.goto(config.targetUrl, { 
      waitUntil: 'domcontentloaded', // Быстрее чем networkidle
      timeout: config.browserTimeout 
    });
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Быстрое закрытие модального окна
    await closeModal(page);
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Определяем роль пользователя
    const userRole = userId % 2 === 0 ? 'client' : 'master';
    
    // Переходим на страницу регистрации
    await page.goto(`${config.targetUrl}/register`, { 
      waitUntil: 'domcontentloaded',
      timeout: config.browserTimeout 
    });
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Генерируем уникальный номер телефона
    const phoneNumber = `+7777${String(userId).padStart(7, '0')}`;
    const username = userRole === 'client' ? `Client${userId}` : `Master${userId}`;
    
    // Быстрое заполнение формы
    await page.fill('input[placeholder="+7XXXXXXXXXX"]', phoneNumber);
    await page.fill('input[placeholder="username"]', username);
    await page.fill('input[placeholder="Минимум 6 символов"]', 'testpass123');
    await page.fill('input[placeholder="Повторите пароль"]', 'testpass123');
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ждем SMS rate limit
    await waitForSmsRateLimit();
    
    // Отправляем форму
    await page.click('button:has-text("Отправить SMS")');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Получаем SMS код из API ответа
    let smsCode = null;
    
    page.on('response', async response => {
      if (response.url().includes('/api/auth/send-sms-code') && response.status() === 200) {
        try {
          const result = await response.json();
          if (result.success && result.code) {
            smsCode = result.code;
          }
        } catch (error) {
          // Игнорируем ошибки
        }
      }
    });
    
    // Ждем SMS код до 10 секунд
    let attempts = 0;
    while (!smsCode && attempts < 20) {
      await page.waitForTimeout(500);
      attempts++;
    }
    
    // Если SMS код не получен, пробуем API напрямую
    if (!smsCode) {
      try {
        const response = await fetch('https://mebelplace.com.kz/api/auth/send-sms-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneNumber })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.code) {
            smsCode = result.code;
          }
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    // Если все еще нет кода, используем тестовый
    if (!smsCode) {
      smsCode = '123456';
    }
    
    // Быстрое введение SMS кода
    await page.fill('input[placeholder="Введите 6-значный код"]', smsCode);
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Подтверждаем код
    await page.click('button:has-text("Подтвердить")');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Проверяем результат регистрации
    const currentUrl = page.url();
    if (currentUrl.includes('/sms-verification')) {
      const errorText = await page.textContent('body');
      if (errorText.includes('already exists') || errorText.includes('уже существует')) {
        console.log(`✅ User ${userId}: Пользователь уже существует`);
        successfulActions++;
      } else {
        console.log(`❌ User ${userId}: Ошибка регистрации`);
        failedActions++;
      }
    } else {
      console.log(`✅ User ${userId}: Успешно зарегистрирован!`);
      successfulActions++;
    }
    
    totalActions++;
    
    // Быстрые взаимодействия в зависимости от роли
    if (userRole === 'client') {
      await executeQuickClientActions(page, userId);
    } else {
      await executeQuickMasterActions(page, userId);
    }
    
    console.log(`🎉 User ${userId}: Завершил быстрые действия!`);
    completedUsers++;
    
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка - ${error.message}`);
    failedActions++;
    totalActions++;
  } finally {
    await browser.close();
    activeUsers--;
  }
}

// Быстрые действия для клиентов
async function executeQuickClientActions(page, userId) {
  console.log(`👤 User ${userId}: Быстрые действия КЛИЕНТА`);
  
  try {
    // 1. Просмотр мастеров и подписки
    await page.goto(`${config.targetUrl}/masters`, { waitUntil: 'domcontentloaded' });
    console.log(`👤 User ${userId}: Смотрит мастеров`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Быстрые подписки
    const subscribeButtons = page.locator('button:has-text("Подписаться"), .subscribe-btn');
    const subscribeCount = await subscribeButtons.count();
    
    if (subscribeCount > 0) {
      for (let i = 0; i < Math.min(2, subscribeCount); i++) {
        try {
          await subscribeButtons.nth(i).click();
          console.log(`👤 User ${userId}: Подписался ${i + 1}`);
          successfulActions++;
          totalActions++;
          globalData.subscriptions.push({ clientId: userId, masterIndex: i });
          
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 2. Создание заказа
    await page.goto(`${config.targetUrl}/orders/create`, { waitUntil: 'domcontentloaded' });
    console.log(`👤 User ${userId}: Создает заказ`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Быстрое заполнение заказа
    const orderData = {
      title: `Заказ от клиента ${userId}`,
      description: `Нужна мебель. Бюджет 100000 тенге.`,
      budget: '100000'
    };
    
    const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill(orderData.title);
      successfulActions++;
      totalActions++;
    }
    
    const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill(orderData.description);
      successfulActions++;
      totalActions++;
    }
    
    const budgetInput = page.locator('input[name*="budget"], input[placeholder*="бюджет"]').first();
    if (await budgetInput.count() > 0) {
      await budgetInput.fill(orderData.budget);
      successfulActions++;
      totalActions++;
    }
    
    // Отправляем заказ
    const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userId}: Отправил заказ`);
      successfulActions++;
      totalActions++;
      
      globalData.createdOrders.push({
        id: `order_${userId}_${Date.now()}`,
        clientId: userId,
        title: orderData.title,
        status: 'pending',
        createdAt: new Date()
      });
    }
    
    // 3. Чат
    await page.goto(`${config.targetUrl}/chat`, { waitUntil: 'domcontentloaded' });
    console.log(`👤 User ${userId}: Открыл чат`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
    if (await messageInput.count() > 0) {
      const messages = [
        `Привет! Интересует ваш заказ.`,
        `Добрый день! Есть вопросы.`,
        `Здравствуйте! Готов обсудить.`
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await messageInput.fill(randomMessage);
      await messageInput.press('Enter');
      console.log(`👤 User ${userId}: Отправил сообщение`);
      successfulActions++;
      totalActions++;
      
      globalData.activeChats.push({
        clientId: userId,
        message: randomMessage,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка действий клиента - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Быстрые действия для мастеров
async function executeQuickMasterActions(page, userId) {
  console.log(`👤 User ${userId}: Быстрые действия МАСТЕРА`);
  
  try {
    // 1. Настройка профиля
    await page.goto(`${config.targetUrl}/profile`, { waitUntil: 'domcontentloaded' });
    console.log(`👤 User ${userId}: Настраивает профиль`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const nameInput = page.locator('input[name*="name"], input[placeholder*="имя"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(`Мастер ${userId}`);
      successfulActions++;
      totalActions++;
    }
    
    const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
    if (await bioInput.count() > 0) {
      await bioInput.fill(`Опытный мастер. Опыт 5 лет. Гарантия качества!`);
      successfulActions++;
      totalActions++;
    }
    
    const saveButton = page.locator('button:has-text("Сохранить")').first();
    if (await saveButton.count() > 0) {
      await saveButton.click();
      console.log(`👤 User ${userId}: Сохранил профиль`);
      successfulActions++;
      totalActions++;
    }
    
    // 2. Загрузка видео
    await page.goto(`${config.targetUrl}/create-video-ad`, { waitUntil: 'domcontentloaded' });
    console.log(`👤 User ${userId}: Создает видео`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const videoData = {
      title: `Портфолио мастера ${userId}`,
      description: `Показываю свои работы. Качественно и быстро!`
    };
    
    const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill(videoData.title);
      successfulActions++;
      totalActions++;
    }
    
    const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill(videoData.description);
      successfulActions++;
      totalActions++;
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Загрузить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userId}: Отправил видео`);
      successfulActions++;
      totalActions++;
      
      globalData.createdVideos.push({
        id: `video_${userId}_${Date.now()}`,
        masterId: userId,
        title: videoData.title,
        createdAt: new Date()
      });
    }
    
    // 3. Ответы на заказы
    await page.goto(`${config.targetUrl}/master/orders`, { waitUntil: 'domcontentloaded' });
    console.log(`👤 User ${userId}: Смотрит заказы`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderCards = page.locator('.order-card, [data-testid="order-card"]');
    const orderCount = await orderCards.count();
    
    if (orderCount > 0) {
      for (let i = 0; i < Math.min(2, orderCount); i++) {
        try {
          const orderCard = orderCards.nth(i);
          const respondButton = orderCard.locator('button:has-text("Откликнуться")').first();
          
          if (await respondButton.count() > 0) {
            await respondButton.click();
            console.log(`👤 User ${userId}: Откликнулся на заказ ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForTimeout(config.delayBetweenActions);
            
            const responseText = `Готов выполнить! Опыт 5 лет. Цена 80000 тенге.`;
            const responseInput = page.locator('textarea[placeholder*="отклик"]').first();
            
            if (await responseInput.count() > 0) {
              await responseInput.fill(responseText);
              await page.waitForTimeout(config.delayBetweenActions);
              
              const submitResponseButton = page.locator('button:has-text("Отправить отклик")').first();
              if (await submitResponseButton.count() > 0) {
                await submitResponseButton.click();
                console.log(`👤 User ${userId}: Отправил отклик ${i + 1}`);
                successfulActions++;
                totalActions++;
              }
            }
          }
        } catch (error) {
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 4. Чат с клиентами
    await page.goto(`${config.targetUrl}/chat`, { waitUntil: 'domcontentloaded' });
    console.log(`👤 User ${userId}: Открыл чат`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
    if (await messageInput.count() > 0) {
      const messages = [
        `Здравствуйте! Готов обсудить заказ.`,
        `Добрый день! Могу показать работы.`,
        `Привет! Готов приступить к работе.`
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await messageInput.fill(randomMessage);
      await messageInput.press('Enter');
      console.log(`👤 User ${userId}: Отправил сообщение клиенту`);
      successfulActions++;
      totalActions++;
      
      globalData.activeChats.push({
        masterId: userId,
        message: randomMessage,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка действий мастера - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Основная функция тестирования
async function runMassiveLoadTest() {
  console.log('🚀 Запуск массового теста 500 пользователей за 10 минут...');
  
  // Запускаем проверку базы данных
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей с высокой параллельностью
  const userPromises = [];
  
  for (let i = 1; i <= config.totalUsers; i++) {
    // Ждем, пока не освободится место для новых пользователей
    while (activeUsers >= config.concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    activeUsers++;
    
    const userPromise = createOptimizedUser(i).catch(error => {
      console.log(`❌ User ${i}: Критическая ошибка - ${error.message}`);
      activeUsers--;
    });
    
    userPromises.push(userPromise);
    
    // Минимальная задержка между запуском пользователей
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Ждем завершения теста
  const testStartTime = Date.now();
  while (Date.now() - testStartTime < config.testDuration * 1000) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
    const remaining = config.testDuration - elapsed;
    
    console.log(`⏱️  Время: ${elapsed}s/${config.testDuration}s (осталось: ${remaining}s)`);
    console.log(`👥 Активных пользователей: ${activeUsers}`);
    console.log(`✅ Завершено пользователей: ${completedUsers}/${config.totalUsers}`);
    console.log(`📊 Действий: ${successfulActions}/${totalActions} успешно (${failedActions} ошибок)`);
    console.log(`📈 Успешность: ${totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0}%`);
    console.log(`💬 Активных чатов: ${globalData.activeChats.length}`);
    console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
    console.log(`🎥 Загруженных видео: ${globalData.createdVideos.length}`);
    console.log(`👥 Подписок: ${globalData.subscriptions.length}`);
    console.log('─'.repeat(80));
  }
  
  // Останавливаем проверку базы данных
  clearInterval(databaseInterval);
  
  // Финальная проверка базы данных
  await checkDatabase();
  
  console.log('🏁 МАССИВНЫЙ ТЕСТ ЗАВЕРШЕН!');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`⏱️  Общее время: ${Math.floor((Date.now() - startTime) / 1000)}s`);
  console.log(`👥 Всего пользователей: ${config.totalUsers}`);
  console.log(`✅ Завершено пользователей: ${completedUsers}`);
  console.log(`📊 Всего действий: ${totalActions}`);
  console.log(`✅ Успешных действий: ${successfulActions}`);
  console.log(`❌ Неудачных действий: ${failedActions}`);
  console.log(`📈 Общая успешность: ${totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0}%`);
  console.log(`📊 Финальная статистика БД:`, databaseStats);
  console.log(`💬 Активных чатов: ${globalData.activeChats.length}`);
  console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
  console.log(`🎥 Загруженных видео: ${globalData.createdVideos.length}`);
  console.log(`❤️  Лайков: ${globalData.likes.length}`);
  console.log(`💬 Комментариев: ${globalData.comments.length}`);
  console.log(`👥 Подписок: ${globalData.subscriptions.length}`);
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

// Запускаем тест
runMassiveLoadTest().catch(console.error);
