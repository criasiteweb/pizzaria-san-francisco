/* =========================================================
   Pizzaria San Francisco — Comanda do balcão (aba "Comanda" do painel)
   Criasiteweb

   Para o pedido que não vem do site: o dono monta clicando
   nos itens do cardápio. Dá para deixar VÁRIAS comandas
   abertas ao mesmo tempo (balcão, telefone, entrega…), e cada
   uma guarda cliente, forma de pagamento, taxa e troco.

   Tudo fica salvo no próprio aparelho: se a aba fechar ou a
   luz cair, as comandas abertas continuam lá.
   ========================================================= */

const CHAVE_COMANDAS = "rb_comandas_v1";

let comandas = [];
let atual = 0;
let grupoAberto = "todos";
let busca = "";
let mmAtivo = false;      // "meio a meio" ligado no balcão
let mmPrimeiro = null;    // { ref, tam } do 1º sabor escolhido, esperando o 2º

/* ========================= guardar e ler ========================= */
/* ========================= o que o painel precisa saber =========================
   A aba "Em aberto" mostra, lado a lado, os pedidos que vieram do site e as
   comandas que estão abertas aqui no balcão e nas mesas. Quem guarda as
   comandas é este arquivo, então é daqui que elas saem. */
window.rbAbertas = function () {
  return comandas
    .filter(c => c.pedido.itens.length)
    .map(c => ({
      id: c.id,
      num: c.num,
      criada: c.criada || "",
      tipo: c.pedido.tipo || "",
      mesa: c.pedido.mesa || null,
      cliente: c.pedido.cliente || "",
      forma: c.forma || "",
      itens: c.pedido.itens.map(i => ({ q: i.q, nome: i.nome })),
      subtotal: Number(c.pedido.subtotal) || 0
    }));
};

/* abrir uma comanda pelo id, vindo de um clique na aba "Em aberto" */
window.rbAbrirComanda = function (id) {
  const i = comandas.findIndex(c => c.id === id);
  if (i < 0) return false;
  atual = i;
  salvar();
  desenharComanda();
  return true;
};

function salvar() {
  const texto = JSON.stringify({ comandas, atual });
  /* a aba "Em aberto" mostra as comandas junto dos pedidos do site:
     toda vez que elas mudam, ela precisa se redesenhar */
  if (window.rbAoMudarComandas) window.rbAoMudarComandas();
  if (window.guardarComSeguranca) { window.guardarComSeguranca(CHAVE_COMANDAS, texto); return; }
  try { localStorage.setItem(CHAVE_COMANDAS, texto); }
  catch (e) { /* aparelho sem espaço: segue só na memória desta sessão */ }
}

function carregar() {
  try {
    const g = JSON.parse(localStorage.getItem(CHAVE_COMANDAS) || "null");
    if (g && Array.isArray(g.comandas) && g.comandas.length) {
      comandas = g.comandas;
      atual = Math.min(g.atual || 0, comandas.length - 1);
      return;
    }
  } catch (e) {}
  comandas = [];
  novaComanda(false);
}

function pedidoVazio() {
  return {
    itens: [], subtotal: 0, taxa: null,
    cliente: "", fone: "", tipo: "Retirada no balcão",
    endereco: "", pagamento: "", obs: "", mesa: null
  };
}

/* ========================= pedido chegando da mesa (restaurante.html) =========================
   O painel escuta "pedidos_mesa" (em painel.js) e chama esta função pra cada
   pedido novo. Soma na comanda daquela mesa se já estiver aberta, ou abre
   uma nova. Não mexe na aba que o atendente estiver olhando no momento. */
window.rbImportarPedidoMesa = function (mesaNum, itens, cliente) {
  let c = comandas.find(x => x.pedido.tipo === "No restaurante" && x.pedido.mesa === mesaNum);
  if (!c) {
    c = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      num: numeroComanda(true),
      pedido: Object.assign(pedidoVazio(), { tipo: "No restaurante", mesa: mesaNum }),
      forma: "", recebido: "",
      criada: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };
    comandas.push(c);
  }
  if (cliente && !c.pedido.cliente) c.pedido.cliente = cliente;
  (itens || []).forEach(i => {
    c.pedido.itens.push({
      ref: "", q: Number(i.qtd) || 1, nome: i.nome, unit: Number(i.preco) || 0, total: 0,
      lanches: i.escolhas || "", adds: i.adds || "", obs: i.obs || ""
    });
  });
  c.pedido.itens.forEach(l => { l.total = l.unit * l.q; });
  c.pedido.subtotal = c.pedido.itens.reduce((s, l) => s + l.total, 0);
  salvar();
  desenharAbas();
  if (comanda() === c) desenharComanda();
};

