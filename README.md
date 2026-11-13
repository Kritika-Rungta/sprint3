# DEV-DETECTIVE – PRODESK IT SPRINT 03

## 📖 Project Description
**Dev-Detective** is a high-performance GitHub profile exploration and comparison tool built with pure **HTML5, CSS3, and Vanilla JavaScript**. 

The application interfaces directly with the official GitHub REST API to search developer profiles, inspect their activity, display their most recently updated public repositories, and engage two developers in a head-to-head **Battle Mode** comparing total repository stars earned.

The project is built entirely client-side without any frontend frameworks (no React, Next.js, Vue, Angular) or HTTP libraries (no Axios, no jQuery), ensuring maximum speed, clean architecture, and 100/100 Lighthouse metrics across Performance, Accessibility, Best Practices, and SEO.

---

## 🚀 Features

### 1. Profile Explorer (Phase 1 – P0)
- **Fast Username Search**: Enter any GitHub username and submit via the search button or `Enter` key.
- **Dynamic Profile Display**:
  - Avatar image with layout-shift prevention (`aspect-ratio: 1 / 1`).
  - Full Name (falls back to login handle if full name is unlisted).
  - Clickable `@handle` linking directly to the live GitHub profile.
  - Timezone-safe Join Date in UTC format (e.g. `Joined 25 Jan 2011`).
  - Bio with fallback to *"This profile has no bio"*.
  - Live Numerical Stats: Public Repositories, Followers, and Following.
  - Contact & Metadata links (Location, Portfolio/Website, Twitter/X handle, Company) with clean visual treatment and *"Not Available"* states when missing.
- **Loading State**: Animated spinner with input locking to prevent duplicate network calls.
- **Robust Error Handling**: Differentiates 404 (User Not Found), 403 (API rate limit exceeded), and network connectivity errors.

### 2. Latest Repositories & Date Sorting (Phase 2 – P1)
- **Dynamic Ingestion**: Fetches public repositories using the user's `repos_url`.
- **Date Sorter (`sortRepositoriesByUpdated`)**: Sorts repositories descending by `updated_at` timestamps using date comparison arithmetic.
- **Top 5 Slicing**: Slices and displays the five most recently active repositories without mutating the original source array (`[...repos]`).
- **Interactive Repository Cards**:
  - Clickable repository title linking directly to GitHub (`target="_blank"` with `rel="noopener noreferrer"`).
  - Visibility pill (e.g. `public`).
  - Description with fallback (*"No description provided"*).
  - Primary language badge with color indicator.
  - Star count (`⭐`) and Fork count (`🍴`).
  - Formatted updated timestamp (e.g. `Updated 18 May 2024`).
- **Empty & Error States**: Friendly notification if a user has 0 public repositories, and isolated failure handling without hiding the profile.

### 3. Developer Battle Mode (Phase 3 – P2)
- **Arena UI**: Mode switcher tabs to toggle between **🔍 Profile Explorer** and **⚔️ Battle Mode**.
- **Dual Developer Input**: Accepts two separate GitHub usernames with input validation.
- **Concurrent API Fetching (`Promise.all`)**: Fetches both developers' profiles and both repository collections in parallel, cutting network latency in half.
- **Star Accumulator (`calculateTotalStars`)**: Uses `Array.prototype.reduce()` to tally every star across all public repositories for each developer.
- **Outcome Engine**:
  - **Winner 🏆**: Highlighted with an ambient golden glow and `WINNER` badge.
  - **Runner-Up 🥈**: Styled in subtle slate.
  - **Stalemate Tie 🤝**: Purple styling when star counts are equal.
  - **Verdict Announcement Banner**: Summarizes the winner and the victory margin in stars.

### 4. Extra Polish & Accessibility
- **Dark / Light Mode Theme Switcher**: Toggle with `localStorage` persistence and OS-level color scheme detection (`prefers-color-scheme`).
- **100/100 Lighthouse Score**:
  - **Performance**: Pre-rendered first paint, non-blocking font loading (`media="print"`), zero CLS.
  - **Accessibility**: Screen reader accessible labels (`.sr-only`), high contrast WCAG AA compliant colors.
  - **Best Practices**: Inline SVG favicon preventing 404 console errors, secure external links.
  - **SEO**: Meta descriptions, keywords, author, robots, and canonical links.

---

## 🛠️ Technologies
- **HTML5**: Semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<form>`), ARIA attributes (`role="tab"`, `aria-selected`, `aria-live`).
- **CSS3**: CSS Custom Properties (Theme tokens), CSS Grid, Flexbox, responsive media queries, smooth transitions, mobile-first design.
- **Vanilla JavaScript (ES6+)**:
  - Native `fetch()` API
  - `async` / `await` & `Promise` handling
  - `Promise.all()` for concurrent requests
  - `Array.prototype.sort()` & `Array.prototype.slice()`
  - `Array.prototype.reduce()` for star accumulation
  - DOM manipulation (`document.createElement`, `textContent`, `classList`)
  - `localStorage` for theme persistence
  - `try...catch...finally` error management
- **Node.js**: Built-in test runner (`assert`) and zero-dependency local static server (`serve.js`).

---

## 🌐 API Endpoints

The application interacts with GitHub's official REST API:

1. **User Profile Endpoint**:
   ```http
   GET https://api.github.com/users/{username}
   Accept: application/vnd.github.v3+json
   ```
   *Returns user avatar, name, bio, join date, public repos count, followers, following, and `repos_url`.*

2. **User Repositories Endpoint**:
   ```http
   GET https://api.github.com/users/{username}/repos?per_page=100
   Accept: application/vnd.github.v3+json
   ```
   *Returns an array of up to 100 repositories containing `stargazers_count`, `updated_at`, `language`, `html_url`, and `forks_count`.*

---

## 💻 Setup Instructions

### Option 1: Direct Browser Launch (Easiest)
Double-click `index.html` or open it directly in any modern browser (Chrome, Firefox, Edge, Safari).

### Option 2: Zero-Dependency Local Node Server
Run the bundled Node.js server:
```bash
npm start
# or:
node serve.js
```
Then visit **`http://localhost:3000`** in your browser.

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"** (serves on `http://127.0.0.1:5500/index.html`).

