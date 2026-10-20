// ===== Shot Module =====
// Bullet/projectile from ship to meteor

const Shot = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SPEED = 12;

  let shots = [];
  let container = null;

  function create(x, y, targetX, targetY) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'shot');

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', '-4');
    rect.setAttribute('y', '-12');
    rect.setAttribute('width', '8');
    rect.setAttribute('height', '20');
    rect.setAttribute('rx', '3');
    g.appendChild(rect);

    // Glow effect
    const glow = document.createElementNS(SVG_NS, 'rect');
    glow.setAttribute('x', '-8');
    glow.setAttribute('y', '-16');
    glow.setAttribute('width', '16');
    glow.setAttribute('height', '32');
    glow.setAttribute('rx', '5');
    glow.setAttribute('fill', '#fffde7');
    glow.setAttribute('opacity', '0.3');
    g.appendChild(glow);

    container.appendChild(g);

    // Direction vector
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : -1;

    const s = {
      el: g,
      x: x,
      y: y,
      nx,
      ny,
      targetX,
      targetY,
      speed: SPEED,
      removed: false
    };

    shots.push(s);
    return s;
  }

  function mount(parent) {
    container = parent;
  }

  function update() {
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i];
      s.x += s.nx * s.speed;
      s.y += s.ny * s.speed;
      s.el.setAttribute('transform', `translate(${s.x},${s.y})`);

      // Remove if off screen only (collision handled by game loop)
      if (s.y < -30 || s.y > 650 || s.x < -30 || s.x > 830) {
        remove(s);
      }
    }
  }

  function remove(s) {
    if (s.removed) return;
    s.removed = true;
    if (s.el && s.el.parentNode) {
      s.el.parentNode.removeChild(s.el);
    }
    shots = shots.filter(sh => sh !== s);
  }

  function clear() {
    shots.forEach(s => {
      if (s.el && s.el.parentNode) {
        s.el.parentNode.removeChild(s.el);
      }
    });
    shots = [];
  }

  function getAll() {
    return shots;
  }

  return { mount, create, update, remove, clear, getAll };
})();
