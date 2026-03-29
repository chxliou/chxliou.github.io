// scripts/dag-background.js
// Flat design BA and ER graph DAGs - Black, White, Gray theme

(function() {
  const canvas = document.getElementById('dag-bg');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width, height;
  let dags = [];
  
  // Configuration
  const config = {
    dagCount: 7,
    nodesPerDag: { min: 3, max: 5 },
    nodeRadius: 7,          // Flat large nodes
    edgeWidth: 2.5,         // Flat thick edges
    baseOpacity: 0.15,       // Very subtle - lower opacity
    edgeOpacity: 0.10,
    arrowOpacity: 0.18,
    arrowSize: 5,           // Small arrows
    driftSpeed: 0.12,
    dagSpacing: 200
  };
  
  // Flat color theme - Black, White, Gray
  const theme = {
    light: {
      node: '80, 80, 80',    // Gray-700 flat
      edge: '100, 100, 100', // Gray-600 flat
      bg: '#f5f5f7'
    },
    dark: {
      node: '180, 180, 180', // Gray-400 flat
      edge: '150, 150, 150', // Gray-500 flat
      bg: '#000000'
    }
  };
  
  function getColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? theme.dark : theme.light;
  }
  
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  // Check if position is valid
  function isValidPosition(x, y, existingDags) {
    for (let dag of existingDags) {
      const dx = dag.centerX - x;
      const dy = dag.centerY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < config.dagSpacing) return false;
    }
    return true;
  }
  
  // BA (Barabasi-Albert) DAG generation
  function createBADAG(centerX, centerY) {
    const nodeCount = Math.floor(Math.random() * 
      (config.nodesPerDag.max - config.nodesPerDag.min + 1)) + config.nodesPerDag.min;
    
    const dag = {
      centerX, centerY,
      nodes: [],
      edges: [],
      phase: Math.random() * Math.PI * 2,
      type: 'BA'
    };
    
    // Create nodes in layers
    const layers = Math.ceil(nodeCount / 2);
    let nodeDegrees = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const layer = Math.floor(i / 2);
      const layerPos = i % 2;
      
      dag.nodes.push({
        id: i,
        x: (layer - (layers-1)/2) * 50 + (Math.random() - 0.5) * 10,
        y: (layerPos - 0.5) * 45 + (Math.random() - 0.5) * 10,
        layer: layer,
        degree: 0
      });
      nodeDegrees.push(0);
    }
    
    // BA preferential attachment
    for (let i = 0; i < nodeCount; i++) {
      const source = dag.nodes[i];
      const candidates = dag.nodes.filter(n => n.layer > source.layer);
      
      if (candidates.length === 0) continue;
      
      const m = Math.min(2, candidates.length);
      
      for (let e = 0; e < m; e++) {
        const totalDegree = candidates.reduce((sum, n) => sum + nodeDegrees[n.id] + 1, 0);
        let r = Math.random() * totalDegree;
        
        let target = candidates[0];
        for (let c of candidates) {
          r -= (nodeDegrees[c.id] + 1);
          if (r <= 0) {
            target = c;
            break;
          }
        }
        
        const exists = dag.edges.some(edge => 
          edge.source.id === source.id && edge.target.id === target.id
        );
        
        if (!exists) {
          dag.edges.push({ source, target });
          nodeDegrees[source.id]++;
          nodeDegrees[target.id]++;
        }
      }
    }
    
    return dag;
  }
  
  // ER (Erdos-Renyi) DAG generation
  function createERDAG(centerX, centerY) {
    const nodeCount = Math.floor(Math.random() * 
      (config.nodesPerDag.max - config.nodesPerDag.min + 1)) + config.nodesPerDag.min;
    
    const dag = {
      centerX, centerY,
      nodes: [],
      edges: [],
      phase: Math.random() * Math.PI * 2,
      type: 'ER'
    };
 
    const layers = Math.ceil(nodeCount / 2);
    
    for (let i = 0; i < nodeCount; i++) {
      const layer = Math.floor(i / 2);
      const layerPos = i % 2;
      
      dag.nodes.push({
        id: i,
        x: (layer - (layers-1)/2) * 50 + (Math.random() - 0.5) * 15,
        y: (layerPos - 0.5) * 45 + (Math.random() - 0.5) * 15,
        layer: layer
      });
    }
    
    const p = 0.6;
    
    for (let i = 0; i < nodeCount; i++) {
      const source = dag.nodes[i];
      const candidates = dag.nodes.filter(n => n.layer > source.layer);
      
      for (let target of candidates) {
        if (Math.random() < p) {
          dag.edges.push({ source, target });
        }
      }
    }
    
    for (let i = 0; i < nodeCount - 1; i++) {
      const hasOutgoing = dag.edges.some(e => e.source.id === dag.nodes[i].id);
      if (!hasOutgoing) {
        const candidates = dag.nodes.filter(n => n.layer > dag.nodes[i].layer);
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          dag.edges.push({ source: dag.nodes[i], target });
        }
      }
    }
    
    return dag;
  }
  
  // Create all DAGs (mixed BA and ER)
  function createDAGs() {
    dags = [];
    let attempts = 0;
    
    for (let i = 0; i < config.dagCount && attempts < 100; i++) {
      let x, y;
      let found = false;
      
      while (attempts < 100 && !found) {
        x = 100 + Math.random() * (width - 200);
        y = 100 + Math.random() * (height - 200);
        
        if (isValidPosition(x, y, dags)) {
          found = true;
        }
        attempts++;
      }
      
      if (found) {
        const dag = i % 2 === 0 ? createBADAG(x, y) : createERDAG(x, y);
        dags.push(dag);
      }
    }
  }
  
  // Gentle drift
  function updateDAGs(time) {
    const t = time * 0.00025;
    
    dags.forEach(dag => {
      dag.centerX += Math.sin(t + dag.phase) * config.driftSpeed;
      dag.centerY += Math.cos(t * 0.8 + dag.phase) * config.driftSpeed;
      
      if (dag.centerX < -80) dag.centerX = width + 80;
      if (dag.centerX > width + 80) dag.centerX = -80;
      if (dag.centerY < -80) dag.centerY = height + 80;
      if (dag.centerY > height + 80) dag.centerY = -80;
    });
  }
  
  // Draw small flat arrow
  function drawArrow(x, y, angle, color) {
    const size = config.arrowSize;
    const a1 = angle - Math.PI / 5;
    const a2 = angle + Math.PI / 5;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(a1), y - size * Math.sin(a1));
    ctx.lineTo(x - size * Math.cos(a2), y - size * Math.sin(a2));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  // Render - Flat design
  function render(time) {
    ctx.clearRect(0, 0, width, height);
    const colors = getColors();
    
    dags.forEach(dag => {
      // Draw edges first (behind nodes)
      dag.edges.forEach(edge => {
        const sx = dag.centerX + edge.source.x;
        const sy = dag.centerY + edge.source.y;
        const tx = dag.centerX + edge.target.x;
        const ty = dag.centerY + edge.target.y;
        
        const angle = Math.atan2(ty - sy, tx - sx);
        const endX = tx - (config.nodeRadius + 2) * Math.cos(angle);
        const endY = ty - (config.nodeRadius + 2) * Math.sin(angle);
        
        // Flat edge line
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${colors.edge}, ${config.edgeOpacity})`;
        ctx.lineWidth = config.edgeWidth;
        ctx.lineCap = 'butt'; // Flat line cap
        ctx.stroke();
        
        // Small flat arrow
        drawArrow(endX, endY, angle, `rgba(${colors.edge}, ${config.arrowOpacity})`);
      });
      
      // Draw flat nodes
      dag.nodes.forEach(node => {
        const x = dag.centerX + node.x;
        const y = dag.centerY + node.y;
        
        // Flat node - solid circle, no glow, no highlight
        ctx.beginPath();
        ctx.arc(x, y, config.nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.node}, ${config.baseOpacity})`;
        ctx.fill();
      });
    });
  }
  
  // Animation loop
  function animate(time) {
    updateDAGs(time);
    render(time);
    requestAnimationFrame(animate);
  }
  
  // Initialize
  function init() {
    resize();
    createDAGs();
    requestAnimationFrame(animate);
  }
  
  window.addEventListener('resize', () => {
    resize();
    createDAGs();
  });
  
  // Theme change observer
  new MutationObserver(() => {
    // Colors update automatically in render
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  
  init();
})();
