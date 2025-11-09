import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export default async function enforceWorktree({ task, projectPath }) {
  console.log('\n🔒 WORKTREE-FIRST ENFORCEMENT\n');
  
  // Skip if not a git repo
  if (!existsSync(join(projectPath, '.git'))) {
    console.log('⏭️  Not a Git repository - continuing');
    return { success: true };
  }
  
  try {
    // Get current branch
    const currentBranch = execSync('git branch --show-current', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim();
    
    console.log(`📍 Current branch: ${currentBranch}`);
    
    // Protected branches
    const protectedBranches = ['main', 'master', 'develop', 'dev'];
    
    if (!protectedBranches.includes(currentBranch)) {
      console.log(`✅ Working on feature branch: ${currentBranch}`);
      return { success: true, branch: currentBranch };
    }
    
    // ❌ WE ARE ON PROTECTED BRANCH - FORCE CREATE WORKTREE
    console.log(`\n⚠️  ⚠️  ⚠️  PROTECTED BRANCH DETECTED ⚠️  ⚠️  ⚠️`);
    console.log(`Cannot work directly on: ${currentBranch}`);
    console.log(`\n🤖 AUTO-CREATING WORKTREE...\n`);
    
    // Generate branch name from task
    const taskDesc = task?.description || task?.toString() || '';
    
    if (!taskDesc || taskDesc.length < 3) {
      console.error('❌ Task description too short for branch creation');
      console.error('💡 Provide a descriptive task');
      return { 
        success: false, 
        error: 'Task description required for branch creation' 
      };
    }
    
    // Smart branch naming
    const featureName = taskDesc
      .toLowerCase()
      // Remove common German/English task prefixes
      .replace(/^(erstelle|implementiere|füge hinzu|baue|entwickle|create|implement|add|build|develop)\s+/gi, '')
      .trim()
      // Clean special chars
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace spaces with dashes
      .replace(/\s+/g, '-')
      // Limit length
      .substring(0, 40)
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '');
    
    if (!featureName) {
      console.error('❌ Could not generate valid branch name');
      return { 
        success: false, 
        error: 'Invalid task description for branch naming' 
      };
    }
    
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const branchName = `feature/${timestamp}-${featureName}`;
    const projectName = projectPath.split('/').pop();
    const worktreePath = join(projectPath, '..', `${projectName}-worktrees`, branchName);
    
    console.log(`Branch: ${branchName}`);
    console.log(`Path:   ${worktreePath}`);
    console.log('');
    
    // Check if worktree already exists
    try {
      const worktrees = execSync('git worktree list', {
        cwd: projectPath,
        encoding: 'utf-8'
      });
      
      if (worktrees.includes(branchName)) {
        console.log(`⚠️  Worktree already exists`);
        console.log(`✅ Switching to existing worktree...\n`);
        
        process.chdir(worktreePath);
        
        return { 
          success: true, 
          worktreeCreated: false,
          worktreePath,
          branch: branchName 
        };
      }
    } catch {}
    
    // Create worktree
    try {
      // Create parent directory
      execSync(`mkdir -p "${join(worktreePath, '..')}"`, { 
        cwd: projectPath 
      });
      
      // Create worktree with new branch
      console.log(`🌳 Creating worktree...`);
      execSync(`git worktree add "${worktreePath}" -b "${branchName}"`, {
        cwd: projectPath,
        stdio: 'inherit'
      });
      
      console.log(`✅ Worktree created!`);
      
      // Switch to worktree
      process.chdir(worktreePath);
      console.log(`✅ Switched to: ${worktreePath}\n`);
      
      // Auto-install dependencies
      if (existsSync(join(worktreePath, 'package.json'))) {
        console.log(`📦 Installing dependencies...`);
        
        try {
          execSync('npm install', {
            cwd: worktreePath,
            stdio: 'inherit'
          });
          console.log(`✅ Dependencies installed\n`);
        } catch (error) {
          console.log(`⚠️  npm install failed, continuing...\n`);
        }
      }
      
      // Start dev server if package.json has dev script
      try {
        const pkg = JSON.parse(readFileSync(join(worktreePath, 'package.json'), 'utf-8'));
        
        if (pkg.scripts?.dev) {
          console.log(`🚀 Starting dev server...`);
          
          // Start in background
          const { spawn } = require('child_process');
          const devServer = spawn('npm', ['run', 'dev'], {
            cwd: worktreePath,
            detached: true,
            stdio: 'ignore'
          });
          
          devServer.unref();
          
          console.log(`✅ Dev server started in background\n`);
        }
      } catch {}
      
      console.log(`🎯 Ready to work on: ${branchName}\n`);
      
      return { 
        success: true, 
        worktreeCreated: true,
        worktreePath,
        branch: branchName,
        enforced: true
      };
      
    } catch (error) {
      console.error(`❌ Failed to create worktree: ${error.message}`);
      return { 
        success: false, 
        error: `Worktree creation failed: ${error.message}` 
      };
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
