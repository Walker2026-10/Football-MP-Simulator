// src/engines/commentaryAndBoardEngine.ts

// ============================================================
// CONSTANTES DE NARRAÇÃO
// ============================================================

const goalPhrases = [
  'GOLOOOOO! Que remate fantástico de {player} para o {club}!',
  'É golo! {player} não perdoa e coloca a bola no fundo da rede!',
  'Golazo! {player} marca um golaço de fora da área! O {club} está na frente!',
  'Finalização implacável de {player}! O guarda-redes não teve hipóteses.',
  '{player} aparece na área e não desperdiça! É golo para o {club}!',
  'Que cabeceamento! {player} sobe mais alto que todos e marca para o {club}.',
];

const cardPhrases = [
  'Cartão amarelo para {player}. Falta dura, mas sem intenção clara.',
  '{player} vê o cartão amarelo por uma entrada imprudente.',
  'O árbitro não hesita e mostra o cartão amarelo a {player}.',
  'Cartão vermelho! {player} é expulso! Que decisão polémica!',
  'Segundo amarelo para {player} e é expulso! O {club} fica com menos um.',
  'Entrada violentíssima de {player}. Vermelho direto!',
];

const chancePhrases = [
  'Grande oportunidade para {player}, mas a bola sai ao lado!',
  '{player} remata com perigo, mas o guarda-redes defende com os punhos.',
  'Que lance! {player} tabela e remata, mas a bola vai para fora.',
  '{player} cabeceia com força, mas a bola passa ao lado do poste.',
  'O guarda-redes faz uma defesa incrível e nega o golo a {player}!',
  '{player} tenta o remate de primeira, mas a bola vai por cima da barra.',
];

const foulPhrases = [
  'Falta dura de {player}. O árbitro assinala a infração.',
  '{player} comete falta no meio-campo. Bola parada para a equipa adversária.',
  'Falta tática de {player} para travar o contra-ataque.',
  '{player} derruba o adversário. Falta perigosa.',
  'Que entrada de {player}! O árbitro não hesita em marcar falta.',
];

const passPhrases = [
  'Passe preciso de {player}. A bola encontra o companheiro.',
  '{player} serve o avançado com um passe perfeito.',
  'Bola longa de {player} para o flanco. Movimentação rápida.',
  '{player} troca passes com o colega e avança no terreno.',
  'Passe de rotura de {player}, que desmonta a defesa adversária.',
];

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Gera um comentário de narração para um evento de jogo.
 * @param minute - Minuto do evento
 * @param eventType - Tipo de evento ('GOAL' | 'CARD' | 'CHANCE' | 'FOUL' | 'PASS')
 * @param playerName - Nome do jogador envolvido
 * @param clubName - Nome do clube do jogador (opcional)
 * @returns Frase de narração formatada
 */
export function generateMatchCommentary(
  minute: number,
  eventType: 'GOAL' | 'CARD' | 'CHANCE' | 'FOUL' | 'PASS',
  playerName: string,
  clubName: string = 'equipa'
): string {
  // Selecionar frase aleatória do pool correspondente
  let phrasePool: string[];

  switch (eventType) {
    case 'GOAL':
      phrasePool = goalPhrases;
      break;
    case 'CARD':
      phrasePool = cardPhrases;
      break;
    case 'CHANCE':
      phrasePool = chancePhrases;
      break;
    case 'FOUL':
      phrasePool = foulPhrases;
      break;
    case 'PASS':
      phrasePool = passPhrases;
      break;
    default:
      phrasePool = ['Evento de jogo não reconhecido.'];
  }

  const rawPhrase = phrasePool[Math.floor(Math.random() * phrasePool.length)];

  // Substituir placeholders pelos valores reais
  let commentary = rawPhrase.replace(/\{player\}/g, playerName);
  commentary = commentary.replace(/\{club\}/g, clubName);

  // Adicionar minuto (excepto para passes, que podem ser mais genéricos)
  if (eventType !== 'PASS' || Math.random() < 0.5) {
    commentary = `[${minute}'] ${commentary}`;
  } else {
    commentary = `${commentary} (${minute}')`;
  }

  return commentary;
}

/**
 * Avalia a satisfação da direção com base no desempenho e situação financeira.
 * @param currentPosition - Posição atual na tabela (ex: 1º, 5º, 18º)
 * @param targetPosition - Posição objetivo para a época (ex: 4º, 10º)
 * @param financialHealth - Saúde financeira do clube (0 a 100)
 * @param managerRating - Avaliação do treinador (0 a 10)
 * @returns Objeto com nível de confiança, mensagem de status e se foi despedido
 */
export function evaluateBoardSatisfaction(
  currentPosition: number,
  targetPosition: number,
  financialHealth: number,
  managerRating: number
): { boardConfidence: number; statusMessage: string; isFired: boolean } {
  // 1. Fator de desempenho desportivo
  // Quanto mais próximo ou acima do objetivo, melhor
  let performanceScore: number;
  if (currentPosition <= targetPosition) {
    // Está dentro ou acima do objetivo
    const diff = targetPosition - currentPosition;
    performanceScore = 70 + Math.min(diff * 5, 30); // 70 a 100
  } else {
    // Está abaixo do objetivo
    const diff = currentPosition - targetPosition;
    // Penalidade máxima de 50 pontos (cai para 20)
    performanceScore = Math.max(20, 70 - diff * 5);
  }

  // 2. Fator financeiro (peso 30%)
  const financialScore = Math.min(100, financialHealth);

  // 3. Avaliação do treinador (peso 20%)
  const ratingScore = Math.min(100, managerRating * 10); // 0-10 -> 0-100

  // 4. Cálculo da confiança ponderada
  const boardConfidence = Math.round(
    performanceScore * 0.5 +
    financialScore * 0.3 +
    ratingScore * 0.2
  );

  // Garantir entre 0 e 100
  const confidence = Math.min(100, Math.max(0, boardConfidence));

  // 5. Determinar mensagem de status e despedimento
  let statusMessage: string;
  let isFired = false;

  if (confidence >= 80) {
    statusMessage = 'A direção está muito satisfeita com o trabalho do treinador. Confiança total!';
  } else if (confidence >= 60) {
    statusMessage = 'A direção está satisfeita, mas espera melhorias nos resultados.';
  } else if (confidence >= 40) {
    statusMessage = 'A direção está preocupada com a evolução da equipa. Pressão aumenta.';
  } else if (confidence >= 20) {
    statusMessage = 'A direção está insatisfeita. Resultados abaixo do esperado.';
  } else {
    statusMessage = 'A direção perdeu completamente a confiança. O treinador está em risco de despedimento.';
  }

  // Se confiança abaixo de 15%, despedido
  if (confidence < 15) {
    isFired = true;
    statusMessage = 'A direção decidiu despedir o treinador após uma série de maus resultados.';
  }

  return {
    boardConfidence: confidence,
    statusMessage,
    isFired,
  };
}
