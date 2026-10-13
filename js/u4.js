/* VERSION B · Space (Ultra 4 layout): highlights gallery, product viewer, card rails, upgrade picker, dialogs, soft reveals */
document.addEventListener('DOMContentLoaded', () => {
  const d = document, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* local nav turns light over light sections, like apple.com */
  const ln = $('.u-ln'), lights = $$('.u-white,.u-light,.u-idx,.u-notes,footer');
  const lnUpd = () => { if (!ln) return; const y = ln.getBoundingClientRect().bottom - 2; ln.classList.toggle('lt', lights.some(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; })); };
  addEventListener('scroll', lnUpd, { passive: true }); lnUpd();

  /* global nav hides on scroll down and comes back on scroll up (so other pages are always one tap away) */
  const gh = $('.bhd');
  if (gh) { let ly = scrollY; const gUpd = () => { const y = scrollY, open = gh.classList.contains('mopen');
      const hide = !open && y > 160 && y > ly + 2, show = open || y < 160 || y < ly - 2;
      if (hide) { gh.classList.add('gn-hide'); d.body.classList.remove('gn-on'); }
      else if (show) { gh.classList.remove('gn-hide'); d.body.classList.toggle('gn-on', y > 48); }
      ly = y; };
    addEventListener('scroll', () => requestAnimationFrame(gUpd), { passive: true }); gUpd(); }

  /* phone: give every sticky-screen step its own screen image */
  $$('[data-usoft]').forEach(w => { const ims = $$('.u-dev-scr img', w); $$('.u-step', w).forEach((st, k) => { const im = ims[k]; if (!im) return; const f = d.createElement('div'); f.className = 'u-step-im'; const c = im.cloneNode(); c.classList.remove('on'); c.loading = 'lazy'; f.appendChild(c); st.prepend(f); }); });

  /* soft rise on scroll */
  const rise = $$('.u-sec :is(.u-h48,.u-h40,.u-h56,.u-h64,.u-h80,.u-eb,.u-p21,.u-p17,.u-box,.u-trio,.u-split,.u-go-im,.u-icons li,.u-env-grid li,.u-val-grid li,.u-cmp-card,.u-full)');
  rise.forEach(el => el.setAttribute('data-u', ''));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  rise.forEach(el => io.observe(el));

  /* highlights gallery: dots with progress, autoplay, pause */
  $$('[data-ugal]').forEach(g => {
    const track = $('.u-gal-track', g), slides = $$('.u-slide', g), dots = $('.u-dots', g), play = $('.u-play', g);
    let i = 0, t, paused = reduce, inView = false;
    slides.forEach((_, k) => { const b = d.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Highlight ' + (k + 1)); b.innerHTML = '<i></i>'; b.onclick = () => { go(k, true); }; dots.appendChild(b); });
    const btns = $$('button', dots);
    const mark = k => btns.forEach((b, j) => { b.classList.toggle('on', j === k); const ii = $('i', b); ii.style.animation = 'none'; ii.offsetWidth; ii.style.animation = ''; });
    const go = (k, user) => { i = (k + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' }); mark(i); if (user) restart(); };
    const restart = () => { clearInterval(t); if (!paused && inView) t = setInterval(() => go(i + 1), 5000); };
    play.onclick = () => { paused = !paused; g.classList.toggle('paused', paused); play.setAttribute('aria-label', paused ? 'Play' : 'Pause'); restart(); };
    g.classList.toggle('paused', paused);
    let st; track.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { const k = Math.round(track.scrollLeft / (slides[1].offsetLeft - slides[0].offsetLeft)); if (k !== i) { i = k; mark(i); restart(); } }, 120); }, { passive: true });
    new IntersectionObserver(es => { inView = es[0].isIntersecting; if (inView) { mark(i); } restart(); }, { threshold: .4 }).observe(g);
    mark(0);
  });

  /* product viewer */
  $$('[data-upv]').forEach(v => {
    const items = $$('.u-pv-list li', v), imgs = $$('.u-pv-imgs img', v);
    items.forEach(li => $('button', li).addEventListener('click', () => {
      items.forEach(x => x.classList.toggle('open', x === li));
      imgs.forEach(im => im.classList.toggle('on', im.dataset.k === li.dataset.k));
    }));
  });

  /* marquee rails: duplicate the cards once so the loop is seamless */
  $$('[data-umarq]').forEach(m => {
    const tr = $('.u-cards-track', m), items = [...tr.children];
    items.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.appendChild(c); });
    tr.style.setProperty('--dur', (items.length * 7) + 's');
  });

  /* card rails with arrows */
  $$('[data-ucards]').forEach(c => { if (c.classList.contains('u-fit')) return;
    const tr = $('.u-cards-track', c), prev = $('[data-prev]', c), next = $('[data-next]', c);
    const step = () => { const li = $('li', tr); return li ? li.getBoundingClientRect().width + 20 : 300; };
    const upd = () => { prev.disabled = tr.scrollLeft < 8; next.disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 8; };
    prev.onclick = () => tr.scrollBy({ left: -step(), behavior: 'smooth' });
    next.onclick = () => tr.scrollBy({ left: step(), behavior: 'smooth' });
    tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  /* install clips play while visible */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !reduce) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .5 });
  $$('video[data-uvid]').forEach(v => vio.observe(v));

  /* compare rows: one icon per column */
  $$('.u-cmp-r').forEach(r => { const ic = $('svg', r); if (ic) $$('span', r).forEach(s => s.prepend(ic.cloneNode(true))); });

  /* upgrade picker */
  $$('[data-uup]').forEach(u => { const s = $('select', u); s.addEventListener('change', () => $$('.u-up-grid', u).forEach(g => { g.hidden = g.dataset.set !== s.value; })); });

  /* worth it: segmented switch */
  $$('[data-uup2]').forEach(u => {
    const seg = $('.u-seg', u), bs = $$('.u-seg button', u);
    bs.forEach((b, k) => b.addEventListener('click', () => {
      bs.forEach(x => x.setAttribute('aria-selected', x === b)); seg.classList.toggle('r', k === 1);
      $$('[data-set]', u).forEach(el => { if (el.tagName !== 'BUTTON') el.classList.toggle('on', el.dataset.set === b.dataset.set); });
    }));
  });

  /* dialogs */
  $$('[data-uopen]').forEach(a => a.addEventListener('click', e => { const dl = d.getElementById(a.dataset.uopen); if (dl && dl.showModal) { e.preventDefault(); dl.showModal(); } }));
  $$('.u-dlg').forEach(dl => { $('[data-uclose]', dl).onclick = () => dl.close(); dl.addEventListener('click', e => { if (e.target === dl) dl.close(); }); });
  if (location.hash && /^#u-(quote|dist|faq)$/.test(location.hash)) { const dl = $(location.hash); dl && dl.showModal(); }

  /* 360 turntable: scroll progress -> frame, callouts and dial */
  $$('[data-uturn]').forEach(sec => {
    const cv = $('canvas', sec), ctx = cv.getContext('2d'), n = +cv.dataset.count, tpl = cv.dataset.frames;
    const cs = $$('.u-turn-c', sec), dial = $('.u-turn-dial', sec), ring = $('circle.p', dial), deg = $('span', dial);
    const imgs = []; let last = -1, want = 0, loaded = false;
    const src = i => tpl.replace('{i}', String(i + 1).padStart(3, '0'));
    const draw = i => { const im = imgs[i]; if (!im || !im.complete || !im.naturalWidth) return false; ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(im, 0, 0, cv.width, cv.height); last = i; return true; };
    const load = () => { if (loaded) return; loaded = true; for (let i = 0; i < n; i++) { const im = new Image(); im.decoding = 'async'; im.src = src(i); imgs[i] = im; im.onload = () => { if (i === want || last < 0) draw(i === want ? i : want) || draw(i); if (last >= 0) sec.classList.add('ready'); }; } };
    new IntersectionObserver(es => { if (es[0].isIntersecting) load(); }, { rootMargin: '200% 0px' }).observe(sec);
    const upd = () => {
      const r = sec.getBoundingClientRect(), tot = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / tot));
      want = Math.min(n - 1, Math.round(p * (n - 1)));
      if (want !== last) draw(want);
      cs.forEach(c => c.classList.toggle('on', p >= +c.dataset.from && p < +c.dataset.to));
      ring.style.strokeDashoffset = 94.25 * (1 - p); deg.textContent = Math.round(p * 360) + '°';
    };
    addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); addEventListener('resize', upd); upd();
  });

  /* software: the step in the middle of the screen drives the screen */
  $$('[data-usoft]').forEach(w => {
    const steps = $$('.u-step', w), imgs = $$('.u-dev-scr img', w);
    const set = k => { steps.forEach((s, j) => s.classList.toggle('on', j === k)); imgs.forEach((im, j) => im.classList.toggle('on', j === k)); };
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.k); }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io2.observe(s));
  });
});
