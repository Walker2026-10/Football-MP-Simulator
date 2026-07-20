// src/engines/trophyEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Club, Player, Honor, Trophy, LeagueTableEntry as LeagueTableEntryType } from '@/types/game';

// ============================================================
// INTERFACES (exportadas para uso externo)
// ============================================================

/**
 * Representa um troféu/ título conquistado por um clube.
 */
export interface TeamTrophy {
  name: string;
  season: string;
  category: 'league' | 'cup' | 'continental' | 'national';
}

/**
 * Representa um prémio individual atribuído a um jogador.
 */
export interface IndividualAward {
  awardName: string;
  winnerId: string;
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
 * Interface para uma entrada na tabela classificativa da liga (usada em evaluateLeagueWinner).
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
    return b.goalsFor - a.goalsFor;
  });

  const championEntry = sorted[0];
  const runnerUpEntry = sorted[1] || sorted[0];

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
  const eligible = allPlayers.filter(p => p.stats.matchesPlayed > 0);

  if (eligible.length === 0) {
    return {
      ballonDor: null,
      goldenBoy: null,
      goldenBoot: null,
      playmaker: null,
    };
  }

  // 1. Ballon d'Or
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

  // 2. Golden Boy
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

  // 3. Golden Boot
  const topScorer = eligible.reduce((best, current) => {
    return current.stats.goals > best.stats.goals ? current : best;
  }, eligible[0]);

  const goldenBoot: IndividualAward = {
    awardName: 'Golden Boot',
    winnerId: topScorer.id,
    winnerName: topScorer.name,
    season,
  };

  // 4. Playmaker
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
 * @param trophyName - Nome do troféu/prémio
 * @param season - Época
 * @param isIndividual - Se é um prémio individual (true) ou de equipa (false)
 * @returns O jogador atualizado
 */
export function awardPlayerTrophy(
  player: Player,
  trophyName: string,
  season: string,
  isIndividual: boolean = true
): Player {
  const updatedPlayer = { ...player };

  if (!updatedPlayer.honors) {
    updatedPlayer.honors = [];
  }

  const honor: Honor = {
    name: trophyName,
    season,
    type: isIndividual ? ('individual' as const) : ('team' as const),
  };
  updatedPlayer.honors.push(honor);

  let bonusFactor = 0.1;
  if (trophyName.includes('Ballon d\'Or') || trophyName.includes('Golden Boy')) {
    bonusFactor = 0.3;
  } else if (trophyName.includes('Golden Boot') || trophyName.includes('Playmaker')) {
    bonusFactor = 0.2;
  }
  updatedPlayer.marketValue = Math.round(updatedPlayer.marketValue * (1 + bonusFactor) / 1000) * 1000;

  updatedPlayer.sims.happiness = Math.min(100, updatedPlayer.sims.happiness + 10);
  updatedPlayer.sims.morale = 'Excelente';

  return updatedPlayer;
}

/**
 * Regista um troféu coletivo (para o clube).
 * @param club - O clube
 * @param trophyName - Nome do troféu
 * @param season - Época
 * @param category - Categoria do troféu
 * @returns O clube atualizado
 */
export function awardClubTrophy(
  club: Club,
  trophyName: string,
  season: string,
  category: 'league' | 'cup' | 'continental' | 'national'
): Club {
  // Garantir que a lista de troféus existe
  if (!club.trophies) {
    club.trophies = [];
  }

  const teamTrophy: TeamTrophy = {
    name: trophyName,
    season,
    category,
  };
  club.trophies.push(teamTrophy);

  // Aumentar reputação
  const reputationBoost = category === 'continental' ? 10 : (category === 'league' ? 5 : 3);
  club.reputation = Math.min(100, club.reputation + reputationBoost);

  // Bónus financeiro
  const bonus = category === 'continental' ? 5000000 : (category === 'league' ? 2000000 : 1000000);
  club.budget += bonus;

  return club;
}
