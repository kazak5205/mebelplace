const { chromium } = require('playwright');

// 🚀 ДИАГНОСТИКА СТРАНИЦЫ ЛОГИНА
async function diagnoseLoginPage() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Переходим на страницу логина...');
    await page.goto('https://mebelplace.com.kz/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Страница загружена');
    
    // Получаем HTML страницы
    const html = await page.content();
    console.log('📄 HTML страницы (первые 2000 символов):');
    console.log(html.substring(0, 2000));
    
    // Ищем все input поля
    const inputs = await page.locator('input').all();
    console.log(`\n🔍 Найдено ${inputs.length} input полей:`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const className = await input.getAttribute('class');
      
      console.log(`  Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}", id="${id}", class="${className}"`);
    }
    
    // Ищем все button элементы
    const buttons = await page.locator('button').all();
    console.log(`\n🔘 Найдено ${buttons.length} кнопок:`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const className = await button.getAttribute('class');
      
      console.log(`  Button ${i + 1}: text="${text?.trim()}", type="${type}", class="${className}"`);
    }
    
    // Проверяем есть ли модальные окна
    const modals = await page.locator('.modal, .fixed, [role="dialog"]').all();
    console.log(`\n🪟 Найдено ${modals.length} модальных окон:`);
    
    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i];
      const className = await modal.getAttribute('class');
      const isVisible = await modal.isVisible();
      console.log(`  Modal ${i + 1}: class="${className}", visible=${isVisible}`);
    }
    
    // Делаем скриншот
    await page.screenshot({ path: '/opt/mebelplace/login-page.png' });
    console.log('📸 Скриншот сохранен в /opt/mebelplace/login-page.png');
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Запускаем диагностику
diagnoseLoginPage().catch(console.error);
