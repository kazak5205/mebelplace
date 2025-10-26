const { chromium } = require('playwright');

// 🔍 ТЕСТ С ПРОВЕРКОЙ РЕАЛЬНОЙ СТРУКТУРЫ САЙТА
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 50,        // Уменьшили для стабильности
  concurrentUsers: 10,   // Уменьшили для стабильности
  testDuration: 1200,    // 20 минут
  databaseCheckInterval: 30, // Проверяем БД каждые 30 секунд
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 2000, // Увеличили задержку
  realUIMode: true
};

console.log('🔍 STARTING SMART REAL UI LOAD TEST FOR MEBELPLACE');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (проверяем структуру сайта)`);
console.log(`🔍 Database Checks: EVERY ${config.databaseCheckInterval}s`);
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

// Функция для анализа структуры сайта
async function analyzeSiteStructure(page) {
  console.log('🔍 Анализируем структуру сайта...');
  
  try {
    // Получаем все кнопки и ссылки
    const buttons = await page.$$eval('button, a, [role="button"]', elements => 
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        visible: el.offsetParent !== null
      })).filter(el => el.visible && el.text.length > 0)
    );
    
    console.log('🔍 Найденные кнопки и ссылки:');
    buttons.forEach((btn, i) => {
      console.log(`  ${i + 1}. "${btn.text}" (${btn.tagName}, class: ${btn.className})`);
    });
    
    // Ищем элементы регистрации
    const registerElements = buttons.filter(btn => 
      btn.text.toLowerCase().includes('регистрация') || 
      btn.text.toLowerCase().includes('register') ||
      btn.text.toLowerCase().includes('войти') ||
      btn.text.toLowerCase().includes('login')
    );
    
    console.log('🔍 Элементы регистрации/входа:');
    registerElements.forEach((el, i) => {
      console.log(`  ${i + 1}. "${el.text}" (${el.tagName})`);
    });
    
    return { buttons, registerElements };
    
  } catch (error) {
    console.log(`❌ Ошибка анализа структуры: ${error.message}`);
    return { buttons: [], registerElements: [] };
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
    console.log(`🌐 User ${userId}: Приходит на сайт...`);
    
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
    
    // Анализируем структуру сайта
    const siteStructure = await analyzeSiteStructure(page);
    
    // Ищем кнопку регистрации
    let registerButton = null;
    
    // Пробуем разные селекторы
    const registerSelectors = [
      'text=Регистрация',
      'text=Register', 
      'text=Войти',
      'text=Login',
      'button:has-text("Регистрация")',
      'a:has-text("Регистрация")',
      '[class*="register"]',
      '[class*="login"]',
      '[class*="auth"]'
    ];
    
    for (const selector of registerSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            registerButton = element;
            console.log(`✅ User ${userId}: Нашел кнопку регистрации: ${selector}`);
            break;
          }
        }
      } catch (error) {
        // Игнорируем ошибки поиска
      }
    }
    
    if (!registerButton) {
      console.log(`❌ User ${userId}: Не нашел кнопку регистрации`);
      failedActions++;
      totalActions++;
      return;
    }
    
    // Кликаем на кнопку регистрации
    console.log(`👤 User ${userId}: Кликает на регистрацию...`);
    await registerButton.click();
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем форму регистрации
    const formSelectors = [
      'form',
      '[class*="form"]',
      '[class*="register"]',
      '[class*="auth"]'
    ];
    
    let form = null;
    for (const selector of formSelectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          form = element;
          console.log(`✅ User ${userId}: Нашел форму: ${selector}`);
          break;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    if (!form) {
      console.log(`❌ User ${userId}: Не нашел форму регистрации`);
      failedActions++;
      totalActions++;
      return;
    }
    
    // Заполняем форму
    console.log(`📝 User ${userId}: Заполняет форму...`);
    
    // Ищем поля ввода
    const nameSelectors = ['input[name="name"]', 'input[placeholder*="имя"]', 'input[placeholder*="name"]'];
    const phoneSelectors = ['input[name="phone"]', 'input[placeholder*="телефон"]', 'input[placeholder*="phone"]'];
    const passwordSelectors = ['input[name="password"]', 'input[type="password"]'];
    const roleSelectors = ['select[name="role"]', 'select', '[class*="role"]'];
    
    // Заполняем имя
    for (const selector of nameSelectors) {
      try {
        const field = await page.$(selector);
        if (field && await field.isVisible()) {
          await field.fill(`TestUser${userId}`);
          console.log(`✅ User ${userId}: Заполнил имя`);
          break;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    await page.waitForTimeout(500);
    
    // Заполняем телефон
    for (const selector of phoneSelectors) {
      try {
        const field = await page.$(selector);
        if (field && await field.isVisible()) {
          await field.fill(`+7777${String(userId).padStart(7, '0')}`);
          console.log(`✅ User ${userId}: Заполнил телефон`);
          break;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    await page.waitForTimeout(500);
    
    // Заполняем пароль
    for (const selector of passwordSelectors) {
      try {
        const field = await page.$(selector);
        if (field && await field.isVisible()) {
          await field.fill('testpass123');
          console.log(`✅ User ${userId}: Заполнил пароль`);
          break;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    await page.waitForTimeout(500);
    
    // Выбираем роль
    for (const selector of roleSelectors) {
      try {
        const field = await page.$(selector);
        if (field && await field.isVisible()) {
          await field.selectOption('client');
          console.log(`✅ User ${userId}: Выбрал роль клиента`);
          break;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем кнопку отправки
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Отправить")',
      'button:has-text("Submit")',
      'button:has-text("Регистрация")',
      'button:has-text("Register")',
      '[class*="submit"]'
    ];
    
    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          submitButton = element;
          console.log(`✅ User ${userId}: Нашел кнопку отправки: ${selector}`);
          break;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }
    
    if (!submitButton) {
      console.log(`❌ User ${userId}: Не нашел кнопку отправки`);
      failedActions++;
      totalActions++;
      return;
    }
    
    // Отправляем форму
    console.log(`🚀 User ${userId}: Отправляет форму...`);
    await submitButton.click();
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Проверяем успешную регистрацию
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (accessToken) {
      console.log(`✅ User ${userId}: Успешно зарегистрирован!`);
      successfulActions++;
    } else {
      console.log(`❌ User ${userId}: Ошибка регистрации`);
      failedActions++;
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
  console.log('🚀 Запуск умного теста...');
  
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
    await new Promise(resolve => setTimeout(resolve, 500));
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
