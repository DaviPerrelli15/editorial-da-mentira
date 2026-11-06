/* =====================================================================
   CONFIGURAÇÃO DE BALANCEAMENTO
   Todos os números do jogo moram aqui. Cada valor tem um comentário curto
   explicando o porquê. Depois de mexer, rode:  node tools/simulacao.js
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  EDM.CONFIG = {
    /* ---------------- Início de partida ---------------- */
    start: {
      money: 300, // cobre a Internet da semana 1 e sobra pouco: começo apertado
      followers: 40, // canal minúsculo, quase só parente e vizinho
      reputation: 15, // item 9: começa com reputação Baixa (escala 0 a 100)
      police: 0, // ninguém te conhece ainda
      actions: 3, // 3 ações por semana: publicar, ficar na miúda ou queima de arquivo
    },

    calendar: {
      weeksPerMonth: 4, // contas fecham em ciclos de 4 semanas (1 mês do jogo)
      maxWeeks: 0, // 0 = partida sem fim (vale o recorde); a simulação usa o próprio limite
    },

    /* ---------------- Reputação (0 a 100) ---------------- */
    reputation: {
      max: 100,
      tiers: [
        { upTo: 34, id: "baixa", label: "Baixa" }, // até 34: público desconfia
        { upTo: 69, id: "media", label: "Média" },
        { upTo: 100, id: "alta", label: "Alta" },
      ],
      viewMultAtZero: 0.5, // item 10: reputação 0 = metade das visualizações
      viewMultAtMax: 1.5, // reputação 100 = +50% de visualizações
      cleanNewsGain: 3, // notícia sem adesivo é "jornalismo": +3 de reputação...
      cleanNewsAbsurdStep: 3, // ...menos 1 a cada 3 pontos de absurdo (mínimo +1)
      debunkLoss: 2, // matéria com adesivo desmentida no crash: −2 extra
      layLowGain: 1, // sumir do mapa acalma o público: +1
    },

    /* ---------------- Audiência e dinheiro ---------------- */
    audience: {
      baseViews: 800, // leitores avulsos que qualquer manchete alcança
      viewsPerFollower: 1.6, // cada seguidor rende ~1,6 visualização (compartilhamentos)...
      followerReachExp: 0.85, // ...com retorno decrescente: canal gigante não escala linear
      absurdityBonus: 0.06, // +6% de views por ponto de absurdo da manchete
      absurdityRiskPct: 0.03, // com adesivo, cada ponto de absurdo soma +3% de risco
      spread: 0.15, // ±15% de sorte em cada publicação
    },
    money: {
      rpm: 36, // R$ por 1.000 views no começo do jogo
      viewsExp: 0.8, // dinheiro = rpm × (views/1000)^0,8: o mercado de anúncio satura em canais grandes
      cleanNewsMult: 0.6, // item 7: notícia base não engaja anunciante (rende 60%: ~R$ 19 no início)
    },

    /* ---------------- Seguidores (item 11) ----------------
       ganho por publicação = views × conversão(rep) ÷ (1 + seguidores/softCap)
       conversão(rep)      = convAtZero + (convAtMax − convAtZero) × rep/100
       variação semanal    = seguidores × (rep − driftPivot) × weeklyDriftPerPoint      */
    followers: {
      convAtZero: 0.008, // rep 0: 0,8% de quem lê vira seguidor
      convAtMax: 0.034, // rep 100: 3,4% (público confia e segue)
      driftPivot: 35, // abaixo de 35 de reputação o canal perde gente toda semana
      weeklyDriftPerPoint: 0.0004, // rep 15 → −0,8%/sem; rep 85 → +2%/sem
      softCap: 15000, // todo ganho de seguidores ÷ (1 + seguidores/15 mil): público saturado
      max: 2000000, // teto absoluto
    },

    /* ---------------- Polícia, pistas e Delegado ---------------- */
    police: {
      prisonAt: 100, // 100% = Polícia Federal na porta
      weeklyCooldown: 8, // a cada semana o caso esfria um pouco sozinho
      heatPerFakePost: 1.5, // cada fake news ainda circulando esquenta o caso por semana
      channelHeat: 6.5, // canais grandes chamam atenção: +6,5 por semana a cada ×10 seguidores acima de 1.000
      channelRiskPerDecade: 0.4, // risco de cada publicação +40% a cada ×10 seguidores acima de 100
      clueGainMult: 0.2, // cada pista do delegado faz a polícia subir +20% mais rápido
      maxClues: 3, // teto de pistas...
      maxCluesCooldownMult: 0.5, // ...e com 3 pistas o caso esfria só pela metade
      eventThresholdHigh: 50, // acima disto podem rolar eventos de investigação
      eventThresholdCritical: 80,
    },

    /* ---------------- Adesivos (item 2 de Estilo + itens 7 e 8) ----------------
       Os "pips" seguem a arte de cada adesivo (Lucro, Risco, Viral, Reputação).
       profit = +% de lucro por publicação, viral = × visualizações,
       risk = pontos de atenção policial, repCost = reputação perdida.
       Notícia SEM adesivo tem risco zero (item 8).                                  */
    stickers: {
      sensacionalismo: { profit: 0.9, viral: 1.2, risk: 4.5, repCost: 0 }, // Lucro 3 · Risco 3
      "teoria-da-conspiracao": { profit: 0.6, viral: 1.3, risk: 4.5, repCost: 0 }, // Lucro 2 · Risco 3
      "caca-clique": { profit: 0.9, viral: 1.35, risk: 4.5, repCost: 0 }, // Lucro 3 · Risco 3
      "especialista-anonimo": { profit: 0.9, viral: 1.05, risk: 1.5, repCost: 0 }, // Lucro 3 · Risco 1
      "compartilhe-agora": { profit: 0.3, viral: 2.0, risk: 1, repCost: 1 }, // Lucro 1 · Viral 4
      "culpa-dos-alienigenas": { profit: 0.6, viral: 1.25, risk: 1, repCost: 3 }, // Lucro 2 · Reputação 3 (amarelo)
      "cura-milagrosa": { profit: 0.9, viral: 1.15, risk: 1, repCost: 7 }, // Lucro 3 · Reputação 4 (vermelho)
    },
    maxStickers: 3, // limite por manchete: mais que isso não cabe no jornal

    combos: [
      // receitas escondidas: bônus grande, risco grande
      { id: "absurda", requires: ["compartilhe-agora", "teoria-da-conspiracao", "caca-clique"], profit: 0.5, viral: 1.8, risk: 8 },
      { id: "pseudociencia", requires: ["especialista-anonimo", "cura-milagrosa"], profit: 0.6, viral: 1.3, risk: 9 },
      { id: "panico", requires: ["sensacionalismo", "compartilhe-agora", "culpa-dos-alienigenas"], profit: 0.4, viral: 2.0, risk: 6 },
    ],

    /* ---------------- Crash da notícia (item 5) ----------------
       P(crash ≥ x) = houseEdge / x  → o ponto de queda é sorteado ANTES da decolagem.
       multiplicador(t) = e^(growth × (t − takeoff))                                   */
    crash: {
      houseEdge: 0.94, // ~7% das matérias caem logo na decolagem (x1,00); P(passar de x2) ≈ 47%
      maxMult: 25, // teto do hype; o avião "imprime sozinho" se chegar aqui
      growth: 0.3, // x2 em ~2,9 s, x5 em ~6 s: dá tempo de pensar, mas não de enrolar
      takeoff: 0.6, // segundos rodando na pista em x1,00
      countdown: 1.2, // segundos de "preparar" antes da decolagem
      crashKeep: 0.35, // matéria desmentida ainda rende 35% (alguém leu antes do desmentido)
      crashRiskExtra: 0.3, // desmentida com adesivo: +30% do risco (o delegado lê a checagem)
      riskPerLnMult: 0.2, // quanto mais alto voa, mais gente (e polícia) vê: risco × (1 + 0,2·ln x)
      historySize: 10, // quantos resultados anteriores aparecem como fichas
    },

    /* ---------------- Ficar na Miúda + labirinto (itens 4, 17, 18) ---------------- */
    layLow: {
      winPolice: 14, // vitória tira 14% de atenção...
      winTimeBonus: 10, // ...e até +10% se escapar rápido (proporcional ao tempo que sobrou)
      winPostCooling: 0.6, // fake news ativas rendem 40% menos na cauda (você sumiu)
      losePolice: 4, // pego no flagra: +4% de atenção
      loseClues: 1, // item 18: perder dá 1 pista ao delegado
    },
    maze: {
      cols: 19, // labirinto ímpar para o gerador (células de corredor nas posições ímpares)
      rows: 13,
      timeLimit: 40, // segundos até a viatura chegar
      playerSpeed: 5.0, // células por segundo
      guardSpeed: 2.4, // patrulha
      chaseSpeed: 4.2, // perseguição (mais lento que o jogador: dá pra fugir)
      delegadoSpeed: 4.6, // o próprio delegado aparece com 2+ pistas e é mais rápido
      baseGuards: 2, // guardas sempre presentes
      guardsPerClue: 1, // cada pista coloca mais um guarda (item 23: delegado interfere)
      extraGuardPolice: 60, // com polícia ≥ 60% entra mais um guarda
      visionRange: 5, // alcance do cone em células
      visionFov: 1.2, // abertura do cone em radianos (~69°)
      loseSight: 3, // segundos até o guarda desistir de perseguir
      shortcutChance: 0.07, // atalhos que criam ciclos no labirinto
    },

    /* ---------------- Queima de Arquivo (item 22) ---------------- */
    shredder: {
      cooldownWeeks: 3, // uso estratégico: no máximo uma vez a cada 3 semanas
      duration: 20, // segundos de partida
      lives: 3, // erros permitidos (prova que escapa ou papel inocente triturado)
      spawnEvery: 0.85, // segundos entre papéis no começo...
      spawnEveryMin: 0.45, // ...e no fim (acelera)
      fallSpeed: 0.22, // telas por segundo
      fallSpeedMax: 0.42,
      evidenceShare: 0.55, // 55% dos papéis são provas
      winClues: -1, // vitória: delegado perde 1 pista
      winPoliceIfNoClue: 8, // sem pista para apagar, tira 8% de atenção
      loseClues: 1, // derrota: delegado ganha 1 pista
    },

    /* ---------------- Contas (itens 6, 13, 14, 15, 16) ----------------
       dueWeek = semana do mês em que vence. cutAfter = semanas de atraso até o final da conta.
       latePenalty = efeito enquanto estiver atrasada.                                   */
    bills: {
      list: [
        { id: "internet", base: 130, dueWeek: 1, cutAfter: 3, latePenalty: { viewsPct: -40 } }, // dia 5; sem internet boa, o alcance despenca
        { id: "aluguel", base: 480, dueWeek: 2, cutAfter: 4, latePenalty: {} }, // dia 10; despejo demora mais (processo)
        { id: "energia", base: 170, dueWeek: 3, cutAfter: 3, latePenalty: { actions: -1 } }, // dia 15; PC desligado metade do tempo
        { id: "agua", base: 100, dueWeek: 3, cutAfter: 3, latePenalty: { repPerWeek: -2 } }, // dia 20; o público sente o cheiro
        { id: "compras", base: 300, dueWeek: 4, cutAfter: 2, latePenalty: { actions: -1 } }, // dia 28; fome derruba rápido
      ],
      firstRentPaid: true, // o 1º aluguel é pago na assinatura do contrato (realista e dá fôlego)
      lateFee: 0.1, // multa de 10% na primeira semana de atraso
      growthPerLevel: 1.38, // cada nível de imóvel encarece as contas em 38%
    },

    /* ---------------- Imóvel: casa → banca (Estilo 5) ----------------
       cost = preço para subir; perk = vantagem acumulada a partir daquele nível.      */
    property: {
      levels: [
        { cost: 0, perk: {} },
        { cost: 1500, perk: { profitPct: 5 } },
        { cost: 3500, perk: { riskPct: 10 } },
        { cost: 6500, perk: { followersWeeklyPct: 1 } },
        { cost: 11000, perk: { profitPct: 10 } },
        { cost: 18000, perk: { repPerWeek: 1 } },
        { cost: 28000, perk: { actions: 1 } },
        { cost: 42000, perk: { profitPct: 15 } },
        { cost: 65000, perk: { policePct: 15 } },
        { cost: 100000, perk: { profitPct: 20 } },
      ],
    },

    /* ---------------- Cauda longa das publicações ---------------- */
    posts: {
      tailRates: [0.3, 0.15, 0.07], // nas 3 semanas seguintes a matéria ainda rende 30%, 15% e 7%
      maxActive: 8, // feed mostra no máximo 8 publicações ativas
    },

    /* ---------------- Upgrades (item 12) ----------------
       Efeitos somam por nível comprado. Textos ficam em js/data/content.js.          */
    upgrades: {
      caps: { profitPct: 60, policePct: 60, viewsPct: 80 }, // tetos para nenhum combo quebrar o jogo
      list: [
        { id: "grupo-vizinhanca", track: "audiencia", cost: [600, 1800, 4500], effect: { viewsPct: [8, 8, 8] } },
        { id: "curso-redacao", track: "cursos", cost: [700, 3000, 12000], effect: { profitPct: [5, 5, 5] } },
        { id: "software-edicao", track: "equipamento", cost: [800, 2200, 4500, 9000], effect: { profitPct: [6, 6, 6, 6] } },
        { id: "curso-fotojornalismo", track: "cursos", cost: [900, 3200, 7000], effect: { viewsPct: [7, 7, 7] } },
        { id: "curso-checagem", track: "cursos", cost: [1000, 3500], effect: { repPerWeek: [1, 1] } },
        { id: "rede-informantes", track: "audiencia", cost: [1000, 2800, 6500], effect: { followersPct: [10, 10, 10] } },
        { id: "chip-pre-pago", track: "seguranca", cost: [900, 2500], effect: { riskFlat: [1, 1] } },
        { id: "celular", track: "equipamento", cost: [1200, 2400, 3200, 4800, 7200, 9800, 12000, 14500], effect: { profitPct: [3, 3, 3, 3, 3, 3, 3, 3], viewsPct: [0, 0, 0, 0, 0, 4, 4, 4] } },
        { id: "estagiario", track: "equipe", cost: [1500], effect: { profitPct: [4], followersPct: [5] }, salary: [90], requires: { property: 2 } },
        { id: "camera", track: "equipamento", cost: [2000, 6000, 9000, 18000, 36000], effect: { viewsPct: [9, 9, 9, 9, 9] }, requires: { property: 2 } },
        { id: "kit-gravacao", track: "equipamento", cost: [2200, 4200], effect: { profitPct: [6, 6] } },
        { id: "computador", track: "equipamento", cost: [2500, 4500, 7000, 14000, 22000, 30000], effect: { profitPct: [4, 4, 4, 4, 4, 4] } },
        { id: "vpn", track: "seguranca", cost: [2500, 6000], effect: { policePct: [8, 8] }, requires: { property: 2 } },
        { id: "tenis-fuga", track: "seguranca", cost: [1200, 3500], effect: { mazeSpeedPct: [12, 12] } }, // novo: ajuda no labirinto
        { id: "fragmentadora", track: "seguranca", cost: [1800, 5000], effect: { shredSlowPct: [15, 15] } }, // novo: ajuda na queima de arquivo
        { id: "editor-plantao", track: "equipe", cost: [14000], effect: { actions: [1] }, salary: [350], requires: { property: 5 } },
      ],
    },

    /* ---------------- Eventos ----------------
       chance = probabilidade por gatilho. money é multiplicado pela escala das contas do imóvel. */
    events: {
      chanceAfterPublish: 0.18, // depois de publicar
      chanceWeekly: 0.25, // no começo da semana
      factCheckMinViews: 6000, // checadores só olham matérias que bombaram
      factCheckChance: 0.12, // chance por fake news ativa, por semana
      ghostMinAge: 4, // "fantasma do passado" só ressuscita matéria com 4+ semanas
      ghostChance: 0.06,
      effects: {
        patrocinio: [{ money: 260, rep: -10 }, { rep: 4 }],
        meme: [{ followersPct: 8, followersMin: 40, police: 3 }],
        tv: [{ followersPct: 18, followersMin: 120, police: 8 }],
        hacker: [{ money: -380, ifBroke: { police: 18 } }, { police: 16 }],
        tiaZap: [{ followersPct: 6, followersMin: 30, rep: -2 }],
        podcast: [{ followersPct: 12, followersMin: 60, police: 5 }, { rep: 2 }],
        sindico: [{ money: -200, ifBroke: { police: 10 } }, { police: 8, rep: -3 }],
        reporter: [{ followersPct: 15, followersMin: 80, police: 9 }, { police: -4 }],
        viatura: [{ police: 10, rep: 4 }, { money: -160, police: -15 }],
        factCheck: [{ police: 8, rep: -6 }, { deletePost: true, police: -3 }],
        ghost: [{ revivePost: true, police: 3 }],
      },
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
