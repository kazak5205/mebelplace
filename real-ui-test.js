#!/usr/bin/env node

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');

// Конфигурация
const CONFIG = {
  target: 'https://mebelplace.com.kz',
  totalUsers: 30,
  concurrentUsers: 5,
  testDuration: 900, // 15 минут
  userDelay: 10000, // 10 секунд между пользователями
  actionDelay: 2000 // 2 секунды между действиями
};

// Статистика
const stats = {
  users: [],
  interactions: [],
  totalRequests: 0,
  totalErrors: 0,
  startTime: Date.now()
};

// Создание тестовых файлов
const createTestFiles = () => {
  const fs = require('fs');
  const path = require('path');
  
  const testVideoPath = path.join(__dirname, 'test-video.mp4');
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  const testAvatarPath = path.join(__dirname, 'test-avatar.jpg');
  
  if (!fs.existsSync(testVideoPath)) {
    fs.writeFileSync(testVideoPath, 'fake video content for testing');
  }
  if (!fs.existsSync(testImagePath)) {
    fs.writeFileSync(testImagePath, 'fake image content for testing');
  }
  if (!fs.existsSync(testAvatarPath)) {
    fs.writeFileSync(testAvatarPath, 'fake avatar content for testing');
  }
  
  return { testVideoPath, testImagePath, testAvatarPath };
};

// Глобальные данные для взаимодействий
const globalData = {
  createdOrders: [],
  createdVideos: [],
  createdUsers: [],
  activeChats: [],
  supportTickets: []
};

