# DEV-DETECTIVE – SPRINT 03 DEVELOPMENT LOG & PROMPTS

This document tracks all development prompts, engineering problems encountered, debugging resolutions, and core JavaScript learning notes for **ProDesk IT Sprint 03**.

---

## 📝 1. Development Prompts & Phases

### Sprint Specification
> **Dev-Detective: GitHub Profile Explorer**  
> Retrieve GitHub user profiles and public repositories through the official GitHub REST API using pure HTML5, CSS3, and Vanilla JavaScript.  
> **Strict Rules**: No React, Next.js, Vue, Angular, Express, Axios or external frameworks. Use native Fetch API, Async/Await, Promises, JSON parsing, DOM manipulation, and Try/Catch error handling.

### Phase 1 – P0: Profile Explorer
- Search GitHub usernames with submit button and `Enter` key support.
- Fetch profile data from `https://api.github.com/users/{username}` using native `fetch` and `async`/`await`.
- Display avatar, name, handle, bio, join date (formatted), and portfolio/blog.
- Handle missing data with safe fallbacks.
- Implement loading spinner state and button locking.
- Implement 404 error handling for non-existent users.

### Phase 2 – P1: Repositories List & Date Sorting
- Fetch public repositories using the `repos_url` from the user profile.
- Sort repositories descending by `updated_at` timestamps.
- Slice and display the top 5 most recently active repositories.
- Make repository names clickable links opening in a new tab with security attributes (`rel="noopener noreferrer"`).
- Format update timestamps into human-readable strings (`Updated DD Mon YYYY`).

### Phase 3 – P2: Developer Battle Mode
- Build a dual-user Battle Arena interface with tab navigation.
- Accept two GitHub usernames with input validation.
- Concurrently fetch both user profiles and repository collections using `Promise.all()`.
- Calculate total stars accumulated across all repositories using `Array.prototype.reduce()`.
- Determine and display Winner 🏆, Runner-Up 🥈, or Stalemate Tie 🤝 with dynamic verdict banners.

### Bonus Enhancements & Polish
- **Theme Switcher**: Dark / Light mode toggle with `localStorage` persistence and OS-level color scheme detection.
- **Lighthouse 100/100**: Optimization of Performance, Accessibility, Best Practices, and SEO.
- **Automated Test Suite**: 39 unit and integration tests covering all features.

---

## 🛠️ 2. Problems Encountered & Debugging Log

### Issue 1: Timezone Day-Shift in Date Formatting
- **Symptom**: A test checking GitHub ISO timestamp `'2011-01-25T18:44:36Z'` failed, returning `'Joined 26 Jan 2011'` instead of `'Joined 25 Jan 2011'`.
- **Root Cause**: `date.getDate()`, `date.getMonth()`, and `date.getFullYear()` evaluate the date in the user's **local machine timezone**. In Indian Standard Time (UTC+5:30), `18:44 UTC + 5h30m` crosses midnight into `00:14 Jan 26`.
- **Resolution**: Switched to UTC getters: `date.getUTCDate()`, `date.getUTCMonth()`, and `date.getUTCFullYear()`. This guarantees deterministic, timezone-independent output for all users across the world.

### Issue 2: Node.js Test Environment DOM Isolation
- **Symptom**: Importing `app.js` into Node.js test scripts threw `ReferenceError: document is not defined`.
- **Root Cause**: Node.js does not have a browser DOM (`window` or `document`) at the global scope. Top-level element queries executed immediately when imported.
- **Resolution**: Wrapped all browser DOM queries and event listeners inside `if (typeof document !== 'undefined') { ... }`. Pure calculation and formatting functions were cleanly exported using CommonJS (`module.exports`) for seamless automated testing.

### Issue 3: In-Place Array Mutation in `Array.prototype.sort()`
- **Symptom**: Passing the repository array to the sorting function mutated the original input array in place, violating functional programming immutability.
- **Root Cause**: `sort()` sorts the source array directly.
- **Resolution**: Used the ES6 spread operator `[...repos]` to shallow-clone the array before sorting: `[...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5)`.

### Issue 4: Lighthouse Performance Score Stalled at 87%
- **Symptom**: Despite optimizing assets, Lighthouse Performance remained at 86-87%.
- **Root Cause**: The script had an automatic `handleSearch('octocat')` call on `DOMContentLoaded`. Under Lighthouse's simulated 4x CPU slowdown and Slow 4G network throttling, waiting for GitHub's live API response delayed **Largest Contentful Paint (LCP)** to over 2.5s, while parsing the 100-repository array caused high **Total Blocking Time (TBT)**.
- **Resolution**:
  1. Pre-rendered the default `@octocat` profile and initial 5 repositories directly in HTML, achieving instant First Contentful Paint (< 0.2s).
  2. Removed unprompted network calls on startup; live API fetches now run strictly on user interaction (form submission).
  3. Optimized Google Fonts using the non-blocking `media="print" onload="this.media='all'"` pattern.
  4. Added explicit `width`, `height`, and `aspect-ratio: 1 / 1` on avatars to eliminate Cumulative Layout Shift (CLS = 0.00).

### Issue 5: Broken Tab Opens on "Not Available" Handles
- **Symptom**: Clicking on a social item that was "Not Available" opened a blank tab because the element had `<a href="#" target="_blank">`.
- **Resolution**: Removed the `href` attribute when data is unavailable (`userTwitter.removeAttribute('href')`), turning the element into plain non-interactive text in HTML5.

