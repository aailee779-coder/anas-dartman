/* /software/ — sticky pill nav state, phone fan spread, EDhub chips by pin progress. */
document.addEventListener('DOMContentLoaded', () => {
  const d = document, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = $('.gnav'), pills = $('.sw-pills'), fan = $('[data-fan]'), hub = $('.sw-hub-pin'), chips = $$('.sw-chips li');
  const links = pills ? $$('.sw-pill', pills) : [];
  const secs = links.map(a => $(a.getAttribute('href')));

  let ticking = false;
  const upd = () => {
    ticking = false;
    const navH = nav ? nav.offsetHeight : 48;
    if (pills) {
      const top = pills.getBoundingClientRect().top;
      pills.classList.toggle('is-stuck', top <= navH + 1);
      const y = innerHeight * .4; let cur = -1;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < y) cur = i; });
      links.forEach((a, i) => { const on = i === cur; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
      const under = d.elementsFromPoint(innerWidth / 2, navH + pills.offsetHeight + 2).find(e => e.closest('[data-theme]') && !e.closest('.sw-pills'));
      pills.classList.toggle('is-light', !!under && under.closest('[data-theme]').dataset.theme !== 'dark');
    }
    if (fan) {
      const r = fan.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .9 + r.height * .3)));
      fan.style.setProperty('--spread', (p * p * (3 - 2 * p)).toFixed(3));
    }
    if (hub && chips.length) {
      const p = reduce ? 1 : parseFloat(hub.style.getPropertyValue('--p')) || 0;
      const step = Math.min(3, Math.floor(p * 4 * .9999));
      chips.forEach(c => c.classList.toggle('on', reduce || +c.dataset.at <= step));
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  upd();

  // inert store buttons until links are confirmed
  $$('.sw-store[aria-disabled=true]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
});
