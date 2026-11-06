/* Coluna central: jornal, montador de manchete, previsão, ações, narrador e feed. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var U = EDM.Util;
  var SLOT_LABELS = ["Quem", "Ação", "Assunto"];
  var lastHeadline = "";
  var lastPhotoKey = "";
  var lastCombo = null;
  var narrTimer = null;

  /* ---------- jornal ---------- */
  function renderPaper(state, draft, ev) {
    var text = EDM.News.compose(draft.parts, draft.stickers);
    var head = D.$("headline");
    if (text !== lastHeadline) {
      head.textContent = text;
      D.pulse(head, "is-new");
      lastHeadline = text;
    }
    head.classList.toggle("is-long", text.length > 95);
    head.classList.toggle("is-clean", !draft.stickers.length);
    D.setText(D.$("paper-edition"), "Edição nº " + state.edition);
    D.setText(D.$("paper-week"), "Semana " + state.week);

    var photoKey = draft.parts[0] + "-" + draft.parts[2];
    if (photoKey !== lastPhotoKey) {
      D.$("photo-art").innerHTML = EDM.Illustrations.newsPhoto(draft.parts);
      lastPhotoKey = photoKey;
    }
    D.setText(D.$("photo-caption"), draft.stickers.length ? "Foto: montagem exclusiva" : "Foto: arquivo");

    var combo = D.$("combo");
    combo.hidden = !ev.combo;
    if (ev.combo) {
      combo.textContent = EDM.Content.combos[ev.combo];
      if (lastCombo !== ev.combo) {
        D.pulse(D.$("paper"), "is-shake");
        EDM.Audio.play("combo");
      }
    }
    lastCombo = ev.combo;
    renderStamps(draft.stickers);
  }

  var STAMP_SPOTS = [
    { left: 46, top: 58, r: -8 },
    { left: 62, top: 72, r: 6 },
    { left: 40, top: 80, r: 3 },
  ];
  function renderStamps(stickers) {
    var box = D.$("stamps");
    D.qsa(".stamp", box).forEach(function (el) {
      if (stickers.indexOf(el.dataset.id) < 0) el.remove();
    });
    stickers.forEach(function (id, i) {
      var el = box.querySelector('[data-id="' + id + '"]');
      var spot = STAMP_SPOTS[i % STAMP_SPOTS.length];
      if (!el) {
        el = document.createElement("button");
        el.type = "button";
        el.className = "stamp";
        el.dataset.id = id;
        el.setAttribute("aria-label", "Descolar " + EDM.Content.stickers[id].name);
        el.innerHTML = '<img src="' + EDM.Assets.stickerImg(id) + '" alt="">';
        box.appendChild(el);
      }
      el.style.left = spot.left + "%";
      el.style.top = spot.top + "%";
      el.style.setProperty("--r", spot.r + "deg");
    });
  }

  /* ---------- montador ---------- */
  function renderBuilder(draft) {
    D.qsa(".slot").forEach(function (btn) {
      var i = Number(btn.dataset.slot);
      var part = EDM.News.part(i, draft.parts[i]);
      var flames = "";
      for (var f = 0; f < part.absurd; f++) flames += D.icon("flame");
      var key = i + ":" + draft.parts[i];
      if (btn.dataset.key === key) return;
      btn.dataset.key = key;
      btn.innerHTML = '<span class="slot__label">' + SLOT_LABELS[i] + " " + flames + "</span><span>" + D.escape(part.text) + "</span>";
      btn.setAttribute("aria-label", SLOT_LABELS[i] + ": " + part.text + ". Absurdo " + part.absurd + " de 3. Clique para trocar.");
    });
  }

  /* ---------- previsão ---------- */
  function forecastCells(ev) {
    var police = Math.round(ev.police);
    return [
      { icon: "eye", label: "Views", value: "~" + U.formatCompact(ev.views), cls: "is-neutral" },
      { icon: "coin", label: "Lucro", value: U.formatMoney(ev.money), cls: ev.fake ? "is-good" : "is-warn" },
      { icon: "siren", label: "Polícia", value: police ? "+" + police + "%" : "0%", cls: police ? "is-bad" : "is-good" },
      { icon: "star", label: "Reputação", value: U.formatSigned(ev.repDelta), cls: ev.repDelta >= 0 ? "is-good" : "is-bad" },
      { icon: "users", label: "Seguidores", value: "+" + U.formatCompact(Math.round(ev.followersGain)), cls: "is-neutral" },
    ];
  }
  function renderForecast(ev) {
    D.$("forecast").innerHTML = forecastCells(ev)
      .map(function (c) {
        return "<div><dt>" + D.icon(c.icon) + c.label + '</dt><dd class="' + c.cls + '">' + c.value + "</dd></div>";
      })
      .join("");
  }

  /* ---------- ações do turno ---------- */
  function renderTurn(state) {
    var R = EDM.Rules;
    var noActions = state.actions <= 0;
    D.$("btn-publish").disabled = noActions;
    D.$("btn-laylow").disabled = noActions;
    var canShred = R.canShred(state);
    D.$("btn-shred").disabled = !canShred;
    D.setText(D.$("shred-note"), state.shredCooldown > 0 ? "recarrega em " + state.shredCooldown + " sem." : "−1 ação");
    D.$("btn-endweek").classList.toggle("is-suggested", noActions);
  }

  /* ---------- narrador ---------- */
  function narrate(text) {
    var el = D.$("narrator-text");
    clearInterval(narrTimer);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.textContent = text;
      return;
    }
    var i = 0;
    el.textContent = "";
    narrTimer = setInterval(function () {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) clearInterval(narrTimer);
    }, 16);
  }

  /* ---------- feed ---------- */
  function renderFeed(state) {
    var list = D.$("feed-list");
    if (!state.posts.length) {
      list.innerHTML = '<li class="feed__empty">Nenhuma publicação no ar. Monte uma manchete e publique.</li>';
      return;
    }
    list.innerHTML = state.posts
      .map(function (p) {
        var tag = p.debunked ? '<span class="tag tag--debunked">Desmentida</span>' : p.fake ? '<span class="tag tag--fake">Fake news</span>' : '<span class="tag tag--clean">Notícia</span>';
        var tail = p.debunked ? "sem cauda" : "rende mais " + p.tailLeft + " sem.";
        return (
          '<li class="feed__item' + (p.fake ? " is-fake" : "") + (p.debunked ? " is-debunked" : "") + '">' +
          '<p class="feed__text">' + D.escape(p.text) + "</p>" +
          '<div class="feed__meta">' + tag +
          "<span>" + D.icon("eye") + U.formatCompact(p.views) + "</span>" +
          "<span>" + D.icon("coin") + U.formatMoney(p.earned) + "</span>" +
          (p.mult ? "<span>" + D.icon("trend") + U.formatMult(p.mult) + "</span>" : "") +
          "<span>" + tail + "</span></div></li>"
        );
      })
      .join("");
  }

  function bind() {
    D.qsa(".slot").forEach(function (btn) {
      btn.addEventListener("click", function () {
        EDM.Game.cycleSlot(Number(btn.dataset.slot));
      });
    });
    D.$("btn-shuffle").addEventListener("click", function () {
      EDM.Game.shuffle();
    });
    D.$("btn-publish").addEventListener("click", function () {
      EDM.Game.publish();
    });
    D.$("btn-laylow").addEventListener("click", function () {
      EDM.Game.layLow();
    });
    D.$("btn-shred").addEventListener("click", function () {
      EDM.Game.shred();
    });
    D.$("btn-endweek").addEventListener("click", function () {
      EDM.Game.endWeek();
    });
    D.$("stamps").addEventListener("click", function (event) {
      var stamp = event.target.closest(".stamp");
      if (stamp) EDM.Game.toggleSticker(stamp.dataset.id);
    });
  }

  function render(state, draft) {
    var ev = EDM.Rules.evaluateDraft(state, draft);
    renderPaper(state, draft, ev);
    renderBuilder(draft);
    renderForecast(ev);
    renderTurn(state);
    renderFeed(state);
    return ev;
  }

  EDM.Newsroom = {
    bind: bind,
    render: render,
    narrate: narrate,
    forecastCells: forecastCells,
    reset: function () {
      lastHeadline = "";
      lastPhotoKey = "";
      lastCombo = null;
    },
  };
})(window);
