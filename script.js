(() => {
  const N = 24, W = 20, H = 320;
  const R = W / (2 * Math.tan(Math.PI / N));
  const can = document.getElementById('can');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rótulo da lata (SVG), esticado ao redor do cilindro
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${N*W}" height="${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f2c"/><stop offset=".55" stop-color="#101a4d"/><stop offset="1" stop-color="#2a1260"/></linearGradient>
  <linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#35e0ff"/><stop offset="1" stop-color="#b46bff"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect y="22" width="100%" height="4" fill="url(#l)"/><rect y="${H-26}" width="100%" height="4" fill="url(#l)"/>
  <path d="M258 70 L216 150 H242 L228 215 L274 125 H246 Z" fill="url(#l)"/>
  <text x="240" y="245" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="800" font-size="30" fill="#fff" letter-spacing="1">CODE ENERGY</text>
  <text x="240" y="272" text-anchor="middle" font-family="monospace" font-size="15" fill="#35e0ff">&lt;/&gt; 250 ml</text>
  <text x="${N*W*0.75}" y="170" text-anchor="middle" font-family="monospace" font-size="16" fill="#ffffff88">ZERO AÇÚCAR</text>
  <text x="${N*W*0.25}" y="170" text-anchor="middle" font-family="monospace" font-size="16" fill="#ffffff88">160 mg CAFEÍNA</text>
  </svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  for (let i = 0; i < N; i++) {
    const s = document.createElement('div');
    s.className = 'slice';
    s.style.backgroundImage = url;
    s.style.backgroundSize = `${N * W}px ${H}px`;
    s.style.backgroundPosition = `${-i * W}px 0`;
    s.style.filter = `brightness(${0.55 + 0.45 * Math.cos((i / N) * 2 * Math.PI - Math.PI * 0)})`; // sombra fixa por fatia
    s.style.transform = `rotateY(${(i * 360) / N}deg) translateZ(${R}px)`;
    can.appendChild(s);
  }
  ['t', 'b'].forEach(c => { const d = document.createElement('div'); d.className = 'cap ' + c; can.appendChild(d); });

  // Rotação e posição ligadas ao scroll
  const scene = document.querySelector('.scene');
  let mx = 0, my = 0, ticking = false;
  const wide = () => innerWidth > 760;
  function update() {
    const max = document.body.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    const rot = reduce ? 20 : p * 1080;
    // posição horizontal: centro → direita → esquerda → centro
    const path = [0, 0.3, -0.3, 0, 0];
    const f = p * (path.length - 1), k = Math.min(Math.floor(f), path.length - 2);
    const x = (path[k] + (path[k + 1] - path[k]) * (f - k)) * (wide() ? innerWidth : 0);
    const scale = 1 + (p < 0.12 ? 0.35 - p * 2.5 : 0.05) * (wide() ? 1 : 0.6);
    scene.style.transform = `translateX(${x}px) scale(${scale}) rotateX(${-8 + my * 8}deg) rotateY(${rot + mx * 14}deg)`;
    ticking = false;
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; req(); });
  update();

  // Revelar seções e contar números
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-to]').forEach(count);
    io.unobserve(e.target);
  }), { threshold: 0.35 });
  document.querySelectorAll('.r').forEach(el => io.observe(el));

  function count(el) {
    const to = +el.dataset.to, t0 = performance.now(), d = 1400;
    const step = t => {
      const q = Math.min((t - t0) / d, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - q, 3)));
      if (q < 1 && !reduce) requestAnimationFrame(step);
      else el.textContent = to;
    };
    requestAnimationFrame(step);
  }
})();
