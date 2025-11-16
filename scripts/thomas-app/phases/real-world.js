/**
 * Phase 7: Real-World Conditions Testing
 *
 * Network throttling, device emulation, offline behavior
 */

async function run(orchestrator) {
  const { page, config } = orchestrator;

  console.log(`🌍 Testing under real-world conditions...\n`);

  const results = {
    networkTests: [],
    deviceTests: [],
    offlineTests: null
  };

  // Network throttling tests
  const networkProfiles = [
    { name: '4G', downloadThroughput: 4 * 1024 * 1024 / 8, uploadThroughput: 3 * 1024 * 1024 / 8, latency: 20 },
    { name: '3G', downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 100 },
    { name: 'Slow 3G', downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8, latency: 400 }
  ];

  console.log(`  Testing network conditions...\n`);

  for (const profile of networkProfiles) {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: profile.downloadThroughput,
      uploadThroughput: profile.uploadThroughput,
      latency: profile.latency
    });

    const startTime = Date.now();
    await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;

    results.networkTests.push({
      profile: profile.name,
      loadTime,
      acceptable: loadTime < 10000
    });

    console.log(`    ${profile.name}: ${loadTime}ms ${loadTime > 10000 ? '⚠️  Slow' : '✅'}`);
  }

  console.log(`\n  Testing device emulation...\n`);

  // Device emulation (already tested in visual phase, just verify responsiveness)
  const devices = [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad Pro', width: 1024, height: 1366 }
  ];

  for (const device of devices) {
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.goto(config.baseUrl);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    results.deviceTests.push({
      device: device.name,
      responsive: !hasHorizontalScroll
    });

    console.log(`    ${device.name}: ${hasHorizontalScroll ? '❌ Has scroll' : '✅ Responsive'}`);
  }

  return results;
}

export default { run };
