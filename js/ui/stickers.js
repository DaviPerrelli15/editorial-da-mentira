/* Coluna direita: adesivos personalizados (imagens do PDF), arrastar e soltar, prévia do celular. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var built = false;

  function fxText(id) {
    var st = EDM.CONFIG.stickers[id];
    var parts = ["+" + Math.round(st.profit * 100) + "% lucro"];
    if (st.viral >= 1.5) parts.push("views ×" + st.viral.toFixed(1).replace(".", ","));
    parts.push("risco " + st.risk.toString().replace(".", ","));
    if (st.repCost) parts.push("−" + st.repCost + " reputação");
    return parts.join(" · ");
  }

  function build() {
    var list = D.$("sticker-list");
    list.innerHTML = Object.keys(EDM.CONFIG.stickers)
      .map(function (id) {
        var name = EDM.Content.stickers[id].name;
        return (
          '<button type="button" class="sticker" draggable="true" data-key="stk-' + id + '" data-sticker="' + id + '" aria-pressed="false" aria-label="' + name + ": " + fxText(id) + '">' +
          '<img src="' + EDM.Assets.stickerImg(id) + '" alt="" width="640" height="240" loading="lazy">' +
          '<span class="sticker__fx">' + fxText(id) + "</span></button>"
        );
      })
      .join("");
    built = true;
  }

  function render(state, draft, ev) {
    if (!built) build();
    var max = EDM.CONFIG.maxStickers;
    var full = draft.stickers.length >= max;
    D.qsa(".sticker").forEach(function (btn) {
      var on = draft.stickers.indexOf(btn.dataset.sticker) >= 0;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-full", full && !on);
    });
    D.setText(D.$("sticker-count"), draft.stickers.length + "/" + max);
    D.$("btn-clear-stickers").disabled = !draft.stickers.length;
    renderMiniPreview(state, draft, ev);
  }

  function renderMiniPreview(state, draft, ev) {
    var cells = EDM.Newsroom.forecastCells(ev).filter(function (c) {
      return c.label !== "Views";
    });
    D.$("mini-preview").innerHTML =
      '<p class="mini-preview__headline">' + D.escape(EDM.News.compose(draft.parts, draft.stickers)) + "</p>" +
      '<p class="mini-preview__stats">' +
      cells
        .map(function (c) {
          return '<span class="' + c.cls + '">' + c.label + " " + c.value + "</span>";
        })
        .join("") +
      "</p>";
  }

  function bind() {
    var list = D.$("sticker-list");
    var paper = D.$("paper");
    list.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-sticker]");
      if (btn) EDM.Game.toggleSticker(btn.dataset.sticker);
    });
    list.addEventListener("dragstart", function (event) {
      var btn = event.target.closest("[data-sticker]");
      if (!btn) return;
      event.dataTransfer.setData("text/plain", btn.dataset.sticker);
      event.dataTransfer.effectAllowed = "copy";
      btn.classList.add("is-dragging");
    });
    list.addEventListener("dragend", function (event) {
      var btn = event.target.closest("[data-sticker]");
      if (btn) btn.classList.remove("is-dragging");
      paper.classList.remove("is-drop-target");
    });
    paper.addEventListener("dragover", function (event) {
      event.preventDefault();
      paper.classList.add("is-drop-target");
    });
    paper.addEventListener("dragleave", function (event) {
      if (!paper.contains(event.relatedTarget)) paper.classList.remove("is-drop-target");
    });
    paper.addEventListener("drop", function (event) {
      event.preventDefault();
      paper.classList.remove("is-drop-target");
      var id = event.dataTransfer.getData("text/plain");
      if (EDM.CONFIG.stickers[id]) EDM.Game.addSticker(id);
    });
    D.$("btn-clear-stickers").addEventListener("click", function () {
      EDM.Game.clearStickers();
    });
  }

  EDM.Stickers = { bind: bind, render: render, fxText: fxText };
})(window);
