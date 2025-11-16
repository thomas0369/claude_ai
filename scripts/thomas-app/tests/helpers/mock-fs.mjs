/**
 * Mock File System Operations
 *
 * Provides in-memory file system for testing
 */

class MockFileSystem {
  constructor() {
    this.files = new Map();
    this.dirs = new Set();
  }

  reset() {
    this.files.clear();
    this.dirs.clear();
  }

  // File operations
  existsSync(filepath) {
    return this.files.has(filepath) || this.dirs.has(filepath);
  }

  readFileSync(filepath, encoding) {
    if (!this.files.has(filepath)) {
      throw new Error(`ENOENT: no such file or directory, open '${filepath}'`);
    }
    const content = this.files.get(filepath);
    return encoding ? content : Buffer.from(content);
  }

  writeFileSync(filepath, content) {
    this.files.set(filepath, typeof content === 'string' ? content : content.toString());
  }

  mkdirSync(dirpath, options = {}) {
    this.dirs.add(dirpath);
    // If recursive, add parent dirs
    if (options.recursive) {
      const parts = dirpath.split('/').filter(Boolean);
      let current = '';
      for (const part of parts) {
        current += '/' + part;
        this.dirs.add(current);
      }
    }
  }

  // Helper methods for testing
  addFile(filepath, content) {
    this.files.set(filepath, content);
  }

  addDir(dirpath) {
    this.dirs.add(dirpath);
  }

  getFile(filepath) {
    return this.files.get(filepath);
  }

  hasFile(filepath) {
    return this.files.has(filepath);
  }

  hasDir(dirpath) {
    return this.dirs.has(dirpath);
  }
}

// Singleton instance
const mockFS = new MockFileSystem();

// Create mock fs module
const createMockFS = () => ({
  existsSync: (...args) => mockFS.existsSync(...args),
  readFileSync: (...args) => mockFS.readFileSync(...args),
  writeFileSync: (...args) => mockFS.writeFileSync(...args),
  mkdirSync: (...args) => mockFS.mkdirSync(...args),

  // Export instance for test control
  __mockFS: mockFS
});

export {
  MockFileSystem,
  mockFS,
  createMockFS
};
