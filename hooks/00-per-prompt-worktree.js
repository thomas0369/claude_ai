import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export default async function perPromptWorktree({ task, projectPath }) {
  console.log('\n🌳 PER-PROMPT WORKTREE SYSTEM\n');
  
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
    
    console.log(`📍 Current: ${currentBranch}`);
    
    // Get task description
    const taskDesc = task?.description || task?.toString() || '';
    
    if (!taskDesc || taskDesc.length < 5) {
      console.log('⏭️  Task too short, skipping worktree');
      return { success: true };
    }
    
    // Check if we're already in a worktree
    const worktreeList = execSync('git worktree list', {
      cwd: projectPath,
      encoding: 'utf-8'
    });
    
    const worktreeLines = worktreeList.split('\n').filter(Boolean);
    const isInWorktree = worktreeLines.length > 1 && !worktreeLines[0].includes(projectPath);
    
    // Generate unique branch name for THIS specific prompt
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').substring(0, 15);
    
    const featureName = taskDesc
      .toLowerCase()
      .replace(/^(erstelle|implementiere|füge hinzu|add|create|implement|build)\s+/gi, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)
      .replace(/^-+|-+$/g, '');
    
    if (!featureName) {
      console.log('⚠️  Could not generate branch name');
      return { success: true };
    }
    
    // Create unique branch for this prompt
    const promptId = Math.random().toString(36).substring(2, 6);
    const branchName = `prompt/${timestamp}-${featureName}-${promptId}`;
    
    console.log(`\n🚀 CREATING NEW WORKTREE FOR THIS PROMPT:`);
    console.log(`   Branch: ${branchName}`);
    
    // Determine base path
    let basePath;
    if (isInWorktree) {
      // We're in a worktree, go up to find main repo
      const mainRepoLine = worktreeLines[0];
      basePath = mainRepoLine.split(/\s+/)[0];
      console.log(`   Base: ${basePath} (from worktree)`);
    } else {
      // We're in main repo
      basePath = projectPath;
      console.log(`   Base: ${basePath} (main repo)`);
    }
    
    const projectName = basePath.split('/').pop();
    const worktreePath = join(basePath, '..', `${projectName}-prompts`, branchName);
    
    console.log(`   Path: ${worktreePath}`);
    
    // Get current branch as base for new branch
    let baseBranch = currentBranch;
    if (currentBranch.startsWith('prompt/')) {
      // We're in a prompt branch, use main as base
      baseBranch = 'main';
    }
    
    // Create worktree
    try {
      // Create parent directory
      execSync(`mkdir -p "${join(worktreePath, '..')}"`, { 
        cwd: basePath,
        stdio: 'pipe'
      });
      
      console.log(`\n🌱 Creating worktree from ${baseBranch}...`);
      
      // Create worktree with new branch based on current/main
      execSync(`git worktree add "${worktreePath}" -b "${branchName}" ${baseBranch}`, {
        cwd: basePath,
        stdio: 'inherit'
      });
      
      console.log(`✅ Worktree created!`);
      
      // Switch to worktree
      process.chdir(worktreePath);
      console.log(`✅ Switched to: ${worktreePath}\n`);
      
      // Copy node_modules if exists (faster than npm install)
      const mainNodeModules = join(basePath, 'node_modules');
      const worktreeNodeModules = join(worktreePath, 'node_modules');
      
      if (existsSync(mainNodeModules) && !existsSync(worktreeNodeModules)) {
        console.log(`📦 Linking dependencies...`);
        
        try {
          // Create symlink to node_modules (much faster!)
          execSync(`ln -s "${mainNodeModules}" "${worktreeNodeModules}"`, {
            stdio: 'pipe'
          });
          console.log(`✅ Dependencies linked\n`);
        } catch {
          console.log(`⚠️  Could not link, installing fresh...`);
          
          if (existsSync(join(worktreePath, 'package.json'))) {
            try {
              execSync('npm install', {
                cwd: worktreePath,
                stdio: 'inherit'
              });
              console.log(`✅ Dependencies installed\n`);
            } catch {
              console.log(`⚠️  npm install failed\n`);
            }
          }
        }
      }
      
      // Start dev server if not running
      try {
        // Check if server is already running
        const checkPort = await fetch('http://localhost:5173').catch(() => null);
        
        if (!checkPort) {
          console.log(`🚀 Starting dev server...`);
          
          const { spawn } = require('child_process');
          const devServer = spawn('npm', ['run', 'dev'], {
            cwd: worktreePath,
            detached: true,
            stdio: 'ignore'
          });
          
          devServer.unref();
          console.log(`✅ Dev server started\n`);
        } else {
          console.log(`✅ Dev server already running\n`);
        }
      } catch {}
      
      console.log(`🎯 Ready for prompt: "${taskDesc.substring(0, 60)}..."\n`);
      
      // Save prompt info to file
      const promptInfo = {
        branch: branchName,
        timestamp: new Date().toISOString(),
        task: taskDesc,
        baseBranch: baseBranch,
        worktreePath: worktreePath
      };
      
      require('fs').writeFileSync(
        join(worktreePath, '.claude-prompt.json'),
        JSON.stringify(promptInfo, null, 2)
      );
      
      return { 
        success: true, 
        worktreeCreated: true,
        worktreePath,
        branch: branchName,
        isPerPrompt: true
      };
      
    } catch (error) {
      console.error(`❌ Failed to create worktree: ${error.message}`);
      return { 
        success: false, 
        error: error.message 
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
