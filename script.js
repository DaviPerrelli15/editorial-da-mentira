/* ================= AUDIO SYSTEM (Web Audio API) ================= */
let audioCtx;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}
function playBeep(freq, type, duration, vol) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}
function soundClick() { playBeep(600, 'sine', 0.1, 0.1); }
function soundPublish() { playBeep(300, 'square', 0.2, 0.1); setTimeout(() => playBeep(400, 'square', 0.3, 0.1), 100); }
function soundMoney() { playBeep(800, 'sine', 0.1, 0.1); setTimeout(() => playBeep(1200, 'sine', 0.2, 0.1), 100); }
function soundAlert() { playBeep(150, 'sawtooth', 0.5, 0.2); }
function soundKnock() { playBeep(100, 'square', 0.1, 0.5); }

/* ================= DADOS DO JOGO ================= */
const HOUSES = [
    { level: 1, name: "Barraco", img: "img/casa1.jpg", cost: 0, rent: 40, perk: "Aluguel muito barato, mas atrai checadores." },
    { level: 2, name: "Casa Muito Simples", img: "img/casa2.jpg", cost: 400, rent: 65, perk: "Menos despesas surpresa." },
    { level: 3, name: "Casa Pequena", img: "img/casa3.jpg", cost: 1000, rent: 100, perk: "Cada edição chama 10% menos atenção policial." },
    { level: 4, name: "Casa Melhor", img: "img/casa4.jpg", cost: 2000, rent: 150, perk: "Seguidores crescem +1% ao dia sozinhos." },
    { level: 5, name: "Casa Confortável", img: "img/casa5.jpg", cost: 3500, rent: 220, perk: "Atrai patrocinadores básicos." },
    { level: 6, name: "Casa Moderna", img: "img/casa6.jpg", cost: 6000, rent: 320, perk: "Reputação cai mais devagar." },
    { level: 7, name: "Casa Grande", img: "img/casa7.jpg", cost: 10000, rent: 460, perk: "Permite 1 ação extra por dia." },
    { level: 8, name: "Casa de Luxo", img: "img/casa8.jpg", cost: 17000, rent: 650, perk: "Patrocinadores premium." },
    { level: 9, name: "Altíssimo Padrão", img: "img/casa9.jpg", cost: 30000, rent: 900, perk: "Policiais corruptos aceitam suborno automático." },
    { level: 10, name: "Mansão", img: "img/casa10.jpg", cost: 55000, rent: 1300, perk: "Você venceu no capitalismo. Cuidado com o imposto." }
];

const BASE_NEWS = [
    "Estudo indica aumento na produção de milho no país.",
    "Prefeitura asfalta nova rua no centro da cidade.",
    "Gato é resgatado de árvore pelos bombeiros.",
    "Previsão de chuva moderada para o final de semana.",
    "Novo sabor de sorvete é lançado na praça principal.",
    "Reunião de condomínio termina sem acordo sobre pintura.",
    "Preços das frutas no mercado municipal permanecem estáveis.",
    "Escola local faz feira de ciências nesta sexta."
];

const STICKERS = [
    { id: "sensa", name: "😱 SENSACIONALISMO", desc: "Lucro ++ | Risco + | Viral +", multProfit: 1.5, addRisk: 3, multViral: 1.2, prefix: "CHOCANTE: ", suffix: "!!!" },
    { id: "conspira", name: "👁️ TEORIA DA CONSPIRAÇÃO", desc: "Lucro ++ | Risco ++ | Viral ++", multProfit: 1.8, addRisk: 6, multViral: 1.8, prefix: "O QUE ELES ESCONDEM: ", suffix: "... ACORDE!" },
    { id: "caca", name: "🔥 CAÇA-CLIQUE", desc: "Lucro +++ | Risco +++ | Viral +++", multProfit: 2.5, addRisk: 10, multViral: 2.5, prefix: "VOCÊ NÃO VAI ACREDITAR: ", suffix: " E O FINAL É SURPREENDENTE!" },
    { id: "especial", name: "🧪 ESPECIALISTA ANÔNIMO", desc: "Lucro ++ | Risco + | Reputação --", multProfit: 1.6, addRisk: 4, multViral: 1.3, prefix: "", suffix: " - AFIRMA ESPECIALISTA QUE PREFERE NÃO SE IDENTIFICAR." },
    { id: "compartilhe", name: "📢 COMPARTILHE AGORA", desc: "Lucro + | Viral ++++", multProfit: 1.1, addRisk: 5, multViral: 3.0, prefix: "URGENTE! REPASSE: ", suffix: " (COMPARTILHE ANTES QUE APAGUEM)" },
    { id: "alien", name: "🛸 CULPA DOS ALIENÍGENAS", desc: "Lucro + | Risco + | Reputação ---", multProfit: 1.3, addRisk: 2, multViral: 1.5, prefix: "CONTATO EXTRATERRESTRE? ", suffix: " - A VERDADE ESTÁ LÁ FORA." },
    { id: "cura", name: "💊 CURA MILAGROSA", desc: "Lucro ++++ | Risco +++++ (Ilegal)", multProfit: 3.5, addRisk: 15, multViral: 2.0, prefix: "MÉDICOS REVOLTADOS: ", suffix: " CURA TUDO EM 2 DIAS!" }
];

