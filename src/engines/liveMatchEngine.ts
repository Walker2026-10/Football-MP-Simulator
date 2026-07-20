// src/engines/liveMatchEngine.ts

import { Club, MatchEvent, Player } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Estado atual de uma partida em simulação interativa.
 */
export interface LiveMatchState {
  currentMinute: number;        // 0 a 90+ (incluindo descontos)
  isPaused: boolean;
  homeScore: number;
  awayScore: number;
  staminaHome: number[];        // array com a stamina de cada jogador da casa (0-100)
  staminaAway: number[];        // array com a stamina de cada jogador visitante (0-100)
  momentum: 'HOME' | 'NEUTRAL' | 'AWAY'; // equipa com maior ímpeto ofensivo
  lastEvent?: string;           // descrição do último evento ocorrido
  // Adicionais para controlo interno
  homeTactics: string;          // 'DEFENSIVE' | 'BALANCED' | 'ATTACKING'
  awayTactics: string;
  homePlayers: Player[];        // titulares da casa (para referência)
  awayPlayers: Player[];
}

// ============================================================
// FUNÇÕES AUXILIARES (internas)
// ============================================================

/**
 * Gera um nome aleatório para eventos de comentário.
 */
function getRandomPlayerName(players: Player[]): string {
  if (players.length === 0) return 'Desconhecido';
  return players[Math.floor(Math.random() * players.length)].name;
}

/**
 * Calcula a stamina média de uma equipa.
 */
function averageStamina(staminaArray: number[]): number {
  if (staminaArray.length === 0) return 0;
  const sum = staminaArray.reduce((a, b) => a + b, 0);
  return sum / staminaArray.length;
}

/**
 * Gera um evento com base no estado actual e nas táticas.
 */
function generateMatchEvent(
  minute: number,
  homePlayers: Player[],
  awayPlayers: Player[],
  momentum: 'HOME' | 'NEUTRAL' | 'AWAY',
  homeTactics: string,
  awayTactics: string
): { event: MatchEvent; goals: { home: number; away: number } } | null {
  // Probabilidade base de evento: 20% por minuto
  let baseChance = 0.2;

  // Ajustar com base no momentum
  if (momentum === 'HOME') baseChance += 0.05;
  else if (momentum === 'AWAY') baseChance += 0.05;

  // Ajustar com base nas táticas (ataque aumenta chances de golo, mas também de contra-ataque)
  const homeAttackBonus = homeTactics === 'ATTACKING' ? 0.1 : (homeTactics === 'DEFENSIVE' ? -0.05 : 0);
  const awayAttackBonus = awayTactics === 'ATTACKING' ? 0.1 : (awayTactics === 'DEFENSIVE' ? -0.05 : 0);

  // Probabilidade de evento ofensivo para cada lado
  const homeChance = baseChance + homeAttackBonus;
  const awayChance = baseChance + awayAttackBonus;

  // Determinar qual equipa ataca (se houver ataque)
  const homeAttacks = Math.random() < homeChance;
  const awayAttacks = Math.random() < awayChance;

  let goalsHome = 0;
  let goalsAway = 0;
  let eventType: 'goal' | 'commentary' = 'commentary';
  let description = '';
  let teamId = '';
  let playerName = '';

  if (homeAttacks && !awayAttacks) {
    // Ataque da casa
    if (Math.random() < 0.3) { // 30% de golo
      goalsHome = 1;
      eventType = 'goal';
      const scorer = homePlayers[Math.floor(Math.random() * homePlayers.length)];
      playerName = scorer.name;
      teamId = scorer.clubId || 'home';
      description = `Golo! ${scorer.name} marca para a equipa da casa!`;
    } else {
      // Lance perigoso
      const player = homePlayers[Math.floor(Math.random() * homePlayers.length)];
      playerName = player.name;
      teamId = player.clubId || 'home';
      description = `${playerName} cria perigo, mas a defesa adversária corta.`;
    }
  } else if (awayAttacks && !homeAttacks) {
    // Ataque visitante
    if (Math.random() < 0.3) {
      goalsAway = 1;
      eventType = 'goal';
      const scorer = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
      playerName = scorer.name;
      teamId = scorer.clubId || 'away';
      description = `Golo! ${scorer.name} marca para a equipa visitante!`;
    } else {
      const player = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
      playerName = player.name;
      teamId = player.clubId || 'away';
      description = `${playerName} tenta a sorte, mas a bola sai ao lado.`;
    }
  } else if (homeAttacks && awayAttacks) {
    // Ambas atacam - pode haver golo para ambos ou apenas um
    if (Math.random() < 0.2) {
      // Golo para a casa
      goalsHome = 1;
      const scorer = homePlayers[Math.floor(Math.random() * homePlayers.length)];
      playerName = scorer.name;
      teamId = scorer.clubId || 'home';
      description = `Golo! ${scorer.name} marca para a casa num contra-ataque rápido!`;
    } else if (Math.random() < 0.2) {
      // Golo visitante
      goalsAway = 1;
      const scorer = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
      playerName = scorer.name;
      teamId = scorer.clubId || 'away';
      description = `Golo! ${scorer.name} marca para os visitantes num lance de contra-ataque!`;
    } else {
      // Apenas comentário
      const player = (Math.random() < 0.5) ?
        homePlayers[Math.floor(Math.random() * homePlayers.length)] :
        awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
      playerName = player.name;
      teamId = player.clubId || 'unknown';
      description = `Jogo aberto! ${playerName} tenta o remate, mas a bola vai por cima.`;
    }
  } else {
    // Nenhum ataque significativo
    return null;
  }

  const event: MatchEvent = {
    minute,
    type: eventType,
    description,
    teamId,
    playerInvolvedName: playerName,
  };

  return { event, goals: { home: goalsHome, away: goalsAway } };
}

