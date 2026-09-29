/* =========================================================
   Pizzaria San Francisco — cardápio digital + carrinho + WhatsApp
   Criasiteweb
   ---------------------------------------------------------
   PARA EDITAR: o bloco LOJA abaixo tem tudo que muda.
   Preços e itens vêm do cardápio oficial da lanchonete.
   ========================================================= */

const LOJA = {
  nome: "Pizzaria San Francisco",
  /* WhatsApp de TESTE da Cria Site (modelo). Trocar pelo da pizzaria (folheto: 98535-4287 / 97210-7132) quando fechar. */
  whatsapp: "5511971003058",
  endereco: "Rua Eugênio Roncon, 175 - Roncon, Ribeirão Pires - SP",
  preparo: "40 a 60 min",              // [CONFIRMAR com o dono]
  /* Folheto: aberto de terça a domingo, das 18h às 23h30.
     Véspera de feriado e feriado abre normalmente. */
  abre: 18,
  fecha: 23.5,
  diasFechados: [1],                   // segunda-feira

  /* Tabela de entrega: pedir ao dono. Enquanto não tiver,
     a taxa aparece "a combinar" no WhatsApp. */
  entrega: {
    ativa: true,
    raioKm: 0,
    /* Bairros de Ribeirão Pires com taxa "a combinar" (null) até o dono
       passar a tabela dele. */
    cidades: {
      "Ribeirão Pires": {
        "Alvorada": null,
        "Ana Rosa (Mercado Fã)": null,
        "Angelino, F. Gianazzi": null,
        "Barro Branco": null,
        "Bertoldo": null,
        "Bosque Santana": null,
        "Centro Alto": null,
        "Centro Baixo": null,
        "Chácara dos Sonhos": null,
        "Clube de Campo": null,
        "Colônia": null,
        "Estância Noblesse": null,
        "Fazenda Matarazzo": null,
        "Iramaia": null,
        "Jardim Aprazível": null,
        "Jardim Bandeirantes": null,
        "Jardim dos Eucaliptos": null,
        "Jardim dos Lagos": null,
        "Jardim Caçula": null,
        "Jardim Esperança": null,
        "Jardim Guanabara": null,
        "Jardim Itacolomi": null,
        "Jardim Luzo": null,
        "Jardim Mirante": null,
        "Jardim Santa Inês": null,
        "Jardim Serrano": null,
        "Jardim São Francisco": null,
        "Jardim União": null,
        "Jardim Valentina": null,
        "Júlio Prestes de Albuquerque S MJ": null,
        "KM 4": null,
        "Lusitano / Luzitano": null,
        "Nossa Senhora de Fátima": null,
        "Ouro Fino (Antes da linha)": null,
        "Ouro Fino (Depois da linha)": null,
        "Ouro Fino (Depois da passarela)": null,
        "Palmeiras": null,
        "Parque Aliança": null,
        "Parque Andréense": null,
        "Parque das Fontes": null,
        "Parque do Governador": null,
        "Pereira Barreto": null,
        "Petrópolis": null,
        "Pilar Velho": null,
        "Planalto Bela Vista": null,
        "Ponte Seca": null,
        "Pouso Alegre": null,
        "Próxima Padaria Neves": null,
        "Quarta Divisão": null,
        "Rancho Alegre": null,
        "Recanto Suíço": null,
        "Represa": null,
        "Roncon": null,
        "Rua 2, 3 e 4 Sítio Maria Joana": null,
        "Rua Chile SMJ": null,
        "Rua dos Canais (Canários)": null,
        "Rua Jangadeiro": null,
        "Santa Clara": null,
        "Santa Luzia": null,
        "Santa Rosa": null,
        "Santana": null,
        "Sol Nascente": null,
        "Soma": null,
        "São Caetaninho": null,
        "São Pedro (Palmeiras)": null,
        "Sítio dos Vianas": null,
        "Sítio Pinheiros": null,
        "Tavolaro": null,
        "Vila Lopes": null,
        "Vila São João": null,
        "Vila Aparecida": null,
        "Vila Conceição": null,
        "Vila Mara": null,
        "Vila Caiçara": null,
        "Vila Suíça": null,
        "Vila Aurora": null,
        "Vila Marquesa": null,
        "Vila Sueli": null,
        "Vila Bocaina": null,
        "Vila Gomes": null,
        "Vila Verde": null,
        "Vila Belmiro": null
      }
    },
    porDistancia: { ativa: false, base: 0, ateKm: 0, porKm: 0, maxKm: 0, fator: 1.3 },
    foraDaLista: null
  },

  linkComanda: false
};

/* =========================================================
   MODO MESA (página restaurante.html)
   Quando o endereço vem com ?mesa=7, o site vira o cardápio
   de dentro do restaurante: só "No restaurante", sem endereço
   nem forma de pagamento, e o pedido cai direto na comanda
   daquela mesa no painel. É o mesmo app.js do site normal,
   este parâmetro nunca aparece em index.html. */
const MESA_ATUAL = new URLSearchParams(location.search).get("mesa");

/* transforma texto em código para caber no link da comanda */
/* =========================================================
   PROJETO NO SERVIDOR (Firebase)
   ---------------------------------------------------------
   É daqui que o site lê o cardápio ajustado pelo dono e o
   aviso de loja aberta ou fechada. Precisa ser o MESMO
   projeto que está em assets/js/firebase-config.js.

   ⚠️ Enquanto estiver "TROCAR", o site não consulta servidor
   nenhum: o cardápio e o horário valem pelos arquivos. Nunca
   deixar aqui o projeto de outro cliente, senão este site
   passa a mostrar o cardápio do cliente errado.
   ========================================================= */
const PROJETO_SERVIDOR = "pizzaria-san-francisco-pedidos";   // projeto PRÓPRIO da San Francisco
const TEM_SERVIDOR = PROJETO_SERVIDOR && PROJETO_SERVIDOR !== "TROCAR";
const urlServidor = doc =>
  `https://firestore.googleapis.com/v1/projects/${PROJETO_SERVIDOR}/databases/(default)/documents/publico/${doc}`;

