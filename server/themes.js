// Temas do ITO - 100 temas do folheto oficial
const themes = [
  { id: 1, title: "Mangá / anime famoso", min: "desconhecido", max: "famoso" },
  { id: 2, title: "Pessoas famosas que você gostaria de ser", min: "não gostaria de ser", max: "gostaria de ser" },
  { id: 3, title: "Coisas que te dão medo", min: "nem um sustinho", max: "morreria de medo" },
  { id: 4, title: "Coisas que você não conseguiria perdoar", min: "nada demais", max: "imperdoável" },
  { id: 5, title: "Mentiras que você acreditaria", min: "não acreditaria", max: "acreditaria com certeza" },
  { id: 6, title: "Esportes mais conhecidos", min: "pouca gente conhece", max: "muito popular" },
  { id: 7, title: "Lugares onde você gostaria de morar", min: "não ficaria lá 5 minutos", max: "passaria lá a eternidade" },
  { id: 8, title: "Itens do dia a dia que poderiam ser boas armas", min: "nem arranha", max: "arma forte" },
  { id: 9, title: "Coisas que você ficaria olhando com admiração o dia inteiro", min: "nem pararia pra olhar", max: "ficaria olhando por horas" },
  { id: 10, title: "Habilidades importantes para ser líder", min: "não importante", max: "essencial" },
  { id: 11, title: "Contos de fadas populares", min: "desconhecido", max: "popular" },
  { id: 12, title: "Poderes especiais que você gostaria de ter", min: "não gostaria", max: "gostaria" },
  { id: 13, title: "Coisas que te fazem feliz", min: "não te faz feliz", max: "felicidade pura" },
  { id: 14, title: "Atletas famosos", min: "sei nem quem é", max: "grande campeão" },
  { id: 15, title: "Personagens da ficção que você gostaria de ser", min: "não seria", max: "seria muito" },
  { id: 16, title: "Personagens da ficção com quem você gostaria de ter um encontro", min: "não valeria um encontro", max: "provavelmente casaria" },
  { id: 17, title: "Filmes conhecidos", min: "ninguém viu", max: "todo mundo assistiu" },
  { id: 18, title: "Coisas nas quais você gostaria de ficar em imersão", min: "não, obrigado", max: "quero uma piscina cheia disso" },
  { id: 19, title: "Sabores de sorvete que poderiam ser deliciosos", min: "credo, horrível!", max: "comeria toneladas" },
  { id: 20, title: "Itens / armas que você gostaria de ter para lutar contra zumbis", min: "é pra fazer cosquinha?", max: "adiós, zumbi!" },
  { id: 21, title: "Atletas famosos", min: "sei nem quem é", max: "grande campeão" },
  { id: 22, title: "Personagens da ficção que você gostaria de ser", min: "não seria", max: "seria muito" },
  { id: 23, title: "Coisas que cheiram bem", min: "cheiro normal", max: "faria um perfume disso" },
  { id: 24, title: "Coisas que você gostaria de fazer quando se aposentar", min: "não faria", max: "faria com toda certeza" },
  { id: 25, title: "Coisas importantes para fazer sucesso nas mídias sociais", min: "pouco importante", max: "obrigatório" },
  { id: 26, title: "Comidas famosas", min: "pouca gente conhece", max: "encontradas em todo o mundo" },
  { id: 27, title: "Celebridades de filmes e séries mais conhecidas da atualidade", min: "fez poucas participações", max: "está sempre nos lançamentos" },
  { id: 28, title: "Coisas que você gostaria de ter como souvenir", min: "não teria isso", max: "teria mais de mil" },
  { id: 29, title: "Coisas difíceis de suportar", min: "não tão difícil", max: "praticamente impossível" },
  { id: 30, title: "Habilidades essenciais para um comediante", min: "desnecessária", max: "obrigatória" },
  { id: 31, title: "Coisas pesadas", min: "levinho", max: "pesado" },
  { id: 32, title: "Figuras históricas populares", min: "sei nem quem é", max: "figura importante" },
  { id: 33, title: "Coisas que você desejava quando criança", min: "nem queria", max: "queria pra caramba" },
  { id: 34, title: "Coisas úteis em uma casa", min: "inútil", max: "muito útil" },
  { id: 35, title: "Coisas que fazem você se sentir amado(a)", min: "não faz", max: "é puro amor" },
  { id: 36, title: "Canções famosas", min: "ninguém conhece", max: "todo mundo canta junto" },
  { id: 37, title: "Marcas mais valiosas", min: "vale pouco", max: "vale bilhões" },
  { id: 38, title: "Coisas que você quer fazer logo quando acorda", min: "não quero fazer", max: "quero muito" },
  { id: 39, title: "Sons que te fazem feliz", min: "nem é som", max: "felicidade para os ouvidos" },
  { id: 40, title: "Pense como um estudante do ensino médio: o que é legal?", min: "cringe", max: "super legal" },
  { id: 41, title: "Presentes de aniversário mais comuns", min: "ninguém ganha", max: "todo mundo já ganhou" },
  { id: 42, title: "Países populares para viajar", min: "ninguém vai", max: "todo mundo já foi" },
  { id: 43, title: "Coisas que te fazem feliz quando feitas pelo seu amor", min: "pouco feliz", max: "muito feliz" },
  { id: 44, title: "Animais nos quais você gostaria de montar", min: "não gostaria", max: "queria demais" },
  { id: 45, title: "Pense como uma criança: o que te faz feliz?", min: "não te faz muito feliz", max: "isso sim é felicidade" },
  { id: 46, title: "Vilões mais temíveis", min: "até eu encarava", max: "me faz ter pesadelos" },
  { id: 47, title: "Coisas fofinhas", min: "pouco fofinho", max: "um cuti-cuti" },
  { id: 48, title: "Atividades difíceis de serem feitas sozinho(a)", min: "dá pra fazer", max: "impossível" },
  { id: 49, title: "Habilidades úteis para o trabalho", min: "inútil", max: "muito útil" },
  { id: 50, title: "Pense como um gato: os lugares mais confortáveis do mundo", min: "pouco confortável", max: "muito confortável" },
  { id: 51, title: "Tamanho de animais", min: "pequeno", max: "enorme" },
  { id: 52, title: "Coisas leves", min: "pouco leve", max: "levíssimo" },
  { id: 53, title: "Frases estranhas se ditas por uma criança de 5 anos", min: "normal", max: "muito estranho" },
  { id: 54, title: "Algo que te surpreenderia se fosse achado embaixo de uma pedra no parque", min: "algo comum", max: "algo surpreendente" },
  { id: 55, title: "Coisas confiáveis por todo o sempre", min: "pouco confiável", max: "confiável eternamente" },
  { id: 56, title: "Lugares onde você vai com frequência", min: "vai pouco", max: "vai muito" },
  { id: 57, title: "Drinques populares", min: "ninguém bebe isso", max: "todo mundo já bebeu" },
  { id: 58, title: "Pedidos de casamento que te fariam feliz", min: "aquele de passar vergonha", max: "algo memorável" },
  { id: 59, title: "Itens encontrados em um baú do tesouro que você gostaria de ter", min: "não gostaria", max: "queria muito" },
  { id: 60, title: "Tipos de festivais que você gostaria de participar", min: "não iria nem pagando", max: "gastaria o salário pra ir" },
  { id: 61, title: "Brinquedos mais conhecidos", min: "desconhecido", max: "toda criança já teve um" },
  { id: 62, title: "Coisas que te deixam com sono", min: "acordadíssimo", max: "zzzzz…" },
  { id: 63, title: "Itens úteis quando você está perdido(a) no deserto", min: "não serve para nada", max: "salvaria sua vida" },
  { id: 64, title: "Momentos históricos que você visitaria se tivesse uma máquina do tempo", min: "fuja, louco!", max: "iria agora" },
  { id: 65, title: "Pense como um vilão: qual seria o personagem heróico que você menos gostaria de enfrentar?", min: "derrotaria facilmente", max: "tenho medo até da sombra" },
  { id: 66, title: "Palavras que você gostaria de ouvir", min: "praticamente uma ofensa", max: "mais que um elogio" },
  { id: 67, title: "Veículos mais comuns", min: "nunca vi", max: "tem um em cada esquina" },
  { id: 68, title: "Coisas que te surpreenderiam se saíssem do seu corpo", min: "normal", max: "não dá pra imaginar isso" },
  { id: 69, title: "Alimentos que fazem bem", min: "nada saudável", max: "puro suco de saúde" },
  { id: 70, title: "Pense como um cientista: o que você gostaria de descobrir?", min: "não gostaria de descobrir", max: "merece um Nobel" },
  { id: 71, title: "Itens úteis para levar a uma ilha deserta", min: "inútil", max: "muito útil" },
  { id: 72, title: "Piadas mais engraçadas", min: "isso é ofensivo", max: "ri litros" },
  { id: 73, title: "Melhores nomes de golpes especiais para gritar", min: "não botou medo", max: "isso sim impõe respeito" },
  { id: 74, title: "Títulos de livros que te deixariam curioso para saber seu conteúdo", min: "ninguém se importa", max: "vou comprar" },
  { id: 75, title: "Pense como um cachorro: o que te faz feliz?", min: "nada AU-AUdacioso", max: "de balançar a cauda" },
  { id: 76, title: "Melhores jogos de tabuleiro já lançados", min: "aquele que flopou muito", max: "digno de um prêmio Spiel" },
  { id: 77, title: "Itens diferentões que você gostaria de ter", min: "nem tanto", max: "isso é muito legal" },
  { id: 78, title: "Características de pessoas que você gostaria de ter em seu círculo de amizade", min: "nada interessante", max: "BFF na certa" },
  { id: 79, title: "Pense como um mago: qual seria o seu feitiço favorito?", min: "feitiço comum", max: "usaria toda hora" },
  { id: 80, title: "Coisas que surpreenderiam se fossem ditas por um professor", min: "faz parte da aula", max: "por essa ninguém esperava" },
  { id: 81, title: "As coisas mais bonitas do mundo", min: "ok", max: "visão do paraíso" },
  { id: 82, title: "Os doces mais conhecidos", min: "nunca vi, nem comi, só ouço falar", max: "vende em todo lugar" },
  { id: 83, title: "Amor verdadeiro ou apenas uma aventura?", min: "aventura", max: "amor verdadeiro" },
  { id: 84, title: "Pense como um herói: qual seria sua pose? (demonstre-a)", min: "lamentável", max: "épica" },
  { id: 85, title: "Mundos imaginários que você gostaria de visitar", min: "não gostaria", max: "viveria lá o resto da vida" },
  { id: 86, title: "Coisas populares com crianças", min: "pouco conhecida", max: "muito famosa" },
  { id: 87, title: "Os nomes mais legais", min: "muito comum", max: "meu filho vai ter" },
  { id: 88, title: "Coisas que você faz quando está de bom humor", min: "nunca faço", max: "faço muito" },
  { id: 89, title: "Pense como um explorador: que lugares te deixam animado?", min: "um desânimo só", max: "bora lá, agora?" },
  { id: 90, title: "Habilidades úteis em relacionamentos", min: "inútil", max: "essencial" },
  { id: 91, title: "Personagens mais fortes da ficção", min: "fraco demais", max: "indestrutível" },
  { id: 92, title: "Lugares onde mais acontecem encontros românticos", min: "poucos encontros", max: "está acontecendo um agora" },
  { id: 93, title: "Um único prato pra comer até o fim da vida", min: "não escolheria", max: "comeria agora, inclusive" },
  { id: 94, title: "Pense como um adolescente: o que seria algo ruim se acontecesse durante a aula?", min: "nem tão ruim", max: "que vergonha!" },
  { id: 95, title: "Personagens fictícios com os piores temperamentos", min: "de boas", max: "explosivo" },
  { id: 96, title: "Coisas que você ficaria feliz em encontrar no seu bolso ou bolsa", min: "nada feliz", max: "alegria pura" },
  { id: 97, title: "Caretas engraçadas (faça-as)", min: "isso é ridículo", max: "muito engraçado!" },
  { id: 98, title: "Ações e atitudes que exigem coragem", min: "nada corajoso", max: "pura coragem" },
  { id: 99, title: "Se você tivesse um alter ego, o que gostaria que ele fosse?", min: "não gostaria", max: "é meu tipo" },
  { id: 100, title: "Habilidades importantes para um streamer", min: "desnecessária", max: "obrigatória" },
  // Novos temas adicionados
  { id: 101, title: "Músicas para cantar no karaokê", min: "ninguém conhece", max: "todo mundo canta junto" },
  { id: 102, title: "Coisas que você faria por 1 milhão de reais", min: "nem por 10 milhões", max: "faria de graça" },
  { id: 103, title: "Profissões mais estressantes", min: "relaxante", max: "infarto garantido" },
  { id: 104, title: "Comidas para comer às 3h da manhã", min: "nem pensar", max: "perfeito pra madrugada" },
  { id: 105, title: "Coisas que você compraria se ganhasse na loteria", min: "não compraria", max: "primeira coisa da lista" },
  { id: 106, title: "Desculpas para não ir trabalhar", min: "ninguém acredita", max: "desculpa perfeita" },
  { id: 107, title: "Coisas que te irritam no trânsito", min: "nem ligo", max: "dá vontade de buzinar" },
  { id: 108, title: "Séries para maratonar", min: "desisti no piloto", max: "viciei completamente" },
  { id: 109, title: "Coisas constrangedoras de fazer em público", min: "normal", max: "morreria de vergonha" },
  { id: 110, title: "Melhores lugares para um primeiro encontro", min: "péssima ideia", max: "lugar perfeito" },
  { id: 111, title: "Coisas que você esconderia dos seus pais", min: "contaria tranquilo", max: "segredo eterno" },
  { id: 112, title: "Animais mais perigosos", min: "inofensivo", max: "fuja imediatamente" },
  { id: 113, title: "Piores coisas para pisar descalço", min: "de boa", max: "dor insuportável" },
  { id: 114, title: "Coisas que você faz quando ninguém está olhando", min: "faço na frente de todos", max: "segredo absoluto" },
  { id: 115, title: "Melhores férias possíveis", min: "prefiro trabalhar", max: "férias dos sonhos" },
  { id: 116, title: "Coisas mais satisfatórias", min: "tanto faz", max: "satisfação pura" },
  { id: 117, title: "Piores coisas para esquecer", min: "sem problema", max: "catástrofe total" },
  { id: 118, title: "Jogos de videogame mais viciantes", min: "larguei rápido", max: "perdi noites de sono" },
  { id: 119, title: "Coisas que te fazem sentir velho(a)", min: "ainda sou jovem", max: "me senti um dinossauro" },
  { id: 120, title: "Superpoderes mais úteis no dia a dia", min: "inútil", max: "resolveria minha vida" },
];

// Get random themes for voting
function getRandomThemes(count = 3) {
  const shuffled = [...themes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get theme by ID
function getThemeById(id) {
  return themes.find(t => t.id === id);
}

// Get random theme number (for the number draw animation)
function getRandomThemeNumber() {
  return Math.floor(Math.random() * 120) + 1; // 1 to 120
}

// Get themes around a specific number (e.g., num=62 returns themes 60-64)
function getThemesAroundNumber(num, range = 2) {
  const maxTheme = 120; // Total de temas disponíveis

  // Calculate start and end, keeping within 1-maxTheme
  let start = num - range;
  let end = num + range;

  // Adjust if we're near the edges
  if (start < 1) {
    start = 1;
    end = Math.min(1 + range * 2, maxTheme);
  }
  if (end > maxTheme) {
    end = maxTheme;
    start = Math.max(maxTheme - range * 2, 1);
  }

  // Get themes in that range
  const result = [];
  for (let i = start; i <= end; i++) {
    const theme = themes.find(t => t.id === i);
    if (theme) {
      result.push(theme);
    }
  }

  return result;
}

module.exports = {
  themes,
  getRandomThemes,
  getThemeById,
  getRandomThemeNumber,
  getThemesAroundNumber,
};
