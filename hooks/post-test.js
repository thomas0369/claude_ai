import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

export default async function postTest({ projectPath }) {
  console.log('\n⚡ Testing\n');
  
  const pkg = join(projectPath, 'package.json');
  if (!existsSync(pkg)) return { success: true };
  
  const json = JSON.parse(readFileSync(pkg, 'utf-8'));
  if (!json.devDependencies?.vite && !json.dependencies?.vite) {
    return { success: true };
  }
  
  const url = 'http://localhost:5173';
  
  try {
    await fetch(url);
  } catch {
    console.log('⚠️  Server offline');
    return { success: false };
  }
  
  const dir = join(projectPath, '.claude', 'screenshots');
  mkdirSync(dir, { recursive: true });
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  }).catch(() => null);
  
  if (!browser) return { success: false };
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { timeout: 10000 });
    await page.screenshot({ path: join(dir, 'test.png') });
    console.log('✅ Test passed');
    await browser.close();
    return { success: true };
  } catch {
    console.log('❌ Test failed');
    await browser.close();
    return { success: false };
  }
}
