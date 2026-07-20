// src/engines/matchEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Club, Match, MatchEvent, Player, PlayerStats } from '@/types/game';

/**
 * Obtém o plantel inicial (onze titulares) de um clube, garantindo pelo menos 1 guarda-redes.
 * Ordena os jogadores por overall e seleciona a melhor equipa possível.
 */
function getStartingXI(club: Club): Player[] {
  const squad = club.mainSquad;
  if (squad.length === 0) return [];

  // Separar jogadores por posição
  const goalkeepers = squad.filter(p => p.position === 'Guarda-Redes').sort((a, b) => b.overall - a.overall);
  const defenders = squad.filter(p => p.position === 'Defesa Central' || p.position === 'Lateral').sort((a, b) => b.overall - a.overall);
  const midfielders = squad.filter(p => p.position === 'Médio' || p.position === 'Extremo').sort((a, b) => b.overall - a.overall);
  const forwards = squad.filter(p => p.position === 'Avançado').sort((a, b) => b.overall - a.overall);

  const startingXI: Player[] = [];

  // 1 Guarda-Redes (melhor)
  if (goalkeepers.length > 0) startingXI.push(goalkeepers[0]);

  // 4 Defesas (melhores)
  startingXI.push(...defenders.slice(0, 4));

  // 4 Médios (melhores)
  startingXI.push(...midfielders.slice(0, 4));

  // 2 Avançados (melhores)
  startingXI.push(...forwards.slice(0, 2));

  // Se faltar alguém (ex: equipa pequena), preencher com os melhores restantes por overall
  if (startingXI.length < 11) {
    const usedIds = new Set(startingXI.map(p => p.id));
    const remaining = squad.filter(p => !usedIds.has(p.id)).sort((a, b) => b.overall - a.overall);
    const needed = 11 - startingXI.length;
    startingXI.push(...remaining.slice(0, needed));
  }

  return startingXI;
}

/**
 * Calcula a força de ataque, meio-campo e defesa de um conjunto de jogadores.
 */
function calculateStrengths(players: Player[]) {
  if (players.length === 0) {
    return { attack: 50, midfield: 50, defense: 50 };
  }

  let attackSum = 0;
  let midfieldSum = 0;
  let defenseSum = 0;
  let count = players.length;

  players.forEach(p => {
    const attrs = p.attributes;
    // Ataque: velocidade + finalização + drible
    attackSum += (attrs.pace + attrs.shooting + attrs.dribbling) / 3;
    // Meio-campo: passe + drible + defesa (equilibrado)
    midfieldSum += (attrs.passing + attrs.dribbling + attrs.defending) / 3;
    // Defesa: defesa + físico + velocidade
    defenseSum += (attrs.defending + attrs.physical + attrs.pace) / 3;
  });

  return {
    attack: attackSum / count,
    midfield: midfieldSum / count,
    defense: defenseSum / count,
  };
}

/**
 * Gera um nome aleatório para eventos de comentário
 */
function getRandomName(players: Player[]): string {
  if (players.length === 0) return 'Desconhecido';
  return players[Math.floor(Math.random() * players.length)].name;
}

/**
 * Simula uma partida de futebol minuto a minuto.
 * @param homeClub - Clube da casa
 * @param awayClub - Clube visitante
 * @param matchDate - Data da partida (formato YYYY-MM-DD)
 * @param userPlayerId - (opcional) ID do jogador do utilizador para registar desempenho
 * @returns Objeto Match completo com o resultado e eventos
 */
