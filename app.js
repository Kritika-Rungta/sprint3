/**
 * DEV-DETECTIVE - GITHUB PROFILE EXPLORER & BATTLE MODE
 * Sprint 03: HTML5, CSS3 & Vanilla JavaScript
 * Phase 1: Search & Profile Exploration
 * Phase 2: Repositories List & Sorting by Updated Date
 * Phase 3: Battle Mode with Promise.all() & Array.reduce()
 */

// =============================================================================
// 1. Pure Helper Functions (Date, URL, Array Sorting & Reduce Calculations)
// =============================================================================

/**
 * Formats an ISO 8601 date string (e.g., "2011-01-25T18:44:36Z")
 * into a human-friendly format: "Joined 25 Jan 2011".
 *
 * @param {string} isoString - Date string returned by GitHub API
 * @returns {string} Formatted join date
 */
function formatJoinDate(isoString) {
  if (!isoString) return 'Joined Date Unavailable';

  const date = new Date(isoString);

  // Validate if date parsed correctly
  if (isNaN(date.getTime())) {
    return 'Joined Date Unavailable';
  }

  // Use UTC methods to guarantee timezone-independent consistency
  const day = date.getUTCDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `Joined ${day} ${month} ${year}`;
}

/**
 * Formats a repository update timestamp into a human-friendly string:
 * e.g., "Updated 18 May 2024".
 *
 * @param {string} isoString - Date string returned by GitHub repository object
 * @returns {string} Formatted repository updated date
 */
function formatRepoDate(isoString) {
  if (!isoString) return 'Date Unavailable';

  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return 'Date Unavailable';
  }

  const day = date.getUTCDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `Updated ${day} ${month} ${year}`;
}

/**
 * Normalizes a portfolio/website URL to ensure it has a valid protocol
 * so clicking it navigates outward instead of to a relative path.
 *
 * @param {string} url - Raw URL string from user profile
 * @returns {string} Clean URL starting with http:// or https://
 */
function formatPortfolioUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Phase 2: Sorts an array of repository objects descending by their `updated_at` property
 * and returns the top N items (default 5).
 * Non-mutating: creates a shallow copy before sorting.
 *
 * @param {Array<Object>} repos - Array of GitHub repository objects
 * @param {number} [limit=5] - Maximum number of repositories to return
 * @returns {Array<Object>} Sliced array of most recently updated repositories
 */
function sortRepositoriesByUpdated(repos, limit = 5) {
  if (!Array.isArray(repos) || repos.length === 0) {
    return [];
  }

  // Create a copy of the array using spread syntax to prevent in-place mutation
  return [...repos]
    .sort((a, b) => {
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return timeB - timeA; // Descending order: latest date first
    })
    .slice(0, limit);
}

/**
 * Phase 3: Calculates the total number of stargazers (stars) across an array
 * of repository objects using Array.prototype.reduce().
 *
 * Concepts:
 * - Accumulator: Maintains running sum, starting at initial value 0
 * - CurrentValue: Current repository object in iteration
 *
 * @param {Array<Object>} repos - Array of repository objects
 * @returns {number} Total stars accumulated
 */
function calculateTotalStars(repos) {
  if (!Array.isArray(repos) || repos.length === 0) {
    return 0;
  }

  return repos.reduce((accumulator, currentRepo) => {
    const stars = (currentRepo && typeof currentRepo.stargazers_count === 'number')
      ? currentRepo.stargazers_count
      : 0;
    return accumulator + stars;
  }, 0);
}

/**
 * Phase 3: Compares two fighters based on their total stars and determines
 * the winner, runner-up, or a tie.
 *
 * @param {Object} fighter1 - Object containing { user, repos, totalStars }
 * @param {Object} fighter2 - Object containing { user, repos, totalStars }
 * @returns {Object} Outcome object: { winner, runnerUp, isTie }
 */
