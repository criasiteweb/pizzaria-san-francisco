/* =========================================================
   Pizzaria San Francisco — Quadro, Forno e Entrega
   Criasiteweb

   Mesmo padrão do portal do Mercado Já:

   - Quadro: os números do dia em cima e o pedido andando por quatro
     colunas (Recebido, No forno, Na rua ou pronto, Entregue).
   - Forno: só o que está assando agora, em letra grande, para a tela
     que fica pendurada na cozinha.

   Entrega e retirada NÃO têm aba própria: elas já aparecem em "Em aberto"
   e no Quadro, e uma tela a mais só repetiria a mesma lista.

   Tudo lê os MESMOS pedidos que o painel já recebe do servidor. Nada é
   digitado duas vezes e nenhuma tela nova precisa de internet própria.
   O painel entrega os dados em window.qdDados.
   ========================================================= */

const QD_COLUNAS = [
  { st: "novo",       titulo: "Recebido",          vazio: "Nenhum pedido novo" },
  { st: "preparando", titulo: "No forno",          vazio: "Nada assando" },
  { st: "saiu",       titulo: "Na rua ou pronto",  vazio: "Ninguém na rua" },
  { st: "concluido",  titulo: "Entregue",          vazio: "Nada fechado ainda" }
];

function qdEsc(s) {
  return String(s == null ? "" : s).replace(/[<>&"]/g, c =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

/* o painel entrega os pedidos em window.qdDados. Nome diferente de
   propósito: este arquivo é script comum, e uma função com o mesmo nome
   viraria a própria window.qdDados, chamando a si mesma sem parar. */
function qdFonte() {
  return (typeof window.qdDados === "function" ? window.qdDados() : null)
      || { pedidos: [], comandas: [] };
}

function qdEhEntrega(p) { return /entrega/i.test(p.tipo || ""); }

function qdItens(p) {
  return (window.qdResumoItens ? window.qdResumoItens(p) : "") || "";
}

function qdTempo(p) {
  return window.qdTempoDesde ? window.qdTempoDesde(p.criadoEm) : "";
}

function qdReais(v) {
  return window.reais ? window.reais(v) : "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
}

/* =========================================================
   Quadro
   ========================================================= */
function qdNumeros(d) {
  const valem = d.pedidos.filter(p => p.status !== "recusado");
  const comandas = d.comandas || [];
  const vendido = valem.reduce((t, p) => t + (Number(p.total) || 0), 0)
                + comandas.reduce((t, v) => t + (Number(v.total) || 0), 0);
  return [
    { n: valem.length + comandas.length, r: "Pedidos hoje" },
    { n: qdReais(vendido),               r: "Vendido hoje" },
    { n: comandas.length,                r: "Vendas no balcão" }
  ];
}

function qdCartaoCurto(p) {
  const proxima = qdProxima(p.status);
  return `
  <article class="qd-cartao" data-status="${qdEsc(p.status)}" data-qd-id="${qdEsc(p.id)}">
    <header>
      <span class="qd-num">#${qdEsc(p.numero)}</span>
      <span class="qd-hora">${qdEsc(qdTempo(p))}</span>
    </header>
    <strong class="qd-quem">${qdEsc(p.cliente) || "Sem nome"}</strong>
    <span class="qd-tipo ${qdEhEntrega(p) ? "t-entrega" : "t-retirada"}">${
      qdEhEntrega(p) ? "Entrega" : "Retirada"}</span>
    <p class="qd-itens">${qdItens(p)}</p>
    <div class="qd-rodape">
      <span class="qd-total">${qdReais(p.total || 0)}</span>
      ${proxima ? `<button type="button" data-qd-avancar="${qdEsc(p.id)}">${qdEsc(qdAcao(p.status, p))}</button>` : ""}
    </div>
  </article>`;
}

function qdProxima(st) {
  return { novo: "preparando", preparando: "saiu", saiu: "concluido" }[st] || null;
}

/* o rótulo do botão muda conforme o pedido: quem vem buscar no balcão
   nunca "sai para entrega", fica pronto para retirar */
function qdAcao(st, p) {
  const entrega = p ? qdEhEntrega(p) : true;
  if (st === "novo") return "Pôr no forno";
  if (st === "preparando") return entrega ? "Saiu para entrega" : "Pronto para retirar";
  if (st === "saiu") return entrega ? "Entregue" : "Retirado";
  return "Avançar";
}

window.qdDesenharQuadro = function () {
  const alvo = document.querySelector("[data-quadro]");
  if (!alvo) return;
  const d = qdFonte();

  const numeros = qdNumeros(d).map(c =>
    `<div class="qd-numero"><b>${c.n}</b><span>${c.r}</span></div>`).join("");

  const colunas = QD_COLUNAS.map(c => {
    const lista = d.pedidos.filter(p => p.status === c.st);
    return `
      <section class="qd-coluna" data-coluna="${c.st}">
        <header><span>${c.titulo}</span><b>${lista.length}</b></header>
        <div class="qd-pilha">
          ${lista.length ? lista.map(qdCartaoCurto).join("") : `<p class="qd-vazio">${c.vazio}</p>`}
        </div>
      </section>`;
  }).join("");

  alvo.innerHTML = `
    <div class="qd-titulo">
      <h2>Pedidos em tempo real</h2>
      <p>Todo pedido do site cai aqui na hora. Toque no botão do cartão para avançar o status.</p>
    </div>
    <div class="qd-numeros">${numeros}</div>
    <div class="qd-colunas">${colunas}</div>`;
};

/* =========================================================
   Forno — a tela da cozinha
   ========================================================= */
window.qdDesenharForno = function () {
  const alvo = document.querySelector("[data-forno]");
  if (!alvo) return;
  const lista = qdFonte().pedidos.filter(p => p.status === "preparando");

  alvo.innerHTML = `
    <div class="qd-titulo">
      <h2>No forno</h2>
      <p>Só o que está sendo feito agora. Terminou, toque no botão e o pedido anda sozinho no quadro.</p>
    </div>` + (lista.length ? `
    <div class="fo-lista">${lista.map(p => `
      <article class="fo-item" data-qd-id="${qdEsc(p.id)}">
        <div class="fo-cabeca">
          <span class="fo-num">#${qdEsc(p.numero)}</span>
          <span class="fo-hora">${qdEsc(qdTempo(p))}</span>
          <span class="fo-tipo">${qdEhEntrega(p) ? "Entrega" : "Retirada"}</span>
        </div>
        <p class="fo-itens">${qdItens(p)}</p>
        ${p.obs ? `<p class="fo-obs">Observação: ${qdEsc(p.obs)}</p>` : ""}
        <button type="button" class="fo-pronto" data-qd-avancar="${qdEsc(p.id)}">${qdAcao("preparando", p)}</button>
      </article>`).join("")}</div>`
    : `<p class="qd-vazio-grande"><b>Nada no forno</b>Quando você aceitar um pedido ele aparece aqui.</p>`);
};

/* =========================================================
   Um clique só para avançar o pedido, venha de qual tela vier
   ========================================================= */
document.addEventListener("click", ev => {
  const b = ev.target.closest("[data-qd-avancar]");
  if (!b || !window.qdAvancar) return;
  window.qdAvancar(b.dataset.qdAvancar);
});
