import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export default async function preTask({ projectPath }) {
  console.log('\n🔍 Pre-Task Check\n');
  
  if (existsSync(join(projectPath, '.git'))) {
    try {
      const branch = execSync('git branch --show-current', {
        cwd: projectPath,
        encoding: 'utf-8'
      }).trim();
      console.log(`📍 Branch: ${branch}`);
    } catch {}
  }
  
  return { success: true };
}
