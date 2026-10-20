// ===== Ship Module =====
// Ship movement (4 directions) and shooting

const Ship = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const VIEW_W = 800;
  const VIEW_H = 600;
  const SPEED = 6;
  const SHIP_W = 50;
  const SHIP_H = 40;

  let x = VIEW_W / 2;
  let y = VIEW_H - 80;
  let dx = 0;
  let dy = 0;
  let el = null;
  let engineEls = [];

  const keys = {};

  function createSVG() {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'ship-group');
    g.setAttribute('id', 'ship');

    // Ship body - spaceship shape
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('class', 'ship-body');
    path.setAttribute('d', 'M0,-20 L25,15 L15,10 L0,20 L-15,10 L-25,15 Z');
    g.appendChild(path);

    // Engine glow
    const engine = document.createElementNS(SVG_NS, 'ellipse');
    engine.setAttribute('class', 'ship-engine');
    engine.setAttribute('cx', '0');
    engine.setAttribute('cy', '18');
    engine.setAttribute('rx', '6');
    engine.setAttribute('ry', '8');
    g.appendChild(engine);
    engineEls.push(engine);

    // Engine flame
    const flame = document.createElementNS(SVG_NS, 'polygon');
    flame.setAttribute('class', 'ship-engine-flame');
    flame.setAttribute('points', '-4,18 4,18 0,30');
    flame.setAttribute('id', 'ship-flame');
    g.appendChild(flame);

    return g;
  }

  function mount(parent) {
    el = createSVG();
    parent.appendChild(el);
    updatePosition();
  }

  function updatePosition() {
    if (!el) return;
    el.setAttribute('transform', `translate(${x},${y})`);
  }

  function update() {
    if (dx !== 0) x += dx * SPEED;
    if (dy !== 0) y += dy * SPEED;

    // Clamp to viewport (with margin)
    x = Math.max(25, Math.min(VIEW_W - 25, x));
    y = Math.max(VIEW_H - 180, Math.min(VIEW_H - 40, y));

    updatePosition();

    // Engine flame animation
    const flame = document.getElementById('ship-flame');
    if (flame && (dx !== 0 || dy !== 0)) {
      const flicker = 25 + Math.random() * 8;
      flame.setAttribute('points', `-4,18 4,18 0,${flicker}`);
    }
  }

  function setKey(key, pressed) {
    keys[key] = pressed;
    dx = 0;
    dy = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) dx = -1;
    if (keys['ArrowRight'] || keys['KeyD']) dx = 1;
    if (keys['ArrowUp'] || keys['KeyW']) dy = -1;
    if (keys['ArrowDown'] || keys['KeyS']) dy = 1;
  }

  function getPosition() {
    return { x, y };
  }

  function getX() { return x; }
  function getY() { return y; }

  function resetPos() {
    x = VIEW_W / 2;
    y = VIEW_H - 80;
    updatePosition();
  }

  return { mount, update, setKey, getPosition, getX, getY, resetPos };
})();
