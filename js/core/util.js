/* Utilitários puros (sem DOM): números, sorteio e formatação. */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /* Gerador com semente (mulberry32): a simulação fica reproduzível. */
  function seededRng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickIndex(length, rng) {
    return Math.floor((rng || Math.random)() * length);
  }

  function pick(list, rng) {
    return list[pickIndex(list.length, rng)];
  }

  function shuffle(list, rng) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = pickIndex(i + 1, rng);
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function sum(list, fn) {
    return list.reduce(function (acc, item) {
      return acc + (fn ? fn(item) : item);
    }, 0);
  }

  var brlFormatter = typeof Intl !== "undefined" ? new Intl.NumberFormat("pt-BR") : null;

  function formatInt(n) {
    var v = Math.round(n);
    return brlFormatter ? brlFormatter.format(v) : String(v);
  }

  function formatMoney(n) {
    var sign = n < 0 ? "−" : "";
    return sign + "R$ " + formatInt(Math.abs(n));
  }

  /* 1.234 → 1,2 mil · 2.500.000 → 2,5 mi */
  function formatCompact(n) {
    var v = Math.abs(n);
    var sign = n < 0 ? "−" : "";
    if (v >= 1e6) return sign + (v / 1e6).toFixed(1).replace(".", ",") + " mi";
    if (v >= 1e4) return sign + Math.round(v / 1e3) + " mil";
    if (v >= 1e3) return sign + (v / 1e3).toFixed(1).replace(".", ",") + " mil";
    return sign + formatInt(v);
  }

  function formatSigned(n, suffix) {
    var v = Math.round(n);
    return (v > 0 ? "+" : v < 0 ? "−" : "±") + formatInt(Math.abs(v)) + (suffix || "");
  }

  function formatMult(m) {
    return "x" + m.toFixed(2).replace(".", ",");
  }

  EDM.Util = {
    clamp: clamp,
    seededRng: seededRng,
    pick: pick,
    pickIndex: pickIndex,
    shuffle: shuffle,
    sum: sum,
    formatInt: formatInt,
    formatMoney: formatMoney,
    formatCompact: formatCompact,
    formatSigned: formatSigned,
    formatMult: formatMult,
  };
})(typeof window !== "undefined" ? window : globalThis);
