/**
 * Automated Test Suite for Theme Switcher (Dark / Light Mode)
 */

const assert = require('assert');
const { normalizeTheme, getOppositeTheme } = require('../app.js');

console.log('🧪 Starting Dev-Detective Theme Switcher Test Suite...\n');

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

// -------------------------------------------------------------
// Test Group 1: Theme Normalization & Validation
// -------------------------------------------------------------
console.log('--- Test Group 1: Theme Normalization ---');

runTest('Validates "light" theme properly', () => {
  assert.strictEqual(normalizeTheme('light'), 'light');
});

runTest('Defaults unknown or invalid theme to "dark"', () => {
  assert.strictEqual(normalizeTheme('dark'), 'dark');
  assert.strictEqual(normalizeTheme('blue'), 'dark');
  assert.strictEqual(normalizeTheme(null), 'dark');
  assert.strictEqual(normalizeTheme(undefined), 'dark');
});

// -------------------------------------------------------------
// Test Group 2: Opposite Theme Toggling
// -------------------------------------------------------------
console.log('\n--- Test Group 2: Theme Toggle Logic ---');

runTest('Switches "dark" to "light"', () => {
  assert.strictEqual(getOppositeTheme('dark'), 'light');
});

runTest('Switches "light" to "dark"', () => {
  assert.strictEqual(getOppositeTheme('light'), 'dark');
});

console.log('\n===========================================');
console.log(`Test Results: ${passedTests}/${totalTests} passed`);
console.log('===========================================');

if (passedTests !== totalTests) {
  process.exit(1);
}

