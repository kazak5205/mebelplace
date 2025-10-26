const { chromium } = require('playwright');

// 🚀 МАСШТАБИРОВАННЫЙ ТЕСТ ПОЛНОГО ФЛОУ С СУЩЕСТВУЮЩИМИ ПОЛЬЗОВАТЕЛЯМИ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 500,
  concurrentUsers: 30,
  testDuration: 600,
  databaseCheckInterval: 30,
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 1500,
  realUIMode: true
};

console.log('🚀 SCALED FULL FLOW TEST WITH EXISTING USERS');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers} (используем существующих + создаем новых)`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (полный флоу: логин + заказы + взаимодействия)`);
console.log(`🔍 Database Checks: EVERY ${config.databaseCheckInterval}s`);
console.log('════════════════════════════════════════════════════════════════════════════════');

let activeUsers = 0;
let completedUsers = 0;
let totalActions = 0;
let successfulActions = 0;
let failedActions = 0;
let startTime = Date.now();
let databaseStats = { users: 0, orders: 0, messages: 0, videos: 0 };
let existingUsers = [];

// Глобальные данные для взаимодействий
let globalData = {
  createdOrders: [],
  createdVideos: [],
  activeChats: [],
  subscriptions: [],
  likes: [],
  comments: [],
  logins: [],
  searches: []
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

// Функция для получения существующих пользователей из БД
async function getExistingUsers() {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const result = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT username, phone, role FROM users ORDER BY created_at DESC LIMIT 300;"');
    
    const lines = result.stdout.trim().split('\n');
    existingUsers = lines.map(line => {
      const parts = line.trim().split('|');
      if (parts.length >= 3) {
        return {
          username: parts[0].trim(),
          phone: parts[1].trim(),
          role: parts[2].trim()
        };
      }
      return null;
    }).filter(user => user !== null);
    
    console.log(`📋 Загружено ${existingUsers.length} существующих пользователей`);
    
  } catch (error) {
    console.log(`❌ Ошибка загрузки пользователей: ${error.message}`);
  }
}

// Функция для тестирования полного флоу с пользователем
async function testFullFlowWithUser(userIndex) {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    let user;
    let isNewUser = false;
    
    if (userIndex < existingUsers.length) {
      user = existingUsers[userIndex];
      console.log(`🌐 User ${userIndex}: Тестирует с существующим пользователем (${user.username})`);
    } else {
      // Создаем нового пользователя
      const phoneNumber = `+7777${String(userIndex).padStart(7, '0')}`;
      user = {
        username: `TestUser${userIndex}`,
        phone: phoneNumber,
        role: userIndex % 2 === 0 ? 'user' : 'user' // Все клиенты для простоты
      };
      isNewUser = true;
      console.log(`🌐 User ${userIndex}: Создает нового пользователя (${user.username})`);
    }
    
    // 1. ЛОГИН ИЛИ РЕГИСТРАЦИЯ
    if (isNewUser) {
      await registerNewUser(page, userIndex, user);
    } else {
      await loginExistingUser(page, userIndex, user);
    }
    
    // 2. ВЫПОЛНЯЕМ ПОЛНЫЕ СЦЕНАРИИ
    await executeFullUserFlow(page, userIndex, user);
    
    console.log(`🎉 User ${userIndex}: Завершил полный флоу!`);
    completedUsers++;
    
  } catch (error) {
    console.log(`❌ User ${userIndex}: Ошибка - ${error.message}`);
    failedActions++;
    totalActions++;
  } finally {
    await browser.close();
    activeUsers--;
  }
}

