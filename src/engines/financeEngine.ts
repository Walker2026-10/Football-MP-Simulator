// src/engines/financeEngine.ts

import { Player, Club, SimsData, Morale } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Representa um item de estilo de vida que o jogador pode adquirir.
 */
export interface LifestyleItem {
  id: string;
  name: string;
  category: 'Imóveis' | 'Veículos' | 'Luxo' | 'Investimentos';
  price: number;                  // custo de aquisição (€)
  monthlyMaintenance: number;     // custo mensal (€)
  statusBoost: number;           // bónus de felicidade (0-20)
  reputationBoost: number;       // bónus de reputação (0-10)
}

/**
 * Representa uma oferta de patrocínio para o jogador.
 */
export interface SponsorshipOffer {
  id: string;
  brandName: string;
  weeklyPay: number;
  durationWeeks: number;
  minReputationRequired: number;   // reputação mínima exigida (0-100)
  playerId?: string;
}

// ============================================================
// FUNÇÕES
// ============================================================

/**
 * Processa o pagamento semanal do salário e deduz as despesas de estilo de vida.
 * @param player - O jogador
 * @param ownedItems - Lista de itens que o jogador possui (para calcular manutenção)
 * @returns Objeto com o jogador atualizado e log
 */
export function processWeeklyPaycheck(
  player: Player,
  ownedItems: LifestyleItem[] = []
): { updatedPlayer: Player; log: string } {
  const updatedPlayer = { ...player };
  const sims = { ...updatedPlayer.sims };
  const logs: string[] = [];

  // 1. Calcular salário semanal (baseado no salário anual)
  const weeklySalary = Math.floor(player.salary / 52);
  sims.bankBalance += weeklySalary;
  logs.push(`Salário semanal creditado: ${weeklySalary.toLocaleString()}€.`);

  // 2. Deduzir manutenção mensal (dividida por 4 semanas)
  const totalMonthlyMaintenance = ownedItems.reduce((sum, item) => sum + item.monthlyMaintenance, 0);
  const weeklyMaintenance = Math.floor(totalMonthlyMaintenance / 4);
  sims.bankBalance -= weeklyMaintenance;
  logs.push(`Custos de manutenção: ${weeklyMaintenance.toLocaleString()}€.`);

  // 3. Ajustar felicidade com base nos itens (efeito contínuo)
  const totalStatusBoost = ownedItems.reduce((sum, item) => sum + item.statusBoost, 0);
  sims.happiness = Math.min(100, sims.happiness + totalStatusBoost / 10); // bónus suave

  // 4. Atualizar moral
  const morale = updateMorale(sims.energy, sims.happiness, sims.bankBalance);
  sims.morale = morale;

  // Garantir que o saldo não fique negativo (pode ficar, mas tratamos como endividamento)
  if (sims.bankBalance < 0) {
    logs.push(`Saldo negativo! ${player.name} está com dificuldades financeiras.`);
  }

  updatedPlayer.sims = sims;

  return {
    updatedPlayer,
    log: logs.join(' '),
  };
}

/**
 * Função auxiliar para atualizar a moral (copiada de simsEngine.ts para evitar dependência circular).
 */
function updateMorale(energy: number, happiness: number, bankBalance: number): Morale {
  const score = (energy * 0.3 + happiness * 0.5 + Math.min(bankBalance / 100000, 1) * 20);
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Boa';
  if (score >= 50) return 'Normal';
  if (score >= 30) return 'Baixa';
  return 'Péssima';
}

/**
 * Compra um item de estilo de vida, debitando o valor e aplicando bónus.
 * @param player - O jogador
 * @param item - O item a adquirir
 * @param ownedItems - Lista atual de itens do jogador (para referência)
 * @returns Objeto com o jogador atualizado, sucesso e mensagem
 */
export function purchaseLifestyleItem(
  player: Player,
  item: LifestyleItem,
  ownedItems: LifestyleItem[] = []
): { updatedPlayer: Player; success: boolean; message: string } {
  const updatedPlayer = { ...player };
  const sims = { ...updatedPlayer.sims };

  // Verificar se o jogador já possui o item (pelo ID)
  if (ownedItems.some(owned => owned.id === item.id)) {
    return {
      updatedPlayer,
      success: false,
      message: `Já possuis ${item.name}.`,
    };
  }

  // Verificar saldo
  if (sims.bankBalance < item.price) {
    return {
      updatedPlayer,
      success: false,
      message: `Saldo insuficiente. Precisas de ${item.price.toLocaleString()}€, tens ${sims.bankBalance.toLocaleString()}€.`,
    };
  }

  // Debita o valor
  sims.bankBalance -= item.price;

  // Aplica bónus imediato de felicidade (limitado a 100)
  sims.happiness = Math.min(100, sims.happiness + item.statusBoost);

  // Aumenta a reputação (aqui apenas um placeholder; poderíamos adicionar campo no futuro)
  // Por enquanto, apenas guardamos no log.

  // Atualizar moral
  sims.morale = updateMorale(sims.energy, sims.happiness, sims.bankBalance);

  updatedPlayer.sims = sims;

  return {
    updatedPlayer,
    success: true,
    message: `Compra de ${item.name} realizada com sucesso! Felicidade +${item.statusBoost}.`,
  };
}

/**
 * Avalia e gera ofertas de patrocínio para o jogador.
 * @param player - O jogador
 * @param currentReputation - Nível de reputação do jogador (0-100)
 * @returns Lista de ofertas de patrocínio
 */