function determineBattleOutcome(fighter1, fighter2) {
  const stars1 = fighter1.totalStars;
  const stars2 = fighter2.totalStars;

  if (stars1 > stars2) {
    return {
      winner: fighter1,
      runnerUp: fighter2,
      isTie: false,
      fighter1Status: 'winner',
      fighter2Status: 'runner-up'
    };
  }

  if (stars2 > stars1) {
    return {
      winner: fighter2,
      runnerUp: fighter1,
      isTie: false,
      fighter1Status: 'runner-up',
      fighter2Status: 'winner'
    };
  }

  // Equal stars -> Tie
  return {
    winner: null,
    runnerUp: null,
    isTie: true,
    fighter1Status: 'tie',
    fighter2Status: 'tie'
  };
}

// =============================================================================
// 2. GitHub API Fetch Logic (Native Fetch, Async/Await, Try/Catch, Promise.all)
// =============================================================================

/**
 * Fetches user profile data from GitHub REST API.
 * Uses native fetch with async/await and robust status code checking.
 *
 * @param {string} username - GitHub username to look up
 * @returns {Promise<Object>} Resolved profile data object
 * @throws {Error} Detailed error for 404, 403, or network issues
 */
async function fetchUserProfile(username) {
  const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}`;

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/vnd.github.v3+json'
    }
  });

  // Handle specific HTTP Status Codes
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User "${username}" was not found. Please verify the spelling and try again.`);
    }

    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded (60 requests/hour for unauthenticated users). Please wait a few minutes before trying again.');
    }

    throw new Error(`GitHub API request failed with status: ${response.status} (${response.statusText})`);
  }

  // Parse JSON response body
  const userData = await response.json();
  return userData;
}

/**
 * Fetches user repositories from GitHub REST API using the user's `repos_url`.
 * Requests up to 100 repositories to ensure client-side sorting catches the true latest.
 *
 * @param {string} reposUrl - Endpoint URL from user profile
 * @returns {Promise<Array<Object>>} Resolved array of repository objects
 * @throws {Error} If network request fails
 */