export function simulateMatch(
  homeClub: Club,
  awayClub: Club,
  matchDate: string,
  userPlayerId?: string
): Match {
  // 1. Selecionar os titulares
  const homeStarters = getStartingXI(homeClub);
  const awayStarters = getStartingXI(awayClub);

  // Se alguma equipa não tiver jogadores, jogo termina 0-0 sem eventos
  if (homeStarters.length === 0 || awayStarters.length === 0) {
    return {
      id: uuidv4(),
      homeTeamId: homeClub.id,
      awayTeamId: awayClub.id,
      homeTeamName: homeClub.name,
      awayTeamName: awayClub.name,
      homeScore: 0,
      awayScore: 0,
      events: [],
      played: true,
      matchDate,
    };
  }

  // 2. Calcular forças relativas
  const homeStrength = calculateStrengths(homeStarters);
  const awayStrength = calculateStrengths(awayStarters);

  // 3. Inicializar variáveis do jogo
  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;
  let homeGoalscorers: string[] = [];
  let awayGoalscorers: string[] = [];

  // Para controlo do jogador utilizador
  let userPlayer: Player | null = null;
  let userGoals = 0;
  let userAssists = 0;
  let userKeyPasses = 0;
  let userIsOnField = false;

  // Procurar jogador utilizador nos titulares
  if (userPlayerId) {
    const foundHome = homeStarters.find(p => p.id === userPlayerId);
    const foundAway = awayStarters.find(p => p.id === userPlayerId);
    if (foundHome) {
      userPlayer = foundHome;
      userIsOnField = true;
    } else if (foundAway) {
      userPlayer = foundAway;
      userIsOnField = true;
    }
  }

  // 4. Tempo de descontos (1 a 5 minutos)
  const stoppageTime = Math.floor(Math.random() * 5) + 1;
  const totalMinutes = 90 + stoppageTime;

  // 5. Simulação minuto a minuto
  for (let minute = 1; minute <= totalMinutes; minute++) {
    // Fator de aleatoriedade baseado na força
    const homeAttackFactor = homeStrength.attack / (awayStrength.defense + 1);
    const awayAttackFactor = awayStrength.attack / (homeStrength.defense + 1);

    // Probabilidade de ataque perigoso (base 20%, ajustada)
    const homeChance = 0.2 * homeAttackFactor;
    const awayChance = 0.2 * awayAttackFactor;

    // Determinar qual equipa tem a posse (ponderado pelo meio-campo)
    const possessionWeight = homeStrength.midfield / (homeStrength.midfield + awayStrength.midfield);
    const isHomePossession = Math.random() < possessionWeight;

    // --- Eventos de Golo ---
    let goalScored = false;
    if (isHomePossession && Math.random() < homeChance) {
      // Chance de golo: 35% em lances perigosos
      if (Math.random() < 0.35) {
        homeScore++;
        goalScored = true;
        // Escolher marcador (mais provável ser avançado/extremo)
        const scorer = selectScorer(homeStarters);
        homeGoalscorers.push(scorer.name);
        // Atualizar estatísticas do marcador
        scorer.stats.goals += 1;
        if (userPlayer && scorer.id === userPlayer.id) {
          userGoals++;
        }
        // Adicionar evento de golo
        events.push({
          minute,
          type: 'goal',
          description: `Golo! ${scorer.name} marcou para ${homeClub.name}!`,
          teamId: homeClub.id,
          playerInvolvedName: scorer.name,
        });
      } else {
        // Lance perigoso sem golo (comentário)
        const player = homeStarters[Math.floor(Math.random() * homeStarters.length)];
        events.push({
          minute,
          type: 'commentary',
          description: `${player.name} criou perigo, mas a defesa adversária cortou.`,
          teamId: homeClub.id,
          playerInvolvedName: player.name,
        });
        // Contar como passe/chave para o user player se ele participou
        if (userPlayer && userIsOnField && Math.random() < 0.3) {
          userKeyPasses++;
        }
      }
    } else if (!isHomePossession && Math.random() < awayChance) {
      if (Math.random() < 0.35) {
        awayScore++;
        goalScored = true;
        const scorer = selectScorer(awayStarters);
        awayGoalscorers.push(scorer.name);
        scorer.stats.goals += 1;
        if (userPlayer && scorer.id === userPlayer.id) {
          userGoals++;
        }
        events.push({
          minute,
          type: 'goal',
          description: `Golo! ${scorer.name} marcou para ${awayClub.name}!`,
          teamId: awayClub.id,
          playerInvolvedName: scorer.name,
        });
      } else {
        const player = awayStarters[Math.floor(Math.random() * awayStarters.length)];
        events.push({
          minute,
          type: 'commentary',
          description: `${player.name} tentou a sorte, mas a bola saiu ao lado.`,
          teamId: awayClub.id,
          playerInvolvedName: player.name,
        });
        if (userPlayer && userIsOnField && Math.random() < 0.3) {
          userKeyPasses++;
        }
      }
    }

    // --- Cartões (amarelo/vermelho) ---
    // Probabilidade de falta: 8% por minuto
    if (Math.random() < 0.08) {
      const isHomeFoul = Math.random() < 0.5;
      const teamPlayers = isHomeFoul ? homeStarters : awayStarters;
      const fouler = teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
      const isRed = Math.random() < 0.15; // 15% das faltas são vermelho
      const cardType = isRed ? 'red_card' : 'yellow_card';
      events.push({
        minute,
        type: cardType,
        description: `${fouler.name} recebeu ${isRed ? 'cartão vermelho' : 'cartão amarelo'}!`,
        teamId: isHomeFoul ? homeClub.id : awayClub.id,
        playerInvolvedName: fouler.name,
      });
      // Se for vermelho, removê-lo dos titulares (simplificado)
      if (isRed) {
        const idx = teamPlayers.findIndex(p => p.id === fouler.id);
        if (idx !== -1) teamPlayers.splice(idx, 1);
      }
    }

    // --- Substituições (a partir dos 60 minutos) ---
    if (minute >= 60 && minute % 10 === 0 && Math.random() < 0.3) {
      // Substituição na equipa da casa
      if (Math.random() < 0.5 && homeClub.mainSquad.length > 11) {
        const bench = homeClub.mainSquad.filter(p => !homeStarters.includes(p));
        if (bench.length > 0) {
          const out = homeStarters[Math.floor(Math.random() * homeStarters.length)];
          const inPlayer = bench[Math.floor(Math.random() * bench.length)];
          homeStarters[homeStarters.indexOf(out)] = inPlayer;
          events.push({
            minute,
            type: 'sub',
            description: `Substituição no ${homeClub.name}: sai ${out.name}, entra ${inPlayer.name}.`,
            teamId: homeClub.id,
            playerInvolvedName: `${out.name} → ${inPlayer.name}`,
          });
        }
      } else {
        // Substituição na equipa visitante
        const bench = awayClub.mainSquad.filter(p => !awayStarters.includes(p));
        if (bench.length > 0) {
          const out = awayStarters[Math.floor(Math.random() * awayStarters.length)];
          const inPlayer = bench[Math.floor(Math.random() * bench.length)];
          awayStarters[awayStarters.indexOf(out)] = inPlayer;
          events.push({
            minute,
            type: 'sub',
            description: `Substituição no ${awayClub.name}: sai ${out.name}, entra ${inPlayer.name}.`,
            teamId: awayClub.id,
            playerInvolvedName: `${out.name} → ${inPlayer.name}`,
          });
        }
      }
    }
  }

  // 6. Atualizar estatísticas do jogador utilizador
  if (userPlayer && userIsOnField) {
    // Calcular nota individual (0.0 a 10.0)
    let rating = 6.0; // base
    rating += userGoals * 0.7;   // +0.7 por golo
    rating += userAssists * 0.4; // +0.4 por assistência (não temos assistências diretamente, mas podemos simular)
    rating += userKeyPasses * 0.05;

    // Se o jogador sofreu cartão, penalizar
    const hasCard = events.some(
      e => e.playerInvolvedName === userPlayer?.name && (e.type === 'yellow_card' || e.type === 'red_card')
    );
    if (hasCard) rating -= 0.5;

    // Cap entre 0 e 10
    rating = Math.min(10, Math.max(0, rating));

    // Atualizar estatísticas do jogador
    userPlayer.stats.matchesPlayed += 1;
    userPlayer.stats.goals += userGoals;
    // Assistências - simulamos 1 assistência a cada 2 golos marcados pela equipa (aleatório)
    const teamGoals = userPlayer.clubId === homeClub.id ? homeScore : awayScore;
    const assists = Math.floor(teamGoals / 2) + (Math.random() < 0.3 ? 1 : 0);
    userPlayer.stats.assists += assists;

    // Média ponderada (manter histórico)
    const totalRatings = userPlayer.stats.averageRating * (userPlayer.stats.matchesPlayed - 1);
    userPlayer.stats.averageRating = (totalRatings + rating) / userPlayer.stats.matchesPlayed;
  }

  // 7. Construir e retornar o objeto Match
  return {
    id: uuidv4(),
    homeTeamId: homeClub.id,
    awayTeamId: awayClub.id,
    homeTeamName: homeClub.name,
    awayTeamName: awayClub.name,
    homeScore,
    awayScore,
    events,
    played: true,
    matchDate,
  };
}

