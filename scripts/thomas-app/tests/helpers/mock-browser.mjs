/**
 * Mock Playwright Browser, Context, and Page
 *
 * Provides comprehensive mocks for all Playwright APIs used in thomas-app
 */

class MockPage {
  constructor() {
    this._url = 'http://localhost:3000';
    this._closed = false;
    this._listeners = {};
    this._content = '';
    this._screenshots = [];
    this._evaluateResults = {};
  }

  // Navigation
  async goto(url, options = {}) {
    if (url.includes('fail-to-load')) {
      throw new Error('net::ERR_CONNECTION_REFUSED');
    }
    this._url = url;
    // Emit page load events
    this._emit('load', {});
    return { ok: true, status: 200 };
  }

  url() {
    return this._url;
  }

  async reload(options = {}) {
    return this.goto(this._url, options);
  }

  // Selectors & Interaction
  async click(selector, options = {}) {
    if (selector.includes('nonexistent')) {
      throw new Error(`Timeout exceeded waiting for selector "${selector}"`);
    }
    // Simulate click delay
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  async fill(selector, value, options = {}) {
    if (selector.includes('nonexistent')) {
      throw new Error(`Timeout exceeded waiting for selector "${selector}"`);
    }
  }

  async waitForSelector(selector, options = {}) {
    if (selector.includes('nonexistent') || selector.includes('never-appears')) {
      throw new Error(`Timeout exceeded waiting for selector "${selector}"`);
    }
    // Simulate wait
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  async waitForTimeout(ms) {
    // Don't actually wait in tests, just track
    return Promise.resolve();
  }

  // Evaluation
  async evaluate(fn, ...args) {
    if (typeof fn === 'function') {
      // Try to execute the function in Node context (limited)
      try {
        // Create a minimal DOM-like environment
        const mockDoc = this._createMockDocument();
        const mockWindow = this._createMockWindow();

        // Call function with mock environment
        const result = fn.call(mockWindow, ...args);
        return result;
      } catch (error) {
        // Return pre-configured results
        return this._evaluateResults[fn.toString()] || null;
      }
    }
    return null;
  }

  setEvaluateResult(key, value) {
    this._evaluateResults[key] = value;
  }

  _createMockDocument() {
    const elements = [];

    return {
      querySelector: (selector) => {
        if (selector === 'canvas') return { tagName: 'CANVAS' };
        if (selector.includes('cart')) return { tagName: 'DIV' };
        if (selector.includes('product')) return { tagName: 'DIV' };
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector === 'a[href]') return [];
        if (selector.includes('h1, h2, h3')) return Array(15).fill({ tagName: 'H1' });
        if (selector === 'form') return [{ tagName: 'FORM' }];
        return [];
      },
      title: 'Test App',
      body: {
        innerHTML: '<div class="cart">Cart</div><div class="product">Product</div>'
      }
    };
  }

  _createMockWindow() {
    return {
      location: {
        origin: 'http://localhost:3000',
        pathname: '/',
        href: this._url
      },
      scrollBy: (x, y) => {},
      axe: {
        run: (options, callback) => {
          callback(null, { violations: [] });
        }
      }
    };
  }

  // Screenshots
  async screenshot(options = {}) {
    const screenshot = {
      path: options.path,
      fullPage: options.fullPage || false,
      timestamp: Date.now()
    };
    this._screenshots.push(screenshot);
    return Buffer.from('fake-screenshot-data');
  }

  getScreenshots() {
    return this._screenshots;
  }

  // Event handling
  on(event, handler) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(handler);
  }

  _emit(event, data) {
    const listeners = this._listeners[event] || [];
    listeners.forEach(handler => handler(data));
  }

  // Console monitoring
  emitConsoleError(text, location = {}) {
    this._emit('console', {
      type: () => 'error',
      text: () => text,
      location: () => location
    });
  }

  emitConsoleWarning(text) {
    this._emit('console', {
      type: () => 'warning',
      text: () => text,
      location: () => ({})
    });
  }

  emitPageError(error) {
    this._emit('pageerror', error);
  }

  emitRequestFailed(request) {
    this._emit('requestfailed', request);
  }

  // Script injection
  async addScriptTag(options) {
    // Mock script injection
    return { src: options.url };
  }

  // Keyboard
  get keyboard() {
    return {
      press: async (key) => {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    };
  }

  // Lifecycle
  async close() {
    this._closed = true;
  }

  isClosed() {
    return this._closed;
  }
}

class MockContext {
  constructor() {
    this._pages = [];
    this._closed = false;
  }

  async newPage() {
    const page = new MockPage();
    this._pages.push(page);
    return page;
  }

  async close() {
    this._closed = true;
    for (const page of this._pages) {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}

class MockBrowser {
  constructor() {
    this._contexts = [];
    this._closed = false;
    this._process = {
      pid: 12345
    };
  }

  async newContext(options = {}) {
    const context = new MockContext();
    this._contexts.push(context);
    return context;
  }

  async close() {
    this._closed = true;
    for (const context of this._contexts) {
      await context.close();
    }
  }

  process() {
    return this._process;
  }
}

function createMockBrowser() {
  return new MockBrowser();
}

export {
  MockBrowser,
  MockContext,
  MockPage,
  createMockBrowser
};
