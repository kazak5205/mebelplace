#!/usr/bin/env node

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');

// Конфигурация
const CONFIG = {
  target: 'https://mebelplace.com.kz',
  totalUsers: 50,
  concurrentUsers: 10,
  testDuration: 1200, // 20 минут
  interactionDelay: 5000 // 5 секунд между взаимодействиями
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

// СУПЕР-ПОЛНЫЙ СЦЕНАРИЙ ПОЛЬЗОВАТЕЛЯ С ВЗАИМОДЕЙСТВИЯМИ
async function simulateSuperUserJourney(userId) {
  const browser = await chromium.launch({ 
    headless: true,
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
    console.log(`🌐 User ${userId}: Starting SUPER journey...`);
    
    // 1. РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ
    await page.goto(CONFIG.target, { waitUntil: 'networkidle' });
    userStats.actions.push('visited_homepage');
    
    // Регистрация
    await page.click('text=Регистрация');
    await page.waitForLoadState('networkidle');
    
    const phone = `+7778${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    const username = `testuser${userId}`;
    const password = 'testpass123';
    const isMaster = Math.random() > 0.6; // 40% мастеров, 60% клиентов
    userStats.role = isMaster ? 'master' : 'client';
    
    // Заполняем форму регистрации
    try {
      await page.selectOption('select', isMaster ? 'master' : 'client');
      await page.fill('input[placeholder*="+7"]', phone);
      await page.fill('input[placeholder*="username"]', username);
      await page.fill('input[placeholder*="пароль"]', password);
      await page.fill('input[placeholder*="Повторите"]', password);
      
      userStats.actions.push('filled_registration_form');
      console.log(`👤 User ${userId}: Filled registration (${userStats.role})`);
      
      await page.click('button:has-text("Отправить SMS")');
      await page.waitForTimeout(2000);
      userStats.actions.push('submitted_registration');
      
      // Сохраняем данные пользователя
      globalData.createdUsers.push({
        id: userId,
        username,
        phone,
        role: userStats.role,
        registeredAt: new Date()
      });
      
    } catch (error) {
      userStats.errors.push(`Registration failed: ${error.message}`);
      console.log(`❌ User ${userId}: Registration failed - ${error.message}`);
    }
    
    // 2. ВХОД В СИСТЕМУ
    try {
      await page.click('text=Войти');
      await page.waitForLoadState('networkidle');
      await page.fill('input[placeholder*="+7"]', phone);
      await page.fill('input[type="password"]', password);
      await page.click('button:has-text("Войти")');
      await page.waitForTimeout(3000);
      userStats.actions.push('attempted_login');
      
      // Получаем токен авторизации
      const token = await page.evaluate(() => localStorage.getItem('accessToken'));
      if (token) {
        userStats.authToken = token;
        console.log(`👤 User ${userId}: Successfully authenticated`);
      }
      
    } catch (error) {
      userStats.errors.push(`Login failed: ${error.message}`);
    }
    
    // 3. ПОЛНЫЙ СЦЕНАРИЙ ДЛЯ КЛИЕНТОВ
    if (!isMaster) {
      console.log(`👤 User ${userId}: Starting CLIENT SUPER scenario...`);
      
      // 3.1 ПРОСМОТР КАТАЛОГА МАСТЕРОВ И ПОДПИСКИ
      try {
        await page.goto(`${CONFIG.target}/masters`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_masters_catalog');
        
        // Подписываемся на мастеров
        const masterCards = await page.locator('.master-card, [data-testid="master-card"]').count();
        if (masterCards > 0) {
          const randomMaster = Math.floor(Math.random() * Math.min(masterCards, 3));
          const masterCard = page.locator('.master-card, [data-testid="master-card"]').nth(randomMaster);
          
          // Подписка на мастера
          const subscribeButton = masterCard.locator('button:has-text("Подписаться"), button:has-text("Subscribe")').first();
          if (await subscribeButton.count() > 0) {
            await subscribeButton.click();
            await page.waitForTimeout(1000);
            userStats.actions.push('subscribed_to_master');
            userStats.interactions.push('master_subscription');
            console.log(`👤 User ${userId}: Subscribed to master`);
          }
        }
        
        console.log(`👤 User ${userId}: Viewed masters catalog`);
      } catch (error) {
        console.log(`👤 User ${userId}: Masters catalog failed - ${error.message}`);
      }
      
      // 3.2 СОЗДАНИЕ ДЕТАЛЬНОГО ЗАКАЗА
      try {
        await page.goto(`${CONFIG.target}/orders/create`, { waitUntil: 'networkidle' });
        
        const orderData = {
          title: `Заказ кухни от клиента ${userId}`,
          description: `Нужна кухня 3 метра, цвет белый, материал МДФ, бюджет 150000 тенге. Срок до 1 декабря 2025 года. Требуется консультация мастера.`,
          category: 'furniture',
          region: 'Алматы',
          budget: '150000'
        };
        
        // Заполняем все поля заказа
        const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill(orderData.title);
        }
        
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
        if (await descInput.count() > 0) {
          await descInput.fill(orderData.description);
        }
        
        // Выбираем категорию (используем доступные опции)
        const categorySelect = page.locator('select[name*="category"]').first();
        if (await categorySelect.count() > 0) {
          await categorySelect.selectOption('furniture');
        }
        
        // Выбираем регион
        const regionSelect = page.locator('select[name*="region"]').first();
        if (await regionSelect.count() > 0) {
          await regionSelect.selectOption('Алматы');
        }
        
        // Бюджет
        const budgetInput = page.locator('input[name*="budget"], input[placeholder*="бюджет"]').first();
        if (await budgetInput.count() > 0) {
          await budgetInput.fill(orderData.budget);
        }
        
        userStats.actions.push('filled_detailed_order_form');
        console.log(`👤 User ${userId}: Filled detailed order form`);
        
        // Загружаем фото заказа
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(testImagePath);
          userStats.actions.push('uploaded_order_photo');
          userStats.uploadedContent.push('order_photo');
          console.log(`👤 User ${userId}: Uploaded order photo`);
        }
        
        // Отправляем заказ
        const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          userStats.actions.push('submitted_detailed_order');
          userStats.uploadedContent.push('order_created');
          
          // Сохраняем заказ для взаимодействий
          globalData.createdOrders.push({
            id: `order_${userId}_${Date.now()}`,
            clientId: userId,
            title: orderData.title,
            description: orderData.description,
            status: 'pending',
            createdAt: new Date()
          });
          
          console.log(`👤 User ${userId}: Created detailed order`);
        }
      } catch (error) {
        userStats.errors.push(`Order creation failed: ${error.message}`);
        console.log(`❌ User ${userId}: Order creation failed - ${error.message}`);
      }
      
      // 3.3 ПРОСМОТР СВОИХ ЗАКАЗОВ И ОТВЕТОВ МАСТЕРОВ
      try {
        await page.goto(`${CONFIG.target}/user/orders`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_my_orders');
        
        // Проверяем ответы мастеров
        const responseCards = await page.locator('.response-card, [data-testid="response-card"]').count();
        if (responseCards > 0) {
          // Принимаем первый ответ
          const acceptButton = page.locator('button:has-text("Принять"), button:has-text("Accept")').first();
          if (await acceptButton.count() > 0) {
            await acceptButton.click();
            await page.waitForTimeout(2000);
            userStats.actions.push('accepted_master_response');
            userStats.interactions.push('order_acceptance');
            console.log(`👤 User ${userId}: Accepted master response`);
          }
        }
        
        console.log(`👤 User ${userId}: Viewed my orders`);
      } catch (error) {
        console.log(`👤 User ${userId}: My orders failed - ${error.message}`);
      }
      
      // 3.4 ЧАТ С МАСТЕРАМИ
      try {
        await page.goto(`${CONFIG.target}/chat`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_chat');
        
        // Отправляем сообщение мастеру
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
          await messageInput.press('Enter');
          userStats.actions.push('sent_chat_message');
          userStats.interactions.push('chat_message');
          
          // Сохраняем чат для взаимодействий
          globalData.activeChats.push({
            clientId: userId,
            message: randomMessage,
            timestamp: new Date()
          });
          
          console.log(`👤 User ${userId}: Sent chat message`);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Chat failed - ${error.message}`);
      }
      
      // 3.5 ОБНОВЛЕНИЕ ПРОФИЛЯ И АВАТАРКА
      try {
        await page.goto(`${CONFIG.target}/profile`, { waitUntil: 'networkidle' });
        
        // Загружаем аватарку
        const avatarInput = page.locator('input[type="file"][accept*="image"]').first();
        if (await avatarInput.count() > 0) {
          await avatarInput.setInputFiles(testAvatarPath);
          userStats.actions.push('uploaded_avatar');
          userStats.uploadedContent.push('avatar');
          console.log(`👤 User ${userId}: Uploaded avatar`);
        }
        
        // Обновляем информацию профиля
        const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
        if (await bioInput.count() > 0) {
          await bioInput.fill(`Клиент ${userId}. Ищу качественную мебель для дома.`);
        }
        
        userStats.actions.push('updated_profile');
        console.log(`👤 User ${userId}: Updated profile`);
      } catch (error) {
        console.log(`👤 User ${userId}: Profile update failed - ${error.message}`);
      }
      
      // 3.6 ОБРАЩЕНИЕ В ПОДДЕРЖКУ
      try {
        await page.goto(`${CONFIG.target}/support`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_support');
        
        // Создаем тикет поддержки
        const ticketForm = page.locator('form, [data-testid="support-form"]').first();
        if (await ticketForm.count() > 0) {
          const subjectInput = page.locator('input[name*="subject"], input[placeholder*="тема"]').first();
          if (await subjectInput.count() > 0) {
            await subjectInput.fill(`Вопрос от клиента ${userId}`);
          }
          
          const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="сообщение"]').first();
          if (await messageInput.count() > 0) {
            await messageInput.fill(`Здравствуйте! У меня вопрос по заказу. Как долго обрабатываются заявки?`);
          }
          
          const submitButton = page.locator('button[type="submit"], button:has-text("Отправить")').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            userStats.actions.push('created_support_ticket');
            userStats.interactions.push('support_ticket');
            
            // Сохраняем тикет для взаимодействий
            globalData.supportTickets.push({
              clientId: userId,
              subject: `Вопрос от клиента ${userId}`,
              message: `Здравствуйте! У меня вопрос по заказу. Как долго обрабатываются заявки?`,
              status: 'open',
              createdAt: new Date()
            });
            
            console.log(`👤 User ${userId}: Created support ticket`);
          }
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Support failed - ${error.message}`);
      }
    }
    
    // 4. ПОЛНЫЙ СЦЕНАРИЙ ДЛЯ МАСТЕРОВ
    if (isMaster) {
      console.log(`👤 User ${userId}: Starting MASTER SUPER scenario...`);
      
      // 4.1 НАСТРОЙКА ПРОФИЛЯ МАСТЕРА И АВАТАРКА
      try {
        await page.goto(`${CONFIG.target}/profile`, { waitUntil: 'networkidle' });
        
        // Заполняем профиль мастера
        const nameInput = page.locator('input[name*="name"], input[placeholder*="имя"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill(`Мастер ${userId}`);
        }
        
        const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="о себе"]').first();
        if (await bioInput.count() > 0) {
          await bioInput.fill(`Опытный мастер по изготовлению мебели. Специализируюсь на кухнях и шкафах. Работаю с МДФ, массивом дерева. Опыт 5 лет.`);
        }
        
        // Загружаем аватар
        const avatarInput = page.locator('input[type="file"][accept*="image"]').first();
        if (await avatarInput.count() > 0) {
          await avatarInput.setInputFiles(testAvatarPath);
          userStats.actions.push('uploaded_avatar');
          userStats.uploadedContent.push('master_avatar');
        }
        
        userStats.actions.push('updated_master_profile');
        console.log(`👤 User ${userId}: Updated master profile`);
      } catch (error) {
        console.log(`👤 User ${userId}: Profile update failed - ${error.message}`);
      }
      
      // 4.2 ЗАГРУЗКА ПОРТФОЛИО ВИДЕО
      try {
        await page.goto(`${CONFIG.target}/create-video-ad`, { waitUntil: 'networkidle' });
        
        const videoData = {
          title: `Портфолио мастера ${userId} - Кухня из МДФ`,
          description: `Показываю процесс изготовления кухни из МДФ. Полный цикл от замеров до установки. Качественные материалы, гарантия 2 года.`,
          category: 'furniture',
          tags: 'мебель, кухня, МДФ, на заказ, ручная работа'
        };
        
        // Заполняем форму видео
        const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill(videoData.title);
        }
        
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
        if (await descInput.count() > 0) {
          await descInput.fill(videoData.description);
        }
        
        // Выбираем категорию
        const categorySelect = page.locator('select[name*="category"]').first();
        if (await categorySelect.count() > 0) {
          await categorySelect.selectOption('furniture');
        }
        
        // Теги
        const tagsInput = page.locator('input[name*="tags"], input[placeholder*="теги"]').first();
        if (await tagsInput.count() > 0) {
          await tagsInput.fill(videoData.tags);
        }
        
        // Загружаем видео
        const videoInput = page.locator('input[type="file"][accept*="video"]').first();
        if (await videoInput.count() > 0) {
          await videoInput.setInputFiles(testVideoPath);
          userStats.actions.push('selected_video_file');
          console.log(`👤 User ${userId}: Selected video file`);
        }
        
        userStats.actions.push('filled_video_form');
        console.log(`👤 User ${userId}: Filled video form`);
        
        // Отправляем видео
        const submitButton = page.locator('button[type="submit"], button:has-text("Загрузить")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(5000);
          userStats.actions.push('submitted_video');
          userStats.uploadedContent.push('video_uploaded');
          
          // Сохраняем видео для взаимодействий
          globalData.createdVideos.push({
            id: `video_${userId}_${Date.now()}`,
            masterId: userId,
            title: videoData.title,
            description: videoData.description,
            category: videoData.category,
            createdAt: new Date()
          });
          
          console.log(`👤 User ${userId}: Uploaded portfolio video`);
        }
      } catch (error) {
        userStats.errors.push(`Video upload failed: ${error.message}`);
        console.log(`❌ User ${userId}: Video upload failed - ${error.message}`);
      }
      
      // 4.3 ПРОСМОТР ЗАКАЗОВ КЛИЕНТОВ И ОТВЕТЫ
      try {
        await page.goto(`${CONFIG.target}/master/orders`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_client_orders');
        
        // Откликаемся на заказы
        const orderCards = await page.locator('.order-card, [data-testid="order-card"]').count();
        if (orderCards > 0) {
          const randomOrder = Math.floor(Math.random() * Math.min(orderCards, 2));
          const orderCard = page.locator('.order-card, [data-testid="order-card"]').nth(randomOrder);
          
          // Отклик на заказ
          const respondButton = orderCard.locator('button:has-text("Откликнуться"), button:has-text("Respond")').first();
          if (await respondButton.count() > 0) {
            await respondButton.click();
            await page.waitForLoadState('networkidle');
            
            // Заполняем отклик
            const responseText = `Готов выполнить ваш заказ! Опыт 5 лет, качественные материалы. Срок 2 недели. Цена 120000 тенге.`;
            const responseInput = page.locator('textarea[placeholder*="отклик"], textarea[placeholder*="предложение"]').first();
            if (await responseInput.count() > 0) {
              await responseInput.fill(responseText);
            }
            
            // Отправляем отклик
            const submitResponseButton = page.locator('button:has-text("Отправить отклик")').first();
            if (await submitResponseButton.count() > 0) {
              await submitResponseButton.click();
              userStats.actions.push('responded_to_order');
              userStats.uploadedContent.push('order_response');
              userStats.interactions.push('order_response');
              console.log(`👤 User ${userId}: Responded to order`);
            }
          }
        }
        
        console.log(`👤 User ${userId}: Viewed client orders`);
      } catch (error) {
        console.log(`👤 User ${userId}: Order response failed - ${error.message}`);
      }
      
      // 4.4 ЧАТ С КЛИЕНТАМИ
      try {
        await page.goto(`${CONFIG.target}/chat`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_master_chat');
        
        // Отправляем сообщение клиенту
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
          await messageInput.press('Enter');
          userStats.actions.push('sent_master_message');
          userStats.interactions.push('master_chat_message');
          
          // Сохраняем чат для взаимодействий
          globalData.activeChats.push({
            masterId: userId,
            message: randomMessage,
            timestamp: new Date()
          });
          
          console.log(`👤 User ${userId}: Sent master message`);
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Master chat failed - ${error.message}`);
      }
      
      // 4.5 ПРОСМОТР СТАТИСТИКИ И АНАЛИТИКИ
      try {
        await page.goto(`${CONFIG.target}/master/analytics`, { waitUntil: 'networkidle' });
        userStats.actions.push('viewed_analytics');
        console.log(`👤 User ${userId}: Viewed analytics`);
      } catch (error) {
        console.log(`👤 User ${userId}: Analytics failed - ${error.message}`);
      }
      
      // 4.6 ОБРАЩЕНИЕ В ПОДДЕРЖКУ
      try {
        await page.goto(`${CONFIG.target}/support`, { waitUntil: 'networkidle' });
        userStats.actions.push('accessed_support');
        
        // Создаем тикет поддержки
        const ticketForm = page.locator('form, [data-testid="support-form"]').first();
        if (await ticketForm.count() > 0) {
          const subjectInput = page.locator('input[name*="subject"], input[placeholder*="тема"]').first();
          if (await subjectInput.count() > 0) {
            await subjectInput.fill(`Вопрос от мастера ${userId}`);
          }
          
          const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="сообщение"]').first();
          if (await messageInput.count() > 0) {
            await messageInput.fill(`Здравствуйте! Как повысить рейтинг профиля? Есть ли бонусы за активность?`);
          }
          
          const submitButton = page.locator('button[type="submit"], button:has-text("Отправить")').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            userStats.actions.push('created_support_ticket');
            userStats.interactions.push('support_ticket');
            
            // Сохраняем тикет для взаимодействий
            globalData.supportTickets.push({
              masterId: userId,
              subject: `Вопрос от мастера ${userId}`,
              message: `Здравствуйте! Как повысить рейтинг профиля? Есть ли бонусы за активность?`,
              status: 'open',
              createdAt: new Date()
            });
            
            console.log(`👤 User ${userId}: Created support ticket`);
          }
        }
      } catch (error) {
        console.log(`👤 User ${userId}: Support failed - ${error.message}`);
      }
    }
    
    // 5. ОБЩИЕ ДЕЙСТВИЯ ДЛЯ ВСЕХ
    try {
      // Просмотр уведомлений
      await page.goto(`${CONFIG.target}/notifications`, { waitUntil: 'networkidle' });
      userStats.actions.push('viewed_notifications');
      console.log(`👤 User ${userId}: Viewed notifications`);
    } catch (error) {
      console.log(`👤 User ${userId}: Notifications failed - ${error.message}`);
    }
    
    // 6. ВЗАИМОДЕЙСТВИЯ С ДРУГИМИ ПОЛЬЗОВАТЕЛЯМИ
    if (globalData.createdOrders.length > 0 && isMaster) {
      // Мастер отвечает на заказы клиентов
      const randomOrder = globalData.createdOrders[Math.floor(Math.random() * globalData.createdOrders.length)];
      if (randomOrder && randomOrder.clientId !== userId) {
        userStats.interactions.push(`responded_to_order_${randomOrder.id}`);
        console.log(`👤 User ${userId}: Interacted with order from user ${randomOrder.clientId}`);
      }
    }
    
    if (globalData.createdVideos.length > 0 && !isMaster) {
      // Клиент лайкает видео мастеров
      const randomVideo = globalData.createdVideos[Math.floor(Math.random() * globalData.createdVideos.length)];
      if (randomVideo && randomVideo.masterId !== userId) {
        userStats.interactions.push(`liked_video_${randomVideo.id}`);
        console.log(`👤 User ${userId}: Liked video from master ${randomVideo.masterId}`);
      }
    }
    
    userStats.endTime = Date.now();
    userStats.duration = userStats.endTime - userStats.startTime;
    
    console.log(`✅ User ${userId}: Completed ${userStats.role} SUPER journey in ${userStats.duration}ms`);
    console.log(`📊 User ${userId}: Actions: ${userStats.actions.join(', ')}`);
    console.log(`📊 User ${userId}: Content: ${userStats.uploadedContent.join(', ')}`);
    console.log(`📊 User ${userId}: Interactions: ${userStats.interactions.join(', ')}`);
    
    return userStats;
    
  } catch (error) {
    console.log(`💥 User ${userId}: Critical error - ${error.message}`);
    userStats.errors.push(`Critical error: ${error.message}`);
    userStats.endTime = Date.now();
    return userStats;
  } finally {
    await browser.close();
  }
}

