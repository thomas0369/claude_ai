/**
 * Logger utility for thomas-app
 * Provides colored console output with consistent formatting
 */

const chalk = require('chalk');

class Logger {
  constructor() {
    this.startTime = Date.now();
  }

  header(text) {
    console.log('');
    console.log(chalk.bold.cyan('━'.repeat(60)));
    console.log(chalk.bold.cyan(`  ${text}`));
    console.log(chalk.bold.cyan('━'.repeat(60)));
    console.log('');
  }

  phase(number, title) {
    console.log('');
    console.log(chalk.bold.magenta(`PHASE ${number}: ${title}`));
    console.log(chalk.gray('─'.repeat(60)));
  }

  success(message) {
    console.log(chalk.green(`  ✓ ${message}`));
  }

  warning(message) {
    console.log(chalk.yellow(`  ⚠ ${message}`));
  }

  error(message) {
    console.log(chalk.red(`  ✗ ${message}`));
  }

  info(message) {
    console.log(chalk.blue(`  ℹ ${message}`));
  }

  step(message) {
    console.log(chalk.white(`    → ${message}`));
  }

  result(key, value, status = 'neutral') {
    const statusIcon = {
      good: chalk.green('✓'),
      bad: chalk.red('✗'),
      warning: chalk.yellow('⚠'),
      neutral: chalk.blue('•')
    }[status] || chalk.blue('•');

    console.log(`  ${statusIcon} ${chalk.bold(key)}: ${value}`);
  }

  metric(name, value, unit = '', threshold = null) {
    let displayValue = `${value}${unit}`;
    let status = 'neutral';

    if (threshold !== null) {
      if (typeof threshold === 'object') {
        // threshold = { good: 100, bad: 200 }
        if (value <= threshold.good) {
          status = 'good';
        } else if (value >= threshold.bad) {
          status = 'bad';
        } else {
          status = 'warning';
        }
      } else {
        // Simple threshold
        status = value <= threshold ? 'good' : 'bad';
      }
    }

    this.result(name, displayValue, status);
  }

  summary(stats) {
    console.log('');
    console.log(chalk.bold.white('Summary:'));
    Object.entries(stats).forEach(([key, value]) => {
      this.result(key, value);
    });
  }

  elapsed() {
    const duration = Date.now() - this.startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  footer(success = true) {
    console.log('');
    console.log(chalk.bold.cyan('━'.repeat(60)));
    if (success) {
      console.log(chalk.bold.green(`  ✓ TESTING COMPLETE`));
    } else {
      console.log(chalk.bold.red(`  ✗ TESTING FAILED`));
    }
    console.log(chalk.gray(`  Duration: ${this.elapsed()}`));
    console.log(chalk.bold.cyan('━'.repeat(60)));
    console.log('');
  }
}

module.exports = Logger;
