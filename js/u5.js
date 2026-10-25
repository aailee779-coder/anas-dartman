/* u5 · client update 2026-10-25 (Version B) */
(function () {
  const d = document;
  /* Event sub-menu: /event/#tournaments and /event/#news open the matching filter */
  const pick = () => {
    const f = { '#tournaments': 't', '#news': 'n' }[location.hash];
    const b = f && d.querySelector('[data-uevents] .u-seg button[data-f="' + f + '"]');
    if (b) { b.click(); d.getElementById('events') && d.getElementById('events').scrollIntoView(); }
  };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', pick); else pick();
  window.addEventListener('hashchange', pick);
})();

/* App page tabs */
document.querySelectorAll('[data-u5tabs]').forEach(w => {
  const bs = w.querySelectorAll('.u5-seg button'), ps = w.querySelectorAll('.u5-tab-p');
  bs.forEach(b => b.addEventListener('click', () => {
    bs.forEach(x => x.setAttribute('aria-selected', x === b));
    ps.forEach(p => p.classList.toggle('on', p.dataset.t === b.dataset.t));
  }));
});
