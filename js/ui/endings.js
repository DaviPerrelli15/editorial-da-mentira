/* Finais (item 15): um por conta atrasada + prisão com a sequência da batida na porta. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var U = EDM.Util;

  function statsHtml(state) {
    var st = state.stats;
    var rows = [
      ["Semanas", st.weeks],
      ["Publicações", st.publications],
      ["Fake news", st.fakeNews],
      ["Desmentidas", st.debunked],
      ["Maior viral", U.formatCompact(st.maxViews)],
      ["Maior crash", st.bestMult ? U.formatMult(st.bestMult) : "—"],
      ["Seguidores", U.formatCompact(state.followers)],
      ["Faturou", U.formatMoney(st.moneyEarned)],
      [EDM.Assets.property().label, "Nível " + state.property],
    ];
    return rows
      .map(function (r) {
        return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>";
      })
      .join("");
  }

  function show(id, state, text) {
    var ending = EDM.Content.endings[id];
    var isRecord = EDM.Storage.submitRecord(state.stats.weeks);
    EDM.Storage.clear();
    D.$("ending-title").textContent = ending.title;
    D.$("ending-art").innerHTML = EDM.Illustrations.ending(id);
    D.$("ending-text").textContent = text || ending.text;
    D.$("ending-stats").innerHTML = statsHtml(state);
    var old = D.$("ending").querySelector(".ending__record");
    if (old) old.remove();
    if (isRecord) D.$("ending-stats").insertAdjacentHTML("afterend", '<p class="ending__record">Novo recorde: ' + state.stats.weeks + " semanas!</p>");
    D.$("ending").hidden = false;
    D.$("ending").dataset.ending = id;
    EDM.Audio.play("lose");
    D.$("ending-restart").focus();
  }

  /* Sequência "TOC TOC" com escolha SIM/NÃO, depois o final da prisão. */
  function prison(state) {
    return new Promise(function (resolve) {
      var box = D.$("prison");
      var text = D.$("prison-text");
      var choices = D.$("prison-choices");
      var lines = EDM.Content.prisonSequence;
      text.innerHTML = "";
      choices.hidden = true;
      box.hidden = false;
      var i = 0;
      (function typeLine() {
        if (i < lines.length) {
          EDM.Audio.play("knock");
          text.insertAdjacentHTML("beforeend", D.escape(lines[i]) + "<br>");
          i++;
          setTimeout(typeLine, 750);
        } else {
          choices.hidden = false;
          choices.querySelector("button").focus();
        }
      })();
      choices.onclick = function (event) {
        var btn = event.target.closest("[data-choice]");
        if (!btn) return;
        box.hidden = true;
        var ending = EDM.Content.endings.prisao;
        show("prisao", state, btn.dataset.choice === "sim" ? ending.textSim : ending.textNao);
        resolve();
      };
    });
  }

  function bind() {
    D.$("ending-restart").addEventListener("click", function () {
      D.$("ending").hidden = true;
      EDM.Game.toMenu();
    });
  }

  EDM.Endings = { bind: bind, show: show, prison: prison };
})(window);
