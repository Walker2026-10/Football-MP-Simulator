// src/engines/scoutingEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Player, PlayerAttributes, Club } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Representa um olheiro (scout) do clube.
 */
export interface Scout {
  id: string;
  name: string;
  rating: number;        // 1-100 (qualidade do scout)
  region: string;        // ex: 'Europa', 'América do Sul', 'África', 'Ásia'
  dailyCost: number;     // custo diário em euros
}

/**
 * Relatório de observação de um jogador.
 */
export interface ScoutReport {
  targetPlayerId: string;
  accurateAttributes: Partial<PlayerAttributes>; // atributos revelados (alguns podem ser incompletos)
  potentialRange: [number, number];              // intervalo de potencial estimado [mín, máx]
  fitRating: number;                             // 0-100 quão adequado é para a equipa
  isComplete: boolean;                           // se o relatório está finalizado
}

/**
 * Acordo de empréstimo entre clubes.
 */
export interface LoanDeal {
  playerId: string;
  parentClubId: string;       // clube que possui o jogador
  borrowingClubId: string;    // clube que recebe o jogador
  wageCoveragePercentage: number; // % do salário coberto pelo clube que recebe (0-100)
  buyOptionPrice?: number;    // preço de opção de compra (se aplicável)
  isObligation: boolean;      // se a compra é obrigatória no fim do empréstimo
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  guaranteedPlayTime: number; // minutos garantidos por jogo (estimativa)
}

// ============================================================
// FUNÇÕES AUXILIARES (internas)
// ============================================================

/**
 * Gera atributos imprecisos com base na qualidade do scout.
 */
