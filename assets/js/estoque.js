/* =========================================================
   Pizzaria San Francisco — Estoque (aba "Estoque" do painel)
   Criasiteweb

   Mesmo padrão do portal do Mercado Já: cada item do cardápio pode ter
   quantidade, aviso de fim e código de barras. Quem não receber
   quantidade fica SEM controle — é o caso das pizzas, que são montadas
   na hora. Quem tem quantidade (bebida, cerveja, água) baixa sozinho a
   cada comanda fechada no balcão.

   O estoque fica guardado no servidor (publico/estoque), igual aos
   ajustes do cardápio. Quando um item zera, ele também é marcado como
   esgotado no cardápio, e o site do cliente para de vender na hora.
   ========================================================= */

window.estoque = window.estoque || {};   // { id: {q, min, cod} }

let estGrupo = "todos";
let estBusca = "";
let estSo = "";          // "" | "controlado" | "falta"
let estSujo = false;

function estEscapa(s) {
  return String(s == null ? "" : s).replace(/[<>&"]/g, c =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

function estItem(id) {
  const i = window.estoque[id] || {};
  return {
    q: typeof i.q === "number" ? i.q : null,
    min: Number(i.min) || 0,
    cod: i.cod || ""
  };
}

/* item sem quantidade não tem controle; com quantidade, acaba em zero */
function estNoFim(id) {
  const e = estItem(id);
  if (e.q === null) return false;
  return e.q <= 0 || (e.min > 0 && e.q <= e.min);
}

function estEsgotado(id) {
  const e = estItem(id);
  return e.q !== null && e.q <= 0;
}

/* lista do aviso de topo: o que precisa comprar */
window.estEmFalta = function () {
  const base = typeof CARDAPIO !== "undefined" ? CARDAPIO : [];
  return base.filter(i => estNoFim(i.id));
};

function estMarcarSujo(sujo) {
  estSujo = sujo;
  const st = document.querySelector("[data-est-status]");
  if (st) {
    st.textContent = sujo ? "Alterações não salvas" : "";
    st.dataset.sujo = String(sujo);
  }
}

function estGravarCampo(id, campo, valor) {
  window.estoque[id] = window.estoque[id] || {};
  if (valor === null || valor === "" || valor === 0) delete window.estoque[id][campo];
  else window.estoque[id][campo] = valor;
  if (!Object.keys(window.estoque[id]).length) delete window.estoque[id];
  estMarcarSujo(true);
}

/* =========================================================
   Baixa automática: comanda fechada no balcão tira do estoque
   ========================================================= */
window.estBaixar = function (itens) {
  let mexeu = false;
  (itens || []).forEach(l => {
    if (!l.ref) return;                       // item avulso não tem ficha
    const e = estItem(l.ref);
    if (e.q === null) return;                 // sem controle: não mexe
    const novo = Math.max(0, e.q - (Number(l.q) || 0));
    window.estoque[l.ref] = window.estoque[l.ref] || {};
    window.estoque[l.ref].q = novo;
    mexeu = true;
    if (novo <= 0) estMarcarEsgotadoNoCardapio(l.ref, true);
  });
  if (mexeu && window.salvarEstoque) window.salvarEstoque(true);
  return mexeu;
};

/* zerou no estoque = some do site. Usa o mesmo "off" que o dono já usa
   na aba Cardápio, então o site não precisa aprender nada novo. */
function estMarcarEsgotadoNoCardapio(id, acabou) {
  if (typeof window.ajustes !== "object") return;
  window.ajustes[id] = window.ajustes[id] || {};
  if (acabou) window.ajustes[id].off = true;
  else delete window.ajustes[id].off;
  if (!Object.keys(window.ajustes[id]).length) delete window.ajustes[id];
  if (window.salvarCardapio) window.salvarCardapio(true);
}

/* =========================================================
   Tela
   ========================================================= */
function estDesenharGrupos() {
  const alvo = document.querySelector("[data-est-grupos]");
  if (!alvo) return;
  const grupos = typeof GRUPOS !== "undefined" ? GRUPOS : [];
  alvo.innerHTML =
    `<button type="button" data-est-grupo="todos" aria-pressed="${estGrupo === "todos"}">Tudo</button>` +
    grupos.map(g =>
      `<button type="button" data-est-grupo="${g.id}" aria-pressed="${estGrupo === g.id}">${estEscapa(g.rotulo)}</button>`
    ).join("");
}

function estNomeGrupo(gid) {
  const grupos = typeof GRUPOS !== "undefined" ? GRUPOS : [];
  const g = grupos.find(x => x.id === gid);
  return g ? g.rotulo : gid;
}

/* preço do item: pizza tem tamanho, o resto tem preço único */
function estPreco(i) {
  if (typeof i.p === "number") return reais(i.p);
  if (i.t) {
    const vals = Object.keys(i.t).map(k => i.t[k]);
    return `${reais(Math.min.apply(null, vals))} a ${reais(Math.max.apply(null, vals))}`;
  }
  return "";
}

function estFiltrar() {
  const base = typeof CARDAPIO !== "undefined" ? CARDAPIO : [];
  const busca = estBusca.trim().toLowerCase();
  return base.filter(i => {
    if (estGrupo !== "todos" && i.g !== estGrupo) return false;
    if (busca && i.n.toLowerCase().indexOf(busca) < 0) return false;
    const e = estItem(i.id);
    if (estSo === "controlado" && e.q === null) return false;
    if (estSo === "falta" && !estNoFim(i.id)) return false;
    return true;
  });
}

const EST_LIMITE = 60;

function estDesenharLista() {
  const alvo = document.querySelector("[data-est-lista]");
  if (!alvo) return;
  const achados = estFiltrar();

  if (!achados.length) {
    alvo.innerHTML = `<p class="est-vazio"><b>Nada encontrado</b>Mude a busca ou o grupo.</p>`;
    return;
  }

  alvo.innerHTML = achados.slice(0, EST_LIMITE).map(i => {
    const e = estItem(i.id);
    const fim = estNoFim(i.id);
    const zerado = estEsgotado(i.id);
    return `
    <div class="est-linha${fim ? " no-fim" : ""}" data-est-id="${i.id}">
      <div class="est-nome">
        ${estEscapa(i.n)}
        <span class="est-cat">${estEscapa(estNomeGrupo(i.g))}${estPreco(i) ? " · " + estPreco(i) : ""}</span>
      </div>
      <label class="est-campo"><span>Tem</span>
        <input type="number" step="1" min="0" data-est-campo="q"
               value="${e.q === null ? "" : e.q}" placeholder="sem controle" /></label>
      <label class="est-campo"><span>Avisar em</span>
        <input type="number" step="1" min="0" data-est-campo="min"
               value="${e.min || ""}" placeholder="0" /></label>
      <label class="est-campo est-campo-cod"><span>Código de barras</span>
        <input type="text" data-est-campo="cod" value="${estEscapa(e.cod)}" placeholder="bipe aqui" /></label>
      <button type="button" class="est-marcar" data-est-zerar aria-pressed="${zerado}">
        ${zerado ? "Acabou" : "Tem na loja"}</button>
    </div>`;
  }).join("") +
    (achados.length > EST_LIMITE
      ? `<p class="est-ajuda">Mostrando ${EST_LIMITE} de ${achados.length} itens. Refine a busca.</p>`
      : "");
}

function estDesenharAviso() {
  const alvo = document.querySelector("[data-est-aviso]");
  if (!alvo) return;
  const falta = window.estEmFalta();
  if (!falta.length) { alvo.hidden = true; return; }
  alvo.hidden = false;
  alvo.innerHTML = `<b>${falta.length}</b> ${falta.length === 1 ? "item está" : "itens estão"} no fim ou acabaram: ` +
    estEscapa(falta.slice(0, 6).map(i => i.n).join(", ")) + (falta.length > 6 ? "…" : "");
}

window.estDesenhar = function () {
  estDesenharGrupos();
  estDesenharLista();
  estDesenharAviso();
};

/* =========================================================
   Cliques e digitação
   ========================================================= */
document.addEventListener("click", ev => {
  const g = ev.target.closest("[data-est-grupo]");
  if (g) { estGrupo = g.dataset.estGrupo; window.estDesenhar(); return; }

  const z = ev.target.closest("[data-est-zerar]");
  if (z) {
    const id = z.closest("[data-est-id]").dataset.estId;
    const e = estItem(id);
    const acabou = !estEsgotado(id);
    window.estoque[id] = window.estoque[id] || {};
    window.estoque[id].q = acabou ? 0 : (e.min > 0 ? e.min + 1 : 1);
    estMarcarEsgotadoNoCardapio(id, acabou);
    estMarcarSujo(true);
    window.estDesenhar();
    return;
  }

  if (ev.target.closest("[data-est-salvar]")) {
    if (window.salvarEstoque) window.salvarEstoque(false);
  }
});

document.addEventListener("input", ev => {
  if (ev.target.matches("[data-est-busca]")) {
    estBusca = ev.target.value;
    estDesenharLista();
  }
});

document.addEventListener("change", ev => {
  if (ev.target.matches("[data-est-so]")) {
    estSo = ev.target.value;
    window.estDesenhar();
    return;
  }
  const campo = ev.target.closest("[data-est-campo]");
  if (!campo) return;
  const linha = campo.closest("[data-est-id]");
  const id = linha.dataset.estId;
  const nome = campo.dataset.estCampo;

  if (nome === "cod") {
    estGravarCampo(id, "cod", campo.value.trim());
    return;
  }
  const bruto = campo.value.trim();
  if (nome === "q") {
    if (bruto === "") { estGravarCampo(id, "q", null); estMarcarEsgotadoNoCardapio(id, false); }
    else {
      const v = Math.max(0, Number(bruto) || 0);
      window.estoque[id] = window.estoque[id] || {};
      window.estoque[id].q = v;
      estMarcarSujo(true);
      estMarcarEsgotadoNoCardapio(id, v <= 0);
    }
  } else {
    estGravarCampo(id, "min", Math.max(0, Number(bruto) || 0));
  }
  window.estDesenhar();
});

/* bipar o código de barras na busca cai direto no item */
document.addEventListener("keydown", ev => {
  if (!ev.target.matches("[data-est-busca]") || ev.key !== "Enter") return;
  ev.preventDefault();
  const codigo = ev.target.value.trim();
  const achado = Object.keys(window.estoque).find(id => (window.estoque[id].cod || "") === codigo);
  if (!achado) return;
  const item = (typeof CARDAPIO !== "undefined" ? CARDAPIO : []).find(i => i.id === achado);
  if (!item) return;
  ev.target.value = item.n;
  estBusca = item.n;
  estGrupo = "todos";
  window.estDesenhar();
});

window.addEventListener("beforeunload", e => {
  if (!estSujo) return;
  e.preventDefault();
  e.returnValue = "";
});
