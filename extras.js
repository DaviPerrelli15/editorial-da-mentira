/* ===== EXTRAS v2 — camada de jogabilidade sobre o script.js ===== */
const byId = id => document.getElementById(id);
const rnd = a => Math.floor(Math.random() * a.length);

/* ---------- Sons e juice ---------- */
function playNoise(d, v) {
    if (!audioCtx) return;
    const n = audioCtx.sampleRate * d, b = audioCtx.createBuffer(1, n, audioCtx.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = audioCtx.createBufferSource(), g = audioCtx.createGain();
    g.gain.value = v; s.buffer = b; s.connect(g); g.connect(audioCtx.destination); s.start();
}
const soundPrint = () => { playNoise(.5, .15); [0, 120, 240, 360].forEach(t => setTimeout(() => playBeep(180, 'square', .06, .08), t)); };
const soundCash = () => [0, 90, 180].forEach((t, i) => setTimeout(() => playBeep(900 + i * 300, 'triangle', .15, .12), t));
const soundCombo = () => [0, 80, 160, 240].forEach((t, i) => setTimeout(() => playBeep(400 + i * 200, 'square', .15, .1), t));
function shake() { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); }

/* ---------- Narrador sarcástico ---------- */
let narrT;
function narrate(t) {
    const e = byId('narr-txt'); e.textContent = ''; let i = 0; clearInterval(narrT);
    narrT = setInterval(() => { e.textContent = t.slice(0, ++i); if (i >= t.length) clearInterval(narrT); }, 18);
}
const NARR = {
    combo: ["Isso não é jornalismo, é um incêndio com diagramação.", "Sua mãe ligou perguntando se você está bem.", "A verdade pediu demissão e deixou um bilhete."],
    risk: ["Alguém no bairro ligou a TV e apontou para a sua casa.", "O delegado adorou essa. Anotou tudo.", "Ousado. A polícia também achou."],
    calm: ["Tranquilo. Quase honesto. Quase.", "Pequenas mentiras, pequenas contas pagas.", "O país precisava disso. Ninguém pediu, mas precisava."]
};
function narrateFor(p) { const k = p.viralPower > 5 ? 'combo' : (p.risk >= 12 ? 'risk' : 'calm'); narrate(NARR[k][rnd(NARR[k])]); }

/* ---------- Manchetes montáveis: [QUEM] [VERBO] [COISA] (texto, emoji, absurdo) ---------- */
const QUEM = [["A prefeitura", "🏛️", 0], ["Cientistas", "🔬", 0], ["Uma vizinha", "👵", 1], ["O síndico", "🧑‍💼", 1], ["Um influencer", "🤳", 1], ["Um gato", "🐱", 2]];
const VERBO = [["anuncia que", 0], ["mostra que", 0], ["descobre que", 1], ["admite que", 1], ["revela que", 2], ["jura que", 2]];
const COISA = [["o pão ficou mais barato", "🍞", 0], ["vai chover no domingo", "🌧️", 0], ["a rua foi asfaltada", "🛣️", 0], ["o wifi causa saudade", "📶", 2], ["beber água é opcional", "💧", 2], ["a lua é feita de queijo", "🧀", 3], ["os pombos são drones do governo", "🕊️", 3]];
let slot = [0, 0, 0];
const slotAbs = () => QUEM[slot[0]][2] + VERBO[slot[1]][1] + COISA[slot[2]][2];

function compose() {
    currentBaseNews = `${QUEM[slot[0]][0]} ${VERBO[slot[1]][0]} ${COISA[slot[2]][0]}.`;
    const cfg = [[QUEM, 'QUEM', 2], [VERBO, 'AÇÃO', 1], [COISA, 'COISA', 2]];
    byId('slots').innerHTML = '';
    cfg.forEach(([arr, lbl, ai], i) => {
        const b = document.createElement('div'); b.className = 'slot';
        b.innerHTML = `<small>${lbl} ${'🔥'.repeat(arr[slot[i]][ai])}</small>${arr[slot[i]][0]}`;
        b.onclick = () => { slot[i] = (slot[i] + 1) % arr.length; soundClick(); compose(); };
        byId('slots').appendChild(b);
    });
    updateEditor();
}
generateBaseNews = function () {
    slot = [rnd(QUEM), rnd(VERBO), rnd(COISA)];
    activeStickers = [];
    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('active'));
    compose();
};

/* ---------- Adesivos colados no jornal (arrastar ou clicar) ---------- */
function dropSticker(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text');
    if (STICKERS.some(s => s.id === id) && !activeStickers.includes(id)) toggleSticker(id);
}
function renderStamps() {
    const box = byId('stamps');
    [...box.children].forEach(c => { if (!activeStickers.includes(c.dataset.id)) c.remove(); });
    activeStickers.forEach(id => {
        if (box.querySelector(`[data-id="${id}"]`)) return;
        const s = STICKERS.find(x => x.id === id), d = document.createElement('div');
        d.className = 'stamp'; d.dataset.id = id; d.textContent = s.name;
        d.style.left = (3 + box.children.length * 30 + Math.random() * 6) + '%'; d.style.top = (66 + Math.random() * 14) + '%';
        d.style.setProperty('--r', (Math.random() * 36 - 18) + 'deg');
        d.onclick = () => toggleSticker(id);
        box.appendChild(d);
    });
}
let lastCombo = false;
const _ue = updateEditor;
updateEditor = function () {
    _ue();
    renderStamps();
    byId('news-photo').innerHTML = `${QUEM[slot[0]][1]}${COISA[slot[2]][1]}<span>FOTO: ARQUIVO</span>`;
    byId('paper-ed').innerText = 'Edição nº ' + state.day;
    const c = byId('combo-alert').style.display === 'block';
    if (c && !lastCombo) { shake(); soundCombo(); }
    lastCombo = c;
};

