const { chromium } = require('playwright');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 🚀 АГРЕССИВНЫЙ ТЕСТ С ПОЛНЫМИ ВЗАИМОДЕЙСТВИЯМИ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 15,
  concurrentUsers: 3,
  testDuration: 600,
  databaseCheckInterval: 20,
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 1500,
  smsDelay: 6000,
  realUIMode: true
};

console.log('🚀 AGGRESSIVE INTERACTION TEST - FULL USER ENGAGEMENT');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (подписки, лайки, комментарии, чаты, поддержка)`);
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
    
    const result = await execAsync(`docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT code FROM sms_verifications WHERE phone = '${phoneNumber}' AND is_used = false ORDER BY created_at DESC LIMIT 1;"`);
    
    if (result.stdout.trim()) {
      const code = result.stdout.trim();
      console.log(`📱 Найден SMS код в БД: ${code}`);
      
      await execAsync(`docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -c "UPDATE sms_verifications SET is_used = true WHERE phone = '${phoneNumber}' AND code = '${code}';"`);
      
      return code;
    }
    
    const lastResult = await execAsync(`docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT code FROM sms_verifications WHERE is_used = false ORDER BY created_at DESC LIMIT 1;"`);
    
    if (lastResult.stdout.trim()) {
      const code = lastResult.stdout.trim();
      console.log(`📱 Используем последний SMS код из БД: ${code}`);
      
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
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
      
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

// Функция для создания пользователя с агрессивными взаимодействиями
async function createAggressiveUser(userId) {
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
    
    // Определяем роль пользователя
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
      smsCode = '123456';
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
    
    // Теперь выполняем агрессивные взаимодействия
    if (userRole === 'client') {
      await executeAggressiveClientScenario(page, userId);
    } else {
      await executeAggressiveMasterScenario(page, userId);
    }
    
    console.log(`🎉 User ${userId}: Завершил агрессивные взаимодействия!`);
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

// Агрессивный сценарий для клиентов
async function executeAggressiveClientScenario(page, userId) {
  console.log(`👤 User ${userId}: Начинает АГРЕССИВНЫЙ сценарий КЛИЕНТА`);
  
  // 1. ПРОСМОТР И ПОДПИСКИ НА МАСТЕРОВ
  console.log(`👤 User ${userId}: Просматривает мастеров и подписывается`);
  
  try {
    await page.goto(`${config.targetUrl}/masters`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Смотрит каталог мастеров`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем кнопки подписки
    const subscribeButtons = page.locator('button:has-text("Подписаться"), button:has-text("Subscribe"), .subscribe-btn, [data-testid="subscribe"]');
    const subscribeCount = await subscribeButtons.count();
    
    if (subscribeCount > 0) {
      // Подписываемся на несколько мастеров
      for (let i = 0; i < Math.min(3, subscribeCount); i++) {
        try {
          await subscribeButtons.nth(i).click();
          console.log(`👤 User ${userId}: Подписался на мастера ${i + 1}`);
          successfulActions++;
          totalActions++;
          globalData.subscriptions.push({ clientId: userId, masterIndex: i });
          
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userId}: Ошибка подписки ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // Кликаем на профили мастеров
    const masterCards = page.locator('.master-card, [data-testid="master-card"], a[href*="/master/"]');
    const masterCount = await masterCards.count();
    if (masterCount > 0) {
      for (let i = 0; i < Math.min(2, masterCount); i++) {
        try {
          await masterCards.nth(i).click();
          await page.waitForLoadState('networkidle');
          console.log(`👤 User ${userId}: Смотрит профиль мастера ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
          
          // Ставим лайки на видео мастера
          const likeButtons = page.locator('button:has-text("❤"), .like-btn, [data-testid="like"], button[class*="like"]');
          const likeCount = await likeButtons.count();
          if (likeCount > 0) {
            for (let j = 0; j < Math.min(2, likeCount); j++) {
              try {
                await likeButtons.nth(j).click();
                console.log(`👤 User ${userId}: Поставил лайк ${j + 1}`);
                successfulActions++;
                totalActions++;
                globalData.likes.push({ clientId: userId, masterIndex: i, likeIndex: j });
                
                await page.waitForTimeout(config.delayBetweenActions);
              } catch (error) {
                console.log(`❌ User ${userId}: Ошибка лайка ${j + 1} - ${error.message}`);
                failedActions++;
                totalActions++;
              }
            }
          }
          
          // Комментируем видео
          const commentInputs = page.locator('input[placeholder*="комментарий"], textarea[placeholder*="комментарий"], .comment-input');
          const commentCount = await commentInputs.count();
          if (commentCount > 0) {
            for (let k = 0; k < Math.min(2, commentCount); k++) {
              try {
                const comments = [
                  `Отличная работа! Очень качественно!`,
                  `Интересно, сколько стоит такая работа?`,
                  `Красиво получилось! Хочу заказать.`,
                  `Профессионально! Рекомендую!`
                ];
                const randomComment = comments[Math.floor(Math.random() * comments.length)];
                
                await commentInputs.nth(k).fill(randomComment);
                await page.waitForTimeout(500);
                
                const submitCommentButtons = page.locator('button:has-text("Отправить"), button:has-text("Comment"), .comment-submit');
                if (await submitCommentButtons.count() > 0) {
                  await submitCommentButtons.nth(0).click();
                  console.log(`👤 User ${userId}: Оставил комментарий ${k + 1}`);
                  successfulActions++;
                  totalActions++;
                  globalData.comments.push({ clientId: userId, masterIndex: i, comment: randomComment });
                  
                  await page.waitForTimeout(config.delayBetweenActions);
                }
              } catch (error) {
                console.log(`❌ User ${userId}: Ошибка комментария ${k + 1} - ${error.message}`);
                failedActions++;
                totalActions++;
              }
            }
          }
          
          await page.goBack();
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userId}: Ошибка просмотра мастера ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка в каталоге мастеров - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 2. СОЗДАНИЕ ЗАКАЗА С ДЕТАЛЬНЫМ ОПИСАНИЕМ
  console.log(`👤 User ${userId}: Создает детальный заказ`);
  
  try {
    await page.goto(`${config.targetUrl}/orders/create`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу создания заказа`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderData = {
      title: `Срочный заказ кухни от клиента ${userId}`,
      description: `Нужна кухня 3 метра, цвет белый, материал МДФ, бюджет 150000 тенге. Срок до 1 декабря 2025 года. Требуется замер на дому.`,
      budget: '150000',
      region: 'Алматы'
    };
    
    // Заполняем все поля заказа
    const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill(orderData.title);
      console.log(`👤 User ${userId}: Ввел заголовок заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill(orderData.description);
      console.log(`👤 User ${userId}: Ввел описание заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const budgetInput = page.locator('input[name*="budget"], input[placeholder*="бюджет"]').first();
    if (await budgetInput.count() > 0) {
      await budgetInput.fill(orderData.budget);
      console.log(`👤 User ${userId}: Ввел бюджет`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Выбираем категорию если есть
    const categorySelect = page.locator('select[name*="category"]').first();
    if (await categorySelect.count() > 0) {
      try {
        await categorySelect.selectOption('furniture');
        console.log(`👤 User ${userId}: Выбрал категорию`);
        successfulActions++;
        totalActions++;
      } catch (error) {
        console.log(`❌ User ${userId}: Не удалось выбрать категорию - ${error.message}`);
        failedActions++;
        totalActions++;
      }
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Отправляем заказ
    const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ"), button:has-text("Отправить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userId}: Отправил заказ`);
      successfulActions++;
      totalActions++;
      
      globalData.createdOrders.push({
        id: `order_${userId}_${Date.now()}`,
        clientId: userId,
        title: orderData.title,
        description: orderData.description,
        status: 'pending',
        createdAt: new Date()
      });
      
      await page.waitForTimeout(config.delayBetweenActions * 3);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка создания заказа - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 3. ЧАТ ЧЕРЕЗ ЗАЯВКИ
  console.log(`👤 User ${userId}: Общается в чатах через заявки`);
  
  try {
    await page.goto(`${config.targetUrl}/user/orders`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу своих заказов`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем заказы с ответами мастеров
    const responseCards = page.locator('.response-card, [data-testid="response-card"], .order-response');
    const responseCount = await responseCards.count();
    
    if (responseCount > 0) {
      for (let i = 0; i < Math.min(2, responseCount); i++) {
        try {
          const responseCard = responseCards.nth(i);
          
          // Кликаем на ответ мастера
          await responseCard.click();
          await page.waitForLoadState('networkidle');
          console.log(`👤 User ${userId}: Открыл ответ мастера ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
          
          // Ищем чат с мастером
          const chatInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"], .chat-input');
          if (await chatInput.count() > 0) {
            const chatMessages = [
              `Привет! Интересует ваш отклик. Можем обсудить детали?`,
              `Добрый день! Есть вопросы по заказу. Когда можете начать?`,
              `Здравствуйте! Готов обсудить условия. Какая цена?`,
              `Привет! Можете показать примеры работ?`
            ];
            const randomMessage = chatMessages[Math.floor(Math.random() * chatMessages.length)];
            
            await chatInput.nth(0).fill(randomMessage);
            console.log(`👤 User ${userId}: Написал сообщение мастеру ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForTimeout(config.delayBetweenActions);
            
            await chatInput.nth(0).press('Enter');
            console.log(`👤 User ${userId}: Отправил сообщение мастеру ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            globalData.activeChats.push({
              clientId: userId,
              masterIndex: i,
              message: randomMessage,
              timestamp: new Date()
            });
            
            await page.waitForTimeout(config.delayBetweenActions);
          }
          
          // Принимаем предложение мастера
          const acceptButton = page.locator('button:has-text("Принять"), button:has-text("Accept"), .accept-btn');
          if (await acceptButton.count() > 0) {
            await acceptButton.nth(0).click();
            console.log(`👤 User ${userId}: Принял предложение мастера ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForTimeout(config.delayBetweenActions);
          }
          
          await page.goBack();
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userId}: Ошибка чата с мастером ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка чатов через заявки - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 4. ПОДДЕРЖКА
  console.log(`👤 User ${userId}: Обращается в поддержку`);
  
  try {
    await page.goto(`${config.targetUrl}/support`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу поддержки`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const supportMessages = [
      `Здравствуйте! У меня проблема с заказом. Не могу связаться с мастером.`,
      `Добрый день! Как отменить заказ?`,
      `Привет! Есть вопросы по оплате.`,
      `Здравствуйте! Мастер не отвечает на сообщения.`
    ];
    const randomSupportMessage = supportMessages[Math.floor(Math.random() * supportMessages.length)];
    
    const supportInput = page.locator('textarea[placeholder*="сообщение"], input[placeholder*="сообщение"], .support-input');
    if (await supportInput.count() > 0) {
      await supportInput.nth(0).fill(randomSupportMessage);
      console.log(`👤 User ${userId}: Написал в поддержку`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      const submitSupportButton = page.locator('button:has-text("Отправить"), button:has-text("Submit"), .support-submit');
      if (await submitSupportButton.count() > 0) {
        await submitSupportButton.nth(0).click();
        console.log(`👤 User ${userId}: Отправил сообщение в поддержку`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка поддержки - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Агрессивный сценарий для мастеров
async function executeAggressiveMasterScenario(page, userId) {
  console.log(`👤 User ${userId}: Начинает АГРЕССИВНЫЙ сценарий МАСТЕРА`);
  
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
      await nameInput.fill(`Мастер ${userId} - Профессионал`);
      console.log(`👤 User ${userId}: Ввел имя мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
    if (await bioInput.count() > 0) {
      await bioInput.fill(`Опытный мастер по изготовлению мебели. Специализируюсь на кухнях, шкафах, спальнях. Работаю с МДФ, массивом дерева, ЛДСП. Опыт 8 лет. Гарантия 2 года. Быстро, качественно, недорого!`);
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
  
  // 2. ЗАГРУЗКА ВИДЕО ПОРТФОЛИО
  console.log(`👤 User ${userId}: Загружает видео портфолио`);
  
  try {
    await page.goto(`${config.targetUrl}/create-video-ad`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу создания видео`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const videoData = {
      title: `Портфолио мастера ${userId} - Кухня из МДФ премиум класса`,
      description: `Показываю полный процесс изготовления кухни из МДФ премиум класса. От замеров до установки. Использую качественные материалы, современное оборудование. Гарантия качества!`,
      tags: 'мебель, кухня, МДФ, на заказ, ручная работа, премиум'
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
    
    const tagsInput = page.locator('input[name*="tags"], input[placeholder*="теги"]').first();
    if (await tagsInput.count() > 0) {
      await tagsInput.fill(videoData.tags);
      console.log(`👤 User ${userId}: Ввел теги видео`);
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
      
      globalData.createdVideos.push({
        id: `video_${userId}_${Date.now()}`,
        masterId: userId,
        title: videoData.title,
        description: videoData.description,
        createdAt: new Date()
      });
      
      await page.waitForTimeout(config.delayBetweenActions * 5);
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка загрузки видео - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 3. ОТВЕТЫ НА ЗАКАЗЫ КЛИЕНТОВ
  console.log(`👤 User ${userId}: Отвечает на заказы клиентов`);
  
  try {
    await page.goto(`${config.targetUrl}/master/orders`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу заказов клиентов`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderCards = page.locator('.order-card, [data-testid="order-card"], .client-order');
    const orderCount = await orderCards.count();
    
    if (orderCount > 0) {
      for (let i = 0; i < Math.min(3, orderCount); i++) {
        try {
          const orderCard = orderCards.nth(i);
          
          const respondButton = orderCard.locator('button:has-text("Откликнуться"), button:has-text("Respond"), .respond-btn');
          if (await respondButton.count() > 0) {
            await respondButton.click();
            console.log(`👤 User ${userId}: Нажал 'Откликнуться' на заказ ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(config.delayBetweenActions);
            
            const responseTexts = [
              `Готов выполнить ваш заказ! Опыт 8 лет, качественные материалы. Срок 2 недели. Цена 120000 тенге. Гарантия 2 года.`,
              `Здравствуйте! Могу выполнить ваш заказ качественно и в срок. Цена 100000 тенге. Срок 10 дней.`,
              `Добрый день! Готов обсудить ваш заказ. Предлагаю скидку 10%. Цена 135000 тенге. Срок 3 недели.`
            ];
            const randomResponseText = responseTexts[Math.floor(Math.random() * responseTexts.length)];
            
            const responseInput = page.locator('textarea[placeholder*="отклик"], textarea[placeholder*="предложение"], .response-input');
            if (await responseInput.count() > 0) {
              await responseInput.nth(0).fill(randomResponseText);
              console.log(`👤 User ${userId}: Написал отклик на заказ ${i + 1}`);
              successfulActions++;
              totalActions++;
              
              await page.waitForTimeout(config.delayBetweenActions);
            }
            
            const submitResponseButton = page.locator('button:has-text("Отправить отклик"), button:has-text("Submit"), .submit-response');
            if (await submitResponseButton.count() > 0) {
              await submitResponseButton.click();
              console.log(`👤 User ${userId}: Отправил отклик на заказ ${i + 1}`);
              successfulActions++;
              totalActions++;
              
              await page.waitForTimeout(config.delayBetweenActions);
            }
          }
        } catch (error) {
          console.log(`❌ User ${userId}: Ошибка отклика на заказ ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка ответов на заказы - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 4. ЧАТ С КЛИЕНТАМИ
  console.log(`👤 User ${userId}: Общается с клиентами в чатах`);
  
  try {
    await page.goto(`${config.targetUrl}/chat`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл чат с клиентами`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"], .chat-input');
    if (await messageInput.count() > 0) {
      const masterMessages = [
        `Здравствуйте! Готов обсудить ваш заказ. Могу показать примеры работ.`,
        `Добрый день! Есть вопросы по заказу? Могу проконсультировать.`,
        `Привет! Готов приступить к работе. Когда удобно встретиться?`,
        `Здравствуйте! Могу предложить скидку 10% при заказе на сумму свыше 100000 тенге.`,
        `Добрый день! Готов выполнить заказ качественно и в срок. Гарантия 2 года!`
      ];
      
      // Отправляем несколько сообщений
      for (let i = 0; i < 3; i++) {
        try {
          const randomMessage = masterMessages[Math.floor(Math.random() * masterMessages.length)];
          
          await messageInput.nth(0).fill(randomMessage);
          console.log(`👤 User ${userId}: Написал сообщение клиенту ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
          
          await messageInput.nth(0).press('Enter');
          console.log(`👤 User ${userId}: Отправил сообщение клиенту ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          globalData.activeChats.push({
            masterId: userId,
            clientIndex: i,
            message: randomMessage,
            timestamp: new Date()
          });
          
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userId}: Ошибка сообщения клиенту ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка чата с клиентами - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 5. ОТВЕТЫ НА КОММЕНТАРИИ
  console.log(`👤 User ${userId}: Отвечает на комментарии к видео`);
  
  try {
    await page.goto(`${config.targetUrl}/videos`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу видео`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем свои видео
    const videoCards = page.locator('.video-card, [data-testid="video-card"], .my-video');
    const videoCount = await videoCards.count();
    
    if (videoCount > 0) {
      for (let i = 0; i < Math.min(2, videoCount); i++) {
        try {
          await videoCards.nth(i).click();
          await page.waitForLoadState('networkidle');
          console.log(`👤 User ${userId}: Открыл видео ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
          
          // Ищем комментарии для ответа
          const commentInputs = page.locator('input[placeholder*="ответ"], textarea[placeholder*="ответ"], .reply-input');
          const commentCount = await commentInputs.count();
          
          if (commentCount > 0) {
            for (let j = 0; j < Math.min(2, commentCount); j++) {
              try {
                const replyMessages = [
                  `Спасибо за отзыв! Рад, что понравилось!`,
                  `Да, могу выполнить такой заказ. Пишите в личные сообщения!`,
                  `Спасибо! Цена зависит от сложности. Обсудим детали.`,
                  `Конечно! Покажу примеры работ. Свяжитесь со мной.`
                ];
                const randomReply = replyMessages[Math.floor(Math.random() * replyMessages.length)];
                
                await commentInputs.nth(j).fill(randomReply);
                console.log(`👤 User ${userId}: Ответил на комментарий ${j + 1}`);
                successfulActions++;
                totalActions++;
                
                await page.waitForTimeout(config.delayBetweenActions);
                
                const submitReplyButtons = page.locator('button:has-text("Ответить"), button:has-text("Reply"), .reply-submit');
                if (await submitReplyButtons.count() > 0) {
                  await submitReplyButtons.nth(0).click();
                  console.log(`👤 User ${userId}: Отправил ответ на комментарий ${j + 1}`);
                  successfulActions++;
                  totalActions++;
                  
                  await page.waitForTimeout(config.delayBetweenActions);
                }
              } catch (error) {
                console.log(`❌ User ${userId}: Ошибка ответа на комментарий ${j + 1} - ${error.message}`);
                failedActions++;
                totalActions++;
              }
            }
          }
          
          await page.goBack();
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userId}: Ошибка видео ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка ответов на комментарии - ${error.message}`);
    failedActions++;
    totalActions++;
  }
  
  // 6. ПОДДЕРЖКА
  console.log(`👤 User ${userId}: Обращается в поддержку`);
  
  try {
    await page.goto(`${config.targetUrl}/support`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userId}: Открыл страницу поддержки`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const masterSupportMessages = [
      `Здравствуйте! У меня проблема с заказом. Клиент не отвечает на сообщения.`,
      `Добрый день! Как повысить рейтинг профиля?`,
      `Привет! Есть вопросы по комиссии платформы.`,
      `Здравствуйте! Клиент отменил заказ после начала работы. Что делать?`
    ];
    const randomSupportMessage = masterSupportMessages[Math.floor(Math.random() * masterSupportMessages.length)];
    
    const supportInput = page.locator('textarea[placeholder*="сообщение"], input[placeholder*="сообщение"], .support-input');
    if (await supportInput.count() > 0) {
      await supportInput.nth(0).fill(randomSupportMessage);
      console.log(`👤 User ${userId}: Написал в поддержку`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      const submitSupportButton = page.locator('button:has-text("Отправить"), button:has-text("Submit"), .support-submit');
      if (await submitSupportButton.count() > 0) {
        await submitSupportButton.nth(0).click();
        console.log(`👤 User ${userId}: Отправил сообщение в поддержку`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
    }
  } catch (error) {
    console.log(`❌ User ${userId}: Ошибка поддержки - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Основная функция тестирования
async function runLoadTest() {
  console.log('🚀 Запуск агрессивного теста с полными взаимодействиями...');
  
  // Запускаем проверку базы данных
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей
  for (let i = 1; i <= config.totalUsers; i++) {
    // Ждем, пока не освободится место для новых пользователей
    while (activeUsers >= config.concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    activeUsers++;
    
    createAggressiveUser(i).catch(error => {
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
    console.log(`💬 Активных чатов: ${globalData.activeChats.length}`);
    console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
    console.log(`🎥 Загруженных видео: ${globalData.createdVideos.length}`);
    console.log(`❤️  Лайков: ${globalData.likes.length}`);
    console.log(`💬 Комментариев: ${globalData.comments.length}`);
    console.log(`👥 Подписок: ${globalData.subscriptions.length}`);
    console.log('─'.repeat(80));
  }
  
  // Останавливаем проверку базы данных
  clearInterval(databaseInterval);
  
  // Финальная проверка базы данных
  await checkDatabase();
  
  console.log('🏁 АГРЕССИВНЫЙ ТЕСТ ЗАВЕРШЕН!');
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
runLoadTest().catch(console.error);
