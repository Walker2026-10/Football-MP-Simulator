// src/engines/mediaEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Match, TransferOffer, Injury } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Item de notícia para o feed do jogo.
 */
export interface NewsItem {
  id: string;
  date: string; // YYYY-MM-DD
  headline: string;
  body: string;
  category: 'TRANSFER' | 'MATCH' | 'INJURY' | 'CONTROVERSY' | 'STREAK';
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Pergunta de conferência de imprensa com opções de resposta.
 */
export interface PressConferenceQuestion {
  id: string;
  journalistName: string;
  mediaOutlet: string;
  questionText: string;
  options: {
    text: string;
    moralImpact: number;   // impacto na moral do balneário (-10 a +10)
    boardImpact: number;   // impacto na relação com a direção (-10 a +10)
    fanImpact: number;     // impacto na popularidade com os adeptos (-10 a +10)
  }[];
}

// ============================================================
// FUNÇÕES AUXILIARES (internas)
// ============================================================

/**
 * Gera uma manchete e corpo para uma notícia de jogo.
 */
function generateMatchNews(match: Match, isHighImportance: boolean): { headline: string; body: string } {
  const winner = match.homeScore > match.awayScore ? match.homeTeamName : (match.awayScore > match.homeScore ? match.awayTeamName : 'empate');
  const resultText = match.homeScore === match.awayScore
    ? `empatou ${match.homeScore}-${match.awayScore}`
    : `venceu ${Math.max(match.homeScore, match.awayScore)}-${Math.min(match.homeScore, match.awayScore)}`;

  const headlines = [
    `⚽ ${winner} ${resultText} num jogo emocionante!`,
    `${winner} conquista vitória importante na liga.`,
    `Grande jogo entre ${match.homeTeamName} e ${match.awayTeamName} termina com ${resultText}.`,
  ];

  const bodies = [
    `Num jogo repleto de emoção, ${winner} saiu vitorioso. Os adeptos vibraram com os ${match.homeScore + match.awayScore} golos.`,
    `Com uma exibição consistente, ${winner} garantiu os 3 pontos. O resultado reflete o domínio da equipa.`,
    `O confronto entre ${match.homeTeamName} e ${match.awayTeamName} foi decidido nos detalhes. ${winner} foi mais eficaz.`,
  ];

  const idx = Math.floor(Math.random() * headlines.length);
  return {
    headline: headlines[idx],
    body: bodies[idx],
  };
}

/**
 * Gera uma manchete e corpo para uma notícia de transferência.
 */
function generateTransferNews(offer: TransferOffer): { headline: string; body: string } {
  const action = offer.loan ? 'empréstimo' : 'transferência';
  const headlines = [
    `🤝 ${offer.toClubName} oficializa ${action} de jogador avaliado em ${offer.transferFee.toLocaleString()}€.`,
    `Mercado em movimento: clube concretiza ${action} de destaque.`,
    `Negócio fechado! Jogador ruma ao ${offer.toClubName} por valor milionário.`,
  ];

  const bodies = [
    `O clube anunciou oficialmente a ${action} do jogador. O valor da operação ronda os ${offer.transferFee.toLocaleString()}€.`,
    `A direção confirma a chegada de mais um reforço para a nova época. A expectativa é alta.`,
    `Após várias rondas de negociação, o acordo foi selado. O jogador assinou contrato válido por várias temporadas.`,
  ];

  const idx = Math.floor(Math.random() * headlines.length);
  return {
    headline: headlines[idx],
    body: bodies[idx],
  };
}

/**
 * Gera uma manchete e corpo para uma notícia de lesão.
 */
function generateInjuryNews(playerName: string, injury: Injury): { headline: string; body: string } {
  const headlines = [
    `⚠️ ${playerName} lesiona-se e poderá ficar ${injury.durationDays} dias afastado.`,
    `Golpe duro: ${playerName} sofre lesão ${injury.severity} e preocupa equipa.`,
    `Baixa importante: ${playerName} falha próximos jogos devido a lesão.`,
  ];

  const bodies = [
    `O jogador sofreu uma ${injury.type} durante o treino. A equipa médica estima um período de recuperação de ${injury.durationDays} dias.`,
    `A lesão de ${playerName} é considerada ${injury.severity}. O clube aguarda exames complementares.`,
    `A ausência de ${playerName} é uma perda significativa para o plantel. O treinador terá de encontrar alternativas.`,
  ];

  const idx = Math.floor(Math.random() * headlines.length);
  return {
    headline: headlines[idx],
    body: bodies[idx],
  };
}

/**
 * Gera uma notícia de controvérsia aleatória.
 */
function generateControversyNews(): { headline: string; body: string } {
  const headlines = [
    '🔴 Treinador critica arbitragem e pode ser castigado.',
    '💬 Jogador faz declarações polémicas sobre o clube rival.',
    '📰 Imprensa avança com alegadas desavenças no balneário.',
    '⚖️ Clube envolvido em processo disciplinar por comportamento dos adeptos.',
  ];

  const bodies = [
    'As declarações do treinador após o jogo geraram forte reação. A federação poderá instaurar um processo disciplinar.',
    'As palavras do jogador causaram polémica nas redes sociais. O clube já emitiu um comunicado a tentar amenizar a situação.',
    'Rumores de conflito interno ganham força. A direção nega quaisquer problemas no balneário.',
    'O clube pode ser multado devido ao comportamento dos seus adeptos. A segurança do estádio está a ser revista.',
  ];

  const idx = Math.floor(Math.random() * headlines.length);
  return {
    headline: headlines[idx],
    body: bodies[idx],
  };
}

/**
 * Gera uma notícia de sequência (boa ou má fase).
 */
function generateStreakNews(clubName: string, isPositive: boolean): { headline: string; body: string } {
  if (isPositive) {
    const headlines = [
      `🔥 ${clubName} embala! Quarta vitória consecutiva.`,
      `📈 Momento de forma impressionante para ${clubName}.`,
      `🏆 ${clubName} não perde há 5 jogos.`,
    ];
    const bodies = [
      `A equipa atravessa o melhor momento da época. A confiança está em alta.`,
      `Os resultados sucessivos colocam ${clubName} na luta pelos lugares cimeiros.`,
      `A consistência exibicional tem sido a chave para a série invicta.`,
    ];
    const idx = Math.floor(Math.random() * headlines.length);
    return { headline: headlines[idx], body: bodies[idx] };
  } else {
    const headlines = [
      `😰 ${clubName} em crise: 4 derrotas seguidas.`,
      `📉 Momento negativo: ${clubName} não vence há 5 jogos.`,
      `⚠️ Alerta: ${clubName} aproxima-se da zona de descida.`,
    ];
    const bodies = [
      `A equipa não consegue sair da má fase. A pressão aumenta sobre o treinador.`,
      `Os resultados negativos estão a comprometer os objetivos da época.`,
      `A falta de eficácia e erros defensivos têm sido fatais para ${clubName}.`,
    ];
    const idx = Math.floor(Math.random() * headlines.length);
    return { headline: headlines[idx], body: bodies[idx] };
  }
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Gera um feed de notícias diário com base nos eventos recentes.
 * @param matches - Lista de jogos do dia (já realizados)
 * @param transfers - Lista de propostas de transferência (pendentes ou concretizadas)
 * @param injuries - Lista de lesões ativas
 * @param date - Data atual (formato YYYY-MM-DD)
 * @returns Array de NewsItem
 */
export function generateDailyNews(
  matches: Match[],
  transfers: TransferOffer[],
  injuries: Injury[],
  date: string = new Date().toISOString().slice(0, 10)
): NewsItem[] {
  const news: NewsItem[] = [];

  // 1. Notícias de jogos (se houver jogos com resultado)
  const playedMatches = matches.filter(m => m.played);
  for (const match of playedMatches) {
    // Jogos com muitos golos ou diferença grande são HIGH importance
    const totalGoals = match.homeScore + match.awayScore;
    const goalDiff = Math.abs(match.homeScore - match.awayScore);
    const isHigh = totalGoals >= 5 || goalDiff >= 3;

    const { headline, body } = generateMatchNews(match);
    news.push({
      id: uuidv4(),
      date,
      headline,
      body,
      category: 'MATCH',
      importance: isHigh ? 'HIGH' : 'MEDIUM',
    });
  }

  // 2. Notícias de transferências (apenas as com status 'pending' ou 'accepted')
  const activeTransfers = transfers.filter(t => t.status === 'pending' || t.status === 'accepted');
  for (const offer of activeTransfers.slice(0, 3)) { // limitar a 3 notícias
    const { headline, body } = generateTransferNews(offer);
    news.push({
      id: uuidv4(),
      date,
      headline,
      body,
      category: 'TRANSFER',
      importance: offer.transferFee > 10000000 ? 'HIGH' : 'MEDIUM',
    });
  }

  // 3. Notícias de lesões (apenas lesões graves ou de jogadores importantes)
  const significantInjuries = injuries.filter(i => i.severity === 'Grave' || i.severity === 'Moderada');
  for (const injury of significantInjuries.slice(0, 2)) {
    // Precisamos de um nome de jogador - para simplicidade, usamos um placeholder
    const playerName = 'Jogador' + (Math.floor(Math.random() * 100));
    const { headline, body } = generateInjuryNews(playerName, injury);
    news.push({
      id: uuidv4(),
      date,
      headline,
      body,
      category: 'INJURY',
      importance: injury.severity === 'Grave' ? 'HIGH' : 'MEDIUM',
    });
  }

  // 4. Notícias de controvérsia (probabilidade 30%)
  if (Math.random() < 0.3) {
    const { headline, body } = generateControversyNews();
    news.push({
      id: uuidv4(),
      date,
      headline,
      body,
      category: 'CONTROVERSY',
      importance: 'HIGH',
    });
  }

  // 5. Notícias de sequência (se houver jogos, avaliar sequência de um clube)
  // Simplificado: se houver jogos, simular uma sequência positiva/negativa
  if (playedMatches.length > 0) {
    const isPositive = Math.random() < 0.5;
    const clubName = playedMatches[0].homeTeamName; // usar um clube aleatório
    const { headline, body } = generateStreakNews(clubName, isPositive);
    news.push({
      id: uuidv4(),
      date,
      headline,
      body,
      category: 'STREAK',
      importance: 'MEDIUM',
    });
  }

  // Ordenar por importância (HIGH > MEDIUM > LOW) e depois por data (mais recente primeiro)
  const importanceOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  news.sort((a, b) => {
    if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Limitar a 10 notícias por dia
  return news.slice(0, 10);
}

/**
 * Gera perguntas para uma conferência de imprensa com base num evento desencadeador.
 * @param triggerEvent - O evento que motiva a conferência
 * @param playerName - Nome do jogador/treinador envolvido (opcional)
 * @param clubName - Nome do clube (opcional)
 * @returns Array de PressConferenceQuestion
 */
export function generatePressConference(
  triggerEvent: 'BIG_MATCH' | 'POOR_FORM' | 'NEW_CONTRACT',
  playerName: string = 'o jogador',
  clubName: string = 'o clube'
): PressConferenceQuestion[] {
  const questions: PressConferenceQuestion[] = [];

  // Templates de perguntas por tipo de evento
  const templates: Record<typeof triggerEvent, PressConferenceQuestion[]> = {
    'BIG_MATCH': [
      {
        id: uuidv4(),
        journalistName: 'João Rodrigues',
        mediaOutlet: 'A Bola',
        questionText: `Como encara o grande jogo contra o rival? O que espera do encontro?`,
        options: [
          { text: 'É um jogo como outro qualquer. Vamos dar o nosso melhor.', moralImpact: 0, boardImpact: 0, fanImpact: 5 },
          { text: 'Sabemos da importância deste jogo para os adeptos. Vamos lutar até ao fim.', moralImpact: 5, boardImpact: 5, fanImpact: 10 },
          { text: 'Estamos confiantes. Vamos ganhar e dedicar a vitória aos nossos fãs.', moralImpact: 8, boardImpact: 5, fanImpact: 10 },
          { text: 'O rival é forte, mas acreditamos no nosso plantel.', moralImpact: 3, boardImpact: 0, fanImpact: 3 },
        ],
      },
      {
        id: uuidv4(),
        journalistName: 'Maria Santos',
        mediaOutlet: 'Record',
        questionText: `O que pode dizer aos adeptos que esperam uma grande exibição?`,
        options: [
          { text: 'Sabemos da responsabilidade e vamos dar tudo em campo.', moralImpact: 5, boardImpact: 0, fanImpact: 10 },
          { text: 'A equipa está focada e preparada para responder a essa expectativa.', moralImpact: 3, boardImpact: 0, fanImpact: 5 },
          { text: 'Não prometemos vitórias, mas garantimos garra e determinação.', moralImpact: 0, boardImpact: 0, fanImpact: 5 },
          { text: 'Os adeptos são o nosso 12º jogador. A presença deles dá-nos força.', moralImpact: 5, boardImpact: 0, fanImpact: 10 },
        ],
      },
    ],
    'POOR_FORM': [
      {
        id: uuidv4(),
        journalistName: 'Carlos Silva',
        mediaOutlet: 'O Jogo',
        questionText: `A equipa atravessa um mau momento. O que está a correr mal?`,
        options: [
          { text: 'É uma fase difícil, mas temos confiança no nosso trabalho.', moralImpact: 5, boardImpact: 0, fanImpact: 0 },
          { text: 'Precisamos de mais apoio dos adeptos para sair desta situação.', moralImpact: 0, boardImpact: -5, fanImpact: -5 },
          { text: 'Os resultados não refletem o nosso esforço. Vamos continuar a trabalhar.', moralImpact: 3, boardImpact: 5, fanImpact: 5 },
          { text: 'Cada treinador passa por momentos assim. Acredito na reviravolta.', moralImpact: 5, boardImpact: 5, fanImpact: 0 },
        ],
      },
      {
        id: uuidv4(),
        journalistName: 'Ana Pereira',
        mediaOutlet: 'Mais Futebol',
        questionText: `Há quem diga que a equipa está a perder identidade. O que responde?`,
        options: [
          { text: 'Discordo. A equipa mantém a sua essência, apenas falta eficácia.', moralImpact: 5, boardImpact: 0, fanImpact: 5 },
          { text: 'É normal haver críticas, mas confio no processo e nos jogadores.', moralImpact: 5, boardImpact: 5, fanImpact: 0 },
          { text: 'A identidade constrói-se nos momentos difíceis. Estamos unidos.', moralImpact: 8, boardImpact: 5, fanImpact: 5 },
          { text: 'Não ligo a opiniões externas. O importante é o grupo.', moralImpact: 0, boardImpact: -5, fanImpact: -5 },
        ],
      },
    ],
    'NEW_CONTRACT': [
      {
        id: uuidv4(),
        journalistName: 'Rui Costa',
        mediaOutlet: 'DN Desporto',
        questionText: `Após renovar contrato, quais são os seus objetivos para o futuro?`,
        options: [
          { text: 'Quero ajudar o clube a atingir os seus objetivos e conquistar títulos.', moralImpact: 5, boardImpact: 10, fanImpact: 10 },
          { text: 'Sinto-me em casa. Quero ser uma referência e dar o máximo.', moralImpact: 5, boardImpact: 5, fanImpact: 10 },
          { text: 'O meu foco é melhorar individualmente para contribuir ainda mais.', moralImpact: 3, boardImpact: 0, fanImpact: 5 },
          { text: 'A renovação é um reconhecimento, mas o trabalho continua.', moralImpact: 0, boardImpact: 5, fanImpact: 5 },
        ],
      },
      {
        id: uuidv4(),
        journalistName: 'Sofia Mendes',
        mediaOutlet: 'Correio da Manhã',
        questionText: `Os adeptos esperam muito de si. Sente pressão?`,
        options: [
          { text: 'A pressão faz parte. Estou pronto para assumir essa responsabilidade.', moralImpact: 5, boardImpact: 0, fanImpact: 5 },
          { text: 'Tenho a confiança da direção e isso dá-me tranquilidade.', moralImpact: 0, boardImpact: 10, fanImpact: 0 },
          { text: 'Sei que os adeptos querem vitórias e vou trabalhar para as conquistar.', moralImpact: 5, boardImpact: 0, fanImpact: 10 },
          { text: 'A pressão é um motor. Estou motivado para responder em campo.', moralImpact: 5, boardImpact: 0, fanImpact: 5 },
        ],
      },
    ],
  };

  // Selecionar perguntas com base no triggerEvent
  const selectedTemplates = templates[triggerEvent] || [];
  // Embaralhar ligeiramente a ordem
  const shuffled = selectedTemplates.sort(() => Math.random() - 0.5);
  // Retornar todas (máximo 3)
  return shuffled.slice(0, 3);
}