function paraLink(txt) {
  const bytes = new TextEncoder().encode(txt);
  let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* ---- adicionais ---- */
/* ---- adicionais, grupos e itens do cardápio vivem em cardapio.js ---- */

/* O navegador guarda onde a pessoa parou e devolve ali na volta, o que fazia
   o site abrir no meio dos combos. Quem chega pelo link tem que ver o começo.
   Só respeitamos a rolagem quando o próprio endereço aponta para uma seção. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
(function comecarNoTopo() {
  const temAncora = location.hash && location.hash.length > 1;
  if (temAncora) return;
  const subir = () => window.scrollTo(0, 0);
  subir();
  window.addEventListener("load", subir, { once: true });
})();

/* ========================= utilidades ========================= */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reais = v => "R$ " + v.toFixed(2).replace(".", ",");

/* ================= apoio da pizza =================
   O tamanho manda no preço. O meio a meio cobra o sabor mais caro,
   que é como toda pizzaria da região trabalha. */
const TAM       = id => TAMANHOS.find(t => t.id === id) || TAMANHOS[0];
const ehPizza   = it => !!(it && it.pz);
const ehCombo   = it => !!(it && it.pzcombo);
const precoSabor = (it, tamId) => ehPizza(it) ? Number((it.t || {})[tamId] || 0) : Number(it.p || 0);
const precoDe    = it => ehPizza(it) ? Number((it.t || {})[TAMANHOS[0].id] || 0) : Number(it.p || 0);
const saboresDoGrupo = g => CARDAPIO.filter(i => i.g === g && i.pz && !i.off);
/* meio a meio livre: salgada com doce também vale, é comum o cliente pedir
   assim (pedido do Matheus, 25/09/2026) */
const todosSaboresPizza = () => CARDAPIO.filter(i => i.pz && !i.off);

function tamEscolhido() {
  if (itemAtual && ehCombo(itemAtual)) return itemAtual.pzcombo;
  const r = $("[data-tam]:checked");
  return r ? r.value : (TAMANHOS[TAMANHOS.length - 1] || TAMANHOS[0]).id;
}
function bordaEscolhida() {
  const sel = $("[data-borda]");
  if (!sel) return null;
  return BORDAS_SALGADA.concat(BORDAS_DOCE).find(b => b.n === sel.value) || null;
}
function nomeDoSabor(id) {
  const s = CARDAPIO.find(i => i.id === id);
  return s ? s.n : "";
}
const CHAVE = "vitoria:carrinho";
/* Por quanto tempo o carrinho continua guardado no aparelho. Sem isto, quem
   pedia hoje voltava amanhã e encontrava a sacola cheia do pedido antigo. */
const VALIDADE_CARRINHO = 3 * 60 * 60 * 1000;   // 3 horas

let carrinho = [];
try {
  const guardado = JSON.parse(localStorage.getItem(CHAVE) || "null");
  if (Array.isArray(guardado)) {
    carrinho = guardado;                       // formato antigo, sem hora
  } else if (guardado && Array.isArray(guardado.itens)) {
    const velho = Date.now() - (guardado.em || 0) > VALIDADE_CARRINHO;
    carrinho = velho ? [] : guardado.itens;
    if (velho) localStorage.removeItem(CHAVE);
  }
} catch (e) { carrinho = []; }

/* ========================= cardápio =========================
   Cardápio único, uma grade só de sabores (Salgadas e Doces como
   filtro, igual às outras categorias). Tamanho (Broto/Grande) e
   meio a meio são escolhidos dentro do próprio sabor, ao abrir o
   card — é o padrão testado por cardápio digital de pizzaria
   (iFood, Consumer, ClickPede etc.): uma grade só, sem multiplicar
   a navegação por tamanho. Pesquisado e decidido em 25/09/2026. */
function cartaoItem(i) {
  const preco = ehPizza(i) && TAMANHOS.length > 1
    ? `<small>a partir de</small> ${reais(precoDe(i))}`
    : reais(i.p);
  return `
    <button class="item" type="button" data-item="${i.id}" data-texto="${paraBusca(i.n + " " + (i.d || ""))}">
      <span class="item-foto">
        <img src="${i.foto || `assets/img/fotos/${i.f}.png`}" alt="${i.n}" loading="lazy" decoding="async" width="560" height="420" />
        ${i.tag ? `<span class="etiqueta">${i.tag}</span>` : ""}
      </span>
      <span class="item-corpo">
        <span class="item-nome">${i.n}</span>
        ${i.d ? `<span class="item-desc">${i.d}</span>` : ""}
        <span class="item-rodape">
          <span class="item-preco">${preco}</span>
          <span class="item-mais" aria-hidden="true">+</span>
        </span>
      </span>
    </button>`;
}

/* ========================= busca no cardápio =========================
   São quase 200 itens: quem quer "calabresa" digita em vez de rolar.
   Procura no nome e na descrição, sem diferença de acento nem de
   maiúscula, e cada palavra digitada precisa aparecer. */
const paraBusca = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/"/g, "");
let buscaAtual = "";

function aplicarBusca() {
  const alvo = $("[data-cardapio]");
  const aviso = $("[data-busca-resultado]");
  if (!alvo) return;
  const palavras = paraBusca(buscaAtual).split(/[^a-z0-9]+/).filter(Boolean);
  const contador = (g, n) => {
    const span = $(".grupo-topo span", g), nota = $(".grupo-nota", g);
    if (span) span.textContent = n == null ? span.dataset.total : `${n} ${n === 1 ? "encontrado" : "encontrados"}`;
    if (nota) nota.hidden = n != null;
  };
  if (!palavras.length) {
    $$(".grupo", alvo).forEach(g => contador(g, null));
    $$(".item", alvo).forEach(i => { i.hidden = false; });
    $$(".grupo", alvo).forEach(g => { g.hidden = filtroAtivo !== "todos" && g.dataset.grupo !== filtroAtivo; });
    if (aviso) aviso.hidden = true;
    return;
  }
  let achados = 0;
  $$(".grupo", alvo).forEach(g => {
    let noGrupo = 0;
    $$(".item", g).forEach(i => {
      /* cada palavra digitada casa com o começo de uma palavra do item:
         "coca" acha Coca-Cola e não Paçoca */
      const termos = i.dataset.texto.split(/[^a-z0-9]+/);
      const ok = palavras.every(p => termos.some(t => t.startsWith(p)));
      i.hidden = !ok;
      if (ok) noGrupo++;
    });
    g.hidden = !noGrupo;
    contador(g, noGrupo);
    achados += noGrupo;
  });
  if (aviso) {
    aviso.hidden = false;
    aviso.textContent = achados
      ? `${achados} ${achados === 1 ? "item encontrado" : "itens encontrados"} para "${buscaAtual.trim()}".`
      : `Nada encontrado para "${buscaAtual.trim()}". Tente outro nome ou chame a gente no WhatsApp.`;
  }
}

let filtroAtivo = "todos", observadorGrupos = null;
function montarCardapio() {
  const alvo = $("[data-cardapio]");
  const filtros = $("[data-filtros]");
  const grupos = GRUPOS.filter(g => g.id !== "promocoes");

  filtros.innerHTML =
    `<button type="button" role="tab" aria-selected="true" data-f="todos">Tudo</button>` +
    grupos.map(g => `<button type="button" role="tab" aria-selected="false" data-f="${g.id}">${g.rotulo}</button>`).join("");

  alvo.innerHTML = grupos.map(g => {
    const itens = CARDAPIO.filter(i => i.g === g.id && !i.off);
    return `
      <div class="grupo" data-grupo="${g.id}">
        <div class="grupo-topo">
          <h3>${g.titulo}</h3>
          <span data-total="${itens.length} ${itens.length === 1 ? "opção" : "opções"}">${itens.length} ${itens.length === 1 ? "opção" : "opções"}</span>
        </div>
        ${g.nota ? `<p class="grupo-nota">${g.nota}</p>` : ""}
        <div class="lista-itens">${itens.map(cartaoItem).join("")}</div>
      </div>`;
  }).join("");

  /* montarCardapio roda de novo quando o dono muda o cardápio: a tela volta
     para "Tudo" e os grupos novos passam a ser acompanhados na rolagem.
     Os cliques só são ligados na primeira vez, senão cada item abria N vezes. */
  filtroAtivo = "todos";
  aplicarBusca();
  if (observadorGrupos) { observadorGrupos.disconnect(); $$(".grupo", alvo).forEach(g => observadorGrupos.observe(g)); }
  if (alvo.dataset.ligado) return;
  alvo.dataset.ligado = "sim";
  filtros.addEventListener("click", e => {
    const b = e.target.closest("button[data-f]");
    if (!b) return;
    $$("button", filtros).forEach(x => x.setAttribute("aria-selected", String(x === b)));
    filtroAtivo = b.dataset.f;
    /* tocar num grupo limpa a busca: senão o grupo aparecia vazio */
    const campo = $("[data-busca-cardapio]");
    if (buscaAtual && campo) { campo.value = ""; buscaAtual = ""; }
    aplicarBusca();
    /* depois de filtrar, a página encolhe (grupos escondidos somem),
       então rola até o topo do grupo escolhido pra não sobrar no final
       da página com a posição de rolagem antiga */
    const destino = filtroAtivo === "todos" ? alvo : $(`.grupo[data-grupo="${filtroAtivo}"]`, alvo);
    if (destino) destino.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  alvo.addEventListener("click", e => {
    const b = e.target.closest("[data-item]");
    if (b) abrirModal(b.dataset.item);
  });

  const campoBusca = $("[data-busca-cardapio]");
  if (campoBusca) {
    campoBusca.addEventListener("input", () => {
      buscaAtual = campoBusca.value;
      if (buscaAtual.trim() && filtroAtivo !== "todos") {
        filtroAtivo = "todos";
        $$("button", filtros).forEach(x => x.setAttribute("aria-selected", String(x.dataset.f === "todos")));
      }
      aplicarBusca();
    });
    campoBusca.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); campoBusca.blur(); } });
  }

  /* filtro acompanha a rolagem: só faz sentido quando "Tudo" está
     selecionado, já que nos outros só uma categoria fica visível */
  if ("IntersectionObserver" in window) {
    const observador = observadorGrupos = new IntersectionObserver(entradas => {
      if (filtroAtivo !== "todos" || buscaAtual.trim()) return;
      entradas.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.dataset.grupo;
        $$("button", filtros).forEach(x => x.setAttribute("aria-selected", String(x.dataset.f === id)));
      });
    }, { rootMargin: "-100px 0px -72% 0px", threshold: 0 });
    $$(".grupo", alvo).forEach(g => observador.observe(g));
  }
}

/* ================= blocos da montagem da pizza ================= */
function blocoTamanhos(it) {
  const padrao = (TAMANHOS[TAMANHOS.length - 1] || TAMANHOS[0]).id;
  return `<div class="extras-bloco">
    <p class="extras-titulo">Escolha o tamanho</p>
    <div class="tamanhos">
      ${TAMANHOS.map(t => `
        <label class="tam">
          <input type="radio" name="tamanho" data-tam value="${t.id}" ${t.id === padrao ? "checked" : ""} />
          <span class="tam-corpo">
            ${t.tag ? `<em>${t.tag}</em>` : ""}
            <b>${t.n}</b>
            <small>${t.d}</small>
            <i>${reais((it.t || {})[t.id] || 0)}</i>
            <u>${t.sabores > 1 ? `até ${t.sabores} sabores` : "1 sabor"}</u>
          </span>
        </label>`).join("")}
    </div>
  </div>`;
}

function blocoSabores(it) {
  const t = TAM(tamEscolhido());
  if (t.sabores < 2) {
    return `<div class="extras-bloco">
      <p class="extras-titulo">Sabor</p>
      <p class="extras-ajuda">Pizza ${t.n} inteira, 1 sabor só: <b>${it.n}</b>.</p>
    </div>`;
  }
  const lista = todosSaboresPizza().filter(s => s.id !== it.id);
  const salgadas = lista.filter(s => s.g === "salgadas");
  const doces = lista.filter(s => s.g === "doces");
  const opcoesSabor = `
    <option value="">Não quero, só ${it.n}</option>
    ${salgadas.length ? `<optgroup label="Pizza salgada">
      ${salgadas.map(s => `<option value="${s.id}">${s.n} — ${reais(s.t[t.id])}</option>`).join("")}
    </optgroup>` : ""}
    ${doces.length ? `<optgroup label="Pizza doce">
      ${doces.map(s => `<option value="${s.id}">${s.n} — ${reais(s.t[t.id])}</option>`).join("")}
    </optgroup>` : ""}`;
  return `<div class="extras-bloco">
    <p class="extras-titulo">Meio a meio</p>
    <p class="extras-ajuda">O tamanho ${t.n} aceita até ${t.sabores} sabores. Você paga o preço do sabor mais caro, sem taxa nenhuma a mais.</p>
    <div class="sabor-fixo"><b>1º sabor</b><span>${it.n}</span></div>
    ${Array.from({ length: t.sabores - 1 }, (_, k) => `
      <label class="escolha">${k + 2}º sabor <small>(opcional)</small>
        <select data-sabor>${opcoesSabor}</select>
      </label>`).join("")}
  </div>`;
}

function blocoComboSabores(it) {
  const t = TAM(it.pzcombo);
  const quantas = it.combo2 ? 2 : 1;
  /* quando a promoção vale só para alguns sabores, a lista respeita isso */
  const lista = it.sabores && it.sabores.length
    ? CARDAPIO.filter(i => i.pz && !i.off && it.sabores.includes(i.id))
    : CARDAPIO.filter(i => i.pz && !i.off);
  let h = "";
  for (let n = 0; n < quantas; n++) {
    h += `<div class="extras-bloco">
      <p class="extras-titulo">${quantas > 1 ? `${n + 1}ª pizza` : "Escolha os sabores"} · ${t.n}</p>
      ${Array.from({ length: t.sabores }, (_, k) => `
        <label class="escolha">${k === 0 ? "Sabor" : `${k + 1}º sabor <small>(opcional)</small>`}
          <select data-sabor-combo data-pizza="${n}">
            ${k === 0 ? "" : `<option value="">Não quero</option>`}
            ${lista.map(s => `<option value="${s.id}">${s.n}</option>`).join("")}
          </select>
        </label>`).join("")}
    </div>`;
  }
  return h;
}

/* borda doce (chocolate etc.) só faz sentido em pizza doce; a pizza
   salgada oferece a recheada de catupiry original */
