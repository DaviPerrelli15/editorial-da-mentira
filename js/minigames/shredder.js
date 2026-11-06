/* =====================================================================
   MINIJOGO: QUEIMA DE ARQUIVO (itens 22 e 23)
   Ativado quando o jogador quiser (recarga de algumas semanas).
   Papéis caem: toque nas PROVAS antes que cheguem à mesa do delegado e
   deixe os papéis inocentes passarem. Vitória tira 1 pista; derrota dá 1.
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;

  var EVIDENCE = ["Rascunho da fake", "Planilha de cliques", "Print apagado", "Recibo da gráfica", "Áudio transcrito"];
  var INNOCENT = ["Receita de bolo", "Boleto pago", "Desenho do sobrinho", "Lista de compras", "Cardápio da pizzaria"];

  var canvas, ctx, W, H, dpr, cfg, game;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(240, rect.width);
    H = Math.max(260, rect.height);
    dpr = Math.min(root.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function progress() {
    return 1 - Math.max(0, game.time) / cfg.duration;
  }

  function spawn() {
    var evidence = Math.random() < cfg.evidenceShare;
    var list = evidence ? EVIDENCE : INNOCENT;
    var w = Math.min(120, W * 0.26);
    var speed = (cfg.fallSpeed + (cfg.fallSpeedMax - cfg.fallSpeed) * progress()) * game.slowMult;
    game.docs.push({
      x: w / 2 + 8 + Math.random() * (W - w - 16),
      y: -w * 0.7,
      w: w,
      h: w * 1.2,
      rot: (Math.random() - 0.5) * 0.35,
      vy: speed * H,
      evidence: evidence,
      label: list[Math.floor(Math.random() * list.length)],
    });
  }

  function loseLife(text) {
    game.lives--;
    D.$("shred-lives").textContent = Math.max(0, game.lives);
    game.flash = { text: text, t: 0.9 };
    EDM.Audio.play("alert");
    if (game.lives <= 0) end(false);
  }

  function update(dt) {
    game.time -= dt;
    D.$("shred-time").textContent = Math.max(0, Math.ceil(game.time));
    if (game.time <= 0) return end(true);
    game.spawnT -= dt;
    if (game.spawnT <= 0) {
      spawn();
      game.spawnT = cfg.spawnEvery - (cfg.spawnEvery - cfg.spawnEveryMin) * progress();
    }
    for (var i = game.docs.length - 1; i >= 0; i--) {
      var doc = game.docs[i];
      doc.y += doc.vy * dt;
      if (doc.y - doc.h / 2 > H - 40) {
        game.docs.splice(i, 1);
        if (doc.evidence) {
          loseLife("Uma prova chegou ao delegado!");
          if (game.state !== "play") return;
        }
      }
    }
    game.strips.forEach(function (s) {
      s.y += s.vy * dt;
      s.life -= dt;
    });
    game.strips = game.strips.filter(function (s) {
      return s.life > 0;
    });
    if (game.flash) game.flash.t -= dt;
  }

  function hit(px, py) {
    for (var i = game.docs.length - 1; i >= 0; i--) {
      var d = game.docs[i];
      if (Math.abs(px - d.x) < d.w / 2 + 6 && Math.abs(py - d.y) < d.h / 2 + 6) {
        game.docs.splice(i, 1);
        if (d.evidence) {
          game.score++;
          D.$("shred-score").textContent = game.score;
          EDM.Audio.play("shred");
          for (var k = 0; k < 10; k++) game.strips.push({ x: d.x - d.w / 2 + (k * d.w) / 10, y: d.y, vy: 160 + Math.random() * 120, life: 0.6, w: d.w / 12 });
        } else {
          loseLife("Isso era inocente: " + d.label.toLowerCase() + "!");
        }
        return;
      }
    }
  }

  /* ---------- desenho ---------- */
  function drawDoc(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = d.evidence ? "#f3ead3" : "#eef4f7";
    ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(36,28,18,0.35)";
    for (var i = 0; i < 6; i++) ctx.fillRect(-d.w / 2 + 10, -d.h / 2 + 26 + i * 10, d.w - 20 - (i % 3) * 12, 3);
    ctx.fillStyle = "#241c12";
    ctx.font = "700 " + Math.round(d.w * 0.1) + "px Barlow, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(d.label, 0, -d.h / 2 + 16, d.w - 10);
    if (d.evidence) {
      ctx.rotate(-0.25);
      ctx.strokeStyle = "#c4161f";
      ctx.lineWidth = 3;
      ctx.strokeRect(-d.w * 0.36, d.h * 0.08, d.w * 0.72, d.h * 0.22);
      ctx.fillStyle = "#c4161f";
      ctx.font = "800 " + Math.round(d.w * 0.17) + "px 'Barlow Condensed', sans-serif";
      ctx.fillText("PROVA", 0, d.h * 0.25);
    } else {
      ctx.fillStyle = "#2e86de";
      ctx.font = "700 " + Math.round(d.w * 0.12) + "px Barlow, sans-serif";
      ctx.fillText("inocente", 0, d.h * 0.3);
    }
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#2a1f17");
    g.addColorStop(1, "#4a3424");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (var y = 0; y < H; y += 22) ctx.fillRect(0, y, W, 1);
    game.docs.forEach(drawDoc);
    ctx.fillStyle = "#c9c2b3";
    game.strips.forEach(function (s) {
      ctx.globalAlpha = Math.max(0, s.life / 0.6);
      ctx.fillRect(s.x, s.y, s.w, 14);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#1a1d26";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = "#c4161f";
    ctx.fillRect(0, H - 40, W, 4);
    ctx.fillStyle = "#e8eaf2";
    ctx.font = "700 13px Barlow, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MESA DO DELEGADO", W / 2, H - 15);
    if (game.flash && game.flash.t > 0) {
      ctx.globalAlpha = Math.min(1, game.flash.t * 2);
      ctx.fillStyle = "rgba(196,22,31,0.85)";
      ctx.fillRect(0, H / 2 - 22, W, 44);
      ctx.fillStyle = "#fff";
      ctx.font = "800 16px Barlow, sans-serif";
      ctx.fillText(game.flash.text, W / 2, H / 2 + 6);
      ctx.globalAlpha = 1;
    }
  }

  function loop(now) {
    if (!game) return;
    var dt = Math.min(0.05, (now - game.last) / 1000);
    game.last = now;
    if (game.state === "play") update(dt);
    if (game) {
      draw();
      game.raf = requestAnimationFrame(loop);
    }
  }

  function showOverlay(html, label, onClick) {
    var box = D.$("shred-overlay");
    box.innerHTML = html + '<button type="button" class="btn btn--primary btn--lg" id="shred-go">' + label + "</button>";
    var btn = D.$("shred-go");
    btn.addEventListener("click", onClick);
    btn.focus();
  }
  function end(won) {
    if (game.state !== "play") return;
    game.state = "over";
    game.outcome = { won: won };
    EDM.Audio.play(won ? "win" : "lose");
    var detail = game.onEnd ? game.onEnd(game.outcome) : "";
    showOverlay(
      '<h3 class="' + (won ? "is-win" : "is-lose") + '">' + (won ? "Arquivo queimado!" : "Sobrou prova!") + "</h3><p>" + (won ? "Você triturou " + game.score + " provas." : "O delegado recebeu o que precisava.") + "</p><p><b>" + detail + "</b></p>",
      "Continuar",
      function () {
        var resolve = game.resolve;
        var outcome = game.outcome;
        close();
        resolve(outcome);
      },
    );
  }

  /* setup = { slowMult }; onEnd(outcome) aplica as regras e devolve o texto do efeito. */
  function play(setup, onEnd) {
    return new Promise(function (resolve) {
      cfg = EDM.CONFIG.shredder;
      canvas = D.$("shred-canvas");
      ctx = canvas.getContext("2d");
      D.$("shred").hidden = false;
      resize();
      game = { state: "intro", time: cfg.duration, lives: cfg.lives, score: 0, spawnT: 0.3, docs: [], strips: [], slowMult: setup.slowMult, resolve: resolve, onEnd: onEnd, last: performance.now() };
      D.$("shred-lives").textContent = cfg.lives;
      D.$("shred-score").textContent = "0";
      D.$("shred-time").textContent = cfg.duration;
      showOverlay("<h3>Queima de arquivo</h3><p>Toque nas provas com carimbo vermelho. Deixe os papéis inocentes caírem. " + cfg.lives + " erros e acabou.</p>", "Ligar a fragmentadora", function () {
        D.$("shred-overlay").innerHTML = "";
        game.state = "play";
        game.last = performance.now();
      });
      game.raf = requestAnimationFrame(loop);
    });
  }
  function close() {
    if (game) cancelAnimationFrame(game.raf);
    game = null;
    D.$("shred").hidden = true;
    D.$("shred-overlay").innerHTML = "";
  }

  D.$("shred-canvas").addEventListener("pointerdown", function (e) {
    if (!game || game.state !== "play") return;
    var rect = canvas.getBoundingClientRect();
    hit(((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H);
  });
  root.addEventListener("resize", function () {
    if (game) resize();
  });

  /* leitura/ajuste do estado interno para testes automatizados (console/Playwright) */
  function debug() {
    return { game: game };
  }

  EDM.Shredder = { play: play, close: close, debug: debug };
})(window);