function novaComanda(redesenhar = true) {
  comandas.push({
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    num: numeroComanda(true),
    pedido: pedidoVazio(),
    forma: "", recebido: "",
    criada: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  });
  atual = comandas.length - 1;
  salvar();
  if (redesenhar) desenharComanda();
}

const comanda = () => comandas[atual];

/* ========================= abas ========================= */
function tituloAba(c) {
  const p = c.pedido;
  if (p.tipo === "No restaurante" && p.mesa) {
    return "Mesa " + p.mesa + (p.cliente ? " · " + p.cliente.split(/\s+/)[0] : "");
  }
  if (p.cliente) return p.cliente.split(/\s+/)[0];
  const q = p.itens.reduce((s, i) => s + i.q, 0);
  return q ? q + (q === 1 ? " item" : " itens") : "Comanda " + c.num;
}

function desenharAbas() {
  const alvo = $("[data-abas]");
  if (!alvo) return;
  alvo.innerHTML = comandas.map((c, i) => {
    const total = c.pedido.subtotal + (/entrega/i.test(c.pedido.tipo) ? (Number(c.pedido.taxa) || 0) : 0);
    return `<button type="button" class="cmd-aba ${i === atual ? "ativa" : ""}" data-aba="${i}">
      <b>#${c.num} · ${escapa(tituloAba(c))}</b>
      <i>${total ? reais(total) : c.criada}</i>
    </button>`;
  }).join("") + `<button type="button" class="cmd-aba nova" data-nova>+ Nova comanda</button>`;
}

