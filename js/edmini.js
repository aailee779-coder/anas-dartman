/* EDmini Max page — inside-stage states, ecosystem accordion, film lightbox.
   Shared behaviours (pin, steps, reveals, tabs, finish picker, rail, counters) come from site.js. */
document.addEventListener('DOMContentLoaded', () => {
  const d = document, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---------- hero video fades in over the poster once it can play ---------- */
  $$('.em-hero video').forEach(v => {
    const ready = () => v.classList.add('is-ready');
    if (v.readyState >= 3) ready(); else v.addEventListener('canplay', ready, { once: true });
  });

  /* ---------- Inside EDmini: map site.js step index → stage state ---------- */
  const pin = $('[data-inside]');
  if (pin) {
    const hs = $$('.em-hs li', pin), steps = $$('.em-in-step', pin), last = steps.length - 1;
    const openAt = last - 1, filmVid = $('.em-in-film video', pin);
    if (reduce || !hasG) {
      pin.classList.add('static');
      hs.forEach(h => h.classList.add('on'));
    } else {
      let cur = -1;
      const apply = i => {
        if (i === cur) return; cur = i;
        hs.forEach(h => { const k = +h.dataset.k; h.classList.toggle('on', k <= i && i < last); h.classList.toggle('cur', k === i); });
        pin.classList.toggle('is-open', i === openAt);
        pin.classList.toggle('is-film', i === last);
        if (filmVid) { if (i === last) filmVid.play().catch(() => {}); else filmVid.pause(); }
      };
      apply(+(pin.dataset.step || 0));
      new MutationObserver(() => apply(+(pin.dataset.step || 0))).observe(pin, { attributes: true, attributeFilter: ['data-step'] });
    }
  }

  /* ---------- ecosystem accordion (one open at a time) ---------- */
  $$('[data-acc]').forEach(acc => {
    const panels = $$('[data-acc-panel]', acc);
    const open = p => panels.forEach(x => { const on = x === p; x.classList.toggle('is-open', on); $('.em-acc-b', x).setAttribute('aria-expanded', on); });
    panels.forEach(p => {
      const b = $('.em-acc-b', p);
      b.addEventListener('click', () => open(p));
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) p.addEventListener('mouseenter', () => open(p));
    });
  });


  /* ---------- compare: one model at a time on phones (segmented switch) ---------- */
  const cg = $('.cp-grid');
  if (cg) {
    const cols = [...cg.children], sw = d.createElement('div');
    sw.className = 'cp-switch'; sw.setAttribute('role', 'tablist'); sw.setAttribute('aria-label', 'Choose a model');
    const pick = i => { cols.forEach((c, j) => c.classList.toggle('cp-on', j === i)); $$('button', sw).forEach((b, j) => b.setAttribute('aria-selected', j === i)); sw.style.setProperty('--i', i); };
    cols.forEach((c, i) => { const b = d.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = $('.card-t', c).textContent.replace('EDmini ', ''); b.addEventListener('click', () => pick(i)); sw.appendChild(b); });
    sw.insertAdjacentHTML('afterbegin', '<i aria-hidden="true"></i>');
    cg.before(sw); pick(0);
  }

  /* installation film chapters */
  const inst = $('[data-install]');
  if (inst) {
    const v = $('video', inst), chs = $$('[data-t]', inst);
    const seek = t => { const go = () => { v.currentTime = t; v.muted = false; v.play().catch(() => {}); }; if (v.readyState >= 1) go(); else { v.preload = 'auto'; v.addEventListener('loadedmetadata', go, { once: true }); v.load(); } };
    chs.forEach(b => b.addEventListener('click', () => seek(+b.dataset.t)));
    v.addEventListener('timeupdate', () => { let cur = 0; chs.forEach((b, i) => { if (v.currentTime >= +b.dataset.t - .2) cur = i; }); chs.forEach((b, i) => b.classList.toggle('on', i === cur)); });
  }
  /* sticky buy bar after the hero */
  const bar = $('[data-em-bar]'), hero = $('.em-hero');
  if (bar && hero) new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', !on); }).observe(hero);

  if (hasG) addEventListener('load', () => ScrollTrigger.refresh());
});
