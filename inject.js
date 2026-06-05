/**
 * GitHub Custom Themes & Mods Injection Script
 * Runs at document_start to apply themes and initialize page mods.
 * Developed by @tomokuroki
 */

(function () {
  const THEME_STORAGE_KEY = 'activeTheme';
  const VALID_THEMES = ['coffee', 'amoled', 'purple', 'calm-dark'];
  const MOD_KEYS = ['modContributions', 'modBackToTop'];

  // Apply active states immediately
  chrome.storage.local.get([THEME_STORAGE_KEY, ...MOD_KEYS], (result) => {
    // 1. Theme application
    const activeTheme = result[THEME_STORAGE_KEY];
    if (activeTheme && VALID_THEMES.includes(activeTheme)) {
      document.documentElement.setAttribute('data-custom-theme', activeTheme);
    }

    // 2. Mod attribute toggles
    if (result.modContributions) {
      document.documentElement.setAttribute('data-mod-contributions', 'true');
    }

    // 3. Back-to-Top Button initialization
    if (result.modBackToTop) {
      initBackToTop();
    }
  });

  // Listen for storage updates to apply changes dynamically without page reload
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      // Theme changes
      if (changes[THEME_STORAGE_KEY]) {
        const newTheme = changes[THEME_STORAGE_KEY].newValue;
        if (newTheme && VALID_THEMES.includes(newTheme)) {
          document.documentElement.setAttribute('data-custom-theme', newTheme);
        } else {
          document.documentElement.removeAttribute('data-custom-theme');
        }
      }



      // Contribution animations changes
      if (changes.modContributions) {
        if (changes.modContributions.newValue) {
          document.documentElement.setAttribute('data-mod-contributions', 'true');
        } else {
          document.documentElement.removeAttribute('data-mod-contributions');
        }
      }

      // Back-to-Top button changes
      if (changes.modBackToTop) {
        if (changes.modBackToTop.newValue) {
          initBackToTop();
        } else {
          removeBackToTop();
        }
      }
    }
  });

  // --- MOD FUNCTION: FLOATING BACK TO TOP BUTTON ---
  let backToTopBtn = null;
  let scrollListener = null;

  function initBackToTop() {
    if (document.getElementById('github-mod-back-to-top')) return;

    const createBtn = () => {
      if (document.getElementById('github-mod-back-to-top')) return;

      backToTopBtn = document.createElement('div');
      backToTopBtn.id = 'github-mod-back-to-top';
      backToTopBtn.className = 'github-mod-back-to-top';
      backToTopBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      `;

      // Smooth scroll back to top on click
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      document.body.appendChild(backToTopBtn);

      // Listen to scroll to toggle visibility
      scrollListener = () => {
        if (window.scrollY > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      };

      window.addEventListener('scroll', scrollListener);
    };

    // Safety check if body is loaded
    if (document.body) {
      createBtn();
    } else {
      document.addEventListener('DOMContentLoaded', createBtn);
    }
  }

  function removeBackToTop() {
    const btn = document.getElementById('github-mod-back-to-top');
    if (btn) btn.remove();

    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }
  }
})();
