/* Sons sintetizados com Web Audio (sem arquivos de áudio). */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var ctx = null;
  var enabled = true;

  function unlock() {
    if (ctx || !enabled) return;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  function beep(freq, type, duration, volume, delay) {
    if (!ctx || !enabled) return;
    var t0 = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  }
  function noise(duration, volume) {
    if (!ctx || !enabled) return;
    var n = Math.floor(ctx.sampleRate * duration);
    var buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = ctx.createBufferSource();
    var gain = ctx.createGain();
    gain.gain.value = volume;
    src.buffer = buffer;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  var sounds = {
    click: function () { beep(620, "sine", 0.08, 0.08); },
    stick: function () { beep(300, "square", 0.06, 0.06); beep(520, "square", 0.08, 0.05, 0.05); },
    money: function () { [0, 0.09, 0.18].forEach(function (d, i) { beep(900 + i * 300, "triangle", 0.15, 0.1, d); }); },
    alert: function () { beep(150, "sawtooth", 0.45, 0.15); },
    combo: function () { [0, 0.08, 0.16, 0.24].forEach(function (d, i) { beep(400 + i * 200, "square", 0.14, 0.08, d); }); },
    print: function () { noise(0.4, 0.12); [0, 0.12, 0.24].forEach(function (d) { beep(180, "square", 0.06, 0.07, d); }); },
    crash: function () { noise(0.6, 0.25); beep(90, "sawtooth", 0.6, 0.18); },
    tick: function (pitch) { beep(200 + pitch, "square", 0.04, 0.035); },
    knock: function () { beep(100, "square", 0.12, 0.4); },
    win: function () { [0, 0.1, 0.2, 0.32].forEach(function (d, i) { beep([523, 659, 784, 1046][i], "triangle", 0.18, 0.1, d); }); },
    lose: function () { [0, 0.15, 0.3].forEach(function (d, i) { beep([392, 330, 262][i], "sawtooth", 0.25, 0.1, d); }); },
    shred: function () { noise(0.12, 0.12); },
  };

  EDM.Audio = {
    unlock: unlock,
    play: function (name, arg) {
      if (sounds[name]) sounds[name](arg);
    },
    setEnabled: function (on) {
      enabled = on;
      if (on) unlock();
    },
    isEnabled: function () {
      return enabled;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
