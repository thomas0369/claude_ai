# Ideas Folder

**Purpose:** Design exercises and speculative planning

**Philosophy:** "Build when it hurts" (Reddit 6-month approach)

---

## What Goes Here

Documents in this folder are:
- 💭 **Design exercises** - Exploring possibilities
- 📝 **Future plans** - Not yet validated by real pain
- 🧪 **Experiments** - Untested theories
- 🗺️ **Roadmaps** - Directional only, not commitments

**These are NOT:**
- ❌ Implementation plans
- ❌ Priorities to execute
- ❌ Promises or commitments
- ❌ Solutions to current problems

---

## When to Promote from Ideas → Infrastructure

A document graduates from `ideas/` to `infrastructure/` when:

1. **Real pain exists** - Not theoretical, actual problem
2. **Measured impact** - Quantified the problem
3. **Validated approach** - Tested or researched
4. **Ready to ship** - Implementation is next step

**Example:**
```
Bad:  "Hooks might be slow" → Design fallback system
Good: "Hooks failing 30% of time" → Implement fallback
```

---

## Current Ideas

### optimization-plan-phases-2-4.md
**Status:** Speculative roadmap
**Why here:** Designed before measuring actual pain
**Promote when:** Hooks actually feel slow OR tokens actually problematic
**Contains:** Agent templates, caching, concurrent execution plans

### hook-fallback-design.md
**Status:** Complete design, no implementation need
**Why here:** Hooks working well (85% success), no acute pain
**Promote when:** Hook failures > 15% OR cascade failures occur
**Contains:** Safe hook runner, health monitoring, fallback modes

---

## Reddit Philosophy Reminder

From "6 months of hardcore Claude Code use":

**DO:**
- ✅ Fix actual pain points
- ✅ Measure before and after
- ✅ Ship small improvements
- ✅ Document what worked

**DON'T:**
- ❌ Over-plan (4-phase roadmaps)
- ❌ Design before you need it
- ❌ Optimize theoretical problems
- ❌ Document hypothetical futures

**Mantra:** *"Real problems are better teachers than perfect plans."*

---

## How to Use This Folder

### When Adding Ideas
1. Write freely - no constraints
2. Mark as "Speculative"
3. Note what would make it real
4. Don't feel obligated to implement

### When Reviewing Ideas
1. Check if problem now exists
2. If yes: Validate approach, promote to infrastructure
3. If no: Keep as reference, don't implement

### When Implementing
1. Look at infrastructure docs first (proven patterns)
2. Reference ideas docs for inspiration
3. Measure pain → Fix pain → Document lessons

---

**Remember:** Ideas are cheap. Shipping is valuable. Pain is the best teacher.

---

**Last Updated:** 2025-11-13
**Folder Status:** Active (for design exercises only)
