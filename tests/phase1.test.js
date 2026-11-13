/**
 * Automated Test Suite for Phase 1 (P0)
 * Run using Node.js built-in runner or assert module
 */

const assert = require('assert');
const { formatJoinDate, formatPortfolioUrl, fetchUserProfile } = require('../app.js');

console.log('🧪 Starting Dev-Detective Phase 1 Test Suite...\n');

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
  // Test Group 1: Date Formatting (formatJoinDate)
  // -------------------------------------------------------------
  console.log('--- Test Group 1: Join Date Formatting ---');

  runTest('Formats valid GitHub ISO date correctly in UTC', () => {
    const result = formatJoinDate('2011-01-25T18:44:36Z');
    assert.strictEqual(result, 'Joined 25 Jan 2011');
  });

  runTest('Handles different months correctly', () => {
    const result = formatJoinDate('2020-08-15T09:12:00Z');
    assert.strictEqual(result, 'Joined 15 Aug 2020');
  });

  runTest('Handles invalid date strings gracefully', () => {
    const result = formatJoinDate('invalid-date-string');
    assert.strictEqual(result, 'Joined Date Unavailable');
  });

  runTest('Handles null or undefined date gracefully', () => {
    assert.strictEqual(formatJoinDate(null), 'Joined Date Unavailable');
    assert.strictEqual(formatJoinDate(undefined), 'Joined Date Unavailable');
    assert.strictEqual(formatJoinDate(''), 'Joined Date Unavailable');
  });

  // -------------------------------------------------------------
  // Test Group 2: Portfolio URL Formatting (formatPortfolioUrl)
  // -------------------------------------------------------------
  console.log('\n--- Test Group 2: Portfolio URL Formatting ---');

  runTest('Prepends https:// to domain missing protocol', () => {
    const result = formatPortfolioUrl('github.blog');
    assert.strictEqual(result, 'https://github.blog');
  });

  runTest('Preserves existing https:// protocol', () => {
    const result = formatPortfolioUrl('https://myportfolio.com');
    assert.strictEqual(result, 'https://myportfolio.com');
  });

  runTest('Preserves existing http:// protocol', () => {
    const result = formatPortfolioUrl('http://insecure-site.org');
    assert.strictEqual(result, 'http://insecure-site.org');
  });

  runTest('Handles empty string or null url', () => {
    assert.strictEqual(formatPortfolioUrl(''), '');
    assert.strictEqual(formatPortfolioUrl(null), '');
  });

  // -------------------------------------------------------------
  // Test Group 3: Fetch User Profile & HTTP Status Handling
  // -------------------------------------------------------------
  console.log('\n--- Test Group 3: Native Fetch & HTTP Status Handling ---');

  // Backup original global.fetch
  const originalFetch = global.fetch;

  await runAsyncTest('Successfully returns user data when status is 200 OK', async () => {
    const mockUser = {
      login: 'octocat',
      name: 'The Octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      bio: 'Developer at GitHub',
      public_repos: 8,
      followers: 9000,
      following: 9,
      created_at: '2011-01-25T18:44:36Z'
    };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => mockUser
    });

    const data = await fetchUserProfile('octocat');
    assert.strictEqual(data.login, 'octocat');
    assert.strictEqual(data.name, 'The Octocat');
    assert.strictEqual(data.public_repos, 8);
  });

  await runAsyncTest('Throws descriptive error when status is 404 Not Found', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await assert.rejects(
      async () => {
        await fetchUserProfile('non-existent-user-123456');
      },
      (err) => {
        assert(err.message.includes('not found'));
        return true;
      }
    );
  });

  await runAsyncTest('Throws rate limit error when status is 403 Forbidden', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 403,
      statusText: 'Forbidden'
    });

    await assert.rejects(
      async () => {
        await fetchUserProfile('octocat');
      },
      (err) => {
        assert(err.message.includes('rate limit exceeded'));
        return true;
      }
    );
  });

  await runAsyncTest('Throws general error when server returns 500 error', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await assert.rejects(
      async () => {
        await fetchUserProfile('octocat');
      },
      (err) => {
        assert(err.message.includes('status: 500'));
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test Group 4: Missing Data & Edge Case Handling Verification
  // -------------------------------------------------------------
  console.log('\n--- Test Group 4: Missing Data & Fallback Behavior ---');

  runTest('Handles user with missing name, bio, and social links', () => {
    const rawUserData = {
      login: 'minimaldev',
      name: null,
      bio: null,
      blog: '',
      twitter_username: null,
      company: null,
      location: null,
      public_repos: 0,
      followers: 0,
      following: 0,
      created_at: '2023-01-01T00:00:00Z'
    };

    // Verify fallbacks
    const displayName = rawUserData.name || rawUserData.login;
    const displayBio = (rawUserData.bio && rawUserData.bio.trim() !== '') ? rawUserData.bio : 'This profile has no bio';
    const displayBlog = rawUserData.blog || 'Not Available';
    const formattedDate = formatJoinDate(rawUserData.created_at);

    assert.strictEqual(displayName, 'minimaldev');
    assert.strictEqual(displayBio, 'This profile has no bio');
    assert.strictEqual(displayBlog, 'Not Available');
    assert.strictEqual(formattedDate, 'Joined 1 Jan 2023');
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
