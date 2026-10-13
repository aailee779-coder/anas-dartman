/* VERSION B — mega menus, mobile menu, sticky sub-nav, review slider, feature chips, form */
document.addEventListener('DOMContentLoaded', () => {
  const d = document, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = () => matchMedia('(min-width: 1101px)').matches;

  /* mega menus: hover on desktop, tap anywhere */
  const hd = $('[data-bhd]'), items = $$('.bmenu > li').filter(li => $('.bmega', li));
  const close = except => items.forEach(li => { if (li !== except) { li.classList.remove('open'); $('button', li).setAttribute('aria-expanded', 'false'); } });
  items.forEach(li => {
    const b = $('button', li); let t;
    b.addEventListener('click', () => { const o = !li.classList.contains('open'); close(li); li.classList.toggle('open', o); b.setAttribute('aria-expanded', o); });
    li.addEventListener('mouseenter', () => { if (!desk()) return; clearTimeout(t); close(li); li.classList.add('open'); b.setAttribute('aria-expanded', 'true'); });
    li.addEventListener('mouseleave', () => { if (!desk()) return; t = setTimeout(() => { li.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }, 140); });
  });
  d.addEventListener('click', e => { if (!e.target.closest('.bmenu')) close(); });
  d.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); hd && hd.classList.remove('mopen'); } });
  const burger = $('[data-bburger]');
  burger && burger.addEventListener('click', () => { const o = hd.classList.toggle('mopen'); burger.setAttribute('aria-expanded', o); d.body.style.overflow = o ? 'hidden' : ''; });
  $$('.bmenu a').forEach(a => a.addEventListener('click', () => { hd.classList.remove('mopen'); d.body.style.overflow = ''; close(); }));

  /* sticky sub-nav: highlight the section in view */
  $$('.bsubnav').forEach(nav => {
    const links = $$('a[href^="#"]:not(.bb)', nav), secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const upd = () => {
      let cur = null; secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s; });
      links.forEach(a => { const on = cur && a.getAttribute('href') === '#' + cur.id; a.classList.toggle('on', !!on); if (on && nav.scrollWidth > nav.clientWidth) a.scrollIntoView({ block: 'nearest', inline: 'center' }); });
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  });

  /* review slider */
  $$('[data-brev]').forEach(r => {
    const slides = $$('.brev-slide', r), n = $('.brev-nav span', r); let i = 0, t;
    const go = k => { i = (k + slides.length) % slides.length; slides.forEach((s, j) => s.classList.toggle('on', j === i)); if (n) n.textContent = (i + 1) + ' / ' + slides.length; };
    $('[data-prev]', r).addEventListener('click', () => { go(i - 1); clearInterval(t); });
    $('[data-next]', r).addEventListener('click', () => { go(i + 1); clearInterval(t); });
    go(0); if (!reduce) t = setInterval(() => go(i + 1), 7000);
  });

  /* feature chips under the video (Party Game Modes · Highlight Moment Capture · Dynamic LED Experience) */
  $$('[data-bchips]').forEach(w => {
    const btns = $$('button', w), p = $('.bchip-p', w.parentElement), v = $('video', w.parentElement);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-selected', x === b));
      if (p) p.textContent = b.dataset.text;
      if (v && b.dataset.src && !v.src.endsWith(b.dataset.src)) { v.src = b.dataset.src; v.poster = b.dataset.poster || ''; v.play().catch(() => {}); }
    }));
  });

  /* forms are not connected yet: say so honestly */
  $$('form[data-endpoint="to-connect"]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); f.classList.add('sent'); }));
});

/* hero video fades in over the poster once it plays */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.bhero > video').forEach(v => { const r = () => v.classList.add('is-ready'); if (v.readyState > 2) r(); ['playing', 'canplay'].forEach(e => v.addEventListener(e, r, { once: true })); });
});