export function evaluateSponsorships(
  player: Player,
  currentReputation: number = 50 // valor base, pode ser calculado a partir de overall/honors
): SponsorshipOffer[] {
  const offers: SponsorshipOffer[] = [];

  // Calcular reputação com base no overall e idade
  const baseRep = (player.overall - 50) * 2; // 0 a 100
  const ageBonus = player.age <= 22 ? 20 : 0;
  const reputation = Math.min(100, Math.max(0, baseRep + ageBonus + currentReputation));

  // Só gera ofertas se reputação for > 40
  if (reputation < 40) return offers;

  // Lista de marcas com requisitos mínimos
  const brandTemplates = [
    { brandName: 'Nike', minRep: 40, basePay: 5000 },
    { brandName: 'Adidas', minRep: 40, basePay: 4500 },
    { brandName: 'Puma', minRep: 35, basePay: 4000 },
    { brandName: 'Under Armour', minRep: 30, basePay: 3000 },
    { brandName: 'New Balance', minRep: 25, basePay: 2000 },
    { brandName: 'Mizuno', minRep: 20, basePay: 1500 },
    { brandName: 'Red Bull', minRep: 50, basePay: 10000 },
    { brandName: 'Pepsi', minRep: 45, basePay: 8000 },
    { brandName: 'Coca-Cola', minRep: 45, basePay: 8000 },
    { brandName: 'Samsung', minRep: 55, basePay: 12000 },
  ];

  // Selecionar marcas que atendem ao requisito
  const eligibleBrands = brandTemplates.filter(b => reputation >= b.minRep);

  // Gerar ofertas (no máximo 3)
  const numOffers = Math.min(eligibleBrands.length, 1 + Math.floor(Math.random() * 3));
  const shuffled = eligibleBrands.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numOffers);

  for (const brand of selected) {
    // Pagamento semanal: base + bónus por overall e reputação
    const bonus = Math.floor((reputation - brand.minRep) * 100);
    const weeklyPay = brand.basePay + bonus;

    // Duração: 4 a 20 semanas
    const durationWeeks = 4 + Math.floor(Math.random() * 17);

    offers.push({
      id: `sponsor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brandName: brand.brandName,
      weeklyPay,
      durationWeeks,
      minReputationRequired: brand.minRep,
    });
  }

  return offers;
}

/**
 * Atualiza as finanças de um clube após um jogo (receitas e despesas).
 * @param club - O clube
 * @param matchRevenue - Receita do jogo (bilheteira, TV, etc.)
 * @param wagesTotal - Soma dos salários semanais de todos os jogadores do plantel principal
 * @returns O clube com orçamento atualizado
 */
export function calculateClubFinances(
  club: Club,
  matchRevenue: number,
  wagesTotal: number
): Club {
  const updatedClub = { ...club };

  // Adicionar receita
  updatedClub.budget += matchRevenue;

  // Subtrair despesas com salários (aplicado semanalmente)
  updatedClub.budget -= wagesTotal;

  // Outras despesas fixas (manutenção do estádio, staff, etc.)
  const overhead = 50000 + Math.floor(Math.random() * 100000);
  updatedClub.budget -= overhead;

  // Garantir que o orçamento não fique negativo
  if (updatedClub.budget < 0) {
    updatedClub.budget = 0;
  }

  return updatedClub;
}

/**
 * Processa uma oferta de patrocínio ativa para o jogador.
 * @param player - O jogador
 * @param offer - A oferta de patrocínio
 * @param weeksActive - Número de semanas já ativa (para calcular pagamento)
 * @returns Objeto com jogador atualizado e log
 */
export function processSponsorshipPayment(
  player: Player,
  offer: SponsorshipOffer,
  weeksActive: number = 1
): { updatedPlayer: Player; log: string } {
  const updatedPlayer = { ...player };
  const sims = { ...updatedPlayer.sims };

  // Calcular pagamento (multiplicar pelo número de semanas decorridas)
  const payment = offer.weeklyPay * weeksActive;
  sims.bankBalance += payment;

  // Aumentar felicidade por ter patrocínio
  sims.happiness = Math.min(100, sims.happiness + 2);

  updatedPlayer.sims = sims;

  return {
    updatedPlayer,
    log: `Pagamento de patrocínio (${offer.brandName}): ${payment.toLocaleString()}€.`,
  };
}

/**
 * Calcula o nível de reputação de um jogador (0-100) com base em overall, idade, conquistas e estilo de vida.
 * Função auxiliar para ser usada por outros motores.
 */
export function calculateReputation(player: Player): number {
  let rep = 0;

  // Overall: 40-99
  rep += (player.overall - 40) * 1.5;

  // Idade: jovens (<=22) ganham bónus de potencial
  if (player.age <= 22) {
    rep += 10;
  } else if (player.age >= 30) {
    rep -= 5;
  }

  // Conquistas (se o jogador tiver honras)
  if (player.honors && player.honors.length > 0) {
    rep += player.honors.length * 5;
  }

  // Estilo de vida: nível 4 ou 5 dá bónus
  if (player.sims.lifestyleLevel >= 4) {
    rep += 5;
  }

  // Felicidade alta reflete positivamente
  if (player.sims.happiness >= 80) {
    rep += 5;
  }

  // Limitar a 0-100
  return Math.min(100, Math.max(0, rep));
}
