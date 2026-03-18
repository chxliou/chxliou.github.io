// scripts/plugins.js

(function() {
  // 编辑按钮 - 右下角底部
  function editButtonPlugin(hook, vm) {
    hook.doneEach(function() {
      if (document.getElementById('quick-edit-btn')) return;
      
      const link = document.createElement('a');
      link.id = 'quick-edit-btn';
      link.href = 'https://github.com/chxliou/chxliou.github.io/blob/main/README.md';
      link.innerHTML = '✎ edit';
      link.title = '快速编辑主页内容';
      link.style.cssText = [
        'position:fixed', 'bottom:15px', 'right:15px', 'opacity:0.15',
        'font-size:13px', 'color:#666', 'text-decoration:none', 'z-index:1000',
        'transition:opacity 0.3s', 'background:rgba(128,128,128,0.1)',
        'padding:2px 6px', 'border-radius:3px', 'cursor:pointer'
      ].join(';');
      
      link.onmouseenter = () => link.style.opacity = '0.9';
      link.onmouseleave = () => link.style.opacity = '0.15';
      
      document.body.appendChild(link);
    });
  }

  // 主题切换按钮 - 右下角 edit 上方
  function themeTogglePlugin(hook, vm) {
    hook.doneEach(function() {
      if (document.getElementById('theme-toggle')) return;
      
      const btn = document.createElement('button');
      btn.id = 'theme-toggle';
      btn.title = '切换暗色/亮色模式';
      btn.textContent = window.ThemeManager.isDark() ? '☀ light' : '☾ dark';
      // 放在 edit 上方 30px
      btn.style.cssText = [
        'position:fixed', 'bottom:45px', 'right:15px', 'opacity:0.15',
        'font-size:13px', 'color:inherit', 'text-decoration:none',
        'z-index:1000', 'transition:opacity 0.3s', 'background:rgba(128,128,128,0.1)',
        'padding:2px 8px', 'border-radius:3px', 'cursor:pointer', 'border:none',
        'font-family:inherit'
      ].join(';');
      
      btn.onclick = () => window.ThemeManager.toggle();
      btn.onmouseenter = () => btn.style.opacity = '0.9';
      btn.onmouseleave = () => btn.style.opacity = '0.15';
      
      document.body.appendChild(btn);
    });
  }

  window.docsifyPlugins = [editButtonPlugin, themeTogglePlugin];
})();