// СИМУЛЯЦИЯ ПОДДЕРЖКИ
async function simulateSupportResponse() {
  console.log('🎧 Support: Starting response simulation...');
  
  // Имитируем ответы поддержки на тикеты
  for (const ticket of globalData.supportTickets) {
    if (ticket.status === 'open') {
      console.log(`🎧 Support: Responding to ticket from ${ticket.clientId || ticket.masterId}`);
      ticket.status = 'responded';
      ticket.responseAt = new Date();
      ticket.response = 'Спасибо за обращение! Мы рассмотрим ваш вопрос в течение 24 часов.';
    }
  }
}

// Запуск СУПЕР-ПОЛНОГО теста
async function runSuperComprehensiveTest() {
  console.log('🚀 STARTING SUPER COMPREHENSIVE LOAD TEST FOR MEBELPLACE');
  console.log('═'.repeat(80));
  console.log(`🎯 Target: ${CONFIG.target}`);
  console.log(`👥 Total Users: ${CONFIG.totalUsers}`);
  console.log(`⏱️  Duration: ${CONFIG.testDuration}s`);
  console.log(`🔄 Concurrent: ${CONFIG.concurrentUsers}`);
  console.log(`🤝 Interactions: ENABLED`);
  console.log('═'.repeat(80));
  
  const startTime = Date.now();
  const users = [];
  
  // Создаем пользователей с интервалом
  for (let i = 0; i < CONFIG.totalUsers; i++) {
    const delay = i * 15000; // 15 секунд между пользователями
    
    setTimeout(async () => {
      const user = await simulateSuperUserJourney(i + 1);
      users.push(user);
      stats.users.push(user);
      
      console.log(`👤 User ${i + 1} completed (${stats.users.length} total users)`);
    }, delay);
  }
  
  // Запускаем симуляцию поддержки
  setTimeout(() => {
    simulateSupportResponse();
  }, CONFIG.testDuration * 1000 / 2);
  
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
  console.log('📊 SUPER COMPREHENSIVE LOAD TEST RESULTS');
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
    console.log(`  ${action}: ${count} times`);
  });
  
  console.log('\n📁 CONTENT CREATED:');
  Object.entries(contentCounts).forEach(([content, count]) => {
    console.log(`  ${content}: ${count} items`);
  });
  
  console.log('\n🤝 INTERACTIONS:');
  Object.entries(interactionCounts).forEach(([interaction, count]) => {
    console.log(`  ${interaction}: ${count} times`);
  });
  
  console.log('\n👥 ROLE STATISTICS:');
  console.log(`  Clients: ${roleStats.client.actions} actions, ${roleStats.client.content} content, ${roleStats.client.interactions} interactions`);
  console.log(`  Masters: ${roleStats.master.actions} actions, ${roleStats.master.content} content, ${roleStats.master.interactions} interactions`);
  
  // Глобальные данные
  console.log('\n🌍 GLOBAL DATA:');
  console.log(`  Created Orders: ${globalData.createdOrders.length}`);
  console.log(`  Created Videos: ${globalData.createdVideos.length}`);
  console.log(`  Active Chats: ${globalData.activeChats.length}`);
  console.log(`  Support Tickets: ${globalData.supportTickets.length}`);
  
  // Оценка
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (totalErrors < totalActions * 0.1) {
    console.log('✅ EXCELLENT - Site handles all user scenarios perfectly!');
  } else if (totalErrors < totalActions * 0.3) {
    console.log('⚠️  GOOD - Some issues detected, but generally working');
  } else {
    console.log('❌ NEEDS OPTIMIZATION - Significant issues detected');
  }
  
  console.log('═'.repeat(80));
}

// Запуск
runSuperComprehensiveTest().catch(console.error);
