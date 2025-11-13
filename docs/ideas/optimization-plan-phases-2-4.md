# Claude Code Infrastructure Optimization Plan (Phases 2-4)

**Status:** 💭 SPECULATIVE - Design Exercise Only
**Location:** `docs/ideas/` - Not active implementation
**Philosophy:** Build when it hurts, not when it might

---

## ⚠️ Why This is in Ideas/

**Phase 1 Shipped:** ✅ 99.6% hooks reduction, auto-generated docs
**Current Pain:** None measured yet
**This Document:** Detailed plans for hypothetical future problems

**Reddit Approach Says:**
- ❌ Don't design Phase 2-4 before shipping Phase 1
- ✅ Ship Phase 1 → Use it → Find real pain → Fix that
- ❌ Don't optimize theoretical problems

**Promote to infrastructure/ when:**
- Hooks actually feel slow (measured > 1s per edit)
- Tokens actually problematic (sessions hitting limits)
- Agent loading actually slow (measured > 10s)

**Until then:** Reference only, don't implement

---

# Original Plan Below (Phases 2-4)

**Goal:** Faster, more error-robust, and token-efficient Claude Code infrastructure

**Created:** 2025-11-13
**Status:** Speculative Design

---

## Executive Summary

Based on comprehensive analysis of the current infrastructure:
- **150 markdown files** (agents, skills, commands, docs)
- **~9,619 lines** of documentation across core components
- **10 active hooks** (7 on PostToolUse alone)
- **36MB hooks directory** (mostly node_modules)

**Primary Optimization Targets:**
1. **Speed:** Parallel hook execution, agent concurrency, caching
2. **Error Robustness:** Fallback mechanisms, validation, graceful degradation
3. **Token Efficiency:** Deduplication, lazy loading, compression

**Estimated Impact:**
- 40-60% speed improvement (parallel hooks + caching)
- 30-50% token reduction (deduplication + lazy loading)
- 90%+ error resilience (fallbacks + validation)

---

## Current State Analysis

### Infrastructure Metrics

| Component | Count | Size | Lines | Issues |
|-----------|-------|------|-------|--------|
| **Agents** | 50+ | 860K | 5,166 | Outdated README (says 10), potential duplication |
| **Skills** | 5 | 440K | 1,889 | Good progressive disclosure, could optimize resources |
| **Commands** | 28+ | 380K | 2,564 | Well-structured, some complexity could be reduced |
| **Hooks** | 10 | 36MB | N/A | Huge node_modules, 7 sequential PostToolUse hooks |
| **Docs** | 150 | N/A | N/A | Excellent organization, potential link optimization |

### Performance Bottlenecks

**Critical (High Impact):**
1. **7 Sequential PostToolUse Hooks** - Each edit triggers 7 sequential executions
   - `post-tool-use-tracker.sh`
   - `claudekit-hooks run lint-changed`
   - `claudekit-hooks run typecheck-changed`
   - `claudekit-hooks run check-any-changed`
   - `claudekit-hooks run test-changed`
   - `claudekit-hooks run check-comment-replacement`
   - `claudekit-hooks run check-unused-parameters`

2. **36MB Hooks Directory** - Mostly node_modules loaded on every session

3. **Agent Invocation Overhead** - Each agent loads full context

**Medium Impact:**
4. **Skill Resource Loading** - All resources loaded even if not needed
5. **Command Complexity** - Some commands do multiple things
6. **Documentation Duplication** - Similar content across agents/skills

**Low Impact:**
7. **Memory Bank Access** - Manual scripts, no caching
8. **Outdated Agent README** - Says 10 agents but we have 50+

### Token Usage Analysis

**High Token Consumers:**
- Agent definitions: ~5,166 lines (avg 103 lines per agent)
- Skill main files: ~1,889 lines (avg 378 lines per skill)
- Skill resources: Loaded on-demand (good!)
- Hook outputs: Variable (some verbose)

**Duplication Opportunities:**
- Agent "When to use" patterns (similar across categories)
- Validation commands repeated in multiple agents
- Common code examples (TypeScript, React patterns)
- Error handling boilerplate

