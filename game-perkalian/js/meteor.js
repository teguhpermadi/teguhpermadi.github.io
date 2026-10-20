// ===== Meteor Module =====
// Spawn and manage falling meteors with SVG

const Meteor = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const VIEW_W = 800;
  const VIEW_H = 600;

  let meteors = [];
  let container = null;

  function getMeteorSize(stage) {
    // Smaller meteors at higher stages
    return Math.max(28, 45 - stage * 3);
  }

  function getSpeed(stage) {
    // Faster meteors at higher stages
    return 1.2 + stage * 0.4;
  }

  function create(meteorId, number, isCorrect, stage, xPos, speed) {
    const size = getMeteorSize(stage);
    const spd = speed || getSpeed(stage);
    const mx = xPos !== undefined ? xPos : (size + 10 + Math.random() * (VIEW_W - (size + 10) * 2));

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'meteor-group');
    g.setAttribute('data-id', meteorId);
    g.setAttribute('data-correct', isCorrect ? '1' : '0');
    g.setAttribute('data-number', number);

    // Meteor body - yellow to brown gradient
    const gradient = document.createElementNS(SVG_NS, 'radialGradient');
    gradient.setAttribute('id', `meteor-grad-${meteorId}`);
    gradient.setAttribute('cx', '30%');
    gradient.setAttribute('cy', '30%');
    const stop1 = document.createElementNS(SVG_NS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ffd54f');
    const stop2 = document.createElementNS(SVG_NS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#5d4037');
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);

    const defs = container.parentNode ? container.parentNode.querySelector('defs') : null;
    if (defs) defs.appendChild(gradient);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('class', 'meteor-body');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', size);
    circle.setAttribute('fill', `url(#meteor-grad-${meteorId})`);
    g.appendChild(circle);

    // Meteor number
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('class', 'meteor-text');
    text.setAttribute('x', '0');
    text.setAttribute('y', '0');
    text.textContent = number;
    g.appendChild(text);

    container.appendChild(g);

    const m = {
      id: meteorId,
      el: g,
      x: mx,
      y: -size,
      speed: spd,
      size: size,
      number: number,
      isCorrect: isCorrect,
      missed: false
    };

    g.addEventListener('click', (e) => {
      e.stopPropagation();
      Game.handleMeteorClick(m);
    });

    return m;
  }

  function mount(parent) {
    container = parent;
  }

  function spawn(question, options, stage, speed) {
    // Clear old meteors
    clear();

    const minDist = 70; // minimum distance between meteors
    const positions = [];

    options.forEach((num, i) => {
      const isCorrect = num === question.answer;
      const size = getMeteorSize(stage);

      // Generate position with minimum distance from other meteors
      let mx;
      let attempts = 0;
      const margin = size + 15;
      do {
        mx = margin + Math.random() * (VIEW_W - margin * 2);
        attempts++;
      } while (
        positions.some(p => Math.abs(p - mx) < minDist) &&
        attempts < 50
      );
      positions.push(mx);

      const m = create(`meteor-${i}`, num, isCorrect, stage, mx, speed);
      meteors.push(m);
    });
  }

  function update() {
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.y += m.speed;
      m.el.setAttribute('transform', `translate(${m.x},${m.y})`);

      // Glow animation for correct meteor
      const glow = document.getElementById(`meteor-glow-${m.id}`);
      if (glow) {
        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.15;
        glow.setAttribute('r', m.size + 4 + pulse * 4);
      }

      // Remove if off screen
      if (m.y > VIEW_H + m.size + 20) {
        if (!m.missed && m.isCorrect) {
          m.missed = true;
          Game.handleMeteorMiss(m);
        }
        remove(m);
      }
    }
  }

  function remove(m) {
    if (m.removed) return;
    m.removed = true;
    if (m.el && m.el.parentNode) {
      m.el.parentNode.removeChild(m.el);
    }
    meteors = meteors.filter(mt => mt !== m);
  }

  function clear() {
    meteors.forEach(m => {
      if (m.el && m.el.parentNode) {
        m.el.parentNode.removeChild(m.el);
      }
    });
    meteors = [];
  }

  function getAll() {
    return meteors;
  }

  function getCorrect() {
    return meteors.find(m => m.isCorrect);
  }

  return { mount, spawn, update, remove, clear, getAll, getCorrect, getMeteorSize };
})();
