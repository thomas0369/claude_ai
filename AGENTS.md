# Agent Usage Guidelines

## When to Use Agents vs Direct Tools

### ✅ Use Task Tool (Agents)
- **Codebase exploration**: "where is X?", "how does Y work?"
- **Multi-file searches**: Finding patterns across >3 files
- **Complex analysis**: Understanding system architecture
- **Open-ended tasks**: No specific file target

### ❌ Use Direct Tools
- **Known file path**: Use Read for specific files
- **Single class search**: Use Glob for `class Foo`
- **2-3 file search**: Use Read on specific files
- **Simple operations**: Cat, ls, git commands

## Agent Selection

**Explore**: Quick codebase questions (quick/medium/very thorough)
**Research-expert**: Web research with citations
**Frontend-error-fixer**: Browser/build errors
**Auto-error-resolver**: TypeScript compilation errors
**Code-refactor-master**: Restructuring, file moves, import updates

## Performance Optimization

**Parallel agents**: Single message with multiple Task calls
**Proper scoping**: Use "quick" for simple searches, "very thorough" for complex
**Trust agent output**: Don't duplicate work agents already did

## Example

```
❌ BAD: Read 5 files manually to find auth implementation
✅ GOOD: Task(Explore, "where is authentication handled?", thorough=medium)
```
