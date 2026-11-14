# Dev-Detective (Sprint 03) - Dev Notes & Prompts Log

**Project:** Dev-Detective – GitHub Profile Explorer & Battle Mode  
**Author:** Kritika Rungta  
**Tech:** HTML5, CSS3, Vanilla JavaScript (ES6+)  
**Assignment:** ProDesk IT Sprint 03  

> *Note to self / reviewer: These are my raw notes, prompts, bugs encountered, and learnings jotted down while building this project.*

---

## 📌 1. Prompts I Used & Development Stages

### Step 1: Planning & Project Setup
**My initial prompt:**
> *"Create a clean semantic HTML5 layout for Dev Detective: a GitHub profile viewer with dark/light theme, search bar, profile card container, and a toggle for a 2-player Battle Mode. No React or external libraries, pure HTML and CSS only."*

**My notes while building:**
- Built the top header with the app title and theme toggle (sun/moon icon).
- Created two tab buttons: "Profile Explorer" and "Developer Battle".
- Added search input + submit button with a magnifying glass.
- Made sure everything is semantic (`<main>`, `<header>`, `<section>`, `<article>`, `<nav>`).

---

### Step 2: Phase 1 (P0) - Profile Search & Fetch API
**The prompt I used:**
> *"Write vanilla JavaScript to fetch GitHub user data using native fetch and async/await from https://api.github.com/users/{username}. Show avatar, name, username, join date, bio, stats (repos, followers, following), location, blog, twitter, company. Add a loading spinner, handle 404 not found errors, and provide fallbacks if bio or social links are missing."*

**Problems I hit & how I fixed them:**
1. **The 404 error gotcha with `fetch()`:**
   - At first I thought `fetch()` would jump straight to `catch` when a user didn't exist. But it didn't! Turns out `fetch()` resolves normally even on 404.
   - *Fix:* Added `if (!response.ok)` check. If `response.status === 404`, throw custom `'User not found'` error so the catch block handles it cleanly.
