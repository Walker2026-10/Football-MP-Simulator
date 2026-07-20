// src/engines/competitionEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Club } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Representa uma entrada na tabela classificativa de uma liga.
 */
export interface LeagueTableEntry {
  rank: number;             // posição na tabela
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;   // goalsFor - goalsAgainst
  points: number;
}

/**
 * Representa um jogo de eliminatória (Taça).
 */
export interface CupFixture {
  id: string;
  roundName: string;        // ex: '1/16', 'Oitavos', 'Quartos', 'Meias', 'Final'
  homeClubId: string;
  awayClubId: string;
  homeGoals: number | null; // null se ainda não jogado
  awayGoals: number | null;
  penaltyWinnerId: string | null; // ID do clube vencedor nos penáltis (se aplicável)
  isCompleted: boolean;
  matchDate: string;        // formato YYYY-MM-DD
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Ordena a tabela por: Pontos (desc), Diferença de Golos (desc), Golos Marcados (desc).
 * Atualiza o campo 'rank' de cada entrada.
 * @param table - Array de entradas da tabela
 * @returns O mesmo array, ordenado e com ranks atualizados
 */
function sortAndRankTable(table: LeagueTableEntry[]): LeagueTableEntry[] {
  // Ordenar cópia para não mutar a original directamente
  const sorted = [...table].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Atribuir ranks (com empates, mas simplificamos: ranks 1,2,3,...)
  sorted.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return sorted;
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Atualiza a tabela da liga com base no resultado de uma partida.
 * @param table - Tabela actual (array de LeagueTableEntry)
 * @param matchResult - Resultado do jogo (IDs dos clubes e golos)
 * @returns Nova tabela ordenada e com ranks atualizados
 */
export function updateLeagueTable(
  table: LeagueTableEntry[],
  matchResult: { homeId: string; awayId: string; homeGoals: number; awayGoals: number }
): LeagueTableEntry[] {
  // Encontrar as entradas dos dois clubes
  const homeEntry = table.find(e => e.clubId === matchResult.homeId);
  const awayEntry = table.find(e => e.clubId === matchResult.awayId);

  if (!homeEntry || !awayEntry) {
    throw new Error('Clube não encontrado na tabela.');
  }

  // Clonar as entradas para não modificar o original (imutabilidade)
  const updatedHome = { ...homeEntry };
  const updatedAway = { ...awayEntry };

  // Incrementar jogos
  updatedHome.played += 1;
  updatedAway.played += 1;

  // Atualizar golos
  updatedHome.goalsFor += matchResult.homeGoals;
  updatedHome.goalsAgainst += matchResult.awayGoals;
  updatedAway.goalsFor += matchResult.awayGoals;
  updatedAway.goalsAgainst += matchResult.homeGoals;

  // Atualizar resultados (vitória/derrota/empate)
  if (matchResult.homeGoals > matchResult.awayGoals) {
    updatedHome.won += 1;
    updatedHome.points += 3;
    updatedAway.lost += 1;
  } else if (matchResult.homeGoals < matchResult.awayGoals) {
    updatedAway.won += 1;
    updatedAway.points += 3;
    updatedHome.lost += 1;
  } else {
    updatedHome.drawn += 1;
    updatedHome.points += 1;
    updatedAway.drawn += 1;
    updatedAway.points += 1;
  }

  // Recalcular diferença de golos
  updatedHome.goalDifference = updatedHome.goalsFor - updatedHome.goalsAgainst;
  updatedAway.goalDifference = updatedAway.goalsFor - updatedAway.goalsAgainst;

  // Substituir entradas antigas pelas novas
  const newTable = table.map(entry => {
    if (entry.clubId === updatedHome.clubId) return updatedHome;
    if (entry.clubId === updatedAway.clubId) return updatedAway;
    return entry;
  });

  // Ordenar e atribuir ranks
  return sortAndRankTable(newTable);
}

/**
 * Gera o sorteio das eliminatórias de uma taça (eliminação directa).
 * @param clubs - Lista de clubes participantes (número deve ser potência de 2)
 * @param roundName - Nome da ronda (ex: 'Oitavos', 'Quartos')
 * @param matchDate - Data base para os jogos (ex: '2027-01-15')
 * @returns Array de fixtures (jogos) com os confrontos sorteados aleatoriamente
 */
export function generateCupDraw(
  clubs: Club[],
  roundName: string,
  matchDate: string = new Date().toISOString().slice(0, 10)
): CupFixture[] {
  if (clubs.length < 2) {
    throw new Error('São necessários pelo menos 2 clubes para gerar uma eliminatória.');
  }

  // Verificar se o número de clubes é potência de 2 (opcional, mas recomendado)
  // Se não for, podemos adicionar 'bye' mas simplificamos: se ímpar, um clube avança automático.
  // Por simplicidade, vamos apenas embaralhar e emparelhar.
  const shuffled = [...clubs].sort(() => Math.random() - 0.5);
  const fixtures: CupFixture[] = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    // Se sobrar um clube (número ímpar), avança automaticamente (bypass)
    if (i + 1 >= shuffled.length) {
      // Não criamos fixture, apenas adicionamos um log ou poderíamos criar um jogo vazio.
      // Vamos criar um fixture com o mesmo clube em ambos os lados (walkover)
      fixtures.push({
        id: uuidv4(),
        roundName,
        homeClubId: shuffled[i].id,
        awayClubId: shuffled[i].id, // mesmo clube (walkover)
        homeGoals: null,
        awayGoals: null,
        penaltyWinnerId: null,
        isCompleted: false,
        matchDate,
      });
      continue;
    }

    fixtures.push({
      id: uuidv4(),
      roundName,
      homeClubId: shuffled[i].id,
      awayClubId: shuffled[i + 1].id,
      homeGoals: null,
      awayGoals: null,
      penaltyWinnerId: null,
      isCompleted: false,
      matchDate,
    });
  }

  return fixtures;
}

/**
 * Processa um jogo de Taça, simulando o resultado e possíveis penalties.
 * @param fixture - O fixture a processar (deve ter homeClubId e awayClubId preenchidos)
 * @param simulateScore - Função opcional para simular o resultado (por omissão, usa simulação simples)
 * @returns O fixture actualizado com o resultado e isCompleted = true
 */
export function processCupMatch(
  fixture: CupFixture,
  simulateScore?: (homeId: string, awayId: string) => { homeGoals: number; awayGoals: number }
): CupFixture {
  // Se já estiver completado, retornar o mesmo
  if (fixture.isCompleted) {
    return fixture;
  }

  // Se for walkover (mesmo clube em ambos), considerar vitória automática (1-0)
  if (fixture.homeClubId === fixture.awayClubId) {
    return {
      ...fixture,
      homeGoals: 1,
      awayGoals: 0,
      penaltyWinnerId: null,
      isCompleted: true,
    };
  }

  // Usar função de simulação fornecida ou a padrão
  const defaultSimulate = (homeId: string, awayId: string) => {
    // Simples: resultado aleatório com base em força fictícia
    // Nota: num cenário real, usaríamos os atributos das equipas
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 3);
    return { homeGoals, awayGoals };
  };

