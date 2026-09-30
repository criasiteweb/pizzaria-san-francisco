/* =========================================================
   Pizzaria San Francisco — Cardápio (dados)
   Criasiteweb

   Cardápio tirado do folheto da pizzaria (Rua Eugênio Roncon, 175
   — Roncon — Ribeirão Pires), em 29/09/2026.
   Modelo feito a partir do site da Pizzaria Vitória (sem alterar o dela).
   ========================================================= */

/* ---------- tamanho ----------
   O folheto tem dois tamanhos: P e G. [CONFIRMAR fatias com o dono] */
const TAMANHOS = [
  { id: "broto",  n: "Pequena", d: "", sabores: 2 },
  { id: "grande", n: "Grande",  d: "", sabores: 2 }
];

/* ---------- borda ----------
   Folheto: borda de catupiry Top Milk grátis; bordas de cheddar,
   catupiry original, cream cheese e chocolate a R$ 10,00. */
const BORDA_GRATIS = { n: "Borda de catupiry Top Milk (grátis)", p: 0 };
const BORDA_SEM    = { n: "Sem borda recheada", p: 0 };
const BORDAS_RECHEADAS_DOCES = [
  { n: "Borda de chocolate", p: 10.00 }
];
const BORDAS_SALGADA = [
  BORDA_GRATIS,
  { n: "Borda de cheddar",           p: 10.00 },
  { n: "Borda de catupiry original", p: 10.00 },
  { n: "Borda de cream cheese",      p: 10.00 },
  ...BORDAS_RECHEADAS_DOCES,
  BORDA_SEM
];
const BORDAS_DOCE = [
  BORDA_SEM,
  ...BORDAS_RECHEADAS_DOCES
];

/* ---------- acréscimos da pizza (folheto: R$ 14,00 cada) ---------- */
const ADD_PIZZA = [
  { n: "Catupiry original", p: 14.00 },
  { n: "Cheddar",           p: 14.00 },
  { n: "Cream cheese",      p: 14.00 }
];
const ADD_LANCHE = [];

/* Meio a meio: cobra o sabor mais caro. [CONFIRMAR com o dono] */
const TAXA_MEIO_A_MEIO_BROTO = 0;

/* ---- grupos do cardápio ---- */
const GRUPOS = [
  { id: "salgadas", rotulo: "Salgadas", titulo: "Pizzas salgadas", nota: "86 sabores, do 01 ao 86. Do 74 ao 86 são as especiais, feitas com catupiry original. Toque num sabor pra escolher o tamanho e, se quiser, fazer meio a meio. Borda de catupiry Top Milk grátis." },
  { id: "doces",    rotulo: "Doces",    titulo: "Pizzas doces",    nota: "16 sabores. Meio a meio vale com outro doce ou com um salgado." },
  { id: "caldos",   rotulo: "Caldos",   titulo: "Caldos",          nota: "Pote de 440 ml. Verifique os sabores disponíveis do dia." },
  /* [CONFIRMAR com o dono: marcas, tamanhos e precos das bebidas] */
  { id: "bebidas",  rotulo: "Bebidas",  titulo: "Bebidas",         nota: "Refrigerante, suco, água e cerveja. Tudo gelado." }
];

/* Nome do item no pedido e na comanda. Pastel e porção têm sabores com o
   mesmo nome ("Calabresa", "Chocolate"), então levam o tipo na frente
   para a cozinha saber o que fazer. */
const PREFIXO_NO_PEDIDO = { pasteis: "Pastel", pasteisdoces: "Pastel doce", porcoes: "Porção" };
function nomeNoPedido(i) {
  const pre = i && PREFIXO_NO_PEDIDO[i.g];
  return pre ? `${pre} · ${i.n}` : (i ? i.n : "");
}

/* Ingredientes pra montar "Moda do Freguês" (5 à escolha). */
const INGREDIENTES_FREGUES = [
  "Alho", "Alho poró", "Aliche", "Atum", "Bacon", "Brócolis", "Calabresa",
  "Cebola", "Champignon", "Ervilha", "Escarola", "Frango", "Gorgonzola",
  "Lombo", "Manjericão", "Milho", "Mussarela", "Ovo", "Palmito", "Parmesão",
  "Peito de peru", "Pimentão", "Presunto", "Provolone", "Requeijão", "Salame",
  "Tomate", "Tomate seco"
];