function blocoBorda(it) {
  const lista = it && it.g === "doces" ? BORDAS_DOCE : BORDAS_SALGADA;
  return `<div class="extras-bloco">
    <label class="escolha">Borda recheada <small>(opcional)</small>
      <select data-borda>
        ${lista.map(b => `<option value="${b.n}">${b.n}${b.p ? ` — + ${reais(b.p)}` : ""}</option>`).join("")}
      </select>
    </label>
  </div>`;
}

/* ========================= modal do item ========================= */
let itemAtual = null, qtdAtual = 1;

function abrirModal(id) {
  const it = CARDAPIO.find(i => i.id === id);
  if (!it) return;
  itemAtual = it; qtdAtual = 1;
  medir("produto_aberto", { id: it.id, item: nomeDoItem(it), categoria: (GRUPOS.find(g => g.id === it.g) || {}).titulo || "", origem: MESA_ATUAL ? "mesa" : "site" });

  const mf = $("[data-modal-foto]");
  mf.src = it.foto || `assets/img/fotos/${it.f}.png`;
  mf.alt = it.n;
  $("[data-modal-cat]").textContent = GRUPOS.find(g => g.id === it.g).titulo;
  $("[data-modal-nome]").textContent = it.n;
  const desc = $("[data-modal-desc]");
  desc.textContent = it.d || "";
  desc.hidden = !it.d;
  $("[data-modal-obs]").value = "";
  $("[data-modal-qtd]").textContent = "1";

  const extras = $("[data-modal-extras]");
  let html = "";

  if (ehPizza(it)) {
    if (TAMANHOS.length > 1) html += blocoTamanhos(it);
    if (it.escolherIngredientes) {
      html += `<div class="extras-bloco">
        <p class="extras-titulo">Escolha ${it.escolherIngredientes} ingredientes</p>
        <p class="extras-ajuda" data-freg-contador>Marque exatamente ${it.escolherIngredientes}.</p>
        <div class="extras-lista">
          ${INGREDIENTES_FREGUES.map(i => `
            <label class="extra">
              <input type="checkbox" data-ingrediente value="${i}" />
              <span>${i}</span>
            </label>`).join("")}
        </div>
      </div>`;
    } else {
      html += `<div data-sabores></div>`;
    }
    html += blocoBorda(it);
  }
  if (ehCombo(it)) {
    html += blocoComboSabores(it);
    html += blocoBorda(it);
  }
  if (it.opcoes) {
    html += `<div class="extras-bloco">
      <label class="escolha">Escolha
        <select data-opcao required>${it.opcoes.map(o => `<option>${o}</option>`).join("")}</select>
      </label>
    </div>`;
  }
  if (it.escolhas) {
    html += `<div class="extras-bloco">
      <p class="extras-titulo">Escolha os ${it.escolhas} lanches</p>
      ${Array.from({ length: it.escolhas }, (_, k) => `
        <label class="escolha">Lanche ${k + 1}
          <select data-escolha>${OPC_COMBO.map(o => `<option>${o}</option>`).join("")}</select>
        </label>`).join("")}
    </div>`;
  }
  if (it.add) {
    const lista = it.add === "lanche" ? ADD_LANCHE : ADD_PIZZA;
    html += `<div class="extras-bloco">
      <p class="extras-titulo">Adicionais (opcional)</p>
      <div class="extras-lista">
        ${lista.map(a => `
          <label class="extra">
            <input type="checkbox" data-add value="${a.n}" data-preco="${a.p}" />
            <span>${a.n}</span><b>+ ${reais(a.p)}</b>
          </label>`).join("")}
      </div>
    </div>`;
  }
  extras.innerHTML = html;

  $("[data-modal]").hidden = false;
  document.body.classList.add("travado");
  marcarCamada();
  atualizarModal();
}

function precoModal() {
  if (!itemAtual) return 0;
  const adds = $$("[data-add]:checked").reduce((s, c) => s + Number(c.dataset.preco), 0);
  let base;

  if (ehPizza(itemAtual)) {
    const tam = tamEscolhido();
    base = precoSabor(itemAtual, tam);
    /* meio a meio: vale o sabor mais caro. No broto, meio a meio
       soma R$ 1,00 a mais (regra da casa). */
    let temSegundoSabor = false;
    $$("[data-sabor]").forEach(sel => {
      if (!sel.value) return;
      temSegundoSabor = true;
      const outro = CARDAPIO.find(i => i.id === sel.value);
      if (outro) base = Math.max(base, precoSabor(outro, tam));
    });
    if (tam === "broto" && temSegundoSabor) base += TAXA_MEIO_A_MEIO_BROTO;
  } else {
    base = Number(itemAtual.p || 0);
  }

  const borda = bordaEscolhida();
  if (borda) base += borda.p;

  return (base + adds) * qtdAtual;
}

function atualizarModal() {
  /* trocou o tamanho: a lista de sabores muda junto (broto não tem meio a meio) */
  if (itemAtual && ehPizza(itemAtual)) {
    const alvo = $("[data-sabores]");
    const tam = tamEscolhido();
    if (alvo && alvo.dataset.tam !== tam) {
      const antes = $$("[data-sabor]").map(s => s.value);
      alvo.innerHTML = blocoSabores(itemAtual);
      alvo.dataset.tam = tam;
      $$("[data-sabor]").forEach((s, k) => {
        if (antes[k] && [...s.options].some(o => o.value === antes[k])) s.value = antes[k];
      });
    }
  }
  if (itemAtual && itemAtual.escolherIngredientes) {
    const max = itemAtual.escolherIngredientes;
    const marcados = $$("[data-ingrediente]:checked");
    $$("[data-ingrediente]").forEach(c => { c.disabled = !c.checked && marcados.length >= max; });
    const contador = $("[data-freg-contador]");
    if (contador) contador.textContent = `${marcados.length} de ${max} marcados.`;
  }

  $("[data-modal-total]").textContent = reais(precoModal());
  $("[data-modal-qtd]").textContent = String(qtdAtual);
}
function fecharModal(peloVoltar) {
  $("[data-modal]").hidden = true;
  itemAtual = null;
  if (!$("[data-carrinho]").dataset.aberto) document.body.classList.remove("travado");
  if (peloVoltar !== true) soltarCamada();
}

/* ================= botão voltar do celular =================
   Com a janela do item ou o carrinho aberto, o voltar do celular
   saía do site. Agora cada abertura deixa um passo no histórico:
   voltar fecha a janela (ou o carrinho) e o cliente continua aqui. */
let camadaNoHistorico = false, voltando = false;
const camadaAberta = () => !$("[data-modal]").hidden || !!$("[data-carrinho]").dataset.aberto;

function marcarCamada() {
  if (camadaNoHistorico || voltando) return;
  try { history.pushState({ pvCamada: true }, ""); camadaNoHistorico = true; } catch (e) {}
}
function soltarCamada() {
  if (!camadaNoHistorico || camadaAberta()) return;
  camadaNoHistorico = false;
  voltando = true;
  history.back();
}
window.addEventListener("popstate", () => {
  if (voltando) {                         // foi o próprio site que voltou
    voltando = false;
    if (camadaAberta()) marcarCamada();   // abriu outra camada nesse meio tempo
    return;
  }
  if (!camadaNoHistorico) return;
  camadaNoHistorico = false;
  if (!$("[data-modal]").hidden) fecharModal(true);
  else if ($("[data-carrinho]").dataset.aberto) abrirCarrinho(false, true);
  if (camadaAberta()) marcarCamada();     // carrinho continua aberto atrás da janela
});

/* =========================================================
   CUPOM DE DESCONTO
   ========================================================= */
let cupomAtivo = null;

function acharCupom(codigo) {
  const c = String(codigo || "").trim().toUpperCase();
  if (!c) return null;
  return (typeof CUPONS !== "undefined" ? CUPONS : []).find(x => x.codigo.toUpperCase() === c) || null;
}

/* Quanto o cupom tira deste pedido, já conferindo o valor mínimo. */
function descontoAtual() {
  const vazio = { tipo: null, valor: 0, rotulo: "" };
  if (!cupomAtivo) return vazio;
  const sub = subtotal();
  if (sub < (cupomAtivo.minimo || 0)) return vazio;

  if (cupomAtivo.tipo === "percentual") {
    return { tipo: "percentual", valor: Math.round(sub * cupomAtivo.valor) / 100,
             rotulo: `Cupom ${cupomAtivo.codigo} (${cupomAtivo.valor}%)` };
  }
  if (cupomAtivo.tipo === "valor") {
    return { tipo: "valor", valor: Math.min(cupomAtivo.valor, sub),
             rotulo: `Cupom ${cupomAtivo.codigo}` };
  }
  if (cupomAtivo.tipo === "frete") {
    const t = tipoEscolhido() === "Entrega" ? taxaEntrega() : 0;
    const taxa = (typeof t === "number") ? t : 0;
    return { tipo: "frete", valor: taxa, rotulo: `Cupom ${cupomAtivo.codigo} (entrega grátis)` };
  }
  return vazio;
}

function aplicarCupom() {
  const campo = $("[data-campo-cupom]");
  const aviso = $("[data-cupom-aviso]");
  if (!campo || !aviso) return;
  const c = acharCupom(campo.value);

  if (!c) {
    cupomAtivo = null;
    aviso.hidden = false; aviso.dataset.erro = "true";
    aviso.textContent = "Cupom não encontrado. Confira as letras e tente de novo.";
  } else if (subtotal() < (c.minimo || 0)) {
    cupomAtivo = null;
    aviso.hidden = false; aviso.dataset.erro = "true";
    aviso.textContent = `Esse cupom vale para pedidos a partir de ${reais(c.minimo)}. Falta ${reais(c.minimo - subtotal())}.`;
  } else {
    cupomAtivo = c;
    aviso.hidden = false; delete aviso.dataset.erro;
    aviso.textContent = `Cupom aplicado: ${c.texto}`;
  }
  pintarCarrinho();
}

function pintarDesconto() {
  const linha = $("[data-linha-desconto]");
  if (!linha) return;
  const d = descontoAtual();
  linha.hidden = !(d.valor > 0);
  if (d.valor > 0) {
    $("[data-desconto-rot]").textContent = d.rotulo;
    $("[data-desconto-valor]").textContent = "− " + reais(d.valor);
  }
}

