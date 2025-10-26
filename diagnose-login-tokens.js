const { chromium } = require('playwright');

// 🔍 ДЕТАЛЬНАЯ ДИАГНОСТИКА ЛОГИНА И ТОКЕНОВ
async function diagnoseLoginAndTokens() {
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
    
    // Заполняем форму логина
    console.log('📝 Заполняем форму логина...');
    await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill('+77771234567');
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
      console.log(`   Headers:`, req.headers);
      console.log(`   Data:`, req.postData);
    });
    
    console.log('📡 Сетевые ответы:');
    responses.forEach((res, i) => {
      console.log(`   Response ${i + 1}: ${res.status} ${res.url}`);
      console.log(`   Headers:`, res.headers);
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
    
    // Проверяем cookies
    console.log('🍪 Проверяем cookies...');
    const cookies = await context.cookies();
    console.log('📦 Cookies:');
    cookies.forEach(cookie => {
      console.log(`   ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
    });
    
    // Проверяем текущий URL
    const currentUrl = page.url();
    console.log(`🌐 Текущий URL: ${currentUrl}`);
    
    // Проверяем заголовок страницы
    const title = await page.title();
    console.log(`📄 Заголовок страницы: ${title}`);
    
    // Проверяем, есть ли элементы авторизованного пользователя
    const userElements = await page.locator('[data-testid*="user"], .user-menu, .profile').count();
    console.log(`👤 Элементов пользователя найдено: ${userElements}`);
    
    // Если есть токен, тестируем API
    if (localStorage.accessToken) {
      console.log('🧪 Тестируем API с полученным токеном...');
      
      const apiResponse = await page.evaluate(async (token) => {
        try {
          const res = await fetch('https://mebelplace.com.kz/api/support/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              subject: 'Тест поддержки - диагностика',
              message: 'Это тестовое сообщение для диагностики проблемы с поддержкой.',
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
    }
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

diagnoseLoginAndTokens().catch(console.error);