  const sim = simulateScore || defaultSimulate;
  const { homeGoals, awayGoals } = sim(fixture.homeClubId, fixture.awayClubId);

  let penaltyWinnerId: string | null = null;
  let finalHomeGoals = homeGoals;
  let finalAwayGoals = awayGoals;

  // Se empate, desempate por grandes penalidades (simulação simples)
  if (homeGoals === awayGoals) {
    // Simular penáltis: cada equipa marca 0 a 5 penáltis, com 80% de probabilidade de marcar cada
    const homePenalties = Array.from({ length: 5 }, () => Math.random() < 0.8).filter(Boolean).length;
    const awayPenalties = Array.from({ length: 5 }, () => Math.random() < 0.8).filter(Boolean).length;

    if (homePenalties > awayPenalties) {
      penaltyWinnerId = fixture.homeClubId;
    } else if (awayPenalties > homePenalties) {
      penaltyWinnerId = fixture.awayClubId;
    } else {
      // Em caso de empate nos penáltis, sorteio (moeda ao ar)
      penaltyWinnerId = Math.random() < 0.5 ? fixture.homeClubId : fixture.awayClubId;
    }

    // Em jogos de taça, após penalties, o vencedor é declarado, mas o resultado final fica empatado.
    // Vamos manter os golos empatados e indicar o vencedor nos penáltis.
    // Para simplificar, atribuímos um golo extra ao vencedor (estilo FIFA) – mas mantemos os valores originais.
    // Uma abordagem mais limpa: deixar os golos como estão e usar penaltyWinnerId para decidir.
    // Não alteramos os golos finais.
  }

  return {
    ...fixture,
    homeGoals: finalHomeGoals,
    awayGoals: finalAwayGoals,
    penaltyWinnerId,
    isCompleted: true,
  };
}
