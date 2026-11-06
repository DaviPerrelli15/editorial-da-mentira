/* =====================================================================
   MINIJOGO: LABIRINTO DO "FICAR NA MIÚDA" (itens 4, 17, 18, 23)
   Fuja até o esconderijo sem entrar no cone de visão dos guardas.
   Cada pista do delegado coloca mais um guarda; com 2+ pistas o próprio
   Delegado Amaral entra no labirinto (mais rápido).
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});
  var D = EDM.Dom;
  var DIRS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  var KEY_DIR = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
  var CELL = 24; // resolução interna do canvas por célula (o CSS escala)

  var canvas, ctx, cfg, grid, cols, rows, player, guards, game, held, drag;

  function isWall(px, py) {
    var c = Math.floor(px / CELL);
    var r = Math.floor(py / CELL);
    return r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === 1;
  }
  function isFree(x, y, rad) {
    return !(isWall(x - rad, y - rad) || isWall(x + rad, y - rad) || isWall(x - rad, y + rad) || isWall(x + rad, y + rad));
  }
  function angDiff(a, b) {
    var d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  /* ---------- geração (backtracking + atalhos para criar ciclos) ---------- */
  function generate() {
    cols = cfg.cols;
    rows = cfg.rows;
    grid = [];
    for (var r = 0; r < rows; r++) grid.push(new Array(cols).fill(1));
    var stack = [[1, 1]];
    grid[1][1] = 0;
    while (stack.length) {
      var top = stack[stack.length - 1];
      var options = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ].filter(function (d) {
        var nx = top[0] + d[0];
        var ny = top[1] + d[1];
        return nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && grid[ny][nx] === 1;
      });
      if (!options.length) {
        stack.pop();
        continue;
      }
      var d = options[Math.floor(Math.random() * options.length)];
      grid[top[1] + d[1] / 2][top[0] + d[0] / 2] = 0;
      grid[top[1] + d[1]][top[0] + d[0]] = 0;
      stack.push([top[0] + d[0], top[1] + d[1]]);
    }
    for (var y = 1; y < rows - 1; y++)
      for (var x = 1; x < cols - 1; x++)
        if (grid[y][x] && Math.random() < cfg.shortcutChance) {
          var horizontal = x % 2 === 0 && y % 2 === 1 && !grid[y][x - 1] && !grid[y][x + 1];
          var vertical = y % 2 === 0 && x % 2 === 1 && !grid[y - 1][x] && !grid[y + 1][x];
          if (horizontal || vertical) grid[y][x] = 0;
        }
  }

  function spawnGuards(setup) {
    var cells = [];
    for (var y = 1; y < rows; y += 2) for (var x = 1; x < cols; x += 2) if (x + y > 12 && !(x === cols - 2 && y === rows - 2)) cells.push([x, y]);
    guards = [];
    for (var i = 0; i < setup.guards && cells.length; i++) {
      var cell = cells.splice(Math.floor(Math.random() * cells.length), 1)[0];
      guards.push(makeGuard(cell, false));
    }
    if (setup.delegado && cells.length) guards.push(makeGuard(cells.splice(Math.floor(Math.random() * cells.length), 1)[0], true));
  }
  function makeGuard(cell, isDelegado) {
    return { x: (cell[0] + 0.5) * CELL, y: (cell[1] + 0.5) * CELL, cx: cell[0], cy: cell[1], tx: cell[0], ty: cell[1], dx: 1, dy: 0, va: 0, mode: "patrol", lost: 0, last: null, delegado: isDelegado };
  }

  /* ---------- IA dos guardas (patrulha + perseguição com BFS) ---------- */
  function bfsNext(from, to) {
    var key = function (x, y) {
      return y * cols + x;
    };
    var prev = new Map([[key(from[0], from[1]), null]]);
    var queue = [from];
    while (queue.length) {
      var cur = queue.shift();
      if (cur[0] === to[0] && cur[1] === to[1]) break;
      DIRS.forEach(function (d) {
        var nx = cur[0] + d[0];
        var ny = cur[1] + d[1];
        if (!grid[ny][nx] && !prev.has(key(nx, ny))) {
          prev.set(key(nx, ny), cur);
          queue.push([nx, ny]);
        }
      });
    }
    var node = to;
    if (!prev.has(key(node[0], node[1]))) return null;
    for (;;) {
      var p = prev.get(key(node[0], node[1]));
      if (!p) return null;
      if (p[0] === from[0] && p[1] === from[1]) return node;
      node = p;
    }
  }
  function lineOfSight(x1, y1, x2, y2) {
    var dist = Math.hypot(x2 - x1, y2 - y1);
    var n = Math.ceil(dist / 4);
    for (var i = 1; i < n; i++) if (isWall(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n)) return false;
    return true;
  }
  function sees(g) {
    var dx = player.x - g.x;
    var dy = player.y - g.y;
    var dist = Math.hypot(dx, dy);
    if (dist > cfg.visionRange * CELL) return false;
    if (dist > CELL * 1.3 && Math.abs(angDiff(Math.atan2(dy, dx), g.va)) > cfg.visionFov / 2) return false;
    return lineOfSight(g.x, g.y, player.x, player.y);
  }
  function patrol(g) {
    var open = DIRS.filter(function (d) {
      return !grid[g.cy + d[1]][g.cx + d[0]];
    });
    var forward = open.filter(function (d) {
      return !(d[0] === -g.dx && d[1] === -g.dy);
    });
    if (!forward.length) forward = open;
    var straight = forward.filter(function (d) {
      return d[0] === g.dx && d[1] === g.dy;
    })[0];
    var d = straight && Math.random() < 0.7 ? straight : forward[Math.floor(Math.random() * forward.length)];
    g.dx = d[0];
    g.dy = d[1];
    g.tx = g.cx + d[0];
    g.ty = g.cy + d[1];
  }
  function pickNext(g) {
    if (g.mode === "chase" && g.last && !(g.cx === g.last[0] && g.cy === g.last[1])) {
      var next = bfsNext([g.cx, g.cy], g.last);
      if (next) {
        g.dx = next[0] - g.cx;
        g.dy = next[1] - g.cy;
        g.tx = next[0];
        g.ty = next[1];
        return;
      }
    }
    patrol(g);
  }

  /* ---------- atualização ---------- */
  function inputVector() {
    var vx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    var vy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    if (drag && drag.active && Math.hypot(drag.vx, drag.vy) > 0.25) {
      vx = drag.vx;
      vy = drag.vy;
    }
    var len = Math.hypot(vx, vy);
    return len ? [vx / len, vy / len] : [0, 0];
  }

  function update(dt) {
    game.time -= dt;
    D.$("maze-time").textContent = Math.max(0, Math.ceil(game.time));
    if (game.time <= 0) return end(false, "A viatura chegou antes de você se esconder.");
    var v = inputVector();
    var step = cfg.playerSpeed * game.speedMult * CELL * dt;
    if (v[0] && isFree(player.x + v[0] * step, player.y, player.r)) player.x += v[0] * step;
    if (v[1] && isFree(player.x, player.y + v[1] * step, player.r)) player.y += v[1] * step;
    var pc = [Math.floor(player.x / CELL), Math.floor(player.y / CELL)];
    for (var i = 0; i < guards.length; i++) {
      var g = guards[i];
      if (g.tx === g.cx && g.ty === g.cy) pickNext(g);
      if (sees(g)) {
        if (g.mode !== "chase") EDM.Audio.play("alert");
        g.mode = "chase";
        g.lost = 0;
        g.last = pc.slice();
      } else if (g.mode === "chase") {
        g.lost += dt;
        if (g.lost > cfg.loseSight) {
          g.mode = "patrol";
          g.last = null;
        }
      }
      var speed = (g.delegado ? cfg.delegadoSpeed : g.mode === "chase" ? cfg.chaseSpeed : cfg.guardSpeed) * CELL * dt;
      var tx = (g.tx + 0.5) * CELL;
      var ty = (g.ty + 0.5) * CELL;
      var dist = Math.hypot(tx - g.x, ty - g.y);
      if (dist <= speed) {
        g.x = tx;
        g.y = ty;
        g.cx = g.tx;
        g.cy = g.ty;
        pickNext(g);
      } else {
        g.x += ((tx - g.x) / dist) * speed;
        g.y += ((ty - g.y) / dist) * speed;
      }
      g.va += angDiff(Math.atan2(g.dy, g.dx), g.va) * Math.min(1, dt * 8);
      if (Math.hypot(player.x - g.x, player.y - g.y) < player.r + CELL * 0.3) return end(false, g.delegado ? "O próprio Delegado Amaral te pegou pelo capuz." : "Um guarda te reconheceu pela foto do perfil.");
    }
    if (pc[0] === cols - 2 && pc[1] === rows - 2) end(true, "Você chegou ao esconderijo. Ninguém te viu.");
  }

  /* ---------- desenho ---------- */
  function draw() {
    for (var y = 0; y < rows; y++)
      for (var x = 0; x < cols; x++) {
        if (grid[y][x]) {
          ctx.fillStyle = "#2b3358";
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
          ctx.fillStyle = "#3a4472";
          ctx.fillRect(x * CELL, y * CELL, CELL, 3);
          ctx.fillStyle = "#1d2340";
          ctx.fillRect(x * CELL, y * CELL + CELL - 3, CELL, 3);
        } else {
          ctx.fillStyle = (x + y) % 2 ? "#171b2d" : "#1a1f33";
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
    var ex = (cols - 2) * CELL;
    var ey = (rows - 2) * CELL;
    ctx.fillStyle = "#1fd67a";
    ctx.shadowColor = "#1fd67a";
    ctx.shadowBlur = 16;
    ctx.fillRect(ex + 4, ey + 4, CELL - 8, CELL - 8);
    ctx.shadowBlur = 0;
    guards.forEach(drawCone);
    guards.forEach(drawGuard);
    ctx.fillStyle = "#5aa0ff";
    ctx.shadowColor = "#5aa0ff";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, 6.2832);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#1d3b8f";
    ctx.beginPath();
    ctx.arc(player.x, player.y - player.r * 0.25, player.r * 0.75, Math.PI, 0);
    ctx.fill();
  }
  function drawCone(g) {
    var range = cfg.visionRange * CELL;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    for (var i = 0; i <= 24; i++) {
      var a = g.va - cfg.visionFov / 2 + (cfg.visionFov * i) / 24;
      var r = 0;
      while (r < range && !isWall(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r)) r += 3;
      ctx.lineTo(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = g.mode === "chase" ? "rgba(255,60,60,.42)" : "rgba(255,210,70,.34)";
    ctx.fill();
  }
  function drawGuard(g) {
    ctx.fillStyle = g.delegado ? "#7a1f2b" : g.mode === "chase" ? "#ff3b3b" : "#e0574b";
    ctx.beginPath();
    ctx.arc(g.x, g.y, CELL * 0.34, 0, 6.2832);
    ctx.fill();
    if (g.delegado) {
      ctx.fillStyle = "#141c2e";
      ctx.fillRect(g.x - CELL * 0.36, g.y - CELL * 0.42, CELL * 0.72, CELL * 0.22);
      ctx.fillStyle = "#f2c14e";
      ctx.fillRect(g.x - 2, g.y - CELL * 0.4, 4, 4);
    }
    ctx.fillStyle = "#fff";
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.arc(g.x + Math.cos(g.va) * 5 + Math.cos(g.va + 1.57) * 3.5 * side, g.y + Math.sin(g.va) * 5 + Math.sin(g.va + 1.57) * 3.5 * side, 2.2, 0, 6.2832);
      ctx.fill();
    });
    if (g.mode === "chase") {
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", g.x, g.y - CELL * 0.5);
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

  /* ---------- telas internas ---------- */
  function showOverlay(html, buttonLabel, onClick) {
    var box = D.$("maze-overlay");
    box.innerHTML = html + '<button type="button" class="btn btn--primary btn--lg" id="maze-go">' + buttonLabel + "</button>";
    var btn = D.$("maze-go");
    btn.addEventListener("click", onClick);
    btn.focus();
  }
  function intro(setup) {
    var extra = setup.delegado ? " O próprio <b>Delegado Amaral</b> está no labirinto, e ele é rápido." : "";
    showOverlay(
      "<h3>Fuja do bairro</h3><p>" + setup.guards + " guarda(s) patrulhando." + extra + " Você tem " + cfg.timeLimit + " segundos para chegar ao esconderijo verde.</p>",
      "Começar",
      function () {
        D.$("maze-overlay").innerHTML = "";
        game.state = "play";
        game.last = performance.now();
      },
    );
  }
  function end(won, reason) {
    if (game.state !== "play") return;
    game.state = "over";
    game.outcome = { won: won, timeLeftFrac: Math.max(0, game.time) / cfg.timeLimit };
    EDM.Audio.play(won ? "win" : "lose");
    var detail = game.onEnd ? game.onEnd(game.outcome) : "";
    showOverlay(
      '<h3 class="' + (won ? "is-win" : "is-lose") + '">' + (won ? "Você sumiu do mapa!" : "Você foi visto!") + "</h3><p>" + reason + "</p><p><b>" + detail + "</b></p>",
      "Continuar",
      function () {
        var resolve = game.resolve;
        var outcome = game.outcome;
        close();
        resolve(outcome);
      },
    );
  }

  /* ---------- controles ---------- */
  function onKeyDown(event) {
    if (!game) return;
    var dir = KEY_DIR[event.key];
    if (dir) {
      held[dir] = true;
      event.preventDefault();
    }
  }
  function onKeyUp(event) {
    var dir = KEY_DIR[event.key];
    if (dir && held) held[dir] = false;
  }
  function bindPad() {
    D.qsa("#maze-dpad [data-dir]").forEach(function (btn) {
      var dir = btn.dataset.dir;
      var on = function (e) {
        e.preventDefault();
        if (held) held[dir] = true;
        btn.classList.add("is-active");
      };
      var off = function () {
        if (held) held[dir] = false;
        btn.classList.remove("is-active");
      };
      btn.addEventListener("pointerdown", on);
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) {
        btn.addEventListener(ev, off);
      });
    });
    var stage = D.$("maze-canvas");
    stage.addEventListener("pointerdown", function (e) {
      if (!game) return;
      drag = { active: true, sx: e.clientX, sy: e.clientY, vx: 0, vy: 0 };
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!drag || !drag.active) return;
      var dx = e.clientX - drag.sx;
      var dy = e.clientY - drag.sy;
      var len = Math.hypot(dx, dy);
      if (len > 12) {
        drag.vx = dx / len;
        drag.vy = dy / len;
      }
      if (len > 40) {
        // joystick "flutuante": a origem acompanha o dedo
        drag.sx = e.clientX - drag.vx * 40;
        drag.sy = e.clientY - drag.vy * 40;
      }
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      stage.addEventListener(ev, function () {
        drag = null;
      });
    });
  }

  /* setup = { guards, delegado, speedMult }; onEnd(outcome) aplica as regras e devolve o texto do efeito. */
  function play(setup, onEnd) {
    return new Promise(function (resolve) {
      cfg = EDM.CONFIG.maze;
      canvas = D.$("maze-canvas");
      ctx = canvas.getContext("2d");
      generate();
      canvas.width = cols * CELL;
      canvas.height = rows * CELL;
      player = { x: 1.5 * CELL, y: 1.5 * CELL, r: CELL * 0.28 };
      spawnGuards(setup);
      held = { up: false, down: false, left: false, right: false };
      drag = null;
      game = { state: "intro", time: cfg.timeLimit, speedMult: setup.speedMult, resolve: resolve, onEnd: onEnd, last: performance.now() };
      D.$("maze-guards").textContent = guards.length;
      D.$("maze-time").textContent = cfg.timeLimit;
      D.$("maze").hidden = false;
      intro(setup);
      game.raf = requestAnimationFrame(loop);
    });
  }
  function close() {
    if (game) cancelAnimationFrame(game.raf);
    game = null;
    D.$("maze").hidden = true;
    D.$("maze-overlay").innerHTML = "";
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  root.addEventListener("blur", function () {
    held = { up: false, down: false, left: false, right: false };
  });
  bindPad();

  /* leitura/ajuste do estado interno para testes automatizados (console/Playwright) */
  function debug() {
    return { game: game, player: player, guards: guards, cols: cols, rows: rows, cell: CELL };
  }

  EDM.Maze = { play: play, close: close, debug: debug };
})(window);
