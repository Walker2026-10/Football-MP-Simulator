// src/engines/careerEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Player } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Representa um agente de jogadores.
 */
export interface Agent {
  id: string;
  name: string;
  feePercentage: number;      // percentagem que o agente recebe (ex: 0.10 = 10%)
  negotiationSkill: number;   // 1-100 (capacidade de negociar melhores contratos)
  reputation: number;         // 0-100 (influencia a capacidade de atrair ofertas)
}

// ============================================================
// FUNÇÕES AUXILIARES (internas)
// ============================================================

/**
 * Determina a faixa etária da seleção nacional com base na idade do jogador.
 */
function getNationalTeamAgeGroup(age: number): 'Sub-15' | 'Sub-21' | 'Senior' | null {
  if (age >= 15 && age <= 17) return 'Sub-15';
  if (age >= 18 && age <= 21) return 'Sub-21';
  if (age >= 22) return 'Senior';
  return null;
}

/**
 * Calcula a probabilidade de convocatória com base no overall e nas estatísticas.
 * Quanto maior o overall e melhores as estatísticas, maior a probabilidade.
 */
function calculateCallUpProbability(player: Player): number {
  // Fatores base
  const overallFactor = Math.max(0, (player.overall - 50) / 50); // 0 a 1
  const goalsFactor = Math.min(1, player.stats.goals / 10); // 0 a 1 (10+ golos = máximo)
  const assistsFactor = Math.min(1, player.stats.assists / 8); // 0 a 1 (8+ assistências = máximo)
  const ratingFactor = Math.min(1, player.stats.averageRating / 8); // 0 a 1 (rating 8+ = máximo)

  // Média ponderada
  let probability = (overallFactor * 0.5) + (goalsFactor * 0.2) + (assistsFactor * 0.15) + (ratingFactor * 0.15);

  // Bónus para jovens (Sub-15 e Sub-21) - facilita a primeira convocatória
  const ageGroup = getNationalTeamAgeGroup(player.age);
  if (ageGroup === 'Sub-15' || ageGroup === 'Sub-21') {
    probability = Math.min(1, probability * 1.2);
  }

  // Penalidade se o jogador estiver lesionado ou com baixa energia
  if (player.injury && player.injury.durationDays > 0) {
    probability *= 0.3;
  }
  if (player.sims.energy < 40) {
    probability *= 0.7;
  }

  // Cap entre 0 e 1
  return Math.min(1, Math.max(0, probability));
}

// ============================================================
// FUNÇÕES PRINCIPAIS (exportadas)
// ============================================================

/**
 * Verifica se o jogador merece uma convocatória para a Seleção Nacional.
 * @param player - O jogador a avaliar
 * @param currentDate - Data atual (para contexto, ex: época)
 * @returns Objeto com indicação se foi convocado e uma mensagem descritiva
 */
