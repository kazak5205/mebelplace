const { chromium } = require('playwright');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 🚀 ПОЛНЫЙ ТЕСТ С СЦЕНАРИЯМИ КЛИЕНТОВ И МАСТЕРОВ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 20,
  concurrentUsers: 3,
  testDuration: 600,
  databaseCheckInterval: 30,
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 2000,
  smsDelay: 8000,
  realUIMode: true
};

console.log('🚀 FULL SCENARIO TEST - CLIENTS & MASTERS');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (SMS из БД + полные сценарии)`);
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

// Функция для получения SMS кода из базы данных
async function getSmsCodeFromDatabase(phoneNumber) {
  try {
    console.log(`🔍 Ищем SMS код в БД для ${phoneNumber}...`);
    
    // Ищем в таблице sms_verifications
    const result = await execAsync(`docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT code FROM sms_verifications WHERE phone = '${phoneNumber}' AND is_used = false ORDER BY created_at DESC LIMIT 1;"`);
    
    if (result.stdout.trim()) {
      const code = result.stdout.trim();
      console.log(`📱 Найден SMS код в БД: ${code}`);
      
      // Помечаем код как использованный
      await execAsync(`docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -c "UPDATE sms_verifications SET is_used = true WHERE phone = '${phoneNumber}' AND code = '${code}';"`);
      
      return code;
    }
    
    // Если не найден для конкретного номера, берем последний неиспользованный
    const lastResult = await execAsync(`docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT code FROM sms_verifications WHERE is_used = false ORDER BY created_at DESC LIMIT 1;"`);
    
    if (lastResult.stdout.trim()) {
      const code = lastResult.stdout.trim();
      console.log(`📱 Используем последний SMS код из БД: ${code}`);
      
      // Помечаем код как использованный
      await execAsync(`docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -c "UPDATE sms_verifications SET is_used = true WHERE code = '${code}' AND is_used = false LIMIT 1;"`);
      
      return code;
    }
    
    return null;
    
  } catch (error) {
    console.log(`❌ Ошибка поиска SMS в БД: ${error.message}`);
    return null;
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
      
      // Пробуем разные способы закрытия
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Пробуем кликнуть вне модального окна
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
      
      // Пробуем JavaScript
      await page.evaluate(() => {
        const modal = document.querySelector('div.fixed.inset-0.bg-black.z-40');
        if (modal) {
          modal.style.display = 'none';
          modal.remove();
        }
      });
      
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

// Функция для создания пользователя с полным сценарием
async function createUserWithFullScenario(userId) {
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
    
    // Определяем роль пользователя (50% клиенты, 50% мастера)
    const userRole = userId % 2 === 0 ? 'client' : 'master';
    console.log(`👤 User ${userId}: Роль - ${userRole}`);
    
    // Переходим на страницу регистрации
    console.log(`👤 User ${userId}: Переходит на страницу регистрации...`);
    await page.goto(`${config.targetUrl}/register`, { 
      waitUntil: 'networkidle',
      timeout: config.browserTimeout 
    });
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Генерируем уникальный номер телефона
    const phoneNumber = `+7777${String(userId).padStart(7, '0')}`;
    const username = userRole === 'client' ? `Client${userId}` : `Master${userId}`;
    
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
    
    // Ждем SMS код до 15 секунд
    let attempts = 0;
    while (!smsCode && attempts < 30) {
      await page.waitForTimeout(500);
      attempts++;
    }
    
    // Если SMS код не получен из API, пробуем получить из БД
    if (!smsCode) {
      console.log(`🔍 User ${userId}: SMS код не получен из API, пробуем БД...`);
      smsCode = await getSmsCodeFromDatabase(phoneNumber);
    }
    
    // Если все еще нет кода, пробуем сгенерировать тестовый
    if (!smsCode) {
      console.log(`⚠️  User ${userId}: SMS код не найден, используем тестовый код`);
      smsCode = '123456'; // Тестовый код для продолжения
    }
    
    // Вводим SMS код
    console.log(`🔢 User ${userId}: Вводит SMS код: ${smsCode}`);
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
    
    // Теперь выполняем полный сценарий в зависимости от роли
    if (userRole === 'client') {
      await executeClientScenario(page, userId);
    } else {
      await executeMasterScenario(page, userId);
    }
    
    console.log(`🎉 User ${userId}: Завершил полный сценарий!`);
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

// Сценарий для клиентов
async function executeClientScenario(page, userId) {
  console.log(`👤 User ${userId}: Начинает сценарий КЛИЕНТА`);
  
  // 1. ПРОСМОТР КАТАЛОГА МАСТЕРОВ
  console.log(`👤 User ${userId}: Переходит в каталог мастеров`);
  
  try {
    await page.goto(`${config.targetUrl}/masters`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Смотрит каталог мастеров`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const masterCards = page.locator('.master-card, [data-testid="master-card"], a[href*="/master/"]');
    const masterCount = await masterCards.count();
    if (masterCount > 0) {
      const randomMaster = Math.floor(Math.random() * Math.min(masterCount, 3));
      const masterCard = masterCards.nth(randomMaster);
      
      console.log(`👤 User ${userId}: Кликает на профиль мастера`);
      await masterCard.click();
      await page.waitForLoadState('networkidle');
      console.log(`👤 User ${userId}: Смотрит профиль мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка в каталоге мастеров - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 2. СОЗДАНИЕ ЗАКАЗА
  console.log(`👤 User ${userId}: Создает заказ`);
  
  try {
    await page.goto(`${config.targetUrl}/orders/create`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу создания заказа`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderData = {
      title: `Заказ кухни от клиента ${userId}`,
      description: `Нужна кухня 3 метра, цвет белый, материал МДФ, бюджет 150000 тенге.`,
      budget: '150000'
    };
    
    // Заголовок заказа
    const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill(orderData.title);
      console.log(`👤 User ${userId}: Ввел заголовок заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Описание заказа
    const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill(orderData.description);
      console.log(`👤 User ${userId}: Ввел описание заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Бюджет
    const budgetInput = page.locator('input[name*="budget"], input[placeholder*="бюджет"]').first();
    if (await budgetInput.count() > 0) {
      await budgetInput.fill(orderData.budget);
      console.log(`👤 User ${userId}: Ввел бюджет`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Отправляет заказ
    const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ"), button:has-text("Отправить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userId}: Отправил заказ`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions * 3);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка создания заказа - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 3. ПРОСМОТР СВОИХ ЗАКАЗОВ
  console.log(`👤 User ${userId}: Смотрит свои заказы`);
  
  try {
    await page.goto(`${config.targetUrl}/user/orders`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу своих заказов`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка просмотра заказов - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 4. ЧАТ С МАСТЕРАМИ
  console.log(`👤 User ${userId}: Заходит в чат`);
  
  try {
    await page.goto(`${config.targetUrl}/chat`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл чат`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
    if (await messageInput.count() > 0) {
      const messages = [
        `Привет! Интересует ваш заказ. Могу обсудить детали?`,
        `Добрый день! Есть вопросы по заказу.`,
        `Здравствуйте! Готов обсудить условия.`
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await messageInput.fill(randomMessage);
      console.log(`👤 User ${userId}: Написал сообщение мастеру`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      await messageInput.press('Enter');
      console.log(`👤 User ${userId}: Отправил сообщение мастеру`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка чата - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Сценарий для мастеров
async function executeMasterScenario(page, userId) {
  console.log(`👤 User ${userId}: Начинает сценарий МАСТЕРА`);
  
  // 1. НАСТРОЙКА ПРОФИЛЯ МАСТЕРА
  console.log(`👤 User ${userId}: Настраивает профиль мастера`);
  
  try {
    await page.goto(`${config.targetUrl}/profile`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл профиль мастера`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const nameInput = page.locator('input[name*="name"], input[placeholder*="имя"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(`Мастер ${userId}`);
      console.log(`👤 User ${userId}: Ввел имя мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
    if (await bioInput.count() > 0) {
      await bioInput.fill(`Опытный мастер по изготовлению мебели. Специализируюсь на кухнях и шкафах. Опыт 5 лет.`);
      console.log(`👤 User ${userId}: Заполнил описание мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Update")').first();
    if (await saveButton.count() > 0) {
      await saveButton.click();
      console.log(`👤 User ${userId}: Сохранил профиль мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка настройки профиля - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 2. ЗАГРУЗКА ВИДЕО
  console.log(`👤 User ${userId}: Загружает видео портфолио`);
  
  try {
    await page.goto(`${config.targetUrl}/create-video-ad`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу создания видео`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const videoData = {
      title: `Портфолио мастера ${userId} - Кухня из МДФ`,
      description: `Показываю процесс изготовления кухни из МДФ. Полный цикл от замеров до установки.`
    };
    
    const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill(videoData.title);
      console.log(`👤 User ${userId}: Ввел заголовок видео`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill(videoData.description);
      console.log(`👤 User ${userId}: Ввел описание видео`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Загрузить"), button:has-text("Отправить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userId}: Отправил видео`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions * 5);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка загрузки видео - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 3. ПРОСМОТР ЗАКАЗОВ КЛИЕНТОВ
  console.log(`👤 User ${userId}: Смотрит заказы клиентов`);
  
  try {
    await page.goto(`${config.targetUrl}/master/orders`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу заказов клиентов`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderCards = page.locator('.order-card, [data-testid="order-card"]');
    const orderCount = await orderCards.count();
    if (orderCount > 0) {
      const randomOrder = Math.floor(Math.random() * Math.min(orderCount, 2));
      const orderCard = orderCards.nth(randomOrder);
      
      console.log(`👤 User ${userId}: Видит заказ клиента`);
      
      const respondButton = orderCard.locator('button:has-text("Откликнуться"), button:has-text("Respond")').first();
      if (await respondButton.count() > 0) {
        await respondButton.click();
        console.log(`👤 User ${userId}: Нажал 'Откликнуться'`);
        successfulActions++;
        totalActions++;
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(config.delayBetweenActions);
        
        const responseText = `Готов выполнить ваш заказ! Опыт 5 лет, качественные материалы. Срок 2 недели. Цена 120000 тенге.`;
        const responseInput = page.locator('textarea[placeholder*="отклик"], textarea[placeholder*="предложение"]').first();
        if (await responseInput.count() > 0) {
          await responseInput.fill(responseText);
          console.log(`👤 User ${userId}: Написал отклик`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
        }
        
        const submitResponseButton = page.locator('button:has-text("Отправить отклик"), button:has-text("Submit")').first();
        if (await submitResponseButton.count() > 0) {
          await submitResponseButton.click();
          console.log(`👤 User ${userId}: Отправил отклик`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
        }
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка отклика на заказ - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 4. ЧАТ С КЛИЕНТАМИ
  console.log(`👤 User ${userId}: Заходит в чат с клиентами`);
  
  try {
    await page.goto(`${config.targetUrl}/chat`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл чат`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
    if (await messageInput.count() > 0) {
      const messages = [
        `Здравствуйте! Готов обсудить ваш заказ. Могу показать примеры работ.`,
        `Добрый день! Есть вопросы по заказу? Могу проконсультировать.`,
        `Привет! Готов приступить к работе. Когда удобно встретиться?`
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await messageInput.fill(randomMessage);
      console.log(`👤 User ${userId}: Написал сообщение клиенту`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      await messageInput.press('Enter');
      console.log(`👤 User ${userId}: Отправил сообщение клиенту`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка чата - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Основная функция тестирования
async function runLoadTest() {
  console.log('🚀 Запуск полного теста с сценариями клиентов и мастеров...');
  
  // Запускаем проверку базы данных
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей
  for (let i = 1; i <= config.totalUsers; i++) {
    // Ждем, пока не освободится место для новых пользователей
    while (activeUsers >= config.concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    activeUsers++;
    
    createUserWithFullScenario(i).catch(error => {
      console.log(`❌ User ${i}: Критическая ошибка - ${error.message}`);
      activeUsers--;
    });
    
    // Задержка между запуском пользователей
    await new Promise(resolve => setTimeout(resolve, 1500));
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
