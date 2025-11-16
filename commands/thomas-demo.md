---
description: Visual demonstration of thomas-app test results - replay customer journeys in Chromium with UI overlay
category: workflow
allowed-tools: Bash, Task, TodoWrite, Read, Glob, Grep
---

# Thomas Demo - Visual Journey Results Demonstration

**IMPORTANT**: This command READS and VISUALLY REPLAYS test results from thomas-app.
It does NOT run tests - it shows you what was already tested.

Workflow:
1. Run `thomas-app` to test your application
2. Run `thomas-demo` to see a visual replay of the test results

## Usage

```bash
# Demo test results from default location (.thomas-app/report.json in project)
node ~/.claude/scripts/thomas-app/thomas-demo.mjs

# Demo test results from custom location
node ~/.claude/scripts/thomas-app/thomas-demo.mjs --results /path/to/report.json

# Demo specific journey only
node ~/.claude/scripts/thomas-app/thomas-demo.mjs --journey "Browse to Purchase"

# Adjust replay speed (0.5 = slower, 2.0 = faster)
node ~/.claude/scripts/thomas-app/thomas-demo.mjs --speed 0.5
```

## Features

### Visual UI Overlay
- Floating panel showing test results
- Current journey and step progress
- Step status indicators (✅ ▶️ ⏸ ❌)
- Progress bar with percentage
- Beautiful purple gradient design

### Element Highlighting
- Red outlines show what was tested
- Elements scroll into view
- Tooltips show step descriptions
- Smooth animations

### Results Display
- Shows which journeys passed/failed
- Displays friction points detected
- Step-by-step replay of test execution
- Final summary with scores
- All from the thomas-app test results

### Replay Speed Control
- Default: Normal viewing speed
- --speed 0.5: Slower for presentations
- --speed 2.0: Faster for quick reviews
- Delays scale proportionally

## Supported App Types

- **game**: Player onboarding, gameplay loops
- **ecommerce**: Browse to purchase, product search
- **saas**: Sign up flows, dashboard navigation
- **content**: Article browsing, reading experience
- **website**: Homepage tours, navigation flows

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 THOMAS APP - VISUAL DEMONSTRATION MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

App Type: ecommerce
Base URL: http://localhost:3000

🚀 Launching browser...
✅ Browser ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭 Journey: Browse to Purchase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Step 1: Land on homepage
  ✅ Complete
  Step 2: Wait for products to load
  ✅ Complete
  Step 3: Click first product
  ✅ Complete
  Step 4: Add product to cart
  ✅ Complete
  Step 5: Navigate to cart
  ✅ Complete
  Step 6: Proceed to checkout
  ✅ Complete

✅ Journey Complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DEMO RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Journeys:     1/1 passed (100%)
Steps:        6/6 successful
Duration:     18s
Screenshots:  0 captured

Press Ctrl+C to exit...
```

## Use Cases

1. **Client Demonstrations**: Show stakeholders how the app works
2. **Team Onboarding**: Help new developers understand user flows
3. **QA Reviews**: Visual review of test coverage
4. **Documentation**: Record videos of journeys for documentation
5. **Debugging**: See exactly where journeys fail with visual feedback
6. **Presentations**: Demo app functionality in meetings

## Differences from thomas-app

| Feature | thomas-app | thomas-demo |
|---------|------------|-------------|
| Purpose | Run tests and analyze app | Replay and visualize test results |
| Execution | Actually tests the app | Reads existing test results |
| Speed | Test speed (fast) | Replay speed (slow, viewable) |
| Output | JSON/HTML reports | Visual browser demonstration |
| UI Overlay | None | Floating results panel |
| Element Highlighting | No | Yes (shows what was tested) |
| Use Case | CI/CD, automated testing | Stakeholder demos, understanding flows |

## Tips

- Run this on a dev server that's already running
- Use --speed 0.5 for presentations
- Use --speed 2.0 for quick previews
- Record screen to create demo videos
- Keep browser window visible during demo

## Implementation

The demo command:
1. Launches Chromium in headed mode
2. Injects floating UI overlay into the page
3. Loads customer journeys for the app type
4. For each journey step:
   - Highlights the target element
   - Shows step description in tooltip
   - Executes the action
   - Updates progress bar
   - Marks step complete
5. Shows visual results summary
6. Keeps browser open for review

All visual elements use high z-index to stay on top of page content.
