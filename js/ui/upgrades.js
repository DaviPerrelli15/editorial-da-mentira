/* Painel "Bastidores": upgrades por trilha (item 12). */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var U = EDM.Util;
  var filter = "todos";
  var lastSignature = "";

  var SUMMARY = [
    ["profitPct", "Lucro", "+", "%"],
    ["viewsPct", "Views", "+", "%"],
    ["followersPct", "Seguidores", "+", "%"],
    ["policePct", "Polícia", "−", "%"],
    ["riskFlat", "Risco/pub.", "−", ""],
    ["repPerWeek", "Rep./sem", "+", ""],
    ["mazeSpeedPct", "Labirinto", "+", "%"],
    ["shredSlowPct", "Queima", "−", "%"],
  ];

  function effectText(u, level) {
    var labels = EDM.Content.effectLabels;
    return Object.keys(u.effect)
      .map(function (k) {
        var v = u.effect[k][level];
        return v ? labels[k][0] + v + labels[k][1] : "";
      })
      .filter(Boolean)
      .join(" · ");
  }

  function lockText(state, u, blocker) {
    if (blocker === "property") return "Precisa de " + EDM.Assets.property().label.toLowerCase() + " nível " + u.requires.property;
    return "";
  }

  function itemHtml(state, u) {
    var R = EDM.Rules;
    var text = EDM.Content.upgrades[u.id];
    var lvl = R.upgradeLevel(state, u.id);
    var max = lvl >= u.cost.length;
    var blocker = R.upgradeBlocker(state, u.id);
    var cls = max ? " is-max" : blocker === "property" ? " is-locked" : !blocker ? " is-can" : "";
    var model = text.models ? text.models[Math.min(max ? lvl - 1 : lvl, text.models.length - 1)] : "";
    var pips = "";
    for (var i = 0; i < u.cost.length; i++) pips += '<i class="' + (i < lvl ? "is-on" : "") + '"></i>';
    var fx = max ? "Nível máximo." : "Próximo nível: " + effectText(u, lvl) + ".";
    if (u.salary) fx += " Salário " + U.formatMoney(u.salary[0]) + "/sem.";
    var lock = lockText(state, u, blocker);
    var btnLabel = max ? "Máximo" : lock ? lock : "Comprar · " + U.formatMoney(u.cost[lvl]);
    return (
      '<li class="upg' + cls + '">' +
      '<span class="upg__icon">' + D.icon(text.icon) + "</span>" +
      '<div class="upg__title"><span class="upg__name">' + text.name + '</span><span class="upg__pips" aria-label="Nível ' + lvl + " de " + u.cost.length + '">' + pips + "</span></div>" +
      '<span class="upg__model">' + (model ? (max ? "Atual: " : "Próximo: ") + model : text.text) + "</span>" +
      '<p class="upg__fx">' + fx + (model ? " <em>" + text.text + "</em>" : "") + "</p>" +
      '<button type="button" class="btn btn--secondary btn--sm upg__buy" data-key="upg-' + u.id + '" data-upgrade="' + u.id + '"' + (max || lock ? " disabled" : "") + ">" + btnLabel + "</button>" +
      "</li>"
    );
  }

  function renderSummary(state) {
    var mods = EDM.Rules.modifiers(state);
    D.$("upg-summary").innerHTML = SUMMARY.map(function (s) {
      var v = Math.round(mods[s[0]] || 0);
      return '<div class="upg-attr"><b>' + (v ? s[2] + Math.abs(v) + s[3] : "—") + "</b><small>" + s[1] + "</small></div>";
    }).join("");
    D.setText(D.$("payroll"), "Folha: " + U.formatMoney(EDM.Rules.payroll(state)) + "/sem");
  }

  function renderFilters() {
    var tracks = [["todos", "Todos"]].concat(
      Object.keys(EDM.Content.tracks).map(function (k) {
        return [k, EDM.Content.tracks[k]];
      }),
    );
    D.$("upg-filters").innerHTML = tracks
      .map(function (t) {
        return '<button type="button" class="chip" data-key="flt-' + t[0] + '" data-filter="' + t[0] + '" aria-pressed="' + (filter === t[0]) + '">' + t[1] + "</button>";
      })
      .join("");
  }

  function render(state) {
    var signature = [Math.floor(state.money / 50), state.property, JSON.stringify(state.upgrades), filter].join("|");
    if (signature === lastSignature) return;
    lastSignature = signature;
    renderSummary(state);
    var list = D.$("upg-list");
    D.preserveFocus(D.$("panel-upgrades"), function () {
      renderFilters();
      var R = EDM.Rules;
      list.innerHTML = EDM.CONFIG.upgrades.list
        .filter(function (u) {
          return filter === "todos" || u.track === filter;
        })
        .slice()
        .sort(function (a, b) {
          var ca = R.upgradeLevel(state, a.id) >= a.cost.length ? Infinity : a.cost[R.upgradeLevel(state, a.id)];
          var cb = R.upgradeLevel(state, b.id) >= b.cost.length ? Infinity : b.cost[R.upgradeLevel(state, b.id)];
          return ca - cb;
        })
        .map(function (u) {
          return itemHtml(state, u);
        })
        .join("");
    });
  }

  /* quantos upgrades dá para comprar agora (badge da aba do celular) */
  function affordableCount(state) {
    return EDM.CONFIG.upgrades.list.filter(function (u) {
      return !EDM.Rules.upgradeBlocker(state, u.id);
    }).length;
  }

  function bind() {
    D.$("panel-upgrades").addEventListener("click", function (event) {
      var chip = event.target.closest("[data-filter]");
      if (chip) {
        filter = chip.dataset.filter;
        lastSignature = "";
        EDM.Game.render();
        return;
      }
      var buy = event.target.closest("[data-upgrade]");
      if (buy && !buy.disabled) EDM.Game.buyUpgrade(buy.dataset.upgrade);
    });
  }

  EDM.Upgrades = {
    bind: bind,
    render: render,
    affordableCount: affordableCount,
    reset: function () {
      lastSignature = "";
    },
  };
})(window);
