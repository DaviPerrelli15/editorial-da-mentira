/* Barra de status (Estilo 1 e 7) + tensão visual da polícia. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var U = EDM.Util;
  var shownMoney = null;
  var last = {};

  var POLICE_LEVELS = [
    { below: 20, label: "Tranquilo", color: "var(--ok)" },
    { below: 40, label: "Suspeito", color: "#ffd23f" },
    { below: 60, label: "Investigação", color: "#ffa53d" },
    { below: 80, label: "Cuidado!", color: "#ff6a3d" },
    { below: 101, label: "Investigado!", color: "var(--danger)" },
  ];
  function policeLevel(police) {
    for (var i = 0; i < POLICE_LEVELS.length; i++) if (police < POLICE_LEVELS[i].below) return POLICE_LEVELS[i];
    return POLICE_LEVELS[POLICE_LEVELS.length - 1];
  }

  function tweenMoney(target) {
    var el = D.$("hud-money");
    if (shownMoney === null) shownMoney = target;
    var from = shownMoney;
    var t0 = performance.now();
    function step(now) {
      var k = Math.min(1, (now - t0) / 600);
      shownMoney = from + (target - from) * k;
      el.textContent = U.formatMoney(shownMoney);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function bump(selector, value, key) {
    if (last[key] !== undefined && last[key] !== value) D.pulse(document.querySelector(selector), value > last[key] ? "is-up" : "is-down");
    last[key] = value;
  }

  function render(state) {
    var R = EDM.Rules;
    tweenMoney(state.money);
    bump(".stat--money", Math.round(state.money), "money");
    D.setText(D.$("hud-week"), String(state.week));
    D.setText(D.$("hud-actions"), state.actions + "/" + R.maxActions(state));
    D.setText(D.$("hud-followers"), U.formatCompact(state.followers));
    bump(".stat--followers", state.followers, "followers");

    var tier = R.repTier(state.reputation);
    D.setText(D.$("hud-rep"), tier.label);
    document.querySelector(".stat--rep").classList.toggle("is-low", tier.id === "baixa");
    D.$("hud-rep-warn").hidden = tier.id !== "baixa";
    document.querySelector(".stat--rep").title = "Reputação " + Math.round(state.reputation) + "/100";

    var police = Math.round(state.police);
    var lvl = policeLevel(police);
    D.setText(D.$("hud-police-val"), police + "%");
    D.$("police-fill").style.width = police + "%";
    D.$("police-fill").style.backgroundColor = lvl.color;
    D.$("police-bar").setAttribute("aria-valuenow", String(police));
    D.setText(D.$("police-status"), lvl.label);
    D.$("hud-police").classList.toggle("is-critical", police >= 80);

    document.body.classList.remove("tension-1", "tension-2", "tension-3");
    if (police >= 80) document.body.classList.add("tension-3");
    else if (police >= 60) document.body.classList.add("tension-2");
    else if (police >= 40) document.body.classList.add("tension-1");
  }

  function reset() {
    shownMoney = null;
    last = {};
  }

  EDM.Hud = { render: render, reset: reset, policeLevel: policeLevel };
})(window);
