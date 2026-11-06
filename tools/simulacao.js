#!/usr/bin/env node
/* =====================================================================
   SIMULAÇÃO DE BALANCEAMENTO
   Joga milhares de partidas automáticas com as MESMAS regras do jogo
   (js/core/rules.js + js/config.js) e mostra se ele está equilibrado.

   Uso:  node tools/simulacao.js            (2000 partidas por perfil)
         node tools/simulacao.js 5000 104   (partidas, semanas máximas)
   ===================================================================== */
"use strict";
var path = require("path");

["js/config.js", "js/core/util.js", "js/data/content.js", "js/data/news.js", "js/core/rules.js"].forEach(function (f) {
  require(path.join(__dirname, "..", f));
});

var EDM = globalThis.EDM;
var R = EDM.Rules;
var U = EDM.Util;
var CFG = EDM.CONFIG;

var RUNS = Number(process.argv[2]) || 2000;
var MAX_WEEKS = Number(process.argv[3]) || 104;
var STICKER_IDS = Object.keys(CFG.stickers);

/* ---------------- habilidade nos minijogos ---------------- */
function mazeWinChance(state) {
  var setup = R.mazeSetup(state);
  return U.clamp(0.95 - 0.05 * setup.guards - (setup.delegado ? 0.05 : 0) + 0.6 * (setup.speedMult - 1), 0.3, 0.95);
}
function shredWinChance(state) {
  return U.clamp(0.72 + 0.8 * (1 - R.shredderSetup(state).slowMult), 0.3, 0.95);
}
function playCrash(target, rng) {
  var point = R.drawCrashPoint(rng);
  return point >= target ? { crashed: false, mult: target, crashPoint: point } : { crashed: true, mult: point, crashPoint: point };
}

/* ---------------- manchete ---------------- */
function bestParts(maxAbsurd) {
  // o bot escolhe a combinação mais absurda que não passe do limite
  var best = [0, 0, 0];
  var bestAbs = -1;
  for (var a = 0; a < EDM.News.who.length; a++)
    for (var b = 0; b < EDM.News.verb.length; b++)
      for (var c = 0; c < EDM.News.topic.length; c++) {
        var abs = EDM.News.absurdity([a, b, c]);
        if (abs <= maxAbsurd && abs > bestAbs) {
          bestAbs = abs;
          best = [a, b, c];
        }
      }
  return best;
}
var PARTS_BY_ABSURD = [];
for (var lvl = 0; lvl <= 9; lvl++) PARTS_BY_ABSURD.push(bestParts(lvl));

var STICKER_SETS = (function () {
  var sets = [[]];
  for (var i = 0; i < STICKER_IDS.length; i++) {
    sets.push([STICKER_IDS[i]]);
    for (var j = i + 1; j < STICKER_IDS.length; j++) {
      sets.push([STICKER_IDS[i], STICKER_IDS[j]]);
      for (var k = j + 1; k < STICKER_IDS.length; k++) sets.push([STICKER_IDS[i], STICKER_IDS[j], STICKER_IDS[k]]);
    }
  }
  return sets;
})();

/* ---------------- perfis de jogador ---------------- */
function reserveFor(state) {
  return R.monthlyBillsTotal(state.property) + R.payroll(state) * 4 + 150;
}

function payBills(state, horizon) {
  state.bills
    .slice()
    .sort(function (a, b) {
      return b.lateWeeks - a.lateWeeks || a.dueWeek - b.dueWeek;
    })
    .forEach(function (b) {
      if (b.owed > 0 && b.dueWeek <= state.week + horizon && state.money >= b.owed) R.payBill(state, b.id);
    });
}

