# DEV-DETECTIVE – PRODESK IT SPRINT 03

## Project Overview
Build a GitHub Profile Explorer using HTML, CSS and Vanilla JavaScript.

The application will retrieve GitHub user profiles and public repositories through the official GitHub REST API.

## Strict Technical Requirements
- HTML5
- CSS3
- Vanilla JavaScript
- Native Fetch API
- Async/Await
- Promises
- JSON parsing
- DOM manipulation
- Try/Catch error handling

Do not use React, Next.js, Vue, Angular, Express, Axios or any unnecessary framework.

## Development Rules
1. Build one feature at a time.
2. Explain every important JavaScript concept.
3. Keep code beginner-friendly and readable.
4. Do not hardcode API response data.
5. Do not overwrite existing working code without explaining why.
6. Test every feature before moving to the next phase.
7. Handle missing data and API errors.
8. Maintain responsive desktop and mobile layouts.
9. Update this file with prompts, implementation notes, debugging issues and learning outcomes.

## Development Phases

### Phase 1 – P0 (Completed & Tested)
- Search GitHub usernames.
- Fetch profile information.
- Display avatar, name, bio, join date and portfolio.
- Implement loading state.
- Implement 404 error handling.

### Phase 2 – P1 (Completed & Tested)
- Fetch repositories using repos_url.
- Sort repositories by updated_at.
- Display five latest updated repositories.
- Make repository names clickable.
- Format dates into readable strings.

### Phase 3 – P2 (Completed & Tested)
- Implement Battle Mode.
- Accept two GitHub usernames.
- Use Promise.all().
- Fetch both repository lists.
- Calculate total stars using reduce().
- Display winner, runner-up or tie.

## API Endpoints
Profile:
https://api.github.com/users/{username}

Repositories:
https://api.github.com/users/{username}/repos

---

## Quick Start & Running Locally

### Option 1: Direct in Browser
Open `index.html` directly in your favorite modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Zero Dependencies)
Run the built-in Node.js server:
```bash
npm start
# or
node serve.js
```
Then open `http://localhost:3000` in your browser.

### Running Automated Test Suite
```bash
npm test
```

---

## Phase 1 Implementation Notes

### 1. What We Built
- **Interactive Search Bar**: Users can input any GitHub username and submit via button click or `Enter` key.
- **Async API Fetcher**: Queries `https://api.github.com/users/{username}` using the browser's native `fetch` API.
- **Dynamic Profile Card**: Displays:
  - Avatar image with accessible `alt` text.
  - Full Name (falls back to login handle if full name is not set).
  - Clickable `@handle` linking directly to GitHub profile.
  - Join date converted from ISO 8601 into human-readable format (`Joined 25 Jan 2011`).
  - Bio with fallback to *"This profile has no bio"*.
  - Repos, Followers, and Following stat indicators.
  - Contact/Social links (Location, Portfolio/Blog, Twitter/X handle, Company) with clean visual treatment and *"Not Available"* states when missing.
- **Loading State**: Displays a spinning loader, hides previous cards, and disables input/button to prevent race conditions or duplicate network calls.
- **Error Handling**: Gracefully handles and distinguishes:
  - 404 (User Not Found)
  - 403 (GitHub API unauthenticated rate limits of 60 req/hr)
  - 500 / Network connectivity failures
  - Blank input validation

### 2. JavaScript Concepts Explained

#### A. The Native Fetch API
The `fetch()` function is a native web API built into modern browsers and Node.js. It initiates an HTTP request across the network and returns a **Promise** that resolves to the `Response` object representing the response to that request.
```javascript
const response = await fetch('https://api.github.com/users/octocat', {
  headers: { Accept: 'application/vnd.github.v3+json' }
});
```

#### B. Promises & Asynchronous Execution
A `Promise` in JavaScript represents an operation that has not completed yet, but is expected in the future. It exists in one of three states:
1. `pending`: Initial state, neither fulfilled nor rejected.
2. `fulfilled`: Operation completed successfully (`resolve`).
3. `rejected`: Operation failed (`reject`).

#### C. Async / Await
`async` and `await` are syntactic sugar built on top of Promises:
- Placing `async` before a function declaration ensures the function returns a Promise.
- Inside an `async` function, `await` pauses execution until the Promise resolves or rejects, allowing asynchronous code to be written sequentially and read cleanly like synchronous code.

#### D. JSON Parsing (`response.json()`)
When the server sends back data, it arrives as a stream of raw bytes. The `.json()` method on the `Response` object reads the response stream to completion and parses the JSON text into a native JavaScript object.

#### E. Try / Catch / Finally Error Handling
```javascript
try {
  const user = await fetchUserProfile(username);
  renderUserProfile(user);
} catch (error) {
  showError('Investigation Failed', error.message);
} finally {
  hideLoading();
}
```

