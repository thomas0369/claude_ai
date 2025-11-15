/**
 * Phase 4: Game AI Player Testing
 *
 * Test game mechanics, balance, and difficulty with intelligent AI
 */

async function run(orchestrator) {
  const { page, config } = orchestrator;

  console.log(`🎮 Starting Game AI Player...\n`);

  // Check if this is actually a game
  const isGame = await detectGame(page);

  if (!isGame) {
    console.log(`  ⏭️  Not a game, skipping AI player\n`);
    return { skipped: true, reason: 'Not a game' };
  }

  const results = {
    gameDetected: true,
    strategies: {},
    difficultyAnalysis: null,
    exploits: [],
    suggestions: []
  };

  // Strategy 1: Random Player (Baseline)
  console.log(`  Running random strategy (baseline)...`);
  results.strategies.random = await playRandom(page, 30000);  // 30s
  console.log(`    Score: ${results.strategies.random.score}, Actions: ${results.strategies.random.actions}`);

  // Strategy 2: Optimal Player (Difficulty Test)
  console.log(`  Running optimal strategy (difficulty test)...`);
  results.strategies.optimal = await playOptimal(page, 60000);  // 60s
  console.log(`    Score: ${results.strategies.optimal.score}, Efficiency: ${results.strategies.optimal.efficiency.toFixed(2)}`);

  // Exploit Detection
  console.log(`  Searching for exploits...`);
  results.exploits = await detectExploits(page);
  if (results.exploits.length > 0) {
    console.log(`    ⚠️  Found ${results.exploits.length} potential exploits`);
  } else {
    console.log(`    ✅ No exploits detected`);
  }

  // Generate suggestions
  results.suggestions = generateGameSuggestions(results);

  return results;
}

async function detectGame(page) {
  return await page.evaluate(() => {
    return !!(
      document.querySelector('canvas') ||
      window.Konva ||
      window.Phaser ||
      window.BABYLON ||
      window.THREE ||
      document.querySelector('[data-game]')
    );
  });
}

async function playRandom(page, duration) {
  const actions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyX'];
  const startTime = Date.now();
  let actionCount = 0;

  const initialState = await getGameState(page);

  while (Date.now() - startTime < duration) {
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    await page.keyboard.press(randomAction);
    actionCount++;
    await page.waitForTimeout(100);

    // Check if game over
    const gameOver = await checkGameOver(page);
    if (gameOver) break;
  }

  const finalState = await getGameState(page);

  return {
    strategy: 'random',
    duration: Date.now() - startTime,
    actions: actionCount,
    score: finalState.score - initialState.score,
    survived: !finalState.gameOver
  };
}

async function playOptimal(page, duration) {
  const startTime = Date.now();
  let actionCount = 0;

  const initialState = await getGameState(page);

  while (Date.now() - startTime < duration) {
    const state = await getGameState(page);

    // Calculate best action based on game state
    const action = calculateBestAction(state);

    await page.keyboard.press(action);
    actionCount++;
    await page.waitForTimeout(16);  // ~60fps

    if (state.gameOver) break;
  }

  const finalState = await getGameState(page);
  const scoreDelta = finalState.score - initialState.score;

  return {
    strategy: 'optimal',
    duration: Date.now() - startTime,
    actions: actionCount,
    score: scoreDelta,
    efficiency: actionCount > 0 ? scoreDelta / actionCount : 0
  };
}

function calculateBestAction(state) {
  // Simple AI logic: avoid threats, pursue opportunities
  const actions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];

  // If enemies detected, try to avoid
  if (state.enemies && state.enemies.length > 0) {
    const nearestEnemy = state.enemies[0];
    const player = state.player;

    if (!player || !nearestEnemy) {
      return actions[Math.floor(Math.random() * actions.length)];
    }

    // Move away from nearest enemy
    if (nearestEnemy.x < player.x) return 'ArrowRight';
    if (nearestEnemy.x > player.x) return 'ArrowLeft';
    if (nearestEnemy.y < player.y) return 'ArrowDown';
    if (nearestEnemy.y > player.y) return 'ArrowUp';
  }

  // Default: random action
  return actions[Math.floor(Math.random() * actions.length)];
}

async function getGameState(page) {
  return await page.evaluate(() => {
    // Try to access game state from global scope
    const game = window.game || window.gameInstance || window.app || {};

    return {
      score: game.score || 0,
      level: game.level || 1,
      lives: game.lives || 0,
      player: game.player ? {
        x: game.player.x || game.player.position?.x || 0,
        y: game.player.y || game.player.position?.y || 0
      } : null,
      enemies: (game.enemies || []).map(e => ({
        x: e.x || e.position?.x || 0,
        y: e.y || e.position?.y || 0
      })),
      gameOver: game.gameOver || false
    };
  });
}

async function checkGameOver(page) {
  return await page.evaluate(() => {
    const game = window.game || window.gameInstance || window.app || {};
    return game.gameOver || false;
  });
}

async function detectExploits(page) {
  const exploits = [];

  // Test 1: Spam jump
  const spamResult = await testSpamAction(page, 'Space', 100);
  if (spamResult.scoreIncrease > 100) {
    exploits.push({
      name: 'Jump spam exploit',
      severity: 'medium',
      description: `Spamming jump grants ${spamResult.scoreIncrease} points`,
      suggestion: 'Add cooldown to jump action'
    });
  }

  // Test 2: Stay still
  const stillResult = await testStayStill(page, 10000);
  if (stillResult.scoreIncrease > 50) {
    exploits.push({
      name: 'Idle farming',
      severity: 'low',
      description: `Staying still grants ${stillResult.scoreIncrease} points`,
      suggestion: 'Only reward active gameplay'
    });
  }

  return exploits;
}

async function testSpamAction(page, key, count) {
  const initialState = await getGameState(page);

  for (let i = 0; i < count; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(10);
  }

  await page.waitForTimeout(1000);

  const finalState = await getGameState(page);

  return {
    scoreIncrease: finalState.score - initialState.score
  };
}

async function testStayStill(page, duration) {
  const initialState = await getGameState(page);

  await page.waitForTimeout(duration);

  const finalState = await getGameState(page);

  return {
    scoreIncrease: finalState.score - initialState.score
  };
}

function generateGameSuggestions(results) {
  const suggestions = [];

  // Compare random vs optimal
  const randomScore = results.strategies.random.score;
  const optimalScore = results.strategies.optimal.score;

  if (optimalScore > randomScore * 5) {
    suggestions.push({
      type: 'difficulty',
      priority: 'medium',
      message: 'Game may be too easy - optimal AI scored 5x better than random',
      suggestion: 'Increase difficulty or improve AI opponents'
    });
  }

  if (optimalScore < randomScore) {
    suggestions.push({
      type: 'difficulty',
      priority: 'high',
      message: 'Optimal strategy performs worse than random - possible balance issue',
      suggestion: 'Review game mechanics and reward system'
    });
  }

  // Check exploits
  results.exploits.forEach(exploit => {
    suggestions.push({
      type: 'exploit',
      priority: exploit.severity === 'high' ? 'high' : 'medium',
      message: exploit.description,
      suggestion: exploit.suggestion
    });
  });

  return suggestions;
}

module.exports = { run };