var STRATEGIES = {
  /* Só notícia limpa: prova o item 7 (notícia base não paga as contas). */
  honesto: {
    draft: function (state) {
      return { parts: PARTS_BY_ABSURD[2], stickers: [] };
    },
    crashTarget: function () {
      return 1.5;
    },
    turn: function (state, rng, ctx) {
      payBills(state, 1);
      while (state.actions > 0 && !state.over) ctx.publish();
    },
    choice: function () {
      return 1;
    },
  },

  /* Sempre 3 adesivos de maior lucro e crash alto: deve ser preso rápido. */
  ganancioso: {
    draft: function (state) {
      var best = null;
      STICKER_SETS.forEach(function (set) {
        if (set.length !== 3) return;
        var ev = R.evaluateDraft(state, { parts: PARTS_BY_ABSURD[9], stickers: set });
        if (!best || ev.money > best.money) best = { set: set, money: ev.money };
      });
      return { parts: PARTS_BY_ABSURD[9], stickers: best.set };
    },
    crashTarget: function () {
      return 3;
    },
    turn: function (state, rng, ctx) {
      payBills(state, 1);
      while (state.actions > 0 && !state.over) ctx.publish();
      buyStuff(state, 0.8);
    },
    choice: function () {
      return 0;
    },
  },

  /* Jogador casual: escolhas aleatórias, foge de vez em quando. */
  casual: {
    draft: function (state, rng) {
      var n = Math.floor(rng() * 4);
      var stickers = U.shuffle(STICKER_IDS, rng).slice(0, n);
      return { parts: EDM.News.randomParts(rng), stickers: stickers };
    },
    crashTarget: function (state, rng) {
      return 1.2 + rng() * 1.8;
    },
    turn: function (state, rng, ctx) {
      payBills(state, 0);
      while (state.actions > 0 && !state.over) {
        if (state.police > 65 && rng() < 0.5) ctx.layLow();
        else ctx.publish();
      }
      if (rng() < 0.3) buyStuff(state, 0.6);
    },
    choice: function (state, ev, rng) {
      return Math.floor(rng() * CFG.events.effects[ev.id].length);
    },
  },

  /* Jogador atento: controla o risco, foge na hora certa, usa a queima de arquivo. */
  equilibrado: {
    draft: function (state) {
      var cooldown = CFG.police.weeklyCooldown;
      var budget = Math.max(0, (45 - state.police) / Math.max(1, state.actions) + cooldown / 3);
      var repRoom = Math.max(0, state.reputation - 30);
      var repValue = 0.25 * R.evaluateDraft(state, { parts: PARTS_BY_ABSURD[6], stickers: ["especialista-anonimo", "sensacionalismo"] }).money;
      var best = null;
      STICKER_SETS.forEach(function (set) {
        [3, 6, 9].forEach(function (abs) {
          var draft = { parts: PARTS_BY_ABSURD[abs], stickers: set };
          var ev = R.evaluateDraft(state, draft);
          if (ev.police > budget || -ev.repDelta > repRoom) return;
          var score = ev.money * (ev.fake ? 1.08 : 1.1) + ev.followersGain * 0.4 + (ev.repDelta - (ev.fake ? 0.8 : 0)) * repValue;
          if (!best || score > best.score) best = { draft: draft, score: score };
        });
      });
      return best.draft;
    },
    crashTarget: function () {
      return 1.6;
    },
    turn: function (state, rng, ctx) {
      payBills(state, 1);
      buyStuff(state, 0.5);
      while (state.actions > 0 && !state.over) {
        if (state.clues >= 2 && R.canShred(state)) ctx.shred();
        else if (state.police >= 50) ctx.layLow();
        else ctx.publish();
      }
      payBills(state, 1);
    },
    choice: function (state, ev) {
      var opts = CFG.events.effects[ev.id];
      var best = 0;
      var bestScore = -Infinity;
      opts.forEach(function (eff, i) {
        var money = (eff.money || 0) * R.billScale(state.property);
        if (money < 0 && state.money < -money && eff.ifBroke) eff = eff.ifBroke;
        var score = money + (eff.followersPct || 0) * state.followers * 0.03 - (eff.police || 0) * (20 + state.police * 2) + (eff.rep || 0) * 25;
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      });
      return best;
    },
  },
};

/* Compra imóvel ou upgrade com o dinheiro que sobra acima da reserva. */
function buyStuff(state, share) {
  for (var guard = 0; guard < 6; guard++) {
    var spare = (state.money - reserveFor(state)) * share;
    var propCost = R.nextPropertyCost(state);
    if (propCost !== null && propCost <= spare) {
      R.upgradeProperty(state);
      continue;
    }
    var options = CFG.upgrades.list
      .filter(function (u) {
        return !R.upgradeBlocker(state, u.id) && u.cost[R.upgradeLevel(state, u.id)] <= spare && !u.salary;
      })
      .sort(function (a, b) {
        return a.cost[R.upgradeLevel(state, a.id)] - b.cost[R.upgradeLevel(state, b.id)];
      });
    if (!options.length) return;
    R.buyUpgrade(state, options[0].id);
  }
}