---

## Optimization Strategy

### Phase 1: Quick Wins (Week 1) - 30% Impact

**Priority 1.1: Parallel Hook Execution**
- **Problem:** 7 PostToolUse hooks run sequentially (700ms+ delay per edit)
- **Solution:** Run independent hooks in parallel
- **Implementation:**
  ```json
  {
    "PostToolUse": [
      {
        "type": "parallel",
        "hooks": [
          "claudekit-hooks run lint-changed",
          "claudekit-hooks run typecheck-changed",
          "claudekit-hooks run check-any-changed"
        ]
      },
      {
        "type": "parallel",
        "hooks": [
          "claudekit-hooks run test-changed",
          "claudekit-hooks run check-comment-replacement",
          "claudekit-hooks run check-unused-parameters"
        ]
      },
      "post-tool-use-tracker.sh"  // Must run last (depends on file tracking)
    ]
  }
  ```
- **Impact:** 40-60% faster edit responses
- **Effort:** 2 hours (requires claudekit-hooks support or wrapper script)
- **Risk:** Low (hooks are independent)

**Priority 1.2: Hooks Node Modules Optimization**
- **Problem:** 36MB node_modules in hooks directory
- **Solution:** Move to pnpm workspace or shared node_modules
- **Implementation:**
  ```bash
  # Option A: pnpm workspace (best)
  pnpm install --workspace-root

  # Option B: Symlink to project node_modules
  ln -s ../node_modules hooks/node_modules
  ```
- **Impact:** 35MB saved, faster session startup
- **Effort:** 1 hour
- **Risk:** Low (hooks already use tsx which bundles dependencies)

**Priority 1.3: Agent README Update**
- **Problem:** README says 10 agents but we have 50+
- **Solution:** Auto-generate README from agent frontmatter
- **Implementation:**
  ```bash
  # Create script: scripts/update-agent-readme.sh
  # Reads all agent/*.md files, extracts frontmatter, generates README
  ```
- **Impact:** Better discoverability, accurate documentation
- **Effort:** 3 hours
- **Risk:** Very low

---

### Phase 2: Structural Improvements (Week 2) - 40% Impact

**Priority 2.1: Agent Template System**
- **Problem:** Duplication in agent structure and validation commands
- **Solution:** Create shared templates and partials
- **Implementation:**
  ```
  agents/
  ├── _templates/
  │   ├── validation-commands.md      # Shared validation snippets
  │   ├── when-to-use-pattern.md      # Standard "when to use" format
  │   ├── code-review-checklist.md    # Shared checklist items
  │   └── typescript-examples.md      # Common TS code examples
  └── [agent-name].md                 # References templates via includes
  ```
- **Usage:**
  ```markdown
  ## Validation Commands
  {{include: _templates/validation-commands.md}}

  ## TypeScript Examples
  {{include: _templates/typescript-examples.md#strict-mode}}
  ```
- **Impact:** 30-40% token reduction in agents (1,500-2,000 lines saved)
- **Effort:** 1 week (refactor 50+ agents)
- **Risk:** Medium (need to ensure no functionality breaks)

**Priority 2.2: Lazy Loading for Skill Resources**
- **Problem:** All skill resources might be loaded even if not needed
- **Solution:** Explicit resource loading on-demand
- **Implementation:**
  ```markdown
  ## Component Patterns

  For detailed component patterns, use:
  /skill-load frontend-dev-guidelines component-patterns

  Or ask: "Show me the component patterns from frontend guidelines"
  ```
- **Impact:** 20-30% token savings when partial skill needed
- **Effort:** 2 days (update 5 skills)
- **Risk:** Low (progressive disclosure already in place)

**Priority 2.3: Command Consolidation**
- **Problem:** Some commands could be merged (git:commit, git:push, git:status)
- **Solution:** Create command groups with subcommands
- **Implementation:**
  ```
  commands/
  ├── git.md                 # /git <subcommand>
  ├── checkpoint.md          # /checkpoint <subcommand>
  └── spec.md                # /spec <subcommand>
  ```
