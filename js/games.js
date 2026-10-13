/* /games/ — filters, crosshair cursor, aim & throw picker. Pure DOM; GSAP only for gentle card entrances. */
document.addEventListener('DOMContentLoaded', () => {
  const d = document, wall = d.querySelector('[data-wall]');
  if (!wall) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasG = typeof gsap !== 'undefined';
  const cards = [...wall.querySelectorAll('.gm-card')];
  const live = d.querySelector('[data-throw-live]');
  const sec = wall.closest('section');

  /* ---------- filters ---------- */
  const btns = [...d.querySelectorAll('[data-filter]')];
  btns.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    btns.forEach(x => x.setAttribute('aria-pressed', x === b));
    clearHit();
    const shown = [];
    cards.forEach(c => { const on = f === 'all' || c.dataset.cat.split(' ').includes(f); c.hidden = !on; if (on) shown.push(c); });
    if (hasG && !reduce) gsap.fromTo(shown, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out', stagger: .025, overwrite: true });
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }));

  /* ---------- crosshair cursor (desktop) ---------- */
  if (fine && !reduce) {
    const cross = d.createElement('div');
    cross.className = 'gm-cross'; cross.setAttribute('aria-hidden', 'true');
    cross.innerHTML = '<svg viewBox="-28 -28 56 56" fill="none" stroke="currentColor" stroke-width="1.6"><circle r="16"/><circle class="c2" r="4"/><path d="M0-27v9M0 18v9M-27 0h9M18 0h9" stroke-linecap="round"/></svg>';
    d.body.appendChild(cross);
    wall.classList.add('has-cross');
    let x = 0, y = 0, raf = 0;
    const draw = () => { cross.style.transform = `translate3d(${x}px,${y}px,0)`; raf = 0; };
    wall.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(draw); cross.classList.toggle('lock', !!e.target.closest('.gm-card')); });
    wall.addEventListener('pointerenter', () => cross.classList.add('on'));
    wall.addEventListener('pointerleave', () => cross.classList.remove('on', 'lock'));
    wall.addEventListener('pointerdown', () => { cross.classList.remove('fire'); void cross.offsetWidth; cross.classList.add('fire'); });
  }

  /* ---------- aim & throw ---------- */
  const reticle = d.querySelector('[data-reticle]');
  const throwBtn = d.querySelector('[data-throw]');
  function clearHit() { cards.forEach(c => c.classList.remove('is-hit')); }
  const centerOf = el => { const r = el.getBoundingClientRect(), s = sec.getBoundingClientRect(); return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height * .38 }; };
  const name = c => c.querySelector('.gm-name').textContent;
  let last = null;

  throwBtn && throwBtn.addEventListener('click', () => {
    let pool = cards.filter(c => !c.hidden);
    if (pool.length > 1 && last) pool = pool.filter(c => c !== last);
    if (!pool.length) return;
    clearHit();
    const target = pool[Math.floor(Math.random() * pool.length)]; last = target;
    const finish = () => {
      target.classList.add('is-hit');
      if (live) live.textContent = `Your dart landed on ${name(target)}.`;
      throwBtn.removeAttribute('aria-busy');
    };
    if (reduce || !hasG) { target.scrollIntoView({ block: 'center' }); finish(); return; }

    throwBtn.setAttribute('aria-busy', 'true');
    // bring the wall into view first, then aim
    const wr = wall.getBoundingClientRect();
    if (wr.top > innerHeight * .5 || wr.bottom < innerHeight * .5) {
      const top = scrollY + wr.top - 140;
      if (window.__lenis) window.__lenis.scrollTo(top, { duration: .8 }); else scrollTo({ top, behavior: 'smooth' });
    }
    setTimeout(() => {
      // hop across a few cards that are on screen, then land on the target
      const visible = pool.filter(c => { const r = c.getBoundingClientRect(); return r.bottom > 80 && r.top < innerHeight - 40; });
      const hops = [];
      for (let i = 0; i < 5 && visible.length; i++) hops.push(visible[Math.floor(Math.random() * visible.length)]);
      const tr = target.getBoundingClientRect();
      if (tr.top < 100 || tr.bottom > innerHeight - 20) {
        const top = scrollY + tr.top - innerHeight / 2 + tr.height / 2;
        if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1 }); else scrollTo({ top, behavior: 'smooth' });
      }
      const start = hops[0] ? centerOf(hops[0]) : centerOf(target);
      gsap.set(reticle, { x: start.x, y: start.y, scale: 1.6, opacity: 0 });
      const tl = gsap.timeline({ onComplete: () => { reticle.classList.remove('land'); void reticle.offsetWidth; reticle.classList.add('land'); finish(); gsap.to(reticle, { opacity: 0, scale: .6, duration: .5, delay: .7, ease: 'power2.in' }); } });
      tl.to(reticle, { opacity: 1, scale: 1, duration: .25, ease: 'power2.out' });
      hops.slice(1).forEach(h => tl.to(reticle, { x: () => centerOf(h).x, y: () => centerOf(h).y, duration: .2, ease: 'power2.inOut' }));
      tl.to(reticle, { x: () => centerOf(target).x, y: () => centerOf(target).y, duration: .5, ease: 'expo.out' });
      tl.to(reticle, { scale: .7, duration: .12, ease: 'power3.in' }).to(reticle, { scale: 1, duration: .3, ease: 'back.out(3)' });
    }, 420);
  });
});
