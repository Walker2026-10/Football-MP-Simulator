// src/engines/sponsorsEngine.ts

import { v4 as uuidv4 } from 'uuid';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Contrato de patrocínio para um jogador ou clube.
 */
export interface SponsorContract {
  id: string;
  brandName: string;
  tier: 'LOCAL' | 'NACIONAL' | 'GLOBAL';
  weeklyPay: number;          // pagamento semanal em euros
  durationWeeks: number;      // duração em semanas
  bonusClause?: {
    target: string;           // ex: 'golos', 'assistencias', 'trof_eus'
    reward: number;           // bónus financeiro em euros
  };
  minReputation: number;      // reputação mínima exigida (0-100)
  active: boolean;            // se o contrato está ativo
  weeksRemaining: number;     // semanas restantes
}

// ============================================================
// DADOS DE EXEMPLO (para geração de ofertas)
// ============================================================

const brandTemplates = [
  // Marcas LOCAIS (tier 1)
  { brandName: 'Pão de Açúcar', tier: 'LOCAL' as const, basePay: 1000, minRep: 20 },
  { brandName: 'Supermercados Continente', tier: 'LOCAL' as const, basePay: 1200, minRep: 25 },
  { brandName: 'Galp', tier: 'LOCAL' as const, basePay: 1500, minRep: 30 },
  { brandName: 'EDP', tier: 'LOCAL' as const, basePay: 1800, minRep: 35 },
  
  // Marcas NACIONAIS (tier 2)
  { brandName: 'NOS', tier: 'NACIONAL' as const, basePay: 3000, minRep: 40 },
  { brandName: 'MEO', tier: 'NACIONAL' as const, basePay: 3200, minRep: 45 },
  { brandName: 'Pingo Doce', tier: 'NACIONAL' as const, basePay: 3500, minRep: 50 },
  { brandName: 'BPI', tier: 'NACIONAL' as const, basePay: 4000, minRep: 55 },
  
  // Marcas GLOBAIS (tier 3)
  { brandName: 'Nike', tier: 'GLOBAL' as const, basePay: 8000, minRep: 60 },
  { brandName: 'Adidas', tier: 'GLOBAL' as const, basePay: 7500, minRep: 60 },
  { brandName: 'Puma', tier: 'GLOBAL' as const, basePay: 6000, minRep: 55 },
  { brandName: 'Red Bull', tier: 'GLOBAL' as const, basePay: 10000, minRep: 70 },
  { brandName: 'Samsung', tier: 'GLOBAL' as const, basePay: 12000, minRep: 75 },
  { brandName: 'Coca-Cola', tier: 'GLOBAL' as const, basePay: 9000, minRep: 65 },
];

// Lista de cláusulas de bónus possíveis
const bonusClauses = [
  { target: 'golos', reward: 5000 },
  { target: 'assistencias', reward: 3000 },
  { target: 'trof_eus', reward: 20000 },
  { target: 'jogos_disputados', reward: 2000 },
  { target: 'selecao_nacional', reward: 15000 },
];

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Gera ofertas de patrocínio com base na reputação e overall do jogador/clube.
 * @param reputation - Nível de reputação (0-100)
 * @param overall - Overall do jogador (1-99) ou 0 se for clube
 * @param isClub - Se a oferta é para um clube (true) ou jogador (false)
 * @param maxOffers - Número máximo de ofertas a gerar (default 3)
 * @returns Array de contratos de patrocínio
 */