// РЕАЛЬНЫЙ ПОЛЬЗОВАТЕЛЬ - нажимает кнопки как человек
async function simulateRealUser(userId) {
  const browser = await chromium.launch({ 
    headless: true, // Headless режим для сервера
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const userStats = {
    id: userId,
    startTime: Date.now(),
    actions: [],
    errors: [],
    uploadedContent: [],
    interactions: [],
    role: null,
    authToken: null
  };
  
  const { testVideoPath, testImagePath, testAvatarPath } = createTestFiles();
  
  try {
    // Перехватываем консольные сообщения для получения SMS кода
    await page.addInitScript(() => {
      window.consoleMessages = [];
      window.consoleLogs = [];
      const originalLog = console.log;
      console.log = function(...args) {
        const message = args.join(' ');
        window.consoleMessages.push(message);
        window.consoleLogs.push(message);
        originalLog.apply(console, args);
      };
    });

    // Также перехватываем через событие console
    let smsCode = null;
    page.on('console', msg => {
      if (msg.type() === 'log') {
        const text = msg.text();
        if (text.includes('SMS code sent')) {
          console.log(`🔍 SMS код обнаружен в консоли: ${text}`);
          const match = text.match(/code:\s*(\d+)/);
          if (match) {
            smsCode = match[1];
            console.log(`🔍 SMS код извлечен: ${smsCode}`);
          }
        }
      }
    });

    console.log(`🌐 User ${userId}: Приходит на сайт как обычный пользователь...`);
    
    // 1. ПРИХОД НА САЙТ - как обычный пользователь
    await page.goto(CONFIG.target, { waitUntil: 'networkidle' });
    userStats.actions.push('visited_homepage');
    console.log(`👤 User ${userId}: Зашел на главную страницу`);
    
    // Ждем как человек
    await page.waitForTimeout(CONFIG.actionDelay);
    
    // 2. РЕГИСТРАЦИЯ - через кнопки как обычный пользователь
    console.log(`👤 User ${userId}: Видит кнопку 'Регистрация' и нажимает на неё`);
    
    // Ищем кнопку регистрации
    const registerButton = page.locator('text=Регистрация').first();
    if (await registerButton.count() > 0) {
      await registerButton.click({ force: true });
      await page.waitForLoadState('networkidle');
      userStats.actions.push('clicked_register_button');
      console.log(`👤 User ${userId}: Нажал на кнопку регистрации`);
      
      // Ждем как человек
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Заполняем форму как обычный пользователь
      const phone = `+7778${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
      const username = `user${userId}`;
      const password = 'password123';
      const isMaster = Math.random() > 0.6; // 40% мастеров, 60% клиентов
      userStats.role = isMaster ? 'master' : 'client';
      
      console.log(`👤 User ${userId}: Заполняет форму регистрации (${userStats.role})`);
      
      // Выбираем роль - как обычный пользователь
      const roleSelect = page.locator('combobox, select').first();
      if (await roleSelect.count() > 0) {
        try {
          // Используем selectOption для выбора роли
          const roleValue = isMaster ? 'master' : 'user';
          await roleSelect.selectOption(roleValue);
          userStats.actions.push('selected_role');
          console.log(`👤 User ${userId}: Выбрал роль: ${userStats.role}`);
        } catch (error) {
          console.log(`👤 User ${userId}: Не удалось выбрать роль - ${error.message}`);
          // Пробуем альтернативный способ
          try {
            await roleSelect.click();
            await page.waitForTimeout(500);
            const roleOption = page.locator(`option[value="${isMaster ? 'master' : 'user'}"]`).first();
            if (await roleOption.count() > 0) {
              await roleOption.click();
              userStats.actions.push('selected_role_fallback');
              console.log(`👤 User ${userId}: Выбрал роль альтернативным способом: ${userStats.role}`);
            }
          } catch (error2) {
            console.log(`👤 User ${userId}: Не удалось выбрать роль альтернативным способом - ${error2.message}`);
          }
        }
      }
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Заполняем телефон
      const phoneInput = page.locator('input[placeholder*="+7"], input[type="tel"]').first();
      if (await phoneInput.count() > 0) {
        await phoneInput.fill(phone);
        userStats.actions.push('filled_phone');
        console.log(`👤 User ${userId}: Ввел телефон: ${phone}`);
      }
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Заполняем username
      const usernameInput = page.locator('input[placeholder*="username"], input[placeholder*="логин"]').first();
      if (await usernameInput.count() > 0) {
        await usernameInput.fill(username);
        userStats.actions.push('filled_username');
        console.log(`👤 User ${userId}: Ввел логин: ${username}`);
      }
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Заполняем пароль
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(password);
        userStats.actions.push('filled_password');
        console.log(`👤 User ${userId}: Ввел пароль`);
      }
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Подтверждаем пароль
      const confirmPasswordInput = page.locator('input[placeholder*="Повторите"], input[placeholder*="подтвердите"]').first();
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill(password);
        userStats.actions.push('confirmed_password');
        console.log(`👤 User ${userId}: Подтвердил пароль`);
      }
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Нажимаем кнопку отправки
      const submitButton = page.locator('button:has-text("Отправить SMS"), button[type="submit"], button:has-text("Зарегистрироваться")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        userStats.actions.push('submitted_registration');
        console.log(`👤 User ${userId}: Нажал 'Отправить SMS'`);
        
        // Ждем обработки
        await page.waitForTimeout(CONFIG.actionDelay * 3);
        
        // Проверяем, перешли ли на страницу SMS-верификации
        const currentUrl = page.url();
        if (currentUrl.includes('sms-verification')) {
          console.log(`👤 User ${userId}: Перешел на страницу SMS-верификации`);
          
          // Ждем SMS код
          await page.waitForTimeout(3000);
          
          // Используем SMS код, который мы получили через событие console
          if (smsCode) {
            console.log(`👤 User ${userId}: Используем SMS код: ${smsCode}`);
            
            // Вводим SMS код
            const smsInput = page.locator('input[placeholder*="6-значный"], input[placeholder*="SMS"]').first();
            if (await smsInput.count() > 0) {
              await smsInput.fill(smsCode);
              userStats.actions.push('filled_sms_code');
              console.log(`👤 User ${userId}: Ввел SMS код`);
              
              await page.waitForTimeout(CONFIG.actionDelay);
              
              // Нажимаем кнопку подтверждения
              const confirmButton = page.locator('button:has-text("Подтвердить")').first();
              if (await confirmButton.count() > 0) {
                await confirmButton.click();
                userStats.actions.push('confirmed_sms');
                console.log(`👤 User ${userId}: Подтвердил SMS код`);
                
                await page.waitForTimeout(CONFIG.actionDelay * 3);
                
                // Проверяем успешность регистрации
                const token = await page.evaluate(() => localStorage.getItem('accessToken'));
                if (token) {
                  userStats.authToken = token;
                  userStats.actions.push('registration_success');
                  console.log(`👤 User ${userId}: Успешно зарегистрирован и авторизован`);
                } else {
                  console.log(`👤 User ${userId}: Регистрация может быть неуспешной`);
                }
              }
            }
          } else {
            console.log(`👤 User ${userId}: SMS код не найден, пропускаем верификацию`);
          }
        } else {
          // Если не перешли на SMS-верификацию, проверяем авторизацию
          const token = await page.evaluate(() => localStorage.getItem('accessToken'));
          if (token) {
            userStats.authToken = token;
            userStats.actions.push('registration_success');
            console.log(`👤 User ${userId}: Успешно зарегистрирован без SMS`);
          }
        }
        
        // Сохраняем данные пользователя
        globalData.createdUsers.push({
          id: userId,
          username,
          phone,
          role: userStats.role,
          registeredAt: new Date()
        });
      }
      
      await page.waitForTimeout(CONFIG.actionDelay * 2);
    }
    
    // 3. ВХОД В СИСТЕМУ - как обычный пользователь
    console.log(`👤 User ${userId}: Пытается войти в систему`);
    
    // Проверяем, авторизован ли пользователь
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (token) {
      userStats.authToken = token;
      userStats.actions.push('already_logged_in');
      console.log(`👤 User ${userId}: Уже авторизован`);
    } else {
      // Ищем кнопку входа
      const loginButton = page.locator('text=Войти').first();
      if (await loginButton.count() > 0) {
      await loginButton.click({ force: true });
      await page.waitForLoadState('networkidle');
      userStats.actions.push('clicked_login_button');
      console.log(`👤 User ${userId}: Нажал на кнопку 'Войти'`);
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Заполняем форму входа
      const phoneInput = page.locator('input[placeholder*="+7"], input[type="tel"]').first();
      if (await phoneInput.count() > 0) {
        await phoneInput.fill(phone);
        userStats.actions.push('filled_login_phone');
        console.log(`👤 User ${userId}: Ввел телефон для входа`);
      }
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(password);
        userStats.actions.push('filled_login_password');
        console.log(`👤 User ${userId}: Ввел пароль для входа`);
      }
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Нажимаем кнопку входа
      const submitLoginButton = page.locator('button[type="submit"], button:has-text("Войти")').first();
      if (await submitLoginButton.count() > 0) {
        await submitLoginButton.click({ force: true });
        userStats.actions.push('submitted_login');
        console.log(`👤 User ${userId}: Нажал 'Войти'`);
        
        await page.waitForTimeout(CONFIG.actionDelay * 3);
        
        // Получаем токен авторизации
        const token = await page.evaluate(() => localStorage.getItem('accessToken'));
        if (token) {
          userStats.authToken = token;
          console.log(`👤 User ${userId}: Успешно вошел в систему`);
        }
      }
    }
    }
    
    // 4. ПОИСК И НАВИГАЦИЯ - как обычный пользователь
    console.log(`👤 User ${userId}: Ищет что-то на сайте`);
    
    // Ищем поисковую строку
    const searchInput = page.locator('input[placeholder*="Поиск"], input[placeholder*="Search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('мебель кухня');
      userStats.actions.push('searched_furniture');
      console.log(`👤 User ${userId}: Ищет 'мебель кухня'`);
      
      await page.waitForTimeout(CONFIG.actionDelay);
      
      // Нажимаем Enter или кнопку поиска
      await searchInput.press('Enter');
      userStats.actions.push('submitted_search');
      console.log(`👤 User ${userId}: Отправил поисковый запрос`);
      
      await page.waitForTimeout(CONFIG.actionDelay * 2);
    }
    
    // 5. ПОЛНЫЙ СЦЕНАРИЙ ДЛЯ КЛИЕНТОВ
    if (userStats.role === 'client') {
      console.log(`👤 User ${userId}: Начинает сценарий КЛИЕНТА`);
      
      // 5.1 ПРОСМОТР КАТАЛОГА МАСТЕРОВ
      console.log(`👤 User ${userId}: Переходит в каталог мастеров`);
      
      try {
        await page.goto(`${CONFIG.target}/masters`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_masters_catalog');
        console.log(`👤 User ${userId}: Смотрит каталог мастеров`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Кликает на профиль мастера
        const masterCards = page.locator('.master-card, [data-testid="master-card"], a[href*="/master/"]');
        const masterCount = await masterCards.count();
        if (masterCount > 0) {
          const randomMaster = Math.floor(Math.random() * Math.min(masterCount, 3));
          const masterCard = masterCards.nth(randomMaster);
          
          console.log(`👤 User ${userId}: Кликает на профиль мастера`);
          await masterCard.click();
          await page.waitForLoadState('networkidle');
          userStats.actions.push('viewed_master_profile');
          console.log(`👤 User ${userId}: Смотрит профиль мастера`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
          
          // Подписывается на мастера
          const subscribeButton = page.locator('button:has-text("Подписаться"), button:has-text("Subscribe")').first();
          if (await subscribeButton.count() > 0) {
            await subscribeButton.click();
            userStats.actions.push('subscribed_to_master');
            userStats.interactions.push('master_subscription');
            console.log(`👤 User ${userId}: Подписался на мастера`);
            
            await page.waitForTimeout(CONFIG.actionDelay);
          }
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Ошибка в каталоге мастеров - ${error.message}`);
      }
      
      // 5.2 СОЗДАНИЕ ЗАКАЗА
      console.log(`👤 User ${userId}: Создает заказ`);
      
      try {
        await page.goto(`${CONFIG.target}/orders/create`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_create_order');
        console.log(`👤 User ${userId}: Открыл страницу создания заказа`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Заполняет форму заказа
        const orderData = {
          title: `Заказ кухни от клиента ${userId}`,
          description: `Нужна кухня 3 метра, цвет белый, материал МДФ, бюджет 150000 тенге. Срок до 1 декабря 2025 года.`,
          region: 'Алматы',
          budget: '150000'
        };
        
        // Заголовок заказа
        const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill(orderData.title);
          userStats.actions.push('filled_order_title');
          console.log(`👤 User ${userId}: Ввел заголовок заказа`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Описание заказа
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
        if (await descInput.count() > 0) {
          await descInput.fill(orderData.description);
          userStats.actions.push('filled_order_description');
          console.log(`👤 User ${userId}: Ввел описание заказа`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Выбирает категорию
        const categorySelect = page.locator('select[name*="category"]').first();
        if (await categorySelect.count() > 0) {
          try {
            await categorySelect.selectOption('furniture');
            userStats.actions.push('selected_category');
            console.log(`👤 User ${userId}: Выбрал категорию`);
          } catch (error) {
            console.log(`👤 User ${userId}: Не удалось выбрать категорию - ${error.message}`);
          }
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Выбирает регион
        const regionSelect = page.locator('select[name*="region"]').first();
        if (await regionSelect.count() > 0) {
          try {
            await regionSelect.selectOption('Алматы');
            userStats.actions.push('selected_region');
            console.log(`👤 User ${userId}: Выбрал регион`);
          } catch (error) {
            console.log(`👤 User ${userId}: Не удалось выбрать регион - ${error.message}`);
          }
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Бюджет
        const budgetInput = page.locator('input[name*="budget"], input[placeholder*="бюджет"]').first();
        if (await budgetInput.count() > 0) {
          await budgetInput.fill(orderData.budget);
          userStats.actions.push('filled_budget');
          console.log(`👤 User ${userId}: Ввел бюджет`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Загружает фото
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(testImagePath);
          userStats.actions.push('uploaded_order_photo');
          userStats.uploadedContent.push('order_photo');
          console.log(`👤 User ${userId}: Загрузил фото заказа`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Отправляет заказ
        const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ"), button:has-text("Отправить")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          userStats.actions.push('submitted_order');
          userStats.uploadedContent.push('order_created');
          console.log(`👤 User ${userId}: Отправил заказ`);
          
          // Сохраняем заказ для взаимодействий
          globalData.createdOrders.push({
            id: `order_${userId}_${Date.now()}`,
            clientId: userId,
            title: orderData.title,
            description: orderData.description,
            status: 'pending',
            createdAt: new Date()
          });
          
          await page.waitForTimeout(CONFIG.actionDelay * 3);
        }
      } catch (error) {
        userStats.errors.push(`Order creation failed: ${error.message}`);
        console.log(`❌ User ${userId}: Ошибка создания заказа - ${error.message}`);
      }
      
      // 5.3 ПРОСМОТР СВОИХ ЗАКАЗОВ
      console.log(`👤 User ${userId}: Смотрит свои заказы`);
      
      try {
        await page.goto(`${CONFIG.target}/user/orders`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_my_orders');
        console.log(`👤 User ${userId}: Открыл страницу своих заказов`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Проверяет ответы мастеров
        const responseCards = page.locator('.response-card, [data-testid="response-card"]');
        const responseCount = await responseCards.count();
        if (responseCount > 0) {
          console.log(`👤 User ${userId}: Видит ответы мастеров`);
          
          // Принимает первый ответ
          const acceptButton = page.locator('button:has-text("Принять"), button:has-text("Accept")').first();
          if (await acceptButton.count() > 0) {
            await acceptButton.click();
            userStats.actions.push('accepted_master_response');
            userStats.interactions.push('order_acceptance');
            console.log(`👤 User ${userId}: Принял ответ мастера`);
            
            await page.waitForTimeout(CONFIG.actionDelay);
          }
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Ошибка просмотра заказов - ${error.message}`);
      }
      
      // 5.4 ЧАТ С МАСТЕРАМИ
      console.log(`👤 User ${userId}: Заходит в чат`);
      
      try {
        await page.goto(`${CONFIG.target}/chat`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_chat');
        console.log(`👤 User ${userId}: Открыл чат`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Отправляет сообщение
        const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
        if (await messageInput.count() > 0) {
          const messages = [
            `Привет! Интересует ваш заказ. Могу обсудить детали?`,
            `Здравствуйте! Хотел бы уточнить сроки выполнения`,
            `Добрый день! Есть ли возможность скидки?`,
            `Привет! Можете показать примеры работ?`
          ];
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          
          await messageInput.fill(randomMessage);
          userStats.actions.push('typed_message');
          console.log(`👤 User ${userId}: Написал сообщение`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
          
          await messageInput.press('Enter');
          userStats.actions.push('sent_chat_message');
          userStats.interactions.push('chat_message');
          console.log(`👤 User ${userId}: Отправил сообщение`);
          
          // Сохраняем чат для взаимодействий
          globalData.activeChats.push({
            clientId: userId,
            message: randomMessage,
            timestamp: new Date()
          });
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Ошибка в чате - ${error.message}`);
      }
      
      // 5.5 ОБНОВЛЕНИЕ ПРОФИЛЯ
      console.log(`👤 User ${userId}: Обновляет профиль`);
      
      try {
        await page.goto(`${CONFIG.target}/profile`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_profile');
        console.log(`👤 User ${userId}: Открыл профиль`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Загружает аватарку
        const avatarInput = page.locator('input[type="file"][accept*="image"]').first();
        if (await avatarInput.count() > 0) {
          await avatarInput.setInputFiles(testAvatarPath);
          userStats.actions.push('uploaded_avatar');
          userStats.uploadedContent.push('avatar');
          console.log(`👤 User ${userId}: Загрузил аватарку`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Обновляет информацию
        const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
        if (await bioInput.count() > 0) {
          await bioInput.fill(`Клиент ${userId}. Ищу качественную мебель для дома.`);
          userStats.actions.push('updated_bio');
          console.log(`👤 User ${userId}: Обновил информацию о себе`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Ошибка обновления профиля - ${error.message}`);
      }
    }
    
    // 6. ПОЛНЫЙ СЦЕНАРИЙ ДЛЯ МАСТЕРОВ
    if (userStats.role === 'master') {
      console.log(`👤 User ${userId}: Начинает сценарий МАСТЕРА`);
      
      // 6.1 НАСТРОЙКА ПРОФИЛЯ МАСТЕРА
      console.log(`👤 User ${userId}: Настраивает профиль мастера`);
      
      try {
        await page.goto(`${CONFIG.target}/profile`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_master_profile');
        console.log(`👤 User ${userId}: Открыл профиль мастера`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Заполняет профиль
        const nameInput = page.locator('input[name*="name"], input[placeholder*="имя"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill(`Мастер ${userId}`);
          userStats.actions.push('filled_master_name');
          console.log(`👤 User ${userId}: Ввел имя мастера`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
        if (await bioInput.count() > 0) {
          await bioInput.fill(`Опытный мастер по изготовлению мебели. Специализируюсь на кухнях и шкафах. Работаю с МДФ, массивом дерева. Опыт 5 лет.`);
          userStats.actions.push('filled_master_bio');
          console.log(`👤 User ${userId}: Заполнил описание мастера`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Загружает аватар
        const avatarInput = page.locator('input[type="file"][accept*="image"]').first();
        if (await avatarInput.count() > 0) {
          await avatarInput.setInputFiles(testAvatarPath);
          userStats.actions.push('uploaded_master_avatar');
          userStats.uploadedContent.push('master_avatar');
          console.log(`👤 User ${userId}: Загрузил аватар мастера`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Сохраняет профиль
        const saveButton = page.locator('button:has-text("Сохранить"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          userStats.actions.push('saved_master_profile');
          console.log(`👤 User ${userId}: Сохранил профиль мастера`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Ошибка настройки профиля - ${error.message}`);
      }
      
      // 6.2 ЗАГРУЗКА ВИДЕО
      console.log(`👤 User ${userId}: Загружает видео портфолио`);
      
      try {
        await page.goto(`${CONFIG.target}/create-video-ad`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_video_creation');
        console.log(`👤 User ${userId}: Открыл страницу создания видео`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Заполняет форму видео
        const videoData = {
          title: `Портфолио мастера ${userId} - Кухня из МДФ`,
          description: `Показываю процесс изготовления кухни из МДФ. Полный цикл от замеров до установки. Качественные материалы, гарантия 2 года.`,
          tags: 'мебель, кухня, МДФ, на заказ, ручная работа'
        };
        
        // Заголовок видео
        const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill(videoData.title);
          userStats.actions.push('filled_video_title');
          console.log(`👤 User ${userId}: Ввел заголовок видео`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Описание видео
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
        if (await descInput.count() > 0) {
          await descInput.fill(videoData.description);
          userStats.actions.push('filled_video_description');
          console.log(`👤 User ${userId}: Ввел описание видео`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Выбирает категорию
        const categorySelect = page.locator('select[name*="category"]').first();
        if (await categorySelect.count() > 0) {
          try {
            await categorySelect.selectOption('furniture');
            userStats.actions.push('selected_video_category');
            console.log(`👤 User ${userId}: Выбрал категорию видео`);
          } catch (error) {
            console.log(`👤 User ${userId}: Не удалось выбрать категорию видео - ${error.message}`);
          }
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Теги
        const tagsInput = page.locator('input[name*="tags"], input[placeholder*="теги"]').first();
        if (await tagsInput.count() > 0) {
          await tagsInput.fill(videoData.tags);
          userStats.actions.push('filled_video_tags');
          console.log(`👤 User ${userId}: Ввел теги видео`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Загружает видео
        const videoInput = page.locator('input[type="file"][accept*="video"]').first();
        if (await videoInput.count() > 0) {
          await videoInput.setInputFiles(testVideoPath);
          userStats.actions.push('selected_video_file');
          console.log(`👤 User ${userId}: Выбрал видео файл`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
        
        // Отправляет видео
        const submitButton = page.locator('button[type="submit"], button:has-text("Загрузить"), button:has-text("Отправить")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          userStats.actions.push('submitted_video');
          userStats.uploadedContent.push('video_uploaded');
          console.log(`👤 User ${userId}: Отправил видео`);
          
          // Сохраняем видео для взаимодействий
          globalData.createdVideos.push({
            id: `video_${userId}_${Date.now()}`,
            masterId: userId,
            title: videoData.title,
            description: videoData.description,
            createdAt: new Date()
          });
          
          await page.waitForTimeout(CONFIG.actionDelay * 5);
        }
      } catch (error) {
        userStats.errors.push(`Video upload failed: ${error.message}`);
        console.log(`❌ User ${userId}: Ошибка загрузки видео - ${error.message}`);
      }
      
      // 6.3 ПРОСМОТР ЗАКАЗОВ КЛИЕНТОВ
      console.log(`👤 User ${userId}: Смотрит заказы клиентов`);
      
      try {
        await page.goto(`${CONFIG.target}/master/orders`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_client_orders');
        console.log(`👤 User ${userId}: Открыл страницу заказов клиентов`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Откликается на заказы
        const orderCards = page.locator('.order-card, [data-testid="order-card"]');
        const orderCount = await orderCards.count();
        if (orderCount > 0) {
          const randomOrder = Math.floor(Math.random() * Math.min(orderCount, 2));
          const orderCard = orderCards.nth(randomOrder);
          
          console.log(`👤 User ${userId}: Видит заказ клиента`);
          
          // Отклик на заказ
          const respondButton = orderCard.locator('button:has-text("Откликнуться"), button:has-text("Respond")').first();
          if (await respondButton.count() > 0) {
            await respondButton.click();
            userStats.actions.push('clicked_respond_button');
            console.log(`👤 User ${userId}: Нажал 'Откликнуться'`);
            
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(CONFIG.actionDelay);
            
            // Заполняет отклик
            const responseText = `Готов выполнить ваш заказ! Опыт 5 лет, качественные материалы. Срок 2 недели. Цена 120000 тенге.`;
            const responseInput = page.locator('textarea[placeholder*="отклик"], textarea[placeholder*="предложение"]').first();
            if (await responseInput.count() > 0) {
              await responseInput.fill(responseText);
              userStats.actions.push('filled_response');
              console.log(`👤 User ${userId}: Написал отклик`);
              
              await page.waitForTimeout(CONFIG.actionDelay);
            }
            
            // Отправляет отклик
            const submitResponseButton = page.locator('button:has-text("Отправить отклик"), button:has-text("Submit")').first();
            if (await submitResponseButton.count() > 0) {
              await submitResponseButton.click();
              userStats.actions.push('submitted_response');
              userStats.uploadedContent.push('order_response');
              userStats.interactions.push('order_response');
              console.log(`👤 User ${userId}: Отправил отклик`);
              
              await page.waitForTimeout(CONFIG.actionDelay);
            }
          }
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Ошибка отклика на заказ - ${error.message}`);
      }
      
      // 6.4 ЧАТ С КЛИЕНТАМИ
      console.log(`👤 User ${userId}: Заходит в чат с клиентами`);
      
      try {
        await page.goto(`${CONFIG.target}/chat`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_master_chat');
        console.log(`👤 User ${userId}: Открыл чат`);
        
        await page.waitForTimeout(CONFIG.actionDelay);
        
        // Отправляет сообщение клиенту
        const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
        if (await messageInput.count() > 0) {
          const messages = [
            `Здравствуйте! Готов обсудить ваш заказ. Могу показать примеры работ.`,
            `Добрый день! Есть вопросы по заказу? Могу проконсультировать.`,
            `Привет! Готов приступить к работе. Когда удобно встретиться?`,
            `Здравствуйте! Могу предложить скидку 10% при заказе на сумму свыше 100000 тенге.`
          ];
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          
          await messageInput.fill(randomMessage);
          userStats.actions.push('typed_master_message');
          console.log(`👤 User ${userId}: Написал сообщение клиенту`);
          
          await page.waitForTimeout(CONFIG.actionDelay);
          
          await messageInput.press('Enter');
          userStats.actions.push('sent_master_message');
          userStats.interactions.push('master_chat_message');
          console.log(`👤 User ${userId}: Отправил сообщение клиенту`);
          
          // Сохраняем чат для взаимодействий
          globalData.activeChats.push({
            masterId: userId,
            message: randomMessage,
            timestamp: new Date()
          });
          
          await page.waitForTimeout(CONFIG.actionDelay);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Ошибка в чате - ${error.message}`);
      }
    }
    
    // 7. ОБЩИЕ ДЕЙСТВИЯ
    console.log(`👤 User ${userId}: Просматривает уведомления`);
    
    try {
      await page.goto(`${CONFIG.target}/notifications`, { waitUntil: 'networkidle' });
      userStats.actions.push('viewed_notifications');
      console.log(`👤 User ${userId}: Открыл уведомления`);
      
      await page.waitForTimeout(CONFIG.actionDelay);
    } catch (error) {
      console.log(`👤 User ${userId}: Ошибка просмотра уведомлений - ${error.message}`);
    }
    
    userStats.endTime = Date.now();
    userStats.duration = userStats.endTime - userStats.startTime;
    
    console.log(`✅ User ${userId}: Завершил ${userStats.role} сценарий за ${userStats.duration}ms`);
    console.log(`📊 User ${userId}: Действия: ${userStats.actions.join(', ')}`);
    console.log(`📊 User ${userId}: Контент: ${userStats.uploadedContent.join(', ')}`);
    console.log(`📊 User ${userId}: Взаимодействия: ${userStats.interactions.join(', ')}`);
    
    return userStats;
    
  } catch (error) {
    console.log(`💥 User ${userId}: Критическая ошибка - ${error.message}`);
    userStats.errors.push(`Critical error: ${error.message}`);
    userStats.endTime = Date.now();
    return userStats;
  } finally {
    await browser.close();
  }
}

// Запуск РЕАЛЬНОГО UI теста
async function runRealUITest() {
  console.log('🚀 STARTING REAL UI LOAD TEST FOR MEBELPLACE');
  console.log('═'.repeat(80));
  console.log(`🎯 Target: ${CONFIG.target}`);
  console.log(`👥 Total Users: ${CONFIG.totalUsers}`);
  console.log(`⏱️  Duration: ${CONFIG.testDuration}s`);
  console.log(`🔄 Concurrent: ${CONFIG.concurrentUsers}`);
  console.log(`🖱️  Real UI: ENABLED (пользователи нажимают кнопки как люди)`);
  console.log('═'.repeat(80));
  
  const startTime = Date.now();
  const users = [];
  
  // Создаем пользователей с интервалом
  for (let i = 0; i < CONFIG.totalUsers; i++) {
    const delay = i * CONFIG.userDelay;
    
    setTimeout(async () => {
      const user = await simulateRealUser(i + 1);
      users.push(user);
      stats.users.push(user);
      
      console.log(`👤 User ${i + 1} завершил (${stats.users.length} всего пользователей)`);
    }, delay);
  }
  
  // Ждем завершения
  await new Promise(resolve => setTimeout(resolve, CONFIG.testDuration * 1000));
  
  // Анализ результатов
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  const totalActions = users.reduce((sum, user) => sum + user.actions.length, 0);
  const totalErrors = users.reduce((sum, user) => sum + user.errors.length, 0);
  const totalContent = users.reduce((sum, user) => sum + user.uploadedContent.length, 0);
  const totalInteractions = users.reduce((sum, user) => sum + user.interactions.length, 0);
  const avgDuration = users.reduce((sum, user) => sum + (user.duration || 0), 0) / users.length;
  
  // Статистика по ролям
  const clients = users.filter(u => u.role === 'client');
  const masters = users.filter(u => u.role === 'master');
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 REAL UI LOAD TEST RESULTS');
  console.log('═'.repeat(80));
  console.log(`⏱️  Test Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`👥 Total Users: ${stats.users.length}`);
  console.log(`👤 Clients: ${clients.length}`);
  console.log(`🔨 Masters: ${masters.length}`);
  console.log(`🎬 Total Actions: ${totalActions}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`📁 Content Created: ${totalContent}`);
  console.log(`🤝 Total Interactions: ${totalInteractions}`);
  console.log(`📊 Avg User Duration: ${avgDuration.toFixed(2)}ms`);
  
  // Детальная статистика
  const actionCounts = {};
  const contentCounts = {};
  const interactionCounts = {};
  const roleStats = { client: { actions: 0, content: 0, interactions: 0 }, master: { actions: 0, content: 0, interactions: 0 } };
  
  users.forEach(user => {
    user.actions.forEach(action => {
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    user.uploadedContent.forEach(content => {
      contentCounts[content] = (contentCounts[content] || 0) + 1;
    });
    user.interactions.forEach(interaction => {
      interactionCounts[interaction] = (interactionCounts[interaction] || 0) + 1;
    });
    
    if (user.role) {
      roleStats[user.role].actions += user.actions.length;
      roleStats[user.role].content += user.uploadedContent.length;
      roleStats[user.role].interactions += user.interactions.length;
    }
  });
  
  console.log('\n📋 ACTION BREAKDOWN:');
  Object.entries(actionCounts).forEach(([action, count]) => {
    console.log(`  ${action}: ${count} раз`);
  });
  
  console.log('\n📁 CONTENT CREATED:');
  Object.entries(contentCounts).forEach(([content, count]) => {
    console.log(`  ${content}: ${count} элементов`);
  });
  
  console.log('\n🤝 INTERACTIONS:');
  Object.entries(interactionCounts).forEach(([interaction, count]) => {
    console.log(`  ${interaction}: ${count} раз`);
  });
  
  console.log('\n👥 ROLE STATISTICS:');
  console.log(`  Clients: ${roleStats.client.actions} действий, ${roleStats.client.content} контента, ${roleStats.client.interactions} взаимодействий`);
  console.log(`  Masters: ${roleStats.master.actions} действий, ${roleStats.master.content} контента, ${roleStats.master.interactions} взаимодействий`);
  
  // Глобальные данные
  console.log('\n🌍 GLOBAL DATA:');
  console.log(`  Created Orders: ${globalData.createdOrders.length}`);
  console.log(`  Created Videos: ${globalData.createdVideos.length}`);
  console.log(`  Active Chats: ${globalData.activeChats.length}`);
  console.log(`  Created Users: ${globalData.createdUsers.length}`);
  
  // Оценка
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (totalErrors < totalActions * 0.1) {
    console.log('✅ ОТЛИЧНО - Сайт отлично справляется со всеми сценариями!');
  } else if (totalErrors < totalActions * 0.3) {
    console.log('⚠️  ХОРОШО - Обнаружены некоторые проблемы, но в целом работает');
  } else {
    console.log('❌ ТРЕБУЕТ ОПТИМИЗАЦИИ - Обнаружены значительные проблемы');
  }
  
  console.log('═'.repeat(80));
}

// Запуск
runRealUITest().catch(console.error);
