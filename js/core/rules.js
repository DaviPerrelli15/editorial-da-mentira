/* =====================================================================
   REGRAS DO JOGO — funções puras sobre o estado (sem DOM).
   A interface e a simulação (tools/simulacao.js) usam exatamente estas
   funções, então o que a simulação prova vale para o jogo de verdade.
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var U = EDM.Util;

  function C() {
    return EDM.CONFIG;
  }

  /* ---------------- Calendário (item 1: tudo em semanas) ---------------- */
  function monthOf(week) {
    return Math.floor((week - 1) / C().calendar.weeksPerMonth) + 1;
  }
  function monthStartWeek(week) {
    return (monthOf(week) - 1) * C().calendar.weeksPerMonth + 1;
  }
  function isMonthStart(week) {
    return (week - 1) % C().calendar.weeksPerMonth === 0;
  }

  /* ---------------- Reputação, views e seguidores (itens 9, 10, 11) ---------------- */
  function repTier(rep) {
    var tiers = C().reputation.tiers;
    for (var i = 0; i < tiers.length; i++) if (rep <= tiers[i].upTo) return tiers[i];
    return tiers[tiers.length - 1];
  }
  function repViewMult(rep) {
    var r = C().reputation;
    return r.viewMultAtZero + (r.viewMultAtMax - r.viewMultAtZero) * (rep / r.max);
  }
  function conversion(rep) {
    var f = C().followers;
    return f.convAtZero + (f.convAtMax - f.convAtZero) * (rep / C().reputation.max);
  }
  function weeklyFollowerDriftPct(state) {
    var f = C().followers;
    return (state.reputation - f.driftPivot) * f.weeklyDriftPerPoint * 100 + modifiers(state).followersWeeklyPct;
  }

  /* ---------------- Contas ---------------- */
  function billConfig(id) {
    return C().bills.list.filter(function (b) {
      return b.id === id;
    })[0];
  }
  function billScale(level) {
    return Math.pow(C().bills.growthPerLevel, level - 1);
  }
  function billCost(id, level) {
    return Math.round((billConfig(id).base * billScale(level)) / 10) * 10;
  }
  function monthlyBillsTotal(level) {
    return U.sum(C().bills.list, function (b) {
      return billCost(b.id, level);
    });
  }
  function createBills(property) {
    return C().bills.list.map(function (cfg) {
      var paid = cfg.id === "aluguel" && C().bills.firstRentPaid;
      return { id: cfg.id, owed: paid ? 0 : billCost(cfg.id, property), dueWeek: cfg.dueWeek, lateWeeks: 0 };
    });
  }
  /* Situação do post-it: paga, aberta, vence nesta semana ou atrasada. */
  function billStatus(state, bill) {
    var cfg = billConfig(bill.id);
    if (bill.owed <= 0) {
      var next = monthStartWeek(state.week) + C().calendar.weeksPerMonth + cfg.dueWeek - 1;
      return { kind: "paid", nextDueWeek: next };
    }
    if (bill.lateWeeks > 0) return { kind: "late", lateWeeks: bill.lateWeeks, cutIn: cfg.cutAfter - bill.lateWeeks };
    var left = bill.dueWeek - state.week;
    return { kind: left <= 0 ? "dueNow" : "open", weeksLeft: Math.max(0, left) };
  }
  function issueMonthlyBills(state) {
    var monthStart = monthStartWeek(state.week);
    state.bills.forEach(function (bill) {
      var cfg = billConfig(bill.id);
      bill.owed += billCost(bill.id, state.property);
      if (bill.lateWeeks === 0) bill.dueWeek = monthStart + cfg.dueWeek - 1;
    });
  }

  /* ---------------- Modificadores: imóvel + upgrades + contas atrasadas ---------------- */
  function emptyMods() {
    return { profitPct: 0, viewsPct: 0, followersPct: 0, riskFlat: 0, riskPct: 0, policePct: 0, actions: 0, repPerWeek: 0, mazeSpeedPct: 0, shredSlowPct: 0, followersWeeklyPct: 0 };
  }
  function addEffects(mods, effects) {
    Object.keys(effects).forEach(function (k) {
      mods[k] = (mods[k] || 0) + effects[k];
    });
  }
  function upgradeConfig(id) {
    return C().upgrades.list.filter(function (u) {
      return u.id === id;
    })[0];
  }
  function upgradeLevel(state, id) {
    return state.upgrades[id] || 0;
  }
  function upgradeEffects(state) {
    var mods = emptyMods();
    C().upgrades.list.forEach(function (u) {
      var lvl = upgradeLevel(state, u.id);
      Object.keys(u.effect).forEach(function (k) {
        for (var i = 0; i < lvl; i++) mods[k] += u.effect[k][i] || 0;
      });
    });
    return mods;
  }
  function modifiers(state) {
    var mods = upgradeEffects(state);
    for (var i = 0; i < state.property; i++) addEffects(mods, C().property.levels[i].perk);
    var caps = C().upgrades.caps;
    Object.keys(caps).forEach(function (k) {
      mods[k] = Math.min(mods[k], caps[k]);
    });
    state.bills.forEach(function (bill) {
      if (bill.lateWeeks > 0) addEffects(mods, billConfig(bill.id).latePenalty);
    });
    return mods;
  }
  function maxActions(state) {
    return Math.max(1, C().start.actions + modifiers(state).actions);
  }
  function payroll(state) {
    return U.sum(C().upgrades.list, function (u) {
      var lvl = upgradeLevel(state, u.id);
      return u.salary && lvl > 0 ? u.salary[Math.min(lvl, u.salary.length) - 1] : 0;
    });
  }

  /* ---------------- Polícia e pistas (itens 8, 18, 19, 23) ---------------- */
  function policeGainMult(state, mods) {
    var p = C().police;
    return (1 + state.clues * p.clueGainMult) * (1 - (mods || modifiers(state)).policePct / 100);
  }
  /* Só aumenta passa pelos multiplicadores; reduções entram direto. */
  function changePolice(state, amount) {
    var before = state.police;
    var delta = amount > 0 ? amount * policeGainMult(state) : amount;
    state.police = U.clamp(state.police + delta, 0, C().police.prisonAt);
    if (before < C().police.eventThresholdCritical && state.police >= C().police.eventThresholdCritical) state.stats.closeCalls++;
    return state.police - before;
  }
  /* Pistas NUNCA mudam sozinhas: só pelos minijogos (item 19). */
  function changeClues(state, amount) {
    var before = state.clues;
    state.clues = U.clamp(state.clues + amount, 0, C().police.maxClues);
    return state.clues - before;
  }
  function changeReputation(state, amount) {
    var before = state.reputation;
    state.reputation = U.clamp(state.reputation + amount, 0, C().reputation.max);
    return state.reputation - before;
  }
  /* Público saturado: todo ganho de seguidores é dividido por (1 + seguidores/softCap). */
  function followerSaturation(followers) {
    return 1 / (1 + followers / C().followers.softCap);
  }
  function changeFollowers(state, amount, alreadySaturated) {
    var before = state.followers;
    if (amount > 0 && !alreadySaturated) amount *= followerSaturation(before);
    state.followers = Math.round(U.clamp(state.followers + amount, 0, C().followers.max));
    return state.followers - before;
  }
  function channelRiskMult(followers) {
    var decades = Math.max(0, Math.log10(Math.max(followers, 1) / 100));
    return 1 + decades * C().police.channelRiskPerDecade;
  }

  /* ---------------- Estado inicial ---------------- */
  function createState() {
    var s = C().start;
    var state = {
      version: 3,
      week: 1,
      money: s.money,
      followers: s.followers,
      reputation: s.reputation,
      police: s.police,
      clues: 0,
      property: 1,
      upgrades: {},
      bills: createBills(1),
      posts: [],
      archive: [],
      edition: 1,
      shredCooldown: 0,
      crashHistory: [],
      over: null,
      stats: { weeks: 0, publications: 0, fakeNews: 0, debunked: 0, maxViews: 0, moneyEarned: 0, bestMult: 0, closeCalls: 0, mazeWins: 0, mazeLosses: 0, shredWins: 0, shredLosses: 0 },
    };
    state.actions = maxActions(state);
    return state;
  }

  /* ---------------- Manchete: prévia e publicação ---------------- */
  function findCombo(stickerIds) {
    return (
      C().combos.filter(function (c) {
        return c.requires.every(function (id) {
          return stickerIds.indexOf(id) >= 0;
        });
      })[0] || null
    );
  }

  /* Notícia limpa dá reputação, mas manchete absurda demais rende menos credibilidade. */
  function cleanNewsRep(absurd) {
    var r = C().reputation;
    return Math.max(1, r.cleanNewsGain - Math.floor(absurd / r.cleanNewsAbsurdStep));
  }

  /* Prévia determinística (sem sorte e sem crash): é o que a tela mostra. */
  function evaluateDraft(state, draft) {
    var cfg = C();
    var mods = modifiers(state);
    var absurd = EDM.News.absurdity(draft.parts);
    var fake = draft.stickers.length > 0;
    var profitMult = 1;
    var viralMult = 1;
    var risk = 0;
    var repCost = 0;
    draft.stickers.forEach(function (id) {
      var st = cfg.stickers[id];
      profitMult += st.profit;
      viralMult *= st.viral;
      risk += st.risk;
      repCost += st.repCost;
    });
    var combo = findCombo(draft.stickers);
    if (combo) {
      profitMult += combo.profit;
      viralMult *= combo.viral;
      risk += combo.risk;
    }
    if (fake) {
      risk *= 1 + absurd * cfg.audience.absurdityRiskPct;
      risk = risk * channelRiskMult(state.followers) * (1 - mods.riskPct / 100) - mods.riskFlat;
      risk = Math.max(0.5, risk);
    }
    var a = cfg.audience;
    var views =
      (a.baseViews + Math.pow(state.followers, a.followerReachExp) * a.viewsPerFollower) *
      repViewMult(state.reputation) *
      viralMult *
      (1 + absurd * a.absurdityBonus) *
      Math.max(0.1, 1 + mods.viewsPct / 100);
    var money = cfg.money.rpm * Math.pow(views / 1000, cfg.money.viewsExp) * profitMult * (fake ? 1 : cfg.money.cleanNewsMult) * (1 + mods.profitPct / 100);
    var saturation = followerSaturation(state.followers);
    var followersGain = views * conversion(state.reputation) * (1 + mods.followersPct / 100) * saturation;
    return {
      fake: fake,
      views: views,
      money: money,
      risk: risk,
      police: risk * policeGainMult(state, mods),
      repDelta: fake ? -repCost : cleanNewsRep(absurd),
      followersGain: followersGain,
      profitMult: profitMult,
      viralMult: viralMult,
      absurdity: absurd,
      combo: combo ? combo.id : null,
    };
  }

  /* ---------------- Crash (item 5) ---------------- */
  function drawCrashPoint(rng) {
    var cr = C().crash;
    var r = (rng || Math.random)();
    var m = cr.houseEdge / (1 - r);
    return U.clamp(Math.floor(m * 100) / 100, 1, cr.maxMult);
  }
  function multAt(seconds) {
    var cr = C().crash;
    if (seconds <= cr.takeoff) return 1;
    return Math.min(cr.maxMult, Math.exp(cr.growth * (seconds - cr.takeoff)));
  }

  /* outcome = { crashed: bool, mult: número em que imprimiu, crashPoint: onde cairia } */
  function publish(state, draft, outcome, rng) {
    if (state.actions <= 0) return { error: "noActions" };
    var cfg = C();
    var ev = evaluateDraft(state, draft);
    var luck = 1 + ((rng || Math.random)() * 2 - 1) * cfg.audience.spread;
    var factor = outcome.crashed ? cfg.crash.crashKeep : outcome.mult;
    var views = Math.round(ev.views * luck * factor);
    var money = Math.round(ev.money * luck * factor);
    var risk = ev.fake ? ev.risk * (outcome.crashed ? 1 + cfg.crash.crashRiskExtra : 1 + cfg.crash.riskPerLnMult * Math.log(outcome.mult)) : 0;
    var rep = ev.repDelta - (outcome.crashed && ev.fake ? cfg.reputation.debunkLoss : 0);

    state.actions--;
    state.money += money;
    var deltas = {
      money: money,
      views: views,
      followers: changeFollowers(state, ev.followersGain * luck * factor, true),
      police: changePolice(state, risk),
      rep: changeReputation(state, rep),
    };
    var post = {
      id: state.edition,
      text: EDM.News.compose(draft.parts, draft.stickers),
      parts: draft.parts.slice(),
      stickers: draft.stickers.slice(),
      week: state.week,
      views: views,
      money: money,
      fake: ev.fake,
      debunked: !!outcome.crashed,
      mult: outcome.crashed ? 0 : outcome.mult,
      tailLeft: outcome.crashed ? 0 : cfg.posts.tailRates.length,
      tailMult: 1,
      earned: money,
    };
    state.posts.unshift(post);
    state.posts = state.posts.slice(0, cfg.posts.maxActive);
    state.edition++;
    state.crashHistory.unshift(outcome.crashPoint);
    state.crashHistory = state.crashHistory.slice(0, cfg.crash.historySize);

    var st = state.stats;
    st.publications++;
    if (ev.fake) st.fakeNews++;
    if (outcome.crashed) st.debunked++;
    else st.bestMult = Math.max(st.bestMult, outcome.mult);
    st.maxViews = Math.max(st.maxViews, views);
    st.moneyEarned += money;
    checkPrison(state);
    return { post: post, deltas: deltas, combo: ev.combo, crashed: !!outcome.crashed };
  }

  /* ---------------- Ficar na Miúda + labirinto (itens 4, 17, 18) ---------------- */
  function layLow(state, result) {
    if (state.actions <= 0) return { error: "noActions" };
    var cfg = C().layLow;
    state.actions--;
    var deltas = { police: 0, clues: 0, rep: 0 };
    if (result.won) {
      var frac = U.clamp(result.timeLeftFrac || 0, 0, 1);
      deltas.police = changePolice(state, -(cfg.winPolice + cfg.winTimeBonus * frac));
      deltas.rep = changeReputation(state, C().reputation.layLowGain);
      state.posts.forEach(function (p) {
        if (p.fake) p.tailMult *= cfg.winPostCooling;
      });
      state.stats.mazeWins++;
    } else {
      deltas.clues = changeClues(state, cfg.loseClues);
      deltas.police = changePolice(state, cfg.losePolice);
      state.stats.mazeLosses++;
    }
    checkPrison(state);
    return { won: !!result.won, deltas: deltas };
  }
  function mazeSetup(state) {
    var m = C().maze;
    var guards = m.baseGuards + state.clues * m.guardsPerClue + (state.police >= m.extraGuardPolice ? 1 : 0);
    return {
      guards: guards,
      delegado: state.clues >= 2,
      speedMult: 1 + modifiers(state).mazeSpeedPct / 100,
    };
  }

  /* ---------------- Queima de Arquivo (itens 22, 23) ---------------- */
  function canShred(state) {
    return state.actions > 0 && state.shredCooldown === 0;
  }
  function shred(state, result) {
    if (!canShred(state)) return { error: "unavailable" };
    var cfg = C().shredder;
    state.actions--;
    state.shredCooldown = cfg.cooldownWeeks;
    var deltas = { police: 0, clues: 0 };
    if (result.won) {
      if (state.clues > 0) deltas.clues = changeClues(state, cfg.winClues);
      else deltas.police = changePolice(state, -cfg.winPoliceIfNoClue);
      state.stats.shredWins++;
    } else {
      deltas.clues = changeClues(state, cfg.loseClues);
      state.stats.shredLosses++;
    }
    return { won: !!result.won, deltas: deltas };
  }
  function shredderSetup(state) {
    return { slowMult: 1 - modifiers(state).shredSlowPct / 100 };
  }

  /* ---------------- Pagamento manual (item 16) ---------------- */
  function payBill(state, id) {
    var bill = state.bills.filter(function (b) {
      return b.id === id;
    })[0];
    if (!bill || bill.owed <= 0) return { error: "nothingToPay" };
    if (state.money < bill.owed) return { error: "noMoney", owed: bill.owed };
    var paid = bill.owed;
    state.money -= paid;
    bill.owed = 0;
    bill.lateWeeks = 0;
    return { paid: paid };
  }

  /* ---------------- Imóvel e upgrades (item 12) ---------------- */
  function nextPropertyCost(state) {
    var levels = C().property.levels;
    return state.property < levels.length ? levels[state.property].cost : null;
  }
  function upgradeProperty(state) {
    var cost = nextPropertyCost(state);
    if (cost === null) return { error: "max" };
    if (state.money < cost) return { error: "noMoney" };
    var before = maxActions(state);
    state.money -= cost;
    state.property++;
    state.actions += Math.max(0, maxActions(state) - before);
    return { level: state.property, cost: cost };
  }
  function upgradeBlocker(state, id) {
    var u = upgradeConfig(id);
    var lvl = upgradeLevel(state, id);
    if (lvl >= u.cost.length) return "max";
    if (u.requires && u.requires.property && state.property < u.requires.property) return "property";
    if (state.money < u.cost[lvl]) return "money";
    return null;
  }
  function buyUpgrade(state, id) {
    var blocker = upgradeBlocker(state, id);
    if (blocker) return { error: blocker };
    var u = upgradeConfig(id);
    var lvl = upgradeLevel(state, id);
    var before = maxActions(state);
    state.money -= u.cost[lvl];
    state.upgrades[id] = lvl + 1;
    state.actions += Math.max(0, maxActions(state) - before);
    return { level: lvl + 1, cost: u.cost[lvl] };
  }

  /* ---------------- Fim da semana ---------------- */
  function runPayroll(state, report) {
    var due = payroll(state);
    while (due > state.money && due > 0) {
      var top = null;
      C().upgrades.list.forEach(function (u) {
        var lvl = upgradeLevel(state, u.id);
        if (u.salary && lvl > 0 && (!top || u.salary[lvl - 1] > top.salary[upgradeLevel(state, top.id) - 1])) top = u;
      });
      if (!top) break;
      state.upgrades[top.id]--;
      report.fired.push(top.id);
      due = payroll(state);
    }
    state.money -= due;
    report.salaries = due;
  }
  function runPostTails(state, report) {
    var rates = C().posts.tailRates;
    state.posts.forEach(function (p) {
      if (p.tailLeft <= 0 || p.debunked) return;
      var rate = rates[rates.length - p.tailLeft] * p.tailMult;
      var money = Math.round(p.money * rate);
      p.views += Math.round(p.views * rate * 0.5);
      p.earned += money;
      p.tailLeft--;
      report.tailMoney += money;
    });
    state.money += report.tailMoney;
    var gone = state.posts.filter(function (p) {
      return p.tailLeft <= 0;
    });
    state.archive = gone
      .map(function (p) {
        return { id: p.id, text: p.text, money: p.money, views: p.views, week: p.week, fake: p.fake, parts: p.parts, stickers: p.stickers };
      })
      .concat(state.archive)
      .slice(0, 20);
    state.posts = state.posts.filter(function (p) {
      return p.tailLeft > 0;
    });
  }
  function runBills(state, report) {
    state.bills.forEach(function (bill) {
      if (bill.owed <= 0 || state.week < bill.dueWeek) return;
      bill.lateWeeks++;
      if (bill.lateWeeks === 1) {
        var fee = Math.round(bill.owed * C().bills.lateFee);
        bill.owed += fee;
        report.fees.push({ id: bill.id, fee: fee });
      }
      if (bill.lateWeeks >= billConfig(bill.id).cutAfter && !report.ending) report.ending = bill.id;
    });
  }
  function runDrifts(state, report) {
    var p = C().police;
    var mods = modifiers(state);
    var fakeHot = state.posts.filter(function (post) {
      return post.fake && !post.debunked;
    }).length;
    var channel = p.channelHeat * Math.max(0, Math.log10(Math.max(state.followers, 1)) - 3);
    var heat = changePolice(state, fakeHot * p.heatPerFakePost + channel);
    var cool = changePolice(state, -p.weeklyCooldown * (state.clues >= p.maxClues ? p.maxCluesCooldownMult : 1));
    report.police = heat + cool;
    report.followers = changeFollowers(state, (state.followers * weeklyFollowerDriftPct(state)) / 100);
    report.rep = changeReputation(state, mods.repPerWeek);
  }
  function endWeek(state) {
    var report = { week: state.week, salaries: 0, fired: [], tailMoney: 0, fees: [], police: 0, followers: 0, rep: 0, ending: null };
    runPayroll(state, report);
    runPostTails(state, report);
    runBills(state, report);
    if (report.ending) {
      state.over = report.ending;
      return report;
    }
    runDrifts(state, report);
    state.week++;
    state.stats.weeks++;
    if (isMonthStart(state.week)) issueMonthlyBills(state);
    state.actions = maxActions(state);
    state.shredCooldown = Math.max(0, state.shredCooldown - 1);
    checkPrison(state);
    report.ending = state.over;
    return report;
  }
  function checkPrison(state) {
    if (!state.over && state.police >= C().police.prisonAt) state.over = "prisao";
    return state.over;
  }

  /* ---------------- Eventos ---------------- */
  var GENERIC_EVENTS = ["patrocinio", "meme", "tv", "hacker", "tiaZap", "podcast", "sindico"];
  var NEEDS_AUDIENCE = { meme: true, tv: true, tiaZap: true, podcast: true, sindico: true };

  function pickGeneric(state, rng) {
    var pool = GENERIC_EVENTS.filter(function (id) {
      return !NEEDS_AUDIENCE[id] || state.stats.publications > 0;
    });
    return { id: U.pick(pool, rng) };
  }
  function rollEvent(state, moment, rng) {
    var ev = C().events;
    var p = C().police;
    rng = rng || Math.random;
    if (moment === "publish") return rng() < ev.chanceAfterPublish ? pickGeneric(state, rng) : null;
    if (state.police >= p.eventThresholdCritical && rng() < 0.5) return { id: "viatura" };
    if (state.police >= p.eventThresholdHigh && rng() < 0.3) return { id: "reporter" };
    for (var i = 0; i < state.posts.length; i++) {
      var post = state.posts[i];
      if (post.fake && !post.debunked && !post.checked && post.views >= ev.factCheckMinViews && rng() < ev.factCheckChance) {
        post.checked = true;
        return { id: "factCheck", postId: post.id };
      }
    }
    var old = state.archive.filter(function (a) {
      return state.week - a.week >= ev.ghostMinAge;
    });
    if (old.length && rng() < ev.ghostChance) return { id: "ghost", postId: U.pick(old, rng).id };
    return rng() < ev.chanceWeekly ? pickGeneric(state, rng) : null;
  }
  function findPost(list, id) {
    return list.filter(function (p) {
      return p.id === id;
    })[0];
  }
  function applyEventChoice(state, event, choiceIndex) {
    var options = C().events.effects[event.id];
    var eff = options[U.clamp(choiceIndex, 0, options.length - 1)];
    var deltas = { money: 0, followers: 0, police: 0, rep: 0 };
    if (eff.money) {
      var amount = Math.round((eff.money * billScale(state.property)) / 10) * 10;
      if (amount < 0 && state.money < -amount && eff.ifBroke) eff = eff.ifBroke;
      else {
        state.money += amount;
        deltas.money = amount;
      }
    }
    if (eff.followersPct) deltas.followers = changeFollowers(state, Math.max(eff.followersMin || 0, (state.followers * eff.followersPct) / 100));
    if (eff.police) deltas.police = changePolice(state, eff.police);
    if (eff.rep) deltas.rep = changeReputation(state, eff.rep);
    if (eff.deletePost)
      state.posts = state.posts.filter(function (p) {
        return p.id !== event.postId;
      });
    if (eff.revivePost) {
      var old = findPost(state.archive, event.postId);
      if (old) {
        state.archive = state.archive.filter(function (a) {
          return a !== old;
        });
        state.posts.unshift(Object.assign({}, old, { tailLeft: C().posts.tailRates.length, tailMult: 1, debunked: false, earned: old.money, week: state.week }));
      }
    }
    checkPrison(state);
    return deltas;
  }
  function eventPost(state, event) {
    return event.postId ? findPost(state.posts, event.postId) || findPost(state.archive, event.postId) : null;
  }

  EDM.Rules = {
    monthOf: monthOf,
    isMonthStart: isMonthStart,
    repTier: repTier,
    repViewMult: repViewMult,
    conversion: conversion,
    weeklyFollowerDriftPct: weeklyFollowerDriftPct,
    billConfig: billConfig,
    billCost: billCost,
    billScale: billScale,
    billStatus: billStatus,
    monthlyBillsTotal: monthlyBillsTotal,
    modifiers: modifiers,
    maxActions: maxActions,
    payroll: payroll,
    policeGainMult: policeGainMult,
    createState: createState,
    findCombo: findCombo,
    evaluateDraft: evaluateDraft,
    drawCrashPoint: drawCrashPoint,
    multAt: multAt,
    publish: publish,
    layLow: layLow,
    mazeSetup: mazeSetup,
    canShred: canShred,
    shred: shred,
    shredderSetup: shredderSetup,
    payBill: payBill,
    nextPropertyCost: nextPropertyCost,
    upgradeProperty: upgradeProperty,
    upgradeConfig: upgradeConfig,
    upgradeLevel: upgradeLevel,
    upgradeBlocker: upgradeBlocker,
    buyUpgrade: buyUpgrade,
    endWeek: endWeek,
    checkPrison: checkPrison,
    rollEvent: rollEvent,
    applyEventChoice: applyEventChoice,
    eventPost: eventPost,
  };
})(typeof window !== "undefined" ? window : globalThis);
