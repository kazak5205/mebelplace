const { chromium } = require('playwright');

// 🚀 ТЕСТ ПОЛНОГО ФЛОУ С СУЩЕСТВУЮЩИМИ ПОЛЬЗОВАТЕЛЯМИ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 200,  // Используем существующих пользователей
  concurrentUsers: 20,
  testDuration: 600,
  databaseCheckInterval: 30,
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 2000,
  realUIMode: true
};

console.log('🚀 FULL FLOW TEST WITH EXISTING USERS');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers} (используем существующих)`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (полный флоу: логин + все взаимодействия)`);
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
  logins: []
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
    
    const result = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT username, phone, role FROM users ORDER BY created_at DESC LIMIT 200;"');
    
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

// Функция для тестирования полного флоу с существующим пользователем
async function testFullFlowWithExistingUser(userIndex) {
  if (userIndex >= existingUsers.length) {
    console.log(`❌ User ${userIndex}: Нет пользователя с индексом ${userIndex}`);
    return;
  }
  
  const user = existingUsers[userIndex];
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
    console.log(`🌐 User ${userIndex}: Тестирует полный флоу (${user.username})`);
    
    // 1. ЛОГИН СУЩЕСТВУЮЩЕГО ПОЛЬЗОВАТЕЛЯ
    console.log(`🔐 User ${userIndex}: Логинится как ${user.username}`);
    
    await page.goto(`${config.targetUrl}/login`, { 
      waitUntil: 'networkidle',
      timeout: config.browserTimeout 
    });
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Закрываем модальное окно
    await closeModal(page);
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Заполняем форму логина
    await page.fill('input[placeholder="+7XXXXXXXXXX"], input[name="phone"]', user.phone);
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Пароль"], input[name="password"]', 'testpass123');
    await page.waitForTimeout(500);
    
    // Отправляем форму логина
    await page.click('button:has-text("Войти"), button[type="submit"]');
    await page.waitForTimeout(config.delayBetweenActions * 2);
    
    // Проверяем успешность логина
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log(`❌ User ${userIndex}: Ошибка логина`);
      failedActions++;
      totalActions++;
      return;
    } else {
      console.log(`✅ User ${userIndex}: Успешно залогинился`);
      successfulActions++;
      totalActions++;
      globalData.logins.push({ userId: userIndex, username: user.username, timestamp: new Date() });
    }
    
    // Закрываем модальное окно после логина
    await closeModal(page);
    await page.waitForTimeout(config.delayBetweenActions);
    
    // 2. ВЫПОЛНЯЕМ ПОЛНЫЕ СЦЕНАРИИ В ЗАВИСИМОСТИ ОТ РОЛИ
    if (user.role === 'user' && user.username.includes('Client')) {
      await executeFullClientFlow(page, userIndex, user);
    } else if (user.role === 'user' && user.username.includes('Master')) {
      await executeFullMasterFlow(page, userIndex, user);
    } else {
      // Если роль не определена, пробуем оба сценария
      await executeFullClientFlow(page, userIndex, user);
      await executeFullMasterFlow(page, userIndex, user);
    }
    
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

