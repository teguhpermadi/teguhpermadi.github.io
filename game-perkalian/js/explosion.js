// ===== Explosion Module =====
// Particle explosion effects for hit/miss

const Explosion = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  let explosions = [];
  let container = null;

  function create(x, y, color, count = 12) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'explosion-group');

    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 4 + Math.random() * 6;

      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', size);
      circle.setAttribute('fill', color);
      circle.setAttribute('opacity', '1');
      g.appendChild(circle);

      particles.push({ el: circle, vx, vy, size, opacity: 1 });
    }

    // Ring expansion
    const ring = document.createElementNS(SVG_NS, 'circle');
    ring.setAttribute('cx', x);
    ring.setAttribute('cy', y);
    ring.setAttribute('r', '5');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', color);
    ring.setAttribute('stroke-width', '3');
    ring.setAttribute('opacity', '0.8');
    g.appendChild(ring);

    container.appendChild(g);

    const ex = {
      el: g,
      particles,
      ring,
      frame: 0,
      maxFrames: 40,
      removed: false
    };

    explosions.push(ex);
    return ex;
  }

  function mount(parent) {
    container = parent;
  }

  function update() {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const ex = explosions[i];
      ex.frame++;

      // Expand ring
      const ringR = 5 + ex.frame * 3;
      ex.ring.setAttribute('r', ringR);
      ex.ring.setAttribute('opacity', Math.max(0, 0.8 * (1 - ex.frame / ex.maxFrames)));

      // Move particles
      for (const p of ex.particles) {
        p.vx *= 0.96; // friction
        p.vy *= 0.96;
        const px = parseFloat(p.el.getAttribute('cx')) + p.vx;
        const py = parseFloat(p.el.getAttribute('cy')) + p.vy;
        p.opacity = Math.max(0, 1 - ex.frame / ex.maxFrames);
        p.el.setAttribute('cx', px);
        p.el.setAttribute('cy', py);
        p.el.setAttribute('opacity', p.opacity);
      }

      if (ex.frame >= ex.maxFrames) {
        remove(ex);
      }
    }
  }

  function remove(ex) {
    if (ex.removed) return;
    ex.removed = true;
    if (ex.el && ex.el.parentNode) {
      ex.el.parentNode.removeChild(ex.el);
    }
    explosions = explosions.filter(e => e !== ex);
  }

  function clear() {
    explosions.forEach(ex => {
      if (ex.el && ex.el.parentNode) {
        ex.el.parentNode.removeChild(ex.el);
      }
    });
    explosions = [];
  }

  return { mount, create, update, remove, clear };
})();