/* =========================================================
   CARTÃO FIDELIDADE
   ========================================================= */
const CHAVE_FID = "vitoria:fidelidade";

function lerFid() {
  try {
    const f = JSON.parse(localStorage.getItem(CHAVE_FID) || "null");
    if (f && typeof f.pedidos === "number") return f;
  } catch (e) {}
  return { fone: "", pedidos: 0, premios: 0 };
}
function salvarFid(f) { try { localStorage.setItem(CHAVE_FID, JSON.stringify(f)); } catch (e) {} }

function pintarFidelidade() {
  const alvo = $("[data-selos]");
  if (!alvo || typeof FIDELIDADE === "undefined" || !FIDELIDADE.ativa) return;
  const f = lerFid();
  const feitos = f.pedidos % FIDELIDADE.meta;
  alvo.innerHTML = Array.from({ length: FIDELIDADE.meta }, (_, k) =>
    `<span class="selo-fid ${k < feitos ? "cheio" : ""}" aria-hidden="true">${k < feitos ? "★" : ""}</span>`).join("");
  const conta = $("[data-fid-conta]");
  if (conta) {
    conta.textContent = feitos === 0 && f.pedidos > 0
      ? `Cartão completo! No próximo pedido avise que você tem direito a ${FIDELIDADE.premio}.`
      : `${feitos} de ${FIDELIDADE.meta} pedidos. Faltam ${FIDELIDADE.meta - feitos} para ganhar ${FIDELIDADE.premio}.`;
  }
}

/* Soma um selo depois que o pedido foi enviado.
   Devolve true quando este pedido fechou o cartão. */
function somarFidelidade(fone) {
  if (typeof FIDELIDADE === "undefined" || !FIDELIDADE.ativa) return false;
  const f = lerFid();
  /* outro cliente usando o mesmo aparelho começa o cartão dele do zero */
  if (f.fone && f.fone !== fone) { f.pedidos = 0; f.premios = 0; }
  f.fone = fone;
  f.pedidos += 1;
  const fechou = f.pedidos % FIDELIDADE.meta === 0;
  if (fechou) f.premios += 1;
  salvarFid(f);
  pintarFidelidade();
  return fechou;
}

/* ========================= carrinho ========================= */
function salvar() {
  try {
    if (!carrinho.length) { localStorage.removeItem(CHAVE); return; }
    localStorage.setItem(CHAVE, JSON.stringify({ itens: carrinho, em: Date.now() }));
  } catch (e) {}
}

/* depois de enviar, a sacola some: o pedido já foi para o WhatsApp */
function esvaziarDepoisDoEnvio() {
  carrinho = [];
  try { localStorage.removeItem(CHAVE); } catch (e) {}
  pintarCarrinho();
  const f = $("[data-checkout]") || document.querySelector("form");
  if (f && f.reset) {
    const nome = f.nome ? f.nome.value : "";
    const fone = f.fone ? f.fone.value : "";
    f.reset();
    /* nome e telefone ficam: é a mesma pessoa pedindo de novo */
    if (f.nome) f.nome.value = nome;
    if (f.fone) f.fone.value = fone;
  }
  abrirCarrinho(false);
}

/* "17 · Calabresa" -> "Calabresa" (o número do cardápio não ajuda a cozinha) */
const saborLimpo = n => String(n || "").replace(/^\d+\s*·\s*/, "");
/* "Borda de catupiry (grátis)" -> "Catupiry (grátis)";
   "Borda recheada — Chocolate" -> "Recheada de chocolate" */
function rotuloBorda(n) {
  const s = String(n || "");
  if (/^sem borda/i.test(s)) return "Sem borda";
  const r = s.match(/^Borda recheada\s*[—-]\s*(.+)$/i);
  if (r) return "Recheada de " + r[1].charAt(0).toLowerCase() + r[1].slice(1);
  const g = s.match(/^Borda de\s+(.+)$/i);
  return g ? g[1].charAt(0).toUpperCase() + g[1].slice(1) : s;
}

/* ===== métricas de negócio (faro.js → Grafana) =====
   Cada linha do carrinho vira um retrato sem dado pessoal: produto,
   categoria, tamanho, meio a meio, borda, adicionais, quantidade e valor. */
const medir = (nome, dados) => { if (window.medir) window.medir(nome, dados); };
const dinheiro = v => (Math.round((Number(v) || 0) * 100) / 100).toFixed(2);
/* o card do cardápio que o cliente tocou: é a chave da taxa de aceitação
   (abriu → pôs no carrinho → pediu), mesmo que vire meio a meio depois */
const nomeDoItem = it => ehPizza(it) || ehCombo(it) ? saborLimpo(it.n) : nomeNoPedido(it);
function retratoDaLinha(l) {
  const it = CARDAPIO.find(i => i.id === l.id) || {};
  const grupo = GRUPOS.find(g => g.id === it.g);
  const tam = /^Pizza (\S+) ·/.exec(l.n || "");
  const borda = (l.det || []).find(d => d.startsWith("Borda: "));
  return {
    id: l.id,
    item: nomeDoItem(it) || l.n,
    /* meio a meio não é do 1º sabor: os sabores contam à parte em pedido_sabor */
    produto: (l.meio || []).length > 1 ? "Meio a meio"
      : ehPizza(it) || ehCombo(it) ? saborLimpo(it.n) : nomeNoPedido(it) || l.n,
    categoria: grupo ? grupo.titulo : "",
    tamanho: tam ? tam[1] : "",
    meio_a_meio: (l.meio || []).length > 1 ? "sim" : "não",
    sabores: (l.meio || []).length > 1 ? l.meio.join(" / ") : "",
    borda: borda ? borda.slice(7) : "",
    adicionais: (l.adds || []).map(a => a.n).join(", "),
    valor_adicionais: dinheiro((l.adds || []).reduce((t, a) => t + (Number(a.p) || 0), 0) * l.q),
    qtd: l.q,
    valor: dinheiro(l.unit * l.q),
    origem: MESA_ATUAL ? "mesa" : "site"
  };
}
function medirPedido(dados) {
  const pedido = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const retratos = carrinho.map(retratoDaLinha);
  const tem = cat => retratos.some(r => cat.includes((CARDAPIO.find(i => i.id === r.id) || {}).g));
  medir("pedido_enviado", Object.assign({
    pedido,
    origem: MESA_ATUAL ? "mesa" : "site",
    subtotal: dinheiro(subtotal()),
    total: dinheiro(totalDoPedido()),
    itens: totalItens(),
    linhas: carrinho.length,
    tem_pizza: tem(["salgadas", "doces"]) ? "sim" : "não",
    tem_promocao: tem(["promocoes"]) ? "sim" : "não",
    tem_bebida: tem(["refrigerantes", "cervejas", "sucos", "jarras", "bebidas"]) ? "sim" : "não",
    tem_porcao: tem(["porcoes", "pasteis", "pasteisdoces", "lanches"]) ? "sim" : "não"
  }, dados));
  retratos.forEach(r => {
    medir("pedido_item", Object.assign({ pedido }, r));
    /* cada sabor conta: inteira vale 1 pizza, meia vale meia */
    const sabores = r.sabores ? r.sabores.split(" / ") : (r.tamanho ? [r.produto] : []);
    sabores.forEach(sb => medir("pedido_sabor", {
      pedido, sabor: sb, tamanho: r.tamanho, categoria: r.categoria,
      pizzas: (r.qtd / sabores.length).toFixed(2), origem: r.origem
    }));
  });
}

function adicionarDoModal() {
  if (!itemAtual) return;

  if (itemAtual.escolherIngredientes) {
    const marcados = $$("[data-ingrediente]:checked");
    if (marcados.length !== itemAtual.escolherIngredientes) {
      alert(`Marque exatamente ${itemAtual.escolherIngredientes} ingredientes (você marcou ${marcados.length}).`);
      return;
    }
  }

  const adds = $$("[data-add]:checked").map(c => ({ n: c.value, p: Number(c.dataset.preco) }));
  const escolhas = [];
  /* Detalhes de preparo em linhas próprias (26/09/2026): vão assim para o
     WhatsApp e para a comanda do painel, que imprime cada uma. "meio" são as
     metades da pizza meio a meio; "det" é borda, ingredientes, sabor... */
  const meio = [], det = [];
  let nome = itemAtual.n;

  if (ehPizza(itemAtual)) {
    const t = TAM(tamEscolhido());
    if (itemAtual.escolherIngredientes) {
      const ingredientes = $$("[data-ingrediente]:checked").map(c => c.value);
      nome = `Pizza ${t.n} · ${saborLimpo(itemAtual.n)}`;
      det.push(`Ingredientes: ${ingredientes.join(", ")}`);
    } else {
      const ids = [itemAtual.id];
      $$("[data-sabor]").forEach(s => { if (s.value && !ids.includes(s.value)) ids.push(s.value); });
      if (ids.length > 1) {
        nome = `Pizza ${t.n} · Meio a meio`;
        ids.forEach(id => meio.push(saborLimpo(nomeDoSabor(id))));
      } else {
        nome = `Pizza ${t.n} · ${nomeDoSabor(itemAtual.id)}`;
      }
    }
  } else if (ehCombo(itemAtual)) {
    const t = TAM(itemAtual.pzcombo);
    const porPizza = {};
    $$("[data-sabor-combo]").forEach(s => {
      if (!s.value) return;
      const n = s.dataset.pizza;
      porPizza[n] = porPizza[n] || [];
      if (!porPizza[n].includes(s.value)) porPizza[n].push(s.value);
    });
    Object.keys(porPizza).forEach(n => {
      const nomes = porPizza[n].map(id => saborLimpo(nomeDoSabor(id)));
      const qual = itemAtual.combo2 ? `${Number(n) + 1}ª pizza ${t.n}` : `Pizza ${t.n}`;
      if (nomes.length > 1 && !itemAtual.combo2) nomes.forEach(s => meio.push(s));
      else det.push(`${nomes.length > 1 ? `${qual} (meio a meio)` : "Sabor"}: ${nomes.join(nomes.length > 1 ? " / " : "")}`);
    });
  } else {
    nome = nomeNoPedido(itemAtual);
    const opcao = $("[data-opcao]");
    if (opcao) nome = `${nome} · ${opcao.value}`;
    $$("[data-escolha]").forEach(s => det.push(s.value));
  }

  if (ehPizza(itemAtual) || ehCombo(itemAtual)) {
    const massa = $("[data-massa]:checked");
    if (massa) det.push(`Massa: ${massa.value.toLowerCase()}`);
    /* a borda vai sempre escrita: a comanda é o papel do pizzaiolo */
    const borda = bordaEscolhida();
    if (borda) det.push(`Borda: ${rotuloBorda(borda.n)}`);
  }
  meio.forEach(s => escolhas.push(`½ ${s}`));
  det.forEach(d => escolhas.push(d));

  const obs = $("[data-modal-obs]").value.trim();
  const unit = precoModal() / qtdAtual;

  const assinatura = JSON.stringify([itemAtual.id, nome, adds.map(a => a.n), escolhas, obs]);
  const igual = carrinho.find(l => l.assinatura === assinatura);
  if (igual) igual.q += qtdAtual;
  else carrinho.push({ assinatura, id: itemAtual.id, n: nome, unit, q: qtdAtual, adds, escolhas, meio, det, obs });
  medir("item_adicionado", retratoDaLinha({ id: itemAtual.id, n: nome, unit, q: qtdAtual, adds, meio, det }));

  salvar(); pintarCarrinho(); fecharModal(); pulsar();
}