function escapa(s) {
  return String(s).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

/* ========================= cardápio para clicar ========================= */
function desenharGrupos() {
  const alvo = $("[data-grupos]");
  if (!alvo) return;
  const lista = [{ id: "todos", rotulo: "Tudo" }].concat(
    (typeof GRUPOS !== "undefined" ? GRUPOS : []).map(g => ({ id: g.id, rotulo: g.rotulo }))
  );
  alvo.innerHTML = lista.map(g =>
    `<button type="button" class="${g.id === grupoAberto ? "ativo" : ""}" data-grupo="${g.id}">${g.rotulo}</button>`
  ).join("");
}

function desenharItens() {
  const alvo = $("[data-itens]");
  if (!alvo) return;
  const todos = typeof CARDAPIO !== "undefined" ? CARDAPIO : [];
  const t = busca.trim().toLowerCase();
  const lista = todos.filter(i => {
    const noGrupo = grupoAberto === "todos" || i.g === grupoAberto;
    const naBusca = !t || semAcento(i.n).toLowerCase().includes(semAcento(t));
    return noGrupo && naBusca;
  });
  /* Pizza no balcão vira um botão por tamanho: o atendente clica em
     "Calabresa Grande" e o preço já entra certo, sem digitar nada. */
  const botoes = [];
  lista.forEach(i => {
    if (i.pz && i.t && typeof TAMANHOS !== "undefined") {
      TAMANHOS.forEach(t => botoes.push({
        id: `${i.id}@${t.id}`,
        n: `${i.n} · ${t.n}`,
        p: Number(i.t[t.id] || 0)
      }));
    } else {
      botoes.push({ id: i.id, n: i.n, p: Number(i.p || 0) });
    }
  });

  alvo.innerHTML = botoes.length
    ? botoes.map(i => {
        const escolhido = mmPrimeiro && i.id === `${mmPrimeiro.ref}@${mmPrimeiro.tam}`;
        return `
      <button type="button" class="cmd-item${escolhido ? " escolhido" : ""}" data-add="${i.id}">
        <span>${escapa(i.n)}</span>
        <b>${reais(i.p)}</b>
      </button>`;
      }).join("")
    : `<p class="cmd-vazio">Nenhum item com esse nome.</p>`;
}

/* ========================= itens da comanda ========================= */
function acharItem(id) {
  const todos = typeof CARDAPIO !== "undefined" ? CARDAPIO : [];
  /* "s3@grande" = sabor s3 no tamanho grande */
  if (String(id).includes("@")) {
    const [ref, tam] = String(id).split("@");
    const base = todos.find(i => i.id === ref);
    if (!base) return null;
    const t = (typeof TAMANHOS !== "undefined" ? TAMANHOS : []).find(x => x.id === tam);
    return { id, n: `${base.n} · ${t ? t.n : tam}`, p: Number((base.t || {})[tam] || base.p || 0), g: base.g };
  }
  return todos.find(i => i.id === id);
}

function recalcular() {
  const p = comanda().pedido;
  p.itens.forEach(l => { l.total = l.unit * l.q; });
  p.subtotal = p.itens.reduce((s, l) => s + l.total, 0);
}

/* Meio a meio no balcão: clica em 2 sabores do mesmo tamanho e combina
   num item só, com o preço do mais caro (+ R$ 1 no broto, mesma regra
   do site). Pedido do Matheus em 25/09/2026: o balcão tinha só pizza
   inteira, sem essa opção. */
function tentarMeioAMeio(id) {
  if (!mmAtivo || !String(id).includes("@")) return false;
  const [ref, tam] = String(id).split("@");

  if (!mmPrimeiro) {
    mmPrimeiro = { ref, tam };
    desenharItens();
    return true;
  }
  if (mmPrimeiro.ref === ref && mmPrimeiro.tam === tam) {
    mmPrimeiro = null;                 // clicou de novo no mesmo: cancela
    desenharItens();
    return true;
  }
  if (mmPrimeiro.tam !== tam) {
    alert("Os dois sabores precisam ser do mesmo tamanho.");
    return true;
  }

  const base1 = acharItem(`${mmPrimeiro.ref}@${tam}`);
  const base2 = acharItem(`${ref}@${tam}`);
  const sabor1 = (typeof CARDAPIO !== "undefined" ? CARDAPIO : []).find(i => i.id === mmPrimeiro.ref);
  const sabor2 = (typeof CARDAPIO !== "undefined" ? CARDAPIO : []).find(i => i.id === ref);
  if (!base1 || !base2) { mmPrimeiro = null; return true; }

  let preco = Math.max(base1.p, base2.p);
  if (tam === "broto" && typeof TAXA_MEIO_A_MEIO_BROTO !== "undefined") preco += TAXA_MEIO_A_MEIO_BROTO;

  const tamNome = (typeof TAMANHOS !== "undefined" ? TAMANHOS.find(t => t.id === tam) : null);
  const nome1 = sabor1 ? sabor1.n.replace(/^\d+\s*·\s*/, "") : base1.n;
  const nome2 = sabor2 ? sabor2.n.replace(/^\d+\s*·\s*/, "") : base2.n;

  /* a meio a meio também escolhe borda e adicionais, igual no site.
     A borda segue o sabor 1: se ele for doce, aparecem as bordas doces. */
  mmPrimeiro = null;
  desenharItens();
  abrirOpcoes({
    base: sabor1 || sabor2,
    itemId: "",
    nome: `Pizza ${tamNome ? tamNome.n : tam} · ${nome1} / ${nome2}`,
    preco: preco,
    meio: true
  });
  return true;
}

/* =========================================================
   Escolhas do item: as mesmas do site

   No site o cliente escolhe tamanho, borda, adicionais e, na Moda do
   Freguês, os ingredientes. O balcão só tinha tamanho, então o
   atendente ficava digitando na observação. Agora abre a mesma tela.

   Bebida, caldo e qualquer item sem escolha continuam entrando com um
   clique só, sem tela nenhuma no caminho.
   ========================================================= */
let opAberta = null;   // { base, itemId, nome, preco, meio, qtd }

function bordasDo(base) {
  const doce = base && base.g === "doces";
  const lista = doce
    ? (typeof BORDAS_DOCE !== "undefined" ? BORDAS_DOCE : [])
    : (typeof BORDAS_SALGADA !== "undefined" ? BORDAS_SALGADA : []);
  return lista;
}

function adicionaisDo(base) {
  if (!base || !base.add) return [];
  if (base.add === "lanche") return typeof ADD_LANCHE !== "undefined" ? ADD_LANCHE : [];
  return typeof ADD_PIZZA !== "undefined" ? ADD_PIZZA : [];
}

/* item que não tem nenhuma escolha entra direto na comanda */
function temEscolha(base) {
  if (!base) return false;
  return !!(base.pz || base.escolherIngredientes || adicionaisDo(base).length);
}

function abrirOpcoes(dados) {
  opAberta = Object.assign({ qtd: 1 }, dados);
  desenharOpcoes();
  $("[data-opcoes]").hidden = false;
}

function fecharOpcoes() {
  opAberta = null;
  $("[data-opcoes]").hidden = true;
}

function desenharOpcoes() {
  if (!opAberta) return;
  const base = opAberta.base;
  const bordas = opAberta.meio || (base && base.pz) ? bordasDo(base) : [];
  const adicionais = adicionaisDo(base);
  const quantos = base && base.escolherIngredientes;
  const ingredientes = typeof INGREDIENTES_FREGUES !== "undefined" ? INGREDIENTES_FREGUES : [];

  $("[data-op-nome]").textContent = opAberta.nome;
  $("[data-op-base]").textContent = reais(opAberta.preco) + " o item";

  let html = "";

  if (quantos && ingredientes.length) {
    html += `<div class="op-bloco">
      <p class="op-titulo">Escolha ${quantos} ingredientes</p>
      ${Array.from({ length: quantos }, (_, k) => `
        <label class="op-escolha">Ingrediente ${k + 1}
          <select data-op-ingrediente>
            ${ingredientes.map(i => `<option>${escapa(i)}</option>`).join("")}
          </select>
        </label>`).join("")}
    </div>`;
  }

  if (bordas.length) {
    html += `<div class="op-bloco">
      <p class="op-titulo">Borda</p>
      <label class="op-escolha">
        <select data-op-borda>
          ${bordas.map(b =>
            `<option value="${escapa(b.n)}" data-preco="${b.p}">${escapa(b.n)}${b.p ? " — mais " + reais(b.p) : ""}</option>`
          ).join("")}
        </select>
      </label>
    </div>`;
  }

  if (adicionais.length) {
    html += `<div class="op-bloco">
      <p class="op-titulo">Adicionais <small>(opcional)</small></p>
      <div class="op-extras">
        ${adicionais.map(a => `
          <label class="op-extra">
            <input type="checkbox" data-op-add value="${escapa(a.n)}" data-preco="${a.p}" />
            <span>${escapa(a.n)}</span><b>mais ${reais(a.p)}</b>
          </label>`).join("")}
      </div>
    </div>`;
  }

  html += `<div class="op-bloco">
    <p class="op-titulo">Observação deste item <small>(opcional)</small></p>
    <input type="text" data-op-obs placeholder="Ex.: sem cebola, bem assada" />
  </div>`;

  $("[data-op-corpo]").innerHTML = html;
  contaOpcoes();
}

/* quanto está custando com o que já foi marcado */
function precoDasOpcoes() {
  if (!opAberta) return 0;
  const sel = $("[data-op-borda]");
  const borda = sel ? Number(sel.selectedOptions[0].dataset.preco || 0) : 0;
  const adds = $$("[data-op-add]:checked").reduce((t, c) => t + Number(c.dataset.preco || 0), 0);
  return opAberta.preco + borda + adds;
}

function contaOpcoes() {
  if (!opAberta) return;
  $("[data-op-q]").textContent = opAberta.qtd;
  $("[data-op-total]").textContent = reais(precoDasOpcoes() * opAberta.qtd);
}

function confirmarOpcoes() {
  if (!opAberta) return;
  const unit = precoDasOpcoes();

  /* o que é descrição do item vai em "lanches", que a comanda imprime
     com "›"; o que é adicional pago vai em "adds", impresso com "+" */
  const detalhes = [];
  const ing = $$("[data-op-ingrediente]").map(s => s.value);
  if (ing.length) detalhes.push(ing.join(", "));
  const sel = $("[data-op-borda]");
  if (sel && !/^sem borda/i.test(sel.value)) detalhes.push("Borda: " + sel.value);

  const adds = $$("[data-op-add]:checked").map(c => c.value);
  const obs = ($("[data-op-obs]").value || "").trim();

  comanda().pedido.itens.push({
    ref: opAberta.meio ? "" : opAberta.itemId,
    q: opAberta.qtd,
    nome: opAberta.nome,
    unit: unit,
    total: unit * opAberta.qtd,
    lanches: detalhes.join(" · "),
    adds: adds.join(", "),
    obs: obs
  });

  fecharOpcoes();
  recalcular(); salvar(); desenharComanda(); desenharItens();
}

function adicionar(id) {
  if (tentarMeioAMeio(id)) return;
  const item = acharItem(id);
  if (!item) return;

  /* pizza, ou item com adicionais, abre as escolhas antes de entrar */
  const base = (typeof CARDAPIO !== "undefined" ? CARDAPIO : [])
    .find(i => i.id === String(id).split("@")[0]);
  if (temEscolha(base)) {
    abrirOpcoes({ base: base, itemId: id, nome: item.n, preco: item.p, meio: false });
    return;
  }

  const p = comanda().pedido;
  const ja = p.itens.find(l => l.ref === id && !l.obs && !l.lanches);
  if (ja) ja.q += 1;
  else p.itens.push({ ref: id, q: 1, nome: item.n, unit: item.p, total: item.p, lanches: "", adds: "", obs: "" });
  recalcular(); salvar(); desenharComanda();
}

function adicionarAvulso() {
  const nome = prompt("Nome do item:");
  if (!nome || !nome.trim()) return;
  const valor = prompt("Preço do item (ex.: 12,50):");
  const preco = paraNumero(valor || "0");
  if (!preco) return avisar("Preço inválido — a comanda não foi alterada.", true);
  const p = comanda().pedido;
  p.itens.push({ ref: "", q: 1, nome: nome.trim(), unit: preco, total: preco, lanches: "", adds: "", obs: "" });
  recalcular(); salvar(); desenharTudo();
}

function desenharLinhas() {
  const alvo = $("[data-linhas]");
  if (!alvo) return;
  const p = comanda().pedido;
  alvo.innerHTML = p.itens.length
    ? p.itens.map((l, i) => `
      <div class="cmd-linha">
        <div class="cmd-qtd">
          <button type="button" data-menos="${i}" aria-label="Tirar um">−</button>
          <b>${l.q}</b>
          <button type="button" data-mais="${i}" aria-label="Pôr mais um">+</button>
        </div>
        <div class="cmd-nome">
          <span>${escapa(l.nome)}</span>
          ${l.lanches ? `<i>${escapa(l.lanches)}</i>` : ""}
          ${l.adds ? `<i>+ ${escapa(l.adds)}</i>` : ""}
          ${l.obs ? `<i>${escapa(l.obs)}</i>` : ""}
        </div>
        <b class="cmd-valor">${reais(l.total)}</b>
        <button type="button" class="cmd-obs" data-obs-item="${i}" title="Observação deste item">✎</button>
        <button type="button" class="cmd-tira" data-tira="${i}" title="Tirar da comanda">✕</button>
      </div>`).join("")
    : `<p class="cmd-vazio">Clique nos itens do cardápio ao lado para montar a comanda.</p>`;
}

/* ========================= totais ========================= */
function desenharTotais() {
  const alvo = $("[data-totais]");
  if (!alvo) return;
  const c = comanda(), p = c.pedido;
  const entrega = /entrega/i.test(p.tipo || "");
  const taxa = entrega ? (Number(p.taxa) || 0) : 0;
  const total = p.subtotal + taxa;
  const recebido = paraNumero(c.recebido || "0");
  const troco = (/dinheiro/i.test(c.forma) && recebido > total) ? recebido - total : 0;
  const falta = (/dinheiro/i.test(c.forma) && recebido && recebido < total) ? total - recebido : 0;

  alvo.innerHTML = `
    <div class="cmd-total-linha"><span>Subtotal</span><b>${reais(p.subtotal)}</b></div>
    ${entrega ? `<div class="cmd-total-linha"><span>Taxa de entrega</span><b>${taxa ? reais(taxa) : "a combinar"}</b></div>` : ""}
    <div class="cmd-total-linha geral"><span>Total</span><b>${reais(total)}</b></div>
    ${troco ? `<div class="cmd-total-linha troco"><span>Troco para o cliente</span><b>${reais(troco)}</b></div>` : ""}
    ${falta ? `<div class="cmd-total-linha falta"><span>Falta receber</span><b>${reais(falta)}</b></div>` : ""}`;
}

/* ========================= a folha ========================= */
function paraImpressao() {
  const c = comanda();
  const p = JSON.parse(JSON.stringify(c.pedido));
  p.pagamento = c.forma || "";
  const recebido = paraNumero(c.recebido || "0");
  if (/dinheiro/i.test(c.forma) && recebido) p.pagamento = `Dinheiro (troco para ${reais(recebido)})`;
  return p;
}

function desenharPapel() {
  const papel = $("[data-papel]");
  if (!papel) return;
  const c = comanda();
  papel.innerHTML = c.pedido.itens.length
    ? comandaHTML(paraImpressao(), c.num)
    : `<div class="cru">A comanda aparece aqui assim que você adicionar o primeiro item.</div>`;
}

/* ========================= campos ========================= */
function pintarCampos() {
  const c = comanda(), p = c.pedido;
  const entrega = /entrega/i.test(p.tipo || "");
  const noLocal = /restaurante|mesa/i.test(p.tipo || "");

  $("[data-cliente]").value = p.cliente || "";
  $("[data-fone]").value = p.fone || "";
  $("[data-endereco]").value = p.endereco || "";
  $("[data-obs]").value = p.obs || "";
  $("[data-recebido]").value = c.recebido || "";

  $("[data-mesa]").value = p.mesa || "";
  $("[data-campo-mesa]").hidden = !noLocal;
  $("[data-campo-endereco]").hidden = !entrega;
  $("[data-campo-taxa]").hidden = !entrega;
  $("[data-campo-troco]").hidden = !/dinheiro/i.test(c.forma || "");

  $$("[data-tipos] button").forEach(b =>
    b.classList.toggle("ativo", b.dataset.tipo === p.tipo));
  $$("[data-pagto] button").forEach(b =>
    b.classList.toggle("ativo", b.dataset.forma === c.forma));
}

/* só a comanda: usado ao clicar num item, para a lista do cardápio
   não piscar nem perder o ponto onde o atendente estava */
function desenharComanda() {
  desenharAbas(); desenharLinhas(); desenharTotais(); pintarCampos(); desenharPapel();
}

function desenharTudo() {
  if (!comandas.length) novaComanda(false);
  desenharGrupos(); desenharItens(); desenharComanda();
}

/* ========================= fechar a comanda ========================= */
/* Fechar = a venda aconteceu. Ela sai das abas e entra no caixa do dia, já na
   forma de pagamento escolhida, somando junto com os pedidos do site. */
function comoVenda(c) {
  const p = c.pedido;
  const entrega = /entrega/i.test(p.tipo || "");
  const taxa = entrega ? (Number(p.taxa) || 0) : 0;
  return {
    id: c.id,
    numero: c.num,
    origem: "balcao",
    status: "concluido",
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    cliente: p.cliente || "",
    fone: p.fone || "",
    tipo: p.tipo,
    endereco: p.endereco || "",
    pagamento: paraImpressao().pagamento || "",
    forma: c.forma || "",
    recebido: c.recebido || "",
    obs: p.obs || "",
    itens: p.itens.map(i => ({ ref: i.ref || "", q: i.q, nome: i.nome, unit: i.unit, total: i.total, obs: i.obs || "" })),
    subtotal: p.subtotal,
    taxa: taxa,
    total: p.subtotal + taxa
  };
}

async function fecharComanda() {
  const c = comanda();
  if (!c.pedido.itens.length) {
    if (!confirm("Esta comanda está vazia. Fechar mesmo assim?")) return;
    return descartar();
  }
  if (!c.forma) {
    avisar("Escolha a forma de pagamento antes de fechar — é ela que leva o valor para o caixa.", true);
    return;
  }
  const venda = comoVenda(c);
  if (window.rbComandas) {
    try { await window.rbComandas.gravar(venda); }
    catch (e) { return avisar("Não consegui salvar no caixa. Verifique a internet e tente de novo.", true); }
  }
  /* o que tem controle de estoque (bebida, cerveja, água) baixa sozinho.
     Pizza e caldo são feitos na hora, então passam sem mexer em nada. */
  if (window.estBaixar) { try { window.estBaixar(venda.itens); } catch (e) {} }
  descartar();
  desenharHistoricoComandas();
  avisar(`Comanda #${venda.numero} fechada — ${reais(venda.total)} em ${venda.forma}. Já entrou no caixa.`, false);
}

function descartar() {
  if (comandas.length === 1) { comandas = []; novaComanda(false); }
  else { comandas.splice(atual, 1); atual = Math.max(0, atual - 1); }
  salvar(); desenharComanda();
}

/* ========================= histórico de comandas ========================= */
function desenharHistoricoComandas() {
  const alvo = $("[data-hist-comandas]");
  if (!alvo) return;
  const lista = window.rbComandas ? window.rbComandas.listar() : [];
  if (!lista.length) {
    alvo.innerHTML = `<p class="cmd-vazio">Nenhuma comanda fechada ainda hoje.</p>`;
    return;
  }
  alvo.innerHTML = lista.slice().reverse().map(v => `
    <div class="cmd-hist">
      <div class="cmd-hist-topo">
        <b>#${v.numero}</b>
        <span>${escapa(v.cliente || v.tipo || "Balcão")}</span>
        <i>${v.hora || ""}</i>
      </div>
      <div class="cmd-hist-baixo">
        <span class="cmd-hist-forma">${escapa(v.forma || v.pagamento || "—")}</span>
        <b>${reais(v.total || 0)}</b>
      </div>
      <div class="cmd-hist-acoes">
        <button type="button" data-editar-comanda="${escapa(v.id)}">Abrir para editar</button>
        <button type="button" class="cmd-tira-hist" data-apagar-comanda="${escapa(v.id)}">Apagar</button>
      </div>
    </div>`).join("");
}

/* traz a comanda fechada de volta para as abas, e tira do caixa enquanto
   estiver sendo mexida — assim o valor não conta duas vezes */
async function editarComanda(id) {
  const v = (window.rbComandas ? window.rbComandas.listar() : []).find(x => x.id === id);
  if (!v) return;
  comandas.push({
    id: v.id,
    num: v.numero,
    pedido: {
      itens: (v.itens || []).map(i => ({ ref: i.ref || "", q: i.q, nome: i.nome, unit: i.unit, total: i.total, lanches: "", adds: "", obs: i.obs || "" })),
      subtotal: v.subtotal || 0,
      taxa: v.taxa || null,
      cliente: v.cliente || "", fone: v.fone || "",
      tipo: v.tipo || "Retirada no balcão",
      endereco: v.endereco || "", pagamento: "", obs: v.obs || ""
    },
    forma: v.forma || "", recebido: v.recebido || "",
    criada: v.hora || ""
  });
  atual = comandas.length - 1;
  recalcular();
  try { await window.rbComandas.remover(id); } catch (e) {}
  salvar(); desenharComanda(); desenharHistoricoComandas();
  avisar("Comanda #" + v.numero + " reaberta. Ela sai do caixa enquanto você mexe, e volta quando fechar de novo.", false);
}

/* ========================= impressão ========================= */
/* ========================= cliques da tela de escolhas ========================= */
function ligarOpcoes() {
  const caixa = $("[data-opcoes]");
  if (!caixa) return;

  caixa.addEventListener("click", ev => {
    /* clicar no escuro em volta fecha, como o cliente espera */
    if (ev.target === caixa || ev.target.closest("[data-op-cancelar]")) return fecharOpcoes();
    if (ev.target.closest("[data-op-mais]")) { opAberta.qtd++; return contaOpcoes(); }
    if (ev.target.closest("[data-op-menos]")) {
      if (opAberta.qtd > 1) opAberta.qtd--;
      return contaOpcoes();
    }
    if (ev.target.closest("[data-op-confirmar]")) return confirmarOpcoes();
  });

  caixa.addEventListener("change", ev => {
    if (ev.target.matches("[data-op-borda], [data-op-add]")) contaOpcoes();
  });

  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && opAberta) fecharOpcoes();
  });
}

