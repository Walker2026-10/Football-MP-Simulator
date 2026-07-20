// src/engines/historyEngine.ts

import { v4 as uuidv4 } from 'uuid';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Resumo estatístico de uma época para um jogador.
 */
export interface SeasonHistory {
  seasonYear: string;           // ex: '2026/2027'
  clubId: string;
  clubName: string;
  appearances: number;
  goals: number;
  assists: number;
  averageRating: number;        // 0.0 a 10.0
  trophiesWon: string[];        // nomes dos troféus conquistados na época
  individualAwards: string[];   // prémios individuais recebidos (ex: 'Ballon d'Or')
}

/**
 * Estatísticas acumuladas de toda a carreira.
 */
export interface CareerStats {
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  careerTrophies: string[];     // todos os troféus de todas as épocas
  hallOfFameStatus: boolean;    // true se o jogador atingiu estatísticas de lenda
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Arquiva o resumo de uma época no histórico do jogador.
 * @param history - Array existente de históricos de épocas
 * @param currentSeasonData - Dados da época que terminou
 * @returns Novo array com a época adicionada (ordenado por ano)
 */
export function archiveSeasonStats(
  history: SeasonHistory[],
  currentSeasonData: SeasonHistory
): SeasonHistory[] {
  // Verificar se já existe registo para esta época (evitar duplicados)
  const existingIndex = history.findIndex(h => h.seasonYear === currentSeasonData.seasonYear);
  let updatedHistory: SeasonHistory[];

  if (existingIndex !== -1) {
    // Substituir o existente
    updatedHistory = [...history];
    updatedHistory[existingIndex] = currentSeasonData;
  } else {
    // Adicionar novo
    updatedHistory = [...history, currentSeasonData];
  }

  // Ordenar por ano (mais recente primeiro)
  updatedHistory.sort((a, b) => {
    // Parse do formato 'YYYY/YYYY'
    const aYear = parseInt(a.seasonYear.split('/')[0]);
    const bYear = parseInt(b.seasonYear.split('/')[0]);
    return bYear - aYear;
  });

  return updatedHistory;
}

/**
 * Calcula as estatísticas acumuladas de toda a carreira a partir do histórico.
 * @param history - Array de SeasonHistory
 * @returns CareerStats com totais e status de Hall da Fama
 */
export function getCareerTotals(history: SeasonHistory[]): CareerStats {
  if (!history || history.length === 0) {
    return {
      totalMatches: 0,
      totalGoals: 0,
      totalAssists: 0,
      careerTrophies: [],
      hallOfFameStatus: false,
    };
  }

  // Acumular estatísticas
  let totalMatches = 0;
  let totalGoals = 0;
  let totalAssists = 0;
  const allTrophies: string[] = [];
  let totalSeasons = history.length;

  for (const season of history) {
    totalMatches += season.appearances || 0;
    totalGoals += season.goals || 0;
    totalAssists += season.assists || 0;

    // Adicionar troféus da época (evitar duplicados)
    if (season.trophiesWon && season.trophiesWon.length > 0) {
      allTrophies.push(...season.trophiesWon);
    }
  }

  // Remover troféus duplicados (caso o mesmo troféu seja ganho em várias épocas, manter todos)
  // Para contagem única, poderíamos usar Set, mas para exibição, mantemos todos.
  // Vamos manter todos, pois cada época pode ganhar o mesmo troféu (ex: campeonato em épocas diferentes)
  // Mas para evitar duplicados exatos, podemos usar Set para limpar.
  const uniqueTrophies = Array.from(new Set(allTrophies));

  // Determinar status de Hall da Fama (critérios: 300+ jogos, 100+ golos, ou 50+ assistências)
  const isHallOfFame =
    totalMatches >= 300 ||
    totalGoals >= 100 ||
    totalAssists >= 50 ||
    (totalMatches >= 200 && totalGoals >= 50) ||
    (totalMatches >= 200 && totalAssists >= 30) ||
    (history.some(h => h.individualAwards && h.individualAwards.includes('Ballon d\'Or')));

  return {
    totalMatches,
    totalGoals,
    totalAssists,
    careerTrophies: uniqueTrophies,
    hallOfFameStatus: isHallOfFame,
  };
}

/**
 * Gera um resumo de época para um jogador com base nos dados atuais.
 * Função auxiliar para criar facilmente um SeasonHistory a partir do estado do jogador.
 * @param player - O jogador (deve ter stats e clubId)
 * @param seasonYear - Ano da época (ex: '2026/2027')
 * @param trophies - Lista de troféus ganhos na época
 * @param awards - Lista de prémios individuais recebidos
 * @returns SeasonHistory preenchido
 */
export function buildSeasonHistory(
  player: { id: string; clubId: string; clubName: string; stats: { matchesPlayed: number; goals: number; assists: number; averageRating: number } },
  seasonYear: string,
  trophies: string[] = [],
  awards: string[] = []
): SeasonHistory {
  return {
    seasonYear,
    clubId: player.clubId,
    clubName: player.clubName || 'Desconhecido',
    appearances: player.stats.matchesPlayed || 0,
    goals: player.stats.goals || 0,
    assists: player.stats.assists || 0,
    averageRating: player.stats.averageRating || 0,
    trophiesWon: trophies,
    individualAwards: awards,
  };
}
