/* /space/ + /space/partner/ — quiet-corner scrub, "Will it fit?" tool, inquiry forms. */
document.addEventListener('DOMContentLoaded', () => {
  const d = document, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- quiet corner: grey room → game on ---------- */
  const corner = $('.sp-corner');
  if (corner && !reduce) {
    let ticking = false;
    const upd = () => {
      ticking = false;
      const r = corner.getBoundingClientRect(), span = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (span || 1)));
      corner.style.setProperty('--p', p.toFixed(3));
      corner.classList.toggle('is-on', p > .45);
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  }

  /* ---------- Will it fit? ----------
     Facts (EDmini Max user manual, BRIEF §10): machine 58 × 35 × 234 cm; play area 400 × 70 cm per machine,
     measured from the wall; ceiling ≥ 240 cm; 25 cm between machines. Nothing else is assumed. */
  const fit = $('[data-fit]');
  if (fit) {
    const M = { w: 58, dep: 35, h: 234, laneW: 70, laneD: 400, ceil: 240, gap: 25 };
    const pitch = M.w + M.gap; // 83 cm centre to centre
    const form = $('.fit-form', fit), err = $('.fit-err', fit), verdict = $('.fit-verdict', fit), list = $('.fit-reasons', fit), cta = $('.fit-cta', fit), svg = $('.fit-svg', fit);
    const unit = () => form.querySelector('input[name=unit]:checked').value;
    const ftin = cm => { const tin = cm / 2.54; let ft = Math.floor(tin / 12), inch = Math.round((tin - ft * 12) * 10) / 10; if (inch >= 12) { ft++; inch = 0; } return ft ? `${ft} ft${inch ? ' ' + inch + ' in' : ''}` : `${inch} in`; };
    const fmt = cm => unit() === 'cm' ? `${Math.round(cm)} cm` : ftin(cm);
    const val = n => { const el = form.elements[n]; const v = el && el.value.trim(); return v === '' ? null : parseFloat(v); };

    const read = () => {
      const out = {}, bad = [];
      for (const k of ['w', 'd', 'h']) {
        let cm = null;
        if (unit() === 'cm') { cm = val(k + '_cm'); }
        else { const f = val(k + '_ft'), i = val(k + '_in'); if (f !== null || i !== null) cm = ((f || 0) * 12 + (i || 0)) * 2.54; }
        const inputs = $$(`[data-dim="${k}"] .fit-in:not([hidden]) input`, fit);
        const ok = cm !== null && isFinite(cm) && cm > 0 && cm < 100000;
        inputs.forEach(i => i.setAttribute('aria-invalid', ok ? 'false' : 'true'));
        if (!ok) bad.push(k); else out[k] = cm;
      }
      return { out, bad };
    };

    const draw = (W, D, n) => {
      // top view: wall at top, room depth downward. Scale to fit 560 × 300.
      const pad = 20, maxW = 560, maxH = 290;
      const roomW = Math.max(W, M.laneW), roomD = Math.max(D, M.laneD) ;
      const s = Math.min(maxW / roomW, maxH / roomD);
      const ox = pad + (maxW - roomW * s) / 2, oy = 34;
      const shown = Math.min(n, 40);
      let g = `<rect class="room" x="${ox}" y="${oy}" width="${W * s}" height="${D * s}" rx="2"/>`;
      g += `<rect class="wall" x="${ox - 4}" y="${oy - 6}" width="${W * s + 8}" height="6" rx="1"/>`;
      g += `<text x="${ox}" y="${oy - 14}">Wall · ${fmt(W)}</text>`;
      const count = Math.max(shown, 1);
      const groupW = (count - 1) * pitch + M.laneW;
      const startX = ox + Math.max(0, (W - groupW) / 2) * s;
      for (let i = 0; i < count; i++) {
        const lx = startX + i * pitch * s;
        const good = n > 0;
        g += `<rect class="lane${good && D >= M.laneD ? '' : ' bad'}" x="${lx}" y="${oy}" width="${M.laneW * s}" height="${M.laneD * s}" rx="2"/>`;
        g += `<rect class="mach" x="${lx + ((M.laneW - M.w) / 2) * s}" y="${oy}" width="${Math.max(M.w * s, 2)}" height="${Math.max(M.dep * s, 2)}" rx="1.5"/>`;
      }
      const yD = oy + D * s;
      g += `<line class="dim" x1="${ox + W * s + 10}" y1="${oy}" x2="${ox + W * s + 10}" y2="${yD}"/>`;
      g += `<text x="${Math.min(ox + W * s + 14, 470)}" y="${oy + D * s / 2}">Depth ${fmt(D)}</text>`;
      if (n > shown) g += `<text x="${ox}" y="${oy + maxH + 20}">Showing ${shown} of ${n}</text>`;
      svg.innerHTML = g;
    };

    const run = e => {
      e && e.preventDefault();
      const { out, bad } = read();
      if (bad.length) {
        const names = { w: 'wall width', d: 'room depth', h: 'ceiling height' };
        err.textContent = 'Please enter the ' + bad.map(b => names[b]).join(', ') + '.';
        err.hidden = false; verdict.textContent = 'Enter your measurements.'; verdict.className = 'fit-verdict h3'; list.innerHTML = ''; cta.hidden = true;
        const first = $(`[data-dim="${bad[0]}"] .fit-in:not([hidden]) input`, fit); first && first.focus();
        return;
      }
      err.hidden = true;
      const { w: W, d: D, h: H } = out;
      const n = W >= M.laneW ? Math.floor((W - M.laneW) / pitch) + 1 : 0;
      const okW = n > 0, okD = D >= M.laneD, okH = H >= M.ceil;
      const reasons = [];
      reasons.push(okW
        ? [true, `<b>Wall: room for ${n} machine${n > 1 ? 's' : ''} side by side.</b> Each needs a ${fmt(M.laneW)} wide lane, with ${fmt(M.gap)} between machines.`]
        : [false, `<b>Wall is too narrow.</b> One machine needs a ${fmt(M.laneW)} wide play lane; you have ${fmt(W)}.`]);
      reasons.push(okD
        ? [true, `<b>Depth is enough.</b> Players need ${fmt(M.laneD)} from the wall; you have ${fmt(D)}.`]
        : [false, `<b>Depth is short by ${fmt(M.laneD - D)}.</b> The recommended play area runs ${fmt(M.laneD)} from the wall, to keep throwers and walkways apart.`]);
      reasons.push(okH
        ? [true, `<b>Ceiling clears.</b> The machine is ${fmt(M.h)} tall; ${fmt(M.ceil)} of ceiling is recommended.`]
        : [false, `<b>Ceiling is too low.</b> The machine is ${fmt(M.h)} tall and needs at least ${fmt(M.ceil)} of ceiling height.`]);
      const all = okW && okD && okH;
      verdict.className = 'fit-verdict h3' + (all ? ' yes' : '');
      verdict.innerHTML = all ? `<span class="ok">Yes.</span> ${n} machine${n > 1 ? 's' : ''} fit${n > 1 ? '' : 's'} here.` : `<span class="no">Not quite.</span> ${!okW ? 'The wall is too narrow.' : !okH ? 'Check the ceiling.' : 'This room needs more depth.'}`;
      list.innerHTML = reasons.map(([ok, t]) => `<li class="${ok ? '' : 'bad'}"><span>${t}</span></li>`).join('');
      const q = new URLSearchParams({ w: Math.round(W), d: Math.round(D), h: Math.round(H), fit: n });
      cta.href = '/anas-dartman/space/partner/?' + q.toString() + '#plan';
      cta.textContent = all ? 'Get a layout for this room' : 'Ask us about this room';
      cta.hidden = false;
      draw(W, D, n);
    };

    // unit toggle: convert values that were already typed
    let lastUnit = unit();
    $$('input[name=unit]', form).forEach(r => r.addEventListener('change', () => {
      const prev = lastUnit, next = unit(); if (prev === next) return;
      for (const k of ['w', 'd', 'h']) {
        let cm = null;
        if (prev === 'cm') cm = val(k + '_cm');
        else { const f = val(k + '_ft'), i = val(k + '_in'); if (f !== null || i !== null) cm = ((f || 0) * 12 + (i || 0)) * 2.54; }
        if (next === 'cm') { form.elements[k + '_cm'].value = cm !== null ? Math.round(cm) : ''; }
        else if (cm !== null) { const tin = cm / 2.54; let f = Math.floor(tin / 12), i = Math.round(tin - f * 12); if (i === 12) { f++; i = 0; } form.elements[k + '_ft'].value = f; form.elements[k + '_in'].value = i; }
        else { form.elements[k + '_ft'].value = ''; form.elements[k + '_in'].value = ''; }
      }
      $$('.u-ft', fit).forEach(el => el.hidden = next !== 'ft');
      $$('.u-cm', fit).forEach(el => el.hidden = next !== 'cm');
      lastUnit = next;
      if (!list.innerHTML) return; run();
    }));
    form.addEventListener('submit', run);
    // idle sketch until the visitor checks a room
    svg.innerHTML = `<rect class="room" x="20" y="34" width="560" height="290" rx="2"/><rect class="wall" x="16" y="28" width="568" height="6" rx="1"/><text x="20" y="20">Your wall</text><text x="300" y="186" text-anchor="middle">Your room appears here</text>`;
  }

  /* ---------- partner forms (no backend yet) ---------- */
  $$('form[data-inquiry]').forEach(f => {
    const done = $('.pt-done', f);
    const msg = el => {
      if (el.validity.valueMissing) return el.tagName === 'SELECT' ? 'Please choose one.' : 'Please fill this in.';
      if (el.validity.typeMismatch) return 'Please enter a valid email address.';
      if (el.validity.rangeUnderflow) return 'Please enter 1 or more.';
      if (el.validity.badInput) return 'Please enter a number.';
      return '';
    };
    const check = el => {
      const e = d.getElementById(el.getAttribute('aria-describedby')?.split(' ').find(id => id.endsWith('-err')) || '');
      const m = el.checkValidity() ? '' : msg(el) || 'Please check this field.';
      el.setAttribute('aria-invalid', m ? 'true' : 'false');
      if (e) e.textContent = m;
      return !m;
    };
    $$('input,select,textarea', f).forEach(el => {
      el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid') === 'true') check(el); });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); });
    });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const fields = $$('input,select,textarea', f).filter(el => el.name);
      const bad = fields.filter(el => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      // Endpoint not connected yet (data-endpoint="to-connect"). Collected data stays in the browser.
      f.classList.add('is-done');
      done.hidden = false;
      const h = $('h3', done); h && h.setAttribute('tabindex', '-1'); h && h.focus();
    });
  });

  /* prefill floor dimensions from the fit tool (?w=&d=&h=&fit=) */
  const qs = new URLSearchParams(location.search), dims = $('#pt-dims');
  if (dims && qs.get('w')) {
    const cm = k => +qs.get(k) || 0, ft = c => { const t = Math.round(c / 2.54); return `${Math.floor(t / 12)} ft ${t % 12} in`; };
    const parts = [`Wall ${ft(cm('w'))} (${cm('w')} cm)`];
    if (cm('d')) parts.push(`depth ${ft(cm('d'))} (${cm('d')} cm)`);
    if (cm('h')) parts.push(`ceiling ${ft(cm('h'))} (${cm('h')} cm)`);
    dims.value = parts.join(', ') + (qs.get('fit') ? ` · fit tool: ${qs.get('fit')} machine(s)` : '');
  }
  /* install film chapters */
  const inst = $('[data-install]');
  if (inst) {
    const v = $('video', inst), chs = $$('[data-t]', inst);
    const seek = t => { const go = () => { v.currentTime = t; v.muted = false; v.play().catch(() => {}); }; if (v.readyState >= 1) go(); else { v.preload = 'auto'; v.addEventListener('loadedmetadata', go, { once: true }); v.load(); } };
    chs.forEach(b => b.addEventListener('click', () => seek(+b.dataset.t)));
    v.addEventListener('timeupdate', () => { let c = 0; chs.forEach((b, i) => { if (v.currentTime >= +b.dataset.t - .2) c = i; }); chs.forEach((b, i) => b.classList.toggle('on', i === c)); });
  }
  /* reviews */
  const rv = $('[data-sxrev]');
  if (rv) { const sl = $$('figure', rv); let i = 0, t; const go = k => { i = (k + sl.length) % sl.length; sl.forEach((x, j) => x.classList.toggle('on', j === i)); };
    $('[data-p]', rv).addEventListener('click', () => { go(i - 1); clearInterval(t); }); $('[data-n]', rv).addEventListener('click', () => { go(i + 1); clearInterval(t); });
    if (!reduce) t = setInterval(() => go(i + 1), 7000); }
});