/* DARTMAN motion engine — shared behaviours driven by data-attributes.
   Requires /vendor/gsap.min.js, ScrollTrigger.min.js, SplitText.min.js, lenis.min.js (loaded in layout).
   Everything degrades: no JS → static page; prefers-reduced-motion → no scrubbing, posters instead of video.

   API (use on any page):
   [data-reveal]              fade+rise linked to scroll (Apple style). data-reveal="fade" = no rise. data-delay="0.1"
   [data-split]               headline lines rise from a mask once in view
   [data-scrub-text]          grey paragraph whose words light up to --ink as you scroll through it
   [data-count="27"]          counts up once in view (data-suffix, data-prefix, data-decimals)
   video[data-autoplay]       plays muted when in view, pauses when out; pair with .vctrl button[data-vctrl] inside same .media
   [data-expand]              media card grows from inset/rounded to full-bleed while scrolling past
   [data-parallax="0.15"]     element drifts vertically with scroll
   [data-pin] + children [data-step]   pinned stage; steps fade in/out by progress; sets --p (0–1) on the pin
   [data-sequence]            canvas image sequence scrubbed by scroll: data-frames="url-with-{i}" data-count="120" data-pad="3"
   [data-finish]              finish picker: buttons [data-finish-btn="black"] swap [data-finish-img="black"] and set data-active
   [data-tabs]                tabs: [role=tab][aria-controls] + [role=tabpanel]
   [data-rail]                horizontal rail + .rail-ctrl buttons (prev/next)
   [data-theme] sections      the global nav flips light/dark to match the section under it
*/
(function () {
  const d = document, w = window;
  d.documentElement.classList.add('js');
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasG = typeof gsap !== 'undefined';

  /* ---------- global nav: glass + theme flip + burger ---------- */
  const nav = $('.gnav');
  if (nav) {
    const burger = $('.burger', nav);
    burger && burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); d.body.style.overflow = o ? 'hidden' : ''; });
    const setNav = () => {
      nav.classList.toggle('is-glass', scrollY > 8);
      const y = nav.offsetHeight / 2; let theme = 'dark';
      const el = d.elementsFromPoint(innerWidth / 2, y).find(e => e.closest('[data-theme]') && !e.closest('.gnav') && !e.closest('.curtain'));
      if (el) theme = el.closest('[data-theme]').dataset.theme;
      nav.classList.toggle('is-light', theme !== 'dark');
    };
    addEventListener('scroll', setNav, { passive: true }); addEventListener('resize', setNav); setNav();
  }
  /* local nav: stuck state + section highlight */
  $$('.lnav').forEach(ln => {
    const sentinel = d.createElement('div'); sentinel.style.cssText = 'position:absolute;height:1px;width:1px;margin-top:-1px';
    ln.before(sentinel);
    new IntersectionObserver(([e]) => ln.classList.toggle('is-stuck', !e.isIntersecting), { rootMargin: `-${(nav ? nav.offsetHeight : 0) + 1}px 0px 0px 0px` }).observe(sentinel);
    const links = $$('.lnav-links a[href^="#"]', ln);
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const upd = () => {
      const y = innerHeight * .35; let cur = null;
      secs.forEach(s => { if (s.getBoundingClientRect().top < y) cur = s; });
      links.forEach(a => a.classList.toggle('on', cur && a.getAttribute('href') === '#' + cur.id));
      const under = d.elementsFromPoint(innerWidth / 2, (nav ? nav.offsetHeight : 0) + ln.offsetHeight + 2).find(e => e.closest('[data-theme]') && !e.closest('.lnav'));
      ln.classList.toggle('is-light', !!under && under.closest('[data-theme]').dataset.theme !== 'dark');
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  });

  /* ---------- videos: play in view, pause control ---------- */
  $$('video[data-autoplay]').forEach(v => {
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
    const btn = v.closest('.media, section, figure') && $('[data-vctrl]', v.closest('.media, section, figure'));
    let userPaused = false;
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); btn && btn.classList.add('paused'); }
    const io = new IntersectionObserver(([e]) => {
      if (reduce || userPaused) return;
      if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }, { threshold: .25 });
    io.observe(v);
    btn && btn.addEventListener('click', () => {
      if (v.paused) { userPaused = false; v.play(); btn.classList.remove('paused'); btn.setAttribute('aria-label', 'Pause video'); }
      else { userPaused = true; v.pause(); btn.classList.add('paused'); btn.setAttribute('aria-label', 'Play video'); }
    });
  });

  /* ---------- sound: every autoplay video gets a speaker button (starts muted — browser rule) ---------- */
  const allVids = $$('video[data-autoplay]');
  allVids.forEach(v => {
    const host = v.closest('.media, figure, section') || v.parentElement;
    const pause = host && $('[data-vctrl]', host);
    const b = d.createElement('button');
    b.type = 'button'; b.className = 'vsound'; b.setAttribute('aria-label', 'Turn sound on'); b.setAttribute('aria-pressed', 'false');
    if (pause) { pause.after(b); const cs = getComputedStyle(pause); b.style.right = (parseFloat(cs.right) + 46) + 'px'; b.style.bottom = cs.bottom; if (cs.position === 'absolute') b.style.position = 'absolute'; }
    else { host.style.position = host.style.position || 'relative'; host.appendChild(b); }
    b.addEventListener('click', e => {
      e.stopPropagation();
      const on = v.muted;
      allVids.forEach(x => { if (x !== v) { x.muted = true; const xb = x.__sb; if (xb) { xb.setAttribute('aria-pressed', 'false'); xb.setAttribute('aria-label', 'Turn sound on'); } } });
      v.muted = !on; if (on) { v.volume = .9; v.play().catch(() => {}); }
      b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    });
    v.__sb = b;
  });

  /* ---------- hero with sound: video[data-sound-first] starts with its soundtrack when the browser allows it;
     otherwise it plays muted and the sound comes on at the visitor's first tap, click or key (browser rule).
     WeChat's in-app browser allows sound once its JS bridge is ready. ---------- */
  const sv = $('video[data-sound-first]');
  if (sv && !reduce) {
    let done = false;
    const setBtn = on => { const b = sv.__sb; if (b) { b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on'); } };
    const evs = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
    const disarm = () => { done = true; evs.forEach(ev => d.removeEventListener(ev, onFirst, true)); };
    const loud = () => {
      if (done) return;
      allVids.forEach(x => { if (x !== sv) x.muted = true; });
      sv.muted = false; sv.volume = .9;
      const p = sv.play();
      const ok = () => { if (!sv.muted && !sv.paused) { setBtn(true); disarm(); } };
      const no = () => { sv.muted = true; setBtn(false); sv.play().catch(() => {}); };
      if (p && p.then) p.then(ok, no); else ok();
    };
    function onFirst(e) {
      if (e.target.closest && e.target.closest('.vsound,[data-vctrl],[data-film-open],[data-film]')) { disarm(); return; } // the visitor chose
      loud();
    }
    evs.forEach(ev => d.addEventListener(ev, onFirst, { capture: true, passive: true }));
    loud();
    const wx = () => { loud(); try { w.WeixinJSBridge.invoke('getNetworkType', {}, loud); } catch (e) {} };
    if (w.WeixinJSBridge) wx(); else d.addEventListener('WeixinJSBridgeReady', wx, false);
  }

  /* ---------- rails ---------- */
  $$('[data-rail]').forEach(r => {
    const box = r.parentElement, prev = $('.rail-ctrl .prev', box), next = $('.rail-ctrl .next', box);
    const step = () => (r.firstElementChild ? r.firstElementChild.getBoundingClientRect().width + 20 : 400);
    const upd = () => { if (!prev) return; prev.disabled = r.scrollLeft < 4; next.disabled = r.scrollLeft + r.clientWidth >= r.scrollWidth - 4; };
    prev && prev.addEventListener('click', () => r.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => r.scrollBy({ left: step(), behavior: 'smooth' }));
    r.addEventListener('scroll', upd, { passive: true }); upd();
  });

  /* ---------- tabs ---------- */
  $$('[data-tabs]').forEach(t => {
    const tabs = $$('[role=tab]', t);
    const sel = tab => {
      tabs.forEach(x => { const on = x === tab; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = d.getElementById(x.getAttribute('aria-controls')); if (p) { p.hidden = !on; if (on && hasG && !reduce) gsap.fromTo(p, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }); } });
    };
    tabs.forEach((x, i) => { x.addEventListener('click', () => sel(x)); x.addEventListener('keydown', e => { const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (k) { const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); sel(n); } }); });
  });

  /* ---------- finish picker ---------- */
  $$('[data-finish]').forEach(f => {
    const btns = $$('[data-finish-btn]', f), imgs = $$('[data-finish-img]', f), label = $('[data-finish-label]', f);
    const pick = name => {
      f.dataset.active = name;
      btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.finishBtn === name));
      imgs.forEach(i => i.classList.toggle('on', i.dataset.finishImg === name));
      if (label) { const b = btns.find(b => b.dataset.finishBtn === name); label.textContent = b ? b.dataset.name || b.getAttribute('aria-label') : name; }
    };
    btns.forEach(b => b.addEventListener('click', () => pick(b.dataset.finishBtn)));
    pick(f.dataset.active || (btns[0] && btns[0].dataset.finishBtn));
  });

  if (!hasG) return;
  gsap.registerPlugin(ScrollTrigger); if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);

  /* ---------- film lightbox: [data-film-open] buttons open dialog[data-film] (full film, with sound) ---------- */
  const dlg = $('[data-film]'), fv = dlg && $('[data-film-video]', dlg), fbtns = $$('[data-film-open]');
  if (dlg && fv && typeof dlg.showModal === 'function') {
    let back = null, was = [];
    const close = () => dlg.close();
    fbtns.forEach(b => b.addEventListener('click', () => {
      back = b;
      if (!fv.src) { fv.src = fv.dataset.src; if (fv.dataset.poster) fv.poster = fv.dataset.poster; }
      was = allVids.filter(v => !v.paused); was.forEach(v => v.pause());   // the film owns the sound
      w.__lenis && w.__lenis.stop();
      dlg.showModal(); fv.currentTime = 0; fv.muted = false; fv.play().catch(() => {});
    }));
    $('[data-film-close]', dlg).addEventListener('click', close);
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    dlg.addEventListener('close', () => { fv.pause(); w.__lenis && w.__lenis.start(); was.forEach(v => v.play().catch(() => {})); back && back.focus(); });
  } else fbtns.forEach(b => b.hidden = true);

  /* ---------- smooth scroll (desktop pointer only) ---------- */
  if (!reduce && fine && typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: .11, wheelMultiplier: 1, smoothWheel: true });
    w.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -100, duration: 1.2 }); } }));
  }

  if (reduce) { $$('[data-reveal]').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }

  /* ---------- reveals: progress-linked like apple.com ---------- */
  $$('[data-reveal]').forEach(el => {
    const rise = el.dataset.reveal === 'fade' ? 0 : 30;
    gsap.fromTo(el, { opacity: 0, y: rise }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 94%', end: 'top 66%', scrub: .6 } });
  });

  /* ---------- split headlines ---------- */
  d.fonts.ready.then(() => {
    $$('[data-split]').forEach(el => {
      if (typeof SplitText === 'undefined') return;
      const s = new SplitText(el, { type: 'lines', linesClass: 'ln', mask: 'lines' });
      gsap.from(s.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    ScrollTrigger.refresh();
  });

  /* ---------- words light up ---------- */
  $$('[data-scrub-text]').forEach(el => {
    if (typeof SplitText === 'undefined') return;
    const s = new SplitText(el, { type: 'words' });
    gsap.fromTo(s.words, { opacity: .18 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: .5 } });
  });

  /* ---------- counters ---------- */
  $$('[data-count]').forEach(el => {
    if (el.matches('[data-sequence]')) return;
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const o = { v: 0 }; el.textContent = pre + (0).toFixed(dec) + suf;
    gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => el.textContent = pre + o.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suf });
  });

  /* ---------- parallax ---------- */
  $$('[data-parallax]').forEach(el => {
    const k = parseFloat(el.dataset.parallax) || .15;
    gsap.fromTo(el, { yPercent: -k * 50 }, { yPercent: k * 50, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- expanding media (inset rounded card → full bleed) ---------- */
  $$('[data-expand]').forEach(el => {
    gsap.fromTo(el, { clipPath: 'inset(8% 9% 8% 9% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: .6 } });
  });

  /* ---------- pinned stages with steps ---------- */
  $$('[data-pin]').forEach(pin => {
    const steps = $$('[data-step]', pin), len = parseFloat(pin.dataset.pin) || 2.5;
    const st = ScrollTrigger.create({
      trigger: pin, start: 'top top', end: () => '+=' + innerHeight * len, pin: true, scrub: true, anticipatePin: 1,
      onUpdate: self => {
        pin.style.setProperty('--p', self.progress.toFixed(4));
        if (!steps.length) return;
        const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length * .9999));
        steps.forEach((s, k) => s.classList.toggle('on', k === i));
        pin.dataset.step = i;
      }
    });
    steps[0] && steps[0].classList.add('on');
  });

  /* ---------- canvas image sequence ---------- */
  $$('[data-sequence]').forEach(cv => {
    const n = +cv.dataset.count, pad = +(cv.dataset.pad || 3), tpl = cv.dataset.frames, ctx = cv.getContext('2d');
    const imgs = new Array(n); let last = -1;
    const src = i => tpl.replace('{i}', String(i + 1).padStart(pad, '0'));
    const draw = i => { const im = imgs[i]; if (!im || !im.complete) return; cv.width = im.naturalWidth; cv.height = im.naturalHeight; ctx.drawImage(im, 0, 0); last = i; };
    const load = i => { if (imgs[i]) return; const im = new Image(); im.decoding = 'async'; im.src = src(i); imgs[i] = im; im.onload = () => { if (i === 0 && last < 0) draw(0); }; };
    load(0);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { for (let i = 0; i < n; i++) load(i); io.disconnect(); } }, { rootMargin: '150% 0px' });
    io.observe(cv);
    const host = cv.closest('[data-pin]') || cv;
    ScrollTrigger.create({ trigger: host, start: 'top top', end: () => '+=' + innerHeight * (parseFloat(host.dataset.pin) || 2.5), scrub: true, onUpdate: s => { const i = Math.round(s.progress * (n - 1)); if (i !== last) draw(i); } });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
