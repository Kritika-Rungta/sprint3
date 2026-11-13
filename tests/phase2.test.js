/**
 * Automated Test Suite for Phase 2 (P1)
 * Tests repository fetching, date formatting, sorting by updated_at,
 * slicing to top 5, and immutability.
 */

const assert = require('assert');
const {
  formatRepoDate,
  sortRepositoriesByUpdated,
  fetchUserRepositories
} = require('../app.js');

console.log('🧪 Starting Dev-Detective Phase 2 Test Suite...\n');

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
  // Test Group 1: Repository Date Formatting (formatRepoDate)
  // -------------------------------------------------------------
  console.log('--- Test Group 1: Repository Date Formatting ---');

  runTest('Formats valid ISO date into "Updated DD Mon YYYY" in UTC', () => {
    const result = formatRepoDate('2024-05-18T10:15:30Z');
    assert.strictEqual(result, 'Updated 18 May 2024');
  });

  runTest('Formats leap year date correctly', () => {
    const result = formatRepoDate('2024-02-29T23:59:59Z');
    assert.strictEqual(result, 'Updated 29 Feb 2024');
  });

  runTest('Handles invalid date string gracefully', () => {
    const result = formatRepoDate('invalid-repo-date');
    assert.strictEqual(result, 'Date Unavailable');
  });

  runTest('Handles null or undefined date gracefully', () => {
    assert.strictEqual(formatRepoDate(null), 'Date Unavailable');
    assert.strictEqual(formatRepoDate(undefined), 'Date Unavailable');
    assert.strictEqual(formatRepoDate(''), 'Date Unavailable');
  });

  // -------------------------------------------------------------
  // Test Group 2: Repository Sorting & Slicing (sortRepositoriesByUpdated)
  // -------------------------------------------------------------
  console.log('\n--- Test Group 2: Repository Sorting by updated_at ---');

  const sampleRepos = [
    { name: 'repo-old', updated_at: '2020-01-01T00:00:00Z', stargazers_count: 5 },
    { name: 'repo-newest', updated_at: '2024-11-01T00:00:00Z', stargazers_count: 20 },
    { name: 'repo-medium', updated_at: '2022-06-15T00:00:00Z', stargazers_count: 10 },
    { name: 'repo-third', updated_at: '2023-01-10T00:00:00Z', stargazers_count: 15 },
    { name: 'repo-fourth', updated_at: '2022-12-01T00:00:00Z', stargazers_count: 8 },
    { name: 'repo-oldest', updated_at: '2018-05-20T00:00:00Z', stargazers_count: 1 },
    { name: 'repo-second', updated_at: '2024-05-10T00:00:00Z', stargazers_count: 12 }
  ];

  runTest('Sorts repositories descending by updated_at', () => {
    const sorted = sortRepositoriesByUpdated(sampleRepos, 7);
    assert.strictEqual(sorted[0].name, 'repo-newest');
    assert.strictEqual(sorted[1].name, 'repo-second');
    assert.strictEqual(sorted[2].name, 'repo-third');
    assert.strictEqual(sorted[6].name, 'repo-oldest');
  });

  runTest('Returns exactly top 5 repositories by default', () => {
    const topFive = sortRepositoriesByUpdated(sampleRepos);
    assert.strictEqual(topFive.length, 5);
    assert.strictEqual(topFive[0].name, 'repo-newest');
    assert.strictEqual(topFive[1].name, 'repo-second');
    assert.strictEqual(topFive[2].name, 'repo-third');
    assert.strictEqual(topFive[3].name, 'repo-fourth');
    assert.strictEqual(topFive[4].name, 'repo-medium');
  });

  runTest('Handles array with fewer than 5 repositories', () => {
    const twoRepos = [
      { name: 'repo-a', updated_at: '2021-01-01T00:00:00Z' },
      { name: 'repo-b', updated_at: '2023-01-01T00:00:00Z' }
    ];
    const result = sortRepositoriesByUpdated(twoRepos);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'repo-b');
    assert.strictEqual(result[1].name, 'repo-a');
  });

  runTest('Handles empty array or non-array gracefully', () => {
    assert.deepStrictEqual(sortRepositoriesByUpdated([]), []);
    assert.deepStrictEqual(sortRepositoriesByUpdated(null), []);
    assert.deepStrictEqual(sortRepositoriesByUpdated(undefined), []);
  });

  runTest('Does not mutate the original input array (pure function)', () => {
    const originalCopy = JSON.parse(JSON.stringify(sampleRepos));
    sortRepositoriesByUpdated(sampleRepos);
    assert.deepStrictEqual(sampleRepos, originalCopy);
  });

  runTest('Handles repositories with missing updated_at gracefully', () => {
    const reposWithNulls = [
      { name: 'no-date', updated_at: null },
      { name: 'has-date', updated_at: '2024-01-01T00:00:00Z' }
    ];
    const result = sortRepositoriesByUpdated(reposWithNulls);
    assert.strictEqual(result[0].name, 'has-date');
    assert.strictEqual(result[1].name, 'no-date');
  });

  // -------------------------------------------------------------
  // Test Group 3: Native Fetch for Repositories (fetchUserRepositories)
  // -------------------------------------------------------------
  console.log('\n--- Test Group 3: Fetching Repositories via Native Fetch ---');

  const originalFetch = global.fetch;

  await runAsyncTest('Successfully fetches and parses repository list', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => sampleRepos
      };
    };

    const repos = await fetchUserRepositories('https://api.github.com/users/octocat/repos');
    assert(capturedUrl.includes('per_page=100'), 'Should request up to 100 repositories');
    assert.strictEqual(repos.length, 7);
    assert.strictEqual(repos[0].name, 'repo-old');
  });

  await runAsyncTest('Throws descriptive error when repo request fails', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await assert.rejects(
      async () => {
        await fetchUserRepositories('https://api.github.com/users/fake-user/repos');
      },
      (err) => {
        assert(err.message.includes('HTTP 404'));
        return true;
      }
    );
  });

  // Restore global.fetch
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