const COMBOS = [
    { 
        name: "💥 COMBO: MANCHETE ABSURDA", 
        req: ["compartilhe", "conspira", "caca"], 
        bonusProfit: 150, bonusRisk: 20, multViral: 5.0 
    },
    { 
        name: "💥 COMBO: PSEUDOCIÊNCIA PERIGOSA", 
        req: ["especial", "cura"], 
        bonusProfit: 100, bonusRisk: 25, multViral: 2.5 
    },
    { 
        name: "💥 COMBO: PÂNICO GERAL", 
        req: ["sensa", "compartilhe", "alien"], 
        bonusProfit: 60, bonusRisk: 15, multViral: 3.5 
    }
];

/* ================= ESTADO DO JOGO ================= */
let state = {
    day: 1,
    actions: 3,
    maxActions: 3,
    money: 100,
    followers: 10,
    reputation: 100, // 0 a 100
    police: 0, // 0 a 100
    houseLevel: 1,
    stats: {
        daysSurvived: 0,
        maxViral: 0,
        totalPubs: 0,
        closeCalls: 0
    },
    bills: [
        { id: "rent", name: "🏠 Aluguel", cost: 50, daysLeft: 5, freq: 5, strikes: 0 },
        { id: "internet", name: "📱 Internet", cost: 30, daysLeft: 3, freq: 3, strikes: 0 },
        { id: "food", name: "🍔 Comida", cost: 15, daysLeft: 1, freq: 1, strikes: 0 }
    ],
    activePosts: [], // { id, text, views, profit, risk, viralPower, day, factChecked }
    history: []
};

let currentBaseNews = "";
let activeStickers = [];

/* ================= INICIALIZAÇÃO ================= */
window.onload = () => {
    if(localStorage.getItem('editorial_record')) {
        document.getElementById('high-score-display').innerText = "Recorde: " + localStorage.getItem('editorial_record') + " dias";
    }
    if(localStorage.getItem('editorial_mentira_save')) {
        document.getElementById('btn-continue').style.display = 'inline-block';
    }
};

function startGame() {
    initAudio();
    soundClick();
    localStorage.removeItem('editorial_mentira_save'); // Reseta
    state = {
        day: 1, actions: 3, maxActions: 3, money: 100, followers: 10, reputation: 100, police: 0, houseLevel: 1,
        stats: { daysSurvived: 0, maxViral: 0, totalPubs: 0, closeCalls: 0 },
        bills: [
            { id: "rent", name: "🏠 Aluguel", cost: HOUSES[0].rent, daysLeft: 5, freq: 5, strikes: 0 },
            { id: "internet", name: "📱 Internet", cost: 30, daysLeft: 3, freq: 3, strikes: 0 },
            { id: "food", name: "🍔 Comida", cost: 15, daysLeft: 1, freq: 1, strikes: 0 }
        ],
        activePosts: [], history: []
    };
    switchScreen('game-screen');
    renderStickers();
    generateBaseNews();
    updateHUD();
    renderBills();
}

function loadGame() {
    initAudio();
    soundClick();
    let saved = localStorage.getItem('editorial_mentira_save');
    if(saved) {
        state = JSON.parse(saved);
        switchScreen('game-screen');
        renderStickers();
        generateBaseNews();
        updateHUD();
        renderBills();
        renderActivePosts();
    }
}

