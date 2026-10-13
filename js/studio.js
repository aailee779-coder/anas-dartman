/* /studio/ motion + the email-capture forms used on /studio/, /gear/, /support/ and /contact/.
   Forms: [data-capture] (email only) and [data-contact] (full form). No endpoint yet: set data-endpoint="https://…" to POST JSON. */
document.addEventListener('DOMContentLoaded', () => {
  const d = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasG = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  /* ---------- forms ---------- */
  const send = async (form, data) => {
    const url = form.dataset.endpoint;
    if (!url) return true; // endpoint to connect: accept locally for the preview
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return r.ok;
  };
  d.querySelectorAll('[data-capture]').forEach(form => {
    const input = form.querySelector('input[type=email]'), msg = form.querySelector('.capture-msg'), btn = form.querySelector('button[type=submit]');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      msg.className = 'capture-msg small';
      if (!okEmail(input.value)) { msg.textContent = 'Please enter a valid email address.'; msg.classList.add('err'); input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      input.removeAttribute('aria-invalid'); btn.disabled = true;
      try {
        const ok = await send(form, { list: form.dataset.capture, email: input.value.trim() });
        if (!ok) throw 0;
        form.classList.add('done'); msg.classList.add('ok');
        msg.textContent = form.dataset.capture === 'studio' ? 'You’re on the list. First access is yours.' : 'You’re on the list. We’ll email you when gear lands.';
      } catch (_) { btn.disabled = false; msg.classList.add('err'); msg.textContent = 'Something went wrong. Please try again.'; }
    });
  });
  d.querySelectorAll('[data-contact]').forEach(form => {
    const msg = form.querySelector('.form-msg'), btn = form.querySelector('button[type=submit]');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let first = null;
      form.querySelectorAll('[required]').forEach(f => {
        const bad = f.type === 'email' ? !okEmail(f.value) : f.type === 'checkbox' ? !f.checked : !f.value.trim();
        f.toggleAttribute('aria-invalid', bad); if (bad) f.setAttribute('aria-invalid', 'true');
        const hint = f.closest('.field') && f.closest('.field').querySelector('.field-err');
        if (hint) hint.hidden = !bad;
        if (bad && !first) first = f;
      });
      msg.className = 'form-msg';
      if (first) { msg.textContent = 'Please check the highlighted fields.'; msg.classList.add('err'); first.focus(); return; }
      btn.disabled = true;
      try {
        const ok = await send(form, Object.fromEntries(new FormData(form)));
        if (!ok) throw 0;
        form.classList.add('done'); msg.classList.add('ok');
        msg.textContent = 'Thanks. Your message is in. We’ll get back to you by email.';
      } catch (_) { btn.disabled = false; msg.classList.add('err'); msg.textContent = 'Something went wrong. Please try again or email us.'; }
    });
  });

  if (reduce) return;

  /* ---------- hero tilt toward the pointer ---------- */
  const stage = d.querySelector('[data-tilt]');
  if (stage && fine) {
    const hero = stage.closest('section');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      stage.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 16 + 'deg');
      stage.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 12 + 'deg');
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); });
  }

  if (!hasG) return;
  gsap.registerPlugin(ScrollTrigger);

  /* hero mark eases up and away as you leave */
  const wrapS = d.querySelector('[data-stage]');
  if (wrapS) gsap.to(wrapS, { yPercent: -18, scale: .86, opacity: .35, ease: 'none', scrollTrigger: { trigger: wrapS.closest('section'), start: 'top top', end: 'bottom top', scrub: .6 } });

  /* marquee rows move with scroll, in opposite directions */
  d.querySelectorAll('[data-mq]').forEach(row => {
    const dir = +row.dataset.mq;
    gsap.fromTo(row, { xPercent: dir > 0 ? -30 : 0 }, { xPercent: dir > 0 ? 0 : -30, ease: 'none', scrollTrigger: { trigger: row.closest('section'), start: 'top bottom', end: 'bottom top', scrub: .4 } });
  });

  /* round graphics turn as you scroll */
  d.querySelectorAll('[data-spin]').forEach(el => {
    const dir = +(el.dataset.spin || 1);
    gsap.fromTo(el, { rotate: -40 * dir }, { rotate: 40 * dir, ease: 'none', scrollTrigger: { trigger: el.closest('article') || el, start: 'top bottom', end: 'bottom top', scrub: .5 } });
  });

  /* o × / hop in one after another */
  const xos = d.querySelectorAll('.st-xos span');
  if (xos.length) gsap.from(xos, { yPercent: 70, rotate: (i) => [-20, 25, -15][i], opacity: 0, duration: 1, ease: 'back.out(2.2)', stagger: .12, scrollTrigger: { trigger: '.st-xos', start: 'top 85%', once: true } });
});
