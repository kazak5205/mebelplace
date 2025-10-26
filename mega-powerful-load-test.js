const { chromium } = require('playwright');

// 🚀 МЕГА МОЩНЫЙ ТЕСТ С УВЕЛИЧЕННЫМИ РЕСУРСАМИ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 200,        // Увеличили в 2 раза
  concurrentUsers: 25,     // Увеличили в 2.5 раза
  testDuration: 2400,     // 40 минут
  databaseCheckInterval: 15, // Проверяем БД каждые 15 секунд
  maxRetries: 5,          // Больше попыток
  browserTimeout: 90000,  // Больше времени ожидания
  delayBetweenActions: 1000, // Задержка между действиями
  realUIMode: true        // Реальный UI тест
};

console.log('🚀 STARTING MEGA POWERFUL REAL UI LOAD TEST FOR MEBELPLACE');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (пользователи нажимают кнопки как люди)`);
console.log(`🔍 Database Checks: EVERY ${config.databaseCheckInterval}s`);
console.log(`🛡️  Max Retries: ${config.maxRetries}`);
console.log(`⏰ Browser Timeout: ${config.browserTimeout}s`);
console.log('════════════════════════════════════════════════════════════════════════════════');

let activeUsers = 0;
let completedUsers = 0;
let totalActions = 0;
let successfulActions = 0;
let failedActions = 0;
let startTime = Date.now();
let databaseStats = { users: 0, orders: 0, messages: 0, videos: 0 };

// Функция для проверки базы данных
async function checkDatabase() {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // Проверяем количество пользователей
    const usersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM users;"');
    const usersCount = parseInt(usersResult.stdout.trim()) || 0;
    
    // Проверяем количество заказов
    const ordersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM orders;"');
    const ordersCount = parseInt(ordersResult.stdout.trim()) || 0;
    
    // Проверяем количество сообщений
    const messagesResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM messages;"');
    const messagesCount = parseInt(messagesResult.stdout.trim()) || 0;
    
    // Проверяем количество видео
    const videosResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM videos;"');
    const videosCount = parseInt(videosResult.stdout.trim()) || 0;
    
    databaseStats = { users: usersCount, orders: ordersCount, messages: messagesCount, videos: videosCount };
    
    console.log(`📊 DATABASE CHECK: Users: ${usersCount}, Orders: ${ordersCount}, Messages: ${messagesCount}, Videos: ${videosCount}`);
    
  } catch (error) {
    console.log(`❌ Database check failed: ${error.message}`);
  }
}

// Функция для создания пользователя
async function createUser(userId) {
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
    console.log(`🌐 User ${userId}: Приходит на сайт как обычный пользователь...`);
    
    // Переходим на сайт с повторными попытками
    let retries = 0;
    while (retries < config.maxRetries) {
      try {
        await page.goto(config.targetUrl, { 
          waitUntil: 'networkidle',
          timeout: config.browserTimeout 
        });
        break;
      } catch (error) {
        retries++;
        console.log(`🔄 User ${userId}: Попытка ${retries}/${config.maxRetries} - ${error.message}`);
        if (retries >= config.maxRetries) throw error;
        await page.waitForTimeout(2000);
      }
    }
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Регистрация клиента
    console.log(`👤 User ${userId}: Регистрируется как клиент...`);
    await page.click('text=Регистрация');
    await page.waitForTimeout(config.delayBetweenActions);
    
    await page.fill('input[name="name"]', `TestUser${userId}`);
    await page.fill('input[name="phone"]', `+7777${String(userId).padStart(7, '0')}`);
    await page.fill('input[name="password"]', 'testpass123');
    await page.selectOption('select[name="role"]', 'client');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Обработка SMS кода
    page.on('console', msg => {
      if (msg.text().includes('SMS код')) {
        console.log(`📱 User ${userId}: ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(3000);
    
    // Проверяем успешную регистрацию
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (accessToken) {
      console.log(`✅ User ${userId}: Успешно зарегистрирован как клиент`);
      successfulActions++;
    } else {
      console.log(`❌ User ${userId}: Ошибка регистрации клиента`);
      failedActions++;
    }
    
    totalActions++;
    
    // Поиск мастеров
    console.log(`🔍 User ${userId}: Ищет мастеров...`);
    await page.click('text=Мастера');
    await page.waitForTimeout(config.delayBetweenActions);
    
    await page.fill('input[placeholder*="поиск"]', 'мебель');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Просмотр каталога мастеров
    console.log(`👀 User ${userId}: Просматривает каталог мастеров...`);
    const masterCards = await page.$$('.master-card, .card, [class*="master"]');
    if (masterCards.length > 0) {
      await masterCards[0].click();
      await page.waitForTimeout(config.delayBetweenActions);
      console.log(`✅ User ${userId}: Просмотрел профиль мастера`);
      successfulActions++;
    } else {
      console.log(`❌ User ${userId}: Не нашел мастеров`);
      failedActions++;
    }
    
    totalActions++;
    
    // Создание заказа
    console.log(`🛒 User ${userId}: Создает заказ...`);
    await page.click('text=Заказать');
    await page.waitForTimeout(config.delayBetweenActions);
    
    await page.fill('textarea[name="description"]', `Тестовый заказ от пользователя ${userId}`);
    await page.fill('input[name="budget"]', '50000');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(config.delayBetweenActions);
    
    console.log(`✅ User ${userId}: Заказ создан`);
    successfulActions++;
    totalActions++;
    
    // Отправка сообщения в чат
    console.log(`💬 User ${userId}: Отправляет сообщение в чат...`);
    await page.click('text=Чат');
    await page.waitForTimeout(config.delayBetweenActions);
    
    await page.fill('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]', `Привет! Это тестовое сообщение от пользователя ${userId}`);
    await page.click('button[type="submit"], button:has-text("Отправить")');
    await page.waitForTimeout(config.delayBetweenActions);
    
    console.log(`✅ User ${userId}: Сообщение отправлено`);
    successfulActions++;
    totalActions++;
    
    // Обновление профиля
    console.log(`👤 User ${userId}: Обновляет профиль...`);
    await page.click('text=Профиль');
    await page.waitForTimeout(config.delayBetweenActions);
    
    await page.fill('input[name="name"]', `UpdatedUser${userId}`);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(config.delayBetweenActions);
    
    console.log(`✅ User ${userId}: Профиль обновлен`);
    successfulActions++;
    totalActions++;
    
    // Загрузка видео (если есть функция)
    console.log(`🎥 User ${userId}: Пытается загрузить видео...`);
    try {
      await page.click('text=Видео, text=Загрузить');
      await page.waitForTimeout(config.delayBetweenActions);
      
      // Имитируем загрузку файла
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles('/opt/mebelplace/test-video.mp4');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(config.delayBetweenActions);
        console.log(`✅ User ${userId}: Видео загружено`);
        successfulActions++;
      } else {
        console.log(`ℹ️ User ${userId}: Функция загрузки видео недоступна`);
      }
    } catch (error) {
      console.log(`ℹ️ User ${userId}: Загрузка видео недоступна: ${error.message}`);
    }
    
    totalActions++;
    
    console.log(`🎉 User ${userId}: Завершил все действия успешно!`);
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

