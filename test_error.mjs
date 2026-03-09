import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        } else {
            console.log('PAGE LOG:', msg.text());
        }
    });
    page.on('pageerror', err => {
        console.log('PAGE EXCEPTION:', err.toString());
    });
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    console.log('Page loaded completely.');
    await browser.close();
})();
