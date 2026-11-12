/* =====================================================================
   CAMINHOS DE IMAGENS — tudo num lugar só (Estilo 5).

   Sedes da Gazeta da Manhã: 1 foto por nível, em img/bancaN.webp
   (WebP 1056×792, recorte 4:3 com a placa do prédio enquadrada:
   352 px de largura máxima no jogo × densidade 3x).
   O nome de cada nível é o que está escrito na placa do prédio.
   Se alguma imagem faltar, o jogo mostra uma ilustração reserva (não quebra).
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  var property = {
    label: "Sede",
    upgradeVerb: "Mudar para",
    levels: [
      { name: "Jornal Local", img: "img/banca1.webp" },
      { name: "Redação de Bairro", img: "img/banca2.webp" },
      { name: "Redação e Editoria", img: "img/banca3.webp" },
      { name: "Redação Moderna", img: "img/banca4.webp" },
      { name: "Prédio da Redação", img: "img/banca5.webp" },
      { name: "Redação • TV • Rádio • Podcast", img: "img/banca6.webp" },
      { name: "Sede Editorial", img: "img/banca7.webp" },
      { name: "Multiplataforma", img: "img/banca8.webp" },
      { name: "Torre Multiplataforma", img: "img/banca9.webp" },
      { name: "Sede Global", img: "img/banca10.webp" },
    ],
  };

  EDM.Assets = {
    stickerImg: function (id) {
      return "img/adesivos/" + id + ".webp";
    },
    property: function () {
      return property;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
