const { chromium } = require('playwright');

// 🚀 ПРАВИЛЬНЫЙ ТЕСТ ЛОГИНА И СОЗДАНИЯ ДАННЫХ
async function testCorrectLogin() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Переходим на сайт...');
    await page.goto('https://mebelplace.com.kz/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Сайт загружен');
    
    // Ждем загрузки формы
    await page.waitForTimeout(3000);
    
    console.log('🔐 Заполняем форму логина...');
    
    // Заполняем телефон (первое input поле)
    const phoneInput = page.locator('input[placeholder="+7XXXXXXXXXX"]');
    await phoneInput.fill('+77770000420');
    console.log('✅ Заполнили телефон');
    
    await page.waitForTimeout(1000);
    
    // Заполняем пароль (второе input поле)
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('testpass123');
    console.log('✅ Заполнили пароль');
    
    await page.waitForTimeout(1000);
    
    // Нажимаем кнопку "Войти"
    const loginButton = page.locator('button:has-text("Войти")');
    await loginButton.click();
    console.log('✅ Нажали кнопку "Войти"');
    
    // Ждем результат
    await page.waitForTimeout(5000);
    
    // Проверяем результат
    const currentUrl = page.url();
    console.log(`📍 Текущий URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Логин не удался');
      
      // Проверяем есть ли ошибки
      const errorElements = await page.locator('.error, .text-red-500, [class*="error"]').all();
      if (errorElements.length > 0) {
        for (let i = 0; i < errorElements.length; i++) {
          const errorText = await errorElements[i].textContent();
          console.log(`❌ Ошибка ${i + 1}: ${errorText}`);
        }
      }
      
    } else {
      console.log('✅ Логин успешен!');
      
      // Теперь пробуем создать заказ
      console.log('📝 Переходим к созданию заказа...');
      await page.goto('https://mebelplace.com.kz/orders/create', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      console.log('✅ Страница создания заказа загружена');
      
      // Ждем загрузки формы
      await page.waitForTimeout(3000);
      
      // Ищем поля формы заказа
      const titleInputs = await page.locator('input[placeholder*="название"], input[placeholder*="заголовок"], input[placeholder*="title"]').all();
      console.log(`🔍 Найдено ${titleInputs.length} полей для заголовка`);
      
      if (titleInputs.length > 0) {
        await titleInputs[0].fill('Тестовый заказ через UI');
        console.log('✅ Заполнили заголовок заказа');
        
        await page.waitForTimeout(1000);
        
        const descInputs = await page.locator('textarea[placeholder*="описание"], textarea[placeholder*="description"]').all();
        console.log(`🔍 Найдено ${descInputs.length} полей для описания`);
        
        if (descInputs.length > 0) {
          await descInputs[0].fill('Описание тестового заказа через UI');
          console.log('✅ Заполнили описание заказа');
          
          await page.waitForTimeout(1000);
          
          const submitButtons = await page.locator('button[type="submit"], button:has-text("Создать"), button:has-text("Отправить")').all();
          console.log(`🔍 Найдено ${submitButtons.length} кнопок отправки`);
          
          if (submitButtons.length > 0) {
            await submitButtons[0].click();
            console.log('✅ Отправили заказ');
            
            await page.waitForTimeout(5000);
            
            const newUrl = page.url();
            console.log(`📍 URL после создания заказа: ${newUrl}`);
          }
        }
      }
      
      // Теперь пробуем отправить сообщение
      console.log('💬 Переходим к чату...');
      await page.goto('https://mebelplace.com.kz/chat', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      console.log('✅ Страница чата загружена');
      
      await page.waitForTimeout(3000);
      
      const messageInputs = await page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').all();
      console.log(`🔍 Найдено ${messageInputs.length} полей для сообщений`);
      
      if (messageInputs.length > 0) {
        await messageInputs[0].fill('Тестовое сообщение через UI');
        console.log('✅ Заполнили сообщение');
        
        await page.waitForTimeout(1000);
        
        await messageInputs[0].press('Enter');
        console.log('✅ Отправили сообщение');
        
        await page.waitForTimeout(3000);
      }
      
      // Проверяем базу данных
      console.log('📊 Проверяем базу данных...');
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      try {
        const ordersResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM orders;"');
        const ordersCount = parseInt(ordersResult.stdout.trim()) || 0;
        
        const messagesResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM messages;"');
        const messagesCount = parseInt(messagesResult.stdout.trim()) || 0;
        
        console.log(`📊 Заказов в БД: ${ordersCount}`);
        console.log(`📊 Сообщений в БД: ${messagesCount}`);
        
      } catch (error) {
        console.log(`❌ Ошибка проверки БД: ${error.message}`);
      }
    }
    
    // Ждем чтобы увидеть результат
    console.log('⏳ Ждем 5 секунд...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Запускаем тест
testCorrectLogin().catch(console.error);
