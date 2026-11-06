/* =====================================================================
   MINIJOGO: CRASH DA NOTÍCIA (item 5)
   A manchete decola como um aviãozinho de jornal. O ponto de queda é
   sorteado ANTES da decolagem (EDM.Rules.drawCrashPoint). Imprima antes
   do crash; se cair, a matéria é desmentida.
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var U = EDM.Util;

  var GHOST_SPEED = 2.5; // depois de imprimir, o avião segue rápido até cair (mostra onde cairia)
  var GHOST_MAX = 1.4; // segundos no máximo desse "replay"
  var reduceMotion = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas, ctx, W, H, dpr;
  var run = null;
  var stars = [];
  var clouds = [];

  function seedScenery() {
    stars = [];
    clouds = [];
    for (var i = 0; i < 60; i++) stars.push({ x: Math.random(), y: Math.random() * 0.7, r: 0.4 + Math.random(), p: Math.random() * 6.28, s: 0.3 + Math.random() * 0.7 });
    for (var c = 0; c < 6; c++) clouds.push({ x: Math.random(), y: 0.2 + Math.random() * 0.5, s: 0.6 + Math.random() * 0.9, v: 0.01 + Math.random() * 0.02 });
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(200, rect.width);
    H = Math.max(160, rect.height);
    dpr = Math.min(root.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* multiplicador → ponto na tela (sobe rápido no começo e desacelera) */
  function positionFor(m, takeoffFrac) {
    var bx = W * 0.12;
    var by = H * 0.8;
    var L = Math.log(m);
    var u = L / (L + 1.4);
    return {
      x: bx + (W * 0.8 - bx) * u + takeoffFrac * W * 0.05,
      y: by - (by - H * 0.27) * Math.pow(u, 1.25) - takeoffFrac * H * 0.03,
    };
  }
  function tier(m) {
    return m < 2 ? "is-low" : m <= 5 ? "is-mid" : "is-high";
  }
  function setStatus(kind, text) {
    D.$("crash-status").className = "crash__status is-" + kind;
    D.$("crash-status-text").textContent = text;
  }
  function setMult(m, cls) {
    var el = D.$("crash-mult");
    el.textContent = U.formatMult(m);
    el.className = "crash__mult" + (cls ? " " + cls : m >= 5 ? " is-high" : m >= 2 ? " is-mid" : "");
  }

  /* ---------- desenho ---------- */
  function drawScenery(now, dt) {
    ctx.clearRect(0, 0, W, H);
    var drift = run ? run.speed : 0;
    stars.forEach(function (s) {
      s.x -= dt * 0.004 * drift * s.s;
      if (s.x < 0) s.x += 1;
      ctx.globalAlpha = 0.25 + 0.55 * (reduceMotion ? 0.7 : 0.5 + 0.5 * Math.sin(now / 900 * s.s + s.p));
      ctx.fillStyle = "#dfe8ff";
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, 6.2832);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    clouds.forEach(function (cl) {
      cl.x -= dt * (cl.v + 0.06 * drift * cl.s);
      if (cl.x < -0.25) {
        cl.x = 1.2;
        cl.y = 0.2 + Math.random() * 0.5;
      }
      var cx = cl.x * W;
      var cy = cl.y * H;
      var sc = (cl.s * Math.min(W, 700)) / 700;
      ctx.fillStyle = "rgba(150, 175, 230, 0.08)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70 * sc, 16 * sc, 0, 0, 6.2832);
      ctx.ellipse(cx - 34 * sc, cy + 6 * sc, 42 * sc, 12 * sc, 0, 0, 6.2832);
      ctx.ellipse(cx + 38 * sc, cy + 5 * sc, 46 * sc, 12 * sc, 0, 0, 6.2832);
      ctx.fill();
    });
    ctx.strokeStyle = "rgba(120, 150, 220, 0.22)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.8 + 22);
    ctx.lineTo(W, H * 0.8 + 22);
    ctx.stroke();
  }

  function drawTrail() {
    var trail = run.trail;
    if (trail.length < 2 || run.trailAlpha <= 0) return;
    var base = H * 0.8 + 22;
    var col = run.phase === "crashed" && run.crashed ? "255, 77, 94" : "62, 224, 143";
    ctx.save();
    ctx.globalAlpha = run.trailAlpha;
    var g = ctx.createLinearGradient(0, H * 0.2, 0, base);
    g.addColorStop(0, "rgba(" + col + ", 0.22)");
    g.addColorStop(1, "rgba(" + col + ", 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, base);
    trail.forEach(function (p) {
      ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(trail[trail.length - 1].x, base);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(" + col + ", 1)";
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(" + col + ", 0.8)";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    trail.forEach(function (p) {
      ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    if (run.cashPos) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.arc(run.cashPos.x, run.cashPos.y, 6, 0, 6.2832);
      ctx.fill();
    }
    ctx.restore();
  }

  /* aviãozinho dobrado de jornal */
  function drawPlane(x, y, angleDeg, alpha, ghost) {
    var s = Math.max(0.7, Math.min(1.2, W / 700));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.scale(s, s);
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = ghost ? "#c9cbb8" : "#f3ead3";
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(-30, -16);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-30, 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = ghost ? "#a9ab98" : "#d9ccaa";
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-24, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(36,28,18,0.55)";
    ctx.lineWidth = 1;
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-22 + i * 6, -10 + i * 3);
      ctx.lineTo(10 - i * 4, -4 + i * 1.3);
      ctx.stroke();
    }
    ctx.fillStyle = "#b3121b";
    ctx.fillRect(-14, -9, 10, 3);
    if (!ghost && run && run.phase === "flying") {
      ctx.fillStyle = "rgba(255, 184, 74, " + (0.6 + 0.3 * Math.sin(performance.now() / 40)) + ")";
      ctx.beginPath();
      ctx.moveTo(-24, -2);
      ctx.lineTo(-40, 0);
      ctx.lineTo(-24, 3);
      ctx.fill();
    }
    ctx.restore();
  }

  function explode(x, y) {
    var colors = ["#f3ead3", "#ffd23f", "#ff4d5e", "#d9ccaa", "#ffffff"];
    var n = reduceMotion ? 14 : 44;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = 60 + Math.random() * 300;
      run.particles.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 40, life: 0, max: 0.6 + Math.random() * 0.7, w: 3 + Math.random() * 6, h: 2 + Math.random() * 4, rot: Math.random() * 6, color: colors[(Math.random() * colors.length) | 0] });
    }
  }
  function drawParticles(dt) {
    for (var i = run.particles.length - 1; i >= 0; i--) {
      var p = run.particles[i];
      p.life += dt;
      if (p.life >= p.max) {
        run.particles.splice(i, 1);
        continue;
      }
      p.vy += 380 * dt;
      p.vx *= 1 - 1.2 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += dt * 8;
      ctx.save();
      ctx.globalAlpha = 1 - p.life / p.max;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }

  /* ---------- ciclo ---------- */
  function step(now) {
    if (!run) return;
    var dt = Math.min((now - run.last) / 1000, 0.05);
    run.last = now;
    var cfg = EDM.CONFIG.crash;
    if (run.phase === "countdown") {
      run.countT += dt;
      D.$("crash-sub").textContent = "Decolagem em " + Math.max(0, cfg.countdown - run.countT).toFixed(1).replace(".", ",") + "s";
      var bp = positionFor(1, 0);
      run.pos = { x: bp.x, y: bp.y + (reduceMotion ? 0 : Math.sin(now / 260) * 1.5), a: 0 };
      if (run.countT >= cfg.countdown) startFlight();
    } else if (run.phase === "flying" || run.phase === "ghost") {
      run.flightT += dt * (run.phase === "ghost" ? GHOST_SPEED : 1);
      if (run.phase === "ghost") run.ghostT += dt;
      var tf = run.flightT < cfg.takeoff ? 1 - Math.pow(1 - run.flightT / cfg.takeoff, 3) : 1;
      var m = Math.min(EDM.Rules.multAt(run.flightT), run.crashPoint);
      if (run.phase === "flying") {
        run.mult = m;
        setMult(m);
        if (run.flightT >= cfg.takeoff) setStatus("flying", "Viralizando");
      }
      var pos = positionFor(m, tf);
      var wob = reduceMotion ? 0 : (Math.sin(run.flightT * 2.3) * 3 + Math.sin(run.flightT * 5.1) * 1.2) * tf;
      var py = pos.y + wob;
      run.trail.push({ x: pos.x, y: py });
      if (run.trail.length > 3000) run.trail.splice(0, 400);
      var ref = run.trail[Math.max(0, run.trail.length - 8)];
      var ang = run.flightT < cfg.takeoff ? -14 * tf : Math.atan2(py - ref.y, pos.x - ref.x) * 57.3;
      run.pos = { x: pos.x, y: py, a: U.clamp(ang, -38, 6) };
      run.speed = tf * (0.4 + Math.min(1, Math.log(m + 1) / 3));
      if (run.phase === "flying" && m >= cfg.maxMult) cashOut();
      else if (m >= run.crashPoint || (run.phase === "ghost" && run.ghostT >= GHOST_MAX)) crash();
    } else if (run.phase === "crashed") {
      run.speed *= Math.max(0, 1 - dt * 3);
      run.trailAlpha = Math.max(0.35, run.trailAlpha - dt * 0.5);
      if (run.fall) {
        run.fall.t += dt;
        run.fall.vy += 900 * dt;
        run.fall.x += run.fall.vx * dt;
        run.fall.y += run.fall.vy * dt;
        run.fall.rot = Math.min(100, run.fall.rot + 260 * dt);
      }
    }
    drawScenery(now, dt);
    drawTrail();
    drawParticles(dt);
    if (run.phase === "crashed") {
      if (run.fall && run.fall.t < 0.85) drawPlane(run.fall.x, run.fall.y, run.fall.rot, 1 - run.fall.t / 0.85, !run.crashed);
    } else {
      drawPlane(run.pos.x, run.pos.y, run.pos.a, Math.min(1, run.countT / 0.3), run.phase === "ghost");
    }
    run.raf = requestAnimationFrame(step);
  }

  function startFlight() {
    run.phase = "flying";
    run.trail = [];
    setStatus("flying", "Decolando");
    D.$("crash-sub").textContent = "";
    D.$("crash-cashout").disabled = false;
    D.$("crash-cashout").focus();
  }

  function cashOut() {
    if (!run || run.phase !== "flying") return;
    run.cashMult = Math.max(1, Math.floor(run.mult * 100) / 100);
    run.cashPos = { x: run.pos.x, y: run.pos.y };
    run.phase = "ghost";
    run.ghostT = 0;
    D.$("crash-cashout").disabled = true;
    setMult(run.cashMult, "is-cashed");
    setStatus("flying", "Impresso!");
    D.$("crash-sub").textContent = "Imprimiu em " + U.formatMult(run.cashMult);
    EDM.Audio.play("print");
    if (run.cashMult >= EDM.CONFIG.crash.maxMult) crash();
  }

  function crash() {
    var wasCashed = run.phase === "ghost";
    run.phase = "crashed";
    run.crashed = !wasCashed;
    run.fall = { x: run.pos.x, y: run.pos.y, vx: 140, vy: -90, rot: run.pos.a, t: 0 };
    explode(run.pos.x, run.pos.y);
    D.$("crash-cashout").disabled = true;
    var where = U.formatMult(run.crashPoint);
    if (wasCashed) {
      D.$("crash-sub").textContent = run.cashMult >= EDM.CONFIG.crash.maxMult ? "Hype máximo! Impressão automática." : "Imprimiu em " + U.formatMult(run.cashMult) + " · cairia em " + where;
      setStatus("crashed", "Impresso");
    } else {
      setMult(run.crashPoint, "is-crash");
      D.$("crash-sub").textContent = "Desmentida em " + where + "!";
      setStatus("crashed", "Desmentida");
      EDM.Audio.play("crash");
      if (!reduceMotion) {
        D.pulse(D.$("crash-stage"), "is-shake");
        D.pulse(D.$("crash-stage"), "is-flash");
      }
    }
    var outcome = { crashed: !wasCashed, mult: wasCashed ? run.cashMult : run.crashPoint, crashPoint: run.crashPoint };
    var resolve = run.resolve;
    setTimeout(function () {
      resolve(outcome);
    }, wasCashed ? 500 : 1100);
  }

  function renderHistory(history) {
    D.$("crash-history").innerHTML =
      '<span class="crash__history-label">Últimas:</span>' +
      (history.length
        ? history
            .map(function (m) {
              return '<span class="mchip ' + tier(m) + '">' + U.formatMult(m) + "</span>";
            })
            .join("")
        : '<span class="crash__history-label">nenhuma ainda</span>');
  }

  function onKey(event) {
    if (!run) return;
    if ((event.code === "Space" || event.key === "Enter") && run.phase === "flying") {
      event.preventDefault();
      cashOut();
    }
  }

  /* Abre o minijogo e resolve com { crashed, mult, crashPoint }. */
  function play(options) {
    return new Promise(function (resolve) {
      canvas = D.$("crash-canvas");
      ctx = canvas.getContext("2d");
      D.$("crash").hidden = false;
      D.$("crash-result").hidden = true;
      D.$("crash-controls").hidden = false;
      D.$("crash-headline").textContent = options.headline;
      D.$("crash-cashout").disabled = true;
      renderHistory(options.history || []);
      setMult(1);
      setStatus("countdown", "Preparando");
      seedScenery();
      resize();
      run = {
        resolve: resolve,
        crashPoint: EDM.Rules.drawCrashPoint(), // sorteado antes da decolagem
        phase: "countdown",
        countT: 0,
        flightT: 0,
        mult: 1,
        trail: [],
        trailAlpha: 1,
        particles: [],
        speed: 0,
        pos: positionFor(1, 0),
        last: performance.now(),
      };
      run.raf = requestAnimationFrame(step);
    });
  }

  /* Mostra o "AO VIVO" com o resultado da publicação; resolve ao continuar. */
  function showResult(result, history) {
    if (history) renderHistory(history);
    return new Promise(function (resolve) {
      var post = result.post;
      var d = result.deltas;
      var title = result.crashed ? "Matéria desmentida" : "Impresso em " + U.formatMult(post.mult);
      var cells = [
        ["Views", '<span id="live-views">0</span>', ""],
        ["Lucro", "+" + U.formatMoney(d.money), "is-good"],
        ["Seguidores", "+" + U.formatCompact(d.followers), "is-neutral"],
        ["Polícia", d.police > 0 ? "+" + Math.round(d.police) + "%" : "0%", d.police > 0 ? "is-bad" : "is-good"],
        ["Reputação", U.formatSigned(d.rep), d.rep >= 0 ? "is-good" : "is-bad"],
      ];
      var comments = U.shuffle(EDM.Content.comments).slice(0, 3);
      if (d.police >= 12) comments.push("alguém anotou o seu nome...");
      D.$("crash-result").innerHTML =
        '<p class="result__live">Ao vivo</p>' +
        '<p class="result__title ' + (result.crashed ? "is-bad" : "is-good") + '">' + title + "</p>" +
        '<div class="result__grid">' +
        cells
          .map(function (c) {
            return '<div class="result__cell"><small>' + c[0] + '</small><b class="' + c[2] + '">' + c[1] + "</b></div>";
          })
          .join("") +
        "</div>" +
        '<div class="result__comments" id="live-comments"></div>' +
        '<button type="button" class="btn btn--primary btn--lg" id="crash-continue">Continuar</button>';
      D.$("crash-controls").hidden = true;
      D.$("crash-result").hidden = false;
      EDM.Audio.play(result.crashed ? "lose" : "money");
      var t0 = performance.now();
      (function count(now) {
        var el = D.$("live-views");
        if (!el) return;
        var k = Math.min(1, (now - t0) / 1600);
        el.textContent = U.formatCompact(Math.floor(d.views * k));
        if (k < 1) requestAnimationFrame(count);
      })(t0);
      comments.forEach(function (text, i) {
        setTimeout(function () {
          var box = D.$("live-comments");
          if (box) box.insertAdjacentHTML("beforeend", "<div>" + D.escape(text) + "</div>");
        }, 350 + i * 450);
      });
      var btn = D.$("crash-continue");
      btn.focus();
      btn.addEventListener("click", function () {
        close();
        resolve();
      });
    });
  }

  function close() {
    if (run) cancelAnimationFrame(run.raf);
    run = null;
    D.$("crash").hidden = true;
  }

  document.addEventListener("keydown", onKey);
  root.addEventListener("resize", function () {
    if (run) resize();
  });
  D.$("crash-cashout").addEventListener("click", cashOut);

  /* leitura do voo atual para testes automatizados (console/Playwright) */
  function debug() {
    return { run: run };
  }

  EDM.Crash = { play: play, showResult: showResult, close: close, debug: debug };
})(window);