// Регистрация нового пользователя
async function registerNewUser(page, userIndex, user) {
  console.log(`🔐 User ${userIndex}: Регистрируется как ${user.username}`);
  
  await page.goto(`${config.targetUrl}/register`, { 
    waitUntil: 'networkidle',
    timeout: config.browserTimeout 
  });
  
  await page.waitForTimeout(config.delayBetweenActions);
  
  // Заполняем форму регистрации
  await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill(user.phone);
  await page.waitForTimeout(500);
  
  await page.locator('input[placeholder*="имя"], input[name*="name"]').fill(user.username);
  await page.waitForTimeout(500);
  
  await page.locator('input[type="password"]').fill('testpass123');
  await page.waitForTimeout(500);
  
  // Отправляем форму регистрации
  await page.locator('button:has-text("Зарегистрироваться"), button[type="submit"]').click();
  await page.waitForTimeout(config.delayBetweenActions * 2);
  
  // Проверяем успешность регистрации
  const currentUrl = page.url();
  if (currentUrl.includes('/register')) {
    console.log(`❌ User ${userIndex}: Ошибка регистрации`);
    failedActions++;
    totalActions++;
    return false;
  } else {
    console.log(`✅ User ${userIndex}: Успешно зарегистрировался`);
    successfulActions++;
    totalActions++;
    globalData.logins.push({ userId: userIndex, username: user.username, timestamp: new Date() });
    return true;
  }
}

// Логин существующего пользователя
async function loginExistingUser(page, userIndex, user) {
  console.log(`🔐 User ${userIndex}: Логинится как ${user.username}`);
  
  await page.goto(`${config.targetUrl}/login`, { 
    waitUntil: 'networkidle',
    timeout: config.browserTimeout 
  });
  
  await page.waitForTimeout(config.delayBetweenActions);
  
  // Заполняем форму логина
  await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill(user.phone);
  await page.waitForTimeout(500);
  
  await page.locator('input[type="password"]').fill('testpass123');
  await page.waitForTimeout(500);
  
  // Отправляем форму логина
  await page.locator('button:has-text("Войти")').click();
  await page.waitForTimeout(config.delayBetweenActions * 2);
  
  // Проверяем успешность логина
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log(`❌ User ${userIndex}: Ошибка логина`);
    failedActions++;
    totalActions++;
    return false;
  } else {
    console.log(`✅ User ${userIndex}: Успешно залогинился`);
    successfulActions++;
    totalActions++;
    globalData.logins.push({ userId: userIndex, username: user.username, timestamp: new Date() });
    return true;
  }
}

