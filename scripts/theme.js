// scripts/theme.js
// 根据时间或偏好加载 vue.css 或 dark.css，支持切换

(function() {
  const config = {
    storageKey: 'docsify-theme-preference',
    lightUrl: 'https://cdn.jsdelivr.net/npm/docsify@4/themes/vue.css',
    darkUrl: 'https://cdn.jsdelivr.net/npm/docsify@4/lib/themes/dark.css'
  };

  const ThemeManager = {
    // 判断是否为夜间（20:00 - 6:00）
    isNightTime() {
      const hour = new Date().getHours();
      return hour < 6 || hour >= 20;
    },

    // 加载指定主题 CSS
    loadTheme(isDark) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = isDark ? config.darkUrl : config.lightUrl;
      link.id = 'theme-css';
      // 插入到 head 最前面，确保优先加载
      document.head.insertBefore(link, document.head.firstChild);
      return isDark;
    },

    // 切换主题（替换 href）
    toggle() {
      const link = document.getElementById('theme-css');
      const isDark = link.href.includes('dark.css');
      const newIsDark = !isDark;
      
      // 替换 CSS 文件
      link.href = newIsDark ? config.darkUrl : config.lightUrl;
      localStorage.setItem(config.storageKey, newIsDark ? 'dark' : 'light');
      
      // 更新按钮文本
      this.updateButton(newIsDark);
      return newIsDark;
    },

    updateButton(isDark) {
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.textContent = isDark ? '☀ light' : '☾ dark';
    },

    isDark() {
      const link = document.getElementById('theme-css');
      return link ? link.href.includes('dark.css') : false;
    },

    // 初始化
    init() {
      const saved = localStorage.getItem(config.storageKey);
      const shouldDark = saved ? saved === 'dark' : this.isNightTime();
      this.loadTheme(shouldDark);
    }
  };

  // 立即执行（阻塞渲染，防止闪烁）
  ThemeManager.init();
  
  // 暴露全局
  window.ThemeManager = ThemeManager;
})();