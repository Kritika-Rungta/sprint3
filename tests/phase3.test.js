/**
 * Automated Test Suite for Phase 3 (P2)
 * Tests Battle Mode:
 * - Total stars calculation using Array.prototype.reduce()
 * - Winner, runner-up, and tie outcome logic
 * - Concurrent execution with Promise.all()
 * - Error propagation when a user is not found
 */

const assert = require('assert');
const {
  calculateTotalStars,
  determineBattleOutcome,
  executeBattle
} = require('../app.js');

console.log('🧪 Starting Dev-Detective Phase 3 Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${error.message}`);
  }
}

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${error.message}`);
  }
}

(async () => {
  // -------------------------------------------------------------
  // Test Group 1: Total Stars Calculation with reduce()
  // -------------------------------------------------------------
  console.log('--- Test Group 1: Array.prototype.reduce() Star Summation ---');

  runTest('Sums stargazers_count accurately across multiple repositories', () => {
    const repos = [
      { name: 'repo-1', stargazers_count: 150 },
      { name: 'repo-2', stargazers_count: 350 },
      { name: 'repo-3', stargazers_count: 500 }
    ];
    const total = calculateTotalStars(repos);
    assert.strictEqual(total, 1000);
  });

  runTest('Handles empty repository array by returning 0', () => {
    assert.strictEqual(calculateTotalStars([]), 0);
  });

  runTest('Handles null or undefined repository input gracefully', () => {
    assert.strictEqual(calculateTotalStars(null), 0);
    assert.strictEqual(calculateTotalStars(undefined), 0);
  });

  runTest('Handles repositories with missing or zero stargazers_count', () => {
    const repos = [
      { name: 'repo-zero', stargazers_count: 0 },
      { name: 'repo-missing' },
      { name: 'repo-null', stargazers_count: null },
      { name: 'repo-valid', stargazers_count: 42 }
    ];
    assert.strictEqual(calculateTotalStars(repos), 42);
  });

  // -------------------------------------------------------------
  // Test Group 2: Winner, Runner-Up & Tie Outcome Determination
  // -------------------------------------------------------------
  console.log('\n--- Test Group 2: Battle Outcome Logic ---');

  const fighterA = {
    user: { login: 'alice', name: 'Alice Dev' },
    totalStars: 2500
  };

  const fighterB = {
    user: { login: 'bob', name: 'Bob Engineer' },
    totalStars: 1200
  };

  const fighterC = {
    user: { login: 'charlie', name: 'Charlie Coder' },
    totalStars: 2500
  };

  runTest('Correctly identifies Fighter 1 as winner when stars1 > stars2', () => {
    const outcome = determineBattleOutcome(fighterA, fighterB);
    assert.strictEqual(outcome.isTie, false);
    assert.strictEqual(outcome.winner.user.login, 'alice');
    assert.strictEqual(outcome.runnerUp.user.login, 'bob');
    assert.strictEqual(outcome.fighter1Status, 'winner');
    assert.strictEqual(outcome.fighter2Status, 'runner-up');
  });

  runTest('Correctly identifies Fighter 2 as winner when stars2 > stars1', () => {
    const outcome = determineBattleOutcome(fighterB, fighterA);
    assert.strictEqual(outcome.isTie, false);
    assert.strictEqual(outcome.winner.user.login, 'alice');
    assert.strictEqual(outcome.runnerUp.user.login, 'bob');
    assert.strictEqual(outcome.fighter1Status, 'runner-up');
    assert.strictEqual(outcome.fighter2Status, 'winner');
  });

  runTest('Correctly detects a stalemate tie when stars are equal', () => {
    const outcome = determineBattleOutcome(fighterA, fighterC);
    assert.strictEqual(outcome.isTie, true);
    assert.strictEqual(outcome.winner, null);
    assert.strictEqual(outcome.runnerUp, null);
    assert.strictEqual(outcome.fighter1Status, 'tie');
    assert.strictEqual(outcome.fighter2Status, 'tie');
  });

  // -------------------------------------------------------------
  // Test Group 3: Concurrent Fetching with Promise.all()
  // -------------------------------------------------------------
  console.log('\n--- Test Group 3: Promise.all() Orchestration & Execution ---');

  const originalFetch = global.fetch;

  await runAsyncTest('Executes battle successfully using Promise.all()', async () => {
    const mockUsers = {
      'alice': {
        login: 'alice',
        name: 'Alice Dev',
        repos_url: 'https://api.github.com/users/alice/repos',
        public_repos: 2,
        followers: 100
      },
      'bob': {
        login: 'bob',
        name: 'Bob Dev',
        repos_url: 'https://api.github.com/users/bob/repos',
        public_repos: 2,
        followers: 80
      }
    };

    const mockRepos = {
      'https://api.github.com/users/alice/repos': [
        { name: 'repo-a1', stargazers_count: 50 },
        { name: 'repo-a2', stargazers_count: 100 }
      ],
      'https://api.github.com/users/bob/repos': [
        { name: 'repo-b1', stargazers_count: 10 },
        { name: 'repo-b2', stargazers_count: 20 }
      ]
    };

    global.fetch = async (url) => {
      // Clean url to match
      if (url.includes('/users/alice/repos')) {
        return { ok: true, status: 200, json: async () => mockRepos['https://api.github.com/users/alice/repos'] };
      }
      if (url.includes('/users/bob/repos')) {
        return { ok: true, status: 200, json: async () => mockRepos['https://api.github.com/users/bob/repos'] };
      }
      if (url.includes('/users/alice')) {
        return { ok: true, status: 200, json: async () => mockUsers['alice'] };
      }
      if (url.includes('/users/bob')) {
        return { ok: true, status: 200, json: async () => mockUsers['bob'] };
      }
      return { ok: false, status: 404, statusText: 'Not Found' };
    };

    const result = await executeBattle('alice', 'bob');
    assert.strictEqual(result.fighter1.totalStars, 150);
    assert.strictEqual(result.fighter2.totalStars, 30);
    assert.strictEqual(result.outcome.winner.user.login, 'alice');
    assert.strictEqual(result.outcome.isTie, false);
  });

  await runAsyncTest('Rejects battle if either username is missing', async () => {
    await assert.rejects(
      async () => {
        await executeBattle('alice', '   ');
      },
      (err) => {
        assert(err.message.includes('Both usernames are required'));
        return true;
      }
    );
  });

  await runAsyncTest('Propagates error if one user is not found in Promise.all()', async () => {
    global.fetch = async (url) => {
      if (url.includes('/users/alice')) {
        return { ok: true, status: 200, json: async () => ({ login: 'alice', repos_url: '...' }) };
      }
      // Bob is 404
      return { ok: false, status: 404, statusText: 'Not Found' };
    };

    await assert.rejects(
      async () => {
        await executeBattle('alice', 'unknown-user');
      },
      (err) => {
        assert(err.message.includes('not found'));
        return true;
      }
    );
  });

  // Restore fetch
  global.fetch = originalFetch;

  // -------------------------------------------------------------
  // Test Summary
  // -------------------------------------------------------------
  console.log('\n===========================================');
  console.log(`Test Results: ${passedTests}/${totalTests} passed`);
  console.log('===========================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
})();

