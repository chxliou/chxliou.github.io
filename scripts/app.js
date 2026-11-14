// scripts/app.js
// Theme management, installation-command copy action, and footer date.

(function() {
  const config = {
    storageKey: 'theme-preference',
  };

  const theme = {
    isNightTime() {
      const hour = new Date().getHours();
      return hour < 6 || hour >= 20;
    },

    load(isDark) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
      try {
        localStorage.setItem(config.storageKey, isDark ? 'dark' : 'light');
      } catch {
        // Theme switching still works when browser storage is unavailable.
      }
    },

    toggle() {
      const isDark = document.documentElement.classList.contains('dark');
      this.load(!isDark);
      this.updateButton(!isDark);
    },

    updateButton(isDark) {
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.textContent = isDark ? '☾ dark' : '☀ light';
    },

    init() {
      let saved = null;
      try {
        saved = localStorage.getItem(config.storageKey);
        if (saved === null) {
          const legacy = localStorage.getItem('docsify-theme-preference');
          if (legacy !== null) {
            saved = legacy;
            localStorage.setItem(config.storageKey, legacy);
            localStorage.removeItem('docsify-theme-preference');
          }
        }
      } catch {
        // Fall back to the time-based default if reading storage is blocked.
      }
      const shouldDark = saved === 'dark' || (saved !== 'light' && this.isNightTime());
      this.load(shouldDark);
    },
  };

  function footer() {
    const el = document.getElementById('last-update');
    if (!el) return;
    const d = new Date(document.lastModified);
    el.textContent = d.getFullYear() + '/' +
      String(d.getMonth() + 1).padStart(2, '0') + '/' +
      String(d.getDate()).padStart(2, '0');
  }

  function installCopy() {
    const button = document.getElementById('copy-install');
    const command = document.getElementById('install-command');
    const status = document.getElementById('copy-status');
    const help = document.getElementById('copy-help');
    if (!button || !command || !status || !help) return;

    let resetTimer;
    button.hidden = false;
    button.addEventListener('click', async () => {
      clearTimeout(resetTimer);
      button.disabled = true;
      button.textContent = 'Copy';
      status.textContent = '';
      help.hidden = true;

      try {
        await navigator.clipboard.writeText(command.textContent.trim());
        button.textContent = 'Copied ✓';
        status.textContent = 'Installation command copied to clipboard.';
        resetTimer = setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      } catch {
        help.hidden = false;
        status.textContent = help.textContent;
      } finally {
        button.disabled = false;
      }
    });
  }

  // This script runs in <head>, before the stylesheet and first page paint.
  theme.init();

  function initPage() {
    theme.updateButton(document.documentElement.classList.contains('dark'));
    const button = document.getElementById('theme-toggle');
    if (button) button.addEventListener('click', () => theme.toggle());
    installCopy();
    footer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage, { once: true });
  } else {
    initPage();
  }
})();
