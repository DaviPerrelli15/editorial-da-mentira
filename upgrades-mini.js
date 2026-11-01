/* =====================================================================
   UPGRADES MINI — painel "Bastidores" com 14 upgrades iniciais (arquivo NOVO: não altera o script.js)
   Carregue DEPOIS do extras.js:  <script src="upgrades-mini.js"></script>
   Para desligar tudo: apague a linha do <script> no index.html.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- AJUSTES RÁPIDOS (pode mexer) ---------- */
  var LUCRO_MAX = 60; // teto do bônus total de lucro (%)
  var POLICIA_MAX = 80; // teto da redução de atenção policial (%)
  var CONTAS_MAX = 40; // teto do desconto nas contas (%)
  var SALARIOS_ATIVOS = true; // false = equipe não cobra salário

  /* ---------- DADOS (um upgrade por linha) ---------- */
  var UPS = [
    {
      id: "grupo-da-vizinhanca",
      k: "A",
      e: "💬",
      n: "Grupo da vizinhança",
      c: [500, 1500, 4000],
      st: { v: [10, 10, 10] },
      w: "Gente espalha sua fofoca de graça: mais views e mais dinheiro dos posts virais.",
      r: "—",
      p: 1,
    },
    {
      id: "curso-de-redacao",
      k: "H",
      e: "📝",
      n: "Curso de redação",
      c: [500, 2500, 12000],
      st: { l: [5, 5, 5] },
      ln: [
        "Curso de redação online",
        "Curso de jornalismo digital",
        "Pós-graduação em jornalismo",
      ],
      w: "Manchetes e textos mais fortes rendem mais.",
      r: "—",
      p: 1,
    },
    {
      id: "software-de-edicao",
      k: "C",
      e: "✂️",
      n: "Software de edição",
      c: [500, 1500, 1800, 4000],
      st: { l: [7, 7, 7, 7] },
      ln: [
        "CapCut Pro (1 ano)",
        "Adobe Premiere Pro (1 ano)",
        "Final Cut Pro (licença)",
        "Adobe Creative Cloud completo (1 ano)",
      ],
      w: "Cortes, legendas e efeitos prendem mais gente e valorizam o seu conteúdo.",
      r: "—",
      p: 1,
    },
    {
      id: "curso-de-fotojornalismo",
      k: "H",
      e: "📷",
      n: "Curso de fotojornalismo",
      c: [600, 2500, 6000],
      st: { v: [8, 8, 8] },
      ln: [
        "Curso de fotografia online",
        "Workshop de fotojornalismo",
        "Mentoria com fotógrafo",
      ],
      w: "Fotos que contam a história e viralizam mais.",
      r: "—",
      p: 1,
    },
    {
      id: "curso-de-checagem-de-fatos",
      k: "H",
      e: "✅",
      n: "Curso de checagem de fatos",
      c: [600, 2500],
      st: { rp: [1, 1] },
      w: "Você apura melhor e ganha mais credibilidade a cada semana.",
      r: "—",
      p: 1,
    },
    {
      id: "rede-de-informantes-do-bairro",
      k: "A",
      e: "🗣️",
      n: "Rede de informantes do bairro",
      c: [700, 2000, 5000],
      st: { s: [8, 8, 8] },
      w: "Boca a boca: cada publicação traz mais seguidores novos.",
      r: "—",
      p: 1,
    },
    {
      id: "celular-so-da-pagina-chip-pre-pago",
      k: "S",
      e: "📵",
      n: "Celular só da página (chip pré-pago)",
      c: [800, 2000],
      st: { r: [1, 1] },
      ln: ["Celular simples + chip pré-pago", "Celular reserva intermediário"],
      w: "Seu número pessoal fica fora do caso, e cada manchete chama menos atenção.",
      r: "—",
      p: 1,
    },
    {
      id: "celular",
      k: "C",
      e: "📱",
      n: "Celular",
      c: [1000, 2000, 2500, 3900, 6000, 8000, 9500, 10500],
      st: { l: [3, 3, 3, 3, 3, 3, 3, 3], v: [0, 0, 0, 0, 0, 5, 5, 5] },
      ln: [
        "Xiaomi Redmi",
        "Motorola Moto G56",
        "Samsung Galaxy A57",
        "iPhone 15",
        "iPhone 16",
        "iPhone 16 Pro",
        "iPhone 16 Pro Max",
        "iPhone 17 Pro Max",
      ],
      w: "Você troca de aparelho conforme cresce: foto, vídeo e edição melhores a cada troca.",
      r: "—",
      p: 1,
    },
    {
      id: "estagiario-de-jornalismo",
      k: "E",
      e: "🧑‍🎓",
      n: "Estagiário de jornalismo",
      c: [1000],
      st: { l: [4], s: [4] },
      sal: [80],
      w: "Ajudante barato que apura as fofocas. Primeiro passo para ter equipe.",
      r: "Casa nível 2",
      req: { house: 2 },
      p: 2,
    },
    {
      id: "camera",
      k: "C",
      e: "📸",
      n: "Câmera",
      c: [1500, 5500, 6300, 15500, 33700],
      st: { v: [12, 12, 12, 12, 12] },
      ln: [
        "Canon PowerShot usada",
        "Sony ZV-E10",
        "Sony Alpha a6400",
        "Sony Alpha 7 IV",
        "Sony FX3 (cinema)",
      ],
      w: "Fotos e vídeos de qualidade profissional viralizam muito mais.",
      r: "Casa nível 2",
      req: { house: 2 },
      p: 1,
    },
    {
      id: "kit-de-gravacao",
      k: "C",
      e: "🎙️",
      n: "Kit de gravação",
      c: [1800, 3500],
      st: { l: [6, 6] },
      ln: [
        "Rode Wireless GO II (microfone sem fio)",
        "Rode + iluminação softbox",
      ],
      w: "O primeiro salto real de qualidade: áudio limpo e imagem bem iluminada.",
      r: "—",
      p: 1,
    },
    {
      id: "computador",
      k: "C",
      e: "💻",
      n: "Computador",
      c: [1800, 3700, 5500, 12500, 20500, 26000],
      st: { l: [4, 4, 4, 4, 4, 4] },
      ln: [
        "Notebook usado",
        "Acer Aspire 5 (Ryzen 5)",
        "Acer Aspire 5 (Core i7)",
        "MacBook Air M4",
        "MacBook Pro M4 Pro",
        "Mac Studio M4 Max",
      ],
      w: "Edita vídeo mais rápido, com mais qualidade e sem travar.",
      r: "—",
      p: 1,
    },
    {
      id: "vpn-e-protecao-de-dados",
      k: "S",
      e: "🔐",
      n: "VPN e proteção de dados",
      c: [2000, 5000],
      st: { p: [8, 8] },
      w: "Dificulta o rastreio, e a barra da polícia sobe mais devagar.",
      r: "Casa nível 2",
      req: { house: 2 },
      p: 1,
    },
    {
      id: "editor-de-plantao",
      k: "E",
      e: "✏️",
      n: "Editor de plantão",
      c: [10000],
      st: { a: [1] },
      sal: [300],
      w: "O efeito mais forte do jogo: mais uma manchete por semana.",
      r: "Casa nível 5",
      req: { house: 5 },
      p: 1,
    },
  ];

  var TRILHAS = {
    C: "📱 Equipamento",
    H: "🎓 Cursos",
    A: "📈 Audiência",
    S: "🛡️ Segurança",
    E: "👥 Equipe",
    N: "💼 Negócio",
    M: "🏢 Aquisições",
  };
  var ROTULOS = {
    l: ["%", "de lucro por manchete", 1],
    v: ["%", "de views", 1],
    s: ["%", "de seguidores ganhos", 1],
    r: ["", "de risco por publicação", -1],
    p: ["%", "da atenção policial", -1],
    a: ["", "ação por semana", 1],
    ct: ["%", "no valor das contas", -1],
    rp: ["", "de reputação por semana", 1],
  };

  function $(id) {
    return document.getElementById(id);
  }
  function brl(n) {
    return "R$ " + Math.floor(n).toLocaleString("pt-BR");
  }
  function lvl(id) {
    return (state.upgrades && state.upgrades[id]) || 0;
  }
  function nome(u, i) {
    return u.ln ? u.ln[Math.min(i, u.ln.length - 1)] : u.n;
  }

  /* soma de um atributo, considerando os níveis comprados */
  function tot(k) {
    var t = 0;
    UPS.forEach(function (u) {
      var a = u.st[k];
      if (!a) return;
      for (var i = 0; i < lvl(u.id); i++) t += a[i] || 0;
    });
    return t;
  }
  function folha() {
    var t = 0;
    UPS.forEach(function (u) {
      var n = lvl(u.id);
      if (u.sal && n > 0) t += u.sal[Math.min(n, u.sal.length) - 1];
    });
    return t;
  }

  /* ---------- requisitos ---------- */
  function faltaReq(u, nivel) {
    var q = u.req;
    if (!q) return "";
    if (q.house && state.houseLevel < q.house)
      return "Precisa de casa nível " + q.house;
    if (q.rep === 41 && !(state.reputation > 40))
      return "Precisa de reputação Média";
    if (q.rep === 81 && !(state.reputation > 80))
      return "Precisa de reputação Alta";
    if (q.seg) {
      var t = q.seg[Math.min(nivel, q.seg.length - 1)];
      if (state.followers < t)
        return "Precisa de " + t.toLocaleString("pt-BR") + " seguidores";
    }
    if (q.deps)
      for (var i = 0; i < q.deps.length; i++) {
        var d = q.deps[i];
        if (lvl(d[0]) < d[1]) {
          var o = UPS.filter(function (x) {
            return x.id === d[0];
          })[0];
          return "Precisa de " + o.n + " nível " + d[1];
        }
      }
    return "";
  }

  /* ---------- texto dos efeitos ---------- */
  function efeitos(u) {
    var out = [];
    Object.keys(ROTULOS).forEach(function (k) {
      var a = u.st[k];
      if (!a) return;
      var nz = [];
      a.forEach(function (x, i) {
        if (x) nz.push(i);
      });
      if (!nz.length) return;
      var L = ROTULOS[k],
        sg = L[2] > 0 ? "+" : "−",
        igual = nz.every(function (i) {
          return a[i] === a[nz[0]];
        }),
        t;
      if (igual) {
        t = sg + a[nz[0]] + L[0] + " " + L[1];
        var n = u.c.length,
          i0 = nz[0] + 1,
          i1 = nz[nz.length - 1] + 1;
        if (n > 1)
          t +=
            nz.length === n
              ? " (por nível)"
              : i1 === n
                ? " (a partir do nível " + i0 + ")"
                : i0 === i1
                  ? " (no nível " + i0 + ")"
                  : " (nos níveis " + i0 + " a " + i1 + ")";
      } else
        t =
          a
            .map(function (x) {
              return sg + x + L[0];
            })
            .join(" / ") +
          " " +
          L[1] +
          " (por nível)";
      out.push(t);
    });
    var d = u.st.d;
    if (d) {
      var q = 0;
      out.push(
        "Renda fixa por semana: R$ " +
          d
            .map(function (x) {
              q += x;
              return q.toLocaleString("pt-BR");
            })
            .join(" / "),
      );
    }
    return out.join(". ");
  }

  /* ---------- compra ---------- */
  function comprar(id) {
    var u = UPS.filter(function (x) {
      return x.id === id;
    })[0];
    if (!u) return;
    var n = lvl(id);
    if (n >= u.c.length) return;
    var preco = u.c[n],
      falta = faltaReq(u, n);
    if (falta) {
      if (typeof soundAlert === "function") soundAlert();
      if (typeof floatText === "function") floatText(falta);
      return;
    }
    if (state.money < preco) {
      if (typeof soundAlert === "function") soundAlert();
      if (typeof floatText === "function") floatText("Sem dinheiro!");
      return;
    }
    changeMoney(-preco);
    state.upgrades[id] = n + 1;
    if (u.st.a && u.st.a[n]) state.actions += u.st.a[n];
    aplicarAcoes();
    aplicarContas();
    if (typeof renderBills === "function") renderBills();
    if (typeof soundMoney === "function") soundMoney();
    if (typeof narrate === "function")
      narrate("🛠️ Contratado/comprado: " + nome(u, n) + ".");
    if (typeof saveGame === "function") saveGame();
    updateHUD();
    desenhar(true);
  }

  /* ---------- efeitos que não mexem no script.js ---------- */
  function aplicarAcoes() {
    if (state) state.maxActions = (state.houseLevel >= 7 ? 4 : 3) + tot("a");
  }
  function aplicarContas() {
    if (!state || !state.bills) return;
    var ct = Math.min(tot("ct"), CONTAS_MAX);
    state.bills.forEach(function (b) {
      if (b.base === undefined) b.base = b.cost;
      b.cost = Math.round(b.base * (1 - ct / 100));
    });
  }
  function semanal() {
    // roda ANTES do endDay original
    var renda = tot("d"),
      conta = SALARIOS_ATIVOS ? folha() : 0,
      demitidos = [];
    if (renda > 0) state.money += renda;
    while (conta > state.money) {
      // sem dinheiro: o mais caro pede demissão
      var topo = null,
        maior = 0;
      UPS.forEach(function (u) {
        if (u.sal && lvl(u.id) > 0) {
          var s = u.sal[Math.min(lvl(u.id), u.sal.length) - 1];
          if (s > maior) {
            maior = s;
            topo = u;
          }
        }
      });
      if (!topo) break;
      state.upgrades[topo.id]--;
      if (!state.upgrades[topo.id]) delete state.upgrades[topo.id];
      demitidos.push(topo.n);
      conta = folha();
    }
    if (conta > 0) state.money -= conta;
    if (typeof floatText === "function") {
      if (renda > 0) floatText("Renda fixa +" + brl(renda));
      if (conta > 0) floatText("Salários −" + brl(conta));
    }
    if (demitidos.length && typeof narrate === "function")
      narrate(
        "💸 Sem dinheiro para a folha: " +
          demitidos.join(", ") +
          " pediu(ram) demissão.",
      );
    aplicarAcoes();
  }

  var _updateEditor = updateEditor;
  updateEditor = function () {
    _updateEditor.apply(this, arguments);
    try {
      var l = Math.min(LUCRO_MAX, tot("l")),
        e = $("est-profit");
      if (l && e)
        e.innerText = Math.floor(
          (parseInt(e.innerText, 10) || 0) * (1 + l / 100),
        );
      var r = tot("r"),
        er = $("est-risk");
      if (r && er)
        er.innerText = Math.max(0, (parseInt(er.innerText, 10) || 0) - r);
    } catch (err) {
      console.error("upgrades/updateEditor", err);
    }
  };

  var _publishNews = publishNews;
  publishNews = function () {
    var antes = state.history.length,
      f0 = state.followers;
    _publishNews.apply(this, arguments);
    try {
      if (state.history.length > antes) {
        var post = state.history[state.history.length - 1],
          v = tot("v"),
          s = tot("s");
        if (v) post.views = post.views * (1 + v / 100);
        if (s) {
          var extra = Math.floor(((state.followers - f0) * s) / 100),
            teto = typeof MAX_FOLLOWERS !== "undefined" ? MAX_FOLLOWERS : 1e15;
          if (extra > 0)
            state.followers = Math.min(teto, state.followers + extra);
        }
        if (typeof renderActivePosts === "function") renderActivePosts();
        updateHUD();
      }
    } catch (err) {
      console.error("upgrades/publishNews", err);
    }
  };

  var _changePolice = changePolice;
  changePolice = function (a) {
    var p = Math.min(POLICIA_MAX, tot("p"));
    if (a > 0 && p) a = Math.round(a * (1 - p / 100));
    return _changePolice.call(this, a);
  };

  var _endDay = endDay;
  endDay = function () {
    try {
      semanal();
    } catch (err) {
      console.error("upgrades/semanal", err);
    }
    _endDay.apply(this, arguments);
    try {
      var rp = tot("rp");
      if (rp) state.reputation = Math.min(100, state.reputation + rp);
      aplicarAcoes();
      updateHUD();
      desenhar(true);
    } catch (err) {
      console.error("upgrades/endDay", err);
    }
  };

  var _upgradeHouse = upgradeHouse;
  upgradeHouse = function () {
    if (state.bills)
      state.bills.forEach(function (b) {
        if (b.base !== undefined) b.cost = b.base;
      });
    _upgradeHouse.apply(this, arguments);
    try {
      state.bills.forEach(function (b) {
        b.base = b.cost;
      });
      aplicarContas();
      aplicarAcoes();
      if (typeof renderBills === "function") renderBills();
      updateHUD();
    } catch (err) {
      console.error("upgrades/upgradeHouse", err);
    }
  };

  var _startGame = startGame;
  startGame = function () {
    _startGame.apply(this, arguments);
    state.upgrades = {};
    aplicarAcoes();
    aplicarContas();
    updateHUD();
    desenhar(true);
  };
  var _loadGame = loadGame;
  loadGame = function () {
    _loadGame.apply(this, arguments);
    if (state) {
      state.upgrades = state.upgrades || {};
      aplicarAcoes();
      aplicarContas();
      if (typeof renderBills === "function")
        try {
          renderBills();
        } catch (e) {}
      updateHUD();
      desenhar(true);
    }
  };
  var _updateHUD = updateHUD;
  updateHUD = function () {
    _updateHUD.apply(this, arguments);
    try {
      desenhar();
    } catch (err) {
      console.error("upgrades/hud", err);
    }
  };

  /* ---------- painel (HTML do index.html) ---------- */
  var filtro = "T",
    ultimaAssinatura = "";
  function desenhar(forcar) {
    var trilho = $("upg-track");
    if (!trilho || !state || !state.upgrades) return;
    var ass = [
      Math.floor(state.money),
      state.followers,
      state.houseLevel,
      Math.floor(state.reputation),
      JSON.stringify(state.upgrades),
      filtro,
    ].join("|");
    if (!forcar && ass === ultimaAssinatura) return;
    ultimaAssinatura = ass;
    var rolagem = trilho.scrollLeft;
    trilho.innerHTML = "";
    function prox(i) {
      return lvl(UPS[i].id) >= UPS[i].c.length
        ? 1e15
        : UPS[i].c[lvl(UPS[i].id)];
    }
    UPS.map(function (u, i) {
      return i;
    })
      .filter(function (i) {
        return filtro === "T" || UPS[i].k === filtro;
      })
      .sort(function (a, b) {
        return prox(a) - prox(b);
      })
      .forEach(function (i) {
        var u = UPS[i],
          n = lvl(u.id),
          max = n >= u.c.length,
          preco = u.c[n],
          falta = max ? "" : faltaReq(u, n);
        var b = document.createElement("button");
        b.className =
          "upg-card" +
          (max ? " max" : "") +
          (!max && !falta && state.money >= preco ? " can" : "") +
          (falta ? " lock" : "");
        var rotulo = u.ln ? nome(u, max ? n - 1 : n).split(" (")[0] : u.n,
          pips = "";
        for (var q = 0; q < u.c.length; q++) pips += q < n ? "●" : "○";
        b.innerHTML =
          '<span class="upg-e">' +
          u.e +
          "</span><b>" +
          rotulo +
          '</b><span class="upg-pips">' +
          pips +
          '</span><span class="upg-p">' +
          (max ? "MÁX" : (falta ? "🔒 " : "") + brl(preco)) +
          "</span>";
        var dica = function () {
          $("upg-tip").innerHTML = tooltip(u, n, max, preco, falta);
        };
        b.onmouseenter = b.onfocus = dica;
        b.onclick = function () {
          dica();
          comprar(u.id);
        };
        trilho.appendChild(b);
      });
    trilho.scrollLeft = rolagem;
    atributos();
    setas();
    chips();
  }
  function tooltip(u, n, max, preco, falta) {
    var h =
      "<b>" +
      u.e +
      " " +
      (max ? nome(u, n - 1) + " (máximo)" : nome(u, n)) +
      "</b><br>" +
      efeitos(u) +
      (u.x
        ? "<br><i>Efeito especial (ainda não ativo no código): " + u.x + "</i>"
        : "") +
      "<br><span class='upg-mut'>" +
      u.w +
      "</span>";
    if (!max) h += "<br>Custo: <b>" + brl(preco) + "</b>";
    if (u.sal)
      h += " · Salário: " + brl(u.sal[Math.min(n, u.sal.length - 1)]) + "/sem";
    if (falta) h += "<br><span class='upg-bad'>🔒 " + falta + "</span>";
    return h;
  }
  function atributos() {
    var el = $("upg-attrs");
    if (!el) return;
    var A = [
      ["💰", "Lucro", "+" + Math.min(LUCRO_MAX, tot("l")) + "%"],
      ["👁️", "Views", "+" + tot("v") + "%"],
      ["👥", "Seguidores", "+" + tot("s") + "%"],
      ["🔕", "Risco", "−" + tot("r")],
      ["🚨", "Polícia", "−" + Math.min(POLICIA_MAX, tot("p")) + "%"],
      ["⚡", "Ações", "+" + tot("a")],
      ["🏦", "Renda", brl(tot("d")) + "/sem"],
      ["💸", "Folha", SALARIOS_ATIVOS ? brl(folha()) + "/sem" : "—"],
    ];
    el.innerHTML = A.map(function (x) {
      return (
        '<div class="upg-at"><b>' +
        x[0] +
        " " +
        x[2] +
        "</b><small>" +
        x[1] +
        "</small></div>"
      );
    }).join("");
  }
  function chips() {
    var el = $("upg-chips");
    if (!el || el.dataset.ok === filtro) return;
    el.dataset.ok = filtro;
    el.innerHTML = "";
    [["T", "Todos"]]
      .concat(
        Object.keys(TRILHAS).map(function (k) {
          return [k, TRILHAS[k]];
        }),
      )
      .forEach(function (x) {
        var b = document.createElement("button");
        b.className = "upg-chip" + (filtro === x[0] ? " on" : "");
        b.textContent = x[1];
        b.onclick = function () {
          filtro = x[0];
          var t = $("upg-track");
          if (t) t.scrollLeft = 0;
          desenhar(true);
        };
        el.appendChild(b);
      });
  }
  function setas() {
    var t = $("upg-track"),
      p = $("upg-prev"),
      n = $("upg-next");
    if (!t || !p || !n) return;
    p.disabled = t.scrollLeft < 4;
    n.disabled = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
  }
  function iniciarSetas() {
    var t = $("upg-track"),
      p = $("upg-prev"),
      n = $("upg-next");
    if (!t) return;
    p.onclick = function () {
      t.scrollBy({ left: -t.clientWidth * 0.8, behavior: "smooth" });
    };
    n.onclick = function () {
      t.scrollBy({ left: t.clientWidth * 0.8, behavior: "smooth" });
    };
    t.addEventListener("scroll", setas);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", iniciarSetas);
  else iniciarSetas();

  window.UPG = { lista: UPS, tot: tot, comprar: comprar, folha: folha }; // para testar no Console (F12)
})();