function saveGame() {
    localStorage.setItem('editorial_mentira_save', JSON.stringify(state));
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showRules() {
    initAudio(); soundClick();
    document.getElementById('info-title').innerText = "Como Jogar";
    document.getElementById('info-desc').innerHTML = `
        - Edite notícias monótonas adicionando adesivos.<br>
        - Adesivos aumentam seu lucro, mas chamam <b>Atenção Policial</b>.<br>
        - Sobreviva pagando contas de aluguel, internet e comida.<br>
        - Junte dinheiro para melhorar de casa.<br>
        - Se a polícia chegar a 100%, <b>VOCÊ ESTÁ PRESO!</b>
    `;
    document.getElementById('info-modal').classList.add('show');
}
function closeInfoModal() {
    soundClick();
    document.getElementById('info-modal').classList.remove('show');
}

/* ================= CORE LOGIC ================= */
function updateHUD() {
    tweenMoney();
    document.getElementById('hud-day').innerText = state.day;
    document.getElementById('hud-actions').innerText = `${state.actions}/${state.maxActions}`;
    document.getElementById('hud-followers').innerText = formatNumber(state.followers);
    
    let repStr = state.reputation > 80 ? "Alta" : (state.reputation > 40 ? "Média" : "Baixa ⚠️");
    document.getElementById('hud-rep').innerText = repStr;
    
    // Atualiza Polícia
    if(state.police > 100) state.police = 100;
    if(state.police < 0) state.police = 0;
    
    let bar = document.getElementById('police-bar');
    let val = document.getElementById('hud-police-val');
    let status = document.getElementById('police-status');
    let container = document.getElementById('police-container');
    
    bar.style.width = state.police + "%";
    val.innerText = Math.floor(state.police) + "%";
    container.classList.remove('critical-danger');
    
    if(state.police < 20) { bar.style.backgroundColor = "var(--green)"; status.innerText = "Tranquilo"; }
    else if(state.police < 40) { bar.style.backgroundColor = "var(--yellow)"; status.innerText = "Suspeito"; }
    else if(state.police < 60) { bar.style.backgroundColor = "orange"; status.innerText = "Investigação Leve"; }
    else if(state.police < 80) { bar.style.backgroundColor = "orangered"; status.innerText = "Cuidado!"; }
    else { 
        bar.style.backgroundColor = "red"; 
        status.innerText = "INVESTIGADO! 🚨"; 
        container.classList.add('critical-danger');
        if(Math.random() < 0.3) soundAlert(); // Beep esporádico
    }

    // Casa
    let house = HOUSES[state.houseLevel - 1];
    document.getElementById('house-name').innerText = `Nível ${house.level}: ${house.name}`;
    document.getElementById('house-image').style.backgroundImage = `url('${house.img}')`;
    
    let upBtn = document.getElementById('btn-upgrade-house');
    if(state.houseLevel < 10) {
        let nextHouse = HOUSES[state.houseLevel];
        upBtn.innerText = state.money >= nextHouse.cost ? `🏠 MELHORAR: ${nextHouse.name} (R$ ${nextHouse.cost.toLocaleString('pt-BR')})` : `Próxima: ${nextHouse.name}`;
        upBtn.disabled = state.money < nextHouse.cost;
        upBtn.classList.toggle('can-up', state.money >= nextHouse.cost);
        document.getElementById('house-prog-fill').style.width = Math.max(0, Math.min(100, state.money / nextHouse.cost * 100)) + '%';
        document.getElementById('house-prog-txt').innerText = `R$ ${Math.floor(Math.max(0,state.money)).toLocaleString('pt-BR')} / R$ ${nextHouse.cost.toLocaleString('pt-BR')} · aluguel novo: R$ ${nextHouse.rent}/5 dias`;
        upBtn.style.display = 'block';
    } else {
        upBtn.style.display = 'none';
        document.getElementById('house-prog-txt').innerText = '🏰 Você chegou ao topo!';
    }

    // Botões
    document.getElementById('btn-publish').disabled = state.actions <= 0;
    document.querySelector('.btn-lay-low').disabled = state.actions <= 0;

    saveGame();
}

function formatNumber(num) {
    if(num >= 1000000) return (num/1000000).toFixed(1) + "M";
    if(num >= 1000) return (num/1000).toFixed(1) + "K";
    return Math.floor(num);
}

let shownMoney = null;
function tweenMoney() {
    const el = document.getElementById('hud-money');
    if(shownMoney === null) shownMoney = state.money;
    const from = shownMoney, to = state.money, t0 = performance.now();
    function step(t) {
        const k = Math.min(1, (t - t0) / 600);
        shownMoney = from + (to - from) * k;
        el.innerText = `R$ ${Math.floor(shownMoney).toLocaleString('pt-BR')}`;
        if(k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    el.style.color = to > from ? 'var(--green)' : (to < from ? '#ff6b6b' : '');
}
function floatText(txt) {
    const el = document.getElementById('hud-money').getBoundingClientRect();
    const d = document.createElement('div'); d.className = 'float-txt'; d.innerText = txt;
    d.style.left = (el.left) + 'px'; d.style.top = (el.bottom + 4) + 'px';
    document.body.appendChild(d); setTimeout(() => d.remove(), 1400);
}
function changeMoney(amt) {
    state.money += amt;
    if(amt > 0) { soundMoney(); floatText('+R$ ' + Math.floor(amt).toLocaleString('pt-BR')); }
    updateHUD();
    checkGameOver();
}

function changePolice(amt) {
    state.police += amt;
    if(amt > 15) state.stats.closeCalls++;
    updateHUD();
    checkGameOver();
}

/* ================= EDITOR DE MANCHETE ================= */
function generateBaseNews() {
    currentBaseNews = BASE_NEWS[Math.floor(Math.random() * BASE_NEWS.length)];
    activeStickers = [];
    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('combo-alert').style.display = 'none';
    updateEditor();
}

function renderStickers() {
    let cont = document.getElementById('stickers-container');
    cont.innerHTML = "";
    STICKERS.forEach(s => {
        let btn = document.createElement('button');
        btn.className = 'sticker-btn';
        btn.id = `btn-stk-${s.id}`;
        btn.onclick = () => toggleSticker(s.id);
        btn.draggable = true;
        btn.ondragstart = e => e.dataTransfer.setData('text', s.id);
        btn.innerHTML = `<span class="sticker-title">${s.name}</span><span class="sticker-fx">${s.desc}</span>`;
        cont.appendChild(btn);
    });
}

function cancelHeadline() {
    if(activeStickers.length === 0) return;
    soundClick();
    activeStickers = [];
    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('combo-alert').style.display = 'none';
    updateEditor();
}

function toggleSticker(id) {
    soundClick();
    let idx = activeStickers.indexOf(id);
    let btn = document.getElementById(`btn-stk-${id}`);
    if(idx > -1) {
        activeStickers.splice(idx, 1);
        btn.classList.remove('active');
    } else {
        if(activeStickers.length >= 3) {
            // Limite de 3 para não quebrar layout
            let firstId = activeStickers.shift();
            document.getElementById(`btn-stk-${firstId}`).classList.remove('active');
        }
        activeStickers.push(id);
        btn.classList.add('active');
    }
    updateEditor();
}

function updateEditor() {
    let finalHeadline = currentBaseNews;
    let fMult = 1 + 2 * Math.log10(state.followers / 10 + 1);
    let baseProfit = (20 + Math.floor(Math.random()*20)) * fMult * (1 + slotAbs() * 0.1);
    
    let totalMultProfit = 1;
    let totalRisk = 0;
    let totalMultViral = 1;

    let prefix = "";
    let suffix = "";

    activeStickers.forEach(id => {
        let s = STICKERS.find(x => x.id === id);
        totalMultProfit += (s.multProfit - 1);
        totalRisk += s.addRisk;
        totalMultViral *= s.multViral;
        if(s.prefix) prefix = s.prefix + " ";
        if(s.suffix) suffix += " " + s.suffix;
    });

    totalRisk += slotAbs() * 1.2; // palavras absurdas aumentam o risco

    // Check combos
    let comboActive = null;
    COMBOS.forEach(c => {
        let hasAll = c.req.every(reqId => activeStickers.includes(reqId));
        if(hasAll) {
            comboActive = c;
            totalRisk += c.bonusRisk;
            totalMultViral *= c.multViral;
        }
    });

    if(comboActive) {
        let ca = document.getElementById('combo-alert');
        ca.innerText = comboActive.name;
        ca.style.display = 'block';
    } else {
        document.getElementById('combo-alert').style.display = 'none';
    }

    totalMultViral = Math.min(totalMultViral, 12);
    totalRisk = Math.round(totalRisk * (1 + 0.05 * Math.log10(Math.max(state.followers,10))) * (state.houseLevel >= 3 ? 0.9 : 1));
    finalHeadline = prefix + currentBaseNews.replace('.', '') + suffix;
    
    // Modify case based on risk
    if(totalRisk > 10) finalHeadline = finalHeadline.toUpperCase();
    
    document.getElementById('headline-text').innerText = finalHeadline;
    document.getElementById('btn-cancel').disabled = activeStickers.length === 0;

    let estProfit = baseProfit * totalMultProfit;
    if(comboActive) estProfit += comboActive.bonusProfit * fMult * 0.5;

    // Reputação baixa pune o lucro
    if(state.reputation < 30) estProfit *= 0.5;

    document.getElementById('est-profit').innerText = Math.floor(estProfit);
    document.getElementById('est-risk').innerText = totalRisk;
    
    let viralText = "Baixo";
    if(totalMultViral > 1.5) viralText = "Médio";
    if(totalMultViral > 2.5) viralText = "Alto 🔥";
    if(totalMultViral > 4.0) viralText = "ENORME 🚀";
    document.getElementById('est-viral').innerText = viralText;
}

function publishNews() {
    if(state.actions <= 0) return;
    
    // Validar se tem strike de internet
    let inetBill = state.bills.find(b => b.id === 'internet');
    if(inetBill.strikes > 0) {
        showModal("Sem Internet", "Sua internet foi cortada por falta de pagamento. Você não pode publicar hoje.", [{text: "Droga!", action: closeEventModal}]);
        return;
    }

    soundPublish();
    state.actions--;
    state.stats.totalPubs++;

    let profitStr = document.getElementById('est-profit').innerText;
    let riskStr = document.getElementById('est-risk').innerText;
    let profit = Math.floor(parseInt(profitStr) * (window.betMult || 1));
    let risk = parseInt(riskStr) + (window.betRisk || 0);
    
    let totalMultViral = 1;
    activeStickers.forEach(id => totalMultViral *= STICKERS.find(x => x.id === id).multViral);

    COMBOS.forEach(c => { if(c.req.every(r => activeStickers.includes(r))) totalMultViral *= c.multViral; });
    totalMultViral = Math.min(totalMultViral, 12);
    let comboBonus = document.getElementById('combo-alert').style.display === 'block';

    // Cria o post
    let post = {
        id: Date.now(),
        text: document.getElementById('headline-text').innerText,
        views: 100 * totalMultViral * (state.followers > 0 ? (state.followers * 0.1) : 1),
        profit: profit,
        risk: risk,
        viralPower: totalMultViral + (comboBonus ? 2 : 0),
        day: state.day,
        factChecked: false
    };

    state.activePosts.push(post);
    state.history.push(post);
    
    changeMoney(profit);
    changePolice(risk);
    
    // Ganha seguidores (Baseado no risco/viral)
    let newFolls = Math.floor((4 + risk * 1.2) * Math.pow(totalMultViral, 0.7) * (1 + state.followers / 100));
    state.followers += newFolls;

    renderActivePosts();
    generateBaseNews();
    updateHUD();

    if(state.police < 100 && Math.random() < 0.3) {
        setTimeout(triggerRandomEvent, 500);
    }
}

function actionLayLow() {
    if(state.actions <= 0) return;
    soundClick();
    state.actions--;
    state.police -= (8 + Math.random()*6);
    state.reputation += 5;
    if(state.reputation > 100) state.reputation = 100;
    
    // Diminui força viral dos posts ativos
    state.activePosts.forEach(p => p.viralPower *= 0.5);

    updateHUD();
}

/* ================= PROGRESSÃO DA CASA ================= */
function upgradeHouse() {
    if(state.houseLevel >= 10) return;
    let nextHouse = HOUSES[state.houseLevel];
    if(state.money >= nextHouse.cost) {
        soundMoney();
        changeMoney(-nextHouse.cost);
        state.houseLevel++;
        const hi = document.getElementById('house-image'); hi.classList.remove('flash'); void hi.offsetWidth; hi.classList.add('flash');
        state.maxActions = (state.houseLevel >= 7) ? 4 : 3;
        
        // Atualiza a conta de aluguel
        let rentBill = state.bills.find(b => b.id === 'rent');
        rentBill.cost = nextHouse.cost > 0 ? nextHouse.rent : rentBill.cost; // Aumenta o custo

        updateHUD();
        renderBills();
        showModal("Casa Nova!", `Você se mudou para: ${nextHouse.name}.<br><br>Vantagem: ${nextHouse.perk}<br><br>Cuidado: O aluguel subiu!`, [{text: "Ostentação!", action: closeEventModal}]);
    }
}

/* ================= FIM DO DIA / LOOP ================= */
function endDay() {
    soundClick();
    state.day++;
    state.actions = state.maxActions;
    state.stats.daysSurvived++;

    // Processar Contas
    let despejado = false;
    state.bills.forEach(b => {
        b.daysLeft--;
        if(b.daysLeft <= 0) {
            if(state.money >= b.cost) {
                changeMoney(-b.cost);
                b.daysLeft = b.freq;
                b.strikes = 0; // Pagou, zera strike
            } else {
                b.strikes++;
                if(b.id === 'rent' && b.strikes >= 2) {
                    despejado = true;
                }
            }
        }
    });

    if(despejado) {
        triggerGameOver("DESPEJADO", "Você não pagou o aluguel várias vezes e o proprietário chamou a polícia para te tirar da casa.");
        return;
    }

    if(state.money < -500) {
        triggerGameOver("FALÊNCIA", "Você acumulou muitas dívidas, agiotas bateram na sua porta. Fim da linha.");
        return;
    }

    // Processar Viralização
    let dailyViralProfit = 0;
    let dailyViralRisk = 0;
    let removedPosts = [];

    state.activePosts.forEach((p, i) => {
        if(p.factChecked) return;

        if(p.viralPower > 1.2) {
            let viewsGain = Math.floor(p.views * (Math.random() * 0.5 + 0.1) * p.viralPower);
            p.views += viewsGain;
            
            let profitGain = Math.floor((viewsGain / 1000) * 2); // Ex: R$5 a cada 1k views extras
            if(profitGain > 0) {
                dailyViralProfit += profitGain;
                p.profit += profitGain;
            }

            // Risco passivo
            if(p.views > 20000 && Math.random() < 0.4) dailyViralRisk += 3;
            if(p.views > 200000 && Math.random() < 0.5) dailyViralRisk += 5;

            // Decaimento natural
            p.viralPower -= 0.3; 
            
            if(p.views > state.stats.maxViral) state.stats.maxViral = p.views;

            // Chance de Checagem
            if(p.views > 10000 && Math.random() < 0.1) {
                setTimeout(() => triggerFactCheckEvent(p), 1000);
            }
        } else {
            removedPosts.push(i);
        }
    });

    // Remove posts que esfriaram
    removedPosts.reverse().forEach(idx => state.activePosts.splice(idx, 1));

    // Atenção passiva: canal grande e posts quentes chamam polícia sozinhos
    dailyViralRisk += 1.6 * Math.log10(Math.max(state.followers, 10)) + state.activePosts.length * 1.0;
    if(state.houseLevel >= 4) state.followers = Math.floor(state.followers * 1.01);
    if(dailyViralProfit > 0) changeMoney(dailyViralProfit);
    if(dailyViralRisk > 0) changePolice(dailyViralRisk);

    renderBills();
    renderActivePosts();
    updateHUD();

    // Eventos do início do dia baseados na tensão
    if(state.police >= 100) {
        triggerPrisonSequence();
        return;
    } else if (state.police > 80 && Math.random() < 0.5) {
        triggerPoliceEvent("critical");
    } else if (state.police > 50 && Math.random() < 0.3) {
        triggerPoliceEvent("high");
    } else if (Math.random() < 0.2) {
        triggerRandomEvent();
    } else if (state.history.length > 5 && Math.random() < 0.1) {
        resurrectOldPost();
    }
}

function renderBills() {
    let cont = document.getElementById('bills-list');
    cont.innerHTML = "";
    state.bills.forEach(b => {
        let div = document.createElement('div');
        div.className = 'bill-item';
        let status = b.strikes > 0 ? `<span class="bill-warning">ATRASADA! (${b.strikes})</span>` : `Vence em: ${b.daysLeft}d`;
        div.innerHTML = `<span>${b.name} (R$ ${b.cost})</span> <span>${status}</span>`;
        cont.appendChild(div);
    });
}

function renderActivePosts() {
    let cont = document.getElementById('viral-list');
    cont.innerHTML = "";
    if(state.activePosts.length === 0) {
        cont.innerHTML = `<div style="color: #666; font-style: italic;">Nenhuma publicação viralizando no momento.</div>`;
        return;
    }
    state.activePosts.forEach(p => {
        let div = document.createElement('div');
        div.className = 'viral-item';
        div.innerHTML = `<strong>${p.text}</strong><br>
        <span class="viral-views">🔥 ${formatNumber(p.views)} views</span> | Gerou: R$ ${p.profit}`;
        cont.appendChild(div);
    });
}

/* ================= EVENTOS ================= */
function showModal(title, text, choices) {
    document.getElementById('event-title').innerText = title;
    document.getElementById('event-desc').innerHTML = text;
    let chContainer = document.getElementById('event-choices');
    chContainer.innerHTML = "";
    choices.forEach(c => {
        let btn = document.createElement('button');
        btn.className = 'modal-btn';
        btn.innerText = c.text;
        btn.onclick = () => {
            if(c.action) c.action();
            else closeEventModal();
        };
        chContainer.appendChild(btn);
    });
    document.getElementById('event-modal').classList.add('show');
}

function closeEventModal() {
    soundClick();
    document.getElementById('event-modal').classList.remove('show');
    updateHUD();
}

function triggerFactCheckEvent(post) {
    soundAlert();
    showModal("🔎 CHECAGEM DE FATOS", 
        `A Agência 'Fato ou Fake' analisou sua publicação:<br><i>"${post.text}"</i><br><br>Eles a marcaram como Falsa! O que você faz?`, 
        [
            {text: "Ignorar (Aumenta muito o risco, mas mantém views)", action: () => {
                changePolice(15);
                state.reputation -= 20;
                closeEventModal();
            }},
            {text: "Apagar Post (Perde dinheiro futuro e viralização)", action: () => {
                post.factChecked = true;
                post.viralPower = 0;
                changePolice(-5); // Reduz um pouco o risco
                closeEventModal();
                renderActivePosts();
            }}
        ]
    );
}

function resurrectOldPost() {
    let oldPosts = state.history.filter(p => p.day < state.day - 3 && !p.factChecked);
    if(oldPosts.length === 0) return;
    let p = oldPosts[Math.floor(Math.random() * oldPosts.length)];
    
    soundAlert();
    showModal("⚠️ FANTASMA DO PASSADO", 
        `Um vídeo do YouTube acaba de usar sua matéria do dia ${p.day} como fonte!<br><i>"${p.text}"</i><br>Ela voltou a viralizar fortemente!`, 
        [{text: "Opa, dinheiro de graça!", action: () => {
            p.viralPower = 3.0; // Volta pra ativa
            p.factChecked = false;
            if(!state.activePosts.includes(p)) state.activePosts.push(p);
            changePolice(5);
            closeEventModal();
        }}]
    );
}

function triggerPoliceEvent(severity) {
    soundAlert();
    if(severity === "high") {
        showModal("🕵️ REPÓRTER NO BAIRRO", 
            "Um jornalista está perguntando aos seus vizinhos sobre as atividades na sua casa. Eles estão desconfiados.",
            [
                {text: "Dar entrevista 'exclusiva' (+ Seguidores, + Polícia)", action: () => {
                    state.followers += 5000;
                    changePolice(10);
                    closeEventModal();
                }},
                {text: "Não abrir a porta (- Risco, nada ganha)", action: () => {
                    changePolice(-5);
                    closeEventModal();
                }}
            ]
        );
    } else if (severity === "critical") {
        showModal("🚔 VIATURA NA RUA", 
            "Uma viatura da Polícia Federal parou do outro lado da rua. Eles estão olhando para a sua janela.",
            [
                {text: "Continuar trabalhando (Muito Perigoso)", action: () => {
                    changePolice(15);
                    state.reputation += 10;
                    closeEventModal();
                }},
                {text: "Desligar o PC e queimar papéis (- Dinheiro, - Polícia)", action: () => {
                    changeMoney(-100);
                    changePolice(-20);
                    closeEventModal();
                }}
            ]
        );
    }
}

function triggerRandomEvent() {
    let r = Math.random();
    if(r < 0.25) {
        showModal("💰 PATROCÍNIO DUVIDOSO", "Uma casa de apostas quer colocar um banner no seu jornal.", [
            {text: "Aceitar (R$ 300, - Reputação)", action: () => { changeMoney(300); state.reputation -= 15; closeEventModal(); }},
            {text: "Recusar (+ Reputação)", action: () => { state.reputation += 10; closeEventModal(); }}
        ]);
    } else if (r < 0.5) {
        showModal("😂 VIROU MEME", "Uma das suas manchetes virou figurinha no WhatsApp!", [
            {text: "Legal!", action: () => { state.followers += 2000; changePolice(5); closeEventModal(); }}
        ]);
    } else if (r < 0.75) {
        showModal("📺 MENCIONADO NA TV", "O âncora do jornal das 20h criticou severamente seu site ao vivo.", [
            {text: "Fale bem ou fale mal (+ Seguidores, + Polícia)", action: () => { state.followers += 15000; changePolice(20); closeEventModal(); }}
        ]);
    } else {
        showModal("🧑‍💻 HACKER", "Alguém invadiu seu painel e ameaça vazar seus dados reais se você não pagar R$ 500.", [
            {text: "Pagar chantagem (R$ -500)", action: () => { if(state.money>=500) changeMoney(-500); else changePolice(30); closeEventModal(); }},
            {text: "Desafiar Hacker (Atenção policial no máximo)", action: () => { changePolice(40); closeEventModal(); }}
        ]);
    }
}

/* ================= GAME OVER / PRISÃO ================= */
function checkGameOver() {
    if(state.police >= 100) {
        triggerPrisonSequence();
    }
}

function triggerPrisonSequence() {
    document.getElementById('event-modal').classList.remove('show');
    let ps = document.getElementById('prison-screen');
    let txt = document.getElementById('prison-text');
    let choices = document.getElementById('prison-choices');
    
    ps.style.display = 'flex';
    txt.innerHTML = "";
    choices.style.display = 'none';

    let sequence = [
        "06:43 AM",
        "...",
        "TOC TOC TOC",
        "POLÍCIA FEDERAL!",
        "ABRA A PORTA!",
        "Você olha para o computador...",
        "APAGAR ARQUIVOS?"
    ];

    let i = 0;
    function typeText() {
        if(i < sequence.length) {
            soundKnock();
            txt.innerHTML += sequence[i] + "<br>";
            i++;
            setTimeout(typeText, 1000);
        } else {
            choices.style.display = 'flex';
        }
    }
    setTimeout(typeText, 500);
}

function resolvePrison(choice) {
    document.getElementById('prison-screen').style.display = 'none';
    let msg = choice === 'sim' ? 
        "Você jogou o HD no microondas, mas foi preso em flagrante por obstrução de justiça." : 
        "Você levantou as mãos. Eles levaram todos os servidores. O canal acabou.";
    
    triggerGameOver("🚔 VOCÊ FOI PRESO", msg);
}

function triggerGameOver(title, reason) {
    let rec = localStorage.getItem('editorial_record');
    if(!rec || state.stats.daysSurvived > parseInt(rec)) {
        localStorage.setItem('editorial_record', state.stats.daysSurvived);
    }
    localStorage.removeItem('editorial_mentira_save'); // Apaga save

    document.getElementById('info-title').innerText = title;
    document.getElementById('info-title').style.color = 'red';
    
    document.getElementById('info-desc').innerHTML = `
        ${reason}<br><br>
        <b>Estatísticas Finais:</b><br>
        📅 Dias Sobrevividos: ${state.stats.daysSurvived}<br>
        💰 Dinheiro Final: R$ ${Math.floor(state.money)}<br>
        👥 Seguidores: ${formatNumber(state.followers)}<br>
        🚀 Maior Viralização: ${formatNumber(state.stats.maxViral)} views<br>
        🏠 Casa: Nível ${state.houseLevel} (${HOUSES[state.houseLevel-1].name})<br>
        ⚠️ Quase foi preso: ${state.stats.closeCalls} vezes
    `;
    
    let btn = document.getElementById('info-btn');
    btn.innerText = "Voltar ao Menu";
    btn.onclick = () => { location.reload(); }; // Recarrega a página

    document.getElementById('info-modal').classList.add('show');
}
