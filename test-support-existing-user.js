const { chromium } = require('playwright');

// 🚀 ТЕСТ С СУЩЕСТВУЮЩИМ ПОЛЬЗОВАТЕЛЕМ
async function testSupportWithExistingUser() {
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
    console.log('🌐 Переходим на страницу логина...');
    
    await page.goto('https://mebelplace.com.kz/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('✅ Страница логина загружена');
    
    // Используем существующего пользователя
    console.log('📝 Заполняем форму логина с существующим пользователем...');
    await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill('+77770000500'); // Client500
    await page.waitForTimeout(500);
    
    await page.locator('input[type="password"]').fill('testpass123');
    await page.waitForTimeout(500);
    
    console.log('✅ Форма заполнена');
    
    // Перехватываем сетевые запросы
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/auth/login')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/login')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    // Нажимаем кнопку логина
    console.log('🔐 Нажимаем кнопку "Войти"...');
    await page.locator('button:has-text("Войти")').click();
    
    // Ждем ответа
    await page.waitForTimeout(5000);
    
    console.log('📡 Сетевые запросы:');
    requests.forEach((req, i) => {
      console.log(`   Request ${i + 1}: ${req.method} ${req.url}`);
      console.log(`   Data:`, req.postData);
    });
    
    console.log('📡 Сетевые ответы:');
    responses.forEach((res, i) => {
      console.log(`   Response ${i + 1}: ${res.status} ${res.url}`);
    });
    
    // Проверяем localStorage
    console.log('💾 Проверяем localStorage...');
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key);
        }
      }
      return items;
    });
    
    console.log('📦 localStorage содержимое:');
    Object.keys(localStorage).forEach(key => {
      const value = localStorage[key];
      console.log(`   ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
    });
    
    // Проверяем текущий URL
    const currentUrl = page.url();
    console.log(`🌐 Текущий URL: ${currentUrl}`);
    
    // Если логин успешен, тестируем поддержку
    if (localStorage.accessToken && !currentUrl.includes('/login')) {
      console.log('🎉 Логин успешен! Тестируем поддержку...');
      
      // Тестируем API напрямую
      console.log('🧪 Тестируем API /api/support/contact...');
      
      const apiResponse = await page.evaluate(async (token) => {
        try {
          const res = await fetch('https://mebelplace.com.kz/api/support/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              subject: 'Тест поддержки - существующий пользователь',
              message: 'Это тестовое сообщение отправлено существующим пользователем через API.',
              priority: 'medium'
            })
          });
          
          const data = await res.json();
          return {
            status: res.status,
            success: res.ok,
            data: data
          };
        } catch (error) {
          return {
            status: 0,
            success: false,
            error: error.message
          };
        }
      }, localStorage.accessToken);
      
      console.log('📡 API ответ:', apiResponse);
      
      if (apiResponse.success) {
        console.log('🎉 УСПЕХ! Сообщение отправлено через API!');
      } else {
        console.log('❌ ОШИБКА API:', apiResponse.data?.message || apiResponse.error);
      }
      
      // Тестируем через UI
      console.log('🖱️ Тестируем через UI...');
      await page.goto('https://mebelplace.com.kz/user/support', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const contactButton = page.locator('button:has-text("Новое обращение")');
      if (await contactButton.count() > 0) {
        await contactButton.click();
        console.log('✅ Нажали кнопку "Новое обращение"');
        await page.waitForTimeout(2000);
        
        // Заполняем форму
        const subjectInput = page.locator('input[name*="subject"], input[placeholder*="тема"]').first();
        if (await subjectInput.count() > 0) {
          await subjectInput.fill('Тест поддержки - через UI');
          console.log('✅ Заполнили тему');
          await page.waitForTimeout(500);
        }
        
        const messageInput = page.locator('textarea[name*="message"], textarea[placeholder*="сообщение"]').first();
        if (await messageInput.count() > 0) {
          await messageInput.fill('Это тестовое сообщение отправлено через UI интерфейс существующим пользователем.');
          console.log('✅ Заполнили сообщение');
          await page.waitForTimeout(500);
        }
        
        // Отправляем форму
        const submitButton = page.locator('button[type="submit"], button:has-text("Отправить")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          console.log('✅ Отправили сообщение через UI');
          await page.waitForTimeout(3000);
        }
      }
      
    } else {
      console.log('❌ Логин не прошел успешно');
    }
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Проверяем базу данных
async function checkDatabase() {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const result = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM support_tickets;"');
    const count = parseInt(result.stdout.trim()) || 0;
    
    console.log(`📊 Тикетов поддержки в БД: ${count}`);
    return count;
    
  } catch (error) {
    console.log(`❌ Ошибка проверки БД: ${error.message}`);
    return 0;
  }
}

async function runTest() {
  console.log('🚀 ТЕСТ ПОДДЕРЖКИ С СУЩЕСТВУЮЩИМ ПОЛЬЗОВАТЕЛЕМ');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  
  // Проверяем БД до теста
  console.log('📊 Проверяем БД ДО теста...');
  const countBefore = await checkDatabase();
  
  // Запускаем тест
  await testSupportWithExistingUser();
  
  // Проверяем БД после теста
  console.log('📊 Проверяем БД ПОСЛЕ теста...');
  const countAfter = await checkDatabase();
  
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log(`📊 Результат:`);
  console.log(`   До теста: ${countBefore} тикетов`);
  console.log(`   После теста: ${countAfter} тикетов`);
  console.log(`   Изменение: ${countAfter - countBefore}`);
  
  if (countAfter > countBefore) {
    console.log('🎉 УСПЕХ! Тикет создан в БД!');
  } else {
    console.log('❌ ПРОБЛЕМА! Тикет не создался в БД');
  }
  console.log('════════════════════════════════════════════════════════════════════════════════');
}

runTest().catch(console.error);