export function checkNationalTeamCallUp(
  player: Player,
  currentDate: string = new Date().toISOString().slice(0, 10)
): { isCalledUp: boolean; message: string } {
  // Verificar se o jogador é elegível (idade mínima 15)
  if (player.age < 15) {
    return {
      isCalledUp: false,
      message: `${player.name} ainda é muito jovem para uma convocatória.`,
    };
  }

  // Se já estiver lesionado, não convocar
  if (player.injury && player.injury.durationDays > 0) {
    return {
      isCalledUp: false,
      message: `${player.name} está lesionado e não pode ser convocado.`,
    };
  }

  // Verificar se o jogador tem jogos disputados (mínimo 5 para ser considerado)
  if (player.stats.matchesPlayed < 5) {
    return {
      isCalledUp: false,
      message: `${player.name} não tem jogos suficientes para ser considerado.`,
    };
  }

  // Calcular probabilidade de convocatória
  const probability = calculateCallUpProbability(player);

  // Decidir convocatória com base na probabilidade (com um fator aleatório)
  const randomFactor = Math.random();
  const isCalledUp = randomFactor < probability * 0.8; // 80% da probabilidade real, para simular imprevisibilidade

  // Determinar a faixa etária para a mensagem
  const ageGroup = getNationalTeamAgeGroup(player.age);
  const teamName = ageGroup === 'Senior' ? 'Seleção A' : (ageGroup || 'Seleção');

  if (isCalledUp) {
    // Gerar mensagem personalizada
    const messages = [
      `${player.name} foi convocado para a ${teamName}!`,
      `Excelente notícia! ${player.name} vai representar a ${teamName}.`,
      `A ${teamName} chama ${player.name} para os próximos jogos.`,
      `${player.name} está na lista de convocados da ${teamName}!`,
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return { isCalledUp: true, message: msg };
  } else {
    // Mensagem de não convocatória
    const messages = [
      `${player.name} não foi convocado desta vez.`,
      `A ${teamName} não incluiu ${player.name} no plantel.`,
      `${player.name} continua a trabalhar para merecer a convocatória.`,
      `Apesar dos esforços, ${player.name} não consta na lista de convocados.`,
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return { isCalledUp: false, message: msg };
  }
}

/**
 * Processa a aposentadoria de um jogador com base na idade e condição física.
 * @param player - O jogador a avaliar
 * @returns Objeto indicando se está a reformar-se e se pode transitar para treinador
 */
export function processPlayerRetirement(
  player: Player
): { isRetiring: boolean; transitionToManagerOption: boolean } {
  // Critérios para aposentadoria:
  // - Idade >= 34 anos (para jogadores de campo) ou >= 38 (guarda-redes)
  // - Ou lesões graves recorrentes (simulação: se teve lesões graves nos últimos anos)
  // - Ou baixa stamina/energia crónica

  const isGoalkeeper = player.position === 'Guarda-Redes';
  const retirementAge = isGoalkeeper ? 38 : 34;

  // Fatores de risco de aposentadoria
  let riskScore = 0;

  // Idade
  if (player.age >= retirementAge) {
    riskScore += (player.age - retirementAge) * 5;
  }

  // Lesão grave (se existir e for grave)
  if (player.injury && player.injury.severity === 'Grave') {
    riskScore += 20;
  }

  // Energia muito baixa de forma consistente (menos de 30)
  if (player.sims.energy < 30) {
    riskScore += 15;
  }

  // Fitness baixo (se existir campo)
  if (player.fitness !== undefined && player.fitness < 40) {
    riskScore += 20;
  }

  // Número de jogos disputados na época (menos de 10 jogos aos 30+ anos)
  if (player.age >= 30 && player.stats.matchesPlayed < 10) {
    riskScore += 10;
  }

  // Probabilidade de aposentadoria: risco > 50
  const retirementProbability = Math.min(1, riskScore / 100);
  const isRetiring = Math.random() < retirementProbability * 0.8; // 80% da probabilidade real

  // Se o jogador se aposentar, verificar se pode transitar para treinador
  // Requisitos: overall >= 70, idade >= 30, e ter tido uma carreira razoável
  const canTransition = player.overall >= 70 &&
                        player.age >= 30 &&
                        player.stats.matchesPlayed > 100 &&
                        (player.stats.goals > 20 || player.stats.assists > 10);

  // Se ainda não estiver a reformar-se, mas já tiver 33+ anos, pode haver opção de transição
  // mesmo que não se reforme já (para planeamento de carreira)
  const transitionOption = canTransition && player.age >= 30 && !isRetiring;

  return {
    isRetiring,
    transitionToManagerOption: transitionOption || (isRetiring && canTransition),
  };
}

/**
 * Gera um agente para um jogador (ou actualiza as suas comissões).
 * @param player - O jogador (para referência)
 * @param agentName - Nome do agente (opcional)
 * @param negotiationSkill - Capacidade de negociação (opcional)
 * @returns Agent gerado
 */
export function generateAgent(
  player: Player,
  agentName?: string,
  negotiationSkill?: number
): Agent {
  const names = [
    'Jorge Mendes', 'Mino Raiola', 'Pini Zahavi', 'Jonathan Barnett',
    'Federico Pastorello', 'Kia Joorabchian', 'Luís Correia', 'Alessandro Lucci',
    'Rafaella Pimenta', 'Paulo Roberto', 'Rui Poças', 'Miguel Pinho'
  ];

  const name = agentName || names[Math.floor(Math.random() * names.length)];
  const skill = negotiationSkill || (40 + Math.floor(Math.random() * 40)); // 40-80
  const fee = 0.05 + Math.random() * 0.15; // 5% a 20%
  const reputation = Math.floor(40 + skill * 0.5); // 40-80

  return {
    id: uuidv4(),
    name,
    feePercentage: Math.round(fee * 100) / 100,
    negotiationSkill: skill,
    reputation: Math.min(100, reputation),
  };
}

/**
 * Simula a negociação de um contrato com o agente.
 * @param player - O jogador
 * @param agent - O agente
 * @param desiredSalary - Salário anual desejado pelo jogador
 * @param clubBudget - Orçamento do clube para salários
 * @returns Resultado da negociação com o salário final e comissão do agente
 */
export function negotiateContract(
  player: Player,
  agent: Agent,
  desiredSalary: number,
  clubBudget: number
): { accepted: boolean; finalSalary: number; agentFee: number; message: string } {
  // O agente tenta obter o melhor negócio para o jogador (e para si)
  const agentSkill = agent.negotiationSkill / 100; // 0.4 a 0.8
  const agentFee = desiredSalary * agent.feePercentage;

  // O clube pode oferecer até 80% do orçamento (simplificado)
  const maxOffer = clubBudget * 0.3; // máximo 30% do orçamento para este contrato

  // O agente tenta aumentar o salário pedido
  let proposedSalary = desiredSalary * (1 + agentSkill * 0.2); // até +16%

  // Se o jogador for muito bom (overall alto), o agente tem mais poder
  if (player.overall >= 85) {
    proposedSalary *= 1.1;
  }

  // Verificar se o clube pode pagar
  if (proposedSalary <= maxOffer) {
    // Aceite
    return {
      accepted: true,
      finalSalary: Math.round(proposedSalary / 1000) * 1000,
      agentFee: Math.round(proposedSalary * agent.feePercentage / 1000) * 1000,
      message: `Contrato aceite! ${agent.name} negociou um salário de ${Math.round(proposedSalary / 1000) * 1000}€/ano.`,
    };
  } else {
    // O clube contra-propõe
    const counterOffer = Math.min(desiredSalary, maxOffer);
    if (counterOffer >= desiredSalary * 0.8) {
      // Aceita a contra-proposta
      return {
        accepted: true,
        finalSalary: Math.round(counterOffer / 1000) * 1000,
        agentFee: Math.round(counterOffer * agent.feePercentage / 1000) * 1000,
        message: `Contrato aceite após negociação. Salário final: ${Math.round(counterOffer / 1000) * 1000}€/ano.`,
      };
    } else {
      // Negociação falhou
      return {
        accepted: false,
        finalSalary: 0,
        agentFee: 0,
        message: `Negociação falhou. O clube não pode pagar o salário pretendido.`,
      };
    }
  }
}
