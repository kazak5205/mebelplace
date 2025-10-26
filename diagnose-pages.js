const { chromium } = require('playwright');

// 🚀 ДИАГНОСТИКА СТРАНИЦ СОЗДАНИЯ ЗАКАЗА И ЧАТА
async function diagnosePages() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Сначала логинимся
    console.log('🔐 Логинимся...');
    await page.goto('https://mebelplace.com.kz/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.locator('input[placeholder="+7XXXXXXXXXX"]').fill('+77770000420');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button:has-text("Войти")').click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Логин успешен');
    
    // Проверяем страницу создания заказа
    console.log('📝 Проверяем страницу создания заказа...');
    await page.goto('https://mebelplace.com.kz/orders/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const ordersHtml = await page.content();
    console.log('📄 HTML страницы создания заказа (первые 1500 символов):');
    console.log(ordersHtml.substring(0, 1500));
    
    // Ищем все input и textarea на странице заказов
    const orderInputs = await page.locator('input, textarea').all();
    console.log(`\n🔍 Найдено ${orderInputs.length} полей на странице заказов:`);
    
    for (let i = 0; i < orderInputs.length; i++) {
      const input = orderInputs[i];
      const tagName = await input.evaluate(el => el.tagName);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const className = await input.getAttribute('class');
      
      console.log(`  ${tagName} ${i + 1}: type="${type}", placeholder="${placeholder}", name="${name}", class="${className}"`);
    }
    
    // Проверяем страницу чата
    console.log('\n💬 Проверяем страницу чата...');
    await page.goto('https://mebelplace.com.kz/chat', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const chatHtml = await page.content();
    console.log('📄 HTML страницы чата (первые 1500 символов):');
    console.log(chatHtml.substring(0, 1500));
    
    // Ищем все input и textarea на странице чата
    const chatInputs = await page.locator('input, textarea').all();
    console.log(`\n🔍 Найдено ${chatInputs.length} полей на странице чата:`);
    
    for (let i = 0; i < chatInputs.length; i++) {
      const input = chatInputs[i];
      const tagName = await input.evaluate(el => el.tagName);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const className = await input.getAttribute('class');
      
      console.log(`  ${tagName} ${i + 1}: type="${type}", placeholder="${placeholder}", name="${name}", class="${className}"`);
    }
    
    // Проверяем главную страницу
    console.log('\n🏠 Проверяем главную страницу...');
    await page.goto('https://mebelplace.com.kz/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const mainHtml = await page.content();
    console.log('📄 HTML главной страницы (первые 1500 символов):');
    console.log(mainHtml.substring(0, 1500));
    
    // Ищем все кнопки на главной странице
    const mainButtons = await page.locator('button, a').all();
    console.log(`\n🔘 Найдено ${mainButtons.length} кнопок/ссылок на главной странице:`);
    
    for (let i = 0; i < Math.min(10, mainButtons.length); i++) {
      const button = mainButtons[i];
      const tagName = await button.evaluate(el => el.tagName);
      const text = await button.textContent();
      const href = await button.getAttribute('href');
      const className = await button.getAttribute('class');
      
      console.log(`  ${tagName} ${i + 1}: text="${text?.trim()}", href="${href}", class="${className}"`);
    }
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Запускаем диагностику
diagnosePages().catch(console.error);
