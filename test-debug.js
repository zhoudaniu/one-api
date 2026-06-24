const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 监听网络请求
  page.on('request', request => {
    if (request.url().includes('api')) {
      console.log('请求:', request.url());
    }
  });

  page.on('response', response => {
    if (response.url().includes('api')) {
      console.log('响应:', response.url(), response.status());
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('控制台错误:', msg.text());
    }
  });

  try {
    console.log('=== 测试开始 ===\n');

    // 登录
    console.log('1. 登录...');
    await page.goto('http://localhost:3004/login');
    await page.waitForTimeout(3000);

    const inputs = await page.locator('input').all();
    if (inputs.length >= 2) {
      await inputs[0].fill('root');
      await inputs[1].fill('123456');
      await page.locator('button').filter({ hasText: '登录' }).first().click();
      await page.waitForTimeout(3000);
    }

    console.log('2. 访问渠道页面...');
    await page.goto('http://localhost:3004/channel');
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'screenshots/debug-test.png', fullPage: true });

    console.log('\n=== 测试完成 ===');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await browser.close();
  }
})();
