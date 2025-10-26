const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 🚀 МОДЕРНИЗИРОВАННЫЙ ТЕСТ ПЛАТФОРМЫ
class PlatformTester {
  constructor() {
    this.config = {
      targetUrl: 'https://mebelplace.com.kz',
      totalUsers: 100,
      concurrentUsers: 20,
      testDuration: 300, // 5 минут
      databaseCheckInterval: 30,
      maxRetries: 3,
      browserTimeout: 60000,
      delayBetweenActions: 1500,
      realUIMode: true,
      enableMetrics: true,
      enableScreenshots: false,
      enableNetworkLogging: true
    };
    
    this.metrics = {
      startTime: Date.now(),
      endTime: null,
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      usersCompleted: 0,
      usersFailed: 0,
      activeUsers: 0,
      peakConcurrency: 0,
      averageResponseTime: 0,
      responseTimes: [],
      errors: [],
      databaseStats: { users: 0, orders: 0, messages: 0, videos: 0, supportTickets: 0 },
      performanceMetrics: {
        memoryUsage: [],
        cpuUsage: [],
        networkLatency: []
      }
    };
    
    this.existingUsers = [];
    this.testResults = [];
    this.isRunning = false;
  }

  // Инициализация тестера
  async initialize() {
    console.log('🚀 ИНИЦИАЛИЗАЦИЯ МОДЕРНИЗИРОВАННОГО ТЕСТЕРА ПЛАТФОРМЫ');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log(`🎯 Target: ${this.config.targetUrl}`);
    console.log(`👥 Total Users: ${this.config.totalUsers}`);
    console.log(`⏱️  Duration: ${this.config.testDuration}s`);
    console.log(`🔄 Concurrent: ${this.config.concurrentUsers}`);
    console.log(`📊 Metrics: ${this.config.enableMetrics ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🌐 Network Logging: ${this.config.enableNetworkLogging ? 'ENABLED' : 'DISABLED'}`);
    console.log('════════════════════════════════════════════════════════════════════════════════');
    
    await this.loadExistingUsers();
    await this.checkInitialDatabaseState();
  }

  // Загрузка существующих пользователей
  async loadExistingUsers() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const result = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT username, phone, role FROM users ORDER BY created_at DESC LIMIT 100;"');
      
      const lines = result.stdout.trim().split('\n');
      this.existingUsers = lines.map(line => {
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
      
      console.log(`📋 Загружено ${this.existingUsers.length} существующих пользователей`);
      
    } catch (error) {
      console.log(`❌ Ошибка загрузки пользователей: ${error.message}`);
    }
  }

  // Проверка начального состояния базы данных
  async checkInitialDatabaseState() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const usersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM users;"');
      const ordersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM orders;"');
      const messagesResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM messages;"');
      const videosResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM videos;"');
      const supportResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM support_tickets;"');
      
      this.metrics.databaseStats = {
        users: parseInt(usersResult.stdout.trim()) || 0,
        orders: parseInt(ordersResult.stdout.trim()) || 0,
        messages: parseInt(messagesResult.stdout.trim()) || 0,
        videos: parseInt(videosResult.stdout.trim()) || 0,
        supportTickets: parseInt(supportResult.stdout.trim()) || 0
      };
      
