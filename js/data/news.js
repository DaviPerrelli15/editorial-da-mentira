/* =====================================================================
   NOTÍCIAS: a manchete é montada com [QUEM] [AÇÃO] [ASSUNTO].
   absurd = quanto a parte é absurda (0 a 3): aumenta views, nunca o risco
   (risco só vem dos adesivos, item 8). O id de QUEM e de ASSUNTO é também
   o id da ilustração em js/ui/illustrations.js.
   ===================================================================== */
(function (root) {
  "use strict";
  var EDM = (root.EDM = root.EDM || {});

  var WHO = [
    { id: "prefeitura", text: "A prefeitura", absurd: 0 },
    { id: "cientistas", text: "Cientistas de Itu", absurd: 0 },
    { id: "vizinha", text: "A vizinha do 302", absurd: 1 },
    { id: "sindico", text: "O síndico", absurd: 1 },
    { id: "influencer", text: "Um influencer fitness", absurd: 1 },
    { id: "tia-zap", text: "A tia do grupo da família", absurd: 1 },
    { id: "motoboy", text: "Um motoboy", absurd: 1 },
    { id: "tio-pave", text: "O tio do pavê", absurd: 2 },
    { id: "coach", text: "Um coach quântico", absurd: 2 },
    { id: "astrologo", text: "Um astrólogo de shopping", absurd: 2 },
    { id: "gato", text: "Um gato laranja", absurd: 3 },
    { id: "capivara", text: "A capivara da lagoa", absurd: 3 },
    { id: "pombo", text: "Um pombo da praça", absurd: 3 },
  ];

  var VERB = [
    { id: "anuncia", text: "anuncia que", absurd: 0 },
    { id: "confirma", text: "confirma que", absurd: 0 },
    { id: "descobre", text: "descobre que", absurd: 1 },
    { id: "admite", text: "admite que", absurd: 1 },
    { id: "denuncia", text: "denuncia que", absurd: 1 },
    { id: "garante", text: "garante que", absurd: 1 },
    { id: "revela", text: "revela que", absurd: 2 },
    { id: "jura", text: "jura de pé junto que", absurd: 2 },
    { id: "sonhou", text: "sonhou que", absurd: 2 },
    { id: "print", text: "vazou num print que", absurd: 2 },
    { id: "audio", text: "explica em áudio de 9 minutos que", absurd: 3 },
    { id: "madrugada", text: "postou às 3h da manhã que", absurd: 3 },
  ];

  var TOPIC = [
    { id: "pao", text: "o pão ficou mais barato", absurd: 0 },
    { id: "chuva", text: "vai chover no domingo", absurd: 0 },
    { id: "asfalto", text: "a rua foi asfaltada", absurd: 0 },
    { id: "fila-banco", text: "a fila do banco anda para trás", absurd: 1 },
    { id: "horario-verao", text: "o horário de verão voltou escondido", absurd: 1 },
    { id: "cafezinho", text: "o cafezinho agora é parcelado em 12x", absurd: 1 },
    { id: "wifi", text: "o wi-fi causa saudade", absurd: 2 },
    { id: "boleto", text: "o boleto vence sozinho por pirraça", absurd: 2 },
    { id: "geladeira", text: "a geladeira faz fofoca de madrugada", absurd: 2 },
    { id: "pastel", text: "o pastel de feira agora é só vento", absurd: 2 },
    { id: "segunda", text: "a segunda-feira foi cancelada", absurd: 2 },
    { id: "agua", text: "beber água é opcional", absurd: 3 },
    { id: "feijao", text: "o feijão está fazendo academia", absurd: 3 },
    { id: "microondas", text: "o micro-ondas escuta conversas", absurd: 3 },
    { id: "chinelo", text: "o chinelo da mãe é míssil teleguiado", absurd: 3 },
    { id: "novela", text: "a novela das nove é gravada em Marte", absurd: 3 },
    { id: "lua", text: "a lua é feita de queijo minas", absurd: 3 },
    { id: "pombos-drones", text: "os pombos são drones do governo", absurd: 3 },
  ];

  var PARTS = [WHO, VERB, TOPIC];

  function part(slot, index) {
    var list = PARTS[slot];
    return list[((index % list.length) + list.length) % list.length];
  }

  function absurdity(parts) {
    return part(0, parts[0]).absurd + part(1, parts[1]).absurd + part(2, parts[2]).absurd;
  }

  function randomParts(rng) {
    return PARTS.map(function (list) {
      return EDM.Util.pickIndex(list.length, rng);
    });
  }

  /* Monta o texto final: prefixo do primeiro adesivo + frase base + sufixos. */
  function compose(parts, stickerIds) {
    var base = part(0, parts[0]).text + " " + part(1, parts[1]).text + " " + part(2, parts[2]).text;
    var prefix = "";
    var phrases = "";
    var ending = "";
    (stickerIds || []).forEach(function (id) {
      var s = EDM.Content.stickers[id];
      if (!prefix && s.prefix) prefix = s.prefix + " ";
      if (!s.suffix) return;
      // sufixos que começam com pontuação ("!!!", "... ACORDA!") fecham a frase: só o primeiro entra, no fim
      if (/^[!?.]/.test(s.suffix)) ending = ending || s.suffix;
      else phrases += s.suffix;
    });
    var text = prefix + base + phrases + ending;
    if (!stickerIds || !stickerIds.length) text += ".";
    return (stickerIds || []).length >= 2 ? text.toUpperCase() : text;
  }

  EDM.News = {
    who: WHO,
    verb: VERB,
    topic: TOPIC,
    parts: PARTS,
    part: part,
    absurdity: absurdity,
    randomParts: randomParts,
    compose: compose,
  };
})(typeof window !== "undefined" ? window : globalThis);