export function generateSponsorOffers(
  reputation: number,
  overall: number = 0,
  isClub: boolean = false,
  maxOffers: number = 3
): SponsorContract[] {
  const offers: SponsorContract[] = [];

  // Filtrar marcas com base na reputação mínima
  const eligibleBrands = brandTemplates.filter(b => reputation >= b.minRep);

  // Adicionar bónus de overall (jogadores com alto overall atraem mais marcas)
  const overallBonus = Math.floor(overall / 10); // 0 a 9

  // Selecionar marcas elegíveis, dando prioridade às de maior tier
  const sortedBrands = [...eligibleBrands].sort((a, b) => {
    const tierOrder = { GLOBAL: 3, NACIONAL: 2, LOCAL: 1 };
    return tierOrder[b.tier] - tierOrder[a.tier];
  });

  // Limitar número de ofertas
  const selectedBrands = sortedBrands.slice(0, Math.min(maxOffers + overallBonus, sortedBrands.length));

  for (const brand of selectedBrands) {
    // Calcular pagamento semanal
    // Base + bónus de reputação + bónus de overall (para jogadores)
    const repBonus = Math.floor((reputation - brand.minRep) * 50);
    const overallBonusPay = isClub ? 0 : overall * 100;
    const weeklyPay = brand.basePay + repBonus + overallBonusPay;

    // Duração entre 10 e 30 semanas
    const durationWeeks = 10 + Math.floor(Math.random() * 21);

    // Gerar cláusula de bónus (30% de probabilidade)
    let bonusClause: { target: string; reward: number } | undefined;
    if (Math.random() < 0.3 && isClub === false) { // apenas jogadores têm cláusulas individuais
      const bonusTemplate = bonusClauses[Math.floor(Math.random() * bonusClauses.length)];
      bonusClause = {
        target: bonusTemplate.target,
        reward: bonusTemplate.reward + Math.floor(Math.random() * 5000),
      };
    }

    offers.push({
      id: uuidv4(),
      brandName: brand.brandName,
      tier: brand.tier,
      weeklyPay,
      durationWeeks,
      bonusClause,
      minReputation: brand.minRep,
      active: true,
      weeksRemaining: durationWeeks,
    });
  }

  return offers;
}

/**
 * Avalia os objectivos das cláusulas de bónus no final da época.
 * @param activeContracts - Lista de contratos ativos
 * @param seasonStats - Estatísticas da temporada (golos, assistências, troféus)
 * @returns Objeto com o total de bónus ganho e os contratos actualizados
 */
export function evaluateSponsorObjectives(
  activeContracts: SponsorContract[],
  seasonStats: { goals: number; assists: number; trophies: number }
): { totalBonusEarned: number; updatedContracts: SponsorContract[] } {
  let totalBonus = 0;
  const updatedContracts = activeContracts.map(contract => {
    // Se o contrato não estiver ativo ou não tiver cláusula, ignorar
    if (!contract.active || !contract.bonusClause) {
      return contract;
    }

    const clause = contract.bonusClause;
    let achieved = false;

    // Verificar se o objectivo foi cumprido
    switch (clause.target) {
      case 'golos':
        achieved = seasonStats.goals >= 10; // exemplo: 10+ golos
        break;
      case 'assistencias':
        achieved = seasonStats.assists >= 8; // exemplo: 8+ assistências
        break;
      case 'trof_eus':
        achieved = seasonStats.trophies >= 1; // pelo menos 1 troféu
        break;
      case 'jogos_disputados':
        achieved = seasonStats.goals + seasonStats.assists >= 20; // proxy: participação em golos
        break;
      case 'selecao_nacional':
        achieved = seasonStats.trophies >= 1 && seasonStats.goals >= 5; // combinação
        break;
      default:
        achieved = false;
    }

    if (achieved) {
      totalBonus += clause.reward;
      // O contrato pode ser renovado ou simplesmente manter-se
      // Vamos manter o contrato activo e remover a cláusula (já foi cumprida)
      const { bonusClause, ...rest } = contract;
      return {
        ...rest,
        bonusClause: undefined, // cláusula cumprida, removemos
      };
    }

    // Se não cumpriu, manter a cláusula para a próxima época (se ainda houver tempo)
    // Mas descontar 1 semana (simplificado)
    return {
      ...contract,
      weeksRemaining: contract.weeksRemaining - 1,
      active: contract.weeksRemaining > 0,
    };
  });

  return {
    totalBonusEarned: totalBonus,
    updatedContracts,
  };
}

/**
 * Processa o pagamento semanal de um contrato de patrocínio.
 * @param contract - O contrato de patrocínio
 * @param weeks - Número de semanas a processar (default 1)
 * @returns O contrato actualizado com semanas restantes
 */
export function processSponsorPayment(
  contract: SponsorContract,
  weeks: number = 1
): { updatedContract: SponsorContract; payment: number } {
  if (!contract.active) {
    return { updatedContract: contract, payment: 0 };
  }

  const weeksToProcess = Math.min(weeks, contract.weeksRemaining);
  const payment = contract.weeklyPay * weeksToProcess;

  const updatedContract = {
    ...contract,
    weeksRemaining: contract.weeksRemaining - weeksToProcess,
    active: contract.weeksRemaining - weeksToProcess > 0,
  };

  return {
    updatedContract,
    payment,
  };
}
