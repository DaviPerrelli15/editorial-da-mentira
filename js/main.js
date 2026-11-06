/* =====================================================================
   INICIALIZAÇÃO: ícones, eventos de todos os módulos e tela inicial.
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;

  function refreshStart() {
    D.$("btn-continue").hidden = !EDM.Storage.hasSave();
    var record = EDM.Storage.record();
    D.$("start-record").textContent = record ? "Recorde: " + record + " semana" + (record === 1 ? "" : "s") : "Recorde: nenhum ainda";
  }

  function newGame() {
    EDM.Audio.unlock();
    if (!EDM.Storage.hasSave()) return EDM.Game.start();
    EDM.Modal.open({
      icon: "alert",
      title: "Começar do zero?",
      body: "<p>Existe um jogo salvo. Se começar um novo, ele será apagado.</p>",
      actions: [
        { label: "Novo jogo", kind: "primary" },
        { label: "Cancelar", kind: "ghost" },
      ],
    }).then(function (i) {
      if (i === 0) {
        EDM.Storage.clear();
        EDM.Game.start();
      }
    });
  }

  function boot() {
    D.hydrateIcons(document);
    EDM.Audio.setEnabled(EDM.Storage.soundOn());
    EDM.Sidebar.bind();
    EDM.Newsroom.bind();
    EDM.Stickers.bind();
    EDM.Upgrades.bind();
    EDM.Tabs.bind();
    EDM.Endings.bind();
    D.$("btn-new").addEventListener("click", newGame);
    D.$("btn-continue").addEventListener("click", function () {
      EDM.Audio.unlock();
      var saved = EDM.Storage.load();
      if (saved) EDM.Game.start(saved);
    });
    D.$("btn-rules").addEventListener("click", function () {
      EDM.Audio.unlock();
      EDM.Game.rules();
    });
    D.$("btn-menu").addEventListener("click", EDM.Game.menu);
    D.$("hud-rep-btn").addEventListener("click", EDM.Game.repInfo);
    D.$("hud-followers-btn").addEventListener("click", EDM.Game.followersInfo);
    document.addEventListener("pointerdown", EDM.Audio.unlock, { once: true });
    refreshStart();
  }

  EDM.Main = { refreshStart: refreshStart };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
