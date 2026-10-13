/* VERSION A extras: before/after slider, install-film chapters */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-uaba]').forEach(b => {
    const r = b.querySelector('input[type=range]');
    const set = () => b.style.setProperty('--p', r.value + '%');
    r.addEventListener('input', set); set();
    // a gentle hint the first time it scrolls into view
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let t0; const run = t => { t0 = t0 || t; const k = Math.min(1, (t - t0) / 1600); r.value = 50 + Math.sin(k * Math.PI * 2) * 22; set(); if (k < 1) requestAnimationFrame(run); else { r.value = 50; set(); } };
      requestAnimationFrame(run); }, { threshold: .6 });
    io.observe(b);
  });
  document.querySelectorAll('[data-uach]').forEach(c => {
    const v = c.closest('figure').querySelector('video');
    c.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      const go = () => { v.currentTime = +btn.dataset.t; v.play().catch(() => {}); };
      if (v.readyState >= 1) go(); else { v.preload = 'auto'; v.load(); v.addEventListener('loadedmetadata', go, { once: true }); }
      c.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === btn));
    }));
  });
});
