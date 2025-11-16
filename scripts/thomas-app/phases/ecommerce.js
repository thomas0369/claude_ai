/**
 * E-commerce Flow Testing
 */

async function run(orchestrator) {
  const { page, config } = orchestrator;

  console.log(`🛒 Testing e-commerce flows...\n`);

  const results = {
    productBrowsing: null,
    cart: null,
    checkout: null
  };

  try {
    // Test 1: Product browsing
    console.log(`  Testing product browsing...`);
    await page.goto(config.baseUrl);

    const products = await page.$$('[class*="product"], [data-product]');
    results.productBrowsing = {
      productsFound: products.length,
      passed: products.length > 0
    };

    if (products.length > 0) {
      // Click first product
      await products[0].click();
      await page.waitForTimeout(1000);
      console.log(`    ✅ Products browsable (${products.length} found)`);
    }

    // Test 2: Add to cart
    console.log(`  Testing add to cart...`);
    try {
      await page.click('[class*="add-to-cart"], button:has-text("Add to Cart")');
      await page.waitForTimeout(1000);

      results.cart = {
        addToCartWorks: true
      };
      console.log(`    ✅ Add to cart works`);
    } catch (error) {
      results.cart = { addToCartWorks: false, error: error.message };
      console.log(`    ⚠️  Add to cart button not found`);
    }

    // Test 3: Checkout
    console.log(`  Testing checkout flow...`);
    try {
      await page.goto(config.baseUrl + '/cart');
      await page.click('[class*="checkout"], button:has-text("Checkout")');
      await page.waitForTimeout(1000);

      results.checkout = {
        checkoutAccessible: true
      };
      console.log(`    ✅ Checkout accessible`);
    } catch (error) {
      results.checkout = { checkoutAccessible: false };
      console.log(`    ⚠️  Checkout not accessible`);
    }

  } catch (error) {
    console.log(`    ⚠️  E-commerce flow testing failed: ${error.message}`);
  }

  return results;
}

export default { run };
