/**
 * Phase: Code Quality Scanning
 *
 * Scan codebase for TODO, FIXME, HACK, and other code markers
 */

const fs = require('fs');
const path = require('path');

async function run(orchestrator) {
  const { config } = orchestrator;

  console.log(`🔍 Scanning code quality...\n`);

  const results = {
    todos: [],
    fixmes: [],
    hacks: [],
    temporaryFixes: [],
    bugs: [],
    warnings: [],
    totalMarkers: 0,
    scanStats: {
      filesScanned: 0,
      linesScanned: 0,
      duration: 0
    }
  };

  const startTime = Date.now();

  // Get project root (go up from thomas-app directory)
  const projectRoot = process.cwd();

  console.log(`  Scanning directory: ${projectRoot}`);

  // Scan source files
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.thomas-app', 'coverage'];

  try {
    await scanDirectory(projectRoot, results, extensions, excludeDirs);

    results.totalMarkers =
      results.todos.length +
      results.fixmes.length +
      results.hacks.length +
      results.temporaryFixes.length +
      results.bugs.length +
      results.warnings.length;

    results.scanStats.duration = Date.now() - startTime;

    // Print summary
    console.log(`\n  📊 Code Quality Scan Results:`);
    console.log(`    Files scanned: ${results.scanStats.filesScanned}`);
    console.log(`    Lines scanned: ${results.scanStats.linesScanned}`);
    console.log(`    Duration: ${results.scanStats.duration}ms\n`);

    if (results.totalMarkers === 0) {
      console.log(`  ✅ No code quality markers found`);
    } else {
      console.log(`  ⚠️  Code Quality Markers Found:`);
      if (results.fixmes.length > 0) {
        console.log(`    🔴 FIXME: ${results.fixmes.length} (high priority)`);
      }
      if (results.bugs.length > 0) {
        console.log(`    🔴 BUG: ${results.bugs.length} (critical)`);
      }
      if (results.temporaryFixes.length > 0) {
        console.log(`    🟠 TEMPORARY/HACK: ${results.temporaryFixes.length} (technical debt)`);
      }
      if (results.todos.length > 0) {
        console.log(`    🟡 TODO: ${results.todos.length} (medium priority)`);
      }
      if (results.warnings.length > 0) {
        console.log(`    🟢 WARNING/NOTE: ${results.warnings.length} (low priority)`);
      }

      // Show top 5 critical markers
      const criticalMarkers = [
        ...results.bugs.map(m => ({ ...m, type: 'BUG', severity: 'critical' })),
        ...results.fixmes.map(m => ({ ...m, type: 'FIXME', severity: 'high' })),
        ...results.temporaryFixes.map(m => ({ ...m, type: 'TEMPORARY', severity: 'high' }))
      ].slice(0, 5);

      if (criticalMarkers.length > 0) {
        console.log(`\n  🔴 Top ${criticalMarkers.length} Critical Items:`);
        criticalMarkers.forEach((marker, i) => {
          console.log(`    ${i + 1}. [${marker.type}] ${marker.file}:${marker.line}`);
          console.log(`       ${marker.text.substring(0, 80)}${marker.text.length > 80 ? '...' : ''}`);
        });
      }
    }

  } catch (error) {
    console.log(`  ⚠️  Code scan error: ${error.message}`);
  }

  return results;
}

async function scanDirectory(dir, results, extensions, excludeDirs) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(entry.name)) {
        continue;
      }
      // Recursively scan subdirectory
      await scanDirectory(fullPath, results, extensions, excludeDirs);
    } else if (entry.isFile()) {
      // Check if file has relevant extension
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        await scanFile(fullPath, results);
      }
    }
  }
}

async function scanFile(filePath, results) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    results.scanStats.filesScanned++;
    results.scanStats.linesScanned += lines.length;

    lines.forEach((line, idx) => {
      const lineNumber = idx + 1;
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) return;

      // Detect code markers (case-insensitive)
      const lowerLine = trimmed.toLowerCase();

      // BUG markers (critical)
      if (lowerLine.includes('bug:') || lowerLine.includes('fixme: bug') || lowerLine.match(/\/\/\s*bug\s/i)) {
        results.bugs.push({
          file: filePath,
          line: lineNumber,
          text: trimmed,
          context: getContext(lines, idx)
        });
      }
      // FIXME markers (high priority)
      else if (lowerLine.includes('fixme')) {
        results.fixmes.push({
          file: filePath,
          line: lineNumber,
          text: trimmed,
          context: getContext(lines, idx)
        });
      }
      // TEMPORARY/HACK markers (technical debt)
      else if (lowerLine.includes('temporary') || lowerLine.includes('hack') || lowerLine.includes('xxx')) {
        results.temporaryFixes.push({
          file: filePath,
          line: lineNumber,
          text: trimmed,
          context: getContext(lines, idx)
        });
      }
      // TODO markers (medium priority)
      else if (lowerLine.includes('todo')) {
        results.todos.push({
          file: filePath,
          line: lineNumber,
          text: trimmed,
          context: getContext(lines, idx)
        });
      }
      // WARNING/NOTE markers (low priority)
      else if (lowerLine.includes('warning:') || lowerLine.includes('note:')) {
        results.warnings.push({
          file: filePath,
          line: lineNumber,
          text: trimmed,
          context: getContext(lines, idx)
        });
      }
    });

  } catch (error) {
    // Skip files that can't be read
  }
}

function getContext(lines, index, contextLines = 2) {
  const start = Math.max(0, index - contextLines);
  const end = Math.min(lines.length, index + contextLines + 1);
  return lines.slice(start, end).join('\n');
}

module.exports = { run };
