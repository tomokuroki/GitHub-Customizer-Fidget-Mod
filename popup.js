/**
 * Extension Popup Control Script
 * Manages theme selection, mod switches, and interactive Web Audio Pop It board.
 * Developed by @tomokuroki
 */

document.addEventListener('DOMContentLoaded', () => {
  const THEME_STORAGE_KEY = 'activeTheme';
  const POPIT_STORAGE_KEY = 'popitState';
  const DEV_USERNAME = 'tomokuroki';

  // --- 1. THEME & MODS SYNCHRONIZATION ---
  const themePills = document.querySelectorAll('.theme-pill');
  const toggleContributions = document.getElementById('toggle-mod-contributions');
  const toggleBackToTop = document.getElementById('toggle-mod-backtotop');

  function applyPopupTheme(themeName) {
    if (themeName && themeName !== 'disabled') {
      document.documentElement.setAttribute('data-active-theme', themeName);
    } else {
      document.documentElement.removeAttribute('data-active-theme');
    }
  }

  // Load saved theme and mods
  chrome.storage.local.get([THEME_STORAGE_KEY, 'modContributions', 'modBackToTop'], (result) => {
    // Apply theme
    const activeTheme = result[THEME_STORAGE_KEY] || 'disabled';
    applyPopupTheme(activeTheme);
    themePills.forEach((pill) => {
      if (pill.dataset.theme === activeTheme) {
        pill.classList.add('selected');
      } else {
        pill.classList.remove('selected');
      }
    });

    // Apply mod checkboxes
    toggleContributions.checked = !!result.modContributions;
    toggleBackToTop.checked = !!result.modBackToTop;
  });

  // Handle click on theme pills
  themePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const selectedTheme = pill.dataset.theme;

      // Update active classes
      themePills.forEach((p) => p.classList.remove('selected'));
      pill.classList.add('selected');

      // Save to storage and apply to popup document
      chrome.storage.local.set({ [THEME_STORAGE_KEY]: selectedTheme }, () => {
        applyPopupTheme(selectedTheme);
      });
    });
  });

  // Handle click on mod toggles
  toggleContributions.addEventListener('change', () => {
    chrome.storage.local.set({ modContributions: toggleContributions.checked });
  });

  toggleBackToTop.addEventListener('change', () => {
    chrome.storage.local.set({ modBackToTop: toggleBackToTop.checked });
  });


  // --- 2. GITHUB API PROFILE FETCH ---
  const devAvatar = document.getElementById('dev-avatar');
  const devName = document.getElementById('dev-name');
  const devBio = document.getElementById('dev-bio');
  const statRepos = document.getElementById('stat-repos');
  const statFollowers = document.getElementById('stat-followers');
  const statStars = document.getElementById('stat-stars');

  // Premium Fallback Data (if API fails or rate-limited)
  const fallbackProfile = {
    name: 'tomokuroki',
    bio: 'Premium themes developer for enhanced developer experience.',
    avatar_url: 'https://avatars.githubusercontent.com/u/82545564?v=4',
    public_repos: 12,
    followers: 24,
    stars: 18
  };

  function applyProfileData(data) {
    devAvatar.src = data.avatar_url;
    devName.textContent = data.name || data.login || DEV_USERNAME;
    devBio.textContent = data.bio || fallbackProfile.bio;
    statRepos.textContent = data.public_repos;
    statFollowers.textContent = data.followers;
    statStars.textContent = data.stars !== undefined ? data.stars : fallbackProfile.stars;
  }

  async function fetchDeveloperProfile() {
    try {
      const userRes = await fetch(`https://api.github.com/users/${DEV_USERNAME}`);
      if (!userRes.ok) throw new Error('API Rate Limit or Offline');
      const userData = await userRes.json();

      const reposRes = await fetch(`https://api.github.com/users/${DEV_USERNAME}/repos?per_page=100`);
      let starsCount = 0;
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        starsCount = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
      }

      userData.stars = starsCount || fallbackProfile.stars;
      applyProfileData(userData);
    } catch (err) {
      console.log('GitHub API fetch failed, loading fallback profile details.', err);
      applyProfileData(fallbackProfile);
    }
  }

  fetchDeveloperProfile();


  // --- 3. WEB AUDIO POP SOUND SYNTHESIS ---
  let audioCtx = null;

  function playPopSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const baseFreq = 380 + Math.random() * 40; 
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.error('Audio context initialization failed.', e);
    }
  }


  // --- 4. FIDGET POP IT GRID ---
  const popitGrid = document.getElementById('popit-grid');
  const resetBtn = document.getElementById('reset-popit');
  
  const ROWS = 7;
  const COLS = 16;
  const TOTAL_CELLS = ROWS * COLS;
  let cellStates = Array(TOTAL_CELLS).fill(0);

  function createPopitGrid() {
    popitGrid.innerHTML = '';
    
    chrome.storage.local.get([POPIT_STORAGE_KEY], (result) => {
      if (result[POPIT_STORAGE_KEY] && result[POPIT_STORAGE_KEY].length === TOTAL_CELLS) {
        cellStates = result[POPIT_STORAGE_KEY];
      }

      for (let i = 0; i < TOTAL_CELLS; i++) {
        const bubble = document.createElement('div');
        const state = cellStates[i];
        
        bubble.className = `pop-bubble level-${state}`;
        if (state > 0) {
          bubble.classList.add('popped');
        }
        bubble.dataset.index = i;

        bubble.addEventListener('click', () => {
          playPopSound();
          
          let currentState = cellStates[i];
          let nextState = (currentState + 1) % 5;
          cellStates[i] = nextState;

          bubble.className = `pop-bubble level-${nextState}`;
          if (nextState > 0) {
            bubble.classList.add('popped');
            bubble.style.transform = 'scale(0.8)';
            setTimeout(() => {
              bubble.style.transform = 'scale(0.9)';
            }, 80);
          } else {
            bubble.classList.remove('popped');
            bubble.style.transform = 'scale(1.15)';
            setTimeout(() => {
              bubble.style.transform = '';
            }, 80);
          }

          chrome.storage.local.set({ [POPIT_STORAGE_KEY]: cellStates });
        });

        popitGrid.appendChild(bubble);
      }
    });
  }

  resetBtn.addEventListener('click', () => {
    playPopSound();
    cellStates = Array(TOTAL_CELLS).fill(0);
    
    const bubbles = popitGrid.querySelectorAll('.pop-bubble');
    bubbles.forEach((bubble) => {
      bubble.className = 'pop-bubble level-0';
      bubble.classList.remove('popped');
      bubble.style.transform = '';
    });

    chrome.storage.local.set({ [POPIT_STORAGE_KEY]: cellStates });
  });

  createPopitGrid();
});
