/* HOME — the opening board, hero entrance, one-night pinned story, system accordion */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = typeof gsap !== 'undefined' ? gsap : null;

  /* ---------- build the dartboard (20 segments × 4 rings + bull) ---------- */
  const svg = $('.h-board');
  const order = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const segs = [];
  if (svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const arc = (r0, r1, a0, a1) => {
      const p = (r, a) => [r * Math.sin(a), -r * Math.cos(a)].map(v => v.toFixed(2)).join(' ');
      return `M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z`;
    };
    const rings = [[16, 58], [58, 66], [66, 96], [96, 104]]; // inner single, triple, outer single, double
    order.forEach((num, i) => {
      const a0 = (i - .5) * Math.PI / 10, a1 = (i + .5) * Math.PI / 10;
      rings.forEach((r, k) => {
        const el = document.createElementNS(NS, 'path');
        el.setAttribute('d', arc(r[0], r[1], a0, a1));
        el.setAttribute('class', 'seg'); el.dataset.i = i; el.dataset.k = k;
        svg.appendChild(el); segs.push(el);
      });
    });
    const c = (r, cls) => { const e = document.createElementNS(NS, 'circle'); e.setAttribute('r', r); e.setAttribute('class', cls); svg.appendChild(e); return e; };
    c(106, 'ring'); const bo = c(16, 'bull-o'); const bi = c(7, 'bull-i');
    const dart = document.createElementNS(NS, 'g'); dart.innerHTML = '<line class="dart" x1="0" y1="0" x2="34" y2="-30"/><path class="flight" d="M34 -30 l14 -4 l-6 14z"/>'; dart.style.opacity = 0; svg.appendChild(dart);
    svg._bull = [bo, bi]; svg._dart = dart;
  }

  /* ---------- opening sequence (once per session) ---------- */
  const hero = $('.h-hero'), intro = $('.h-intro'), ins = $$('.h-in');
  const seen = (() => { try { return sessionStorage.getItem('dm-intro') === '1'; } catch (e) { return false; } })();
  const showHero = (instant) => {
    if (!G || instant) { ins.forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }
    G.fromTo(ins, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .09 });
    G.fromTo('.h-hero-media', { scale: 1.06 }, { scale: 1, duration: 1.2, ease: 'expo.out' });
  };
  if (!G || reduce || seen || !intro) {
    hero && hero.classList.add('no-intro'); showHero(!G || reduce);
  } else {
    G.set(ins, { opacity: 0 });
    const tl = G.timeline({ defaults: { ease: 'power2.out' }, onComplete: () => { try { sessionStorage.setItem('dm-intro', '1'); } catch (e) {} } });
    // segments light clockwise from 20
    for (let i = 0; i < 20; i++) {
      const group = segs.filter(s => +s.dataset.i === i);
      tl.call(() => group.forEach(s => s.classList.add(+s.dataset.k % 2 ? 'lit-b' : (i % 2 ? 'lit-c' : 'lit-a'))), null, .08 + i * .045);
    }
    tl.to(svg._bull, { fill: '#E46A58', duration: .25 }, 1.05)
      .fromTo(svg._dart, { opacity: 0, x: 120, y: -110, scale: 1.6 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: .32, ease: 'power4.in' }, 1.15)
      .to(svg, { scale: 1.04, duration: .08, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, 1.47)
      .to(intro, { opacity: 0, duration: .9, ease: 'power2.inOut' }, 1.75)
      .to(svg, { scale: 3.2, duration: 1.1, ease: 'power3.in', transformOrigin: '50% 50%' }, 1.7)
      .call(() => { intro.style.display = 'none'; }, null, 2.7)
      .call(() => showHero(false), null, 1.9);
  }

  /* hero video: fade in once it can play */
  const hv = $('.h-hero-video');
  if (hv) { const rdy = () => hv.classList.add('ready'); if (!hv.paused && hv.readyState > 2) rdy(); ['playing', 'timeupdate'].forEach(ev => hv.addEventListener(ev, rdy, { once: true })); }

  /* ---------- one night (pinned) — one scrubbed timeline (Astra meeting 2) ---------- */
  const night = $('.h-night');
  if (night && G && typeof ScrollTrigger !== 'undefined' && !reduce) {
    const imgs = $$('.h-night-img', night), steps = $$('.h-night-steps li', night), bars = $$('.h-night-clock i', night);
    const memory = $('.h-night-memory', night), stage = $('.h-night-stage', night);
    const tints = ['var(--orange)', 'var(--yellow)', 'var(--pink)', 'var(--violet)'];
    steps.forEach((s, i) => s.style.setProperty('--tint', tints[i]));
    bars.forEach((b, i) => b.style.setProperty('--c', tints[i]));
    G.set(imgs, { opacity: 0 }); G.set(imgs[0], { opacity: 1 }); G.set(bars, { '--f': 0 });
    G.set(steps, { opacity: 0, y: 12 }); G.set(steps[0], { opacity: 1, y: 0 });
    imgs.forEach(im => G.set(im.firstElementChild, { scale: 1.08 }));
    const wide = matchMedia('(min-width: 735px)').matches;
    const tl = G.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: night, start: 'top top', end: () => '+=' + innerHeight * (wide ? 3.6 : 3), pin: true, scrub: .5, anticipatePin: 1, invalidateOnRefresh: true } });
    const HOLD = 1, X = .25;
    imgs.forEach((im, i) => {
      const t = i * (HOLD + X);
      tl.to(im.firstElementChild, { scale: 1.02, duration: HOLD + X }, t);
      tl.to(bars[i], { '--f': 1, duration: HOLD + X }, t);
      if (i < imgs.length - 1) {
        tl.to(imgs[i + 1], { opacity: 1, duration: X }, t + HOLD)
          .to(im, { opacity: 0, duration: X }, t + HOLD)
          .to(steps[i], { opacity: 0, y: -12, duration: X * .45 }, t + HOLD)
          .fromTo(steps[i + 1], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: X * .5 }, t + HOLD + X * .5);
      }
    });
    if (wide && memory) { // "Take the night with you": the last scene shrinks into a card, the app appears
      const t = imgs.length * (HOLD + X);
      tl.to('.h-night-copy', { opacity: 0, y: -20, duration: .3 }, t)
        .to(stage, { scale: .5, borderRadius: 28, x: '-12vw', duration: .8, ease: 'power1.inOut' }, t)
        .to('.h-night-shade', { opacity: .35, duration: .8 }, t)
        .fromTo(memory, { opacity: 0, yPercent: -50, y: 24 }, { opacity: 1, yPercent: -50, y: 0, duration: .5 }, t + .3)
        .to({}, { duration: .4 });
      G.set(stage, { overflow: 'hidden' });
    } else if (memory) { // phone: the scene steps back into a card and the app rises in front of it
      const t = imgs.length * (HOLD + X);
      tl.to('.h-night-copy', { opacity: 0, y: -16, duration: .3 }, t)
        .to('.h-night-clock', { opacity: 0, duration: .3 }, t)
        .to(stage, { scale: .84, y: '-9vh', borderRadius: 24, duration: .8, ease: 'power1.inOut' }, t)
        .to('.h-night-shade', { opacity: .3, duration: .8 }, t)
        .fromTo(memory, { opacity: 0, xPercent: -50, yPercent: -50, y: 60 }, { opacity: 1, xPercent: -50, yPercent: -50, y: 0, duration: .55 }, t + .3)
        .to({}, { duration: .4 });
      G.set(stage, { overflow: 'hidden' });
    }
  } else if (night) { night.classList.add('h-night--static'); }

  /* ---------- system accordion: hover/focus/tap opens ---------- */
  const items = $$('.h-acc-item');
  items.forEach(it => {
    const open = () => items.forEach(x => x.classList.toggle('is-open', x === it));
    it.addEventListener('mouseenter', open); it.addEventListener('focus', open);
  });
  /* reviews (brief) */
  const rv = document.querySelector('[data-hrev]');
  if (rv) { const sl = [...rv.querySelectorAll('.h-rev')]; let i = 0, t; const go = k => { i = (k + sl.length) % sl.length; sl.forEach((x, j) => x.classList.toggle('on', j === i)); };
    rv.querySelector('[data-p]').addEventListener('click', () => { go(i - 1); clearInterval(t); }); rv.querySelector('[data-n]').addEventListener('click', () => { go(i + 1); clearInterval(t); });
    if (!reduce) t = setInterval(() => go(i + 1), 6500); }
});