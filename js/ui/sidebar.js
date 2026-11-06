/* Coluna esquerda: imóvel (casa → banca), Delegado Amaral e contas em post-it. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var U = EDM.Util;
  var lastLevel = null;

  function perkText(perk) {
    return Object.keys(perk)
      .map(function (k) {
        return EDM.Content.perkLabels[k].replace("{v}", perk[k]);
      })
      .join(" · ");
  }

  /* ---------- imóvel ---------- */
  function renderProperty(state) {
    var R = EDM.Rules;
    var theme = EDM.Assets.property();
    var level = theme.levels[state.property - 1];
    var img = D.$("property-img");
    if (lastLevel !== state.property) {
      img.hidden = false;
      D.$("property-fallback").hidden = true;
      img.src = level.img;
      img.alt = theme.label + ": " + level.name;
      if (lastLevel !== null) D.pulse(D.$("property-photo"), "is-flash");
      lastLevel = state.property;
    }
    D.setText(D.$("property-name"), "Nível " + state.property + ": " + level.name);
    var perk = EDM.CONFIG.property.levels[state.property - 1].perk;
    D.setText(D.$("property-perk"), Object.keys(perk).length ? "Vantagem: " + perkText(perk) : "Aluguel barato, zero conforto.");

    var cost = R.nextPropertyCost(state);
    var btn = D.$("btn-property");
    if (cost === null) {
      D.$("property-progress").style.width = "100%";
      D.setText(D.$("property-next"), "Você chegou ao topo!");
      btn.hidden = true;
      return;
    }
    var next = theme.levels[state.property];
    var nextPerk = perkText(EDM.CONFIG.property.levels[state.property].perk);
    btn.hidden = false;
    D.$("property-progress").style.width = U.clamp((state.money / cost) * 100, 0, 100) + "%";
    var ready = state.money >= cost;
    var nextBills = "contas do mês passam a " + U.formatMoney(R.monthlyBillsTotal(state.property + 1));
    D.setText(D.$("property-next"), ready ? "Dá para subir de nível! " + nextBills + "." : U.formatMoney(Math.max(0, state.money)) + " de " + U.formatMoney(cost) + " · " + nextBills);
    btn.disabled = !ready;
    btn.classList.toggle("is-ready", ready);
    btn.textContent = (ready ? theme.upgradeVerb + ": " : "Próximo: ") + next.name + (ready ? " (" + U.formatMoney(cost) + ")" : "");
    btn.title = "Vantagem do próximo nível: " + nextPerk;
  }

  /* ---------- Delegado Amaral ---------- */
  function renderDelegado(state) {
    var C = EDM.CONFIG.police;
    var clues = state.clues;
    var portrait = D.$("delegado-portrait");
    if (portrait.dataset.clues !== String(clues)) {
      portrait.innerHTML = EDM.Illustrations.delegado(clues);
      portrait.dataset.clues = String(clues);
    }
    var html = "";
    for (var i = 0; i < C.maxClues; i++) html += '<span class="clue' + (i < clues ? " is-on" : "") + '">' + D.icon("search") + "</span>";
    var cluesEl = D.$("delegado-clues");
    if (cluesEl.dataset.clues !== String(clues)) {
      cluesEl.innerHTML = html;
      cluesEl.dataset.clues = String(clues);
    }
    cluesEl.setAttribute("aria-label", "Pistas: " + clues + " de " + C.maxClues);
    D.setText(D.$("delegado-quote"), "“" + EDM.Content.delegado.quotes[clues] + "”");
    var effect = clues === 0 ? "Pistas só aparecem se você perder um minijogo." : "Polícia sobe +" + Math.round(clues * C.clueGainMult * 100) + "% mais rápido e " + clues + " guarda(s) a mais no labirinto.";
    if (clues >= C.maxClues) effect += " O caso esfria só pela metade.";
    D.setText(D.$("delegado-effect"), effect);
    D.$("delegado").classList.toggle("is-angry", clues >= 2);
  }

  /* ---------- contas (itens 13 a 16) ---------- */
  function dueText(state, status) {
    if (status.kind === "paid") return "Paga. Próxima: semana " + status.nextDueWeek;
    if (status.kind === "late") return "ATRASADA há " + status.lateWeeks + " sem. · " + (status.cutIn <= 1 ? "último aviso!" : "corte em " + status.cutIn + " sem.");
    if (status.kind === "dueNow") return "Vence ESTA semana!";
    return "Vence em " + status.weeksLeft + " sem. (semana " + (state.week + status.weeksLeft) + ")";
  }

  function renderBills(state) {
    var R = EDM.Rules;
    var weekOfMonth = ((state.week - 1) % EDM.CONFIG.calendar.weeksPerMonth) + 1;
    D.setText(D.$("bills-month"), "Mês " + R.monthOf(state.week) + " · semana " + weekOfMonth + " de " + EDM.CONFIG.calendar.weeksPerMonth + " · total do mês " + U.formatMoney(R.monthlyBillsTotal(state.property)));
    var list = D.$("bills-list");
    D.preserveFocus(list, function () {
      list.innerHTML = state.bills
        .map(function (bill) {
          var text = EDM.Content.bills[bill.id];
          var status = R.billStatus(state, bill);
          var amount = status.kind === "paid" ? R.billCost(bill.id, state.property) : bill.owed;
          var cls = { paid: "is-paid", late: "is-late", dueNow: "is-due", open: "" }[status.kind];
          var canPay = status.kind !== "paid";
          var label = !canPay ? "Pago" : state.money < bill.owed ? "Sem dinheiro" : status.kind === "late" ? "Pagar com multa" : "Pagar";
          return (
            '<article class="postit ' + cls + '">' +
            '<span class="postit__icon">' + D.icon(text.icon) + "</span>" +
            '<span class="postit__name">' + text.name + "</span>" +
            '<span class="postit__cost">' + U.formatMoney(amount) + "</span>" +
            '<span class="postit__due">' + dueText(state, status) + "</span>" +
            (status.kind === "late" ? '<span class="postit__effect">' + text.lateEffect + "</span>" : "") +
            '<button type="button" class="postit__pay" data-key="pay-' + bill.id + '" data-bill="' + bill.id + '"' + (canPay ? "" : " disabled") +
            ' aria-label="' + label + " " + text.name + " (" + U.formatMoney(amount) + ')">' + label + "</button>" +
            "</article>"
          );
        })
        .join("");
    });
  }

  function bind() {
    D.$("btn-property").addEventListener("click", function () {
      EDM.Game.upgradeProperty();
    });
    D.$("bills-list").addEventListener("click", function (event) {
      var btn = event.target.closest("[data-bill]");
      if (btn && !btn.disabled) EDM.Game.payBill(btn.dataset.bill);
    });
    D.$("property-img").addEventListener("error", function () {
      // imagem do tema ainda não existe (ex.: bancas do Miguel): mostra a ilustração reserva
      this.hidden = true;
      var fb = D.$("property-fallback");
      fb.innerHTML = EDM.Illustrations.propertyFallback(lastLevel || 1);
      fb.hidden = false;
    });
    D.$("property-car").innerHTML = EDM.Illustrations.copCar();
  }

  function render(state) {
    renderProperty(state);
    renderDelegado(state);
    renderBills(state);
    D.$("property-photo").classList.toggle("is-watched", state.police >= 60);
  }

  EDM.Sidebar = {
    bind: bind,
    render: render,
    reset: function () {
      lastLevel = null;
    },
  };
})(window);
