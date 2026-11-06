/* Abas do celular: uma seção por vez + contadores (contas vencendo, upgrades disponíveis). */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var COLUMN_FOR_TAB = { redacao: "col-center", adesivos: "col-right", contas: "col-left", bastidores: "col-right" };

  function select(tab) {
    D.$("screen-game").dataset.tab = tab;
    D.qsa(".tab").forEach(function (btn) {
      if (btn.dataset.tab === tab) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    var col = D.$(COLUMN_FOR_TAB[tab]);
    if (col) col.scrollTop = 0;
  }

  function setBadge(id, count, info) {
    var el = D.$(id);
    el.hidden = !count;
    el.textContent = count ? String(count) : "";
    el.classList.toggle("is-info", !!info);
  }

  function render(state, draft) {
    var urgent = state.bills.filter(function (b) {
      var kind = EDM.Rules.billStatus(state, b).kind;
      return kind === "late" || kind === "dueNow";
    }).length;
    setBadge("badge-contas", urgent);
    setBadge("badge-adesivos", draft.stickers.length, true);
    setBadge("badge-bastidores", EDM.Upgrades.affordableCount(state) + (EDM.Rules.nextPropertyCost(state) !== null && state.money >= EDM.Rules.nextPropertyCost(state) ? 1 : 0), true);
  }

  function bind() {
    D.qsa(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        EDM.Audio.play("click");
        select(btn.dataset.tab);
      });
    });
  }

  EDM.Tabs = { bind: bind, select: select, render: render };
})(window);