function pulsar() {
  $$("[data-contador]").forEach(el => {
    el.animate([{ transform: "scale(1)" }, { transform: "scale(1.45)" }, { transform: "scale(1)" }], { duration: 340, easing: "ease-out" });
  });
}

const subtotal = () => carrinho.reduce((s, l) => s + l.unit * l.q, 0);
const totalItens = () => carrinho.reduce((s, l) => s + l.q, 0);

function pintarCarrinho() {
  const alvo = $("[data-itens]");
  if (!carrinho.length) {
    alvo.innerHTML = `<div class="vazio"><span>🍕</span><p>Seu carrinho está vazio.<br />Escolha uma pizza no cardápio.</p></div>`;
  } else {
    alvo.innerHTML = carrinho.map((l, i) => {
      const detalhes = [
        l.escolhas.length ? l.escolhas.join(" · ") : "",
        l.adds.length ? "Adicionais: " + l.adds.map(a => a.n).join(", ") : "",
        l.obs ? "Obs: " + l.obs : ""
      ].filter(Boolean).join("<br />");
      return `<div class="ci">
        <div>
          <div class="ci-nome">${l.n}</div>
          ${detalhes ? `<div class="ci-extra">${detalhes}</div>` : ""}
        </div>
        <div class="ci-preco">${reais(l.unit * l.q)}</div>
        <div class="ci-acoes">
          <button type="button" data-menos="${i}" aria-label="Diminuir">−</button>
          <b>${l.q}</b>
          <button type="button" data-mais="${i}" aria-label="Aumentar">+</button>
          <button type="button" class="ci-remover" data-remover="${i}">remover</button>
        </div>
      </div>`;
    }).join("");
  }
  const t = subtotal();
  $("[data-subtotal]").textContent = reais(t);
  pintarDesconto();
  $("[data-total-flutuante]").textContent = reais(t);
  if (typeof atualizarTaxa === "function") atualizarTaxa();
  $$("[data-contador]").forEach(el => el.textContent = String(totalItens()));
  $("[data-flutuante]").hidden = totalItens() === 0;
}

function abrirCarrinho(abrir, peloVoltar) {
  const c = $("[data-carrinho]");
  if (abrir && !c.dataset.aberto) medir("carrinho_aberto", { itens: totalItens(), subtotal: dinheiro(subtotal()), origem: MESA_ATUAL ? "mesa" : "site" });
  if (abrir) { c.dataset.aberto = "true"; c.setAttribute("aria-hidden", "false"); $("[data-veu]").hidden = false; document.body.classList.add("travado"); marcarCamada(); }
  else {
    const estava = !!c.dataset.aberto;
    delete c.dataset.aberto; c.setAttribute("aria-hidden", "true"); $("[data-veu]").hidden = true; if ($("[data-modal]").hidden) document.body.classList.remove("travado");
    if (estava && peloVoltar !== true) soltarCamada();
  }
}

/* ========================= checkout ========================= */
function soDigitos(s) { return (s || "").replace(/\D/g, ""); }
function formatarFone(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}


/* =========================================================
   Taxa de entrega por bairro
   A tabela fica em LOJA.entrega (no topo deste arquivo).
   ========================================================= */
const SEM_LISTA = "__outro__";




/* =========================================================
   Taxa automática por distância
   Descobre onde fica o endereço do cliente (OpenStreetMap,
   grátis e sem cadastro) e calcula a taxa pelo km rodado.
   Assim qualquer bairro é atendido, não só os da lista.
   ========================================================= */
const LOJA_COORD = { lat: -23.703558, lon: -46.396248 };   // [TROCAR pelo pino da San Francisco se ligar a taxa por distância]
let distanciaKm = null;       // última distância calculada
let buscaDistancia = null;

function kmEntre(a, b) {
  const R = 6371, rad = g => g * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function taxaPorKm(km) {
  const c = LOJA.entrega.porDistancia;
  if (!c || !c.ativa || km == null) return null;
  if (km > c.maxKm) return "fora";
  const v = c.base + Math.max(0, km - c.ateKm) * c.porKm;
  return Math.round(v * 2) / 2;            // arredonda para R$ 0,50
}

/* ---- CEP preenche endereço sozinho (ViaCEP) ---- */
function formatarCep(v) {
  const d = soDigitos(v).slice(0, 8);
  return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
}

function avisoCep(texto, achou) {
  const el = $("[data-busca-cep]");
  if (!el) return;
  el.hidden = !texto;
  el.textContent = texto;
  el.dataset.achou = achou ? "sim" : "nao";
}

/* Bairro que os Correios devolveram para o CEP. Não escolhe nada na lista
   (os nomes quase nunca batem com a tabela); serve só para avisar o
   cliente quando o bairro escolhido não parece ser o do CEP. */
let bairroDoCep = "";
let avisoBairroConfirmado = "";

const PALAVRAS_GENERICAS = new Set(["jardim", "jd", "vila", "parque", "recanto", "chacara", "chacaras",
  "estancia", "sitio", "bairro", "de", "da", "do", "das", "dos", "e", "sao", "santa", "santo",
  "nossa", "senhora", "antes", "depois", "linha", "passarela", "rua", "proxima", "smj", "s", "mj"]);

function palavrasDoBairro(nome) {
  const todas = paraBusca(String(nome || "").replace(/ç/gi, "s"))   // Suíça → suisa
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/(.)\1+/g, "$1")                 // Somma → soma, Suíssa → suisa
    .replace(/c(?=[ei])/g, "s")                // Aparecida → aparesida
    .split(/\s+/).filter(Boolean);
  const fortes = todas.filter(p => !PALAVRAS_GENERICAS.has(p) && !/^\d+$/.test(p));
  return (fortes.length ? fortes : todas)
    .map(p => p.length > 3 ? p.replace(/s$/, "") : p)     // Lagos → lago
    .map(p => p.length > 4 ? p.replace(/[ao]$/, "") : p);  // Suíço × Suíça
}

function bairroPareceODoCep(escolhido) {
  if (!bairroDoCep || !escolhido) return true;
  const a = palavrasDoBairro(bairroDoCep), b = palavrasDoBairro(escolhido);
  return a.some(p => b.includes(p));
}

async function buscarCep() {
  const campo = document.querySelector("[name=cep]");
  if (!campo) return;
  const d = soDigitos(campo.value);
  if (d.length !== 8) { avisoCep("", false); return; }

  avisoCep("Buscando o endereço…", false);
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    const e = await r.json();
    if (e.erro) { avisoCep("CEP não encontrado — preencha os campos abaixo.", false); return; }

    /* a rua sempre preenche, atende a cidade ou não — só o cálculo da
       taxa que depende disso. Bug antigo: travava tudo (nem a rua saía)
       quando a cidade do CEP não batia com a tabela. */
    const cidades = Object.keys(LOJA.entrega.cidades);
    const cidade = cidades.find(c => c.toLowerCase() === String(e.localidade).toLowerCase());

    const rua = document.querySelector("[name=endereco]");
    if (e.logradouro) { rua.value = e.logradouro; }
    bairroDoCep = cidade && e.bairro ? e.bairro : "";

    /* o bairro NÃO vem do CEP: o nome dos Correios nem sempre é o da
       tabela (Suíssa × Vila Suíça). O cliente escolhe na lista. */
    if (cidade) {
      if ($("[data-cidade]").value !== cidade) {
        $("[data-cidade]").value = cidade;
        preencherBairros();
        atualizarTaxa();
      }
      avisoCep(e.bairro
        ? `Pelo CEP, sua rua fica no bairro ${e.bairro} (${e.localidade}). Escolha na lista o bairro de entrega correspondente.`
        : `${e.logradouro || "Endereço"}, ${e.localidade}. Agora escolha o seu bairro na lista.`, true);
    } else {
      avisoCep(`Endereço preenchido, mas confirme se entregamos em ${e.localidade} pelo WhatsApp.`, false);
    }
    if (e.logradouro) document.querySelector("[name=numero]").focus();
  } catch (err) {
    avisoCep("", false);   // sem internet: o cliente preenche na mão
  }
}


/* =========================================================
   Vitrine dos combos — promoção à parte, fora do cardápio
   ========================================================= */
function montarCombos() {
  const alvo = $("[data-vitrine-combos]");
  if (!alvo) return;
  const promo = CARDAPIO.filter(i => i.g === "promocoes" && !i.off);
  if (!promo.length) { const sec = document.getElementById("combos"); if (sec) sec.hidden = true; return; }
  const menor = Math.min(...promo.map(c => c.p));

  alvo.innerHTML = promo.map(c => `
      <button class="combo-card" type="button" data-item="${c.id}">
        <span class="combo-foto">
          <img src="${c.foto || `assets/img/fotos/${c.f}.png`}" alt="${c.n}" loading="lazy" decoding="async" width="560" height="420" />
          ${c.tag ? `<span class="combo-selo">${c.tag}</span>` : ""}
        </span>
        <span class="combo-corpo">
          <span class="combo-tipo">Promoção</span>
          <span class="combo-nome">${c.n}</span>
          <span class="combo-inclui">${c.d || ""}</span>
          <span class="combo-rodape">
            <span class="combo-preco">${reais(c.p)}</span>
            <span class="combo-unit">monte os sabores</span>
          </span>
        </span>
      </button>`).join("");

  const ap = $("[data-combo-apartir]");
  if (ap) ap.textContent = reais(menor);
}

