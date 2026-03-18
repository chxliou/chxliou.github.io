// scripts/app.js
// Theme management + Markdown rendering + UI components

(function() {
  const config = {
    storageKey: 'docsify-theme-preference',
    readmeUrl: 'README.md'
  };

  const App = {
    // Theme Management
    theme: {
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
        const saved = localStorage.getItem(config.storageKey);
        const shouldDark = saved ? saved === 'dark' : this.isNightTime();
        this.load(shouldDark);
        this.updateButton(shouldDark);
      }
    },

    // Markdown Rendering
    render: {
      async fetchReadme() {
        try {
          const response = await fetch(config.readmeUrl);
          if (!response.ok) throw new Error('Failed to fetch README.md');
          return await response.text();
        } catch (error) {
          console.error(error);
          return '# Error\nUnable to load content.';
        }
      },

      processMarkdown(md) {
        let lines = md.split('\n');
        let result = [];
        let inPaperSection = false;
        let currentPaper = null;

        const parseInline = (text) => {
          return text
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
        };

        const flushPaper = () => {
          if (currentPaper) {
            result.push('<div class="paper">');
            result.push('<h4>' + currentPaper.title + '</h4>');
            result.push('<p class="authors">' + currentPaper.authors + '</p>');
            if (currentPaper.venue.length > 0) {
              result.push('<p class="venue">' + currentPaper.venue.join('<br>') + '</p>');
            }
            if (currentPaper.links) {
              result.push('<p class="links paper-links">' + parseInline(currentPaper.links) + '</p>');
            }
            result.push('</div>');
            currentPaper = null;
          }
        };

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];

          if (line.startsWith('### Research Papers')) {
            inPaperSection = true;
            result.push(line);
            continue;
          } else if (line.startsWith('### ') && inPaperSection) {
            flushPaper();
            inPaperSection = false;
            result.push(line);
            continue;
          } else if (line.startsWith('---') && inPaperSection) {
            flushPaper();
            inPaperSection = false;
            result.push('<hr>');
            continue;
          }

          if (inPaperSection) {
            if (line.startsWith('#### ')) {
              flushPaper();
              currentPaper = {
                title: line.substring(5),
                authors: '',
                venue: [],
                links: ''
              };
            } else if (currentPaper) {
              if (line.startsWith('<u>') || (line.length > 0 && !line.startsWith('<i>') && !line.startsWith('[') && !currentPaper.authors)) {
                currentPaper.authors = line;
              } else if (line.startsWith('<i>')) {
                currentPaper.venue.push(line);
              } else if (line.startsWith('[')) {
                currentPaper.links = line;
              }
            }
          } else {
            result.push(line);
          }
        }

        flushPaper();
        return result.join('\n');
      },

      async render() {
        const content = document.getElementById('content');
        const md = await this.fetchReadme();
        const processed = this.processMarkdown(md);
        content.innerHTML = marked.parse(processed);
        
        this.insertPhoto();
        this.moveThemeToggle();
        this.addClustrMaps();
      },

      moveThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        const content = document.getElementById('content');
        if (btn && content) {
          content.appendChild(btn);
        }
      },

      insertPhoto() {
        const content = document.getElementById('content');
        const firstH3 = content.querySelector('h3:first-of-type');
        if (!firstH3) return;

        const introWrap = document.createElement('div');
        introWrap.id = 'intro-section';
        firstH3.parentNode.insertBefore(introWrap, firstH3);

        let el = firstH3;
        while (el && el.tagName !== 'HR') {
          const next = el.nextSibling;
          introWrap.appendChild(el);
          el = next;
        }

        const img = document.createElement('img');
        img.id = 'profile-photo';
        img.src = 'assets/cx_photo.jpg';
        img.alt = 'Chenxi Liu';
        introWrap.appendChild(img);
      },

      addClustrMaps() {
        const content = document.getElementById('content');
        
        const container = document.createElement('div');
        container.id = 'clustrmaps-container';
        container.style.cssText = 'text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;';

        const title = document.createElement('div');
        title.textContent = 'Visitor Map';
        title.style.cssText = 'color:#999;font-size:12px;margin-bottom:10px;';
        container.appendChild(title);

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = 'clustrmaps';
        script.src = '//cdn.clustrmaps.com/map_v2.js?cl=00ffff&w=300&t=tt&d=iChGwJjXnJ_leKcaIR8f0Vsx2y3lUQmjHvWusL573VM&co=0d0221&cmo=bd00ff&cmn=ff2a6d&ct=d1f7ff';
        container.appendChild(script);

        const lastUpdate = document.createElement('div');
        lastUpdate.style.cssText = 'color:#999;font-size:12px;margin-top:10px;';
        const lastMod = new Date(document.lastModified);
        const formatted = lastMod.getFullYear() + '/' + 
          String(lastMod.getMonth() + 1).padStart(2, '0') + '/' + 
          String(lastMod.getDate()).padStart(2, '0');
        lastUpdate.textContent = 'last update: ' + formatted;
        container.appendChild(lastUpdate);

        content.appendChild(container);
      }
    },

    // UI Components
    ui: {
      setupThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (btn) {
          btn.onclick = () => App.theme.toggle();
        }
      }
    },

    // Initialize
    async init() {
      this.theme.init();
      this.ui.setupThemeToggle();
      await this.render.render();
    }
  };

  window.App = App;
})();
