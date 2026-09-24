/* POKENTARO — franquia.js
   Envia a ficha de interesse para o Google Apps Script, que:
   1) grava uma linha na planilha de leads, 2) manda e-mail pro time, 3) manda resposta automática pro lead.
   COLE AQUI a URL do "App da Web" gerada no Apps Script (termina em /exec): */
const PK_FRANQUIA_ENDPOINT = 'COLE_AQUI_A_URL_DO_APPS_SCRIPT';

(function () {
  const form = document.getElementById('form-franquia');
  if (!form) return;
  const erro = document.getElementById('form-erro');
  const btn = document.getElementById('f-enviar');
  const sucesso = document.getElementById('fr-sucesso');

  // máscara simples de WhatsApp
  const tel = document.getElementById('f-whats');
  tel.addEventListener('input', () => {
    let d = tel.value.replace(/\D/g, '').slice(0, 11);
    if (d.length > 6) tel.value = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    else if (d.length > 2) tel.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    else tel.value = d;
  });

  form.addEventListener('input', e => { if (e.target.hasAttribute('aria-invalid')) { e.target.removeAttribute('aria-invalid'); erro.hidden = true; } });
  form.addEventListener('change', e => { const f = e.target.closest('fieldset'); if (f) f.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid')); });

  function mostrarErro(msg, campo) {
    erro.textContent = msg; erro.hidden = false;
    if (campo) campo.focus();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erro.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));

    // validação
    const obrig = [...form.querySelectorAll('[required]')];
    for (const el of obrig) {
      let ok = true;
      if (el.type === 'radio') ok = !!form.querySelector(`input[name="${el.name}"]:checked`);
      else if (el.type === 'checkbox') ok = el.checked;
      else ok = el.value.trim() !== '';
      if (!ok) {
        el.setAttribute('aria-invalid', 'true');
        const rot = el.closest('fieldset')?.querySelector('legend')?.textContent || form.querySelector(`label[for="${el.id}"]`)?.textContent || 'campo obrigatório';
        return mostrarErro(el.type === 'checkbox' ? 'Pra enviar, marque a autorização de contato (LGPD).' : `Falta preencher: ${rot.replace(' *', '')}.`, el);
      }
    }
    const email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return mostrarErro('Confere o e-mail? Parece que tem algo faltando.', form.email);
    if (form.whatsapp.value.replace(/\D/g, '').length < 10) return mostrarErro('Confere o WhatsApp com DDD?', form.whatsapp);
    if (form.site.value) return; // robô

    if (!PK_FRANQUIA_ENDPOINT.startsWith('https://')) {
      return mostrarErro('Formulário em configuração. Enquanto isso, chama a gente no Instagram @pokentaro.rj.');
    }

    const dados = new URLSearchParams(new FormData(form));
    dados.set('pagina', location.href);
    btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      await fetch(PK_FRANQUIA_ENDPOINT, { method: 'POST', mode: 'no-cors', body: dados });
      document.getElementById('suc-nome').textContent = form.nome.value.trim().split(' ')[0];
      document.getElementById('suc-cidade').textContent = form.cidade.value.trim() || 'sua cidade';
      form.hidden = true;
      document.querySelector('.fr-form-head').hidden = true;
      sucesso.hidden = false;
      sucesso.focus();
      sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      mostrarErro('Deu ruim na conexão. Tenta de novo em instantes?');
      btn.disabled = false; btn.textContent = 'Enviar minha ficha';
    }
  });
})();