      console.log(`📊 Начальное состояние БД:`, this.metrics.databaseStats);
      
    } catch (error) {
      console.log(`❌ Ошибка проверки БД: ${error.message}`);
    }
  }

  // Проверка состояния базы данных
  async checkDatabaseState() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const usersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM users;"');
      const ordersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM orders;"');
      const messagesResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM messages;"');
      const videosResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM videos;"');
      const supportResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM support_tickets;"');
      
      const currentStats = {
        users: parseInt(usersResult.stdout.trim()) || 0,
        orders: parseInt(ordersResult.stdout.trim()) || 0,
        messages: parseInt(messagesResult.stdout.trim()) || 0,
        videos: parseInt(videosResult.stdout.trim()) || 0,
        supportTickets: parseInt(supportResult.stdout.trim()) || 0
      };
      
      return currentStats;
      
    } catch (error) {
      console.log(`❌ Ошибка проверки БД: ${error.message}`);
      return this.metrics.databaseStats;
    }
  }

  // Тестирование пользователя
  async testUser(userIndex) {
    const startTime = Date.now();
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    const userResult = {
      userId: userIndex,
      startTime,
      endTime: null,
      actions: [],
      errors: [],
      success: false,
      token: null,
      userData: null
    };
    
    try {
      let user;
      
      if (userIndex < this.existingUsers.length) {
        user = this.existingUsers[userIndex];
        userResult.userData = user;
        console.log(`🌐 User ${userIndex}: Тестирует с существующим пользователем (${user.username})`);
      } else {
        console.log(`🌐 User ${userIndex}: Пропускаем (нет пользователя)`);
        return userResult;
      }
      
      // 1. ЛОГИН
      const loginStart = Date.now();
      await this.performLogin(page, user, userResult);
      const loginTime = Date.now() - loginStart;
      userResult.actions.push({ action: 'login', duration: loginTime, success: true });
      
      // 2. СОЗДАНИЕ ЗАКАЗА
      const orderStart = Date.now();
      await this.performOrderCreation(page, user, userResult);
      const orderTime = Date.now() - orderStart;
      userResult.actions.push({ action: 'order_creation', duration: orderTime, success: true });
      
      // 3. СОЗДАНИЕ ВИДЕО (для мастеров)
      if (user.role === 'user' && user.username.includes('Master')) {
        const videoStart = Date.now();
        await this.performVideoCreation(page, user, userResult);
        const videoTime = Date.now() - videoStart;
        userResult.actions.push({ action: 'video_creation', duration: videoTime, success: true });
      }
      
      // 4. ОТПРАВКА СООБЩЕНИЯ В ПОДДЕРЖКУ
      const supportStart = Date.now();
      await this.performSupportMessage(page, user, userResult);
      const supportTime = Date.now() - supportStart;
      userResult.actions.push({ action: 'support_message', duration: supportTime, success: true });
      
      // 5. ВЗАИМОДЕЙСТВИЕ С ГЛАВНОЙ СТРАНИЦЕЙ
      const interactionStart = Date.now();
      await this.performMainPageInteractions(page, user, userResult);
      const interactionTime = Date.now() - interactionStart;
      userResult.actions.push({ action: 'main_page_interactions', duration: interactionTime, success: true });
      
      userResult.success = true;
      userResult.endTime = Date.now();
      
      console.log(`🎉 User ${userIndex}: Завершил полный флоу за ${userResult.endTime - userResult.startTime}ms`);
      
    } catch (error) {
      userResult.errors.push({ error: error.message, timestamp: Date.now() });
      userResult.endTime = Date.now();
      console.log(`❌ User ${userIndex}: Ошибка - ${error.message}`);
    } finally {
      await browser.close();
      this.metrics.activeUsers--;
      this.metrics.usersCompleted++;
    }
    
    return userResult;
  }

  // Выполнение логина
  async performLogin(page, user, userResult) {
    console.log(`🔐 User ${userResult.userId}: Логинится как ${user.username}`);
    
    await page.goto(`${this.config.targetUrl}/login`, { 
      waitUntil: 'networkidle',
      timeout: this.config.browserTimeout 
    });
    
    await page.waitForTimeout(this.config.delayBetweenActions);
    
    await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill(user.phone);
    await page.waitForTimeout(500);
    
    await page.locator('input[type="password"]').fill('testpass123');
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Войти")').click();
    await page.waitForTimeout(this.config.delayBetweenActions * 2);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Login failed');
    }
    
    // Получаем токен
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    userResult.token = token;
    
    console.log(`✅ User ${userResult.userId}: Успешно залогинился`);
  }

  // Создание заказа
  async performOrderCreation(page, user, userResult) {
    console.log(`👤 User ${userResult.userId}: Создает заказ`);
    
    await page.goto(`${this.config.targetUrl}/orders/create`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(this.config.delayBetweenActions);
    
    const orderData = {
      title: `Заказ от ${user.username} - ${userResult.userId}`,
      description: `Детальное описание заказа от пользователя ${user.username}. Нужна качественная мебель, срок выполнения 2 недели, бюджет до 200000 тенге.`,
      location: `Алматы, район ${userResult.userId % 10 + 1}`
    };
    
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.count() > 0) {
      await titleInput.fill(orderData.title);
      await page.waitForTimeout(this.config.delayBetweenActions);
    }
    
    const descInput = page.locator('textarea[name="description"]');
    if (await descInput.count() > 0) {
      await descInput.fill(orderData.description);
      await page.waitForTimeout(this.config.delayBetweenActions);
    }
    
    const locationInput = page.locator('input[name="location"]');
    if (await locationInput.count() > 0) {
      await locationInput.fill(orderData.location);
      await page.waitForTimeout(this.config.delayBetweenActions);
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Создать"), button:has-text("Отправить")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      console.log(`✅ User ${userResult.userId}: Отправил заказ`);
      await page.waitForTimeout(this.config.delayBetweenActions * 2);
    }
  }

  // Создание видео
  async performVideoCreation(page, user, userResult) {
    console.log(`🎥 User ${userResult.userId}: Создает видео (мастер)`);
    
    await page.goto(`${this.config.targetUrl}/create-video-ad`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(this.config.delayBetweenActions);
    
    const videoData = {
      title: `Видео портфолио от ${user.username}`,
      description: `Показываю примеры работ мастера ${user.username}. Качественная мебель на заказ, современные технологии, гарантия качества.`,
      tags: 'мебель, на заказ, мастер, портфолио'
    };
    
    const videoTitleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
    if (await videoTitleInput.count() > 0) {
      await videoTitleInput.fill(videoData.title);
      await page.waitForTimeout(this.config.delayBetweenActions);
    }
    
    const videoDescInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
    if (await videoDescInput.count() > 0) {
      await videoDescInput.fill(videoData.description);
      await page.waitForTimeout(this.config.delayBetweenActions);
    }
    
    const videoTagsInput = page.locator('input[name*="tags"], input[placeholder*="теги"]').first();
    if (await videoTagsInput.count() > 0) {
      await videoTagsInput.fill(videoData.tags);
      await page.waitForTimeout(this.config.delayBetweenActions);
    }
    
    // Создаем фиктивный видео файл
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        if (input) {
          const file = new File(['fake video content'], 'test-video.mp4', { type: 'video/mp4' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          
          const event = new Event('change', { bubbles: true });
          input.dispatchEvent(event);
        }
      });
      
      await page.waitForTimeout(this.config.delayBetweenActions);
      
      const publishButton = page.locator('button:has-text("Опубликовать видео")').first();
      if (await publishButton.count() > 0) {
        const isDisabled = await publishButton.isDisabled();
        if (!isDisabled) {
          await publishButton.click();
          console.log(`🎥 User ${userResult.userId}: Опубликовал видео`);
          await page.waitForTimeout(this.config.delayBetweenActions * 3);
        }
      }
    }
  }

  // Отправка сообщения в поддержку
  async performSupportMessage(page, user, userResult) {
    console.log(`💬 User ${userResult.userId}: Отправляет сообщение в поддержку`);
    
    await page.goto(`${this.config.targetUrl}/user/support`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(this.config.delayBetweenActions);
    
    const contactButton = page.locator('button:has-text("Новое обращение")');
    if (await contactButton.count() > 0) {
      await contactButton.click();
      await page.waitForTimeout(this.config.delayBetweenActions);
      
      const supportMessages = [
        `Здравствуйте! У меня проблема с заказом. Не могу связаться с мастером.`,
        `Добрый день! Как отменить заказ?`,
        `Привет! Есть вопросы по оплате.`,
        `Здравствуйте! Мастер не отвечает на сообщения.`,
        `Добрый день! Как изменить требования к заказу?`
      ];
      const randomSupportMessage = supportMessages[Math.floor(Math.random() * supportMessages.length)];
      
      const subjectInput = page.locator('input[name*="subject"], input[placeholder*="тема"]').first();
      if (await subjectInput.count() > 0) {
        await subjectInput.fill(`Вопрос от ${user.username}`);
        await page.waitForTimeout(this.config.delayBetweenActions);
      }
      
      const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="сообщение"]').first();
      if (await messageInput.count() > 0) {
        await messageInput.fill(randomSupportMessage);
        await page.waitForTimeout(this.config.delayBetweenActions);
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Отправить")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        console.log(`✅ User ${userResult.userId}: Отправил сообщение в поддержку`);
        await page.waitForTimeout(this.config.delayBetweenActions);
      }
    }
  }

  // Взаимодействие с главной страницей
  async performMainPageInteractions(page, user, userResult) {
    console.log(`👤 User ${userResult.userId}: Взаимодействует с главной страницей`);
    
    await page.goto(`${this.config.targetUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(this.config.delayBetweenActions);
    
    // Ставим лайки
    const likeButtons = await page.locator('button:has-text("1"), button:has-text("0")').all();
    if (likeButtons.length > 0) {
      for (let i = 0; i < Math.min(2, likeButtons.length); i++) {
        try {
          await likeButtons[i].click();
          console.log(`👤 User ${userResult.userId}: Поставил лайк ${i + 1}`);
          await page.waitForTimeout(this.config.delayBetweenActions);
        } catch (error) {
          // Игнорируем ошибки лайков
        }
      }
    }
    
    // Поиск
    const searchQueries = ['кухня', 'шкаф', 'диван', 'стол', 'кровать'];
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    
    const searchInput = page.locator('input[placeholder*="Поиск видео"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill(randomQuery);
      await page.waitForTimeout(this.config.delayBetweenActions);
      await searchInput.press('Enter');
      console.log(`👤 User ${userResult.userId}: Выполнил поиск: ${randomQuery}`);
      await page.waitForTimeout(this.config.delayBetweenActions * 2);
    }
  }

  // Запуск тестирования
  async runTest() {
    this.isRunning = true;
    this.metrics.startTime = Date.now();
    
    console.log('🚀 Запуск модернизированного теста...');
    
    // Запускаем проверку базы данных
    const databaseInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(databaseInterval);
        return;
      }
      
      const currentStats = await this.checkDatabaseState();
      console.log(`📊 DATABASE CHECK:`, currentStats);
      
    }, this.config.databaseCheckInterval * 1000);
    
    // Создаем пользователей
    for (let i = 0; i < Math.min(this.config.totalUsers, this.existingUsers.length); i++) {
      while (this.metrics.activeUsers >= this.config.concurrentUsers) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.metrics.activeUsers++;
      this.metrics.peakConcurrency = Math.max(this.metrics.peakConcurrency, this.metrics.activeUsers);
      
      this.testUser(i).then(result => {
        this.testResults.push(result);
        this.metrics.totalActions += result.actions.length;
        this.metrics.successfulActions += result.actions.filter(a => a.success).length;
        this.metrics.failedActions += result.actions.filter(a => !a.success).length;
        
        if (result.errors.length > 0) {
          this.metrics.errors.push(...result.errors);
        }
      }).catch(error => {
        console.log(`❌ User ${i}: Критическая ошибка - ${error.message}`);
        this.metrics.activeUsers--;
        this.metrics.usersFailed++;
      });
      
      // Задержка между запуском пользователей
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Ждем завершения теста
    const testStartTime = Date.now();
    while (Date.now() - testStartTime < this.config.testDuration * 1000) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
      const remaining = this.config.testDuration - elapsed;
      
      console.log(`⏱️  Время: ${elapsed}s/${this.config.testDuration}s (осталось: ${remaining}s)`);
      console.log(`👥 Активных пользователей: ${this.metrics.activeUsers}`);
      console.log(`✅ Завершено пользователей: ${this.metrics.usersCompleted}/${Math.min(this.config.totalUsers, this.existingUsers.length)}`);
      console.log(`📊 Действий: ${this.metrics.successfulActions}/${this.metrics.totalActions} успешно (${this.metrics.failedActions} ошибок)`);
      console.log(`📈 Успешность: ${this.metrics.totalActions > 0 ? Math.round((this.metrics.successfulActions / this.metrics.totalActions) * 100) : 0}%`);
      console.log('─'.repeat(80));
    }
    
    // Останавливаем проверку базы данных
    clearInterval(databaseInterval);
    this.isRunning = false;
    this.metrics.endTime = Date.now();
    
    // Финальная проверка базы данных
    const finalStats = await this.checkDatabaseState();
    this.metrics.databaseStats = finalStats;
    
    // Генерируем отчет
    await this.generateReport();
  }

  // Генерация отчета
  async generateReport() {
    console.log('🏁 МОДЕРНИЗИРОВАННЫЙ ТЕСТ ЗАВЕРШЕН!');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    
    const totalTime = this.metrics.endTime - this.metrics.startTime;
    const successRate = this.metrics.totalActions > 0 ? Math.round((this.metrics.successfulActions / this.metrics.totalActions) * 100) : 0;
    
    console.log(`⏱️  Общее время: ${Math.floor(totalTime / 1000)}s`);
    console.log(`👥 Всего пользователей: ${Math.min(this.config.totalUsers, this.existingUsers.length)}`);
    console.log(`✅ Завершено пользователей: ${this.metrics.usersCompleted}`);
    console.log(`❌ Неудачных пользователей: ${this.metrics.usersFailed}`);
    console.log(`📊 Всего действий: ${this.metrics.totalActions}`);
    console.log(`✅ Успешных действий: ${this.metrics.successfulActions}`);
    console.log(`❌ Неудачных действий: ${this.metrics.failedActions}`);
    console.log(`📈 Общая успешность: ${successRate}%`);
    console.log(`🔥 Пиковая нагрузка: ${this.metrics.peakConcurrency} пользователей`);
    console.log(`📊 Финальная статистика БД:`, this.metrics.databaseStats);
    
    // Сохраняем отчет в файл
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      metrics: this.metrics,
      testResults: this.testResults
    };
    
    const reportPath = path.join(__dirname, `platform-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Отчет сохранен: ${reportPath}`);
    
    console.log('════════════════════════════════════════════════════════════════════════════════');
    
    return report;
  }
}

// Запуск теста
async function runModernizedTest() {
  const tester = new PlatformTester();
  await tester.initialize();
  const report = await tester.runTest();
  return report;
}

// Экспорт для использования
module.exports = { PlatformTester, runModernizedTest };

// Запуск если файл выполняется напрямую
if (require.main === module) {
  runModernizedTest().catch(console.error);
}
