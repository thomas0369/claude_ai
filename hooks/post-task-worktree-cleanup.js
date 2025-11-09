import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export default async function postTaskWorktreeCleanup({ task, result, projectPath }) {
  console.log('\n🧹 WORKTREE CLEANUP CHECK\n');
  
  if (!existsSync(join(projectPath, '.git'))) {
    return { success: true };
  }
  
  try {
    const currentBranch = execSync('git branch --show-current', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    // Only cleanup if we're in a feature branch
    if (!currentBranch.startsWith('feature/') && 
        !currentBranch.startsWith('bugfix/') &&
        !currentBranch.startsWith('hotfix/')) {
      return { success: true };
    }
    
    // Check if task was successful
    if (!result?.success) {
      console.log('⏭️  Task failed, keeping worktree');
      return { success: true };
    }
    
    // Check if there are uncommitted changes
    const status = execSync('git status --porcelain', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    if (status) {
      console.log('📝 Uncommitted changes detected');
      console.log('💡 Auto-committing...');
      
      try {
        execSync('git add .', { cwd: projectPath });
        
        const taskDesc = task?.description || 'Auto-commit';
        const commitMsg = `feat: ${taskDesc.substring(0, 50)}`;
        
        execSync(`git commit -m "${commitMsg}"`, { 
          cwd: projectPath,
          stdio: 'pipe'
        });
        
        console.log(`✅ Auto-committed: ${commitMsg}`);
      } catch (error) {
        console.log('⚠️  Auto-commit failed');
        return { success: true };
      }
    }
    
    console.log('✅ Worktree clean and committed');
    
    return { 
      success: true,
      autoCommitted: !!status,
      branch: currentBranch
    };
    
  } catch (error) {
    return { success: true };
  }
}
