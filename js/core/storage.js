/* Salvar/carregar partida e recorde (localStorage protegido: modo anônimo não quebra o jogo). */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var SAVE_KEY = "edm_save_v3";
  var RECORD_KEY = "edm_record_weeks";
  var SOUND_KEY = "edm_sound";

  function read(key) {
    try {
      return root.localStorage ? root.localStorage.getItem(key) : null;
    } catch (err) {
      return null;
    }
  }
  function write(key, value) {
    try {
      if (!root.localStorage) return;
      if (value === null) root.localStorage.removeItem(key);
      else root.localStorage.setItem(key, value);
    } catch (err) {
      /* sem armazenamento: o jogo segue sem salvar */
    }
  }

  EDM.Storage = {
    save: function (state) {
      write(SAVE_KEY, JSON.stringify(state));
    },
    load: function () {
      var raw = read(SAVE_KEY);
      if (!raw) return null;
      try {
        var state = JSON.parse(raw);
        return state && state.version === 3 ? state : null;
      } catch (err) {
        return null;
      }
    },
    hasSave: function () {
      return !!EDM.Storage.load();
    },
    clear: function () {
      write(SAVE_KEY, null);
    },
    record: function () {
      return Number(read(RECORD_KEY)) || 0;
    },
    submitRecord: function (weeks) {
      var isNew = weeks > EDM.Storage.record();
      if (isNew) write(RECORD_KEY, String(weeks));
      return isNew;
    },
    soundOn: function () {
      return read(SOUND_KEY) !== "off";
    },
    setSound: function (on) {
      write(SOUND_KEY, on ? "on" : "off");
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
