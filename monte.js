/* POKENTARO — monte.js
   Cardápio "Monte seu poke". Para mudar itens, limites ou preços,
   edite só o objeto CARDAPIO abaixo. */
const CARDAPIO = {
  limites: { // [pequeno, grande]
    base: [1, 2], top: [4, 4], prot: [1, 2], crispy: [1, 2], nuts: [1, 2], molho: [1, 1]
  },
  etapas: [
    { k: 'base', nome: 'Bases', cls: 'c-base', desc: 'O chão da tigela', itens: [
      ['Arroz japonês', '#fffaf0'], ['Bifum', '#f1e6c8'], ['Mix de folhas', '#6fbf73'],
      ['Espaguete de abobrinha', '#b5d67a'], ['Grão de bico', '#e3c07a'], ['Quinoa', '#d9c79a']] },
    { k: 'top', nome: 'Toppings', cls: 'c-top', desc: 'Cor e frescor', itens: [
      ['Cebola roxa', '#9c4f96'], ['Cenoura', '#ff9a3c'], ['Cream cheese', '#fff7e6'], ['Kani', '#ff6f61'],
      ['Manga', '#ffc233'], ['Tomate cereja', '#e53935'], ['Abacate', '#9ccc65'], ['Edamame', '#4caf50'],
      ['Sunomono', '#c5e1a5'], ['Pepino japonês', '#7cb342'], ['Abacaxi', '#ffe066']] },
    { k: 'prot', nome: 'Proteínas', cls: 'c-prot', desc: 'Cortadas no dia', itens: [
      ['Salmão', '#ff8a5c'], ['Atum', '#c8324a'], ['Peixe branco', '#f5efe0'], ['Frango grelhado em cubos', '#d9a066'],
      ['Shitake', '#6d4c41'], ['Shimeji', '#bcaaa4'], ['Ovo de codorna', '#fff3d6'], ['Camarão', '#ffab91'],
      ['Salmão maçaricado', '#f4733f'], ['Atum maçaricado', '#a8283d'], ['Sem proteína', null]] },
    { k: 'crispy', nome: 'Crispys', cls: 'c-crispy', desc: 'A crocância', itens: [
      ['Chips de batata-doce', '#e67e22'], ['Chips de alho-poró', '#e6c27a'], ['Chips de couve', '#2e7d32'], ['Chips de banana-da-terra', '#f2c94c']] },
    { k: 'nuts', nome: 'Nuts', cls: 'c-nuts', escuro: true, desc: 'O toque final', itens: [
      ['Amendoim', '#c68b59'], ['Castanha de caju', '#e8c07d'], ['Milho', '#ffd54f'], ['Uva-passa', '#5d2e46'], ['Tiras de coco', '#fafafa', 3.90]] },
    { k: 'molho', nome: 'Molho', cls: 'c-molho', escuro: true, desc: 'Amarra tudo', itens: [
      ['Agridoce', '#d35400'], ['Azeite trufado', '#c9b458'], ['Sweet chilli', '#e74c3c'], ['Shoyu', '#3e2415'],
      ['Teriyaki', '#5a3218'], ['Mostarda e mel', '#e0a526']] },
    { k: 'extra', nome: 'Extras', cls: 'c-extra', desc: 'Opcional', grupos: [
      { titulo: 'Proteína extra', itens: [['Atum maçaricado', '#a8283d', 14], ['Atum poke', '#c8324a', 14], ['Ovo de codorna', '#fff3d6', 9], ['Camarão', '#ffab91', 14], ['Frango grelhado', '#d9a066', 9], ['Peixe branco', '#f5efe0', 12], ['Salmão maçaricado', '#f4733f', 15], ['Salmão poke', '#ff8a5c', 15], ['Shimeji', '#bcaaa4', 12], ['Shitake', '#6d4c41', 12]] },
      { titulo: 'Topping extra', itens: [['Abacate', '#9ccc65', 4], ['Cream cheese', '#fff7e6', 4], ['Edamame', '#4caf50', 4], ['Kani', '#ff6f61', 4], ['Tomate cereja', '#e53935', 4]] },
      { titulo: 'Molho extra', itens: [['Molho shoyu', '#3e2415', 3.90], ['Molho teriyaki', '#5a3218', 3.90]] }
    ] }
  ]
};

