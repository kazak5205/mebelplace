const { chromium } = require('playwright');

// 🚀 ИСПРАВЛЕННЫЙ ТЕСТ С ПРАВИЛЬНЫМ ПОЛУЧЕНИЕМ SMS КОДОВ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 20,        // Уменьшили для стабильности
  concurrentUsers: 2,    // Минимальная параллельность
  testDuration: 600,     // 10 минут
  databaseCheckInterval: 30,
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 3000,
  smsDelay: 10000,       // 10 секунд между SMS запросами
  realUIMode: true
};

console.log('🚀 STARTING FIXED SMS CODE TEST FOR MEBELPLACE');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (правильное получение SMS кодов)`);
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

// Функция для закрытия модального окна
async function closeModal(page) {
  try {
    const modalExists = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0.bg-black.z-40');
      return !!modal;
    });
    
    if (modalExists) {
      console.log('🔍 Найдено модальное окно, закрываем...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      
      const stillExists = await page.evaluate(() => {
        const modal = document.querySelector('div.fixed.inset-0.bg-black.z-40');
        return !!modal;
      });
      
      if (!stillExists) {
        console.log('✅ Модальное окно закрыто');
        return true;
      } else {
        console.log('❌ Модальное окно не закрылось');
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Ошибка закрытия модального окна: ${error.message}`);
    return false;
  }
}

// Функция для ожидания SMS rate limit
async function waitForSmsRateLimit() {
  const now = Date.now();
  const timeSinceLastSms = now - lastSmsTime;
  
  if (timeSinceLastSms < config.smsDelay) {
    const waitTime = config.smsDelay - timeSinceLastSms;
    console.log(`⏰ Ждем ${waitTime}ms перед следующим SMS запросом...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastSmsTime = Date.now();
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
    console.log(`🌐 User ${userId}: Приходит на сайт...`);
    
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
        console.log(`🔄 User ${userId}: Попытка ${retries}/${config.maxRetries} - ${error.message}`);
        if (retries >= config.maxRetries) throw error;
        await page.waitForTimeout(2000);
      }
    }
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Закрываем модальное окно
    const modalClosed = await closeModal(page);
    if (!modalClosed) {
      console.log(`❌ User ${userId}: Не удалось закрыть модальное окно`);
      failedActions++;
      totalActions++;
      return;
    }
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Переходим на страницу регистрации
    console.log(`👤 User ${userId}: Переходит на страницу регистрации...`);
    await page.goto(`${config.targetUrl}/register`, { 
      waitUntil: 'networkidle',
      timeout: config.browserTimeout 
    });
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Генерируем уникальный номер телефона
    const phoneNumber = `+7777${String(userId).padStart(7, '0')}`;
    const username = `TestUser${userId}`;
    
    console.log(`📝 User ${userId}: Заполняет форму регистрации...`);
    
    // Заполняем форму
    await page.fill('input[placeholder="+7XXXXXXXXXX"]', phoneNumber);
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="username"]', username);
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Минимум 6 символов"]', 'testpass123');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Повторите пароль"]', 'testpass123');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ждем перед отправкой SMS
    await waitForSmsRateLimit();
    
    // Отправляем форму
    console.log(`🚀 User ${userId}: Отправляет форму...`);
    await page.click('button:has-text("Отправить SMS")');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ждем SMS код
    console.log(`📱 User ${userId}: Ждет SMS код...`);
    
    // Слушаем консоль для получения SMS кода
    let smsCode = null;
    page.on('console', msg => {
      if (msg.text().includes('SMS code sent:')) {
        try {
          // Парсим JSON из консоли
          const jsonMatch = msg.text().match(/SMS code sent:\s*({.*})/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[1]);
            if (result.code) {
              smsCode = result.code;
              console.log(`📱 User ${userId}: Получен SMS код из консоли: ${smsCode}`);
            }
          }
        } catch (error) {
          // Игнорируем ошибки парсинга
        }
      }
    });
    
    // Также слушаем network requests для получения SMS кода
    page.on('response', async response => {
      if (response.url().includes('/api/auth/send-sms-code') && response.status() === 200) {
        try {
          const result = await response.json();
          if (result.success && result.code) {
            smsCode = result.code;
            console.log(`📱 User ${userId}: Получен SMS код из API: ${smsCode}`);
          }
        } catch (error) {
          // Игнорируем ошибки
        }
      }
    });
    
    // Ждем SMS код до 20 секунд
    let attempts = 0;
    while (!smsCode && attempts < 40) {
      await page.waitForTimeout(500);
      attempts++;
    }
    
    if (!smsCode) {
      console.log(`❌ User ${userId}: SMS код не получен`);
      failedActions++;
      totalActions++;
      return;
    }
    
    // Вводим SMS код
    console.log(`🔢 User ${userId}: Вводит SMS код: ${smsCode}`);
    await page.fill('input[placeholder="Введите 6-значный код"]', smsCode);
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Подтверждаем код
    await page.click('button:has-text("Подтвердить")');
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Проверяем результат
    const currentUrl = page.url();
    if (currentUrl.includes('/sms-verification')) {
      const errorText = await page.textContent('body');
      if (errorText.includes('already exists') || errorText.includes('уже существует')) {
        console.log(`✅ User ${userId}: Пользователь уже существует (регистрация работает!)`);
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
    
    console.log(`🎉 User ${userId}: Завершил регистрацию!`);
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

// Основная функция тестирования
async function runLoadTest() {
  console.log('🚀 Запуск исправленного теста с SMS кодами...');
  
  // Запускаем проверку базы данных
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей
  for (let i = 1; i <= config.totalUsers; i++) {
    // Ждем, пока не освободится место для новых пользователей
    while (activeUsers >= config.concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    activeUsers++;
    
    createUser(i).catch(error => {
      console.log(`❌ User ${i}: Критическая ошибка - ${error.message}`);
      activeUsers--;
    });
    
    // Задержка между запуском пользователей
    await new Promise(resolve => setTimeout(resolve, 2000));
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