### Issue 6: GitHub Pages 404 Error on Live Deployment
- **Symptom**: Deploying to `https://kritika-rungta.github.io/sprint3/` returned a 404 Not Found error.
- **Root Cause**: The repository was created as **Private**. On GitHub Free accounts, GitHub Pages is not supported for private repositories. Additionally, Pages was not yet enabled in repository Settings.
- **Resolution**:
  1. Changed repository visibility from Private to **Public** in GitHub Settings -> Danger Zone.
  2. Configured GitHub Pages: Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`.

---

## 🧠 3. Key JavaScript Learning Notes

### A. The Native Fetch API & HTTP Status Handling
`fetch()` initiates an HTTP request and returns a `Promise` resolving to a `Response` object.
```javascript
const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
  headers: { Accept: 'application/vnd.github.v3+json' }
});

if (!response.ok) {
  if (response.status === 404) throw new Error('User not found.');
  if (response.status === 403) throw new Error('API rate limit exceeded.');
  throw new Error(`Request failed: ${response.status}`);
}

const data = await response.json();
```
*Note*: Unlike Axios or jQuery, `fetch()` only rejects on network failures (e.g. offline). HTTP error statuses (404, 500) still resolve the promise; we must explicitly check `response.ok`.

### B. Concurrent Execution with `Promise.all()`
When multiple asynchronous operations are independent (like comparing two developer profiles), running them sequentially with `await` doubles the total wait time.
`Promise.all()` fires all requests in parallel:
```javascript
// Concurrently fetch both profiles
const [profile1, profile2] = await Promise.all([
  fetchUserProfile(userA),
  fetchUserProfile(userB)
]);
```
- **Performance**: Takes only as long as the single slowest request (`Math.max(t1, t2)`).
- **Fail-Fast**: If any promise in the array rejects, `Promise.all()` immediately rejects with that error, simplifying error handling.

### C. Star Accumulation with `Array.prototype.reduce()`
`reduce()` iterates through an array and condenses it into a single accumulated value:
```javascript
function calculateTotalStars(repos) {
  if (!Array.isArray(repos) || repos.length === 0) return 0;

  return repos.reduce((accumulator, currentRepo) => {
    const stars = currentRepo.stargazers_count || 0;
    return accumulator + stars;
  }, 0); // 0 is the initial value
}
```
- The initial value (`0`) is mandatory for safety: calling `reduce()` on an empty array without an initial value throws a `TypeError: Reduce of empty array with no initial value`.

### D. Client-Side Sorting with `Array.prototype.sort()`
`sort()` uses a comparison callback returning a number:
- Negative: `a` comes before `b`.
- Positive: `b` comes before `a`.
- Zero: elements retain order.
```javascript
// Sort descending by date (newest first)
const sorted = [...repos].sort((a, b) => {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
});
```

### E. Theme Persistence with `localStorage`
`localStorage` provides key-value storage that persists across browser sessions:
```javascript
// Save theme preference
localStorage.setItem('dev_detective_theme', 'light');

// Retrieve theme preference
const savedTheme = localStorage.getItem('dev_detective_theme');
```
CSS Custom Properties allow instant runtime theme swapping without reloading stylesheets:
```javascript
document.documentElement.setAttribute('data-theme', 'light');
```
```css
[data-theme="light"] {
  --bg-primary: #f6f8fa;
  --text-main: #1f2328;
}
```

---

## 📊 4. Final Quality Assurance Checklist

- [x] **1. Search Button Functionality**: Form submit listener handles both button clicks and `Enter` key presses.
- [x] **2. API Ingestion**: Profile data fetched from `https://api.github.com/users/{username}`.
- [x] **3. Loading States**: Spinning loader displays; inputs disabled during pending requests.
- [x] **4. 404 Error Handling**: Clear alert banner with icon and user-friendly error copy.
- [x] **5. Fallback States**: Handled for Name, Bio, Repos, Followers, Location, Portfolio, Twitter, and Company.
- [x] **6. Repositories Ingestion**: Fetches from `userData.repos_url`.
- [x] **7. Sorting & Slicing**: Top 5 repositories sorted descending by `updated_at`.
- [x] **8. Clickable Repository Links**: External links open with `target="_blank"` and `rel="noopener noreferrer"`.
- [x] **9. Timezone-Safe Date Formatting**: Formats into `Joined DD Mon YYYY` and `Updated DD Mon YYYY` in UTC.
- [x] **10. Mode Navigation**: Seamless switching between Profile Explorer and Battle Mode.
- [x] **11. `Promise.all()` Implementation**: Concurrent fetching of profiles and repositories.
- [x] **12. `reduce()` Star Aggregation**: Accurately sums `stargazers_count` with initial value `0`.
- [x] **13. Battle Outcome States**: Accurately evaluates Winner, Runner-Up, and Tie states.
- [x] **14. Responsive Layouts**: Fully responsive for mobile (< 600px) and desktop (> 600px).
- [x] **15. Clean Console**: Zero console errors or warnings; inline favicon prevents 404s.
- [x] **16. Security**: Zero exposed API keys, tokens, or sensitive credentials.
- [x] **17. HTML/CSS/JS Integration**: Correctly linked with deferred scripts and non-blocking styles.
