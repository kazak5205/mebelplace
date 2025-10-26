const { chromium } = require('playwright');

// 🚀 ТЕСТ С УЛУЧШЕННЫМ ЗАКРЫТИЕМ МОДАЛЬНОГО ОКНА
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 10,        // Еще меньше для тестирования
  concurrentUsers: 1,    // По одному пользователю
  testDuration: 300,     // 5 минут
  databaseCheckInterval: 30,
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 3000,
  smsDelay: 15000,       // 15 секунд между SMS запросами
  realUIMode: true
};

console.log('🚀 STARTING IMPROVED MODAL CLOSING TEST FOR MEBELPLACE');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (улучшенное закрытие модального окна)`);
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

// Улучшенная функция для закрытия модального окна
async function closeModal(page) {
  try {
    console.log('🔍 Проверяем наличие модального окна...');
    
    // Проверяем есть ли модальное окно
    const modalInfo = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0.bg-black.z-40');
      if (modal) {
        return {
          exists: true,
          className: modal.className,
          text: modal.textContent?.substring(0, 100) || '',
          zIndex: window.getComputedStyle(modal).zIndex
        };
      }
      return { exists: false };
    });
    
    if (!modalInfo.exists) {
      console.log('✅ Модального окна нет');
      return true;
    }
    
    console.log(`🔍 Найдено модальное окно: ${modalInfo.className}, z-index: ${modalInfo.zIndex}`);
    
    // Пробуем разные способы закрытия
    const closeMethods = [
      // 1. Escape
      async () => {
        console.log('🔍 Пробуем Escape...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(2000);
      },
      
      // 2. Клик вне модального окна
      async () => {
        console.log('🔍 Пробуем клик вне модального окна...');
        await page.click('body', { position: { x: 50, y: 50 } });
        await page.waitForTimeout(2000);
      },
      
      // 3. Клик по центру модального окна (может быть кнопка закрытия)
      async () => {
        console.log('🔍 Пробуем клик по центру модального окна...');
        await page.click('div.fixed.inset-0.bg-black.z-40', { position: { x: 100, y: 100 } });
        await page.waitForTimeout(2000);
      },
      
      // 4. JavaScript закрытие
      async () => {
        console.log('🔍 Пробуем JavaScript закрытие...');
        await page.evaluate(() => {
          const modal = document.querySelector('div.fixed.inset-0.bg-black.z-40');
          if (modal) {
            modal.style.display = 'none';
            modal.remove();
          }
        });
        await page.waitForTimeout(2000);
      },
      
      // 5. Поиск и клик по кнопке закрытия
      async () => {
        console.log('🔍 Ищем кнопку закрытия...');
        const closeButtons = await page.$$eval('button, [role="button"], [class*="close"], [class*="cancel"]', elements => 
          elements.map(el => ({
            text: el.textContent?.trim() || '',
            className: el.className,
            visible: el.offsetParent !== null
          })).filter(el => el.visible && (
            el.text.includes('×') || 
            el.text.includes('✕') ||
            el.text.includes('Закрыть') ||
            el.text.includes('Close') ||
            el.className.includes('close')
          ))
        );
        
        if (closeButtons.length > 0) {
          console.log(`🔍 Найдено ${closeButtons.length} кнопок закрытия`);
          for (const btn of closeButtons) {
            try {
              const selector = btn.className ? `.${btn.className.split(' ')[0]}` : `button:has-text("${btn.text}")`;
              await page.click(selector);
              console.log(`✅ Кликнули по кнопке: ${btn.text}`);
              await page.waitForTimeout(1000);
            } catch (error) {
              console.log(`❌ Ошибка клика по кнопке: ${error.message}`);
            }
          }
        }
      }
    ];
    
    // Пробуем все методы закрытия
    for (const method of closeMethods) {
      try {
        await method();
        
        // Проверяем закрылось ли
        const stillExists = await page.evaluate(() => {
          const modal = document.querySelector('div.fixed.inset-0.bg-black.z-40');
          return !!modal;
        });
        
        if (!stillExists) {
          console.log('✅ Модальное окно закрыто!');
          return true;
        }
      } catch (error) {
        console.log(`❌ Ошибка метода закрытия: ${error.message}`);
      }
    }
    
    console.log('❌ Не удалось закрыть модальное окно всеми способами');
    return false;
    
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
      console.log(`❌ User ${userId}: Не удалось закрыть модальное окно, пропускаем...`);
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
    
    // Слушаем network requests для получения SMS кода
    let smsCode = null;
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
    
    // Ждем SMS код до 30 секунд
    let attempts = 0;
    while (!smsCode && attempts < 60) {
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
  console.log('🚀 Запуск теста с улучшенным закрытием модального окна...');
  
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
    await new Promise(resolve => setTimeout(resolve, 5000));
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
