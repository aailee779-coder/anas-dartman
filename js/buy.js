/* BUY EDmini Max — colour-driven gallery, quantity, live total, sticky bar, bag drawer */
document.addEventListener('DOMContentLoaded', () => {
  const d = document, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const root = $('[data-buy]'); if (!root) return;
  const PRICE = 3999, fmt = n => '$' + n.toLocaleString('en-US');
  const shared = [
    ['/anas-dartman/assets/img/packshots/edmini-side-views-cutout-1600.webp', 'Front and slim side profiles'],
    ['/anas-dartman/assets/img/packshots/edmini-side-open-cutout-1600.webp', 'Modular cabinet, opened'],
    ['/anas-dartman/assets/img/b/led-target.webp', 'Backlit LED target'],
    ['/anas-dartman/assets/img/b/os-screen.webp', 'DM OS on the 21.5-inch touch screen'],
    ['/anas-dartman/assets/img/packshots/edmini-boards-five-a-cutout-1600.webp', 'Target panels in five looks'],
    ['/anas-dartman/assets/img/packshots/edmini-exploded-flatlay-1600.webp', 'Every part, laid out']
  ];
  const photos = c => [[`/anas-dartman/assets/img/colours/finish-${c}-plain-1600.webp`, `EDmini Max in ${c}`], [`/anas-dartman/assets/img/colours/finish-${c}-1600.webp`, `EDmini Max in ${c} on a studio wall`], ...shared];

  const imgs = $('.buy-imgs', root), thumbs = $('.buy-thumbs', root), count = $('.buy-count', root);
  let color = 'silver', name = 'Silver', qty = 1, idx = 0, list = [];

  const show = i => {
    idx = (i + list.length) % list.length;
    $$('img', imgs).forEach((im, j) => im.classList.toggle('on', j === idx));
    $$('button', thumbs).forEach((t, j) => t.setAttribute('aria-selected', j === idx));
    count.textContent = (idx + 1) + ' / ' + list.length;
    const t = $$('button', thumbs)[idx]; if (t) thumbs.scrollTo({ left: t.offsetLeft - (thumbs.clientWidth - t.clientWidth) / 2, behavior: 'smooth' });
  };
  const build = () => {
    list = photos(color);
    imgs.innerHTML = list.map(([s, a], j) => `<img src="${s}" alt="${a}" ${j ? 'loading="lazy"' : ''}>`).join('');
    thumbs.innerHTML = list.map(([s, a], j) => `<button type="button" role="tab" aria-label="${a}"><img src="${s.replace('-1600', '-800')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${s}'"></button>`).join('');
    $$('button', thumbs).forEach((b, j) => b.addEventListener('click', () => show(j)));
    show(0);
  };
  $('.buy-arrow.prev', root).addEventListener('click', () => show(idx - 1));
  $('.buy-arrow.next', root).addEventListener('click', () => show(idx + 1));
  let x0 = null;
  imgs.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  imgs.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); x0 = null; });
  d.addEventListener('keydown', e => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });

  const sync = () => {
    const total = fmt(PRICE * qty);
    $$('[data-sum-color],[data-bar-color]').forEach(e => e.textContent = name);
    $$('[data-sum-qty]').forEach(e => e.textContent = qty);
    $('[data-qty-out]').textContent = qty;
    $$('[data-sum-sub],[data-sum-total],[data-bar-total],[data-bag-total],[data-bag-total2]').forEach(e => e.textContent = total);
    $('[data-bag-desc]').textContent = `${name} · Qty ${qty}`;
    $('[data-bag-img]').src = `/anas-dartman/assets/img/colours/finish-${color}-plain-800.webp`;
    $('[data-qty="-1"]').disabled = qty <= 1; $('[data-qty="1"]').disabled = qty >= 10;
  };
  $$('[data-color]', root).forEach(b => b.addEventListener('click', () => {
    $$('[data-color]', root).forEach(x => x.setAttribute('aria-checked', x === b));
    color = b.dataset.color; name = b.dataset.name; build(); sync();
  }));
  $$('[data-qty]').forEach(b => b.addEventListener('click', () => { qty = Math.min(10, Math.max(1, qty + +b.dataset.qty)); sync(); }));

  /* sticky bar once the summary scrolls away */
  const bar = $('[data-buy-bar]'), sum = $('.buy-sum', root);
  new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', !on); }).observe(sum);

  /* bag */
  const bag = $('[data-bag]');
  const open = () => { bag.hidden = false; requestAnimationFrame(() => bag.classList.add('on')); d.body.style.overflow = 'hidden'; };
  const close = () => { bag.classList.remove('on'); d.body.style.overflow = ''; setTimeout(() => bag.hidden = true, 300); };
  $$('[data-add-bag],[data-buy-now]').forEach(b => b.addEventListener('click', open));
  $('[data-bag-close]').addEventListener('click', close);
  bag.addEventListener('click', e => { if (e.target === bag) close(); });
  d.addEventListener('keydown', e => { if (e.key === 'Escape' && !bag.hidden) close(); });
  $('[data-checkout]').addEventListener('click', () => { $('[data-checkout-note]').hidden = false; });

  /* tap a photo to zoom */
  const zoom = $('[data-zoom]');
  if (zoom && zoom.showModal) {
    imgs.addEventListener('click', () => { const im = $('img.on', imgs); if (!im) return; $('img', zoom).src = im.src; $('img', zoom).alt = im.alt; zoom.showModal(); });
    $('[data-zoom-close]', zoom).addEventListener('click', () => zoom.close());
    zoom.addEventListener('click', e => { if (e.target === zoom) zoom.close(); });
  }

  build(); sync();
});