/* ---------- Publicar como aposta: segure a tensão e SOLTE ---------- */
let bet = null;
function startBet() {
    initAudio();
    if (state.actions <= 0) return;
    const inet = state.bills.find(b => b.id === 'internet');
    if (inet && inet.strikes > 0) { publishNews(); return; }
    byId('bet-overlay').classList.add('show');
    byId('bet-fill').style.width = '0'; byId('bet-fill').className = '';
    const t0 = performance.now(), D = 2400; let lastStep = -1;
    bet = { on: true, p: 0 };
    const tick = t => {
        if (!bet || !bet.on) return;
        const p = Math.min(100, (t - t0) / D * 100); bet.p = p;
        byId('bet-fill').style.width = p + '%';
        byId('bet-fill').className = p > 85 ? 'danger' : (p > 60 ? 'warn' : '');
        byId('bet-mult').textContent = 'x' + (1 + p / 100 * .6).toFixed(2);
        const st = Math.floor(p / 10); if (st !== lastStep) { lastStep = st; playBeep(200 + p * 6, 'square', .05, .05); }
        if (p >= 100) return releaseBet(true);
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}
function releaseBet(bust) {
    if (!bet || !bet.on) return;
    bet.on = false;
    const p = bust ? 100 : bet.p;
    window.betMult = bust ? .5 : 1 + p / 100 * .6;
    window.betRisk = bust ? 8 : Math.round(p / 100 * 6);
    byId('bet-overlay').classList.remove('show');
    soundPrint();
    const n = state.history.length;
    publishNews();
    window.betMult = 1; window.betRisk = 0;
    if (state.history.length > n) {
        const post = state.history[n];
        showLive(post);
        if (bust) narrate('ESTOUROU! A manchete saiu tosca e chamou atenção.'); else narrateFor(post);
    }
}
document.addEventListener('keydown', e => { if (e.code === 'Space' && bet && bet.on) { e.preventDefault(); releaseBet(false); } });

/* ---------- Tela "AO VIVO" depois de publicar ---------- */
const COMMENTS = ["Minha tia já compartilhou 🤦", "Isso é verdade?? 😳", "Fui checar e já apagaram!", "Eu sempre soube.", "Kkkk vendo aqui na padaria", "@checador_oficial: fonte?", "Já mandei no grupo da família", "Pode isso, Arnaldo?"];
let liveT;
function showLive(post) {
    byId('live-head').textContent = post.text;
    byId('live-cm').innerHTML = ''; byId('live-views').textContent = '0';
    byId('live-money').textContent = '+R$ ' + post.profit.toLocaleString('pt-BR');
    byId('live-overlay').classList.add('show');
    soundCash();
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 2200); byId('live-views').textContent = formatNumber(Math.floor(post.views * k)); if (k < 1 && byId('live-overlay').classList.contains('show')) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    const list = COMMENTS.slice().sort(() => Math.random() - .5).slice(0, 4);
    if (post.risk >= 15) list.push("🕵️ alguém anotou o seu nome...");
    list.forEach((c, i) => setTimeout(() => { const d = document.createElement('div'); d.textContent = c; byId('live-cm').appendChild(d); }, 500 + i * 650));
    clearTimeout(liveT); liveT = setTimeout(closeLive, 4200);
}
function closeLive() { byId('live-overlay').classList.remove('show'); clearTimeout(liveT); }

/* ---------- Delegado Amaral: pistas (0 a 3) ---------- */
const COP_Q = ["Ainda não sabe que você existe.", "Anotou seu nome num guardanapo.", "Está lendo todas as suas publicações.", "Já tem o mandado na gaveta."];
function updateCop() {
    const c = state.clues || 0;
    byId('cop-clues').textContent = '🔎'.repeat(c) + '⚪'.repeat(3 - c);
    byId('cop-quote').textContent = COP_Q[c];
    byId('cop-face').classList.toggle('angry', c >= 2);
}
const _cp = changePolice;
changePolice = function (a) {
    state.clues = state.clues || 0;
    if (state.clues >= 3 && a > 0) a *= 1.25; // com 3 pistas, o delegado acelera tudo
    _cp(a);
    const th = [35, 55, 75];
    while (state.clues < 3 && state.police >= th[state.clues]) {
        state.clues++; soundAlert();
        narrate(`🕵️ O Delegado Amaral encontrou uma pista sobre você (${state.clues}/3).`);
    }
    updateCop();
};
const _ed = endDay;
endDay = function () { _ed(); if (state.police < 25 && (state.clues || 0) > 0) { state.clues--; updateCop(); } };

/* ---------- Tensão visual e casa ---------- */
const _uh = updateHUD;
updateHUD = function () {
    _uh();
    const p = state.police, b = document.body;
    b.classList.remove('tension-1', 'tension-2', 'tension-3');
    if (p >= 80) b.classList.add('tension-3'); else if (p >= 60) b.classList.add('tension-2'); else if (p >= 40) b.classList.add('tension-1');
    byId('house-image').classList.toggle('cop-near', p >= 60);
};

/* ---------- Início ---------- */
const _sg = startGame;
startGame = function () { _sg(); state.clues = 0; updateCop(); narrate('Bem-vindo à Gazeta da Manhã. A verdade está de folga.'); };
const _lg = loadGame;
loadGame = function () { _lg(); updateCop(); narrate('De volta ao trabalho. A polícia também.'); };