function montarEntrega() {
  const selCidade = $("[data-cidade]");
  const selBairro = $("[data-bairro]");
  if (!selCidade || !selBairro || !LOJA.entrega || !LOJA.entrega.ativa) return;

  const cidades = Object.keys(LOJA.entrega.cidades);
  selCidade.innerHTML = cidades.map(c => `<option value="${c}">${c}</option>`).join("");
  preencherBairros();

  selCidade.addEventListener("change", () => {
    preencherBairros(); atualizarTaxa();
  });
  selBairro.addEventListener("change", atualizarTaxa);
  atualizarTaxa();
}

function preencherBairros() {
  const cidade = $("[data-cidade]").value;
  const bairros = Object.keys(LOJA.entrega.cidades[cidade] || {})
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  $("[data-bairro]").innerHTML =
    `<option value="" disabled selected>Escolha o seu bairro</option>` +
    bairros.map(b => `<option value="${b}">${b}</option>`).join("");
  $("[data-campo-outro]").hidden = true;
}

/* devolve o valor da taxa, ou null quando é "a combinar" */
/* Devolve o valor da taxa, "fora" quando passa do raio, ou null
   quando ainda não dá para saber ("a combinar").
   Ordem: a tabela de bairros manda; sem ela, vale a distância. */
function taxaEntrega() {
  if (!LOJA.entrega || !LOJA.entrega.ativa) return null;
  if (tipoEscolhido() !== "Entrega") return 0;

  const sel = $("[data-bairro]");
  const bairro = sel ? sel.value : "";
  if (bairro && bairro !== SEM_LISTA) {
    const cidade = $("[data-cidade]").value;
    const v = (LOJA.entrega.cidades[cidade] || {})[bairro];
    if (typeof v === "number") return v;      // preço combinado com o dono
  }
  const porKm = taxaPorKm(distanciaKm);       // qualquer outro endereço
  if (porKm !== null) return porKm;
  return LOJA.entrega.foraDaLista;
}

function bairroEscolhido() {
  const sel = $("[data-bairro]");
  if (!sel) return "";
  if (sel.value === SEM_LISTA) {
    const campo = document.querySelector("[name=bairroOutro]");
    return campo ? campo.value.trim() : "";
  }
  return sel.value;
}

function tipoEscolhido() {
  const m = document.querySelector("[name=tipo]:checked");
  return m && m.value === "Entrega" ? "Entrega" : "Retirada";
}

function atualizarTaxa() {
  const entrega = tipoEscolhido() === "Entrega";
  const taxa = taxaEntrega();
  const linhaTaxa  = $("[data-linha-taxa]");
  const linhaGeral = $("[data-linha-geral]");
  const pendente   = $("[data-pendente]");
  const aviso      = $("[data-aviso-entrega]");
  if (!linhaTaxa) return;

  pintarDesconto();
  const temDesconto = descontoAtual().valor > 0;
  linhaTaxa.hidden  = !entrega;
  linhaGeral.hidden = !(entrega || temDesconto);
  if (!entrega && temDesconto) $("[data-total-geral]").textContent = reais(totalDoPedido());
  if (pendente) pendente.hidden = !(entrega && taxa === null);

  if (!entrega) { atualizarTotais(); return; }

  const foraDoRaio = taxa === "fora";
  const valor = (typeof taxa === "number") ? taxa : null;

  $("[data-taxa-valor]").textContent =
    foraDoRaio ? "fora da área" : valor === null ? (bairroEscolhido() ? "a combinar" : "escolha o bairro") : reais(valor);
  $("[data-total-geral]").textContent = reais(totalDoPedido());
  if (pendente) pendente.hidden = !(entrega && valor === null && !foraDoRaio);

  if (aviso) {
    if (foraDoRaio) {
      aviso.hidden = false;
      aviso.textContent = `Esse endereço fica a cerca de ${distanciaKm.toFixed(1)} km da loja, ` +
        `acima do raio de ${LOJA.entrega.porDistancia.maxKm} km que atendemos. ` +
        `Mande o pedido assim mesmo se quiser — a loja confirma pelo WhatsApp.`;
    } else if (valor !== null && distanciaKm !== null &&
               !(LOJA.entrega.cidades[$("[data-cidade]").value] || {})[$("[data-bairro]").value]) {
      aviso.hidden = false;
      aviso.textContent = `Taxa calculada pela distância: cerca de ${distanciaKm.toFixed(1)} km até a loja.`;
    } else {
      aviso.hidden = true;
    }
  }
  atualizarTotais();
}

/* o rodapé do carrinho também precisa refletir a taxa */
/* Total que o cliente paga: itens + entrega − desconto do cupom. */
function totalDoPedido() {
  const entrega = tipoEscolhido() === "Entrega";
  const t = entrega ? taxaEntrega() : 0;
  const taxa = (typeof t === "number") ? t : 0;
  const d = descontoAtual();
  return Math.max(0, subtotal() + taxa - d.valor);
}

function atualizarTotais() {
  const flut = $("[data-total-flutuante]");
  if (flut) flut.textContent = reais(totalDoPedido());
}