// ============================================================
// FUNÇÕES PRINCIPAIS (exportadas)
// ============================================================

/**
 * Inicializa uma partida interativa ao minuto 0.
 * @param homeClub - Clube da casa
 * @param awayClub - Clube visitante
 * @param homeTactics - Tática inicial da casa ('DEFENSIVE' | 'BALANCED' | 'ATTACKING')
 * @param awayTactics - Tática inicial do visitante
 * @returns Estado inicial da partida
 */
export function initLiveMatch(
  homeClub: Club,
  awayClub: Club,
  homeTactics: string = 'BALANCED',
  awayTactics: string = 'BALANCED'
): LiveMatchState {
  // Selecionar titulares (simplificado: todos os jogadores do plantel principal)
  const homePlayers = homeClub.mainSquad.slice(0, 11);
  const awayPlayers = awayClub.mainSquad.slice(0, 11);

  // Inicializar stamina (valores entre 70 e 100)
  const staminaHome = homePlayers.map(() => 70 + Math.floor(Math.random() * 30));
  const staminaAway = awayPlayers.map(() => 70 + Math.floor(Math.random() * 30));

  return {
    currentMinute: 0,
    isPaused: false,
    homeScore: 0,
    awayScore: 0,
    staminaHome,
    staminaAway,
    momentum: 'NEUTRAL',
    lastEvent: 'Jogo começou!',
    homeTactics,
    awayTactics,
    homePlayers,
    awayPlayers,
  };
}

/**
 * Avança um minuto da simulação, actualizando o estado e gerando eventos.
 * @param currentState - Estado atual da partida
 * @param homeTactics - Tática da casa (pode ser alterada)
 * @param awayTactics - Tática do visitante (pode ser alterada)
 * @returns Novo estado e eventual evento gerado
 */