function textoParaImprimir() {
  const sem = $("[data-semacento]") && $("[data-semacento]").checked;
  return comandaTexto(paraImpressao(), comanda().num, sem);
}

function temItem() {
  if (comanda().pedido.itens.length) return true;
  avisar("Adicione pelo menos um item antes de imprimir.", true);
  return false;
}

/* ========================= início ========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (!$("[data-abas]")) return;   // não estamos no painel
  carregar();
  desenharTudo();
  window.rbAoCarregarComandas = desenharHistoricoComandas;
  desenharHistoricoComandas();
  ligarOpcoes();

  const semAcentoCx = $("[data-semacento]");
  if (semAcentoCx) {
    semAcentoCx.checked = localStorage.getItem("rb_semacento") !== "nao";
    semAcentoCx.addEventListener("change", e =>
      localStorage.setItem("rb_semacento", e.target.checked ? "sim" : "nao"));
  }

  /* --- cliques --- */
  document.addEventListener("click", e => {
    const aba = e.target.closest("[data-aba]");
    if (aba) { atual = Number(aba.dataset.aba); salvar(); desenharComanda(); return; }

    if (e.target.closest("[data-nova]")) { novaComanda(); return; }
    if (e.target.closest("[data-avulso]")) { adicionarAvulso(); return; }

    const g = e.target.closest("[data-grupo]");
    if (g) { grupoAberto = g.dataset.grupo; desenharGrupos(); desenharItens(); return; }

    const mmBt = e.target.closest("[data-mm-toggle]");
    if (mmBt) {
      mmAtivo = !mmAtivo;
      mmPrimeiro = null;
      mmBt.textContent = mmAtivo ? "Meio a meio: ligado" : "Meio a meio: desligado";
      mmBt.setAttribute("aria-pressed", String(mmAtivo));
      const ajuda = $("[data-mm-ajuda]");
      if (ajuda) ajuda.hidden = !mmAtivo;
      desenharItens();
      return;
    }

    const add = e.target.closest("[data-add]");
    if (add) { adicionar(add.dataset.add); return; }

    const mais = e.target.closest("[data-mais]");
    if (mais) { comanda().pedido.itens[+mais.dataset.mais].q++; recalcular(); salvar(); desenharComanda(); return; }

    const menos = e.target.closest("[data-menos]");
    if (menos) {
      const l = comanda().pedido.itens[+menos.dataset.menos];
      l.q--; if (l.q <= 0) comanda().pedido.itens.splice(+menos.dataset.menos, 1);
      recalcular(); salvar(); desenharComanda(); return;
    }

    const tira = e.target.closest("[data-tira]");
    if (tira) { comanda().pedido.itens.splice(+tira.dataset.tira, 1); recalcular(); salvar(); desenharComanda(); return; }

    const obsIt = e.target.closest("[data-obs-item]");
    if (obsIt) {
      const l = comanda().pedido.itens[+obsIt.dataset.obsItem];
      const t = prompt("Observação deste item (ex.: sem cebola, ponto da carne, quais lanches do combo):", l.obs || "");
      if (t === null) return;
      l.obs = t.trim(); salvar(); desenharComanda(); return;
    }

    const tipo = e.target.closest("[data-tipo]");
    if (tipo) {
      const v = tipo.dataset.tipo;
      comanda().pedido.tipo = v;
      salvar(); desenharComanda(); return;
    }

    const forma = e.target.closest("[data-forma]");
    if (forma) {
      const c = comanda();
      c.forma = c.forma === forma.dataset.forma ? "" : forma.dataset.forma;
      if (!/dinheiro/i.test(c.forma)) c.recebido = "";
      salvar(); desenharComanda(); return;
    }

    if (e.target.closest("[data-fechar-comanda]")) {
      fecharComanda();
      return;
    }

    const ed = e.target.closest("[data-editar-comanda]");
    if (ed) { editarComanda(ed.dataset.editarComanda); return; }

    const ap = e.target.closest("[data-apagar-comanda]");
    if (ap) {
      if (!confirm("Apagar esta comanda do caixa? O valor dela sai do total do dia.")) return;
      (async () => {
        try { await window.rbComandas.remover(ap.dataset.apagarComanda); } catch (e) {}
        desenharHistoricoComandas();
      })();
      return;
    }

    if (e.target.closest("[data-imprimir]") && e.target.closest("[data-balcao]")) {
      if (!temItem()) return;
      desenharPapel();
      window.print();
      avisar("Comanda #" + comanda().num + " mandada para a impressora.", false);
      return;
    }



    if (e.target.closest("[data-ler]")) {
      const t = $("[data-entrada]").value;
      const lido = lerPedido(t);
      if (!lido) return avisar("Não reconheci o formato desse texto.", true);
      const c = comanda();
      lido.itens.forEach(i => { i.unit = i.q ? i.total / i.q : i.total; });
      c.pedido = Object.assign(pedidoVazio(), lido);
      c.forma = lido.pagamento || "";
      recalcular(); salvar(); desenharComanda();
      avisar("Pedido lido — confira e imprima.", false);
      return;
    }
  });

  $("[data-colar]").addEventListener("click", async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (!t.trim()) return avisar("A área de transferência está vazia.", true);
      $("[data-entrada]").value = t;
      avisar("Colado. Agora toque em “Transformar em comanda”.", false);
    } catch (e) {
      avisar("Seu navegador não deixou colar sozinho — cole no campo com o dedo mesmo.", true);
    }
  });

  /* --- digitação --- */
  const liga = (sel, fn) => {
    const c = $(sel);
    if (c) c.addEventListener("input", e => { fn(e.target.value); salvar(); desenharAbas(); desenharTotais(); desenharPapel(); });
  };
  liga("[data-cliente]",  v => comanda().pedido.cliente = v);
  liga("[data-fone]",     v => comanda().pedido.fone = v);
  liga("[data-endereco]", v => comanda().pedido.endereco = v);
  /* mesa digitada no balcão: é ela que junta as comandas da mesma mesa
     no cartão com a soma, lá na aba Em aberto */
  liga("[data-mesa]",     v => comanda().pedido.mesa = v ? Number(v) : null);
  liga("[data-obs]",      v => comanda().pedido.obs = v);
  liga("[data-recebido]", v => comanda().recebido = v);

  const cx = $("[data-busca]");
  if (cx) cx.addEventListener("input", e => { busca = e.target.value; desenharItens(); });
});
