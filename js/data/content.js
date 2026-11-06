/* =====================================================================
   TEXTOS DO JOGO (sem números de balanceamento: esses ficam em config.js).
   Os ids batem com os de EDM.CONFIG.
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  var stickers = {
    sensacionalismo: { name: "Sensacionalismo", prefix: "CHOCANTE:", suffix: "!!!" },
    "teoria-da-conspiracao": { name: "Teoria da Conspiração", prefix: "O QUE ELES ESCONDEM:", suffix: "... ACORDA!" },
    "caca-clique": { name: "Caça-Clique", prefix: "VOCÊ NÃO VAI ACREDITAR:", suffix: ", e o final é surpreendente" },
    "especialista-anonimo": { name: "Especialista Anônimo", prefix: "", suffix: ", afirma especialista que prefere não se identificar" },
    "compartilhe-agora": { name: "Compartilhe Agora", prefix: "URGENTE! REPASSE:", suffix: " (compartilhe antes que apaguem)" },
    "culpa-dos-alienigenas": { name: "Culpa dos Alienígenas", prefix: "CONTATO IMEDIATO?", suffix: ". A verdade está lá fora" },
    "cura-milagrosa": { name: "Cura Milagrosa", prefix: "MÉDICOS ODEIAM:", suffix: " e isso cura tudo em 2 dias" },
  };

  var combos = {
    absurda: "Combo: Manchete Absurda",
    pseudociencia: "Combo: Pseudociência Perigosa",
    panico: "Combo: Pânico Geral",
  };

  var bills = {
    internet: { name: "Internet", icon: "wifi", day: 5, lateEffect: "Internet do vizinho: −40% de views" },
    aluguel: { name: "Aluguel", icon: "home", day: 10, lateEffect: "Proprietário batendo na porta" },
    energia: { name: "Energia", icon: "bolt", day: 15, lateEffect: "PC desligado: −1 ação por semana" },
    agua: { name: "Água", icon: "drop", day: 20, lateEffect: "Sem banho: −2 de reputação por semana" },
    compras: { name: "Compras", icon: "cart", day: 28, lateEffect: "Fraco de fome: −1 ação por semana" },
  };

  /* Item 15: um final diferente para cada conta atrasada (+ prisão). */
  var endings = {
    aluguel: {
      title: "Despejado!",
      text: "O proprietário trocou a fechadura e deixou suas coisas na calçada, com o monitor em cima do colchão. A Gazeta da Manhã agora funciona num banco de praça, com o wi-fi da padaria.",
    },
    internet: {
      title: "Offline para sempre",
      text: "Cortaram a internet. Você tentou continuar imprimindo a Gazeta e colando nos postes, mas a única leitora foi uma senhora que usou a edição para embrulhar peixe.",
    },
    energia: {
      title: "Apagão editorial",
      text: "A luz foi cortada no meio do fechamento. Você escreveu a última manchete à luz de vela, com o celular em 2%, e o sinal acabou antes de clicar em publicar.",
    },
    agua: {
      title: "Seca total",
      text: "Três semanas sem água. Nem o pombo da janela aguentou o cheiro. Os seguidores pediram, educadamente, que você tomasse banho, e depois foram embora.",
    },
    compras: {
      title: "Miojo final",
      text: "A despensa ficou com sal, um sachê de ketchup e um miojo vencido em 2019. Você desmaiou em cima do teclado e a última manchete saiu escrita “jjjjjjjjjj”.",
    },
    prisao: {
      title: "Você foi preso",
      textSim: "Você jogou o HD no micro-ondas, mas o delegado Amaral filmou tudo. Obstrução de justiça, flagrante e meme nacional.",
      textNao: "Você levantou as mãos. Eles levaram o computador, o celular e até o pen drive com fotos do aniversário de 2014. A Gazeta acabou.",
    },
  };

  var prisonSequence = ["06:43", "...", "TOC TOC TOC", "POLÍCIA FEDERAL!", "ABRA A PORTA!", "Você olha para o computador...", "APAGAR ARQUIVOS?"];

  var events = {
    patrocinio: {
      title: "Patrocínio duvidoso",
      icon: "money",
      text: "Uma casa de apostas chamada “Bet do Primo” quer colocar um banner piscante no topo da Gazeta.",
      choices: ["Aceitar o banner", "Recusar com dignidade"],
    },
    meme: {
      title: "Virou figurinha",
      icon: "users",
      text: "Uma das suas manchetes virou figurinha de WhatsApp e está circulando em 4 mil grupos de condomínio.",
      choices: ["Rir e aproveitar"],
    },
    tv: {
      title: "Mencionado na TV",
      icon: "tv",
      text: "O âncora do jornal das 20h criticou o seu site ao vivo. Falem bem ou falem mal...",
      choices: ["...mas falem de mim"],
    },
    hacker: {
      title: "Hacker no painel",
      icon: "lock",
      text: "Alguém invadiu seu painel e ameaça vazar seu nome verdadeiro se você não pagar o resgate.",
      choices: ["Pagar o resgate", "Desafiar o hacker"],
    },
    tiaZap: {
      title: "A tia do zap atacou",
      icon: "phone",
      text: "Sua tia compartilhou sua matéria em 47 grupos com a legenda “VEJAM ISSO ANTES QUE APAGUEM!!!”.",
      choices: ["Obrigado, tia"],
    },
    podcast: {
      title: "Convite para podcast",
      icon: "mic",
      text: "Um podcast de três amigos num sofá quer te entrevistar por quatro horas sobre “a verdade da mídia”.",
      choices: ["Ir e falar demais", "Recusar e manter a pose"],
    },
    sindico: {
      title: "O síndico ficou bravo",
      icon: "alert",
      text: "O síndico do seu prédio se reconheceu numa manchete e ameaça te processar por danos morais.",
      choices: ["Pagar um acordo", "Ignorar e dobrar a aposta"],
    },
    reporter: {
      title: "Repórter no bairro",
      icon: "search",
      text: "Um jornalista de verdade está perguntando aos seus vizinhos sobre o que acontece na sua casa.",
      choices: ["Dar entrevista “exclusiva”", "Não abrir a porta"],
    },
    viatura: {
      title: "Viatura na rua",
      icon: "siren",
      text: "Uma viatura da Polícia Federal parou do outro lado da rua. Tem alguém olhando para a sua janela.",
      choices: ["Continuar trabalhando", "Desligar tudo e queimar papéis"],
    },
    factCheck: {
      title: "Checagem de fatos",
      icon: "search",
      text: "A agência “Fato ou Fake” analisou a sua matéria e carimbou FALSO em vermelho:",
      choices: ["Ignorar e manter no ar", "Apagar a matéria"],
    },
    ghost: {
      title: "Fantasma do passado",
      icon: "flame",
      text: "Um canal de vídeos usou uma matéria antiga sua como fonte. Ela voltou a viralizar:",
      choices: ["Opa, dinheiro de graça"],
    },
  };

  var narrator = {
    welcome: ["Bem-vindo à Gazeta da Manhã. A verdade está de folga."],
    back: ["De volta ao trabalho. A polícia também."],
    clean: [
      "Uma notícia verdadeira. Os leitores estranharam, mas gostaram.",
      "Jornalismo raiz. Rende pouco, mas a mãe tem orgulho.",
      "Nenhum adesivo. O delegado bocejou.",
    ],
    calm: [
      "Pequenas mentiras, pequenas contas pagas.",
      "O país precisava disso. Ninguém pediu, mas precisava.",
      "Tranquilo. Quase honesto. Quase.",
    ],
    risk: [
      "Alguém no bairro ligou a TV e apontou para a sua casa.",
      "O delegado adorou essa. Anotou tudo.",
      "Ousado. A polícia também achou.",
    ],
    combo: [
      "Isso não é jornalismo, é um incêndio com diagramação.",
      "Sua mãe ligou perguntando se você está bem.",
      "A verdade pediu demissão e deixou um bilhete.",
    ],
    crash: [
      "Desmentida em tempo recorde. O checador agradece o expediente.",
      "Caiu antes de imprimir. Pelo menos o print ficou.",
      "O hype despencou. Alguém leu a matéria inteira.",
    ],
    week: ["Semana nova, boletos novos.", "Mais uma semana na Gazeta. O café acabou de novo.", "O galo cantou. O boleto também."],
    layLowWin: ["Você sumiu do mapa. O delegado procurou e não achou nada."],
    layLowLose: ["Te viram pulando o muro. O delegado anotou mais uma pista."],
    shredWin: ["Provas picadas em confete. O delegado perdeu uma pista."],
    shredLose: ["Uma prova escapou da fragmentadora. Direto para a mesa do delegado."],
    noActions: ["Sem ações nesta semana. Encerre a semana para continuar."],
  };

  var comments = [
    "Minha tia já compartilhou",
    "Isso é verdade???",
    "Fui checar e já apagaram!",
    "Eu sempre soube.",
    "Kkkkk vendo aqui na fila do pão",
    "@checador_oficial: fonte?",
    "Já mandei no grupo da família",
    "Pode isso, Arnaldo?",
    "Meu cunhado confirmou",
    "Salvei pra ler depois (não vou ler)",
  ];

  /* Delegado Amaral: fala de acordo com as pistas (0 a 3). */
  var delegado = {
    name: "Delegado Amaral",
    quotes: [
      "Ainda não sabe que você existe.",
      "Anotou seu nome num guardanapo.",
      "Pendurou sua foto no quadro de cortiça.",
      "Já tem o mandado na gaveta.",
    ],
    moods: ["calmo", "desconfiado", "furioso", "furioso"],
  };

  var tracks = {
    equipamento: "Equipamento",
    cursos: "Cursos",
    audiencia: "Audiência",
    seguranca: "Segurança",
    equipe: "Equipe",
  };

  var upgrades = {
    "grupo-vizinhanca": { name: "Grupo da vizinhança", icon: "chat", text: "A fofoca corre de graça pelo grupo do bairro." },
    "curso-redacao": { name: "Curso de redação", icon: "pen", text: "Manchetes mais afiadas vendem mais.", models: ["Curso de redação online", "Curso de jornalismo digital", "Pós em jornalismo"] },
    "software-edicao": { name: "Software de edição", icon: "scissors", text: "Cortes e legendas prendem o público.", models: ["Editor de vídeo grátis", "Editor de vídeo (1 ano)", "Suíte profissional (licença)", "Suíte completa (1 ano)"] },
    "curso-fotojornalismo": { name: "Curso de fotojornalismo", icon: "camera", text: "Foto que conta história viraliza mais.", models: ["Fotografia online", "Workshop de fotojornalismo", "Mentoria com fotógrafo"] },
    "curso-checagem": { name: "Curso de checagem", icon: "check", text: "Você apura melhor e ganha credibilidade toda semana." },
    "rede-informantes": { name: "Rede de informantes", icon: "users", text: "Boca a boca: cada publicação traz mais seguidores." },
    "chip-pre-pago": { name: "Celular da página", icon: "phone", text: "Seu número pessoal fica fora do caso.", models: ["Celular simples + chip pré-pago", "Celular reserva"] },
    celular: { name: "Celular", icon: "phone", text: "Foto, vídeo e edição melhores a cada troca.", models: ["Celular de entrada", "Intermediário", "Intermediário premium", "Topo de linha (2 anos atrás)", "Topo de linha", "Topo de linha Pro", "Topo de linha Pro Max", "Lançamento da semana"] },
    estagiario: { name: "Estagiário", icon: "user", text: "Ajudante barato que apura as fofocas. Cobra salário." },
    camera: { name: "Câmera", icon: "camera", text: "Imagem profissional viraliza muito mais.", models: ["Compacta usada", "Câmera de vlog", "Mirrorless de entrada", "Mirrorless full-frame", "Câmera de cinema"] },
    "kit-gravacao": { name: "Kit de gravação", icon: "mic", text: "Áudio limpo e luz boa: salto real de qualidade.", models: ["Microfone sem fio", "Microfone + softbox"] },
    computador: { name: "Computador", icon: "laptop", text: "Edita mais rápido e sem travar.", models: ["Notebook usado", "Notebook intermediário", "Notebook forte", "Notebook premium", "Notebook profissional", "Estação de trabalho"] },
    vpn: { name: "VPN e proteção", icon: "shield", text: "Dificulta o rastreio: a polícia sobe mais devagar." },
    "tenis-fuga": { name: "Tênis de fuga", icon: "run", text: "Você corre mais rápido no labirinto do Ficar na Miúda." },
    fragmentadora: { name: "Fragmentadora industrial", icon: "shredder", text: "Na Queima de Arquivo, os papéis caem mais devagar." },
    "editor-plantao": { name: "Editor de plantão", icon: "pen", text: "O efeito mais forte: +1 ação por semana. Cobra salário." },
  };

  var effectLabels = {
    profitPct: ["+", "% de lucro"],
    viewsPct: ["+", "% de views"],
    followersPct: ["+", "% de seguidores"],
    riskFlat: ["−", " de risco por publicação"],
    policePct: ["−", "% da atenção policial"],
    actions: ["+", " ação por semana"],
    repPerWeek: ["+", " de reputação por semana"],
    mazeSpeedPct: ["+", "% de velocidade no labirinto"],
    shredSlowPct: ["−", "% na velocidade dos papéis"],
  };

  var perkLabels = {
    profitPct: "+{v}% de lucro",
    riskPct: "−{v}% de risco por publicação",
    followersWeeklyPct: "+{v}% de seguidores por semana",
    repPerWeek: "+{v} de reputação por semana",
    actions: "+{v} ação por semana",
    policePct: "−{v}% de atenção policial",
  };

  var rules = [
    "Monte a manchete clicando em QUEM, AÇÃO e ASSUNTO (ou sorteie).",
    "Cole até 3 adesivos: eles multiplicam o lucro, mas trazem risco ou derrubam a reputação. Notícia sem adesivo não chama a polícia, mas rende pouco.",
    "Ao publicar, a manchete decola: clique em IMPRIMIR antes do crash. Se cair, a matéria é desmentida.",
    "Reputação aumenta as visualizações e a conversão em seguidores. Visualização vira dinheiro.",
    "Pague as contas no post-it antes do vencimento. Cada conta atrasada tem o seu próprio final.",
    "Ficar na Miúda: fuja do labirinto para baixar a atenção policial. Se for pego, o Delegado Amaral ganha uma pista.",
    "Queima de Arquivo: triture as provas para tirar uma pista do delegado (uma vez a cada 3 semanas).",
    "Se a Atenção Policial chegar a 100%, a Polícia Federal bate na sua porta.",
  ];

  EDM.Content = {
    stickers: stickers,
    combos: combos,
    bills: bills,
    endings: endings,
    prisonSequence: prisonSequence,
    events: events,
    narrator: narrator,
    comments: comments,
    delegado: delegado,
    tracks: tracks,
    upgrades: upgrades,
    effectLabels: effectLabels,
    perkLabels: perkLabels,
    rules: rules,
  };
})(typeof window !== "undefined" ? window : globalThis);
