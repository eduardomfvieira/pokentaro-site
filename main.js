/* POKENTARO — main.js (comum a todas as páginas) */
(function () {
  // Ano no rodapé
  document.querySelectorAll('[data-ano]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Hero: se a foto não carregar, mostra a ilustração
  const fig = document.getElementById('hero-fig');
  if (fig) {
    const img = fig.querySelector('img.foto');
    const semFoto = () => fig.classList.add('sem-foto');
    if (!img) semFoto();
    else if (img.complete && img.naturalWidth === 0) semFoto();
    else img.addEventListener('error', semFoto);
  }

  // Toast simples
  let t;
  window.pkToast = function (msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(t); t = setTimeout(() => { el.hidden = true; }, 2200);
  };

  // Copiar texto (com fallback)
  window.pkCopiar = async function (texto) {
    try { await navigator.clipboard.writeText(texto); pkToast('Copiado!'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove(); pkToast(ok ? 'Copiado!' : 'Não deu pra copiar — selecione o texto');
    }
  };
  document.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () => pkCopiar(b.dataset.copiar)));
})();
