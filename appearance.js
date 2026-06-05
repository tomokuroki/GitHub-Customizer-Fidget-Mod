/**
 * GitHub Custom Themes Settings Injection
 * Injects the custom theme choices into GitHub's Appearance settings page.
 * Developed by @tomokuroki
 */

(function () {
  const THEME_STORAGE_KEY = 'activeTheme';
  const VALID_THEMES = ['coffee', 'amoled', 'purple', 'calm-dark'];

  // Inject styles for the settings UI
  function injectStyles() {
    if (document.getElementById('custom-theme-settings-styles')) return;

    const style = document.createElement('style');
    style.id = 'custom-theme-settings-styles';
    style.textContent = `
      .custom-themes-box {
        margin-top: 24px !important;
        border: 1px solid var(--color-border-default, var(--borderColor-default)) !important;
        border-radius: 6px !important;
        background-color: var(--color-canvas-default, var(--bgColor-default)) !important;
        overflow: hidden;
      }
      .custom-themes-box .Box-header {
        background-color: var(--color-canvas-subtle, var(--bgColor-muted)) !important;
        border-bottom: 1px solid var(--color-border-default, var(--borderColor-default)) !important;
        padding: 16px !important;
      }
      .custom-themes-box .Box-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--color-fg-default, var(--fgColor-default)) !important;
        margin: 0 !important;
      }
      .custom-themes-box .Box-body {
        padding: 16px !important;
      }
      .custom-themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
      .custom-theme-option {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px;
        border: 1px solid var(--color-border-default, var(--borderColor-default));
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background-color: var(--color-canvas-default, var(--bgColor-default));
        position: relative;
        user-select: none;
      }
      .custom-theme-option:hover {
        border-color: var(--color-accent-fg, var(--fgColor-accent));
        background-color: var(--color-canvas-subtle, var(--bgColor-muted));
        transform: translateY(-1px);
      }
      .custom-theme-option.selected {
        border-color: var(--color-accent-fg, var(--fgColor-accent));
        box-shadow: 0 0 0 1px var(--color-accent-fg, var(--fgColor-accent));
        background-color: var(--color-canvas-subtle, var(--bgColor-muted));
      }
      .custom-radio-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      .custom-theme-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      }
      .preview-dot {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        position: relative;
      }
      .preview-dot::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--color-accent-fg, var(--fgColor-accent));
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .custom-theme-option.selected .preview-dot::after {
        opacity: 1;
      }
      .custom-theme-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .custom-theme-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--color-fg-default, var(--fgColor-default));
      }
      .custom-theme-desc {
        font-size: 11px;
        color: var(--color-fg-muted, var(--fgColor-muted));
        line-height: 1.3;
      }
      .dev-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background-color: var(--color-accent-subtle, var(--bgColor-accent-muted));
        color: var(--color-accent-fg, var(--fgColor-accent));
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-decoration: none !important;
        transition: opacity 0.2s;
        margin-top: 8px;
      }
      .dev-badge:hover {
        opacity: 0.85;
      }
    `;
    document.head.appendChild(style);
  }

  // Find container to append our settings card
  function getTargetContainer() {
    // Look for dynamic layout main content
    const layoutMain = document.querySelector('.Layout-main');
    if (layoutMain) {
      // Find the main appearance settings wrapper
      const appearanceWrapper = layoutMain.querySelector('div[data-settings-prefix="appearance"]') || layoutMain.querySelector('form') || layoutMain;
      return { container: appearanceWrapper, method: 'append' };
    }

    // Fallback: search main tags or settings frame
    const main = document.querySelector('main');
    if (main) {
      const form = main.querySelector('form[action*="/settings/appearance"]') || main.querySelector('form');
      if (form) {
        return { container: form, method: 'append' };
      }
      return { container: main, method: 'append' };
    }

    return null;
  }

  // Inject the panel into the page
  function injectSettingsPanel() {
    if (document.querySelector('.custom-themes-box')) return; // Already exists

    const targetInfo = getTargetContainer();
    if (!targetInfo) return;

    injectStyles();

    const card = document.createElement('div');
    card.className = 'Box custom-themes-box';
    card.innerHTML = `
      <div class="Box-header">
        <h3 class="Box-title">GitHub Customizer Mods & Themes</h3>
      </div>
      <div class="Box-body">
        <p class="note mb-3" style="font-size: 13px; color: var(--color-fg-muted, var(--fgColor-muted));">
          Personalize your GitHub workspace with premium dark themes and productivity mods. Configure mod features via the extension toolbar popup.
        </p>
        
        <div class="custom-themes-grid">
          <!-- None / Disabled -->
          <label class="custom-theme-option" data-theme="disabled">
            <input type="radio" name="custom-theme-radio" value="disabled" class="custom-radio-input">
            <div class="custom-theme-preview" style="background-color: #24292e;">
              <div class="preview-dot" style="background-color: #0d1117; border: 1px solid #30363d;"></div>
            </div>
            <div class="custom-theme-meta">
              <span class="custom-theme-name">Default GitHub</span>
              <span class="custom-theme-desc">Use standard system/GitHub settings</span>
            </div>
          </label>

          <!-- Coffee -->
          <label class="custom-theme-option" data-theme="coffee">
            <input type="radio" name="custom-theme-radio" value="coffee" class="custom-radio-input">
            <div class="custom-theme-preview" style="background-color: #150f0c;">
              <div class="preview-dot" style="background-color: #1e1612; border: 1px solid #433228;"></div>
            </div>
            <div class="custom-theme-meta">
              <span class="custom-theme-name">Coffee Shop</span>
              <span class="custom-theme-desc">Cozy espresso & warm latte tones</span>
            </div>
          </label>

          <!-- AMOLED -->
          <label class="custom-theme-option" data-theme="amoled">
            <input type="radio" name="custom-theme-radio" value="amoled" class="custom-radio-input">
            <div class="custom-theme-preview" style="background-color: #000000;">
              <div class="preview-dot" style="background-color: #000000; border: 1px solid #262626;"></div>
            </div>
            <div class="custom-theme-meta">
              <span class="custom-theme-name">AMOLED Black</span>
              <span class="custom-theme-desc">Pure black backdrop with neon accents</span>
            </div>
          </label>

          <!-- Purple -->
          <label class="custom-theme-option" data-theme="purple">
            <input type="radio" name="custom-theme-radio" value="purple" class="custom-radio-input">
            <div class="custom-theme-preview" style="background-color: #0a0614;">
              <div class="preview-dot" style="background-color: #0f0a1c; border: 1px solid #2a204d;"></div>
            </div>
            <div class="custom-theme-meta">
              <span class="custom-theme-name">Midnight Purple</span>
              <span class="custom-theme-desc">Deep violet background with lilac details</span>
            </div>
          </label>

          <!-- Calm Dark -->
          <label class="custom-theme-option" data-theme="calm-dark">
            <input type="radio" name="custom-theme-radio" value="calm-dark" class="custom-radio-input">
            <div class="custom-theme-preview" style="background-color: #171a21;">
              <div class="preview-dot" style="background-color: #1e222b; border: 1px solid #334155;"></div>
            </div>
            <div class="custom-theme-meta">
              <span class="custom-theme-name">Calm Dark</span>
              <span class="custom-theme-desc">Nord-style low-contrast blue-gray theme</span>
            </div>
          </label>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--color-border-default, var(--borderColor-default)); margin: 20px 0 12px 0;">
        
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <span style="font-size: 12px; color: var(--color-fg-subtle, var(--fgColor-subtle));">
            Extension Version: 1.0.0
          </span>
          <a href="https://github.com/tomokuroki" target="_blank" class="dev-badge">
            <svg aria-hidden="true" height="14" viewBox="0 0 16 16" width="14" fill="currentColor" style="vertical-align: text-bottom;">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88.01.47.01.84.01.93 0 .22-.15.47-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            Developed by @tomokuroki
          </a>
        </div>
      </div>
    `;

    // Append to target container
    if (targetInfo.method === 'append') {
      targetInfo.container.appendChild(card);
    }

    // Set active state based on storage
    chrome.storage.local.get([THEME_STORAGE_KEY], (result) => {
      const activeTheme = result[THEME_STORAGE_KEY] || 'disabled';
      const radio = card.querySelector(`input[value="${activeTheme}"]`);
      if (radio) {
        radio.checked = true;
        radio.closest('.custom-theme-option').classList.add('selected');
      }
    });

    // Add event listeners for selections
    card.querySelectorAll('.custom-theme-option').forEach((option) => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const radio = option.querySelector('.custom-radio-input');
        const themeVal = radio.value;

        // Clear previous selections
        card.querySelectorAll('.custom-theme-option').forEach((opt) => {
          opt.classList.remove('selected');
          opt.querySelector('.custom-radio-input').checked = false;
        });

        // Apply new selection
        option.classList.add('selected');
        radio.checked = true;

        // Save selection to local storage
        chrome.storage.local.set({ [THEME_STORAGE_KEY]: themeVal });
      });
    });
  }

  // Initialize checks
  function init() {
    if (window.location.pathname === '/settings/appearance') {
      injectSettingsPanel();
    }
  }

  // Run immediately
  init();

  // Listen to GitHub standard SPA navigation events
  document.addEventListener('turbo:load', init);
  document.addEventListener('pjax:end', init);

  // Fallback Poller for 100% inject success on lazy content loading
  setInterval(init, 1000);
})();
