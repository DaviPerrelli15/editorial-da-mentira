/* =====================================================================
   CONTROLADOR: guarda o estado da partida, chama as regras, abre os
   minijogos e manda a interface se redesenhar.
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var R = EDM.Rules;
  var D = EDM.Dom;
  var U = EDM.Util;
  var M = EDM.Modal;
  var T = EDM.Content;

  var state = null;
  var draft = null;
  var busy = false;

  /* ---------------- ciclo básico ---------------- */
  function newDraft() {
    return { parts: EDM.News.randomParts(), stickers: [] };
  }
  function render() {
    if (!state) return;
    EDM.Hud.render(state);
    EDM.Sidebar.render(state);
    var ev = EDM.Newsroom.render(state, draft);
    EDM.Stickers.render(state, draft, ev);
    EDM.Upgrades.render(state);
    EDM.Tabs.render(state, draft);
  }
  function commit() {
    if (!state) return;
    if (!state.over) EDM.Storage.save(state);
    render();
  }
  function ready() {
    return !busy && state && !state.over;
  }
  function narrate(key) {
    EDM.Newsroom.narrate(U.pick(T.narrator[key]));
  }
  function showScreen(id) {
    D.qsa(".screen").forEach(function (s) {
      s.classList.toggle("is-active", s.id === id);
    });
  }

  function start(loaded) {
    state = loaded || R.createState();
    draft = newDraft();
    busy = false;
    EDM.Hud.reset();
    EDM.Sidebar.reset();
    EDM.Newsroom.reset();
    EDM.Upgrades.reset();
    showScreen("screen-game");
    EDM.Tabs.select("redacao");
    commit();
    narrate(loaded ? "back" : "welcome");
  }

  function toMenu() {
    state = null;
    busy = false;
    showScreen("screen-start");
    EDM.Main.refreshStart();
  }

  /* Verifica fim de jogo depois de cada ação. Devolve true se acabou. */
  function checkEnding() {
    if (!state || !state.over) return false;
    busy = true;
    M.close();
    if (state.over === "prisao") EDM.Endings.prison(state);
    else EDM.Endings.show(state.over, state);
    return true;
  }

  function noActions() {
    narrate("noActions");
    M.toast("Sem ações nesta semana. Encerre a semana.", "bad", "bolt");
    EDM.Audio.play("alert");
  }

  /* ---------------- textos de efeito ---------------- */
  function deltaText(d) {
    var out = [];
    if (d.money) out.push((d.money > 0 ? "+" : "−") + U.formatMoney(Math.abs(d.money)).replace("−", ""));
    if (d.followers) out.push(U.formatSigned(d.followers) + " seguidores");
    if (d.police) out.push((d.police > 0 ? "+" : "−") + Math.abs(Math.round(d.police)) + "% polícia");
    if (d.rep) out.push(U.formatSigned(d.rep) + " reputação");
    if (d.clues) out.push((d.clues > 0 ? "+" : "−") + Math.abs(d.clues) + " pista do delegado (" + state.clues + "/" + EDM.CONFIG.police.maxClues + ")");
    return out.join(" · ");
  }
  function choiceEffectText(eff) {
    var out = [];
    if (eff.money) out.push((eff.money > 0 ? "+" : "−") + U.formatMoney(Math.abs(Math.round((eff.money * R.billScale(state.property)) / 10) * 10)).replace("−", ""));
    if (eff.followersPct) out.push("+" + eff.followersPct + "% seguidores");
    if (eff.police) out.push((eff.police > 0 ? "+" : "−") + Math.abs(eff.police) + "% polícia");
    if (eff.rep) out.push(U.formatSigned(eff.rep) + " reputação");
    if (eff.deletePost) out.push("a matéria sai do ar");
    if (eff.revivePost) out.push("a matéria volta a render");
    if (eff.ifBroke) out.push("sem dinheiro: +" + eff.ifBroke.police + "% polícia");
    return out.join(" · ");
  }

  /* ---------------- manchete ---------------- */
  function cycleSlot(slot) {
    if (!ready()) return;
    draft.parts[slot] = (draft.parts[slot] + 1) % EDM.News.parts[slot].length;
    EDM.Audio.play("click");
    render();
  }
  function shuffle() {
    if (!ready()) return;
    draft.parts = EDM.News.randomParts();
    EDM.Audio.play("click");
    render();
  }
  function toggleSticker(id) {
    if (!ready()) return;
    var i = draft.stickers.indexOf(id);
    if (i < 0) return addSticker(id);
    draft.stickers.splice(i, 1);
    EDM.Audio.play("click");
    render();
  }
  function addSticker(id) {
    if (!ready() || draft.stickers.indexOf(id) >= 0) return;
    if (draft.stickers.length >= EDM.CONFIG.maxStickers) {
      M.toast("Máximo de " + EDM.CONFIG.maxStickers + " adesivos por manchete. Descole um antes.", "bad", "sticker");
      return;
    }
    draft.stickers.push(id);
    EDM.Audio.play("stick");
    render();
  }
  function clearStickers() {
    if (!ready()) return;
    draft.stickers = [];
    render();
  }

  /* ---------------- publicar (crash) ---------------- */
  function publish() {
    if (!ready()) return;
    if (state.actions <= 0) return noActions();
    busy = true;
    var snapshot = { parts: draft.parts.slice(), stickers: draft.stickers.slice() };
    EDM.Crash.play({ headline: EDM.News.compose(snapshot.parts, snapshot.stickers), history: state.crashHistory })
      .then(function (outcome) {
        var result = R.publish(state, snapshot, outcome);
        EDM.Storage.save(state);
        render();
        if (result.crashed) narrate("crash");
        else if (!snapshot.stickers.length) narrate("clean");
        else narrate(result.combo ? "combo" : result.deltas.police >= 10 ? "risk" : "calm");
        return EDM.Crash.showResult(result, state.crashHistory);
      })
      .then(function () {
        draft = newDraft();
        busy = false;
        commit();
        if (!checkEnding()) maybeEvent("publish");
      });
  }

  /* ---------------- Ficar na Miúda (labirinto) ---------------- */
  function layLow() {
    if (!ready()) return;
    if (state.actions <= 0) return noActions();
    busy = true;
    EDM.Maze.play(R.mazeSetup(state), function (outcome) {
      var res = R.layLow(state, outcome);
      EDM.Storage.save(state);
      return deltaText(res.deltas) + (res.won ? " · fake news no ar rendem menos" : "");
    }).then(function (outcome) {
      busy = false;
      narrate(outcome.won ? "layLowWin" : "layLowLose");
      commit();
      checkEnding();
    });
  }

  /* ---------------- Queima de Arquivo ---------------- */
  function shred() {
    if (!ready()) return;
    if (!R.canShred(state)) {
      M.toast(state.actions <= 0 ? "Sem ações nesta semana." : "A fragmentadora esfria por mais " + state.shredCooldown + " semana(s).", "bad", "shredder");
      return;
    }
    busy = true;
    EDM.Shredder.play(R.shredderSetup(state), function (outcome) {
      var res = R.shred(state, outcome);
      EDM.Storage.save(state);
      return deltaText(res.deltas) || "O delegado não tinha pistas: nada mudou.";
    }).then(function (outcome) {
      busy = false;
      narrate(outcome.won ? "shredWin" : "shredLose");
      commit();
    });
  }

  /* ---------------- fim da semana ---------------- */
  function endWeek() {
    if (!ready()) return;
    if (state.actions > 0) {
      M.open({
        icon: "moon",
        title: "Encerrar a semana?",
        body: "<p>Você ainda tem <b>" + state.actions + " ação(ões)</b>. Elas não acumulam para a próxima semana.</p>",
        actions: [
          { label: "Encerrar mesmo assim", kind: "primary" },
          { label: "Voltar", kind: "ghost" },
        ],
      }).then(function (i) {
        if (i === 0) closeWeek();
      });
      return;
    }
    closeWeek();
  }
  function closeWeek() {
    var report = R.endWeek(state);
    EDM.Audio.play("click");
    commit();
    if (checkEnding()) return;
    if (report.tailMoney) M.toast("Publicações no ar renderam +" + U.formatMoney(report.tailMoney), "good", "coin");
    if (report.salaries) M.toast("Folha da equipe: −" + U.formatMoney(report.salaries), "bad", "users");
    report.fired.forEach(function (id) {
      M.toast(T.upgrades[id].name + " pediu demissão (sem salário).", "bad", "user");
    });
    report.fees.forEach(function (f) {
      M.toast(T.bills[f.id].name + " atrasada: multa de " + U.formatMoney(f.fee) + ".", "bad", "warning");
    });
    if (R.isMonthStart(state.week)) M.toast("Mês " + R.monthOf(state.week) + ": chegaram as contas novas.", null, "receipt");
    narrate("week");
    maybeEvent("week");
  }

  /* ---------------- eventos ---------------- */
  function maybeEvent(moment) {
    if (!ready()) return;
    var ev = R.rollEvent(state, moment);
    if (!ev) return;
    var text = T.events[ev.id];
    var post = R.eventPost(state, ev);
    var effects = EDM.CONFIG.events.effects[ev.id];
    busy = true;
    EDM.Audio.play("alert");
    M.open({
      icon: text.icon,
      title: text.title,
      body: "<p>" + text.text + "</p>" + (post ? "<blockquote>" + D.escape(post.text) + "</blockquote>" : ""),
      actions: text.choices.map(function (label, i) {
        return { label: label, sub: choiceEffectText(effects[i]), kind: i === 0 ? "primary" : "secondary" };
      }),
      dismissable: false,
    }).then(function (i) {
      busy = false;
      var deltas = R.applyEventChoice(state, ev, Math.max(0, i));
      var summary = deltaText(deltas);
      if (summary) M.toast(summary, null, text.icon);
      commit();
      checkEnding();
    });
  }

  /* ---------------- contas, imóvel e upgrades ---------------- */
  function payBill(id) {
    if (!ready()) return;
    var res = R.payBill(state, id);
    if (res.error === "noMoney") {
      EDM.Audio.play("alert");
      M.toast("Falta " + U.formatMoney(res.owed - state.money) + " para pagar " + T.bills[id].name + ".", "bad", "money");
      return;
    }
    if (res.error) return;
    EDM.Audio.play("money");
    M.float("−" + U.formatMoney(res.paid), "var(--danger)");
    M.toast(T.bills[id].name + " paga: " + U.formatMoney(res.paid) + ".", "good", "check");
    commit();
  }

  function upgradeProperty() {
    if (!ready()) return;
    var res = R.upgradeProperty(state);
    if (res.error) return;
    var theme = EDM.Assets.property();
    var level = theme.levels[res.level - 1];
    var perk = EDM.CONFIG.property.levels[res.level - 1].perk;
    EDM.Audio.play("win");
    commit();
    M.open({
      icon: "home",
      title: theme.label + " nova!",
      body:
        "<p>Agora você está em: <b>" + level.name + "</b>.</p>" +
        "<p>Vantagem: " + Object.keys(perk).map(function (k) { return T.perkLabels[k].replace("{v}", perk[k]); }).join(" · ") + ".</p>" +
        "<p>Atenção: a partir do próximo mês as contas somam <b>" + U.formatMoney(R.monthlyBillsTotal(res.level)) + "</b>.</p>",
      actions: [{ label: "Ostentação!", kind: "primary" }],
    });
  }

  function buyUpgrade(id) {
    if (!ready()) return;
    var u = R.upgradeConfig(id);
    var res = R.buyUpgrade(state, id);
    if (res.error === "money") {
      EDM.Audio.play("alert");
      M.toast("Falta " + U.formatMoney(u.cost[R.upgradeLevel(state, id)] - state.money) + " para esse upgrade.", "bad", "money");
      return;
    }
    if (res.error) return;
    EDM.Audio.play("money");
    var text = T.upgrades[id];
    var model = text.models ? text.models[Math.min(res.level - 1, text.models.length - 1)] : text.name;
    M.toast("Comprado: " + model + ".", "good", text.icon);
    EDM.Newsroom.narrate("Bastidores reforçados: " + model + ".");
    commit();
  }

  /* ---------------- informações (fórmulas claras, item 11) ---------------- */
  function pct(v, digits) {
    return (v * 100).toFixed(digits === undefined ? 1 : digits).replace(".", ",") + "%";
  }
  function signedPct(v) {
    return (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(1).replace(".", ",") + "%";
  }
  function repInfo() {
    var C = EDM.CONFIG;
    var rep = Math.round(state.reputation);
    var tier = R.repTier(rep);
    var f = C.followers;
    var r = C.reputation;
    M.open({
      icon: "star",
      title: "Reputação " + rep + "/100 (" + tier.label + ")",
      body:
        "<p>A reputação muda quantas pessoas leem e quantas passam a te seguir:</p>" +
        '<span class="formula">Views × (' + String(r.viewMultAtZero).replace(".", ",") + " + reputação/100) = <b>×" + R.repViewMult(rep).toFixed(2).replace(".", ",") + "</b></span>" +
        '<span class="formula">Conversão em seguidores = ' + pct(f.convAtZero) + " + " + pct(f.convAtMax - f.convAtZero) + " × reputação/100 = <b>" + pct(R.conversion(rep), 2) + "</b> de quem lê</span>" +
        '<span class="formula">Seguidores por semana = (reputação − ' + f.driftPivot + ") × " + pct(f.weeklyDriftPerPoint, 2) + " = <b>" + signedPct(R.weeklyFollowerDriftPct(state)) + "</b></span>" +
        "<p><b>Sobe com:</b> notícia sem adesivo (+1 a +" + r.cleanNewsGain + "), Ficar na Miúda vencido (+" + r.layLowGain + "), Curso de checagem.</p>" +
        "<p><b>Cai com:</b> Cura Milagrosa (−" + C.stickers["cura-milagrosa"].repCost + "), Culpa dos Alienígenas (−" + C.stickers["culpa-dos-alienigenas"].repCost + "), Compartilhe Agora (−" + C.stickers["compartilhe-agora"].repCost + ") e matéria desmentida no crash (−" + r.debunkLoss + ").</p>",
      actions: [{ label: "Entendi", kind: "primary" }],
    });
  }
  function followersInfo() {
    var ev = R.evaluateDraft(state, draft);
    M.open({
      icon: "users",
      title: U.formatInt(state.followers) + " seguidores",
      body:
        "<p>Seguidores aumentam as views de cada publicação, e views viram dinheiro.</p>" +
        '<span class="formula">Ganho por publicação = views × conversão(' + pct(R.conversion(state.reputation), 2) + ") ÷ (1 + seguidores/" + U.formatCompact(EDM.CONFIG.followers.softCap) + ")</span>" +
        '<span class="formula">Manchete atual: ~' + U.formatCompact(ev.views) + " views → <b>+" + U.formatInt(Math.round(ev.followersGain)) + " seguidores</b></span>" +
        "<p>Clique em Reputação para ver como ela mexe nesse cálculo.</p>",
      actions: [{ label: "Ok", kind: "primary" }],
    });
  }
  function rules() {
    return M.open({
      icon: "help",
      title: "Como jogar",
      body: "<ul>" + T.rules.map(function (r) {
        return "<li>" + D.icon("check") + "<span>" + r + "</span></li>";
      }).join("") + "</ul>",
      actions: [{ label: "Bora mentir", kind: "primary" }],
    });
  }
  function menu() {
    if (busy) return;
    var soundOn = EDM.Audio.isEnabled();
    M.open({
      icon: "menu",
      title: "Menu",
      body: "<p>O jogo é salvo automaticamente a cada ação.</p>",
      actions: [
        { label: "Continuar jogando", kind: "primary" },
        { label: "Como jogar", kind: "secondary" },
        { label: soundOn ? "Desligar som" : "Ligar som", kind: "secondary" },
        { label: "Sair para o menu", kind: "ghost" },
      ],
    }).then(function (i) {
      if (i === 1) rules();
      else if (i === 2) {
        EDM.Audio.setEnabled(!soundOn);
        EDM.Storage.setSound(!soundOn);
        M.toast(soundOn ? "Som desligado." : "Som ligado.", null, soundOn ? "soundOff" : "soundOn");
      } else if (i === 3) toMenu();
    });
  }

  EDM.Game = {
    start: start,
    toMenu: toMenu,
    render: render,
    cycleSlot: cycleSlot,
    shuffle: shuffle,
    toggleSticker: toggleSticker,
    addSticker: addSticker,
    clearStickers: clearStickers,
    publish: publish,
    layLow: layLow,
    shred: shred,
    endWeek: endWeek,
    payBill: payBill,
    upgradeProperty: upgradeProperty,
    buyUpgrade: buyUpgrade,
    repInfo: repInfo,
    followersInfo: followersInfo,
    rules: rules,
    menu: menu,
    /* acesso de leitura para testes automatizados e depuração no console */
    debug: function () {
      return { state: state, draft: draft, busy: busy };
    },
  };
})(window);
