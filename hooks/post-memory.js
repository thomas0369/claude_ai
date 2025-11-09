import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

export default async function postMemory({ projectPath, result }) {
  const dir = join(process.env.HOME, '.claude', 'memory-bank', 'projects');
  const name = projectPath.split('/').pop();
  const file = join(dir, `${name}.md`);
  
  const date = new Date().toISOString().split('T')[0];
  const status = result?.success ? '✅' : '⚠️';
  const entry = `\n## ${date}\n**Status:** ${status}\n\n`;
  
  let content = existsSync(file) ? readFileSync(file, 'utf-8') : `# ${name}\n`;
  content += entry;
  
  writeFileSync(file, content);
  
  return { success: true };
}