const CARDAPIO = [
  { id:"s1", g:"salgadas", n:"01 · Alho e Óleo", d:"Mussarela e alho.", pz:true, t:{broto:28.50, grande:55.00}, add:"pizza", f:"salgada-s55" },
  { id:"s2", g:"salgadas", n:"02 · Alho Poró", d:"Mussarela e alho poró.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s64" },
  { id:"s3", g:"salgadas", n:"03 · Aliche", d:"Aliche, cebola e mussarela.", pz:true, t:{broto:29.00, grande:55.00}, add:"pizza", f:"salgada-s45" },
  { id:"s4", g:"salgadas", n:"04 · Americana", d:"Palmito, ervilha, ovos cozidos, mussarela e bacon.", pz:true, t:{broto:32.50, grande:63.00}, add:"pizza", f:"salgada-s63" },
  { id:"s5", g:"salgadas", n:"05 · Atum", d:"Atum, ervilha e cebola.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s55" },
  { id:"s6", g:"salgadas", n:"06 · Atumcaparra", d:"Atum, mussarela, alcaparras e cebola.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s64" },
  { id:"s7", g:"salgadas", n:"07 · Atumsarela", d:"Atum e mussarela.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s45" },
  { id:"s8", g:"salgadas", n:"08 · Bacon", d:"Mussarela e bacon.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s63" },
  { id:"s9", g:"salgadas", n:"09 · Bahiacatu", d:"Calabresa, ervilha, pimenta e pimentão coberta com requeijão.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s55" },
  { id:"s10", g:"salgadas", n:"10 · Bahiana", d:"Calabresa, ervilha, pimenta e pimentão.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s64" },
  { id:"s11", g:"salgadas", n:"11 · Bauru", d:"Presunto, mussarela e tomates.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s45" },
  { id:"s12", g:"salgadas", n:"12 · Batata Frita", d:"Presunto, cheddar, batata frita e mussarela.", pz:true, t:{broto:33.00, grande:64.00}, add:"pizza", f:"salgada-s12" },
  { id:"s13", g:"salgadas", n:"13 · Brasileira", d:"Calabresa, palmito, mussarela, bacon e cebola.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s63" },
  { id:"s14", g:"salgadas", n:"14 · Brócolis", d:"Brócolis, bacon e mussarela.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s55" },
  { id:"s15", g:"salgadas", n:"15 · Burguesa", d:"Mussarela, calabresa moída, cebola roxa, pimenta biquinho e molho barbecue.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s64" },
  { id:"s16", g:"salgadas", n:"16 · Champignon", d:"Champignon e mussarela.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s45" },
  { id:"s17", g:"salgadas", n:"17 · Caipira", d:"Milho verde, ovos cozidos, ervilha e mussarela.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s63" },
  { id:"s18", g:"salgadas", n:"18 · Calabresa", d:"Calabresa e cebola.", pz:true, t:{broto:28.50, grande:55.00}, add:"pizza", f:"salgada-s17" },
  { id:"s19", g:"salgadas", n:"19 · Calacatu", d:"Calabresa, cebola e requeijão.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s55" },
  { id:"s20", g:"salgadas", n:"20 · Canandense", d:"Lombo, requeijão e cebola.", pz:true, t:{broto:29.50, grande:57.00}, add:"pizza", f:"salgada-s64" },
  { id:"s21", g:"salgadas", n:"21 · Carne Seca", d:"Carne seca, milho e requeijão.", pz:true, t:{broto:33.00, grande:64.00}, add:"pizza", f:"salgada-s22" },
  { id:"s22", g:"salgadas", n:"22 · Calamussa", d:"Calabresa, cebola e mussarela.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s45" },
  { id:"s23", g:"salgadas", n:"23 · Catupiry", d:"Requeijão top milk.", pz:true, t:{broto:28.50, grande:55.00}, add:"pizza", f:"salgada-s45" },
  { id:"s24", g:"salgadas", n:"24 · Cremosa", d:"Lombo, requeijão, parmesão e bacon.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s63" },
  { id:"s25", g:"salgadas", n:"25 · Cubana", d:"Calabresa, bacon e parmesão.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s55" },
  { id:"s26", g:"salgadas", n:"26 · Cinco Queijos", d:"Mussarela, parmesão, provolone, requeijão e gorgonzola.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s59" },
  { id:"s27", g:"salgadas", n:"27 · Dois Queijos", d:"Requeijão e mussarela.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s59" },
  { id:"s28", g:"salgadas", n:"28 · Doritos", d:"Mussarela, peperoni e Doritos.", pz:true, t:{broto:34.00, grande:66.00}, add:"pizza", f:"salgada-s46" },
  { id:"s29", g:"salgadas", n:"29 · Do Tio", d:"Calabresa, ovo, ervilha, cebola, tomate e mussarela.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s64" },
  { id:"s30", g:"salgadas", n:"30 · Do Zé", d:"Mussarela, frango, milho, ervilha, palmito e requeijão.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s45" },
  { id:"s31", g:"salgadas", n:"31 · Escarola", d:"Escarola refogada, champignon, bacon, cebola e mussarela.", pz:true, t:{broto:30.00, grande:58.00}, add:"pizza", f:"salgada-s63" },
  { id:"s32", g:"salgadas", n:"32 · Fabulosa", d:"Mussarela, carne seca, cebola roxa, pimenta biquinho e rodelas de pimentão.", pz:true, t:{broto:36.00, grande:70.00}, add:"pizza", f:"salgada-s55" },
  { id:"s33", g:"salgadas", n:"33 · Francesa", d:"Presunto, champignon e requeijão.", pz:true, t:{broto:30.00, grande:58.00}, add:"pizza", f:"salgada-s64" },
  { id:"s34", g:"salgadas", n:"34 · Frango", d:"Frango, cebola e requeijão.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s28" },
  { id:"s35", g:"salgadas", n:"35 · Gorgonzola", d:"Gorgonzola e mussarela.", pz:true, t:{broto:30.00, grande:58.00}, add:"pizza", f:"salgada-s59" },
  { id:"s36", g:"salgadas", n:"36 · Italiana", d:"Calabresa, cebola, mussarela e bacon.", pz:true, t:{broto:30.00, grande:58.00}, add:"pizza", f:"salgada-s45" },
  { id:"s37", g:"salgadas", n:"37 · Jardineira", d:"Milho verde, atum, ervilha, cebola e requeijão.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s63" },
  { id:"s38", g:"salgadas", n:"38 · Lombo", d:"Lombo com mussarela ou requeijão.", pz:true, t:{broto:29.00, grande:55.00}, add:"pizza", f:"salgada-s63" },
  { id:"s39", g:"salgadas", n:"39 · Mafiosa", d:"Carne seca, salame, ovo, mussarela e bacon.", pz:true, t:{broto:35.00, grande:68.00}, add:"pizza", f:"salgada-s55" },
  { id:"s40", g:"salgadas", n:"40 · Maluca", d:"Presunto, palmito, ervilha, atum, calabresa e mussarela.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s64" },
  { id:"s41", g:"salgadas", n:"41 · Marguerita", d:"Mussarela, molho de tomate e manjericão.", pz:true, t:{broto:28.50, grande:55.00}, add:"pizza", f:"salgada-s48" },
  { id:"s42", g:"salgadas", n:"42 · Milho", d:"Milho com requeijão ou com mussarela.", pz:true, t:{broto:29.00, grande:55.00}, add:"pizza", f:"salgada-s16" },
  { id:"s43", g:"salgadas", n:"43 · Maravilha", d:"Mussarela, lombo, champignon, milho e requeijão.", pz:true, t:{broto:32.50, grande:63.00}, add:"pizza", f:"salgada-s45" },
  { id:"s44", g:"salgadas", n:"44 · Mista", d:"Presunto, calabresa, cebola e mussarela.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s63" },
  { id:"s45", g:"salgadas", n:"45 · Moda da Casa 1", d:"Escarola, presunto, palmito, ervilha, bacon, parmesão e mussarela.", pz:true, t:{broto:32.50, grande:63.00}, add:"pizza", f:"salgada-s55" },
  { id:"s46", g:"salgadas", n:"46 · Moda da Casa 2", d:"Lombo, palmito, ervilha, mussarela e bacon.", pz:true, t:{broto:32.50, grande:63.00}, add:"pizza", f:"salgada-s64" },
  { id:"s47", g:"salgadas", n:"47 · Moda do Pizzaiolo 1", d:"Calabresa, presunto, ervilha, bacon, mussarela e palmito.", pz:true, t:{broto:32.50, grande:63.00}, add:"pizza", f:"salgada-s45" },
  { id:"s48", g:"salgadas", n:"48 · Moda do Pizzaiolo 2", d:"Peito de peru defumado, requeijão, tomate seco e alcaparras.", pz:true, t:{broto:32.50, grande:63.00}, add:"pizza", f:"salgada-s63" },
  { id:"s49", g:"salgadas", n:"49 · Moda do Freguês", d:"5 ingredientes à escolha do cliente.", pz:true, t:{broto:35.50, grande:69.00}, add:"pizza", f:"salgada-s55", escolherIngredientes:5 },
  { id:"s50", g:"salgadas", n:"50 · Moda do Vinicius", d:"Frango, requeijão, mussarela e bacon.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s64" },
  { id:"s51", g:"salgadas", n:"51 · Mussarela", d:"Mussarela e tomates.", pz:true, t:{broto:28.50, grande:55.00}, add:"pizza", f:"salgada-s45" },
  { id:"s52", g:"salgadas", n:"52 · Namorados", d:"Mussarela, palmito, champignon e requeijão.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s45" },
  { id:"s53", g:"salgadas", n:"53 · Napolitana", d:"Mussarela, tomate, molho e parmesão.", pz:true, t:{broto:28.50, grande:55.00}, add:"pizza", f:"salgada-s48" },
  { id:"s54", g:"salgadas", n:"54 · Palmito", d:"Palmito, ervilha, mussarela e bacon.", pz:true, t:{broto:31.50, grande:61.00}, add:"pizza", f:"salgada-s63" },
  { id:"s55", g:"salgadas", n:"55 · Paulistana", d:"Mussarela, presunto, bacon, tomate e cebola.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s55" },
  { id:"s56", g:"salgadas", n:"56 · Peito de Peru", d:"Peito de peru defumado, requeijão, cebola e mussarela.", pz:true, t:{broto:33.50, grande:65.00}, add:"pizza", f:"salgada-s63" },
  { id:"s57", g:"salgadas", n:"57 · Peperoni", d:"Mussarela e peperoni.", pz:true, t:{broto:33.50, grande:65.00}, add:"pizza", f:"salgada-s63" },
  { id:"s58", g:"salgadas", n:"58 · Peruana", d:"Atum, mussarela e bacon.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s63" },
  { id:"s59", g:"salgadas", n:"59 · Pipinela", d:"Mussarela, lombo, champignon e bacon.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s64" },
  { id:"s60", g:"salgadas", n:"60 · Portuguesa", d:"Presunto, ervilha, cebola, ovos cozidos e mussarela.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s45" },
  { id:"s61", g:"salgadas", n:"61 · Princesa", d:"Escarola, bacon e mussarela.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s63" },
  { id:"s62", g:"salgadas", n:"62 · Primavera", d:"Palmito, cebola e mussarela.", pz:true, t:{broto:30.50, grande:59.00}, add:"pizza", f:"salgada-s55" },
  { id:"s63", g:"salgadas", n:"63 · Quatro Queijos", d:"Mussarela, parmesão, provolone e requeijão.", pz:true, t:{broto:30.00, grande:58.00}, add:"pizza", f:"salgada-s59" },
  { id:"s64", g:"salgadas", n:"64 · San Francisco 1", d:"Palmito, champignon, tomate seco, mussarela ou requeijão top milk.", pz:true, t:{broto:33.50, grande:65.00}, add:"pizza", f:"salgada-s64" },
  { id:"s65", g:"salgadas", n:"65 · San Francisco 2", d:"Presunto, palmito, ervilha, ovos, frango, calabresa, requeijão e bacon.", pz:true, t:{broto:33.50, grande:65.00}, add:"pizza", f:"salgada-s45" },
  { id:"s66", g:"salgadas", n:"66 · Salamussa", d:"Mussarela e salame.", pz:true, t:{broto:33.50, grande:65.00}, add:"pizza", f:"salgada-s63" },
  { id:"s67", g:"salgadas", n:"67 · Siciliana", d:"Requeijão, champignon, bacon, cebola e tomate.", pz:true, t:{broto:30.00, grande:58.00}, add:"pizza", f:"salgada-s55" },
  { id:"s68", g:"salgadas", n:"68 · Strogonoff de Frango", d:"Mussarela, frango ao molho e batata palha.", pz:true, t:{broto:31.00, grande:60.00}, add:"pizza", f:"salgada-s28" },
  { id:"s69", g:"salgadas", n:"69 · Tomate Seco", d:"Mussarela, tomate seco e rúcula.", pz:true, t:{broto:30.00, grande:58.00}, add:"pizza", f:"salgada-s64" },
  { id:"s70", g:"salgadas", n:"70 · Toscana", d:"Calabresa, mussarela e tomate.", pz:true, t:{broto:29.00, grande:56.00}, add:"pizza", f:"salgada-s45" },
  { id:"s71", g:"salgadas", n:"71 · Três Queijos", d:"Mussarela, parmesão e provolone.", pz:true, t:{broto:29.50, grande:57.00}, add:"pizza", f:"salgada-s59" },
  { id:"s72", g:"salgadas", n:"72 · Troiana", d:"Lombo canadense, requeijão, parmesão, mussarela e bacon.", pz:true, t:{broto:32.00, grande:62.00}, add:"pizza", f:"salgada-s63" },
  { id:"s73", g:"salgadas", n:"73 · Vegetariana", d:"Escarola, palmito, ervilha, milho, champignon, cebola e tomate.", pz:true, t:{broto:29.50, grande:57.00}, add:"pizza", f:"salgada-s55" },
  { id:"s74", g:"salgadas", n:"74 · Atum Sólido (especial)", d:"Atum sólido e cebola.", pz:true, t:{broto:35.00, grande:68.00}, add:"pizza", f:"salgada-s64" },
  { id:"s75", g:"salgadas", n:"75 · Brócolis ao Molho Branco (especial)", d:"Brócolis, creme de leite, catupiry e mussarela.", pz:true, t:{broto:33.50, grande:65.00}, add:"pizza", f:"salgada-s45" },
  { id:"s76", g:"salgadas", n:"76 · Santista (especial)", d:"Atum sólido, cebola, alho, tomate, mussarela ou catupiry.", pz:true, t:{broto:38.00, grande:74.00}, add:"pizza", f:"salgada-s63" },
  { id:"s77", g:"salgadas", n:"77 · Seis Queijos (especial)", d:"Parmesão, provolone, catupiry, gorgonzola, cheddar e mussarela.", pz:true, t:{broto:36.50, grande:70.00}, add:"pizza", f:"salgada-s59" },
  { id:"s78", g:"salgadas", n:"78 · Frango Especial (especial)", d:"Frango, catupiry ou cheddar.", pz:true, t:{broto:38.00, grande:74.00}, add:"pizza", f:"salgada-s28" },
  { id:"s79", g:"salgadas", n:"79 · Mussarela Crocante (especial)", d:"Cheddar, mussarela, bacon e batata palha.", pz:true, t:{broto:35.00, grande:67.00}, add:"pizza", f:"salgada-s45" },
  { id:"s80", g:"salgadas", n:"80 · Nordestina (especial)", d:"Carne seca, alho, cebola, catupiry e mussarela.", pz:true, t:{broto:39.00, grande:76.00}, add:"pizza", f:"salgada-s55" },
  { id:"s81", g:"salgadas", n:"81 · Costela (especial)", d:"Costela desfiada, mussarela, catupiry, cebola roxa, pimenta biquinho e molho barbecue.", pz:true, t:{broto:36.00, grande:70.00}, add:"pizza", f:"salgada-s22" },
  { id:"s82", g:"salgadas", n:"82 · Batata Especial (especial)", d:"Batata frita, cheddar, catupiry original e bacon.", pz:true, t:{broto:36.00, grande:70.00}, add:"pizza", f:"salgada-s12" },
  { id:"s83", g:"salgadas", n:"83 · Frango Especial II (especial)", d:"Frango, cheddar e cream cheese.", pz:true, t:{broto:38.00, grande:74.00}, add:"pizza", f:"salgada-s28" },
  { id:"s84", g:"salgadas", n:"84 · Explosão de Doritos (especial)", d:"Cheddar, cream cheese, bacon e Doritos.", pz:true, t:{broto:36.00, grande:70.00}, add:"pizza", f:"salgada-s46" },
  { id:"s85", g:"salgadas", n:"85 · Japa (especial)", d:"Atum sólido, cream cheese, pimenta biquinho e alho poró.", pz:true, t:{broto:36.00, grande:70.00}, add:"pizza", f:"salgada-s64" },
  { id:"s86", g:"salgadas", n:"86 · Frango Crocante (especial)", d:"Frango, catupiry, mussarela e batata palha.", pz:true, t:{broto:38.00, grande:74.00}, add:"pizza", f:"salgada-s28" },
  { id:"d86", g:"doces", n:"86 · Banana", d:"Leite condensado, banana e canela em pó.", pz:true, t:{broto:28.00, grande:54.00}, f:"doce-d3" },
  { id:"d87", g:"doces", n:"87 · Beijinho", d:"Mussarela, coco ralado e leite condensado.", pz:true, t:{broto:28.00, grande:54.00}, f:"doce-d6" },
  { id:"d88", g:"doces", n:"88 · Bis", d:"Chocolate ao leite, Bis em pedaços e leite condensado.", pz:true, t:{broto:29.50, grande:57.00}, f:"doce-d10" },
  { id:"d89", g:"doces", n:"89 · Brigadeiro", d:"Chocolate em pasta coberto com granulado.", pz:true, t:{broto:28.50, grande:55.00}, f:"doce-d7" },
  { id:"d90", g:"doces", n:"90 · Confete", d:"Chocolate, confete e leite condensado.", pz:true, t:{broto:29.00, grande:56.00}, f:"doce-d12" },
  { id:"d91", g:"doces", n:"91 · Mineira", d:"Mussarela, banana e leite condensado.", pz:true, t:{broto:28.00, grande:54.00}, f:"doce-d18" },
  { id:"d92", g:"doces", n:"92 · Prestígio", d:"Pasta de chocolate, leite condensado e coco ralado.", pz:true, t:{broto:29.00, grande:56.00}, f:"doce-d25" },
  { id:"d93", g:"doces", n:"93 · Romeu e Julieta", d:"Goiabada em pasta e mussarela.", pz:true, t:{broto:28.00, grande:54.00}, f:"doce-d27" },
  { id:"d94", g:"doces", n:"94 · Sonho de Valsa", d:"Bombom Sonho de Valsa, creme de leite, leite condensado e chocolate.", pz:true, t:{broto:30.00, grande:58.00}, f:"doce-d29" },
  { id:"d95", g:"doces", n:"95 · Banana com Chocolate", d:"Banana e chocolate.", pz:true, t:{broto:29.00, grande:56.00}, f:"doce-d5" },
  { id:"d96", g:"doces", n:"96 · Bem Casado", d:"Doce de leite e coco.", pz:true, t:{broto:30.00, grande:58.00}, f:"doce-d26" },
  { id:"d97", g:"doces", n:"97 · Aruna", d:"Banana e doce de leite.", pz:true, t:{broto:30.00, grande:58.00}, f:"doce-d4" },
  { id:"d98", g:"doces", n:"98 · Sensação", d:"Chocolate em pasta e morango.", pz:true, t:{broto:33.00, grande:64.00}, f:"doce-d19" },
  { id:"d99", g:"doces", n:"99 · Chocouva", d:"Chocolate em pasta e uva.", pz:true, t:{broto:33.00, grande:64.00}, f:"doce-d31" },
  { id:"d100", g:"doces", n:"100 · Ovomaltine", d:"Chocolate em pasta e Ovomaltine.", pz:true, t:{broto:31.00, grande:60.00}, f:"doce-d22" },
  { id:"d101", g:"doces", n:"101 · Sonho da Noite", d:"Goiabada e cream cheese.", pz:true, t:{broto:35.00, grande:68.00}, f:"doce-d28" },
  { id:"c1", g:"caldos", n:"Caldo Verde", d:"Caldo preparado com batata, acompanha calabresa e couve. 440 ml", p:40.00, f:"sem-foto" },
  { id:"c2", g:"caldos", n:"Nordestina", d:"Creme de abóbora com requeijão e carne seca. 440 ml", p:40.00, f:"sem-foto" },
  { id:"c3", g:"caldos", n:"Pernambucana", d:"Creme de abóbora com requeijão e frango. 440 ml", p:40.00, f:"sem-foto" },
  { id:"c4", g:"caldos", n:"4 Queijos", d:"Mix de queijos. 440 ml", p:40.00, f:"sem-foto" },
  { id:"c5", g:"caldos", n:"Caldo de Quenga", d:"Caldo de mandioca batida, peito de frango desfiado e milho. 440 ml", p:40.00, f:"sem-foto" },
  { id:"c6", g:"caldos", n:"Vaca Atolada", d:"Caldo de mandioca com carne. 440 ml", p:40.00, f:"sem-foto" },

  /* ---- bebidas ---- [CONFIRMAR precos, marcas e tamanhos com o dono]
     Entram no estoque do painel por unidade: o balcao baixa sozinho. */
  { id:"b1",  g:"bebidas", n:"Coca-Cola 2 litros",            d:"Garrafa 2 L gelada.",            p:15.00, f:"sem-foto" },
  { id:"b2",  g:"bebidas", n:"Coca-Cola 1,5 litro",           d:"Garrafa 1,5 L gelada.",          p:12.00, f:"sem-foto" },
  { id:"b3",  g:"bebidas", n:"Coca-Cola lata 350 ml",         d:"Lata gelada.",                   p:7.00,  f:"sem-foto" },
  { id:"b4",  g:"bebidas", n:"Coca-Cola Zero 2 litros",       d:"Garrafa 2 L gelada.",            p:15.00, f:"sem-foto" },
  { id:"b5",  g:"bebidas", n:"Guaraná Antarctica 2 litros",   d:"Garrafa 2 L gelada.",            p:13.00, f:"sem-foto" },
  { id:"b6",  g:"bebidas", n:"Guaraná Antarctica lata 350 ml",d:"Lata gelada.",                   p:6.50,  f:"sem-foto" },
  { id:"b7",  g:"bebidas", n:"Fanta Laranja 2 litros",        d:"Garrafa 2 L gelada.",            p:13.00, f:"sem-foto" },
  { id:"b8",  g:"bebidas", n:"Fanta Uva 2 litros",            d:"Garrafa 2 L gelada.",            p:13.00, f:"sem-foto" },
  { id:"b9",  g:"bebidas", n:"Sprite 2 litros",               d:"Garrafa 2 L gelada.",            p:13.00, f:"sem-foto" },
  { id:"b10", g:"bebidas", n:"Água mineral sem gás 500 ml",   d:"Garrafa gelada.",                p:4.00,  f:"sem-foto" },
  { id:"b11", g:"bebidas", n:"Água mineral com gás 500 ml",   d:"Garrafa gelada.",                p:4.50,  f:"sem-foto" },
  { id:"b12", g:"bebidas", n:"Suco Del Valle laranja 290 ml", d:"Lata gelada.",                   p:7.00,  f:"sem-foto" },
  { id:"b13", g:"bebidas", n:"Suco Del Valle uva 290 ml",     d:"Lata gelada.",                   p:7.00,  f:"sem-foto" },
  { id:"b14", g:"bebidas", n:"H2OH! limão 500 ml",            d:"Garrafa gelada.",                p:7.50,  f:"sem-foto" },
  { id:"b15", g:"bebidas", n:"Cerveja Skol lata 350 ml",      d:"Lata gelada.",                   p:8.00,  f:"sem-foto" },
  { id:"b16", g:"bebidas", n:"Cerveja Brahma lata 350 ml",    d:"Lata gelada.",                   p:8.00,  f:"sem-foto" },
  { id:"b17", g:"bebidas", n:"Cerveja Heineken long neck",    d:"Garrafa 330 ml gelada.",         p:13.00, f:"sem-foto" },
  { id:"b18", g:"bebidas", n:"Cerveja Original 600 ml",       d:"Garrafa gelada.",                p:16.00, f:"sem-foto" },
];

/* ---- cupons ---- (nenhum no modelo) */
const CUPONS = [];

/* ---- fidelidade ---- */
const FIDELIDADE = { ativa: false, meta: 10, premio: "Uma pizza pequena grátis" };

/* ---- taxas de entrega por bairro ---- [PEDIR a tabela ao dono] */
const TAXAS_ENTREGA_BAIRRO = {};