#### F. DOM Manipulation
The Document Object Model (DOM) is an object-oriented representation of the web page. We manipulate elements dynamically using:
- `document.getElementById()` to select elements.
- `element.textContent` to safely insert text without introducing XSS vulnerabilities.
- `element.classList.add()` and `element.classList.remove()` to show/hide CSS classes.
- `element.setAttribute()` / properties like `src` and `href` to configure attributes.

#### G. Timezone Consistency with UTC Date Methods
When parsing UTC timestamps from an API (e.g. `2011-01-25T18:44:36Z`):
- `date.getDate()` returns the day based on the user's **local machine timezone** (which can shift the day forward or backward depending on UTC offset).
- `date.getUTCDate()`, `date.getUTCMonth()`, and `date.getUTCFullYear()` ensure deterministic, timezone-independent output across all clients worldwide.

---

## Phase 2 Implementation Notes

### 1. What We Built
- **Dynamic Repositories Fetcher**: Uses the `repos_url` property from the user's profile to fetch public repositories.
- **Client-Side Sorter (`sortRepositoriesByUpdated`)**: Sorts repositories descending by `updated_at` timestamps using date comparison arithmetic (`new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()`).
- **Top 5 Slicing**: Slices the top 5 most recently active repositories without mutating the original source array.
- **Interactive Repository Cards**: Displays:
  - Clickable repository title linking to the repository's GitHub page (`target="_blank"` with security attributes `rel="noopener noreferrer"`).
  - Visibility pill (e.g. `public`).
  - Repository description (with fallback *"No description provided"*).
  - Primary programming language badge with indicator dot.
  - Star count (`⭐`).
  - Fork count (`🍴`).
  - Formatted updated timestamp (e.g. `Updated 18 May 2024`).
- **Empty State**: Displays a friendly message if the user has 0 public repositories.
- **Isolated Failure Handling**: If repository fetching encounters an error (e.g. secondary rate limit), the user profile remains visible while the repository container presents a contextual error message.

### 2. JavaScript Concepts Explained

#### A. Array Sorting with `Array.prototype.sort()`
JavaScript's `sort()` method sorts the elements of an array in place by comparing elements using a comparator function `(a, b) => number`:
- If `compareFn(a, b) < 0`, `a` comes before `b`.
- If `compareFn(a, b) > 0`, `b` comes before `a`.
- If `compareFn(a, b) === 0`, original order is retained.

For descending dates:
```javascript
repos.sort((a, b) => {
  const timeA = new Date(a.updated_at).getTime();
  const timeB = new Date(b.updated_at).getTime();
  return timeB - timeA; // Larger time (more recent) appears first
});
```

#### B. Avoiding Array Mutation with Spread Syntax (`[...]`)
`sort()` mutates the original array in place. To adhere to functional programming and avoid unexpected side-effects, we first clone the array using the ES6 spread operator:
```javascript
const sortedRepos = [...repos].sort((a, b) => ...);
```

#### C. Array Slicing with `Array.prototype.slice(start, end)`
`slice(0, 5)` returns a shallow copy of a portion of an array from index 0 up to (but not including) index 5. If the array contains fewer than 5 items, it gracefully returns all available items without error.

---

## Phase 3 Implementation Notes

### 1. What We Built
- **Battle Mode Arena**: A dedicated tab-based interface allowing users to switch seamlessly between single "Profile Explorer" and head-to-head "Battle Mode".
- **Dual Developer Input**: Accepts two separate GitHub usernames with complete validation (preventing empty submissions).
- **Parallel Network Requests via `Promise.all()`**:
  - Concurrently fetches both user profiles: `Promise.all([fetchUserProfile(u1), fetchUserProfile(u2)])`.
  - Concurrently fetches both users' repository collections: `Promise.all([fetchUserRepositories(repos1), fetchUserRepositories(repos2)])`.
  - Cuts network wait time in half compared to sequential fetching!
- **Star Accumulation via `Array.prototype.reduce()`**:
  - Iterates through each user's repository array and computes the grand total of stargazers earned across all public repositories.
  - Bulletproof against repos with missing or null star counts.
- **Outcome Determination & Visual Badging**:
  - Declares the **Winner 🏆** (highlighted in gold with glow effect).
  - Declares the **Runner-Up 🥈** (styled in subtle slate).
  - Handles **Stalemate Ties 🤝** when star counts match.
  - Summarizes the star difference in a dynamic verdict announcement banner.

### 2. JavaScript Concepts Explained

