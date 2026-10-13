/* Studio merch product page: gallery, size/colour, quantity, total, buy */
document.addEventListener('DOMContentLoaded', () => {
  const m = document.querySelector('[data-merch]'); if (!m) return;
  const $ = s => m.querySelector(s), $$ = s => [...m.querySelectorAll(s)];
  const price = +m.dataset.price, out = $('.mp-qty output'), tot = $('[data-total]');
  let q = 1;
  $$('[data-q]').forEach(b => b.addEventListener('click', () => { q = Math.min(20, Math.max(1, q + +b.dataset.q)); out.textContent = q; tot.textContent = '$' + (q * price).toLocaleString('en-US'); }));
  const imgs = $$('.mp-stage img'), th = $$('.mp-thumbs button');
  th.forEach(b => b.addEventListener('click', () => { th.forEach(x => x.classList.toggle('on', x === b)); imgs.forEach((im, i) => im.classList.toggle('on', i === +b.dataset.i)); }));
  $$('.mp-opt input[name="color"]').forEach(i => i.addEventListener('change', () => { const s = i.closest('fieldset').querySelector('legend span'); if (s) s.textContent = i.value; }));
  $('[data-buy]').addEventListener('click', () => { const ok = $('.mp-ok'); ok.hidden = false; ok.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
});