### Option 4: GitHub Pages (Live Deployment)
1. Go to repository **Settings** -> **Pages**.
2. Under **Build and deployment**, select Source: `Deploy from a branch`.
3. Set Branch: `main` and folder `/ (root)`. Click **Save**.
4. Access the live site at: **`https://kritika-rungta.github.io/sprint3/`**

---

## 🧪 Testing Instructions

### 1. Automated Test Suite (39 Tests Passing)
Run the full automated test suite using Node.js:
```bash
npm test
```

You can also run individual test suites:
```bash
npm run test:phase1   # Profile search, HTTP statuses (200, 404, 403, 500), date formatting
npm run test:phase2   # Repository fetching, updated_at sorting, top 5 slicing, immutability
npm run test:phase3   # reduce() star calculation, outcome logic, Promise.all()
npm run test:theme    # Theme normalization and toggle logic
```

#### Test Execution Evidence:
```text
🧪 Starting Dev-Detective Phase 1 Test Suite...
  ✅ PASS: Formats valid GitHub ISO date correctly in UTC
  ✅ PASS: Handles different months correctly
  ✅ PASS: Handles invalid date strings gracefully
  ✅ PASS: Handles null or undefined date gracefully
  ✅ PASS: Prepends https:// to domain missing protocol
  ✅ PASS: Preserves existing https:// protocol
  ✅ PASS: Preserves existing http:// protocol
  ✅ PASS: Handles empty string or null url
  ✅ PASS: Successfully returns user data when status is 200 OK
  ✅ PASS: Throws descriptive error when status is 404 Not Found
  ✅ PASS: Throws rate limit error when status is 403 Forbidden
  ✅ PASS: Throws general error when server returns 500 error
  ✅ PASS: Handles user with missing name, bio, and social links
Phase 1: 13/13 passed

🧪 Starting Dev-Detective Phase 2 Test Suite...
  ✅ PASS: Formats valid ISO date into "Updated DD Mon YYYY" in UTC
  ✅ PASS: Formats leap year date correctly
  ✅ PASS: Handles invalid date string gracefully
  ✅ PASS: Handles null or undefined date gracefully
  ✅ PASS: Sorts repositories descending by updated_at
  ✅ PASS: Returns exactly top 5 repositories by default
  ✅ PASS: Handles array with fewer than 5 repositories
  ✅ PASS: Handles empty array or non-array gracefully
  ✅ PASS: Does not mutate the original input array (pure function)
  ✅ PASS: Handles repositories with missing updated_at gracefully
  ✅ PASS: Successfully fetches and parses repository list
  ✅ PASS: Throws descriptive error when repo request fails
Phase 2: 12/12 passed

🧪 Starting Dev-Detective Phase 3 Test Suite...
  ✅ PASS: Sums stargazers_count accurately across multiple repositories
  ✅ PASS: Handles empty repository array by returning 0
  ✅ PASS: Handles null or undefined repository input gracefully
  ✅ PASS: Handles repositories with missing or zero stargazers_count
  ✅ PASS: Correctly identifies Fighter 1 as winner when stars1 > stars2
  ✅ PASS: Correctly identifies Fighter 2 as winner when stars2 > stars1
  ✅ PASS: Correctly detects a stalemate tie when stars are equal
  ✅ PASS: Executes battle successfully using Promise.all()
  ✅ PASS: Rejects battle if either username is missing
  ✅ PASS: Propagates error if one user is not found in Promise.all()
Phase 3: 10/10 passed

🧪 Starting Dev-Detective Theme Switcher Test Suite...
  ✅ PASS: Validates "light" theme properly
  ✅ PASS: Defaults unknown or invalid theme to "dark"
  ✅ PASS: Switches "dark" to "light"
  ✅ PASS: Switches "light" to "dark"
Theme: 4/4 passed

Total: 39/39 passed (100%)
```

### 2. Manual QA Testing Checklist
- [x] **Search**: Type `torvalds` and click "Search" or press `Enter`. The profile card updates with Linus Torvalds' details.
- [x] **404 State**: Type `non-existent-user-xyz-99999` and search. An error banner displays *"User Not Found"*.
- [x] **Repositories**: Confirm that 5 repository cards display, each with clickable titles opening GitHub in a new tab.
- [x] **Battle Mode**: Click **"⚔️ Battle Mode"**, input `torvalds` and `gaearon`, and click **"⚔️ Commence Battle!"**. Verify that both profiles load in parallel and the winner is crowned with total star calculations.
- [x] **Theme Switcher**: Click the **LIGHT / DARK** button in the header. Verify the color theme toggles and persists upon refreshing the browser.
- [x] **Responsiveness**: Resize the browser window to mobile width (< 600px). Verify that all grids adapt to a single column cleanly.