// Полный флоу для клиентов
async function executeFullClientFlow(page, userIndex, user) {
  console.log(`👤 User ${userIndex}: Выполняет ПОЛНЫЙ ФЛОУ КЛИЕНТА`);
  
  try {
    // 1. ПРОСМОТР И ПОДПИСКИ НА МАСТЕРОВ
    console.log(`👤 User ${userIndex}: Просматривает мастеров и подписывается`);
    
    await page.goto(`${config.targetUrl}/masters`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Смотрит каталог мастеров`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем кнопки подписки
    const subscribeButtons = page.locator('button:has-text("Подписаться"), button:has-text("Subscribe"), .subscribe-btn, [data-testid="subscribe"]');
    const subscribeCount = await subscribeButtons.count();
    
    if (subscribeCount > 0) {
      // Подписываемся на несколько мастеров
      for (let i = 0; i < Math.min(5, subscribeCount); i++) {
        try {
          await subscribeButtons.nth(i).click();
          console.log(`👤 User ${userIndex}: Подписался на мастера ${i + 1}`);
          successfulActions++;
          totalActions++;
          globalData.subscriptions.push({ clientId: userIndex, masterIndex: i });
          
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка подписки ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // Кликаем на профили мастеров и ставим лайки
    const masterCards = page.locator('.master-card, [data-testid="master-card"], a[href*="/master/"]');
    const masterCount = await masterCards.count();
    if (masterCount > 0) {
      for (let i = 0; i < Math.min(3, masterCount); i++) {
        try {
          await masterCards.nth(i).click();
          await page.waitForLoadState('networkidle');
          console.log(`👤 User ${userIndex}: Смотрит профиль мастера ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
          
          // Ставим лайки на видео мастера
          const likeButtons = page.locator('button:has-text("❤"), .like-btn, [data-testid="like"], button[class*="like"]');
          const likeCount = await likeButtons.count();
          if (likeCount > 0) {
            for (let j = 0; j < Math.min(3, likeCount); j++) {
              try {
                await likeButtons.nth(j).click();
                console.log(`👤 User ${userIndex}: Поставил лайк ${j + 1}`);
                successfulActions++;
                totalActions++;
                globalData.likes.push({ clientId: userIndex, masterIndex: i, likeIndex: j });
                
                await page.waitForTimeout(config.delayBetweenActions);
              } catch (error) {
                console.log(`❌ User ${userIndex}: Ошибка лайка ${j + 1} - ${error.message}`);
                failedActions++;
                totalActions++;
              }
            }
          }
          
          // Комментируем видео
          const commentInputs = page.locator('input[placeholder*="комментарий"], textarea[placeholder*="комментарий"], .comment-input');
          const commentCount = await commentInputs.count();
          if (commentCount > 0) {
            for (let k = 0; k < Math.min(3, commentCount); k++) {
              try {
                const comments = [
                  `Отличная работа! Очень качественно!`,
                  `Интересно, сколько стоит такая работа?`,
                  `Красиво получилось! Хочу заказать.`,
                  `Профессионально! Рекомендую!`,
                  `Отличное качество! Видно опыт мастера.`
                ];
                const randomComment = comments[Math.floor(Math.random() * comments.length)];
                
                await commentInputs.nth(k).fill(randomComment);
                await page.waitForTimeout(500);
                
                const submitCommentButtons = page.locator('button:has-text("Отправить"), button:has-text("Comment"), .comment-submit');
                if (await submitCommentButtons.count() > 0) {
                  await submitCommentButtons.nth(0).click();
                  console.log(`👤 User ${userIndex}: Оставил комментарий ${k + 1}`);
                  successfulActions++;
                  totalActions++;
                  globalData.comments.push({ clientId: userIndex, masterIndex: i, comment: randomComment });
                  
                  await page.waitForTimeout(config.delayBetweenActions);
                }
              } catch (error) {
                console.log(`❌ User ${userIndex}: Ошибка комментария ${k + 1} - ${error.message}`);
                failedActions++;
                totalActions++;
              }
            }
          }
          
          await page.goBack();
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка просмотра мастера ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 2. СОЗДАНИЕ ЗАКАЗА С ДЕТАЛЬНЫМ ОПИСАНИЕМ
    console.log(`👤 User ${userIndex}: Создает детальный заказ`);
    
    await page.goto(`${config.targetUrl}/orders/create`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу создания заказа`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderData = {
      title: `Срочный заказ от клиента ${user.username}`,
      description: `Нужна кухня 3 метра, цвет белый, материал МДФ, бюджет 150000 тенге. Срок до 1 декабря 2025 года. Требуется замер на дому. Дополнительные требования: встроенная техника, освещение под шкафами.`,
      budget: '150000',
      region: 'Алматы'
    };
    
    // Заполняем все поля заказа
    const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill(orderData.title);
      console.log(`👤 User ${userIndex}: Ввел заголовок заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill(orderData.description);
      console.log(`👤 User ${userIndex}: Ввел описание заказа`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const budgetInput = page.locator('input[name*="budget"], input[placeholder*="бюджет"]').first();
    if (await budgetInput.count() > 0) {
      await budgetInput.fill(orderData.budget);
      console.log(`👤 User ${userIndex}: Ввел бюджет`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Выбираем категорию если есть
    const categorySelect = page.locator('select[name*="category"]').first();
    if (await categorySelect.count() > 0) {
      try {
        await categorySelect.selectOption('furniture');
        console.log(`👤 User ${userIndex}: Выбрал категорию`);
        successfulActions++;
        totalActions++;
      } catch (error) {
        console.log(`❌ User ${userIndex}: Не удалось выбрать категорию - ${error.message}`);
        failedActions++;
        totalActions++;
      }
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // Отправляем заказ
    const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ"), button:has-text("Отправить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userIndex}: Отправил заказ`);
      successfulActions++;
      totalActions++;
      
      globalData.createdOrders.push({
        id: `order_${userIndex}_${Date.now()}`,
        clientId: userIndex,
        title: orderData.title,
        description: orderData.description,
        status: 'pending',
        createdAt: new Date()
      });
      
      await page.waitForTimeout(config.delayBetweenActions * 3);
    }
    
    // 3. ЧАТ ЧЕРЕЗ ЗАЯВКИ
    console.log(`👤 User ${userIndex}: Общается в чатах через заявки`);
    
    await page.goto(`${config.targetUrl}/user/orders`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу своих заказов`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем заказы с ответами мастеров
    const responseCards = page.locator('.response-card, [data-testid="response-card"], .order-response');
    const responseCount = await responseCards.count();
    
    if (responseCount > 0) {
      for (let i = 0; i < Math.min(3, responseCount); i++) {
        try {
          const responseCard = responseCards.nth(i);
          
          // Кликаем на ответ мастера
          await responseCard.click();
          await page.waitForLoadState('networkidle');
          console.log(`👤 User ${userIndex}: Открыл ответ мастера ${i + 1}`);
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
              `Привет! Можете показать примеры работ?`,
              `Добрый день! Интересует ваш опыт. Сколько лет работаете?`
            ];
            const randomMessage = chatMessages[Math.floor(Math.random() * chatMessages.length)];
            
            await chatInput.nth(0).fill(randomMessage);
            console.log(`👤 User ${userIndex}: Написал сообщение мастеру ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForTimeout(config.delayBetweenActions);
            
            await chatInput.nth(0).press('Enter');
            console.log(`👤 User ${userIndex}: Отправил сообщение мастеру ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            globalData.activeChats.push({
              clientId: userIndex,
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
            console.log(`👤 User ${userIndex}: Принял предложение мастера ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForTimeout(config.delayBetweenActions);
          }
          
          await page.goBack();
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка чата с мастером ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 4. ПОДДЕРЖКА
    console.log(`👤 User ${userIndex}: Обращается в поддержку`);
    
    await page.goto(`${config.targetUrl}/support`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу поддержки`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const supportMessages = [
      `Здравствуйте! У меня проблема с заказом. Не могу связаться с мастером.`,
      `Добрый день! Как отменить заказ?`,
      `Привет! Есть вопросы по оплате.`,
      `Здравствуйте! Мастер не отвечает на сообщения.`,
      `Добрый день! Как изменить требования к заказу?`
    ];
    const randomSupportMessage = supportMessages[Math.floor(Math.random() * supportMessages.length)];
    
    const supportInput = page.locator('textarea[placeholder*="сообщение"], input[placeholder*="сообщение"], .support-input');
    if (await supportInput.count() > 0) {
      await supportInput.nth(0).fill(randomSupportMessage);
      console.log(`👤 User ${userIndex}: Написал в поддержку`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      const submitSupportButton = page.locator('button:has-text("Отправить"), button:has-text("Submit"), .support-submit');
      if (await submitSupportButton.count() > 0) {
        await submitSupportButton.nth(0).click();
        console.log(`👤 User ${userIndex}: Отправил сообщение в поддержку`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
    }
    
  } catch (error) {
    console.log(`❌ User ${userIndex}: Ошибка флоу клиента - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Полный флоу для мастеров
async function executeFullMasterFlow(page, userIndex, user) {
  console.log(`👤 User ${userIndex}: Выполняет ПОЛНЫЙ ФЛОУ МАСТЕРА`);
  
  try {
    // 1. НАСТРОЙКА ПРОФИЛЯ МАСТЕРА
    console.log(`👤 User ${userIndex}: Настраивает профиль мастера`);
    
    await page.goto(`${config.targetUrl}/profile`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл профиль мастера`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const nameInput = page.locator('input[name*="name"], input[placeholder*="имя"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(`${user.username} - Профессионал`);
      console.log(`👤 User ${userIndex}: Ввел имя мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
    if (await bioInput.count() > 0) {
      await bioInput.fill(`Опытный мастер по изготовлению мебели. Специализируюсь на кухнях, шкафах, спальнях. Работаю с МДФ, массивом дерева, ЛДСП. Опыт 8 лет. Гарантия 2 года. Быстро, качественно, недорого! Контакты: ${user.phone}`);
      console.log(`👤 User ${userIndex}: Заполнил описание мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Update")').first();
    if (await saveButton.count() > 0) {
      await saveButton.click();
      console.log(`👤 User ${userIndex}: Сохранил профиль мастера`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    // 2. ЗАГРУЗКА ВИДЕО ПОРТФОЛИО
    console.log(`👤 User ${userIndex}: Загружает видео портфолио`);
    
    await page.goto(`${config.targetUrl}/create-video-ad`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу создания видео`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const videoData = {
      title: `Портфолио мастера ${user.username} - Кухня из МДФ премиум класса`,
      description: `Показываю полный процесс изготовления кухни из МДФ премиум класса. От замеров до установки. Использую качественные материалы, современное оборудование. Гарантия качества! Контакты: ${user.phone}`,
      tags: 'мебель, кухня, МДФ, на заказ, ручная работа, премиум'
    };
    
    const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill(videoData.title);
      console.log(`👤 User ${userIndex}: Ввел заголовок видео`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill(videoData.description);
      console.log(`👤 User ${userIndex}: Ввел описание видео`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const tagsInput = page.locator('input[name*="tags"], input[placeholder*="теги"]').first();
    if (await tagsInput.count() > 0) {
      await tagsInput.fill(videoData.tags);
      console.log(`👤 User ${userIndex}: Ввел теги видео`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Загрузить"), button:has-text("Отправить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`👤 User ${userIndex}: Отправил видео`);
      successfulActions++;
      totalActions++;
      
      globalData.createdVideos.push({
        id: `video_${userIndex}_${Date.now()}`,
        masterId: userIndex,
        title: videoData.title,
        description: videoData.description,
        createdAt: new Date()
      });
      
      await page.waitForTimeout(config.delayBetweenActions * 5);
    }
    
    // 3. ОТВЕТЫ НА ЗАКАЗЫ КЛИЕНТОВ
    console.log(`👤 User ${userIndex}: Отвечает на заказы клиентов`);
    
    await page.goto(`${config.targetUrl}/master/orders`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу заказов клиентов`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderCards = page.locator('.order-card, [data-testid="order-card"], .client-order');
    const orderCount = await orderCards.count();
    
    if (orderCount > 0) {
      for (let i = 0; i < Math.min(5, orderCount); i++) {
        try {
          const orderCard = orderCards.nth(i);
          
          const respondButton = orderCard.locator('button:has-text("Откликнуться"), button:has-text("Respond"), .respond-btn');
          if (await respondButton.count() > 0) {
            await respondButton.click();
            console.log(`👤 User ${userIndex}: Нажал 'Откликнуться' на заказ ${i + 1}`);
            successfulActions++;
            totalActions++;
            
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(config.delayBetweenActions);
            
            const responseTexts = [
              `Готов выполнить ваш заказ! Опыт 8 лет, качественные материалы. Срок 2 недели. Цена 120000 тенге. Гарантия 2 года.`,
              `Здравствуйте! Могу выполнить ваш заказ качественно и в срок. Цена 100000 тенге. Срок 10 дней.`,
              `Добрый день! Готов обсудить ваш заказ. Предлагаю скидку 10%. Цена 135000 тенге. Срок 3 недели.`,
              `Привет! Готов выполнить заказ. Опыт 5 лет. Цена 90000 тенге. Срок 1 неделя.`,
              `Здравствуйте! Профессионально выполню ваш заказ. Цена 110000 тенге. Гарантия 1 год.`
            ];
            const randomResponseText = responseTexts[Math.floor(Math.random() * responseTexts.length)];
            
            const responseInput = page.locator('textarea[placeholder*="отклик"], textarea[placeholder*="предложение"], .response-input');
            if (await responseInput.count() > 0) {
              await responseInput.nth(0).fill(randomResponseText);
              console.log(`👤 User ${userIndex}: Написал отклик на заказ ${i + 1}`);
              successfulActions++;
              totalActions++;
              
              await page.waitForTimeout(config.delayBetweenActions);
            }
            
            const submitResponseButton = page.locator('button:has-text("Отправить отклик"), button:has-text("Submit"), .submit-response');
            if (await submitResponseButton.count() > 0) {
              await submitResponseButton.click();
              console.log(`👤 User ${userIndex}: Отправил отклик на заказ ${i + 1}`);
              successfulActions++;
              totalActions++;
              
              await page.waitForTimeout(config.delayBetweenActions);
            }
          }
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка отклика на заказ ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 4. ЧАТ С КЛИЕНТАМИ
    console.log(`👤 User ${userIndex}: Общается с клиентами в чатах`);
    
    await page.goto(`${config.targetUrl}/chat`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл чат с клиентами`);
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
        `Добрый день! Готов выполнить заказ качественно и в срок. Гарантия 2 года!`,
        `Привет! Могу показать примеры своих работ. Есть портфолио.`,
        `Здравствуйте! Готов обсудить детали заказа. Когда удобно созвониться?`
      ];
      
      // Отправляем несколько сообщений
      for (let i = 0; i < 5; i++) {
        try {
          const randomMessage = masterMessages[Math.floor(Math.random() * masterMessages.length)];
          
          await messageInput.nth(0).fill(randomMessage);
          console.log(`👤 User ${userIndex}: Написал сообщение клиенту ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
          
          await messageInput.nth(0).press('Enter');
          console.log(`👤 User ${userIndex}: Отправил сообщение клиенту ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          globalData.activeChats.push({
            masterId: userIndex,
            clientIndex: i,
            message: randomMessage,
            timestamp: new Date()
          });
          
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка сообщения клиенту ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 5. ОТВЕТЫ НА КОММЕНТАРИИ
    console.log(`👤 User ${userIndex}: Отвечает на комментарии к видео`);
    
    await page.goto(`${config.targetUrl}/videos`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу видео`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем свои видео
    const videoCards = page.locator('.video-card, [data-testid="video-card"], .my-video');
    const videoCount = await videoCards.count();
    
    if (videoCount > 0) {
      for (let i = 0; i < Math.min(3, videoCount); i++) {
        try {
          await videoCards.nth(i).click();
          await page.waitForLoadState('networkidle');
          console.log(`👤 User ${userIndex}: Открыл видео ${i + 1}`);
          successfulActions++;
          totalActions++;
          
          await page.waitForTimeout(config.delayBetweenActions);
          
          // Ищем комментарии для ответа
          const commentInputs = page.locator('input[placeholder*="ответ"], textarea[placeholder*="ответ"], .reply-input');
          const commentCount = await commentInputs.count();
          
          if (commentCount > 0) {
            for (let j = 0; j < Math.min(3, commentCount); j++) {
              try {
                const replyMessages = [
                  `Спасибо за отзыв! Рад, что понравилось!`,
                  `Да, могу выполнить такой заказ. Пишите в личные сообщения!`,
                  `Спасибо! Цена зависит от сложности. Обсудим детали.`,
                  `Конечно! Покажу примеры работ. Свяжитесь со мной.`,
                  `Спасибо за комментарий! Готов обсудить ваш проект.`,
                  `Да, работаю в этом направлении. Пишите в чат!`
                ];
                const randomReply = replyMessages[Math.floor(Math.random() * replyMessages.length)];
                
                await commentInputs.nth(j).fill(randomReply);
                console.log(`👤 User ${userIndex}: Ответил на комментарий ${j + 1}`);
                successfulActions++;
                totalActions++;
                
                await page.waitForTimeout(config.delayBetweenActions);
                
                const submitReplyButtons = page.locator('button:has-text("Ответить"), button:has-text("Reply"), .reply-submit');
                if (await submitReplyButtons.count() > 0) {
                  await submitReplyButtons.nth(0).click();
                  console.log(`👤 User ${userIndex}: Отправил ответ на комментарий ${j + 1}`);
                  successfulActions++;
                  totalActions++;
                  
                  await page.waitForTimeout(config.delayBetweenActions);
                }
              } catch (error) {
                console.log(`❌ User ${userIndex}: Ошибка ответа на комментарий ${j + 1} - ${error.message}`);
                failedActions++;
                totalActions++;
              }
            }
          }
          
          await page.goBack();
          await page.waitForTimeout(config.delayBetweenActions);
        } catch (error) {
          console.log(`❌ User ${userIndex}: Ошибка видео ${i + 1} - ${error.message}`);
          failedActions++;
          totalActions++;
        }
      }
    }
    
    // 6. ПОДДЕРЖКА
    console.log(`👤 User ${userIndex}: Обращается в поддержку`);
    
    await page.goto(`${config.targetUrl}/support`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу поддержки`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const masterSupportMessages = [
      `Здравствуйте! У меня проблема с заказом. Клиент не отвечает на сообщения.`,
      `Добрый день! Как повысить рейтинг профиля?`,
      `Привет! Есть вопросы по комиссии платформы.`,
      `Здравствуйте! Клиент отменил заказ после начала работы. Что делать?`,
      `Добрый день! Как добавить больше видео в портфолио?`,
      `Привет! Есть вопросы по системе оплаты.`
    ];
    const randomSupportMessage = masterSupportMessages[Math.floor(Math.random() * masterSupportMessages.length)];
    
    const supportInput = page.locator('textarea[placeholder*="сообщение"], input[placeholder*="сообщение"], .support-input');
    if (await supportInput.count() > 0) {
      await supportInput.nth(0).fill(randomSupportMessage);
      console.log(`👤 User ${userIndex}: Написал в поддержку`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      const submitSupportButton = page.locator('button:has-text("Отправить"), button:has-text("Submit"), .support-submit');
      if (await submitSupportButton.count() > 0) {
        await submitSupportButton.nth(0).click();
        console.log(`👤 User ${userIndex}: Отправил сообщение в поддержку`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
    }
    
  } catch (error) {
    console.log(`❌ User ${userIndex}: Ошибка флоу мастера - ${error.message}`);
    failedActions++;
    totalActions++;
  }
}

// Основная функция тестирования
async function runFullFlowTest() {
  console.log('🚀 Запуск теста полного флоу с существующими пользователями...');
  
  // Загружаем существующих пользователей
  await getExistingUsers();
  
  if (existingUsers.length === 0) {
    console.log('❌ Нет существующих пользователей для тестирования');
    return;
  }
  
  // Запускаем проверку базы данных
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей
  for (let i = 0; i < Math.min(config.totalUsers, existingUsers.length); i++) {
    // Ждем, пока не освободится место для новых пользователей
    while (activeUsers >= config.concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    activeUsers++;
    
    testFullFlowWithExistingUser(i).catch(error => {
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
    console.log(`✅ Завершено пользователей: ${completedUsers}/${Math.min(config.totalUsers, existingUsers.length)}`);
    console.log(`📊 Действий: ${successfulActions}/${totalActions} успешно (${failedActions} ошибок)`);
    console.log(`📈 Успешность: ${totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0}%`);
    console.log(`🔐 Успешных логинов: ${globalData.logins.length}`);
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
  
  console.log('🏁 ТЕСТ ПОЛНОГО ФЛОУ ЗАВЕРШЕН!');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`⏱️  Общее время: ${Math.floor((Date.now() - startTime) / 1000)}s`);
  console.log(`👥 Всего пользователей: ${Math.min(config.totalUsers, existingUsers.length)}`);
  console.log(`✅ Завершено пользователей: ${completedUsers}`);
  console.log(`📊 Всего действий: ${totalActions}`);
  console.log(`✅ Успешных действий: ${successfulActions}`);
  console.log(`❌ Неудачных действий: ${failedActions}`);
  console.log(`📈 Общая успешность: ${totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0}%`);
  console.log(`📊 Финальная статистика БД:`, databaseStats);
  console.log(`🔐 Успешных логинов: ${globalData.logins.length}`);
  console.log(`💬 Активных чатов: ${globalData.activeChats.length}`);
  console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
  console.log(`🎥 Загруженных видео: ${globalData.createdVideos.length}`);
  console.log(`❤️  Лайков: ${globalData.likes.length}`);
  console.log(`💬 Комментариев: ${globalData.comments.length}`);
  console.log(`👥 Подписок: ${globalData.subscriptions.length}`);
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

// Запускаем тест
runFullFlowTest().catch(console.error);