export function tickLiveMatch(
  currentState: LiveMatchState,
  homeTactics: string = currentState.homeTactics,
  awayTactics: string = currentState.awayTactics
): { newState: LiveMatchState; generatedEvent?: MatchEvent } {
  // Clonar estado para não modificar o original
  const newState = { ...currentState };
  newState.homeTactics = homeTactics;
  newState.awayTactics = awayTactics;

  // Avançar minuto
  newState.currentMinute += 1;

  // Se o jogo estiver em pausa, não processar nada
  if (newState.isPaused) {
    return { newState };
  }

  // Se chegou aos 90 minutos, pode haver descontos (simular até 95)
  if (newState.currentMinute > 95) {
    // Fim de jogo
    return { newState };
  }

  // 1. Consumir stamina (todos os jogadores perdem stamina)
  const homePlayers = newState.homePlayers;
  const awayPlayers = newState.awayPlayers;

  // Stamina da casa
  for (let i = 0; i < newState.staminaHome.length; i++) {
    // Perda base: 0.5 a 2.0 por minuto, dependendo da intensidade
    const intensity = homeTactics === 'ATTACKING' ? 1.5 : (homeTactics === 'DEFENSIVE' ? 0.8 : 1.0);
    const loss = 0.5 + Math.random() * 1.0 * intensity;
    newState.staminaHome[i] = Math.max(0, newState.staminaHome[i] - loss);
  }

  // Stamina visitante
  for (let i = 0; i < newState.staminaAway.length; i++) {
    const intensity = awayTactics === 'ATTACKING' ? 1.5 : (awayTactics === 'DEFENSIVE' ? 0.8 : 1.0);
    const loss = 0.5 + Math.random() * 1.0 * intensity;
    newState.staminaAway[i] = Math.max(0, newState.staminaAway[i] - loss);
  }

  // 2. Calcular momentum baseado na posse de bola e táticas
  const avgStaminaHome = averageStamina(newState.staminaHome);
  const avgStaminaAway = averageStamina(newState.staminaAway);

  // Se uma equipa tem stamina média muito baixa, perde momentum
  let momentumScore = 0; // positivo = casa, negativo = visitante
  if (avgStaminaHome > 60) momentumScore += 10;
  if (avgStaminaAway > 60) momentumScore -= 10;

  // Táticas influenciam momentum
  if (homeTactics === 'ATTACKING') momentumScore += 15;
  else if (homeTactics === 'DEFENSIVE') momentumScore += 5;

  if (awayTactics === 'ATTACKING') momentumScore -= 15;
  else if (awayTactics === 'DEFENSIVE') momentumScore -= 5;

  // Placar também influencia (quem está a ganhar tende a ter mais momentum)
  if (newState.homeScore > newState.awayScore) momentumScore += 10;
  else if (newState.awayScore > newState.homeScore) momentumScore -= 10;

  // Determinar momentum
  if (momentumScore > 5) newState.momentum = 'HOME';
  else if (momentumScore < -5) newState.momentum = 'AWAY';
  else newState.momentum = 'NEUTRAL';

  // 3. Gerar eventos (golos, lances perigosos)
  const eventResult = generateMatchEvent(
    newState.currentMinute,
    homePlayers,
    awayPlayers,
    newState.momentum,
    homeTactics,
    awayTactics
  );

  if (eventResult) {
    newState.homeScore += eventResult.goals.home;
    newState.awayScore += eventResult.goals.away;
    newState.lastEvent = eventResult.event.description;
    // Retornar novo estado e evento
    return {
      newState,
      generatedEvent: eventResult.event,
    };
  }

  // Sem evento significativo
  return { newState };
}

/**
 * Aplica uma alteração tática em tempo real.
 * @param currentState - Estado atual da partida
 * @param newMentality - Nova mentalidade ('DEFENSIVE' | 'BALANCED' | 'ATTACKING')
 * @param forTeam - 'HOME' ou 'AWAY' (qual equipa)
 * @returns Novo estado com tática actualizada
 */
export function applyInGameTacticalChange(
  currentState: LiveMatchState,
  newMentality: 'DEFENSIVE' | 'BALANCED' | 'ATTACKING',
  forTeam: 'HOME' | 'AWAY'
): LiveMatchState {
  const newState = { ...currentState };

  if (forTeam === 'HOME') {
    newState.homeTactics = newMentality;
  } else {
    newState.awayTactics = newMentality;
  }

  // Ajustar momentum com base na nova tática (efeito imediato)
  if (newMentality === 'ATTACKING') {
    // Aumenta momentum a favor
    if (forTeam === 'HOME' && newState.momentum !== 'AWAY') {
      newState.momentum = 'HOME';
    } else if (forTeam === 'AWAY' && newState.momentum !== 'HOME') {
      newState.momentum = 'AWAY';
    }
  } else if (newMentality === 'DEFENSIVE') {
    // Reduz momentum, tende para neutro
    if (newState.momentum !== 'NEUTRAL') {
      newState.momentum = 'NEUTRAL';
    }
  }

  return newState;
}
