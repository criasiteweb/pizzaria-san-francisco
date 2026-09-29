/* =========================================================
   Pizzaria San Francisco — ligação com o servidor de pedidos
   Criasiteweb

   Projeto próprio da San Francisco (NÃO é o da Vitória).
   Estas chaves são públicas por natureza: elas apenas dizem
   ao navegador QUAL projeto procurar. Quem protege os dados
   são as regras do servidor (firestore.rules), que só deixam
   a conta da loja ler os pedidos.
   ========================================================= */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-OaMJ3UKg9dD7iE51kQIP0QYdqUir5dc",
  authDomain: "pizzaria-san-francisco-pedidos.firebaseapp.com",
  projectId: "pizzaria-san-francisco-pedidos",
  storageBucket: "pizzaria-san-francisco-pedidos.firebasestorage.app",
  messagingSenderId: "773668582036",
  appId: "1:773668582036:web:3f1255911465dcd4d3ba81"
};

/* conta usada pelo balcão para entrar no painel */
export const CONTA_LOJA = "criasite.site@gmail.com";
