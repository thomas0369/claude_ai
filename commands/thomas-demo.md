---
description: Visual demonstration of customer journeys in Chromium with UI overlay, element highlighting, and step-by-step progress
category: workflow
allowed-tools: Bash, Task, TodoWrite, Read, Glob, Grep
---

# Thomas Demo - Visual Journey Demonstration

Show all customer journeys from thomas-app running visually in Chromium with:
- Floating UI overlay showing progress
- Element highlighting before each action
- Step-by-step descriptions
- Real-time progress tracking
- Interactive results summary

## Usage

```bash
# Demo all journeys for detected app type
node ~/.claude/scripts/thomas-app/thomas-demo.mjs

# Demo specific app type
node ~/.claude/scripts/thomas-app/thomas-demo.mjs --app-type ecommerce

# Demo specific journey
node ~/.claude/scripts/thomas-app/thomas-demo.mjs --app-type saas --journey "Sign Up Flow"

# Custom base URL
node ~/.claude/scripts/thomas-app/thomas-demo.mjs --base-url http://localhost:5173

# Adjust speed (0.5 = slower, 2.0 = faster)
node ~/.claude/scripts/thomas-app/thomas-demo.mjs --speed 0.5
```

## Features

### Visual UI Overlay
- Floating panel in top-right corner
- Shows current journey and progress
- Lists all steps with status indicators (✅ ▶️ ⏸ ❌)
- Progress bar with percentage
- Beautiful gradient design

### Element Highlighting
- Red outline highlights elements before interaction
- Elements scroll into view automatically
- Tooltip shows step description
- Smooth animations

### Slow Motion Execution
- 1.2s delay before each step
- 0.8s delay after each step
- 0.6s element highlighting
- 2.5s pause between journeys
- Adjustable with --speed parameter

### Results Summary
- Pass/fail for each journey
- Total steps executed
- Duration tracking
- Screenshot locations
- Visual summary screen

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
| Purpose | Comprehensive testing | Visual demonstration |
| Speed | Fast (test speed) | Slow (viewable) |
| UI Overlay | None | Floating progress panel |
| Element Highlighting | No | Yes (red outlines) |
| Step Tooltips | No | Yes (shows descriptions) |
| Progress Bar | Console only | Visual progress bar |
| Results | Report files | Interactive summary screen |

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