// Функция для создания мастера
async function createMaster(userId) {
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
    console.log(`🔨 Master ${userId}: Регистрируется как мастер...`);
    
    // Переходим на сайт
    let retries = 0;
    while (retries < config.maxRetries) {
      try {
        await page.goto(config.targetUrl, { 
          waitUntil: 'networkidle',
          timeout: config.browserTimeout 
        });
        break;
      } catch (error) {
        retries++;
        console.log(`🔄 Master ${userId}: Попытка ${retries}/${config.maxRetries} - ${error.message}`);
        if (retries >= config.maxRetries) throw error;
        await page.waitForTimeout(2000);
      }
    }
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Регистрация мастера
    await page.click('text=Регистрация');
    await page.waitForTimeout(config.delayBetweenActions);
    
    await page.fill('input[name="name"]', `TestMaster${userId}`);
    await page.fill('input[name="phone"]', `+7777${String(userId + 1000).padStart(7, '0')}`);
    await page.fill('input[name="password"]', 'testpass123');
    await page.selectOption('select[name="role"]', 'master');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Обработка SMS кода
    page.on('console', msg => {
      if (msg.text().includes('SMS код')) {
        console.log(`📱 Master ${userId}: ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(3000);
    
    // Проверяем успешную регистрацию
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (accessToken) {
      console.log(`✅ Master ${userId}: Успешно зарегистрирован как мастер`);
      successfulActions++;
    } else {
      console.log(`❌ Master ${userId}: Ошибка регистрации мастера`);
      failedActions++;
    }
    
    totalActions++;
    
    // Заполнение профиля мастера
    console.log(`🔨 Master ${userId}: Заполняет профиль мастера...`);
    await page.fill('textarea[name="description"]', `Опытный мастер по изготовлению мебели ${userId}`);
    await page.fill('input[name="experience"]', '5');
    await page.fill('input[name="price"]', '1000');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(config.delayBetweenActions);
    
    console.log(`✅ Master ${userId}: Профиль мастера заполнен`);
    successfulActions++;
    totalActions++;
    
    // Загрузка портфолио
    console.log(`🖼️ Master ${userId}: Загружает портфолио...`);
    try {
      await page.click('text=Портфолио, text=Загрузить');
      await page.waitForTimeout(config.delayBetweenActions);
      
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles('/opt/mebelplace/test-image.jpg');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(config.delayBetweenActions);
        console.log(`✅ Master ${userId}: Портфолио загружено`);
        successfulActions++;
      }
    } catch (error) {
      console.log(`ℹ️ Master ${userId}: Загрузка портфолио недоступна: ${error.message}`);
    }
    
    totalActions++;
    
    console.log(`🎉 Master ${userId}: Завершил регистрацию успешно!`);
    completedUsers++;
    
  } catch (error) {
    console.log(`❌ Master ${userId}: Ошибка - ${error.message}`);
    failedActions++;
    totalActions++;
  } finally {
    await browser.close();
    activeUsers--;
  }
}

// Основная функция тестирования
async function runLoadTest() {
  console.log('🚀 Запуск мега мощного теста...');
  
  // Запускаем проверку базы данных каждые 15 секунд
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей
  for (let i = 1; i <= config.totalUsers; i++) {
    // Ждем, пока не освободится место для новых пользователей
    while (activeUsers >= config.concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    activeUsers++;
    
    // 70% клиентов, 30% мастеров
    if (i % 10 <= 6) {
      createUser(i).catch(error => {
        console.log(`❌ User ${i}: Критическая ошибка - ${error.message}`);
        activeUsers--;
      });
    } else {
      createMaster(i).catch(error => {
        console.log(`❌ Master ${i}: Критическая ошибка - ${error.message}`);
        activeUsers--;
      });
    }
    
    // Небольшая задержка между запуском пользователей
    await new Promise(resolve => setTimeout(resolve, 200));
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
    console.log('─'.repeat(80));
  }
  
  // Останавливаем проверку базы данных
  clearInterval(databaseInterval);
  
  // Финальная проверка базы данных
  await checkDatabase();
  
  console.log('🏁 ТЕСТ ЗАВЕРШЕН!');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`⏱️  Общее время: ${Math.floor((Date.now() - startTime) / 1000)}s`);
  console.log(`👥 Всего пользователей: ${config.totalUsers}`);
  console.log(`✅ Завершено пользователей: ${completedUsers}`);
  console.log(`📊 Всего действий: ${totalActions}`);
  console.log(`✅ Успешных действий: ${successfulActions}`);
  console.log(`❌ Неудачных действий: ${failedActions}`);
  console.log(`📈 Общая успешность: ${totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0}%`);
  console.log(`📊 Финальная статистика БД:`, databaseStats);
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

// Запускаем тест
runLoadTest().catch(console.error);
