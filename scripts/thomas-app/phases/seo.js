/**
 * SEO Analysis (Content Apps)
 */

async function run(orchestrator) {
  const { page } = orchestrator;

  console.log(`📝 Running SEO analysis...\n`);

  const seo = await page.evaluate(() => {
    const getMeta = (name) => {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return el?.getAttribute('content') || null;
    };

    return {
      title: document.title,
      description: getMeta('description'),
      keywords: getMeta('keywords'),
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogImage: getMeta('og:image'),
      twitterCard: getMeta('twitter:card'),
      twitterTitle: getMeta('twitter:title'),
      twitterImage: getMeta('twitter:image'),
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      hasStructuredData: !!document.querySelector('script[type="application/ld+json"]')
    };
  });

  const issues = [];

  if (!seo.title || seo.title.length < 30) {
    issues.push({ type: 'title', message: 'Title too short (< 30 chars)' });
  }

  if (!seo.description || seo.description.length < 120) {
    issues.push({ type: 'description', message: 'Meta description too short (< 120 chars)' });
  }

  if (!seo.ogImage) {
    issues.push({ type: 'social', message: 'Missing Open Graph image' });
  }

  console.log(`  Title: ${seo.title?.substring(0, 50) || 'MISSING'}`);
  console.log(`  Description: ${seo.description ? 'Present' : 'MISSING'}`);
  console.log(`  OG Image: ${seo.ogImage ? 'Present' : 'MISSING'}`);
  console.log(`  Issues: ${issues.length}`);

  return { seo, issues };
}

export default { run };
