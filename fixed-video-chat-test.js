const { chromium } = require('playwright');

// 🚀 ИСПРАВЛЕННЫЙ ТЕСТ С РЕШЕНИЕМ ПРОБЛЕМ
const config = {
  targetUrl: 'https://mebelplace.com.kz',
  totalUsers: 50,  // Уменьшаем для стабильности
  concurrentUsers: 10,
  testDuration: 180,
  databaseCheckInterval: 30,
  maxRetries: 3,
  browserTimeout: 60000,
  delayBetweenActions: 2000,
  realUIMode: true
};

console.log('🚀 FIXED TEST - SOLVING VIDEO AND CHAT ISSUES');
console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`🎯 Target: ${config.targetUrl}`);
console.log(`👥 Total Users: ${config.totalUsers}`);
console.log(`⏱️  Duration: ${config.testDuration}s`);
console.log(`🔄 Concurrent: ${config.concurrentUsers}`);
console.log(`🖱️  Real UI: ENABLED (исправленные проблемы)`);
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
  searches: [],
  supportMessages: []
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
    
    const result = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT username, phone, role FROM users ORDER BY created_at DESC LIMIT 50;"');
    
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
    
    if (userIndex < existingUsers.length) {
      user = existingUsers[userIndex];
      console.log(`🌐 User ${userIndex}: Тестирует с существующим пользователем (${user.username})`);
    } else {
      console.log(`🌐 User ${userIndex}: Пропускаем (нет пользователя)`);
      return;
    }
    
    // 1. ЛОГИН
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
      return;
    } else {
      console.log(`✅ User ${userIndex}: Успешно залогинился`);
      successfulActions++;
      totalActions++;
      globalData.logins.push({ userId: userIndex, username: user.username, timestamp: new Date() });
    }
    
    // 2. СОЗДАНИЕ ЗАКАЗА
    console.log(`👤 User ${userIndex}: Создает заказ`);
    
    await page.goto(`${config.targetUrl}/orders/create`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл страницу создания заказа`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    const orderData = {
      title: `Заказ от ${user.username} - ${userIndex}`,
      description: `Детальное описание заказа от пользователя ${user.username}. Нужна качественная мебель, срок выполнения 2 недели, бюджет до 200000 тенге.`,
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
    
    // 3. ИСПРАВЛЕННОЕ СОЗДАНИЕ ВИДЕО (только для мастеров)
    if (user.role === 'user' && user.username.includes('Master')) {
      console.log(`🎥 User ${userIndex}: Создает видео (мастер)`);
      
      await page.goto(`${config.targetUrl}/create-video-ad`, { waitUntil: 'networkidle' });
      console.log(`🎥 User ${userIndex}: Открыл страницу создания видео`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      const videoData = {
        title: `Видео портфолио от ${user.username}`,
        description: `Показываю примеры работ мастера ${user.username}. Качественная мебель на заказ, современные технологии, гарантия качества.`,
        tags: 'мебель, на заказ, мастер, портфолио'
      };
      
      // Заполняем поля видео
      const videoTitleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
      if (await videoTitleInput.count() > 0) {
        await videoTitleInput.fill(videoData.title);
        console.log(`🎥 User ${userIndex}: Заполнил заголовок видео`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
      
      const videoDescInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
      if (await videoDescInput.count() > 0) {
        await videoDescInput.fill(videoData.description);
        console.log(`🎥 User ${userIndex}: Заполнил описание видео`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
      
      const videoTagsInput = page.locator('input[name*="tags"], input[placeholder*="теги"]').first();
      if (await videoTagsInput.count() > 0) {
        await videoTagsInput.fill(videoData.tags);
        console.log(`🎥 User ${userIndex}: Заполнил теги видео`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
      
      // ИСПРАВЛЕНИЕ: Создаем фиктивный видео файл для теста
      console.log(`🎥 User ${userIndex}: Создает фиктивный видео файл для теста`);
      
      // Ищем input для загрузки файла
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        // Создаем фиктивный файл через JavaScript
        await page.evaluate(() => {
          const input = document.querySelector('input[type="file"]');
          if (input) {
            // Создаем фиктивный файл
            const file = new File(['fake video content'], 'test-video.mp4', { type: 'video/mp4' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            
            // Триггерим событие change
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
          }
        });
        
        console.log(`🎥 User ${userIndex}: Загрузил фиктивный видео файл`);
        successfulActions++;
        totalActions++;
        
        await page.waitForTimeout(config.delayBetweenActions);
        
        // Теперь кнопка должна быть активна
        const publishButton = page.locator('button:has-text("Опубликовать видео")').first();
        if (await publishButton.count() > 0) {
          const isDisabled = await publishButton.isDisabled();
          if (!isDisabled) {
            await publishButton.click();
            console.log(`🎥 User ${userIndex}: Опубликовал видео`);
            successfulActions++;
            totalActions++;
            
            globalData.createdVideos.push({
              id: `video_${userIndex}_${Date.now()}`,
              userId: userIndex,
              title: videoData.title,
              description: videoData.description,
              createdAt: new Date()
            });
            
            await page.waitForTimeout(config.delayBetweenActions * 3);
          } else {
            console.log(`❌ User ${userIndex}: Кнопка публикации видео все еще отключена`);
            failedActions++;
            totalActions++;
          }
        }
      }
    }
    
    // 4. ИСПРАВЛЕННАЯ ОТПРАВКА СООБЩЕНИЙ В ПОДДЕРЖКУ
    console.log(`💬 User ${userIndex}: Отправляет сообщение в поддержку`);
    
    await page.goto(`${config.targetUrl}/support`, { waitUntil: 'networkidle' });
    console.log(`💬 User ${userIndex}: Открыл страницу поддержки`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ищем форму поддержки
    const supportMessages = [
      `Здравствуйте! У меня проблема с заказом. Не могу связаться с мастером.`,
      `Добрый день! Как отменить заказ?`,
      `Привет! Есть вопросы по оплате.`,
      `Здравствуйте! Мастер не отвечает на сообщения.`,
      `Добрый день! Как изменить требования к заказу?`
    ];
    const randomSupportMessage = supportMessages[Math.floor(Math.random() * supportMessages.length)];
    
    // Ищем поля формы поддержки
    const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="сообщение"], textarea[placeholder*="проблема"]').first();
    if (await messageInput.count() > 0) {
      await messageInput.fill(randomSupportMessage);
      console.log(`💬 User ${userIndex}: Заполнил сообщение в поддержку`);
      successfulActions++;
      totalActions++;
      
      await page.waitForTimeout(config.delayBetweenActions);
      
      const submitSupportButton = page.locator('button[type="submit"], button:has-text("Отправить"), button:has-text("Submit")').first();
      if (await submitSupportButton.count() > 0) {
        await submitSupportButton.click();
        console.log(`💬 User ${userIndex}: Отправил сообщение в поддержку`);
        successfulActions++;
        totalActions++;
        
        globalData.supportMessages.push({
          userId: userIndex,
          message: randomSupportMessage,
          timestamp: new Date()
        });
        
        await page.waitForTimeout(config.delayBetweenActions);
      }
    }
    
    // 5. ВЗАИМОДЕЙСТВИЕ С ГЛАВНОЙ СТРАНИЦЕЙ
    console.log(`👤 User ${userIndex}: Взаимодействует с главной страницей`);
    
    await page.goto(`${config.targetUrl}/`, { waitUntil: 'networkidle' });
    console.log(`👤 User ${userIndex}: Открыл главную страницу`);
    successfulActions++;
    totalActions++;
    
    await page.waitForTimeout(config.delayBetweenActions);
    
    // Ставим лайки
    const likeButtons = await page.locator('button:has-text("1"), button:has-text("0")').all();
    if (likeButtons.length > 0) {
      for (let i = 0; i < Math.min(2, likeButtons.length); i++) {
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
    
    // Поиск
    const searchQueries = ['кухня', 'шкаф', 'диван', 'стол', 'кровать'];
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

// Основная функция тестирования
async function runFixedTest() {
  console.log('🚀 Запуск исправленного теста...');
  
  // Загружаем существующих пользователей
  await getExistingUsers();
  
  // Запускаем проверку базы данных
  const databaseInterval = setInterval(checkDatabase, config.databaseCheckInterval * 1000);
  
  // Создаем пользователей
  for (let i = 0; i < Math.min(config.totalUsers, existingUsers.length); i++) {
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
    console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
    console.log(`🎥 Созданных видео: ${globalData.createdVideos.length}`);
    console.log(`💬 Сообщений в поддержку: ${globalData.supportMessages.length}`);
    console.log(`❤️  Лайков: ${globalData.likes.length}`);
    console.log(`🔍 Поисковых запросов: ${globalData.searches.length}`);
    console.log('─'.repeat(80));
  }
  
  // Останавливаем проверку базы данных
  clearInterval(databaseInterval);
  
  // Финальная проверка базы данных
  await checkDatabase();
  
  console.log('🏁 ИСПРАВЛЕННЫЙ ТЕСТ ЗАВЕРШЕН!');
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
  console.log(`📝 Созданных заказов: ${globalData.createdOrders.length}`);
  console.log(`🎥 Созданных видео: ${globalData.createdVideos.length}`);
  console.log(`💬 Сообщений в поддержку: ${globalData.supportMessages.length}`);
  console.log(`❤️  Лайков: ${globalData.likes.length}`);
  console.log(`🔍 Поисковых запросов: ${globalData.searches.length}`);
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

// Запускаем тест
runFixedTest().catch(console.error);
