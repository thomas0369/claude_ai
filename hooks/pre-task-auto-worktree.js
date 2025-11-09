import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export default async function preTaskAutoWorktree({ task, projectPath }) {
  console.log('\n🌳 AUTO-WORKTREE AGENT\n');
  
  // Check if Git repo
  if (!existsSync(join(projectPath, '.git'))) {
    console.log('⏭️  Not a Git repository');
    return { success: true };
  }
  
  try {
    // Get current branch
    const currentBranch = execSync('git branch --show-current', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    console.log(`📍 Current branch: ${currentBranch}`);
    
    // Check if on main/develop/master
    const protectedBranches = ['main', 'master', 'develop'];
    
    if (!protectedBranches.includes(currentBranch)) {
      console.log(`✅ Already on feature branch: ${currentBranch}`);
      return { success: true, branch: currentBranch };
    }
    
    // We're on protected branch - need to create worktree!
    console.log(`⚠️  On protected branch: ${currentBranch}`);
    
    // Extract feature name from task
    const taskDesc = task?.description || task?.toString() || '';
    
    if (!taskDesc || taskDesc.length < 5) {
      console.log('⏭️  Task too short for auto-branch creation');
      return { success: true };
    }
    
    // Generate branch name from task
    const featureName = taskDesc
      .toLowerCase()
      .replace(/erstelle|implementiere|füge hinzu|baue|entwickle/gi, '')
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40)
      .replace(/^-+|-+$/g, '');
    
    if (!featureName) {
      console.log('⏭️  Could not generate branch name');
      return { success: true };
    }
    
    const branchName = `feature/${featureName}`;
    const worktreePath = `../${projectPath.split('/').pop()}-worktrees/${branchName}`;
    
    console.log(`\n🚀 AUTO-CREATING WORKTREE:`);
    console.log(`   Branch: ${branchName}`);
    console.log(`   Path: ${worktreePath}`);
    
    // Check if worktree already exists
    try {
      const existingWorktrees = execSync('git worktree list', {
        cwd: projectPath,
        encoding: 'utf-8'
      });
      
      if (existingWorktrees.includes(branchName)) {
        console.log(`⚠️  Worktree already exists for ${branchName}`);
        console.log(`   Switching to existing worktree...`);
        
        // Switch to existing worktree by changing process directory
        process.chdir(worktreePath);
        console.log(`✅ Switched to: ${worktreePath}`);
        
        return { 
          success: true, 
          worktreeCreated: false,
          worktreePath,
          branch: branchName 
        };
      }
    } catch {}
    
    // Create worktree directory
    try {
      execSync(`mkdir -p "$(dirname "${worktreePath}")"`, {
        cwd: projectPath,
        stdio: 'pipe'
      });
    } catch (error) {
      console.log('⚠️  Could not create worktree directory');
      return { success: true };
    }
    
    // Create worktree
    try {
      execSync(`git worktree add "${worktreePath}" -b "${branchName}"`, {
        cwd: projectPath,
        stdio: 'inherit'
      });
      
      console.log(`✅ Worktree created successfully!`);
      
      // Change to worktree directory
      process.chdir(worktreePath);
      console.log(`✅ Switched to worktree: ${worktreePath}`);
      
      // Install dependencies if package.json exists
      if (existsSync(join(worktreePath, 'package.json'))) {
        console.log(`\n📦 Installing dependencies in worktree...`);
        try {
          execSync('npm install', {
            cwd: worktreePath,
            stdio: 'inherit'
          });
          console.log(`✅ Dependencies installed`);
        } catch {
          console.log(`⚠️  Dependency installation failed`);
        }
      }
      
      return { 
        success: true, 
        worktreeCreated: true,
        worktreePath,
        branch: branchName,
        message: `Auto-created worktree for: ${branchName}`
      };
      
    } catch (error) {
      console.log(`❌ Failed to create worktree: ${error.message}`);
      return { success: true };
    }
    
  } catch (error) {
    console.log(`⚠️  Error in auto-worktree: ${error.message}`);
    return { success: true };
  }
}
