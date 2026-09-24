// scripts/app.js
// Theme management (dark/light with auto night-time default) + footer date.

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
      localStorage.setItem(config.storageKey, isDark ? 'dark' : 'light');
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
      let saved = localStorage.getItem(config.storageKey);
      if (saved === null) {
        const legacy = localStorage.getItem('docsify-theme-preference');
        if (legacy !== null) {
          localStorage.setItem(config.storageKey, legacy);
          localStorage.removeItem('docsify-theme-preference');
          saved = legacy;
        }
      }
      const shouldDark = saved ? saved === 'dark' : this.isNightTime();
      this.load(shouldDark);
      this.updateButton(shouldDark);
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.onclick = () => this.toggle();
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

  theme.init();
  footer();
})();
