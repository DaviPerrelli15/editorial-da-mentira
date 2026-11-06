/* =====================================================================
   CAMINHOS DE IMAGENS — tudo num lugar só (Estilo 5).

   Para trocar as casas pelas bancas de jornal do Miguel:
     1. Coloque os arquivos em img/bancas/ com os nomes banca1.webp ... banca10.webp
        (ou ajuste os caminhos da lista "bancas" abaixo).
     2. Troque  propertyTheme: "casas"  por  propertyTheme: "bancas".
   Nomes, rótulos e textos da tela acompanham o tema automaticamente.
   Se alguma imagem faltar, o jogo mostra uma ilustração reserva (não quebra).
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  var themes = {
    casas: {
      label: "Casa",
      upgradeVerb: "Mudar para",
      levels: [
        { name: "Barraco", img: "img/casa1.jpg" },
        { name: "Casa muito simples", img: "img/casa2.jpg" },
        { name: "Casa pequena", img: "img/casa3.jpg" },
        { name: "Casa melhor", img: "img/casa4.jpg" },
        { name: "Casa confortável", img: "img/casa5.jpg" },
        { name: "Casa moderna", img: "img/casa6.jpg" },
        { name: "Casa grande", img: "img/casa7.jpg" },
        { name: "Casa de luxo", img: "img/casa8.jpg" },
        { name: "Altíssimo padrão", img: "img/casa9.jpg" },
        { name: "Mansão", img: "img/casa10.jpg" },
      ],
    },
    bancas: {
      label: "Banca",
      upgradeVerb: "Reformar para",
      levels: [
        { name: "Caixote na calçada", img: "img/bancas/banca1.webp" },
        { name: "Banquinha de feira", img: "img/bancas/banca2.webp" },
        { name: "Banca de esquina", img: "img/bancas/banca3.webp" },
        { name: "Banca com toldo", img: "img/bancas/banca4.webp" },
        { name: "Banca reformada", img: "img/bancas/banca5.webp" },
        { name: "Banca da praça", img: "img/bancas/banca6.webp" },
        { name: "Banca 24 horas", img: "img/bancas/banca7.webp" },
        { name: "Banca de luxo", img: "img/bancas/banca8.webp" },
        { name: "Rede de bancas", img: "img/bancas/banca9.webp" },
        { name: "Império das bancas", img: "img/bancas/banca10.webp" },
      ],
    },
  };

  EDM.Assets = {
    propertyTheme: "casas", // "casas" (atual) ou "bancas" (quando as imagens do Miguel chegarem)
    themes: themes,
    stickerImg: function (id) {
      return "img/adesivos/" + id + ".webp";
    },
    property: function () {
      return themes[EDM.Assets.propertyTheme] || themes.casas;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
