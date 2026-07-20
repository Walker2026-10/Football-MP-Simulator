// src/engines/trophyEngine.ts

import { Club, Player } from '@/types/game';

// ============================================================
// INTERFACES (estruturas de dados para troféus e prémios)
// ============================================================

/**
 * Representa um troféu/ título conquistado por um clube.
 */
export interface Trophy {
  name: string;          // ex: 'Premier League', 'Champions League'
  season: string;        // ex: '2026/2027'
  category: 'league' | 'cup' | 'continental' | 'national';
}

/**
 * Representa um prémio individual atribuído a um jogador.
 */
export interface IndividualAward {
  awardName: string;     // ex: 'Ballon d\'Or', 'Golden Boy', 'Golden Boot', 'Playmaker of the Year'
  winnerId: string;      // ID do jogador vencedor
  winnerName: string;
  season: string;
}

/**
 * Conjunto de prémios individuais da temporada.
 */
export interface SeasonAwards {
  ballonDor: IndividualAward | null;
  goldenBoy: IndividualAward | null;
  goldenBoot: IndividualAward | null;
  playmaker: IndividualAward | null;
}

/**
 * Interface para uma entrada na tabela classificativa da liga.
 */
export interface LeagueTableEntry {
  clubId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Avalia o vencedor da liga com base na tabela.
 * @param leagueTable - Array de entradas da tabela classificativa
 * @param clubs - Lista de todos os clubes (para obter os objetos)
 * @returns Objeto com o campeão e o vice-campeão
 */
export function evaluateLeagueWinner(
  leagueTable: LeagueTableEntry[],
  clubs: Club[]
): { champion: Club; runnerUp: Club } {
  if (leagueTable.length < 2) {
    throw new Error('Tabela com menos de 2 clubes não permite definir campeão e vice.');
  }

  // Ordenar por pontos (decrescente), depois golos (decrescente), depois confronto direto (simplificado)
  const sorted = [...leagueTable].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdA !== gdB) return gdB - gdA;
    return b.goalsFor - a.goalsFor; // mais golos marcados
  });

  const championEntry = sorted[0];
  const runnerUpEntry = sorted[1] || sorted[0]; // se só houver um, repete

  const champion = clubs.find(c => c.id === championEntry.clubId);
  const runnerUp = clubs.find(c => c.id === runnerUpEntry.clubId);

  if (!champion) throw new Error(`Clube campeão não encontrado: ${championEntry.clubId}`);
  if (!runnerUp) throw new Error(`Clube vice-campeão não encontrado: ${runnerUpEntry.clubId}`);

  return { champion, runnerUp };
}

/**
 * Calcula os prémios individuais da temporada com base nas estatísticas de todos os jogadores.
 * @param allPlayers - Lista de todos os jogadores (de todas as equipas)
 * @param season - Identificador da época (ex: '2026/2027')
 * @returns Objeto SeasonAwards com os vencedores (ou null se não houver candidatos)
 */
export function calculateSeasonAwards(allPlayers: Player[], season: string): SeasonAwards {
  // Filtrar jogadores que tenham pelo menos 1 jogo disputado
  const eligible = allPlayers.filter(p => p.stats.matchesPlayed > 0);

  if (eligible.length === 0) {
    return {
      ballonDor: null,
      goldenBoy: null,
      goldenBoot: null,
      playmaker: null,
    };
  }

  // 1. Ballon d'Or: melhor jogador do ano (baseado em overall + contribuições)
  const bestOverall = eligible.reduce((best, current) => {
    const score = current.overall + (current.stats.goals * 0.3) + (current.stats.assists * 0.2) + (current.stats.averageRating * 0.5);
    const bestScore = best.overall + (best.stats.goals * 0.3) + (best.stats.assists * 0.2) + (best.stats.averageRating * 0.5);
    return score > bestScore ? current : best;
  }, eligible[0]);

  const ballonDor: IndividualAward = {
    awardName: 'Ballon d\'Or',
    winnerId: bestOverall.id,
    winnerName: bestOverall.name,
    season,
  };

  // 2. Golden Boy: melhor jogador com 21 anos ou menos
  const youngPlayers = eligible.filter(p => p.age <= 21);
  let goldenBoy: IndividualAward | null = null;
  if (youngPlayers.length > 0) {
    const bestYoung = youngPlayers.reduce((best, current) => {
      const score = current.overall + current.stats.goals + current.stats.assists;
      const bestScore = best.overall + best.stats.goals + best.stats.assists;
      return score > bestScore ? current : best;
    }, youngPlayers[0]);

    goldenBoy = {
      awardName: 'Golden Boy',
      winnerId: bestYoung.id,
      winnerName: bestYoung.name,
      season,
    };
  }

  // 3. Golden Boot: mais golos
  const topScorer = eligible.reduce((best, current) => {
    return current.stats.goals > best.stats.goals ? current : best;
  }, eligible[0]);

  const goldenBoot: IndividualAward = {
    awardName: 'Golden Boot',
    winnerId: topScorer.id,
    winnerName: topScorer.name,
    season,
  };

  // 4. Playmaker do Ano: mais assistências
  const topAssist = eligible.reduce((best, current) => {
    return current.stats.assists > best.stats.assists ? current : best;
  }, eligible[0]);

  const playmaker: IndividualAward = {
    awardName: 'Playmaker of the Year',
    winnerId: topAssist.id,
    winnerName: topAssist.name,
    season,
  };

  return {
    ballonDor,
    goldenBoy,
    goldenBoot,
    playmaker,
  };
}

/**
 * Regista um troféu ou prémio individual no histórico de um jogador,
 * atualizando o seu valor de mercado e moral.
 * @param player - O jogador a ser agraciado
 * @param trophyName - Nome do troféu/prémio (ex: 'Ballon d\'Or', 'Premier League')
 * @param season - Época (ex: '2026/2027')
 * @param isIndividual - Se é um prémio individual (true) ou de equipa (false)
 * @returns O jogador atualizado com o novo registo
 */
export function awardPlayerTrophy(
  player: Player,
  trophyName: string,
  season: string,
  isIndividual: boolean = true
): Player {
  // Clonar o jogador para não modificar o original
  const updatedPlayer = { ...player };

  // Inicializar histórico de honras se não existir
  if (!updatedPlayer.honors) {
    updatedPlayer.honors = [];
  }

  // Adicionar o troféu
  const honor = {
    name: trophyName,
    season,
    type: isIndividual ? 'individual' : 'team',
  };
  updatedPlayer.honors.push(honor);

  // Atualizar valor de mercado (bónus de 10% a 30% consoante o prestígio)
  let bonusFactor = 0.1;
  if (trophyName.includes('Ballon d\'Or') || trophyName.includes('Golden Boy')) {
    bonusFactor = 0.3;
  } else if (trophyName.includes('Golden Boot') || trophyName.includes('Playmaker')) {
    bonusFactor = 0.2;
  }
  updatedPlayer.marketValue = Math.round(updatedPlayer.marketValue * (1 + bonusFactor) / 1000) * 1000;

  // Aumentar moral e felicidade
  updatedPlayer.sims.happiness = Math.min(100, updatedPlayer.sims.happiness + 10);
  updatedPlayer.sims.morale = 'Excelente'; // sobe para o máximo

  // Aumentar reputação implícita (aqui apenas um log, mas poderia ser usado para outras mecânicas)
  // Não temos campo de reputação no Player, mas podemos adicionar um futuro.

  return updatedPlayer;
}
