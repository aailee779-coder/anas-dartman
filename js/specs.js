/* EDmini Max tech specs: dimension lines draw, rows slide in, numbers count, unit switch */
document.addEventListener('DOMContentLoaded', () => {
  const sec = document.querySelector('.em-specs'); if (!sec) return;
  const $$ = s => [...sec.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* unit switch */
  const btns = $$('.sp-units button');
  btns.forEach(b => b.addEventListener('click', () => {
    const unit = b.dataset.unit;
    btns.forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('.u').forEach((el, i) => {
      const v = el.dataset[unit === 'cm' ? 'cm' : 'in']; if (!v || el.textContent === v) return;
      el.classList.remove('flip'); void el.offsetWidth;
      setTimeout(() => { el.textContent = v; el.classList.add('flip'); }, reduce ? 0 : Math.min(i * 18, 260));
    });
  }));

  if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  /* dimension lines draw in, tags pop */
  const lines = $$('.sp-dims line');
  lines.forEach(l => { const len = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value) || 1; l.style.strokeDasharray = 200; l.style.strokeDashoffset = 200; l.dataset.len = len; });
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.sp-visual', start: 'top 75%', once: true } });
  tl.from('.sp-stage img', { opacity: 0, y: 40, scale: .96, duration: 1.1, ease: 'expo.out' })
    .to(lines, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .08 }, .35)
    .from('.sp-tag', { opacity: 0, y: 10, duration: .6, ease: 'power2.out', stagger: .12 }, .9);

  /* rows: line grows, content slides in, numbers count */
  const rows = $$('.sp-row');
  rows.forEach(r => r.style.setProperty('--line', 0));
  gsap.set(rows.map(r => r.children), { opacity: 0, x: 28 });
  ScrollTrigger.batch(rows, {
    start: 'top 88%', once: true,
    onEnter: batch => batch.forEach((r, i) => {
      gsap.to(r, { '--line': 1, duration: .9, ease: 'expo.out', delay: i * .07 });
      gsap.to(r.children, { opacity: 1, x: 0, duration: .8, ease: 'expo.out', stagger: .06, delay: i * .07 + .05 });
      const b = r.querySelector('dd b'); if (!b) return;
      const tn = [...b.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent)) || (b.querySelector('.u') && b.querySelector('.u').firstChild);
      if (!tn || !/^\D*\d+(\.\d+)?/.test(tn.textContent)) return;
      const txt = tn.textContent, m = txt.match(/\d+(\.\d+)?/), to = parseFloat(m[0]), dec = (m[1] || '').length ? m[1].length - 1 : 0, o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.2, ease: 'power3.out', delay: i * .07, onUpdate: () => { tn.textContent = txt.replace(m[0], o.v.toFixed(dec)); }, onComplete: () => { tn.textContent = txt; } });
    })
  });
});
