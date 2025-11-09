import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export default async function perPromptCommit({ task, result, projectPath }) {
  console.log('\n💾 PER-PROMPT: COMMIT & TRACK\n');
  
  if (!existsSync(join(projectPath, '.git'))) {
    return { success: true };
  }
  
  try {
    const currentBranch = execSync('git branch --show-current', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    // Only process prompt branches
    if (!currentBranch.startsWith('prompt/')) {
      return { success: true };
    }
    
    console.log(`📍 Branch: ${currentBranch}`);
    
    // Load prompt info
    let promptInfo = {};
    const promptInfoFile = join(projectPath, '.claude-prompt.json');
    if (existsSync(promptInfoFile)) {
      promptInfo = JSON.parse(readFileSync(promptInfoFile, 'utf-8'));
    }
    
    // Check for changes
    const status = execSync('git status --porcelain', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    if (!status) {
      console.log('⏭️  No changes to commit');
      return { success: true };
    }
    
    console.log('📝 Auto-committing changes...');
    
    try {
      execSync('git add .', { cwd: projectPath });
      
      const taskDesc = promptInfo.task || task?.description || 'Prompt completed';
      const commitMsg = `prompt: ${taskDesc.substring(0, 72)}`;
      
      execSync(`git commit -m "${commitMsg}"`, { 
        cwd: projectPath,
        stdio: 'pipe'
      });
      
      console.log(`✅ Committed: ${commitMsg}`);
      
      // Mark for review/merge
      const reviewFile = join(projectPath, '.claude-ready-for-merge');
      require('fs').writeFileSync(reviewFile, JSON.stringify({
        branch: currentBranch,
        committed: new Date().toISOString(),
        task: taskDesc,
        success: result?.success || false
      }, null, 2));
      
      console.log(`✅ Marked for merge review`);
      
      return { 
        success: true,
        committed: true,
        branch: currentBranch
      };
      
    } catch (error) {
      console.log(`⚠️  Commit failed: ${error.message}`);
      return { success: true };
    }
    
  } catch (error) {
    return { success: true };
  }
}
