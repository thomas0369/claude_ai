# Troubleshooting Guide - [Project Name]

**Last Updated**: [Date]

## Quick Diagnostics

### Health Check
```bash
# Check if all systems are running
npm run dev           # Should start without errors
npm test             # Should pass all tests
npm run build        # Should complete successfully
```

### Common First Steps
1. **Clear cache**: `rm -rf node_modules .vite && npm install`
2. **Check environment**: `cat .env` (ensure all required vars are set)
3. **Check logs**: `~/.claude/logs/errors.jsonl`
4. **Run `/thomas-fix`**: Comprehensive validation

---

## Build & Development Issues

### Issue: Dev Server Won't Start

**Symptoms**: `npm run dev` fails or hangs

**Possible Causes**:
1. Port already in use
2. Missing environment variables
3. Corrupted node_modules

**Solutions**:
```bash
# Check if port is in use
lsof -ti:5173 | xargs kill -9  # Kill process on port 5173

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cp .env.example .env
# Fill in required values

# Try again
npm run dev
```

---

### Issue: Build Fails with TypeScript Errors

**Symptoms**: `npm run build` fails with TS errors

**Possible Causes**:
1. Type mismatch in code
2. Missing type definitions
3. Strict mode violations

**Solutions**:
```bash
# Check specific errors
npx tsc --noEmit

# Common fixes:
# - Add type annotations
# - Install @types/* packages
# - Fix `any` types

# Run type check
npm run type-check
```

---

### Issue: Vite HMR Not Working

**Symptoms**: Changes don't reflect in browser

**Solutions**:
```bash
# Restart dev server
# Check browser console for errors
# Clear browser cache (Cmd+Shift+R)
# Check vite.config.ts for HMR settings
```

---

## Runtime Errors

### Issue: "Cannot read property of undefined"

**Symptoms**: Browser console shows undefined property access

**Possible Causes**:
1. API response doesn't match expected structure
2. Missing null checks
3. Data not loaded yet

**Solutions**:
```typescript
# Add null checks
const value = data?.property ?? 'default'

# Use optional chaining
const nested = obj?.level1?.level2

# Add loading states
if (!data) return <LoadingSpinner />
```

---

### Issue: Infinite Re-renders

**Symptoms**: Browser freezes, "Maximum update depth exceeded"

**Possible Causes**:
1. State update in render
2. Missing useCallback dependencies
3. Object/array created in render

**Solutions**:
```typescript
# Move state updates to event handlers
const handleClick = useCallback(() => {
  setState(newValue)
}, [])

# Memoize objects/arrays
const config = useMemo(() => ({ ...options }), [options])

# Use useCallback for handlers
const handler = useCallback(() => {...}, [deps])
```

---

## API & Network Issues

### Issue: API Requests Failing

**Symptoms**: Network errors in console, 404/500 responses

**Possible Causes**:
1. Wrong API endpoint
2. Missing authentication
3. CORS issues
4. Backend not running

**Solutions**:
```bash
# Check API endpoint format
# Correct: /form/route
# Wrong: /api/form/route

# Check authentication
# Ensure cookies/tokens are present

# Check backend is running
curl http://localhost:3000/health

# Check CORS configuration
# Backend must allow your frontend origin
```

---

### Issue: Stale Data Displayed

**Symptoms**: Old data shows after mutation

**Possible Causes**:
1. TanStack Query cache not invalidated
2. Optimistic update not configured

**Solutions**:
```typescript
# Invalidate queries after mutation
const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['data'] })
  }
})

# Force refetch
queryClient.refetchQueries({ queryKey: ['data'] })
```

---

## Database Issues

### Issue: Database Connection Failed

**Symptoms**: Backend errors, cannot connect to DB

**Solutions**:
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check if DB is running
docker ps  # If using Docker

# Reset connections
# Restart DB service
```

---

### Issue: Migration Failures

**Symptoms**: Migration command fails

**Solutions**:
```bash
# Check migration files
ls migrations/

# Run migrations manually
npm run migrate

# Rollback if needed
npm run migrate:rollback

# Check database state
psql -d dbname -c "\dt"
```

---

## Test Failures

### Issue: Tests Failing After Changes

**Symptoms**: `npm test` shows failures

**Solutions**:
```bash
# Run specific test
npm test -- path/to/test.test.ts

# Update snapshots if UI changed
npm test -- -u

# Check test isolation
# Ensure tests don't depend on each other

# Clear test cache
rm -rf node_modules/.vitest
```

---

### Issue: Playwright E2E Tests Failing

**Symptoms**: Browser tests fail

**Solutions**:
```bash
# Run with UI for debugging
npx playwright test --ui

# Take screenshots on failure
# (Already configured in playwright.config.ts)

# Check selectors
# Use Playwright Inspector
npx playwright codegen http://localhost:5173

# Check if dev server is running
npm run dev  # In separate terminal
```

---

## BSV Blockchain Issues

### Issue: Transaction Fails

**Symptoms**: BSV transaction doesn't complete

**Possible Causes**:
1. Insufficient funds
2. Invalid address
3. Network issues

**Solutions**:
```bash
# Check wallet balance
# Verify address format
# Check BSV network status
# Review transaction details in console
```

---

### Issue: Ordinal Not Displaying

**Symptoms**: Ordinal data not showing

**Solutions**:
```bash
# Check API response
# Verify ordinal ID
# Check 1Sat indexer status
# Review console for errors
```

---

## Performance Issues

### Issue: Slow Page Load

**Symptoms**: Pages take long to load

**Solutions**:
1. Check Network tab in DevTools
2. Look for large bundles
3. Ensure lazy loading is working
4. Check TanStack Query caching

```bash
# Analyze bundle size
npm run build
# Check dist/ folder sizes

# Verify lazy loading
# Components should be split into chunks
```

---

### Issue: High Memory Usage

**Symptoms**: Browser tab uses excessive memory

**Solutions**:
1. Check for memory leaks
2. Verify cleanup in useEffect
3. Look for unbounded arrays/caches

```typescript
# Always cleanup subscriptions
useEffect(() => {
  const sub = subscribe()
  return () => sub.unsubscribe()
}, [])
```

---

## DaisyUI & Styling Issues

### Issue: DaisyUI Classes Not Working

**Symptoms**: Styles not applied

**Solutions**:
```bash
# Check Tailwind config includes DaisyUI
# Check class names are correct (use DaisyUI docs)
# Verify build process includes CSS
# Clear browser cache
```

---

## Common Error Messages

### "Module not found"
- Check import paths
- Verify file exists
- Check path aliases in vite.config.ts

### "Hydration mismatch"
- Server/client rendering mismatch
- Check for Date objects or random values

### "Network Error"
- Check API is running
- Verify CORS configuration
- Check network tab for details

---

## When All Else Fails

1. **Run `/thomas-fix`**: Comprehensive validation
2. **Check recent changes**: `git diff`
3. **Review error logs**: `~/.claude/logs/errors.jsonl`
4. **Start fresh**:
   ```bash
   git stash
   rm -rf node_modules .vite
   npm install
   npm run dev
   ```
5. **Ask for help**: Include error message, steps to reproduce, and environment details

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code

# Debugging
npm run type-check       # Check TypeScript
npx playwright test --ui # Debug E2E tests
~/.claude/hooks/error-logger.sh stats  # View error stats

# Cleanup
rm -rf node_modules .vite dist
npm install
```

---

## Getting Help

1. Check this troubleshooting guide
2. Search error message in project issues
3. Check [Project Repository Issues]
4. Ask in team chat with:
   - Error message
   - Steps to reproduce
   - What you've already tried
