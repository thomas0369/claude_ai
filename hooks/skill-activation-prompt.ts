#!/usr/bin/env tsx
/**
 * UserPromptSubmit Hook: Skill Activation Prompt
 *
 * Analyzes user prompts and suggests relevant skills based on:
 * - Keywords in the prompt
 * - Intent patterns (regex matching)
 *
 * Input: JSON from stdin with user prompt
 * Output: Formatted skill suggestions to stdout
 * Exit: Always 0 (non-blocking, advisory only)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  prompt: string;
}

interface SkillRules {
  version: string;
  description: string;
  skills: Record<string, SkillConfig>;
}

interface SkillConfig {
  type: 'domain' | 'guardrail';
  enforcement: 'suggest' | 'block' | 'warn';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  promptTriggers?: {
    keywords?: string[];
    intentPatterns?: string[];
  };
  fileTriggers?: {
    pathPatterns?: string[];
    pathExclusions?: string[];
    contentPatterns?: string[];
  };
}

interface SkillMatch {
  name: string;
  priority: string;
  reason: string[];
}

async function main() {
  try {
    // Read input from stdin
    const input = await readStdin();
    const hookInput: HookInput = JSON.parse(input);

    // Load skill-rules.json
    // cwd is already the .claude directory
    const skillRulesPath = join(hookInput.cwd, 'skills', 'skill-rules.json');
    const skillRules: SkillRules = JSON.parse(readFileSync(skillRulesPath, 'utf-8'));

    // Match skills based on prompt
    const matches = matchSkills(hookInput.prompt, skillRules);

    // Output suggestions if any matches found
    if (matches.length > 0) {
      outputSkillSuggestions(matches);
    }

    // Always exit 0 (non-blocking)
    process.exit(0);
  } catch (error) {
    // Fail silently - don't break workflow
    // Could log to debug file if needed
    process.exit(0);
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

function matchSkills(prompt: string, skillRules: SkillRules): SkillMatch[] {
  const matches: SkillMatch[] = [];
  const lowerPrompt = prompt.toLowerCase();

  for (const [skillName, config] of Object.entries(skillRules.skills)) {
    const reasons: string[] = [];

    // Only check promptTriggers for UserPromptSubmit
    if (config.promptTriggers) {
      // Check keywords
      if (config.promptTriggers.keywords) {
        const matchedKeywords = config.promptTriggers.keywords.filter(keyword =>
          lowerPrompt.includes(keyword.toLowerCase())
        );
        if (matchedKeywords.length > 0) {
          reasons.push(`Keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);
        }
      }

      // Check intent patterns
      if (config.promptTriggers.intentPatterns) {
        for (const pattern of config.promptTriggers.intentPatterns) {
          try {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(prompt)) {
              reasons.push(`Intent: ${pattern.substring(0, 40)}...`);
              break; // Only report first matching intent
            }
          } catch (e) {
            // Invalid regex - skip
          }
        }
      }
    }

    // If we found matches, add to results
    if (reasons.length > 0) {
      matches.push({
        name: skillName,
        priority: config.priority,
        reason: reasons
      });
    }
  }

  // Sort by priority (critical > high > medium > low)
  const priorityOrder: Record<string, number> = {
    'critical': 0,
    'high': 1,
    'medium': 2,
    'low': 3
  };

  matches.sort((a, b) => {
    return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
  });

  return matches;
}

function outputSkillSuggestions(matches: SkillMatch[]) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 SKILL ACTIVATION CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📚 RECOMMENDED SKILLS:');

  for (const match of matches) {
    console.log(`  → ${match.name}`);
    if (match.reason.length > 0) {
      console.log(`     ${match.reason[0]}`);
    }
  }

  console.log('');
  console.log('ACTION: Consider using Skill tool for relevant guidelines');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main();
