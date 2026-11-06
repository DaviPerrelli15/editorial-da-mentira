/* =====================================================================
   ILUSTRAÇÕES PRÓPRIAS (SVG) — feitas para o jogo, sem direitos de terceiros.
   - Foto da notícia (itens 20 e Estilo 4): cena do ASSUNTO + personagem do QUEM
   - Retrato do Delegado Amaral (Estilo 6), finais, viatura e imóvel reserva
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  /* ---------------- primitivas ---------------- */
  function r(x, y, w, h, fill, rx, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (rx ? ' rx="' + rx + '"' : "") + (extra || "") + "/>";
  }
  function c(cx, cy, rad, fill, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="' + fill + '"' + (extra || "") + "/>";
  }
  function e(cx, cy, rx, ry, fill, extra) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (extra || "") + "/>";
  }
  function p(d, fill, extra) {
    return '<path d="' + d + '" fill="' + (fill || "none") + '"' + (extra || "") + "/>";
  }
  function s(d, stroke, width, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + (width || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + "/>";
  }
  function t(x, y, text, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="' + size + '" fill="' + fill + '"' + (extra || "") + ">" + text + "</text>";
  }
  function g(transform, body) {
    return '<g transform="' + transform + '">' + body + "</g>";
  }
  function sky(top, bottom, id) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bottom + '"/></linearGradient></defs>' + r(0, 0, 200, 140, "url(#" + id + ")");
  }

  /* ---------------- personagens (QUEM) — caixa 80×140, base em y=140 ---------------- */
  var INK = "#2b2118";
  function face(o) {
    var out = c(33, 60, 1.8, INK) + c(47, 60, 1.8, INK);
    if (o.glasses) out += c(33, 60, 5, "none", ' stroke="' + INK + '" stroke-width="1.6"') + c(47, 60, 5, "none", ' stroke="' + INK + '" stroke-width="1.6"') + s("M38 60h4", INK, 1.6);
    if (o.mustache) out += p("M32 70q8-5 16 0q-8 3-16 0Z", o.hairColor || INK);
    out += o.smile ? s("M34 71q6 6 12 0", INK, 1.8) : o.shock ? e(40, 72, 3, 4, INK) : s("M35 72q5 3 10 0", INK, 1.6);
    if (o.blush) out += e(29, 67, 3, 2, "#e8837a", ' opacity=".6"') + e(51, 67, 3, 2, "#e8837a", ' opacity=".6"');
    return out;
  }
  function person(o) {
    var skin = o.skin || "#e9b48a";
    var out = "";
    if (o.backHair) out += o.backHair;
    out += p("M14 140v-26q0-22 26-22t26 22v26Z", o.shirt || "#4a6fa5"); // tronco
    if (o.under) out += o.under;
    out += r(35, 74, 10, 12, skin); // pescoço
    out += c(40, 60, 16, skin); // cabeça
    out += o.hair || "";
    out += face(o);
    out += o.extra || "";
    return out;
  }
  var HAIR = {
    short: function (col) {
      return p("M24 58q0-20 16-20t16 20q-3-10-16-10t-16 10Z", col);
    },
    side: function (col) {
      return p("M24 62q-1-8 3-10v10Zm32 0q1-8-3-10v10Z", col);
    },
    slick: function (col) {
      return p("M23 58q0-21 18-21 14 0 16 14-10-7-24-3-6 2-10 10Z", col);
    },
  };

  var FIGURES = {
    prefeitura: function () {
      return (
        p("M4 62 40 40l36 22Z", "#d9d0bb") +
        r(8, 62, 64, 8, "#cfc5ad") +
        [12, 26, 40, 54].map(function (x) { return r(x + 2, 70, 8, 52, "#efe8d6"); }).join("") +
        r(4, 122, 72, 18, "#bfb59b") +
        c(40, 53, 6, "#fff", ' stroke="' + INK + '" stroke-width="1.5"') + s("M40 53v-4m0 4h3", INK, 1.4) +
        s("M40 40V18", INK, 1.8) + p("M40 18h20l-4 5 4 5H40Z", "#3f8f5a")
      );
    },
    cientistas: function () {
      return person({
        shirt: "#f4f4f0",
        hair: HAIR.short("#6b4a2b"),
        glasses: true,
        shock: true,
        under: p("M40 92 30 140h20Z", "#8fb7d9") + s("M40 92v48", "#c9c9c0", 1.5),
        extra: g("translate(52 96)", p("M6 0h8v10l8 18q2 6-4 6H2q-6 0-4-6l8-18Z", "#dff2e4", ' stroke="' + INK + '" stroke-width="1.5"') + p("M1 24h18l2 4q1 4-3 4H2q-4 0-3-4Z", "#58c27d")),
      });
    },
    vizinha: function () {
      return person({
        skin: "#e2a77f",
        shirt: "#d97aa6",
        backHair: c(40, 56, 18, "#b9b4ae"),
        hair: p("M23 56q0-19 17-19t17 19q-6-8-17-8t-17 8Z", "#c9c4bd") + [26, 34, 42, 50].map(function (x, i) { return r(x - 3, 38 + (i % 2) * 2, 7, 10, ["#f28fb0", "#7cc4e8", "#f5d34f", "#9ad08a"][i], 3); }).join(""),
        shock: true,
        blush: true,
        extra: r(56, 100, 12, 20, "#2e2e33", 2) + r(58, 103, 8, 13, "#8fd3ff"),
      });
    },
    sindico: function () {
      return person({
        skin: "#d9a07a",
        shirt: "#e8e4da",
        hair: HAIR.side("#5a4636"),
        mustache: true,
        hairColor: "#5a4636",
        under: p("M37 92h6l3 30-6 6-6-6Z", "#b0302a"),
        extra: g("translate(50 100) rotate(8)", r(0, 0, 22, 30, "#c8a46e", 2) + r(3, 5, 16, 22, "#fff") + r(7, -3, 8, 6, "#888", 1) + s("M6 12h10M6 17h10M6 22h7", "#9a9a9a", 1.4)),
      });
    },
    influencer: function () {
      return person({
        skin: "#c98a62",
        shirt: "#2bb3a3",
        hair: p("M24 56q0-18 16-18t16 18Z", "#1f1f24") + p("M22 50h36v-4q-18-10-36 0Z", "#ff5a5f") + r(18, 47, 10, 4, "#ff5a5f", 2),
        smile: true,
        extra: g("translate(56 78) rotate(-12)", r(0, 0, 14, 24, "#222", 3) + r(2, 3, 10, 17, "#7fe0ff")) + s("M64 102q-6 14-14 20", "#c98a62", 7),
      });
    },
    "tia-zap": function () {
      return person({
        skin: "#e6b28c",
        shirt: "#7a5ec9",
        hair: p("M23 58q-3-22 17-22 19 0 17 22-4-12-17-12T23 58Z", "#7b3f2a") + [24, 32, 40, 48, 56].map(function (x) { return c(x, 44, 5, "#7b3f2a"); }).join(""),
        glasses: true,
        smile: true,
        extra: r(54, 96, 14, 24, "#222", 3) + r(56, 99, 10, 17, "#9ef0a8") + p("M66 78q4-6 8 0 4-6 8 0-8 10-8 10t-8-10Z", "#ff5d73"),
      });
    },
    motoboy: function () {
      return person({
        skin: "#b97b55",
        shirt: "#262a33",
        backHair: r(52, 84, 28, 30, "#d33b2f", 3) + t(57, 104, "ENTREGA", 6, "#fff"),
        hair: p("M22 62q0-26 18-26t18 26v4H22Z", "#e4412f") + r(26, 52, 28, 10, "#2c3e50", 4),
        extra: "",
      });
    },
    "tio-pave": function () {
      return person({
        skin: "#e8b48f",
        shirt: "#3c8dbc",
        hair: HAIR.side("#7d7d7d"),
        smile: true,
        blush: true,
        under: p("M34 92l6 8 6-8Z", "#fff"),
        extra: g("translate(44 104)", e(16, 14, 18, 5, "#d7c9b5") + r(2, 0, 28, 14, "#f2d9a6", 3) + r(2, 4, 28, 3, "#7a4a2a") + r(2, 9, 28, 2, "#fff6e0") + c(16, -1, 3, "#c0392b")),
      });
    },
    coach: function () {
      return person({
        skin: "#e0a682",
        shirt: "#2d3142",
        hair: HAIR.slick("#2a1b10"),
        smile: true,
        under: p("M34 92l6 22 6-22Z", "#fff") + p("M38 96h4l1 14-3 4-3-4Z", "#f2c14e"),
        extra: s("M24 56q-4 10 6 14", "#222", 1.5) + c(30, 70, 2, "#222") + s("M66 104 72 70", "#e0a682", 7) + p("M72 58l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z", "#f2c14e"),
      });
    },
    astrologo: function () {
      return person({
        skin: "#e5ad86",
        shirt: "#4b2d7f",
        hair: p("M22 50 40 14l18 36Z", "#3a2266") + p("M37 30l1.5 3 3.5.5-2.5 2.5.6 3.5-3.1-1.6-3.1 1.6.6-3.5L32.5 33.5l3.5-.5Z", "#f5d34f"),
        backHair: p("M24 60q-2 30 16 32 18-2 16-32Z", "#cfcfcf"),
        extra: c(62, 108, 11, "#9fd8ff", ' opacity=".9"') + e(62, 121, 9, 3, "#6b4f2a") + c(59, 105, 3, "#fff", ' opacity=".7"'),
      });
    },
    gato: function () {
      return (
        e(42, 126, 30, 16, "#f0913a") +
        p("M60 130q20-4 14-26", "none", ' stroke="#f0913a" stroke-width="7" stroke-linecap="round"') +
        e(40, 104, 22, 24, "#f0913a") +
        c(40, 74, 18, "#f39c4a") +
        p("M24 66 22 46l14 12Zm32 0 2-20-14 12Z", "#f39c4a") +
        p("M26 62 25 51l7 7Zm28 0 1-11-7 7Z", "#f7c3a1") +
        e(33, 73, 3, 4, "#2f6d3a") + e(47, 73, 3, 4, "#2f6d3a") +
        p("M38 80h4l-2 2Z", "#d65a6a") + s("M40 82q-3 3-6 1m6-1q3 3 6 1", INK, 1.2) +
        s("M26 80h-10M26 83l-9 3M54 80h10M54 83l9 3", INK, 0.8) +
        s("M30 98q10 4 20 0M28 108q12 4 24 0", "#d3742a", 3)
      );
    },
    capivara: function () {
      return (
        e(40, 118, 34, 22, "#8a6142") +
        e(40, 84, 24, 20, "#9a6e4c") +
        r(30, 86, 30, 14, "#7c5639", 7) +
        c(28, 66, 4, "#7c5639") + c(52, 66, 4, "#7c5639") +
        c(32, 80, 2, INK) + c(48, 80, 2, INK) + e(44, 94, 3, 2, "#3d2a1d") + e(36, 94, 3, 2, "#3d2a1d") +
        c(40, 60, 9, "#f39a1f") + p("M40 51q3-5 7-4-3 3-7 4Z", "#3f8f3a")
      );
    },
    pombo: function () {
      return (
        e(40, 108, 28, 22, "#8d94a3") +
        p("M14 112q-8 14 6 18l24-8Z", "#6f7685") +
        c(52, 76, 14, "#9aa1b0") +
        e(46, 92, 10, 8, "#5fae8f", ' opacity=".85"') +
        c(56, 73, 3, "#f2f2f2") + c(56, 73, 1.6, INK) +
        p("M64 76l10 3-10 3Z", "#d9a14a") +
        s("M34 128v10m10-10v10", "#d97b6a", 3)
      );
    },
  };

  /* ---------------- cenas (ASSUNTO) — 200×140, foco do lado direito ---------------- */
  var SCENES = {
    pao: function () {
      return sky("#f3d9a6", "#e2b877", "sk") + r(0, 96, 200, 44, "#9b6a3c") + r(0, 92, 200, 6, "#7a5230") +
        e(140, 84, 34, 12, "#d39a52") + s("M118 80l6-6m6 8 6-6m6 8 6-6m6 8 6-6", "#a8702f", 2.5) +
        e(176, 90, 14, 8, "#e0ab65") + r(150, 30, 40, 26, "#fff", 3, ' transform="rotate(6 170 43)"') + t(154, 48, "R$0,10", 12, "#c0392b", ' transform="rotate(6 170 43)"') +
        p("M120 22v20m-6-6 6 6 6-6", "none", ' stroke="#c0392b" stroke-width="3"');
    },
    chuva: function () {
      var drops = "";
      for (var i = 0; i < 18; i++) drops += s("M" + (70 + (i * 37) % 130) + " " + (40 + (i * 23) % 80) + "l-4 10", "#5b8bd0", 2);
      return sky("#7f8fa6", "#c9d3df", "sk") + e(130, 34, 40, 18, "#5d6b80") + e(165, 30, 30, 16, "#6c7a8f") + e(100, 38, 26, 12, "#6c7a8f") + drops +
        r(140, 92, 46, 40, "#fff", 3) + r(140, 92, 46, 12, "#c0392b", 3) + t(150, 124, "DOM", 18, INK);
    },
    asfalto: function () {
      return sky("#8fc6ec", "#d7ecf8", "sk") + p("M0 92h200v48H0Z", "#4a4d55") + s("M90 116h20m20 0h20m20 0h20", "#f5d34f", 4) +
        g("translate(110 52)", r(10, 18, 48, 22, "#f2b632", 3) + r(18, 4, 24, 16, "#f2b632", 2) + r(21, 7, 18, 10, "#9fd8ff") + c(14, 44, 10, "#555") + c(54, 44, 9, "#333") + c(54, 44, 4, "#888")) +
        p("M84 120l8-24 8 24Z", "#ff7a1a") + r(84, 106, 16, 4, "#fff");
    },
    "fila-banco": function () {
      var q = "";
      for (var i = 0; i < 5; i++) q += c(96 + i * 20, 82, 6, "#2f4858") + r(90 + i * 20, 90, 12, 26, "#2f4858", 4);
      return sky("#3f8f8a", "#2f6f6b", "sk") + r(0, 116, 200, 24, "#cfc7b4") + r(110, 12, 80, 22, "#f4f1e6", 3) + t(124, 29, "BANCO", 16, "#2f6f6b") + q +
        p("M190 60H140m0 0 10-8m-10 8 10 8", "none", ' stroke="#f5d34f" stroke-width="4" stroke-linecap="round"');
    },
    "horario-verao": function () {
      return sky("#ffb067", "#ffe2a8", "sk") + c(150, 64, 44, "#ffd34f") + c(150, 64, 32, "#fffaf0", ' stroke="' + INK + '" stroke-width="3"') +
        s("M150 64V42m0 22 14 8", INK, 3.5) + c(150, 64, 3, INK) + r(0, 116, 200, 24, "#e08a4f");
    },
    cafezinho: function () {
      return sky("#7b4b32", "#5a3423", "sk") + r(0, 104, 200, 36, "#3b2418") +
        p("M120 72h40l-4 34h-32Z", "#fff") + p("M160 80q14 0 10 12-3 8-12 6", "none", ' stroke="#fff" stroke-width="4"') + e(140, 106, 26, 4, "#ddd") +
        s("M130 62q-4-8 2-14m10 14q-4-8 2-14", "#f0e0d0", 2) +
        g("translate(158 30) rotate(12)", r(0, 0, 36, 22, "#2e6fd8", 3) + r(4, 5, 8, 6, "#f5d34f", 1) + t(14, 18, "12x", 11, "#fff"));
    },
    wifi: function () {
      return sky("#5b3fa0", "#8c6ad6", "sk") + r(110, 92, 70, 20, "#222831", 4) + c(124, 102, 3, "#38e07b") + c(134, 102, 3, "#38e07b") + s("M120 92l-6-24m54 24 6-24", "#222831", 4) +
        s("M128 74q17-14 34 0m-26-10q9-8 18 0", "#fff", 4) + p("M168 34q5-8 10 0 5-8 10 0-10 12-10 12t-10-12Z", "#ff6b81") + e(158, 118, 3, 5, "#8fd3ff");
    },
    boleto: function () {
      var bars = "";
      for (var i = 0; i < 16; i++) bars += r(124 + i * 3.4, 92, i % 3 ? 1.6 : 2.6, 12, INK);
      return sky("#d6dbe2", "#b6bec9", "sk") + g("rotate(-6 150 80)", r(112, 40, 76, 72, "#fffdf5", 2) + t(118, 56, "BOLETO", 12, INK) + t(118, 70, "VENCE HOJE", 9, "#c0392b") + c(136, 80, 5, "#fff", ' stroke="' + INK + '" stroke-width="1.5"') + c(158, 80, 5, "#fff", ' stroke="' + INK + '" stroke-width="1.5"') + c(137, 81, 2, INK) + c(159, 81, 2, INK) + bars) +
        s("M130 112l-8 16m30-16 10 14", INK, 3) + s("M100 70h-14m14 14h-20m20 14h-12", "#8a93a3", 2);
    },
    geladeira: function () {
      var tiles = "";
      for (var x = 0; x < 200; x += 20) for (var y = 0; y < 140; y += 20) tiles += r(x + 1, y + 1, 18, 18, (x + y) % 40 ? "#d9eef2" : "#c4e3e9");
      return tiles + r(116, 20, 56, 116, "#f4f7f8", 6, ' stroke="#9aa9b0" stroke-width="2"') + s("M116 62h56", "#9aa9b0", 2) + r(160, 34, 4, 18, "#9aa9b0", 2) + r(160, 70, 4, 26, "#9aa9b0", 2) +
        c(134, 82, 3, INK) + c(148, 82, 3, INK) + s("M134 92q7 5 14 0", INK, 2) + p("M84 22h48q6 0 6 6v14q0 6-6 6H98l-10 8 2-8h-6q-6 0-6-6V28q0-6 6-6Z", "#fff") + t(90, 40, "psiu...", 13, INK);
    },
    pastel: function () {
      var awning = "";
      for (var i = 0; i < 10; i++) awning += r(i * 20, 0, 20, 22, i % 2 ? "#fff" : "#e04848");
      return sky("#f6e7c8", "#efd9a8", "sk") + awning + r(0, 108, 200, 32, "#b07a46") +
        p("M100 104q40-70 90 0Z", "#e9b44c") + s("M106 102q40-58 80 0", "#c98e2e", 2) + s("M112 64q-10-8-4-16m22 6q-6-10 2-16m18 14q-2-10 8-14", "#c5d6e0", 3);
    },
    segunda: function () {
      var conf = "";
      for (var i = 0; i < 14; i++) conf += r(70 + (i * 41) % 125, 10 + (i * 29) % 110, 4, 7, ["#f5d34f", "#ff6b81", "#38c0e0", "#7bd389"][i % 4], 1, ' transform="rotate(' + i * 30 + " " + (72 + (i * 41) % 125) + " " + (14 + (i * 29) % 110) + ')"');
      return sky("#fde9b8", "#f7d27a", "sk") + conf + r(112, 26, 70, 84, "#fff", 4) + r(112, 26, 70, 20, "#c0392b", 4) + t(126, 88, "SEG", 30, INK) + s("M118 56l58 46m0-46-58 46", "#c0392b", 6);
    },
    agua: function () {
      return sky("#9ed8f5", "#e6f6fd", "sk") + p("M120 40h44l-6 80h-32Z", "#dff4ff", ' stroke="#5aa7d6" stroke-width="3"') + p("M124 70h36l-4 48h-28Z", "#7cc8f0") +
        c(176, 40, 16, "#c0392b") + t(170, 48, "?", 22, "#fff");
    },
    feijao: function () {
      return sky("#45474f", "#2c2e34", "sk") + r(0, 116, 200, 24, "#1d1e22") + r(96, 70, 100, 6, "#888", 3) + r(98, 56, 10, 34, "#333", 3) + r(184, 56, 10, 34, "#333", 3) +
        e(146, 92, 22, 28, "#6b3a26") + e(140, 84, 6, 9, "#83503a") + c(139, 88, 2, "#fff") + c(151, 88, 2, "#fff") + s("M138 100q8 4 14 0", "#fff", 2) + s("M126 82l-18-8m58 8 18-8", "#6b3a26", 6);
    },
    microondas: function () {
      return sky("#e9e4da", "#cfc7b6", "sk") + r(0, 110, 200, 30, "#a07a52") + r(100, 52, 86, 58, "#d8d8d8", 5) + r(106, 58, 54, 46, "#2d3640", 3) + r(166, 60, 14, 6, "#666", 2) + c(173, 78, 4, "#666") + c(173, 92, 4, "#666") +
        p("M126 78q8-12 14 0q2 8-6 12-4 2-4 6", "none", ' stroke="#f1c27d" stroke-width="5" stroke-linecap="round"') + s("M84 70q-8 10 0 20m-10-28q-14 18 0 36", "#c0392b", 3);
    },
    chinelo: function () {
      return sky("#9ed0f5", "#e5f3fd", "sk") + s("M40 90h40M50 74h40M44 106h30", "#ffffff", 4) + g("rotate(-20 140 80)", e(140, 80, 36, 15, "#2f80ed") + e(140, 80, 30, 10, "#56ccf2") + s("M130 72l14 8-14 8", "#f5d34f", 4)) +
        c(186, 26, 10, "none", ' stroke="#c0392b" stroke-width="3"') + c(186, 26, 4, "#c0392b");
    },
    novela: function () {
      return sky("#b5442c", "#e07a4a", "sk") + p("M0 104q50-20 100 0t100 0v36H0Z", "#8f2f1d") + e(160, 110, 18, 5, "#6e2314") + c(40, 26, 10, "#f5d9b0", ' opacity=".8"') +
        g("translate(118 50)", r(0, 14, 48, 30, INK, 2) + p("M0 0h48l-4 14H0Z", "#fff") + s("M10 0l-4 14M22 0l-4 14M34 0l-4 14", INK, 3) + t(6, 34, "CENA 1", 10, "#fff"));
    },
    lua: function () {
      var stars = "";
      for (var i = 0; i < 16; i++) stars += c(10 + (i * 47) % 190, 8 + (i * 31) % 90, 1.2, "#fff");
      return sky("#0f1a3b", "#26386e", "sk") + stars + c(146, 62, 38, "#f6d860") + c(130, 50, 7, "#d9b83c") + c(160, 76, 9, "#d9b83c") + c(158, 44, 5, "#d9b83c") + c(134, 82, 4, "#d9b83c") + p("M150 24 186 46 182 52Z", "#f6d860");
    },
    "pombos-drones": function () {
      var city = "";
      [0, 26, 44, 70, 92, 120, 140, 168].forEach(function (x, i) {
        city += r(x, 80 - (i % 3) * 18, 24, 60 + (i % 3) * 18, "#3e4a5c");
      });
      return sky("#9fb4c7", "#dfe7ee", "sk") + city + g("translate(116 24)", e(30, 40, 26, 18, "#8d94a3") + c(48, 26, 12, "#9aa1b0") + c(52, 24, 2.5, INK) + p("M58 27l9 2-9 3Z", "#d9a14a") + s("M48 14V4", INK, 2) + e(48, 3, 16, 3, "#555") + s("M20 40 2 30", "#6f7685", 6) + c(10, 56, 3, "#e74c3c"));
    },
  };

  function newsPhoto(parts) {
    var who = EDM.News.part(0, parts[0]).id;
    var topic = EDM.News.part(2, parts[2]).id;
    var scene = (SCENES[topic] || SCENES.pao)();
    var figure = (FIGURES[who] || FIGURES.sindico)();
    var shadow = e(46, 136, 30, 4, "#000", ' opacity=".25"');
    return (
      '<svg viewBox="0 0 200 140" role="img" aria-label="Ilustração da notícia" preserveAspectRatio="xMidYMid slice">' +
      scene.replace(/id="sk"/, 'id="sk-' + topic + '"').replace(/url\(#sk\)/, "url(#sk-" + topic + ")") +
      shadow +
      g("translate(6 0)", figure) +
      "</svg>"
    );
  }

  /* ---------------- Delegado Amaral (Estilo 6) ---------------- */
  function delegado(clues) {
    var mood = clues >= 2 ? "furioso" : clues === 1 ? "desconfiado" : "calmo";
    var brows =
      mood === "furioso"
        ? s("M30 44l12 5M70 44l-12 5", INK, 3.5)
        : mood === "desconfiado"
          ? s("M30 45h12M58 41l12 3", INK, 3.5)
          : s("M30 44q6-3 12 0M58 44q6-3 12 0", INK, 3);
    var mouth = mood === "furioso" ? s("M42 76q8-6 16 0", INK, 3) : mood === "desconfiado" ? s("M42 75h16", INK, 3) : s("M42 74q8 4 16 0", INK, 3);
    var cheeks = mood === "furioso" ? e(32, 66, 6, 3, "#e05a4a", ' opacity=".6"') + e(68, 66, 6, 3, "#e05a4a", ' opacity=".6"') : "";
    var steam = mood === "furioso" ? s("M14 30q-6-6 0-12M86 30q6-6 0-12", "#c9d1e0", 3) : "";
    return (
      '<svg viewBox="0 0 100 100" role="img" aria-label="Delegado Amaral, ' + mood + '">' +
      c(50, 50, 48, mood === "furioso" ? "#5a2027" : mood === "desconfiado" ? "#4b3b1f" : "#1f3350") +
      p("M14 100q4-24 36-24t36 24Z", "#2f3b52") + p("M40 78l10 12 10-12Z", "#e8e4da") + p("M47 82h6l2 16h-10Z", "#20252f") +
      p("M78 88l6 8-6 4-4-7Z", "#f2c14e") +
      e(50, 56, 25, 28, "#d9a07a") +
      e(24, 58, 4, 7, "#c98d68") + e(76, 58, 4, 7, "#c98d68") +
      brows +
      c(36, 54, 3.2, INK) + c(64, 54, 3.2, INK) +
      p("M47 56q3 10 6 10h-6Z", "#c98d68") +
      p("M34 68q16-9 32 0q-6 6-16 2-10 4-16-2Z", "#3b2a1f") +
      mouth + cheeks +
      p("M22 36q28-26 56 0l-2 6H24Z", "#1d2a44") + r(20, 38, 60, 7, "#141c2e", 3) + p("M44 18l6-5 6 5-2 9h-8Z", "#f2c14e") +
      steam +
      "</svg>"
    );
  }

  /* ---------------- finais (item 15) ---------------- */
  var ENDINGS = {
    aluguel: function () {
      return sky("#25324f", "#3d4f78", "es") + r(0, 120, 200, 40, "#2b2b33") + r(30, 40, 90, 80, "#6c5a4a") + p("M20 44l55-32 55 32Z", "#4a3a2e") + r(64, 76, 22, 44, "#3a2c22") +
        g("translate(70 92)", r(0, 6, 12, 10, "#f2c14e", 2) + p("M2 6V2a4 4 0 0 1 8 0v4", "none", ' stroke="#f2c14e" stroke-width="2"')) +
        r(132, 104, 46, 18, "#9a7a5a", 2) + r(140, 82, 30, 22, "#20232b", 2) + r(143, 85, 24, 15, "#4fa3ff") + r(150, 104, 10, 4, "#20232b") + e(160, 132, 30, 4, "#000", ' opacity=".3"');
    },
    internet: function () {
      return sky("#1e2a3a", "#33475e", "es") + r(92, 10, 10, 130, "#6b5a4a") + r(70, 40, 54, 66, "#f4ebd0", 1, ' transform="rotate(-4 97 73)"') + t(80, 64, "GAZETA", 13, INK, ' transform="rotate(-4 97 73)"') + s("M80 74h32M80 82h32M80 90h22", "#8a806a", 2, ' transform="rotate(-4 97 73)"') +
        r(132, 104, 50, 16, "#222831", 4) + s("M144 104l-6-20m40 20 6-20", "#222831", 4) + c(146, 112, 2.5, "#e74c3c") + s("M182 112q10 0 12 14", "#888", 3) + s("M188 120l8 4m-8 0 8-4", "#e74c3c", 2);
    },
    energia: function () {
      return sky("#07080c", "#141824", "es") + e(100, 128, 60, 6, "#000") + r(92, 84, 16, 44, "#efe6d2", 2) + s("M100 84v-6", INK, 2) +
        p("M100 52q12 14 0 26-12-12 0-26Z", "#ffb84a") + p("M100 62q6 8 0 14-6-6 0-14Z", "#fff3c4") + c(100, 70, 40, "#ffb84a", ' opacity=".08"') +
        g("translate(150 30)", c(10, 10, 10, "#444") + r(5, 18, 10, 8, "#555") + s("M6 6l8 8m0-8-8 8", "#777", 1.5));
    },
    agua: function () {
      return sky("#e9d3a2", "#c9a36a", "es") + p("M0 110l30-6 26 10 30-8 34 10 40-6 40 8v22H0Z", "#a8834e") + s("M30 120l14 8m40-12-10 14m60-10 8 10", "#7a5a30", 2) +
        r(96, 20, 50, 14, "#9aa1ab", 3) + r(132, 34, 14, 22, "#9aa1ab", 3) + e(139, 66, 3, 5, "#7cc8f0") + c(60, 50, 2, INK) + c(70, 44, 2, INK) + s("M58 48l-4-3m14-4 3-3", INK, 1);
    },
    compras: function () {
      return sky("#d9e2e6", "#b9c6cc", "es") + r(50, 16, 100, 120, "#f4f7f8", 6, ' stroke="#9aa9b0" stroke-width="2"') + r(56, 22, 88, 108, "#e8f2f6", 3) +
        s("M56 60h88M56 98h88", "#b9c6cc", 2) + r(86, 82, 28, 14, "#f5c84c", 2) + t(89, 92, "MIOJO", 8, "#c0392b") + r(150, 16, 40, 120, "#e3e9ec", 4, ' transform="skewY(8)"');
    },
    prisao: function () {
      var bars = "";
      for (var i = 0; i < 8; i++) bars += r(16 + i * 24, 0, 6, 140, "#3a3f4b");
      return sky("#2b2f3a", "#151820", "es") + r(70, 70, 60, 40, "#f4ebd0", 1, ' transform="rotate(-8 100 90)"') + t(76, 92, "PRESO", 18, "#b3121b", ' transform="rotate(-8 100 90)"') + bars + r(0, 24, 200, 6, "#3a3f4b") + r(0, 110, 200, 6, "#3a3f4b");
    },
  };
  function ending(id) {
    var body = (ENDINGS[id] || ENDINGS.prisao)();
    return '<svg viewBox="0 0 200 140" role="img" aria-label="Ilustração do final">' + body.replace(/id="es"/, 'id="es-' + id + '"').replace(/url\(#es\)/, "url(#es-" + id + ")") + "</svg>";
  }

  /* ---------------- viatura e imóvel reserva ---------------- */
  function copCar() {
    return '<svg viewBox="0 0 80 36" aria-hidden="true">' + r(4, 14, 72, 14, "#f4f4f4", 4) + p("M18 14l8-10h26l8 10Z", "#f4f4f4") + r(28, 6, 10, 7, "#8fd3ff", 1) + r(41, 6, 10, 7, "#8fd3ff", 1) + r(4, 19, 72, 4, "#1d3b8f") + r(32, 0, 7, 4, "#e74c3c", 1) + r(41, 0, 7, 4, "#2e86de", 1) + c(20, 29, 6, "#222") + c(60, 29, 6, "#222") + c(20, 29, 2.5, "#999") + c(60, 29, 2.5, "#999") + "</svg>";
  }
  function propertyFallback(level) {
    var h = 40 + level * 6;
    return '<svg viewBox="0 0 200 140" role="img" aria-label="Imóvel">' + sky("#9fc4e8", "#e1eef8", "pf") + r(0, 116, 200, 24, "#6f9a55") + r(100 - h / 2, 116 - h, h, h, "#d8c6a8") + p("M" + (90 - h / 2) + " " + (118 - h) + "L100 " + (80 - h) + "L" + (110 + h / 2) + " " + (118 - h) + "Z", "#a5533d") + r(92, 96, 16, 20, "#6b4a2b") + "</svg>";
  }

  EDM.Illustrations = {
    newsPhoto: newsPhoto,
    delegado: delegado,
    ending: ending,
    copCar: copCar,
    propertyFallback: propertyFallback,
    figureIds: Object.keys(FIGURES),
    sceneIds: Object.keys(SCENES),
  };
})(typeof window !== "undefined" ? window : globalThis);