#### A. Concurrent Execution with `Promise.all()`
When fetching independent resources (such as two distinct developer profiles), running requests sequentially (`await user1; await user2;`) forces request 2 to wait until request 1 finishes.
`Promise.all()` accepts an array of promises and executes them concurrently:
```javascript
const [profile1, profile2] = await Promise.all([
  fetchUserProfile(username1),
  fetchUserProfile(username2)
]);
```
- **Performance**: Takes only as long as the slowest individual request rather than their combined sum.
- **Fail-Fast Semantics**: If any promise in the array rejects (e.g. Developer 1 does not exist / 404), `Promise.all()` immediately rejects with that error, allowing centralized error handling in `try...catch`.

#### B. Array Reduction with `Array.prototype.reduce()`
`reduce()` executes a reducer function on each element of the array, resulting in a single output value:
```javascript
function calculateTotalStars(repos) {
  return repos.reduce((accumulator, currentRepo) => {
    const stars = currentRepo.stargazers_count || 0;
    return accumulator + stars;
  }, 0); // 0 is the initial accumulator value
}
```
1. `accumulator`: The accumulated value previously returned in the last invocation of the callback (starts at the second argument, `0`).
2. `currentRepo`: The current repository element being processed.
3. Why provide `0` as initial value? If the array is empty (`[]`), `reduce()` without an initial value throws a `TypeError: Reduce of empty array with no initial value`. Providing `0` guarantees safe behavior for developers with 0 public repositories.

---

## Complete Test Suite Verification

Run all test suites with:
```bash
npm test
```

### Execution Log (35/35 Tests Passing):
```text
🧪 Starting Dev-Detective Phase 1 Test Suite...

--- Test Group 1: Join Date Formatting ---
  ✅ PASS: Formats valid GitHub ISO date correctly in UTC
  ✅ PASS: Handles different months correctly
  ✅ PASS: Handles invalid date strings gracefully
  ✅ PASS: Handles null or undefined date gracefully

--- Test Group 2: Portfolio URL Formatting ---
  ✅ PASS: Prepends https:// to domain missing protocol
  ✅ PASS: Preserves existing https:// protocol
  ✅ PASS: Preserves existing http:// protocol
  ✅ PASS: Handles empty string or null url

--- Test Group 3: Native Fetch & HTTP Status Handling ---
  ✅ PASS: Successfully returns user data when status is 200 OK
  ✅ PASS: Throws descriptive error when status is 404 Not Found
  ✅ PASS: Throws rate limit error when status is 403 Forbidden
  ✅ PASS: Throws general error when server returns 500 error

--- Test Group 4: Missing Data & Fallback Behavior ---
  ✅ PASS: Handles user with missing name, bio, and social links

===========================================
Test Results: 13/13 passed
===========================================

🧪 Starting Dev-Detective Phase 2 Test Suite...

--- Test Group 1: Repository Date Formatting ---
  ✅ PASS: Formats valid ISO date into "Updated DD Mon YYYY" in UTC
  ✅ PASS: Formats leap year date correctly
  ✅ PASS: Handles invalid date string gracefully
  ✅ PASS: Handles null or undefined date gracefully

--- Test Group 2: Repository Sorting by updated_at ---
  ✅ PASS: Sorts repositories descending by updated_at
  ✅ PASS: Returns exactly top 5 repositories by default
  ✅ PASS: Handles array with fewer than 5 repositories
  ✅ PASS: Handles empty array or non-array gracefully
  ✅ PASS: Does not mutate the original input array (pure function)
  ✅ PASS: Handles repositories with missing updated_at gracefully

--- Test Group 3: Fetching Repositories via Native Fetch ---
  ✅ PASS: Successfully fetches and parses repository list
  ✅ PASS: Throws descriptive error when repo request fails

===========================================
Test Results: 12/12 passed
===========================================

🧪 Starting Dev-Detective Phase 3 Test Suite...

--- Test Group 1: Array.prototype.reduce() Star Summation ---
  ✅ PASS: Sums stargazers_count accurately across multiple repositories
  ✅ PASS: Handles empty repository array by returning 0
  ✅ PASS: Handles null or undefined repository input gracefully
  ✅ PASS: Handles repositories with missing or zero stargazers_count

--- Test Group 2: Battle Outcome Logic ---
  ✅ PASS: Correctly identifies Fighter 1 as winner when stars1 > stars2
  ✅ PASS: Correctly identifies Fighter 2 as winner when stars2 > stars1
  ✅ PASS: Correctly detects a stalemate tie when stars are equal

--- Test Group 3: Promise.all() Orchestration & Execution ---
  ✅ PASS: Executes battle successfully using Promise.all()
  ✅ PASS: Rejects battle if either username is missing
  ✅ PASS: Propagates error if one user is not found in Promise.all()

===========================================
Test Results: 10/10 passed
===========================================
```