/**
 * Função auxiliar para selecionar um marcador, com maior probabilidade para avançados/extremos.
 */
function selectScorer(players: Player[]): Player {
  // Tentar escolher entre avançados, extremos, médios, defesas (nesta ordem)
  const forwards = players.filter(p => p.position === 'Avançado');
  const wingers = players.filter(p => p.position === 'Extremo');
  const midfielders = players.filter(p => p.position === 'Médio');
  const defenders = players.filter(p => p.position === 'Defesa Central' || p.position === 'Lateral');

  const pool = [...forwards, ...wingers, ...midfielders, ...defenders];
  if (pool.length === 0) return players[Math.floor(Math.random() * players.length)];

  // Pesos: 50% avançado, 30% extremo, 15% médio, 5% defesa
  const rand = Math.random();
  if (rand < 0.5 && forwards.length > 0) return forwards[Math.floor(Math.random() * forwards.length)];
  if (rand < 0.8 && wingers.length > 0) return wingers[Math.floor(Math.random() * wingers.length)];
  if (rand < 0.95 && midfielders.length > 0) return midfielders[Math.floor(Math.random() * midfielders.length)];
  if (defenders.length > 0) return defenders[Math.floor(Math.random() * defenders.length)];

  return pool[Math.floor(Math.random() * pool.length)];
}