- **Impact:** Simpler command structure, easier maintenance
- **Effort:** 3 days
- **Risk:** Low (preserve backward compatibility with aliases)

---

### Phase 3: Advanced Optimizations (Week 3-4) - 30% Impact

**Priority 3.1: Agent Caching System**
- **Problem:** Same agent invoked multiple times re-loads full context
- **Solution:** Cache agent results and reuse when appropriate
- **Implementation:**
  ```bash
  # Create cache structure
  .claude/cache/
  ├── agents/
  │   └── [agent-name]-[context-hash].json
  └── skills/
      └── [skill-name]-[resource].md

  # Cache invalidation: 24 hours or file changes
  ```
- **Impact:** 50-70% faster repeated agent invocations
- **Effort:** 1 week (need cache management system)
- **Risk:** Medium (cache invalidation must be correct)

**Priority 3.2: Concurrent Agent Execution**
- **Problem:** Multiple agents invoked sequentially
- **Solution:** Run independent agents in parallel
- **Implementation:**
  ```typescript
  // Example: /code-review running 6 parallel agents
  const agents = [
    'code-quality-expert',
    'security-expert',
    'performance-expert',
    'testing-expert',
    'documentation-expert',
    'accessibility-expert'
  ];

  // Run all in parallel
  const results = await Promise.all(
    agents.map(agent => invokeAgent(agent, context))
  );
  ```
- **Impact:** 80% faster multi-agent commands (6 sequential → parallel)
- **Effort:** 1 week (requires claude-code API support)
- **Risk:** High (need to verify Claude Code supports concurrent agents)

**Priority 3.3: Smart Skill Activation**
- **Problem:** Skill activation hook suggests skills even when not needed
- **Solution:** ML-based or rule-based confidence scoring
- **Implementation:**
  ```typescript
  // Enhanced skill-activation-prompt.ts
  interface SkillSuggestion {
    name: string;
    confidence: number;  // 0-1
    reason: string;
  }

  // Only suggest skills with confidence > 0.7
  const suggestions = await analyzeContext(files, userPrompt);
  const relevant = suggestions.filter(s => s.confidence > 0.7);
  ```
- **Impact:** Fewer irrelevant skill suggestions, better UX
- **Effort:** 1 week
- **Risk:** Medium (need to tune confidence thresholds)

**Priority 3.4: Documentation Link Graph**
- **Problem:** Duplication across documentation files
- **Solution:** Create documentation graph with cross-references
- **Implementation:**
  ```markdown
  ## TypeScript Best Practices

  See: [TypeScript Standards](../../skills/frontend-dev-guidelines/resources/typescript-standards.md#best-practices)

  TL;DR: Use strict mode, avoid `any`, prefer interfaces
  ```
- **Impact:** 15-20% documentation token reduction
- **Effort:** 5 days (analyze and refactor 150 files)
- **Risk:** Low (better organization, easier maintenance)

---

### Phase 4: Error Robustness (Ongoing)

**Priority 4.1: Hook Fallback System**
- **Problem:** Single hook failure blocks entire hook chain
- **Solution:** Graceful degradation with fallbacks
- **Implementation:**
  ```json
  {
    "PostToolUse": [
      {
        "type": "try-catch",
        "hook": "claudekit-hooks run typecheck-changed",
        "fallback": "warn",  // Options: warn, skip, stop
        "timeout": 5000
      }
    ]
  }
  ```
- **Impact:** 95%+ hook reliability
- **Effort:** 3 days (implement wrapper + update settings)
- **Risk:** Low

**Priority 4.2: Agent Validation Layer**
- **Problem:** Agents can fail silently or return unexpected formats
- **Solution:** Validate agent inputs and outputs
- **Implementation:**
  ```typescript
  interface AgentResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata: {
      agent: string;
      duration: number;
      tokensUsed: number;
    };
  }

  // Validate before using results
  function validateAgentResult(result: AgentResult) {
    if (!result.success) {
      log.error(`Agent ${result.metadata.agent} failed: ${result.error}`);
      return fallbackBehavior();
    }
    return result.data;
  }
  ```