function enviarPedido(e) {
  e.preventDefault();
  const f = e.target;
  const st = $("[data-status]");
  const erro = (campo, msg) => {
    st.textContent = msg; st.dataset.erro = "true";
    if (campo) { campo.setAttribute("aria-invalid", "true"); campo.focus(); campo.scrollIntoView({ block: "center", behavior: "smooth" }); }
    return false;
  };
  $$("input,select", f).forEach(c => c.removeAttribute("aria-invalid"));

  if (!carrinho.length) return erro(null, "Adicione pelo menos um item do cardápio.");
  if (!lojaAbertaAgora().aberto) {
    travarEnvio();
    return avisoStatus(motivoFechado());
  }

  /* ---- modo mesa: sem WhatsApp, sem endereço, sem pagamento ----
     manda pra fila da mesa (pedidos_mesa) e a comanda soma no painel */
  if (MESA_ATUAL) return enviarPedidoDaMesa(f, st);

  if (!f.nome.value.trim()) return erro(f.nome, "Diga seu nome para a gente te chamar.");
  if (soDigitos(f.fone.value).length < 10) return erro(f.fone, "Confira o número do WhatsApp com DDD.");

  const modo = f.tipo.value;
  const tipo = modo;
  if (tipo === "Entrega") {
    if (!f.endereco.value.trim()) return erro(f.endereco, "Diga o nome da rua para entregarmos.");
    if (!f.numero.value.trim())   return erro(f.numero, "Falta o número da casa ou do prédio.");
    if (!bairroEscolhido())       return erro(f.bairro, "Escolha o bairro da entrega.");
    const par = bairroDoCep + "|" + bairroEscolhido();
    if (!bairroPareceODoCep(bairroEscolhido()) && avisoBairroConfirmado !== par) {
      avisoBairroConfirmado = par;
      return erro(f.bairro, `Seu CEP é do bairro ${bairroDoCep} e você escolheu ${bairroEscolhido()}. ` +
        `Confira a lista de bairros de entrega e escolha o certo. Se estiver certo, toque em enviar de novo.`);
    }
  }

  if (f.pagamento.value === "Dinheiro" && f.troco.value.trim()) {
    const troco = Number(f.troco.value.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
    const taxaAgora = tipo === "Entrega" ? taxaEntrega() : 0;
    if (troco > 0 && (tipo !== "Entrega" || typeof taxaAgora === "number") && troco < totalDoPedido())
      return erro(f.troco, `O troco precisa ser para um valor maior que o total (${reais(totalDoPedido())}).`);
  }

  const linhas = linhasDoCarrinho();

  const desconto = descontoAtual();
  const fechouCartao = somarFidelidade(soDigitos(f.fone.value));
  const taxaBruta = tipo === "Entrega" ? taxaEntrega() : 0;
  const taxa = (typeof taxaBruta === "number") ? taxaBruta : null;
  const enderecoCheio = [
    `${f.endereco.value.trim()}, ${f.numero.value.trim()}`,
    f.complemento.value.trim(),
    `${bairroEscolhido()} — ${$("[data-cidade]").value}`,
    bairroPareceODoCep(bairroEscolhido()) ? "" : `(CEP do bairro ${bairroDoCep}, conferir)`
  ].filter(Boolean).join(" — ");

  const msg = [
    `*PEDIDO — ${LOJA.nome}*`,
    "",
    ...linhas,
    "",
    `*Subtotal: ${reais(subtotal())}*`,
    tipo === "Entrega" ? `*Taxa de entrega: ${taxa === null ? "a combinar" : reais(taxa)}*` : "",
    desconto.valor > 0 ? `*Desconto: − ${reais(desconto.valor)}* (${desconto.rotulo})` : "",
    (tipo !== "Entrega" || taxa !== null) ? `*Total: ${reais(totalDoPedido())}*` : "",
    "",
    `*Cliente:* ${f.nome.value.trim()}`,
    `*WhatsApp:* ${formatarFone(f.fone.value)}`,
    `*Como receber:* ${tipo}`,
    tipo === "Entrega" ? `*Endereço:* ${enderecoCheio}` : "",
    `*Pagamento:* ${f.pagamento.value}${f.pagamento.value === "Dinheiro" && f.troco.value.trim() ? ` (troco para ${f.troco.value.trim()})` : ""}`,
    f.obs.value.trim() ? `*Observações:* ${f.obs.value.trim()}` : "",
    fechouCartao ? `*CARTÃO FIDELIDADE COMPLETO* — o cliente tem direito a ${FIDELIDADE.premio}.` : "",
    "",
    "_Pedido enviado pelo site._"
  ].filter(l => l !== "").join("\n");

  const texto = LOJA.linkComanda
    ? msg + "\n🖨️ Comanda: " + location.href.replace(/[^/]*$/, "") + "comanda.html#p=" + paraLink(msg)
    : msg;

  /* manda uma cópia para o painel da loja (painel.html), que apita
     no balcão e imprime. Se falhar, o WhatsApp abaixo segue normal. */
  if (window.enviarParaPainel) {
    window.enviarParaPainel({
      texto: msg,
      cliente: f.nome.value.trim(),
      fone: formatarFone(f.fone.value),
      tipo,
      endereco: tipo === "Entrega" ? enderecoCheio : "",
      pagamento: f.pagamento.value + (f.pagamento.value === "Dinheiro" && f.troco.value.trim() ? ` (troco para ${f.troco.value.trim()})` : ""),
      total: totalDoPedido(),
      taxa: taxa || 0,
      itens: carrinho.reduce((s, l) => s + l.q, 0)
    });
  }

  medirPedido({
    tipo, pagamento: f.pagamento.value,
    bairro: tipo === "Entrega" ? bairroEscolhido() : "",
    cidade: tipo === "Entrega" ? $("[data-cidade]").value : "",
    taxa: dinheiro(taxa || 0),
    taxa_a_combinar: tipo === "Entrega" && taxa === null ? "sim" : "não",
    desconto: dinheiro(desconto.valor),
    cupom: cupomAtivo && desconto.valor > 0 ? cupomAtivo.codigo : "",
    fidelidade_completa: fechouCartao ? "sim" : "não"
  });

  st.dataset.erro = "false";
  st.textContent = "Abrindo o WhatsApp com seu pedido…";
  window.open(`https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");

  /* se o cliente logou com o Google, guarda os dados e o histórico dele
     (opcional, nunca trava quem não logou) */
  if (window.salvarPedidoCliente) {
    window.salvarPedidoCliente({
      nome: f.nome.value.trim(), fone: formatarFone(f.fone.value),
      endereco: f.endereco ? f.endereco.value.trim() : "",
      numero: f.numero ? f.numero.value.trim() : "",
      complemento: f.complemento ? f.complemento.value.trim() : "",
      bairro: bairroEscolhido() || "",
      resumo: `${tipo} · ${carrinho.reduce((s, l) => s + l.q, 0)} itens`,
      total: totalDoPedido()
    });
  }

  /* confirmação na própria tela, para o cliente não ficar sem resposta
     caso o WhatsApp demore a abrir ou o navegador bloqueie a janela */
  mostrarConfirmacao(f.nome.value.trim());
  esvaziarDepoisDoEnvio();
}

/* pedido da mesa: sem pagamento aqui, a conta é fechada no restaurante
   pelo Balcão do painel, que já soma tudo o que a mesa pediu */
/* Cada item em linhas próprias: é o que o painel lê para montar a comanda
   (½ sabor, borda, ingredientes, adicionais, obs). Linha recuada = detalhe. */
function linhasDoCarrinho() {
  return carrinho.map(l => {
    const partes = [`• ${l.q}x ${l.n} — ${reais(l.unit * l.q)}`];
    if (l.meio || l.det) {
      (l.meio || []).forEach(s => partes.push(`   ½ ${s}`));
      (l.det || []).forEach(d => partes.push(`   ${d}`));
    } else if (l.escolhas.length) {
      partes.push(`   ${l.escolhas.join(" · ")}`);      // carrinho guardado antes desta versão
    }
    if (l.adds.length) partes.push(`   Adicionais: ${l.adds.map(a => a.n).join(", ")}`);
    if (l.obs) partes.push(`   Obs: ${l.obs}`);
    return partes.join("\n");
  });
}

/* Pedido da mesa (26/09/2026): vai para os pedidos recebidos do painel, igual
   ao do site, para ser aceito e impresso com o título MESA e o número. Antes
   ia escondido para a aba Balcão de um aparelho só. */
function enviarPedidoDaMesa(f, st) {
  if (!window.enviarPedidoMesa) return avisoStatus("Não consegui enviar agora. Chame o garçom.");

  const mesa = String(Number(MESA_ATUAL)).padStart(2, "0");
  const cliente = (f.nome ? f.nome.value.trim() : "") || "";
  const texto = [
    `*PEDIDO — MESA ${mesa}*`,
    "",
    ...linhasDoCarrinho(),
    "",
    `*Total: ${reais(totalDoPedido())}*`,
    "",
    `*Cliente:* ${cliente || "Mesa " + mesa}`,
    `*Como receber:* Mesa ${mesa}`,
    f.obs && f.obs.value.trim() ? `*Observações:* ${f.obs.value.trim()}` : "",
    "",
    "_Pedido feito na mesa._"
  ].filter((l, i, a) => l !== "" || (a[i - 1] !== "" && i < a.length - 1)).join("\n");

  st.dataset.erro = "false";
  st.textContent = "Enviando para a cozinha…";

  window.enviarPedidoMesa({
    mesa: Number(MESA_ATUAL),
    cliente,
    texto,
    itens: carrinho.reduce((s, l) => s + l.q, 0),
    total: totalDoPedido()
  }).then(ok => {
    if (!ok) return avisoStatus("Não consegui enviar agora. Chame o garçom.");
    medirPedido({ tipo: "Mesa", mesa: String(Number(MESA_ATUAL)).padStart(2, "0"), taxa: "0.00", desconto: "0.00" });
    if (window.salvarPedidoCliente) {
      window.salvarPedidoCliente({
        nome: f.nome ? f.nome.value.trim() : "",
        resumo: `Mesa ${MESA_ATUAL} · ${carrinho.reduce((s, l) => s + l.q, 0)} itens`,
        total: totalDoPedido()
      });
    }
    mostrarConfirmacao(f.nome ? f.nome.value.trim() : "", true);
    esvaziarDepoisDoEnvio();
  });
}

function mostrarConfirmacao(nome, modoMesa) {
  if (modoMesa) {
    const caixa = document.createElement("div");
    caixa.className = "confirmado";
    caixa.innerHTML = `
      <div class="confirmado-cartao" role="dialog" aria-live="polite">
        <div class="confirmado-selo">✓</div>
        <h3>Pedido enviado${nome ? ", " + nome.split(" ")[0] : ""}!</h3>
        <p>Já chegou na cozinha, mesa <strong>${MESA_ATUAL}</strong>. Você pode continuar
           pedindo quantas vezes quiser — a conta fecha só no final, com o garçom.</p>
        <button type="button" class="confirmado-fechar">Fechar</button>
      </div>`;
    document.body.appendChild(caixa);
    const sair = () => caixa.remove();
    caixa.querySelector(".confirmado-fechar").addEventListener("click", sair);
    caixa.addEventListener("click", e => { if (e.target === caixa) sair(); });
    return;
  }
  const caixa = document.createElement("div");
  caixa.className = "confirmado";
  caixa.innerHTML = `
    <div class="confirmado-cartao" role="dialog" aria-live="polite">
      <div class="confirmado-selo">✓</div>
      <h3>Pedido enviado${nome ? ", " + nome.split(" ")[0] : ""}!</h3>
      <p>Seu pedido já chegou no balcão do <strong>${LOJA.nome}</strong>.
         Em instantes a gente confirma por WhatsApp com o tempo de preparo.</p>
      <p class="confirmado-dica">Não abriu o WhatsApp? Toque no botão abaixo.</p>
      <a class="confirmado-btn" href="https://wa.me/${LOJA.whatsapp}" target="_blank" rel="noopener">Abrir o WhatsApp da loja</a>
      <button type="button" class="confirmado-fechar">Fechar</button>
    </div>`;
  document.body.appendChild(caixa);
  const sair = () => caixa.remove();
  caixa.querySelector(".confirmado-fechar").addEventListener("click", sair);
  caixa.addEventListener("click", e => { if (e.target === caixa) sair(); });
}

function avisoStatus(msg) {
  const st = $("[data-status]");
  if (st) { st.textContent = msg; st.dataset.erro = "true"; }
  return false;
}

/* ========================= status aberto / fechado =========================
   O horário manda, mas a loja pode abrir ou fechar na mão pelo painel.
   O estado é lido do servidor; se não der, vale o horário. */
let lojaNoManual = null;   // true = aberta na mão, false = fechada na mão

/* está aberta agora? o botão do painel manda; sem ele, vale o horário */
function lojaAbertaAgora() {
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  const fechadoHoje = LOJA.diasFechados.includes(agora.getDay());
  const peloHorario = !fechadoHoje && (h >= LOJA.abre && h < LOJA.fecha);
  return {
    aberto: lojaNoManual === null ? peloHorario : lojaNoManual,
    fechadoHoje,
    naMao: lojaNoManual === false
  };
}

/* transforma 17.5 em "17h30", 23.6667 em "23h40" */
function horaFormatada(h) {
  const hi = Math.floor(h);
  const min = Math.round((h - hi) * 60);
  return min ? `${hi}h${String(min).padStart(2, "0")}` : `${hi}h`;
}

/* por que não dá para pedir agora, em uma frase curta e sem travessão */
function motivoFechado() {
  const e = lojaAbertaAgora();
  if (e.naMao) return "A loja está fechada no momento. Volte mais tarde.";
  if (e.fechadoHoje) return `Hoje a loja não abre. Voltamos às ${horaFormatada(LOJA.abre)}.`;
  return `Estamos fechados agora. Abrimos às ${horaFormatada(LOJA.abre)}.`;
}

/* liga e desliga o botão de enviar conforme a loja */
function travarEnvio() {
  const botao = $("[data-enviar]");
  if (!botao) return;
  const { aberto } = lojaAbertaAgora();
  botao.disabled = !aberto;
  botao.dataset.fechado = String(!aberto);
  botao.textContent = aberto ? (MESA_ATUAL ? "Enviar para a cozinha" : "Enviar pedido no WhatsApp") : motivoFechado();
}

function statusLoja() {
  const selo = $("[data-status-selo]");
  const txt = $("[data-status-texto]");
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  const fechadoHoje = LOJA.diasFechados.includes(agora.getDay());
  const peloHorario = !fechadoHoje && (h >= LOJA.abre && h < LOJA.fecha);
  const aberto = lojaNoManual === null ? peloHorario : lojaNoManual;
  travarEnvio();
  if (!selo || !txt) return;   // restaurante.html não tem esse selo na tela

  selo.dataset.aberto = String(aberto);
  txt.textContent = aberto
    ? "Aberto agora"
    : lojaNoManual === false ? "Fechado no momento"
    : fechadoHoje ? `Fechado hoje. Abre às ${horaFormatada(LOJA.abre)}`
    : `Fechado. Abre às ${horaFormatada(LOJA.abre)}`;
}

/* ---- ajustes do cardápio feitos pelo dono no painel ----
   Preço, esgotado, nome, descrição e foto. Vêm por cima do cardápio do
   arquivo; se o servidor falhar, o arquivo continua valendo. */
async function lerCardapioAjustado() {
  if (!TEM_SERVIDOR) return;
  const url = urlServidor("cardapio");
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    const itens = d && d.fields && d.fields.itens && d.fields.itens.mapValue;
    if (!itens || !itens.fields) return;

    let mudou = false;
    Object.keys(itens.fields).forEach(id => {
      const campos = (itens.fields[id].mapValue || {}).fields || {};
      const alvo = CARDAPIO.find(x => x.id === id);
      if (!alvo) return;
      if (campos.p && campos.p.doubleValue != null) { alvo.p = Number(campos.p.doubleValue); mudou = true; }
      if (campos.p && campos.p.integerValue != null) { alvo.p = Number(campos.p.integerValue); mudou = true; }
      if (campos.n && campos.n.stringValue) { alvo.n = campos.n.stringValue; mudou = true; }
      if (campos.d && campos.d.stringValue != null) { alvo.d = campos.d.stringValue; mudou = true; }
      if (campos.f && campos.f.stringValue) { alvo.f = campos.f.stringValue; mudou = true; }
      if (campos.foto && campos.foto.stringValue) { alvo.foto = campos.foto.stringValue; mudou = true; }
      alvo.off = !!(campos.off && campos.off.booleanValue);
      if (alvo.off) mudou = true;
    });

    guardarNoAparelho("cardapio", itens.fields);
    if (mudou && typeof montarCardapio === "function") montarCardapio();
  } catch (e) {
    /* servidor fora: usa a última versão boa guardada no aparelho, e na
       falta dela os preços do arquivo. O cardápio nunca some. */
    const guardado = lerDoAparelho("cardapio", 24 * 60 * 60 * 1000);
    if (!guardado) return;
    let mudou = false;
    Object.keys(guardado).forEach(id => {
      const campos = (guardado[id].mapValue || {}).fields || {};
      const alvo = CARDAPIO.find(x => x.id === id);
      if (!alvo) return;
      if (campos.p && campos.p.doubleValue != null) { alvo.p = Number(campos.p.doubleValue); mudou = true; }
      if (campos.n && campos.n.stringValue) { alvo.n = campos.n.stringValue; mudou = true; }
      if (campos.foto && campos.foto.stringValue) { alvo.foto = campos.foto.stringValue; mudou = true; }
      alvo.off = !!(campos.off && campos.off.booleanValue);
      if (alvo.off) mudou = true;
    });
    if (mudou && typeof montarCardapio === "function") montarCardapio();
  }
}

/* lê o interruptor da loja no servidor (leitura pública, sem biblioteca) */
/* guarda a última resposta boa do servidor, para o site continuar certo
   mesmo se o servidor ficar fora do ar na próxima consulta */
function guardarNoAparelho(chave, valor) {
  try { localStorage.setItem("reiburgao:" + chave, JSON.stringify({ v: valor, em: Date.now() })); } catch (e) {}
}
function lerDoAparelho(chave, validadeMs) {
  try {
    const g = JSON.parse(localStorage.getItem("reiburgao:" + chave) || "null");
    if (g && Date.now() - g.em < validadeMs) return g.v;
  } catch (e) {}
  return null;
}

async function lerEstadoLoja() {
  if (!TEM_SERVIDOR) return;
  const url = urlServidor("loja");
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    const v = d && d.fields && d.fields.aberta;
    const dia = d && d.fields && d.fields.dia && d.fields.dia.stringValue;
    const ag = new Date();
    const hojeTxt = ag.getFullYear() + "-" + String(ag.getMonth() + 1).padStart(2, "0") +
      "-" + String(ag.getDate()).padStart(2, "0");
    /* O botão do painel vale para abrir OU fechar fora do horário, mas só
       no dia em que foi usado: no dia seguinte o site volta sozinho a
       seguir o horário normal, para ninguém esquecer a loja aberta de
       madrugada nem fechada na hora do movimento. */
    lojaNoManual = (dia === hojeTxt && v) ? v.booleanValue !== false : null;
    guardarNoAparelho("loja", { manual: lojaNoManual, dia: hojeTxt });
    travarEnvio();
  } catch (e) {
    /* servidor fora do ar: vale a última resposta boa de hoje, e na falta
       dela o horário normal. O site nunca fica quebrado por causa disso. */
    const ag = new Date();
    const hojeTxt = ag.getFullYear() + "-" + String(ag.getMonth() + 1).padStart(2, "0") +
      "-" + String(ag.getDate()).padStart(2, "0");
    const guardado = lerDoAparelho("loja", 12 * 60 * 60 * 1000);
    lojaNoManual = (guardado && guardado.dia === hojeTxt) ? guardado.manual : null;
    travarEnvio();
  }
  statusLoja();
}

/* ========================= efeitos ========================= */
function efeitos() {
  const topo = $("[data-topo]");
  const barra = $(".barra-progresso i");
  const onScroll = () => {
    topo.dataset.fixo = String(window.scrollY > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(es => {
    es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visivel"); io.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-surge]").forEach(el => io.observe(el));
}

/* ========================= ligação ========================= */
document.addEventListener("DOMContentLoaded", () => {
  montarCardapio();
  pintarCarrinho();
  statusLoja();
  lerEstadoLoja();
  lerCardapioAjustado();
  setInterval(statusLoja, 60000);   // só relógio, não consulta nada

  /* As consultas ao servidor só acontecem com a aba à vista. Aba esquecida
     aberta a noite toda não fica consumindo a cota do plano gratuito, que é
     o que poderia derrubar o sistema num dia de movimento. */
  const consultarServidor = () => {
    if (document.visibilityState !== "visible") return;
    lerEstadoLoja();
    lerCardapioAjustado();
  };
  setInterval(consultarServidor, 300000);        // 5 minutos
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") consultarServidor();
  });
  efeitos();

  $$("[data-abrir-carrinho]").forEach(b => b.addEventListener("click", () => abrirCarrinho(true)));
  $("[data-fechar-carrinho]").addEventListener("click", () => abrirCarrinho(false));
  $("[data-veu]").addEventListener("click", () => abrirCarrinho(false));

  montarCombos();
  pintarFidelidade();

  const btCupom = $("[data-aplicar-cupom]");
  if (btCupom) btCupom.addEventListener("click", aplicarCupom);
  const cpCupom = $("[data-campo-cupom]");
  if (cpCupom) cpCupom.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); aplicarCupom(); }
  });
  $("[data-vitrine-combos]").addEventListener("click", e => {
    const b = e.target.closest("[data-item]");
    if (b) abrirModal(b.dataset.item);
  });

  $("[data-itens]").addEventListener("click", e => {
    const mais = e.target.closest("[data-mais]"), menos = e.target.closest("[data-menos]"), rem = e.target.closest("[data-remover]");
    if (mais) carrinho[+mais.dataset.mais].q++;
    else if (menos) { const i = +menos.dataset.menos; if (--carrinho[i].q <= 0) carrinho.splice(i, 1); }
    else if (rem) { medir("item_removido", retratoDaLinha(carrinho[+rem.dataset.remover])); carrinho.splice(+rem.dataset.remover, 1); }
    else return;
    salvar(); pintarCarrinho();
  });

  $("[data-fechar-modal]").addEventListener("click", () => fecharModal());
  $("[data-modal]").addEventListener("click", e => { if (e.target === $("[data-modal]")) fecharModal(); });
  $$("[data-qtd]").forEach(b => b.addEventListener("click", () => {
    qtdAtual = Math.max(1, Math.min(30, qtdAtual + Number(b.dataset.qtd)));
    atualizarModal();
  }));
  $("[data-modal-add]").addEventListener("click", adicionarDoModal);
  $("[data-modal-extras]").addEventListener("change", atualizarModal);

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!$("[data-modal]").hidden) fecharModal();
    else abrirCarrinho(false);
  });

  const form = $("[data-checkout]");
  form.addEventListener("submit", enviarPedido);
  form.fone.addEventListener("input", e => { e.target.value = formatarFone(e.target.value); });
  const campos = $("[data-campos-entrega]"), troco = $("[data-campo-troco]");
  $$('input[name="tipo"]', form).forEach(r => r.addEventListener("change", () => {
    const modo = form.tipo.value;                    // Entrega | Retirada no balcão | No restaurante
    const entrega = modo === "Entrega";
    const mesa = modo === "No restaurante";
    campos.hidden = !entrega;
    $("[data-caixa-retirada]").hidden = entrega || mesa;
    $("[data-caixa-mesa]").hidden = !mesa;
    $(".aviso-taxa").hidden = !entrega;
    const opcCartao = [...form.pagamento.options].find(o => o.value.startsWith("Cartão"));
    if (opcCartao) {
      opcCartao.value = opcCartao.textContent =
        entrega ? "Cartão na entrega" : "Cartão";
    }
    atualizarTaxa();
  }));
  document.querySelector("[name=bairroOutro]").addEventListener("input", atualizarTaxa);
  const campoCep = document.querySelector("[name=cep]");
  campoCep.addEventListener("input", e => {
    e.target.value = formatarCep(e.target.value);
    if (soDigitos(e.target.value).length === 8) buscarCep();
    else { bairroDoCep = ""; avisoBairroConfirmado = ""; }
  });
  montarEntrega();
  const prep = $("[data-preparo]");
  if (prep && LOJA.preparo) {
    prep.hidden = false;
    prep.textContent = `⏱️ Fica pronto em cerca de ${LOJA.preparo}`;
  }
  form.pagamento.addEventListener("change", () => { troco.hidden = form.pagamento.value !== "Dinheiro"; });

  /* QR Code do balcão (?modo=balcao): já abre com "Retirada no balcão"
     marcado, pra quem está pedindo no local sem precisar escolher */
  if (new URLSearchParams(location.search).get("modo") === "balcao") {
    const local = $("[data-opcao-local]");
    if (local) local.hidden = false;      // no site de casa essa opção fica escondida
    const r = document.querySelector('input[name="tipo"][value="Retirada no balcão"]');
    if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); }
  }
});