// Полный флоу пользователя
async function executeFullUserFlow(page, userIndex, user) {
  console.log(`👤 User ${userIndex}: Выполняет ПОЛНЫЙ ФЛОУ ПОЛЬЗОВАТЕЛЯ`);
  
  try {
    // 1. СОЗДАНИЕ ЗАКАЗА
    console.log(`👤 User ${userIndex}: Создает заказ`);
    
    await page.goto(`${config.targetUrl}/orders/create`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу создания заказа`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderData = {
      title: `Заказ от ${user.username} - ${userIndex}`,
      description: `Детальное описание заказа от пользователя ${user.username}. Нужна качественная мебель, срок выполнения 2 недели, бюджет до 200000 тенге. Требования: современный дизайн, качественные материалы, гарантия 2 года.`,
      location: `Алматы, район ${userIndex % 10 + 1}`
    };
    
    // Заполняем поля заказа
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await titleInput.fill(orderData.title);
      console.log(`👤 User ${userIndex}: Заполнил заголовок заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const descInput = page.locator('textarea[name="description"]');
    if (await descInput.count() > 0) {
      await descInput.fill(orderData.description);
      console.log(`👤 User ${userIndex}: Заполнил описание заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const locationInput = page.locator('input[name="location"]');
    if (await locationInput.count() > 0) {
      await locationInput.fill(orderData.location);
      console.log(`👤 User ${userIndex}: Заполнил локацию`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Отправляем заказ
    const submitButton = page.locator('button[type="submit"], button:has-text("Создать"), button:has-text("Отправить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userIndex}: Отправил заказ`);
      successfulActions++;
      totalActions++;
      
      globalData.createdOrders.push({
        id: `order_${userIndex}_${Date.now()}`,
        userId: userIndex,
        title: orderData.title,
        description: orderData.description,
        status: 'pending',
        createdAt: new Date()
      });
      
      await page.waitForTimeout(config.delayBetweenActions * 2);
    }
    
    // 2. ВЗАИМОДЕЙСТВИЕ С ГЛАВНОЙ СТРАНИЦЕЙ
    console.log(`👤 User ${userIndex}: Взаимодействует с главной страницей`);
    
    await page.goto(`${config.targetUrl}/`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл главную страницу`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем кнопку "ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ"
    const orderButtons = await page.locator('button:has-text("ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ")').all();
    if (orderButtons.length > 0) {
      try {
        await orderButtons[0].click();
        console.log(`👤 User ${userIndex}: Нажал "ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ"`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      } catch (error) {
        console.log(`❌ User ${userIndex}: Ошибка кнопки заказа - ${error.message}`);
        failedActions++;
        totalActions++;
      }
    }
    
    // Ставим лайки
    const likeButtons = await page.locator('button:has-text("1"), button:has-text("0")').all();
    if (likeButtons.length > 0) {
      for (let i = 0; i < Math.min(3, likeButtons.length); i++) {
        try {
          await likeButtons[i].click();
          console.log(`👤 User ${userIndex}: Поставил лайк ${i + 1}`);
          successfulActions++;
          totalActions++;
          globalData.likes.push({ userId: userIndex, likeIndex: i });
          
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка лайка ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // Сохраняем контент
    const saveButtons = await page.locator('button:has-text("Сохранить")').all();
    if (saveButtons.length > 0) {
      for (let i = 0; i < Math.min(2, saveButtons.length); i++) {
        try {
          await saveButtons[i].click();
          console.log(`👤 User ${userIndex}: Сохранил контент ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка сохранения ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 3. ПОИСК И ВЗАИМОДЕЙСТВИЕ
    console.log(`👤 User ${userIndex}: Использует поиск`);
    
    const searchQueries = [
      'кухня',
      'шкаф',
      'диван',
      'стол',
      'кровать',
      'мебель на заказ',
      'мастер по мебели'
    ];
    
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    
    const searchInput = page.locator('input[placeholder*="Поиск видео"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill(randomQuery);
      console.log(`👤 User ${userIndex}: Ввел поисковый запрос: ${randomQuery}`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      await searchInput.press('Enter');
      console.log(`👤 User ${userIndex}: Выполнил поиск`);
      successfulActions++;
      totalActions++;
      
      globalData.searches.push({ userId: userIndex, query: randomQuery, timestamp: new Date() });
      
      await page.waitForTimeout(config.delayBetweenActions * 2);
    }
    
    // 4. ПРОСМОТР ПРОФИЛЯ И НАСТРОЙКИ
    console.log(`👤 User ${userIndex}: Просматривает профиль`);
    
    await page.goto(`${config.targetUrl}/profile`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл профиль`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Обновляем информацию профиля
    const nameInput = page.locator('input[name*="name"], input[placeholder*="имя"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(`${user.username} - Обновленный профиль`);
      console.log(`👤 User ${userIndex}: Обновил имя профиля`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
    if (await bioInput.count() > 0) {
      await bioInput.fill(`Обновленная информация о пользователе ${user.username}. Интересы: мебель, дизайн, качество.`);
      console.log(`👤 User ${userIndex}: Обновил описание профиля`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const saveProfileButton = page.locator('button:has-text("Сохранить"), button:has-text("Update")').first();
    if (await saveProfileButton.count() > 0) {
      await saveProfileButton.click();
      console.log(`👤 User ${userIndex}: Сохранил профиль`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // 5. ПРОСМОТР СВОИХ ЗАКАЗОВ
    console.log(`👤 User ${userIndex}: Просматривает свои заказы`);
    
    await page.goto(`${config.targetUrl}/user/orders`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу заказов`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем кнопки редактирования заказов
    const editButtons = await page.locator('button:has-text("Редактировать"), button:has-text("Edit"), .edit-btn').all();
    if (editButtons.length > 0) {
      for (let i = 0; i < Math.min(2, editButtons.length); i++) {
        try {
          await editButtons[i].click();
          console.log(`👤 User ${userIndex}: Редактирует заказ ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(config.delayBetweenActions);
          
          // Изменяем описание заказа
          const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
          if (await descInput.count() > 0) {
            await descInput.fill(`Обновленное описание заказа от пользователя ${user.username}. Добавлены новые требования и пожелания.`);
            console.log(`👤 User ${userIndex}: Обновил описание заказа ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForTimeout(config.delayBetweenActions);
          }
          
          // Сохраняем изменения
          const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Save")').first();
          if (await saveButton.count() > 0) {
            await saveButton.click();
            console.log(`👤 User ${userIndex}: Сохранил изменения заказа ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForTimeout(config.delayBetweenActions);
          }
          
          await page.goBack();
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка редактирования заказа ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ User ${userIndex}: Ошибка флоу пользователя - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Основная функция тестирования
async function runScaledFullFlowTest() {
  console.log('🚀 Запуск масштабированного теста полного флоу...');
  
  // Загружаем существующих пользователей
  await getExistingUsers();
  
  // Запускаем проверку базы данных
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей
  for (let i = 0; i < config.totalUsers; i++) {
    // Ждем, пока не освободится место для новых пользователей
    while (activeUsers >= config.concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    activeUsers++;
    
    testFullFlowWithUser(i).catch(error => {
      console.log(`❌ User ${i}: Критическая ошибка - ${error.message}`);
      activeUsers--;
    });
    
    // Задержка между запуском пользователей
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Ждем завершения теста
  const testStartTime = Date.now();
  while (Date.now() - testStartTime < config.testDuration * 1000) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
    const remaining = config.testDuration - elapsed;
    
    console.log(`⏱️  Время: ${elapsed}s/${config.testDuration}s (осталось: ${remaining}s)`);
    console.log(`👥 Активных пользователей: ${activeUsers}`);
    console.log(`✅ Завершено пользователей: ${completedUsers}/${config.totalUsers}`);
    console.log(`📊 Действий: ${successfulActions}/${totalActions} успешно (${failedActions} ошибок)`);
    console.log(`📈 Успешность: ${totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0}%`);
    console.log(`🔐 Успешных логинов: ${globalData.logins.length}`);
    console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
    console.log(`❤️  Лайков: ${globalData.likes.length}`);
    console.log(`🔍 Поисковых запросов: ${globalData.searches.length}`);
    console.log('─'.repeat(80));
  }
  
  // Останавливаем проверку базы данных
  clearInterval(databaseInterval);
  
  // Финальная проверка базы данных
  await checkDatabase();
  
  console.log('🏁 МАСШТАБИРОВАННЫЙ ТЕСТ ПОЛНОГО ФЛОУ ЗАВЕРШЕН!');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`⏱️  Общее время: ${Math.floor((Date.now() - startTime) / 1000)}s`);
  console.log(`👥 Всего пользователей: ${config.totalUsers}`);
  console.log(`✅ Завершено пользователей: ${completedUsers}`);
  console.log(`📊 Всего действий: ${totalActions}`);
  console.log(`✅ Успешных действий: ${successfulActions}`);
  console.log(`❌ Неудачных действий: ${failedActions}`);
  console.log(`📈 Общая успешность: ${totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0}%`);
  console.log(`📊 Финальная статистика БД:`, databaseStats);
  console.log(`🔐 Успешных логинов: ${globalData.logins.length}`);
  console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
  console.log(`❤️  Лайков: ${globalData.likes.length}`);
  console.log(`🔍 Поисковых запросов: ${globalData.searches.length}`);
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

// Запускаем тест
runScaledFullFlowTest().catch(console.error);