(function () {
  const passosEl = document.getElementById('passos');
  const painel = document.getElementById('painel');
  if (!passosEl || !painel) return;

  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const E = CARDAPIO.etapas;
  let tam = 'grande';
  let atual = 0;
  let aviso = '';
  const sel = { base: ['Arroz japonês'], top: ['Manga', 'Pepino japonês', 'Edamame', 'Cebola roxa'], prot: ['Salmão'], crispy: ['Chips de alho-poró'], nuts: ['Castanha de caju'], molho: ['Shoyu'], extra: [] };

  const lim = k => CARDAPIO.limites[k] ? CARDAPIO.limites[k][tam === 'pequeno' ? 0 : 1] : Infinity;
  const extraKey = (g, n) => g + '|' + n;
  function item(k, n) {
    const e = E.find(x => x.k === k);
    if (k === 'extra') { const [g, nome] = n.split('|'); return e.grupos.find(x => x.titulo === g).itens.find(i => i[0] === nome); }
    return e.itens.find(i => i[0] === n);
  }

  // Tamanho
  document.querySelectorAll('.tam-btn').forEach(b => b.addEventListener('click', () => {
    tam = b.dataset.tam;
    document.querySelectorAll('.tam-btn').forEach(x => x.setAttribute('aria-pressed', x === b));
    Object.keys(CARDAPIO.limites).forEach(k => { if (sel[k].length > lim(k)) sel[k] = sel[k].slice(0, lim(k)); });
    aviso = tam === 'pequeno' ? 'Poke pequeno: 1 base, 1 proteína, 1 crispy e 1 nut.' : '';
    render();
  }));

  function renderPassos() {
    passosEl.innerHTML = E.map((s, i) => {
      const feito = sel[s.k].length > 0 && i !== atual;
      return `<button type="button" role="tab" id="tab-${s.k}" class="passo ${s.cls}${feito ? ' feito' : ''}" aria-selected="${i === atual}" aria-controls="painel" data-i="${i}"><span class="n">${i < 6 ? 'Etapa ' + (i + 1) : 'Opcional'}</span><b>${s.nome}</b></button>`;
    }).join('');
    passosEl.querySelectorAll('.passo').forEach(b => b.addEventListener('click', () => { atual = +b.dataset.i; aviso = ''; render(); }));
  }

  function chip(nome, cor, preco, pressed, valor) {
    return `<button type="button" class="chip" aria-pressed="${pressed}" data-v="${valor}">${cor ? `<span class="dot" style="background:${cor}"></span>` : ''}${nome}${preco ? ` <span class="preco">+${brl(preco)}</span>` : ''}</button>`;
  }

  function renderPainel() {
    const s = E[atual];
    painel.className = 'painel ' + s.cls + (s.escuro ? ' escuro' : '');
    painel.setAttribute('aria-labelledby', 'tab-' + s.k);
    let corpo = '';
    if (s.k === 'extra') {
      corpo = s.grupos.map(g => `<div><h4>${g.titulo}</h4><div class="chips" style="margin-top:10px">${g.itens.map(([n, c, p]) => chip(n, c, p, sel.extra.includes(extraKey(g.titulo, n)), extraKey(g.titulo, n))).join('')}</div></div>`).join('');
    } else {
      corpo = `<div class="chips">${s.itens.map(([n, c, p]) => chip(n, c, p, sel[s.k].includes(n), n)).join('')}</div>`;
    }
    const regra = s.k === 'extra' ? 'Quer turbinar? Escolha quantos quiser.' : `Escolha até ${lim(s.k)} ${lim(s.k) === 1 ? 'opção' : 'opções'}.`;
    painel.innerHTML = `<div><h3>${s.nome}</h3><p class="regra-txt">${regra} ${s.k !== 'extra' ? `<span>(${sel[s.k].length}/${lim(s.k)})</span>` : ''}</p></div>
      ${corpo}
      <p class="aviso" aria-live="polite">${aviso}</p>
      <div class="nav-passos">
        ${atual > 0 ? `<button type="button" class="btn btn-sm ${s.escuro ? 'btn-ghost-claro' : 'btn-ghost'}" data-nav="-1">← ${E[atual - 1].nome}</button>` : '<span></span>'}
        ${atual < E.length - 1 ? `<button type="button" class="btn btn-sm ${s.escuro ? 'btn-creme' : 'btn-verde'}" data-nav="1">Próximo: ${E[atual + 1].nome} →</button>` : `<a class="btn btn-sm btn-laranja" href="/unidades">Pedir na loja</a>`}
      </div>`;

    painel.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      const v = c.dataset.v, k = s.k, arr = sel[k], i = arr.indexOf(v);
      aviso = '';
      if (i >= 0) arr.splice(i, 1);
      else if (k === 'extra') arr.push(v);
      else if (v === 'Sem proteína') sel[k] = [v];
      else {
        if (k === 'prot') { const j = arr.indexOf('Sem proteína'); if (j >= 0) arr.splice(j, 1); }
        if (arr.length >= lim(k)) {
          if (lim(k) === 1) arr.length = 0;
          else { aviso = `Limite de ${lim(k)} atingido — desmarque um para trocar.`; render(); return; }
        }
        arr.push(v);
      }
      render();
    }));
    painel.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => { atual += +b.dataset.nav; aviso = ''; render(); }));
  }

  function totalExtras() {
    let t = 0;
    sel.extra.forEach(v => { t += item('extra', v)[2] || 0; });
    sel.nuts.forEach(n => { t += item('nuts', n)[2] || 0; });
    return t;
  }

  function renderTigela() {
    const base = sel.base.length ? item('base', sel.base[0])[1] : '#fffaf0';
    const base2 = sel.base[1] ? item('base', sel.base[1])[1] : null;
    const cores = [...sel.prot, ...sel.top].map(n => (item('prot', n) || item('top', n))[1]).filter(Boolean);
    let g = `<circle cx="100" cy="100" r="96" fill="#fff2c3"/><circle cx="100" cy="100" r="84" fill="${base}"/>`;
    if (base2) g += `<path d="M100 16 A84 84 0 0 1 100 184 Z" fill="${base2}"/>`;
    const N = Math.max(cores.length, 1);
    cores.forEach((c, i) => {
      const a0 = (i / N) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2, r = 80, ri = 36;
      const p = (r, a) => `${(100 + r * Math.cos(a)).toFixed(1)} ${(100 + r * Math.sin(a)).toFixed(1)}`;
      const lg = (a1 - a0) > Math.PI ? 1 : 0;
      g += `<path d="M${p(ri, a0)} L${p(r, a0)} A${r} ${r} 0 ${lg} 1 ${p(r, a1)} L${p(ri, a1)} A${ri} ${ri} 0 ${lg} 0 ${p(ri, a0)} Z" fill="${c}" stroke="${base}" stroke-width="3"/>`;
    });
    // crispys e nuts salpicados no centro
    const miudos = [...sel.crispy.map(n => item('crispy', n)[1]), ...sel.nuts.map(n => item('nuts', n)[1])];
    miudos.forEach((c, i) => {
      for (let j = 0; j < 4; j++) {
        const a = (j / 4) * Math.PI * 2 + i * 0.8, rr = 12 + (j % 2) * 10;
        g += `<rect x="${(100 + rr * Math.cos(a) - 4).toFixed(1)}" y="${(100 + rr * Math.sin(a) - 2).toFixed(1)}" width="8" height="4" rx="2" fill="${c}" transform="rotate(${(a * 57).toFixed(0)} ${(100 + rr * Math.cos(a)).toFixed(1)} ${(100 + rr * Math.sin(a)).toFixed(1)})"/>`;
      }
    });
    if (sel.molho.length) g += `<path d="M56 100 Q78 80 100 100 T144 100" fill="none" stroke="${item('molho', sel.molho[0])[1]}" stroke-width="5" stroke-linecap="round" opacity=".9"/>`;
    document.getElementById('mini').innerHTML = g;

    const linhas = [['Tamanho', tam === 'pequeno' ? 'Pequeno' : 'Grande'], ...E.filter(s => s.k !== 'extra').map(s => [s.nome, sel[s.k].join(', ') || '—'])];
    if (sel.extra.length) linhas.push(['Extras', sel.extra.map(v => v.split('|')[1]).join(', ')]);
    document.getElementById('resumo').innerHTML = linhas.map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join('');
    const t = totalExtras();
    document.getElementById('total-extras').hidden = t === 0;
    document.getElementById('valor-extras').textContent = '+' + brl(t);
  }

  function textoPedido() {
    const l = [`Meu poke Pokentaro (${tam === 'pequeno' ? 'pequeno' : 'grande'})`];
    E.filter(s => s.k !== 'extra').forEach(s => { if (sel[s.k].length) l.push(`• ${s.nome}: ${sel[s.k].join(', ')}`); });
    if (sel.extra.length) l.push(`• Extras: ${sel.extra.map(v => v.split('|')[1] + ' (' + v.split('|')[0].toLowerCase() + ')').join(', ')}`);
    const t = totalExtras(); if (t) l.push(`Adicionais: +${brl(t)}`);
    return l.join('\n');
  }
  const cp = document.getElementById('copiar-poke');
  if (cp) cp.addEventListener('click', () => window.pkCopiar ? pkCopiar(textoPedido()) : null);

  function render() { renderPassos(); renderPainel(); renderTigela(); }
  render();
})();