- **Impact:** 90%+ agent reliability
- **Effort:** 1 week (add validation to all agents)
- **Risk:** Medium (need to handle all failure modes)

**Priority 4.3: Command Error Recovery**
- **Problem:** Commands fail without helpful error messages
- **Solution:** Enhanced error messages with recovery suggestions
- **Implementation:**
  ```bash
  # Example: /thomas-setup error handling
  if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory not found"
    echo ""
    echo "💡 Recovery options:"
    echo "  1. Create directory: mkdir -p $PROJECT_DIR"
    echo "  2. Specify different path: /thomas-setup --dir=/path/to/project"
    echo "  3. Run in current directory: /thomas-setup --here"
    exit 1
  fi
  ```
- **Impact:** Better UX, self-service recovery
- **Effort:** 1 week (update 28 commands)
- **Risk:** Low

**Priority 4.4: Health Check System**
- **Problem:** No visibility into infrastructure health
- **Solution:** Create health check command
- **Implementation:**
  ```bash
  # /health-check command
  ✅ Agents: 50 loaded, 0 errors
  ✅ Skills: 5 loaded, 0 errors
  ✅ Commands: 28 loaded, 0 errors
  ⚠️  Hooks: 9/10 healthy (typecheck-changed timeout)
  ✅ Memory Bank: Accessible
  ✅ Node Modules: Installed (hooks, scripts)

  💡 Suggested fixes:
  - Increase typecheck-changed timeout in settings.json
  ```
- **Impact:** Proactive issue detection
- **Effort:** 3 days
- **Risk:** Very low

---

## Implementation Priorities

### Must Have (Do First)
1. ✅ **Parallel Hook Execution** - Biggest speed improvement
2. ✅ **Hooks Node Modules Optimization** - 35MB savings
3. ✅ **Agent README Update** - Fix outdated docs
4. ✅ **Hook Fallback System** - Critical for reliability

### Should Have (Do Soon)
5. **Agent Template System** - Major token savings
6. **Lazy Loading for Skill Resources** - Token efficiency
7. **Command Error Recovery** - Better UX
8. **Health Check System** - Visibility

### Nice to Have (Do Later)
9. **Agent Caching System** - Complex but valuable
10. **Concurrent Agent Execution** - Needs API support
11. **Smart Skill Activation** - ML-based improvements
12. **Documentation Link Graph** - Long-term maintenance

---

## Metrics & KPIs

### Speed Metrics
- **Hook execution time:** Target < 200ms per edit (from ~700ms)
- **Agent invocation time:** Target < 5s (from ~10s)
- **Session startup time:** Target < 2s (from ~5s)

### Token Efficiency
- **Agent token usage:** Target 30% reduction (from 5,166 lines to ~3,600)
- **Skill token usage:** Target 20% reduction with lazy loading
- **Overall documentation:** Target 25% reduction via deduplication

### Error Robustness
- **Hook success rate:** Target 95%+ (from ~80%)
- **Agent success rate:** Target 90%+ (from ~70%)
- **Command success rate:** Target 95%+ (from ~85%)

### User Experience
- **Error recovery rate:** Target 80% self-service recovery
- **Documentation findability:** Target < 30s to find relevant doc
- **Infrastructure health visibility:** 100% component visibility

---

## Risk Assessment

### Low Risk (Safe to Implement)
- Hooks node_modules optimization
- Agent README update
- Command error recovery
- Health check system
- Documentation link graph

### Medium Risk (Test Thoroughly)
- Parallel hook execution (verify independence)
- Agent template system (ensure no functionality breaks)
- Agent validation layer (handle all failure modes)
- Smart skill activation (tune thresholds)

### High Risk (Prototype First)
- Agent caching system (cache invalidation is hard)
- Concurrent agent execution (API support unclear)
- Command consolidation (backward compatibility)

---

## Success Criteria

### Phase 1 Success (Week 1)
- [ ] PostToolUse hooks run in parallel (< 250ms per edit)
- [ ] Hooks directory < 5MB (from 36MB)
- [ ] Agent README accurately lists all 50+ agents
- [ ] Hook fallback system prevents cascade failures

