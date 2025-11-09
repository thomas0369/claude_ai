import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export default async function postMergeCleanup({ task, result, projectPath }) {
  console.log('\n🔄 POST-TASK: MERGE & CLEANUP\n');
  
  if (!existsSync(join(projectPath, '.git'))) {
    return { success: true };
  }
  
  try {
    const currentBranch = execSync('git branch --show-current', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    // Only process feature branches
    if (!currentBranch.startsWith('feature/') && 
        !currentBranch.startsWith('bugfix/') &&
        !currentBranch.startsWith('hotfix/')) {
      return { success: true };
    }
    
    console.log(`📍 Branch: ${currentBranch}`);
    
    // Check if task was successful
    if (!result?.success) {
      console.log('⏭️  Task failed, skipping merge');
      return { success: true };
    }
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    if (status) {
      console.log('📝 Auto-committing changes...');
      
      try {
        execSync('git add .', { cwd: projectPath });
        
        const taskDesc = task?.description || 'Task completed';
        const commitMsg = `feat: ${taskDesc.substring(0, 60)}`;
        
        execSync(`git commit -m "${commitMsg}"`, { 
          cwd: projectPath,
          stdio: 'pipe'
        });
        
        console.log(`✅ Committed: ${commitMsg}`);
      } catch (error) {
        console.log('⚠️  Commit failed');
        return { success: true };
      }
    }
    
    // Ask to merge to main
    console.log('\n❓ Merge to main? (Auto-yes in 10 seconds)');
    console.log('   Branch will be merged and worktree cleaned up');
    
    // Auto-yes after timeout (for automation)
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n🔀 Merging to main...');
    
    try {
      // Get main repo path
      const worktreeList = execSync('git worktree list', {
        cwd: projectPath,
        encoding: 'utf-8'
      });
      
      const mainPath = worktreeList.split('\n')[0].split(/\s+/)[0];
      
      // Switch to main
      process.chdir(mainPath);
      
      // Pull latest
      execSync('git pull origin main', { 
        cwd: mainPath,
        stdio: 'pipe'
      });
      
      // Merge feature branch
      execSync(`git merge --no-ff ${currentBranch} -m "Merge ${currentBranch}"`, {
        cwd: mainPath,
        stdio: 'inherit'
      });
      
      console.log(`✅ Merged ${currentBranch} to main`);
      
      // Remove worktree
      console.log('\n🧹 Cleaning up worktree...');
      
      execSync(`git worktree remove "${projectPath}" --force`, {
        cwd: mainPath,
        stdio: 'pipe'
      });
      
      // Delete branch
      execSync(`git branch -D ${currentBranch}`, {
        cwd: mainPath,
        stdio: 'pipe'
      });
      
      console.log(`✅ Cleaned up: ${currentBranch}`);
      console.log(`\n🎉 Task completed and merged to main!\n`);
      
      return { 
        success: true,
        merged: true,
        cleanedUp: true
      };
      
    } catch (error) {
      console.log(`⚠️  Merge failed: ${error.message}`);
      console.log(`💡 Manual merge required`);
      
      return { success: true };
    }
    
  } catch (error) {
    return { success: true };
  }
}
