const { chromium } = require('playwright');

// 🚀 ПРОСТОЙ ТЕСТ ЛОГИНА И СОЗДАНИЯ ДАННЫХ
async function testLoginAndCreateData() {
  const browser = await chromium.launch({ 
    headless: true, // Запускаем в headless режиме
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
    
    // Закрываем модальное окно если есть
    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Модальное окно не найдено');
    }
    
    console.log('🔐 Пробуем залогиниться...');
    
    // Заполняем форму логина
    await page.fill('input[placeholder="+7XXXXXXXXXX"], input[name="phone"]', '+77770000420');
    await page.waitForTimeout(1000);
    
    await page.fill('input[placeholder="Пароль"], input[name="password"]', 'testpass123');
    await page.waitForTimeout(1000);
    
    // Отправляем форму
    await page.click('button:has-text("Войти"), button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Проверяем результат
    const currentUrl = page.url();
    console.log(`📍 Текущий URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Логин не удался');
      
      // Проверяем есть ли ошибки на странице
      const errorText = await page.textContent('body');
      console.log('📄 Содержимое страницы:', errorText.substring(0, 500));
      
    } else {
      console.log('✅ Логин успешен!');
      
      // Теперь пробуем создать заказ
      console.log('📝 Переходим к созданию заказа...');
      await page.goto('https://mebelplace.com.kz/orders/create', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      console.log('✅ Страница создания заказа загружена');
      
      // Заполняем форму заказа
      const titleInput = page.locator('input[name*="title"], input[placeholder*="название"]').first();
      if (await titleInput.count() > 0) {
        await titleInput.fill('Тестовый заказ через UI');
        console.log('✅ Заполнили заголовок заказа');
        
        await page.waitForTimeout(1000);
        
        const descInput = page.locator('textarea[name*="description"], textarea[placeholder*="описание"]').first();
        if (await descInput.count() > 0) {
          await descInput.fill('Описание тестового заказа');
          console.log('✅ Заполнили описание заказа');
          
          await page.waitForTimeout(1000);
          
          const submitButton = page.locator('button[type="submit"], button:has-text("Создать заказ")').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            console.log('✅ Отправили заказ');
            
            await page.waitForTimeout(5000);
            
            // Проверяем результат
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
      
      const messageInput = page.locator('input[placeholder*="сообщение"], textarea[placeholder*="сообщение"]').first();
      if (await messageInput.count() > 0) {
        await messageInput.fill('Тестовое сообщение через UI');
        console.log('✅ Заполнили сообщение');
        
        await page.waitForTimeout(1000);
        
        await messageInput.press('Enter');
        console.log('✅ Отправили сообщение');
        
        await page.waitForTimeout(3000);
      }
    }
    
    // Ждем чтобы увидеть результат
    console.log('⏳ Ждем 10 секунд...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Запускаем тест
testLoginAndCreateData().catch(console.error);