### Phase 2 Success (Week 2)
- [ ] Agent templates reduce duplication by 30%+
- [ ] Skill resources load on-demand
- [ ] Commands consolidated into logical groups
- [ ] Error messages provide recovery suggestions

### Phase 3 Success (Week 3-4)
- [ ] Agent caching reduces repeat invocations by 50%+
- [ ] Multi-agent commands run concurrently
- [ ] Skill activation has < 10% false positive rate
- [ ] Documentation cross-references eliminate duplication

### Overall Success
- [ ] 40-60% speed improvement measured
- [ ] 30-50% token reduction measured
- [ ] 90%+ error resilience achieved
- [ ] User satisfaction feedback positive

---

## Next Steps

### Immediate Actions (This Week)
1. **Implement parallel hook execution**
   - Research claudekit-hooks parallel support
   - Create wrapper script if needed
   - Test with all 7 PostToolUse hooks
   - Measure performance improvement

2. **Optimize hooks node_modules**
   - Evaluate pnpm workspace approach
   - Test symlink approach
   - Implement chosen solution
   - Verify hooks still work

3. **Update agent README**
   - Write script to extract agent metadata
   - Generate comprehensive agent list
   - Add categorization (TypeScript, React, Testing, etc.)
   - Include "when to use" guidance

4. **Design hook fallback system**
   - Define fallback behaviors (warn, skip, stop)
   - Create wrapper script for error handling
   - Add timeout configuration
   - Test with failing hooks

### Planning Actions (Next Week)
5. **Agent template analysis**
   - Identify common patterns across agents
   - Design template structure
   - Create proof-of-concept with 3 agents
   - Measure token savings

6. **Skill lazy loading design**
   - Review current skill activation patterns
   - Design on-demand resource loading
   - Update skill documentation format
   - Test with frontend-dev-guidelines

### Research Actions (Ongoing)
7. **Claude Code API capabilities**
   - Test concurrent agent execution
   - Verify caching possibilities
   - Check parallel tool call support
   - Document findings

8. **Community best practices**
   - Research other Claude Code setups
   - Identify optimization patterns
   - Share findings on GitHub
   - Contribute improvements

---

## Appendix A: Measurement Tools

### Speed Measurement
```bash
# Measure hook execution time
time (echo '{"tool":"Write","file":"test.ts"}' | ~/.claude/hooks/post-tool-use-tracker.sh)

# Measure agent invocation time
time claude-code agent code-review-expert "Review src/components/Button.tsx"

# Measure session startup time
time claude-code --version  # Proxy for startup time
```

### Token Measurement
```bash
# Count tokens in agents
find agents -name "*.md" -exec wc -w {} + | tail -1

# Count tokens in skills
find skills -name "SKILL.md" -exec wc -w {} + | tail -1

# Estimate tokens (rough: 1 token ≈ 0.75 words)
echo "scale=2; $(wc -w < file.md) * 0.75" | bc
```

### Error Rate Measurement
```bash
# Hook success rate (from logs)
grep "hook.*success" ~/.claude/logs/*.log | wc -l
grep "hook.*error" ~/.claude/logs/*.log | wc -l

# Agent success rate (from history)
grep "agent.*completed" history.jsonl | wc -l
grep "agent.*failed" history.jsonl | wc -l
```

---

## Appendix B: Rollback Plan

If optimization causes issues:

### Immediate Rollback
```bash
# Revert to previous commit
git revert HEAD

# Restore settings.json
cp settings.json.backup settings.json

# Restart Claude Code
```

### Gradual Rollback
```bash
# Disable specific optimization
# Example: Disable parallel hooks
sed -i 's/"type": "parallel"/"type": "sequential"/g' settings.json

# Restore original agent
cp agents/backup/agent-name.md agents/agent-name.md
```

### Emergency Rollback
```bash
# Full infrastructure restore
git checkout main~5  # Go back 5 commits
rm -rf .claude/cache  # Clear cache
npm install           # Reinstall dependencies
```

---

**Document Owner:** Thomas
**Last Updated:** 2025-11-13
**Next Review:** After Phase 1 completion