async function fetchUserRepositories(reposUrl) {
  const separator = reposUrl.includes('?') ? '&' : '?';
  const targetUrl = `${reposUrl}${separator}per_page=100`;

  const response = await fetch(targetUrl, {
    headers: {
      Accept: 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load repositories (HTTP ${response.status}: ${response.statusText})`);
  }

  const repos = await response.json();
  return Array.isArray(repos) ? repos : [];
}

/**
 * Phase 3: Concurrently fetches two developers' profiles and repositories using Promise.all().
 * Calculates their total star counts and returns full battle data.
 *
 * @param {string} username1 - First developer username
 * @param {string} username2 - Second developer username
 * @returns {Promise<Object>} Battle data containing both fighters and the outcome
 */
async function executeBattle(username1, username2) {
  const userA = username1.trim();
  const userB = username2.trim();

  if (!userA || !userB) {
    throw new Error('Both usernames are required to commence battle.');
  }

  // Step 1: Concurrently fetch both user profiles using Promise.all()
  const [profile1, profile2] = await Promise.all([
    fetchUserProfile(userA),
    fetchUserProfile(userB)
  ]);

  // Step 2: Concurrently fetch both repository lists using Promise.all()
  const [repos1, repos2] = await Promise.all([
    fetchUserRepositories(profile1.repos_url),
    fetchUserRepositories(profile2.repos_url)
  ]);

  // Step 3: Calculate total stars using Array.prototype.reduce()
  const totalStars1 = calculateTotalStars(repos1);
  const totalStars2 = calculateTotalStars(repos2);

  // Step 4: Assemble fighter profiles
  const fighter1 = {
    user: profile1,
    repos: repos1,
    totalStars: totalStars1
  };

  const fighter2 = {
    user: profile2,
    repos: repos2,
    totalStars: totalStars2
  };

  // Step 5: Determine Winner, Runner-Up or Tie
  const outcome = determineBattleOutcome(fighter1, fighter2);

  return {
    fighter1,
    fighter2,
    outcome
  };
}

// =============================================================================
// 3. Browser DOM Manipulation & UI Controllers
// =============================================================================

// Only execute DOM code when running in a browser environment
if (typeof document !== 'undefined') {
  // Navigation Tabs
  const tabExplorer = document.getElementById('tab-explorer');
  const tabBattle = document.getElementById('tab-battle');
  const explorerView = document.getElementById('explorer-view');
  const battleView = document.getElementById('battle-view');

  // Tab Switching Handler
  tabExplorer.addEventListener('click', () => {
    tabExplorer.classList.add('active');
    tabExplorer.setAttribute('aria-selected', 'true');
    tabBattle.classList.remove('active');
    tabBattle.setAttribute('aria-selected', 'false');

    explorerView.classList.remove('hidden');
    battleView.classList.add('hidden');
  });

  tabBattle.addEventListener('click', () => {
    tabBattle.classList.add('active');
    tabBattle.setAttribute('aria-selected', 'true');
    tabExplorer.classList.remove('active');
    tabExplorer.setAttribute('aria-selected', 'false');

    battleView.classList.remove('hidden');
    explorerView.classList.add('hidden');
  });

  // -------------------------------------------------------------
  // View 1 (Explorer Mode) Elements
  // -------------------------------------------------------------
  const searchForm = document.getElementById('search-form');
  const usernameInput = document.getElementById('username-input');
  const searchBtn = document.getElementById('search-btn');

  const loadingSpinner = document.getElementById('loading-spinner');
  const errorBanner = document.getElementById('error-message');
  const errorTitle = document.getElementById('error-title');
  const errorDesc = document.getElementById('error-desc');

  const profileContainer = document.getElementById('profile-container');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userLogin = document.getElementById('user-login');
  const userJoined = document.getElementById('user-joined');
  const userBio = document.getElementById('user-bio');

  const statRepos = document.getElementById('stat-repos');
  const statFollowers = document.getElementById('stat-followers');
  const statFollowing = document.getElementById('stat-following');

  const metaLocationItem = document.getElementById('meta-location-item');
  const userLocation = document.getElementById('user-location');

  const metaPortfolioItem = document.getElementById('meta-portfolio-item');
  const userPortfolio = document.getElementById('user-portfolio');

  const metaTwitterItem = document.getElementById('meta-twitter-item');
  const userTwitter = document.getElementById('user-twitter');

  const metaCompanyItem = document.getElementById('meta-company-item');
  const userCompany = document.getElementById('user-company');

  const reposSection = document.getElementById('repos-section');
  const reposList = document.getElementById('repos-list');

  function showLoading() {
    loadingSpinner.classList.remove('hidden');
    errorBanner.classList.add('hidden');
    profileContainer.classList.add('hidden');
    reposSection.classList.add('hidden');

    searchBtn.disabled = true;
    usernameInput.disabled = true;
  }

  function hideLoading() {
    loadingSpinner.classList.add('hidden');
    searchBtn.disabled = false;
    usernameInput.disabled = false;
  }

  function showError(title, description) {
    errorTitle.textContent = title;
    errorDesc.textContent = description;
    errorBanner.classList.remove('hidden');
    profileContainer.classList.add('hidden');
    reposSection.classList.add('hidden');
  }

  function clearError() {
    errorBanner.classList.add('hidden');
  }

  function renderUserProfile(user) {
    userAvatar.src = user.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    userAvatar.alt = `${user.name || user.login}'s avatar`;

    userName.textContent = user.name || user.login;
    userLogin.textContent = `@${user.login}`;
    userLogin.href = user.html_url;

    userJoined.textContent = formatJoinDate(user.created_at);

    if (user.bio && user.bio.trim() !== '') {
      userBio.textContent = user.bio;
      userBio.classList.remove('is-empty');
    } else {
      userBio.textContent = 'This profile has no bio';
      userBio.classList.add('is-empty');
    }

    statRepos.textContent = (user.public_repos !== undefined && user.public_repos !== null) ? user.public_repos : 0;
    statFollowers.textContent = (user.followers !== undefined && user.followers !== null) ? user.followers : 0;
    statFollowing.textContent = (user.following !== undefined && user.following !== null) ? user.following : 0;

    if (user.location && user.location.trim() !== '') {
      userLocation.textContent = user.location;
      metaLocationItem.classList.remove('is-unavailable');
    } else {
      userLocation.textContent = 'Not Available';
      metaLocationItem.classList.add('is-unavailable');
    }

    if (user.blog && user.blog.trim() !== '') {
      const cleanUrl = formatPortfolioUrl(user.blog);
      userPortfolio.textContent = user.blog;
      userPortfolio.href = cleanUrl;
      metaPortfolioItem.classList.remove('is-unavailable');
    } else {
      userPortfolio.textContent = 'Not Available';
      userPortfolio.removeAttribute('href');
      metaPortfolioItem.classList.add('is-unavailable');
    }

    if (user.twitter_username && user.twitter_username.trim() !== '') {
      userTwitter.textContent = `@${user.twitter_username}`;
      userTwitter.href = `https://twitter.com/${user.twitter_username}`;
      metaTwitterItem.classList.remove('is-unavailable');
    } else {
      userTwitter.textContent = 'Not Available';
      userTwitter.removeAttribute('href');
      metaTwitterItem.classList.add('is-unavailable');
    }

    if (user.company && user.company.trim() !== '') {
      userCompany.textContent = user.company;
      metaCompanyItem.classList.remove('is-unavailable');
    } else {
      userCompany.textContent = 'Not Available';
      metaCompanyItem.classList.add('is-unavailable');
    }

    profileContainer.classList.remove('hidden');
  }

  function renderRepositories(rawRepos) {
    reposList.innerHTML = '';

    if (!rawRepos || rawRepos.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'repos-empty-state';
      emptyState.textContent = 'No public repositories found for this developer.';
      reposList.appendChild(emptyState);
      reposSection.classList.remove('hidden');
      return;
    }

    const latestFiveRepos = sortRepositoriesByUpdated(rawRepos, 5);

    latestFiveRepos.forEach((repo) => {
      const card = document.createElement('article');
      card.className = 'repo-card';

      const topRow = document.createElement('div');
      topRow.className = 'repo-card-top';

      const nameLink = document.createElement('a');
      nameLink.className = 'repo-name-link';
      nameLink.href = repo.html_url;
      nameLink.target = '_blank';
      nameLink.rel = 'noopener noreferrer';
      nameLink.textContent = repo.name;

      const visibilityBadge = document.createElement('span');
      visibilityBadge.className = 'repo-visibility';
      visibilityBadge.textContent = repo.visibility || 'public';

      topRow.appendChild(nameLink);
      topRow.appendChild(visibilityBadge);
      card.appendChild(topRow);

      const desc = document.createElement('p');
      desc.className = 'repo-description';
      if (repo.description && repo.description.trim() !== '') {
        desc.textContent = repo.description;
      } else {
        desc.textContent = 'No description provided';
        desc.classList.add('is-empty');
      }
      card.appendChild(desc);

      const metaRow = document.createElement('div');
      metaRow.className = 'repo-meta';

      if (repo.language) {
        const langItem = document.createElement('span');
        langItem.className = 'repo-meta-item';

        const dot = document.createElement('span');
        dot.className = 'repo-lang-dot';

        const langText = document.createTextNode(repo.language);
        langItem.appendChild(dot);
        langItem.appendChild(langText);
        metaRow.appendChild(langItem);
      }

      const starItem = document.createElement('span');
      starItem.className = 'repo-meta-item';
      starItem.textContent = `⭐ ${repo.stargazers_count !== undefined ? repo.stargazers_count : 0}`;
      metaRow.appendChild(starItem);

      const forkItem = document.createElement('span');
      forkItem.className = 'repo-meta-item';
      forkItem.textContent = `🍴 ${repo.forks_count !== undefined ? repo.forks_count : 0}`;
      metaRow.appendChild(forkItem);

      const dateItem = document.createElement('span');
      dateItem.className = 'repo-meta-item repo-date';
      dateItem.textContent = formatRepoDate(repo.updated_at);
      metaRow.appendChild(dateItem);

      card.appendChild(metaRow);
      reposList.appendChild(card);
    });

    reposSection.classList.remove('hidden');
  }

  async function handleSearch(rawUsername) {
    const username = rawUsername.trim();

    if (!username) {
      showError('Input Required', 'Please enter a GitHub username to search.');
      return;
    }

    showLoading();
    clearError();

    try {
      const userData = await fetchUserProfile(username);
      renderUserProfile(userData);

      if (userData.repos_url) {
        try {
          const repos = await fetchUserRepositories(userData.repos_url);
          renderRepositories(repos);
        } catch (repoError) {
          reposList.innerHTML = `<div class="repos-empty-state">Unable to load repositories: ${repoError.message}</div>`;
          reposSection.classList.remove('hidden');
        }
      }
    } catch (error) {
      const title = error.message.includes('not found') ? 'User Not Found' : 'Investigation Failed';
      showError(title, error.message);
    } finally {
      hideLoading();
    }
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSearch(usernameInput.value);
  });

  // -------------------------------------------------------------
  // View 2 (Battle Mode) Elements & Logic
  // -------------------------------------------------------------
  const battleForm = document.getElementById('battle-form');
  const battleUser1Input = document.getElementById('battle-user-1');
  const battleUser2Input = document.getElementById('battle-user-2');
  const battleSubmitBtn = document.getElementById('battle-submit-btn');

  const battleLoading = document.getElementById('battle-loading');
  const battleError = document.getElementById('battle-error');
  const battleErrorTitle = document.getElementById('battle-error-title');
  const battleErrorDesc = document.getElementById('battle-error-desc');

  const battleResults = document.getElementById('battle-results');
  const battleVerdictBanner = document.getElementById('battle-verdict-banner');
  const battleVerdictIcon = document.getElementById('battle-verdict-icon');
  const battleVerdictTitle = document.getElementById('battle-verdict-title');
  const battleVerdictDesc = document.getElementById('battle-verdict-desc');

  const fighterCard1 = document.getElementById('fighter-card-1');
  const fighterCard2 = document.getElementById('fighter-card-2');

  function showBattleLoading() {
    battleLoading.classList.remove('hidden');
    battleError.classList.add('hidden');
    battleResults.classList.add('hidden');
    battleSubmitBtn.disabled = true;
    battleUser1Input.disabled = true;
    battleUser2Input.disabled = true;
  }

  function hideBattleLoading() {
    battleLoading.classList.add('hidden');
    battleSubmitBtn.disabled = false;
    battleUser1Input.disabled = false;
    battleUser2Input.disabled = false;
  }

  function showBattleError(title, desc) {
    battleErrorTitle.textContent = title;
    battleErrorDesc.textContent = desc;
    battleError.classList.remove('hidden');
    battleResults.classList.add('hidden');
  }

  function clearBattleError() {
    battleError.classList.add('hidden');
  }

  /**
   * Helper to render a fighter's card into the battle arena
   *
   * @param {HTMLElement} cardElement - Container element for this fighter
   * @param {Object} fighter - Fighter data object
   * @param {string} status - 'winner' | 'runner-up' | 'tie'
   */
  function renderFighterCard(cardElement, fighter, status) {
    cardElement.className = 'fighter-card';
    cardElement.classList.add(`is-${status}`);
    cardElement.innerHTML = '';

    // Outcome Badge
    const badge = document.createElement('div');
    badge.className = `fighter-badge badge-${status}`;
    if (status === 'winner') badge.textContent = '🏆 WINNER';
    else if (status === 'runner-up') badge.textContent = '🥈 RUNNER-UP';
    else badge.textContent = '🤝 TIE';
    cardElement.appendChild(badge);

    // Avatar
    const avatar = document.createElement('img');
    avatar.className = 'fighter-avatar';
    avatar.src = fighter.user.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    avatar.alt = `${fighter.user.name || fighter.user.login}'s avatar`;
    cardElement.appendChild(avatar);

    // Names
    const namesContainer = document.createElement('div');
    namesContainer.className = 'fighter-names';

    const name = document.createElement('h3');
    name.className = 'fighter-name';
    name.textContent = fighter.user.name || fighter.user.login;

    const handle = document.createElement('a');
    handle.className = 'fighter-handle';
    handle.href = fighter.user.html_url;
    handle.target = '_blank';
    handle.rel = 'noopener noreferrer';
    handle.textContent = `@${fighter.user.login}`;

    namesContainer.appendChild(name);
    namesContainer.appendChild(handle);
    cardElement.appendChild(namesContainer);

    // Star Showcase Box (reduce result)
    const starBox = document.createElement('div');
    starBox.className = 'fighter-star-box';

    const starLabel = document.createElement('span');
    starLabel.className = 'fighter-star-label';
    starLabel.textContent = 'Total Repo Stars';

    const starCount = document.createElement('span');
    starCount.className = 'fighter-star-count';
    starCount.textContent = `⭐ ${fighter.totalStars.toLocaleString()}`;

    starBox.appendChild(starLabel);
    starBox.appendChild(starCount);
    cardElement.appendChild(starBox);

    // Auxiliary Stats (Repos and Followers)
    const auxStats = document.createElement('div');
    auxStats.className = 'fighter-aux-stats';

    const repoStat = document.createElement('div');
    repoStat.className = 'fighter-aux-stat';
    repoStat.innerHTML = `<span>Repos</span><strong>${fighter.user.public_repos || 0}</strong>`;

    const followerStat = document.createElement('div');
    followerStat.className = 'fighter-aux-stat';
    followerStat.innerHTML = `<span>Followers</span><strong>${(fighter.user.followers || 0).toLocaleString()}</strong>`;

    auxStats.appendChild(repoStat);
    auxStats.appendChild(followerStat);
    cardElement.appendChild(auxStats);
  }

  /**
   * Renders the complete battle verdict and fighter cards
   *
   * @param {Object} battleData - Result from executeBattle()
   */
  function renderBattleResults(battleData) {
    const { fighter1, fighter2, outcome } = battleData;

    // Reset verdict banner styling
    battleVerdictBanner.className = 'battle-verdict-banner';

    if (outcome.isTie) {
      battleVerdictBanner.classList.add('verdict-tie');
      battleVerdictIcon.textContent = '🤝';
      battleVerdictTitle.textContent = "It's a Stalemate Tie!";
      battleVerdictDesc.textContent = `Both developers share an equal total of ${fighter1.totalStars.toLocaleString()} repository stars!`;
    } else {
      battleVerdictIcon.textContent = '🏆';
      const winnerName = outcome.winner.user.name || outcome.winner.user.login;
      battleVerdictTitle.textContent = `${winnerName} Takes the Victory!`;
      battleVerdictDesc.textContent = `${outcome.winner.user.login} won with ${outcome.winner.totalStars.toLocaleString()} stars vs ${outcome.runnerUp.totalStars.toLocaleString()} stars earned by ${outcome.runnerUp.user.login}.`;
    }

    // Render individual fighter cards
    renderFighterCard(fighterCard1, fighter1, outcome.fighter1Status);
    renderFighterCard(fighterCard2, fighter2, outcome.fighter2Status);

    // Reveal battle results
    battleResults.classList.remove('hidden');
  }

  // Battle Form Submission Handler
  battleForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const user1 = battleUser1Input.value.trim();
    const user2 = battleUser2Input.value.trim();

    if (!user1 || !user2) {
      showBattleError('Both Fighters Required', 'Please enter two GitHub usernames to commence the star battle.');
      return;
    }

    showBattleLoading();
    clearBattleError();

    try {
      const battleData = await executeBattle(user1, user2);
      renderBattleResults(battleData);
    } catch (error) {
      showBattleError('Battle Failed', error.message);
    } finally {
      hideBattleLoading();
    }
  });

  // Load a default user on startup
  window.addEventListener('DOMContentLoaded', () => {
    usernameInput.value = 'octocat';
    handleSearch('octocat');

    // Pre-fill battle inputs with interesting defaults
    battleUser1Input.value = 'torvalds';
    battleUser2Input.value = 'gaearon';
  });
}

// =============================================================================
// 4. CommonJS Exports for Automated Unit Testing
// =============================================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatJoinDate,
    formatRepoDate,
    formatPortfolioUrl,
    sortRepositoriesByUpdated,
    calculateTotalStars,
    determineBattleOutcome,
    fetchUserProfile,
    fetchUserRepositories,
    executeBattle
  };
}