function generateScoutedAttributes(
  realAttributes: PlayerAttributes,
  scoutRating: number
): Partial<PlayerAttributes> {
  const accuracy = scoutRating / 100; // 0 a 1
  const result: Partial<PlayerAttributes> = {};

  // Cada atributo tem probabilidade de ser revelado com precisão variável
  const keys: (keyof PlayerAttributes)[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

  for (const key of keys) {
    // Probabilidade de revelar o atributo (scouts melhores revelam mais)
    if (Math.random() < accuracy * 0.9 + 0.1) { // entre 10% e 100%
      const real = realAttributes[key];
      // Variação: quanto melhor o scout, menor a variação
      const variation = Math.round((1 - accuracy) * 10 + Math.random() * 5);
      const revealed = Math.min(99, Math.max(1, real + (Math.random() * variation * 2 - variation)));
      result[key] = Math.round(revealed);
    }
  }

  // Se nenhum atributo foi revelado, garantir pelo menos um (improvável)
  if (Object.keys(result).length === 0) {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const real = realAttributes[randomKey];
    result[randomKey] = Math.min(99, Math.max(1, real + Math.round(Math.random() * 10 - 5)));
  }

  return result;
}

/**
 * Calcula o intervalo de potencial estimado com base na qualidade do scout.
 */
function estimatePotentialRange(realPotential: number, scoutRating: number): [number, number] {
  const accuracy = scoutRating / 100;
  const minRange = Math.max(1, realPotential - Math.round((1 - accuracy) * 15 + 5));
  const maxRange = Math.min(99, realPotential + Math.round((1 - accuracy) * 15 + 5));
  return [minRange, maxRange];
}

/**
 * Calcula o fitRating (adequação do jogador à equipa) com base no estilo de jogo implícito.
 * Simulação simplificada: quanto maior o overall, melhor o fit.
 */
function calculateFitRating(player: Player, club: Club): number {
  // Fit baseado no overall e na compatibilidade tática (simplificado)
  const overallFit = (player.overall - 50) * 1.5; // 0 a 73.5
  const positionFit = club.mainSquad.some(p => p.position === player.position) ? 10 : 0;
  const ageFit = player.age <= 22 ? 10 : (player.age <= 30 ? 5 : -5);
  return Math.min(100, Math.max(0, overallFit + positionFit + ageFit));
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Envia um olheiro para observar um jogador alvo, gerando um relatório.
 * @param scout - O olheiro encarregue da missão
 * @param targetPlayer - O jogador a observar (com atributos reais)
 * @param club - O clube que envia o scout (para calcular fitRating)
 * @returns ScoutReport com os dados observados
 */
export function sendScoutOnMission(
  scout: Scout,
  targetPlayer: Player,
  club: Club
): ScoutReport {
  // 1. Gerar atributos observados (com imprecisão)
  const accurateAttributes = generateScoutedAttributes(targetPlayer.attributes, scout.rating);

  // 2. Estimar potencial
  const potentialRange = estimatePotentialRange(targetPlayer.potential, scout.rating);

  // 3. Calcular fitRating
  const fitRating = calculateFitRating(targetPlayer, club);

  // 4. Determinar se o relatório está completo (scouts com rating > 70 tendem a completar)
  const isComplete = scout.rating > 70 ? Math.random() < 0.8 : Math.random() < 0.4;

  return {
    targetPlayerId: targetPlayer.id,
    accurateAttributes,
    potentialRange,
    fitRating,
    isComplete,
  };
}

/**
 * Propõe um acordo de empréstimo entre clubes e avalia a viabilidade.
 * @param player - O jogador a ser emprestado
 * @param parentClub - Clube que detém o jogador
 * @param borrowingClub - Clube que pretende o empréstimo
 * @param terms - Parâmetros parciais do empréstimo (wageCoverage, buyOption, isObligation, etc.)
 * @param currentDate - Data atual (formato YYYY-MM-DD)
 * @returns Objeto com decisão, acordo (se aceite) e mensagem
 */
export function proposeLoanDeal(
  player: Player,
  parentClub: Club,
  borrowingClub: Club,
  terms: Partial<LoanDeal>,
  currentDate: string = new Date().toISOString().slice(0, 10)
): { accepted: boolean; deal?: LoanDeal; message: string } {
  // 1. Validar se o jogador pertence ao clube pai
  if (player.clubId !== parentClub.id) {
    return {
      accepted: false,
      message: `Erro: ${player.name} não pertence ao ${parentClub.name}.`,
    };
  }

  // 2. Verificar se o clube que pede empréstimo tem orçamento suficiente para cobrir a percentagem salarial
  const wageCoverage = terms.wageCoveragePercentage ?? 50; // padrão 50%
  const salaryCoverage = Math.round(player.salary * (wageCoverage / 100));
  if (salaryCoverage > borrowingClub.budget * 0.1) {
    // Se o custo exceder 10% do orçamento, provavelmente não é viável
    return {
      accepted: false,
      message: `${borrowingClub.name} não tem orçamento suficiente para cobrir ${wageCoverage}% do salário de ${player.name}.`,
    };
  }

  // 3. Analisar se o jogador terá tempo de jogo (com base no plantel do clube que pede)
  const samePositionCount = borrowingClub.mainSquad.filter(p => p.position === player.position).length;
  // Se houver muitos jogadores na mesma posição, o jogador pode ter menos minutos
  const playTimeEstimate = samePositionCount > 2 ? 45 : (samePositionCount > 1 ? 60 : 75);

  // 4. Verificar se o clube que pede empréstimo é adequado (reputação, etc.)
  const borrowingReputation = borrowingClub.reputation || 50;
  const parentReputation = parentClub.reputation || 50;
  // Se o clube que pede tiver reputação muito inferior, o jogador pode não querer ir
  if (borrowingReputation < parentReputation - 20 && player.age > 20) {
    return {
      accepted: false,
      message: `${player.name} não está interessado em jogar num clube com reputação tão inferior à do ${parentClub.name}.`,
    };
  }

  // 5. Decidir se o empréstimo é aceite
  // Condições de aceitação:
  // - O jogador precisa de tempo de jogo (simulado)
  // - O clube que pede cobre pelo menos 40% do salário
  // - O período de empréstimo não excede 12 meses (definido pela data de fim)
  const startDate = currentDate;
  const endDate = terms.endDate || new Date(new Date(currentDate).setMonth(new Date(currentDate).getMonth() + 12))
    .toISOString().slice(0, 10);

  // Se a cobertura salarial for muito baixa, recusar
  if (wageCoverage < 40) {
    return {
      accepted: false,
      message: `A cobertura salarial de ${wageCoverage}% é insuficiente. O mínimo é 40%.`,
    };
  }

  // Se o jogador for jovem (<=21) e o clube que pede tiver boa reputação, aceitar com mais facilidade
  const isYoung = player.age <= 21;
  const isGoodReputation = borrowingReputation > 60;

  let accepted = false;
  let message = '';

  if (isYoung && isGoodReputation) {
    accepted = true;
    message = `Empréstimo de ${player.name} para ${borrowingClub.name} aprovado. O jogador terá minutos importantes.`;
  } else if (playTimeEstimate >= 60 && wageCoverage >= 60) {
    accepted = true;
    message = `Empréstimo aprovado. ${player.name} terá tempo de jogo adequado e salário coberto em ${wageCoverage}%.`;
  } else if (playTimeEstimate >= 45 && wageCoverage >= 80) {
    accepted = true;
    message = `Empréstimo aprovado com condições financeiras favoráveis.`;
  } else {
    accepted = false;
    message = `Empréstimo recusado. Condições insuficientes para o desenvolvimento de ${player.name}.`;
  }

  // Se aceite, construir o contrato
  let deal: LoanDeal | undefined;
  if (accepted) {
    deal = {
      playerId: player.id,
      parentClubId: parentClub.id,
      borrowingClubId: borrowingClub.id,
      wageCoveragePercentage: wageCoverage,
      buyOptionPrice: terms.buyOptionPrice,
      isObligation: terms.isObligation ?? false,
      startDate,
      endDate,
      guaranteedPlayTime: playTimeEstimate,
    };
  }

  return {
    accepted,
    deal,
    message,
  };
}