2. **Missing data looking ugly:**
   - Octocat has no bio (`bio: null`), and many users don't have Twitter or Company set.
   - *Fix:* Added fallbacks everywhere:
     - Bio: `"This profile has no bio"`
     - Missing link: `"Not Available"` (and removed the `href` attribute so it doesn't open a broken tab when clicked).
3. **Date timezone headache:**
   - When formatting `'2011-01-25T18:44:36Z'`, my local browser was displaying `26 Jan 2011` instead of `25 Jan 2011`!
   - Realized it was because of Indian Standard Time (UTC+5:30) crossing midnight.
   - *Fix:* Used UTC date methods (`date.getUTCDate()`, `date.getUTCMonth()`, `date.getUTCFullYear()`) so it's consistent everywhere in the world.

---

### Step 3: Phase 2 (P1) - Fetching & Sorting Repositories
**The prompt I used:**
> *"Fetch the user's public repositories using the repos_url from the user object. Sort them descending by updated_at date, grab the top 5 most recently active repos, and display them as clickable cards with language, stars, forks, and formatted update date."*

**Problems I hit & how I fixed them:**
1. **Don't hardcode the repo URL:**
   - At first I was thinking of doing `api.github.com/users/${username}/repos`, but the assignment specifically said to use `userData.repos_url` from the first API response. So I chained it properly.
2. **`Array.sort()` mutates the original array:**
   - In JavaScript, `.sort()` changes the original array in place.
   - *Fix:* Used spread operator `[...repos].sort(...)` so the original data stays untouched.
3. **External link security:**
   - For repo links, always remember to add `target="_blank"` and `rel="noopener noreferrer"` so the new tab can't access `window.opener`.

---

### Step 4: Phase 3 (P2) - Battle Mode (Fighter 1 vs Fighter 2)
**The prompt I used:**
> *"Implement Battle Mode where user enters two GitHub usernames. Use Promise.all() to fetch both profiles and their repository lists concurrently. Calculate total stars for each developer using Array.prototype.reduce(). Compare the star counts and display winner (green border/badge), loser (red border/badge), or tie (purple) with an arena summary."*

**Problems I hit & how I fixed them:**
1. **Why `Promise.all()` matters:**
   - If I fetched user1, waited, then user2, then repos1, then repos2, it would feel super sluggish. With `Promise.all([fetchUserProfile(u1), fetchUserProfile(u2)])`, both network calls happen at the same time.
2. **`reduce()` syntax gotcha:**
   - When calculating total stars:
     ```javascript
     const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
     ```
   - If I forgot the `, 0` at the end and the user had 0 repos (empty array), JavaScript threw a runtime error! Always set the initial value to 0.
3. **Winner / Runner-up / Tie styling:**
   - Made specific CSS classes:
     - `.is-winner` / `.badge-winner` -> Green (`#2ea043`)
     - `.is-loser` / `.badge-loser` -> Red (`#f85149`)
     - `.is-tie` / `.badge-tie` -> Purple (`#a855f7`)

---

### Step 5: Bonus - Theme Switcher & Persistence
**The prompt I used:**
> *"Add a theme switcher toggle for dark mode and light mode. Save the user preference in localStorage so it remembers after page reload, and respect system prefers-color-scheme by default."*

**How it works:**
- Stored in `localStorage.setItem('dev_detective_theme', 'light' | 'dark')`.
- Toggled on `document.documentElement.setAttribute('data-theme', theme)`.
- CSS custom properties (`var(--bg-primary)`, `var(--text-main)`) dynamically update colors across the whole page with zero reload.

---

## 🐛 Messy Bug Log & Real Struggles

A quick brain-dump of things that broke during development and how I debugged them:

- **Bug 1: "document is not defined" in terminal tests**
  - *What happened:* When writing tests in Node.js, running `node tests/phase1.test.js` crashed immediately.
  - *Why:* Node.js doesn't have a `window` or `document` object like a browser does.
  - *Fix:* Wrapped all DOM selectors and event listeners inside `if (typeof document !== 'undefined') { ... }` and exported helper functions at the bottom with `module.exports`.

- **Bug 2: GitHub Pages 404 Error after pushing**
  - *What happened:* Pushed the code, clicked my GitHub Pages link `https://kritika-rungta.github.io/sprint3/`, got an ugly 404 error!
  - *Why:* My repo was set to "Private". Free GitHub accounts don't allow Pages on private repos. Plus Pages wasn't turned on in repo settings.
  - *Fix:* Changed repo to "Public" in Settings -> Danger Zone, selected `Deploy from a branch` -> `main` -> `/ (root)`, waited 1 minute and refreshed. Boom, 200 OK!

- **Bug 3: Rule 4 Compliance (No hardcoded API data)**
  - *What happened:* Earlier to get a 100 on Lighthouse, octocat data was hardcoded in HTML.
  - *Why:* While fast, that violated Sprint Rule 4 ("Do not hardcode API response data").
  - *Fix:* Stripped out all hardcoded octocat text/cards from `index.html`, replaced with clean skeleton placeholders with `class="hidden"`, and added `handleSearch('octocat')` in `DOMContentLoaded` so 100% of data is fetched live from GitHub API on load.

- **Bug 4: Empty string search crashed or looked weird**
  - *What happened:* If you clicked search with an empty box, it called the API with empty string.
  - *Fix:* Added input validation: `if (!username.trim()) { showError('Input Required', 'Please enter a username'); return; }`.

---

## 💡 What I Actually Learned (My JS Cheat-Sheet)

1. **`fetch()` only rejects on network failures:**
   - HTTP 404 or 500 does NOT trigger `.catch()`!
   - You MUST check `if (!response.ok)` and check `response.status`.

2. **`Promise.all` is like running things in parallel:**
   - Super useful when two requests don't depend on each other (like Player 1 vs Player 2).
   - If either one fails, the whole promise rejects immediately (fail-fast).

3. **`Array.prototype.reduce` is awesome for accumulators:**
   - `repos.reduce((acc, curr) => acc + curr.stargazers_count, 0)`
   - Always remember the second argument `0` as the starting accumulator.

4. **Timezones will bite you if you use `getDate()`:**
   - Always use `getUTCDate()`, `getUTCMonth()`, `getUTCFullYear()` when dealing with UTC ISO timestamps from APIs like GitHub (`2024-01-25T18:00:00Z`).

5. **`localStorage` only stores strings:**
   - `localStorage.setItem('key', 'value')`
   - Great for theme preferences and saving small UI states.

---

## ✅ Self-Check QA Checklist Before Submission

- [x] Search works on button click & pressing `Enter`
- [x] Live GitHub profile fetched via native `fetch()` and `async/await`
- [x] Loading spinner shows while fetching, disappears when done
- [x] 404 error handled gracefully with user-friendly alert banner
- [x] Fallbacks exist for missing bio, blog, twitter, company, location
- [x] Top 5 latest repos displayed using `repos_url`, sorted by `updated_at`
- [x] Repo links open in new tab (`target="_blank"` with `rel="noopener noreferrer"`)
- [x] Dates formatted nicely (e.g. `Joined 25 Jan 2011`)
- [x] Battle Mode switches views without reloading
- [x] Two users fetched concurrently using `Promise.all()`
- [x] Total stars calculated using `.reduce()`
- [x] Winner gets Green badge (`🏆 WINNER`), Loser gets Red (`❌ LOSER`), Tie handled
- [x] Mobile responsive layout looks great (< 600px)
- [x] Dark/Light theme toggles and remembers setting
- [x] Zero API keys or tokens in code
- [x] All 39 unit tests pass in `npm test`
- [x] Live on GitHub Pages and repository is Public
