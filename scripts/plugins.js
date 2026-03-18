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

  // ClustrMaps 访客地图 - 内容底部
  function clustrMapsPlugin(hook, vm) {
    hook.doneEach(function() {
      // 避免重复添加
      if (document.getElementById('clustrmaps-container')) return;
      
      // 找到内容区域
      const content = document.querySelector('.content');
      if (!content) return;
      
      // 创建容器
      const container = document.createElement('div');
      container.id = 'clustrmaps-container';
      container.style.cssText = 'text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;';
      
      // 添加标题
      const title = document.createElement('div');
      title.textContent = 'Visitor Map';
      title.style.cssText = 'color:#999;font-size:12px;margin-bottom:10px;';
      container.appendChild(title);
      
      // 添加 ClustrMaps 脚本
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'clustrmaps';
      script.src = '//cdn.clustrmaps.com/map_v2.js?cl=00ffff&w=300&t=tt&d=iChGwJjXnJ_leKcaIR8f0Vsx2y3lUQmjHvWusL573VM&co=0d0221&cmo=bd00ff&cmn=ff2a6d&ct=d1f7ff';
      container.appendChild(script);
      
      // 添加 last update
      const lastUpdate = document.createElement('div');
      lastUpdate.style.cssText = 'color:#999;font-size:12px;margin-top:10px;';
      const lastMod = new Date(document.lastModified);
      const formatted = lastMod.getFullYear() + '/' + 
        String(lastMod.getMonth() + 1).padStart(2, '0') + '/' + 
        String(lastMod.getDate()).padStart(2, '0');
      lastUpdate.textContent = 'last update: ' + formatted;
      container.appendChild(lastUpdate);
      
      // 插入到内容底部
      content.appendChild(container);
    });
  }

  window.docsifyPlugins = [editButtonPlugin, themeTogglePlugin, clustrMapsPlugin];
})();