/* ---------------- uma partida ---------------- */
function playGame(strategyName, seed) {
  var rng = U.seededRng(seed);
  var strat = STRATEGIES[strategyName];
  var state = R.createState();
  var ctx = {
    publish: function () {
      var draft = strat.draft(state, rng);
      R.publish(state, draft, playCrash(strat.crashTarget(state, rng), rng), rng);
      handleEvent(R.rollEvent(state, "publish", rng));
    },
    layLow: function () {
      var won = rng() < mazeWinChance(state);
      R.layLow(state, { won: won, timeLeftFrac: 0.2 + rng() * 0.5 });
    },
    shred: function () {
      R.shred(state, { won: rng() < shredWinChance(state) });
    },
  };
  function handleEvent(ev) {
    if (!ev || state.over) return;
    R.applyEventChoice(state, ev, strat.choice(state, ev, rng));
  }
  var at26 = null;
  while (!state.over && state.week <= MAX_WEEKS) {
    strat.turn(state, rng, ctx);
    if (state.over) break;
    R.endWeek(state);
    if (state.over) break;
    handleEvent(R.rollEvent(state, "week", rng));
    if (state.week === 27) at26 = { money: state.money, followers: state.followers, property: state.property };
  }
  return {
    weeks: state.stats.weeks,
    ending: state.over || "sobreviveu",
    property: state.property,
    followers: state.followers,
    reputation: state.reputation,
    at26: at26,
    pubs: state.stats.publications,
    debunked: state.stats.debunked,
  };
}

/* ---------------- relatório ---------------- */
function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}
function report(name, results) {
  var weeks = results
    .map(function (r) {
      return r.weeks;
    })
    .sort(function (a, b) {
      return a - b;
    });
  var endings = {};
  results.forEach(function (r) {
    endings[r.ending] = (endings[r.ending] || 0) + 1;
  });
  var pct = function (n) {
    return ((100 * n) / results.length).toFixed(1) + "%";
  };
  var survived = function (w) {
    return pct(
      results.filter(function (r) {
        return r.weeks >= w;
      }).length,
    );
  };
  var props = results
    .map(function (r) {
      return r.property;
    })
    .sort(function (a, b) {
      return a - b;
    });
  var foll = results
    .map(function (r) {
      return r.followers;
    })
    .sort(function (a, b) {
      return a - b;
    });
  console.log("\n▶ " + name.toUpperCase() + " (" + results.length + " partidas)");
  console.log("  semanas sobrevividas: p10 " + percentile(weeks, 0.1) + " · mediana " + percentile(weeks, 0.5) + " · p90 " + percentile(weeks, 0.9));
  console.log("  chegou à semana 8: " + survived(8) + " · 26: " + survived(26) + " · 52: " + survived(52) + " · " + MAX_WEEKS + ": " + survived(MAX_WEEKS));
  console.log("  imóvel final (mediana): nível " + percentile(props, 0.5) + " · p90 nível " + percentile(props, 0.9) + " · seguidores (mediana) " + U.formatInt(percentile(foll, 0.5)));
  console.log(
    "  como terminou: " +
      Object.keys(endings)
        .sort(function (a, b) {
          return endings[b] - endings[a];
        })
        .map(function (k) {
          return k + " " + pct(endings[k]);
        })
        .join(" · "),
  );
  return { name: name, median: percentile(weeks, 0.5), endings: endings, results: results };
}

function main() {
  console.log("Editorial da Mentira — simulação de balanceamento (" + RUNS + " partidas por perfil, até " + MAX_WEEKS + " semanas)");
  var summary = Object.keys(STRATEGIES).map(function (name, i) {
    var results = [];
    for (var r = 0; r < RUNS; r++) results.push(playGame(name, 1000 + r * 7 + i * 100003));
    return report(name, results);
  });

  /* ---------------- metas de balanceamento ---------------- */
  var byName = {};
  summary.forEach(function (s) {
    byName[s.name] = s;
  });
  var surv = function (s, w) {
    return (
      s.results.filter(function (r) {
        return r.weeks >= w;
      }).length / s.results.length
    );
  };
  var checks = [
    ["Notícia honesta não paga as contas (honesto quebra antes da semana 16)", byName.honesto.median < 16],
    ["Honesto nunca é preso (sem adesivo não há polícia)", !byName.honesto.endings.prisao],
    ["Ganância é punida (ganancioso preso antes da semana 10)", byName.ganancioso.median < 10],
    ["Jogar no automático não basta (casual: mediana < 26 semanas)", byName.casual.median < 26],
    ["Jogo é vencível com cuidado (equilibrado: mediana ≥ 40 semanas)", byName.equilibrado.median >= 40],
    ["Jogo não é fácil demais (equilibrado: no máx. 75% chegam à semana " + MAX_WEEKS + ")", surv(byName.equilibrado, MAX_WEEKS) <= 0.75],
    ["Equilibrado progride (mediana do imóvel ≥ nível 5)", percentile(byName.equilibrado.results.map(function (r) { return r.property; }).sort(function (a, b) { return a - b; }), 0.5) >= 5],
  ];
  console.log("\nMETAS");
  var ok = true;
  checks.forEach(function (c) {
    console.log("  " + (c[1] ? "[OK]   " : "[FALHA]") + " " + c[0]);
    ok = ok && c[1];
  });
  process.exitCode = ok ? 0 : 1;
}

if (require.main === module) main();
module.exports = { STRATEGIES: STRATEGIES, playGame: playGame };
