// src/engines/infrastructureEngine.ts

import { Club } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Representa as infraestruturas do clube.
 */
export interface StadiumFacilities {
  capacity: number;              // número de lugares
  ticketPrice: number;           // preço médio do bilhete (€)
  pitchQuality: number;          // 1-100 (qualidade do relvado)
  youthAcademyLevel: number;     // 1-10 (nível da academia de formação)
  medicalCenterLevel: number;    // 1-10 (nível do departamento médico)
  trainingGroundLevel: number;   // 1-10 (nível do centro de treinos)
}

// ============================================================
// FUNÇÕES
// ============================================================

/**
 * Calcula a receita de um jogo em casa com base nas infraestruturas,
 * reputação do adversário e condições meteorológicas.
 * @param stadium - Infraestruturas do estádio
 * @param opponentReputation - Reputação do adversário (0-100)
 * @param weather - Condições meteorológicas ('Bom' | 'Chuva' | 'Nevoeiro' | 'Calor')
 * @returns Objeto com a receita total e a afluência
 */
export function calculateMatchDayRevenue(
  stadium: StadiumFacilities,
  opponentReputation: number,
  weather: string = 'Bom'
): { totalRevenue: number; attendance: number } {
  // 1. Calcular afluência esperada (baseada na capacidade, reputação do adversário e clima)
  const weatherFactors: Record<string, number> = {
    'Bom': 1.0,
    'Chuva': 0.8,
    'Nevoeiro': 0.7,
    'Calor': 0.85,
  };
  const weatherFactor = weatherFactors[weather] || 1.0;

  // Fator de reputação do adversário (0.5 a 1.5)
  const reputationFactor = 0.5 + (opponentReputation / 100) * 1.0; // 0.5 a 1.5

  // Fator de qualidade do relvado (afeta a experiência, menor impacto na afluência)
  const pitchFactor = 0.9 + (stadium.pitchQuality / 100) * 0.1; // 0.91 a 1.0

  // Fator de nível do centro de treinos (influencia a percepção do clube)
  const trainingFactor = 0.95 + (stadium.trainingGroundLevel / 10) * 0.05; // 0.96 a 1.0

  // Fator combinado
  const combinedFactor = weatherFactor * reputationFactor * pitchFactor * trainingFactor;

  // Afluência estimada: capacidade * factor combinado (limitado a 100% da capacidade)
  const rawAttendance = stadium.capacity * combinedFactor;
  const attendance = Math.min(stadium.capacity, Math.max(0, Math.round(rawAttendance)));

  // 2. Receita de bilheteira
  const ticketRevenue = attendance * stadium.ticketPrice;

  // 3. Receita de catering e merchandising (proporcional à afluência)
  const cateringRevenue = attendance * 5; // €5 por pessoa, em média
  const merchandiseRevenue = attendance * 3; // €3 por pessoa

  // 4. Bónus se o jogo for de grande atratividade (reputação do adversário > 70)
  let bonus = 0;
  if (opponentReputation > 70) {
    bonus = Math.floor(attendance * 2); // €2 extra por pessoa
  }

  const totalRevenue = ticketRevenue + cateringRevenue + merchandiseRevenue + bonus;

  return {
    totalRevenue,
    attendance,
  };
}

/**
 * Melhora uma infraestrutura específica do clube, consumindo orçamento.
 * @param stadium - Infraestruturas atuais
 * @param facilityType - Tipo de infraestrutura a melhorar (chave de StadiumFacilities)
 * @param clubBudget - Orçamento disponível do clube
 * @param maxLevel - Nível máximo permitido (opcional, por omissão 10 para níveis, 100 para pitchQuality e capacity)
 * @returns Objeto com as infraestruturas actualizadas, orçamento remanescente e custo
 */
export function upgradeFacility(
  stadium: StadiumFacilities,
  facilityType: keyof StadiumFacilities,
  clubBudget: number,
  maxLevel?: number
): {
  updatedStadium: StadiumFacilities;
  remainingBudget: number;
  cost: number;
} {
  // Clonar as infraestruturas para não modificar o original
  const updated = { ...stadium };

  // Obter o valor actual
  const currentValue = updated[facilityType] as number;

  // Determinar o valor máximo permitido
  let maxValue: number;
  if (maxLevel !== undefined) {
    maxValue = maxLevel;
  } else {
    // Valores máximos por tipo
    if (facilityType === 'capacity') {
      maxValue = 150000; // capacidade máxima de um estádio
    } else if (facilityType === 'ticketPrice') {
      maxValue = 200; // preço máximo do bilhete (€)
    } else if (facilityType === 'pitchQuality') {
      maxValue = 100;
    } else {
      // youthAcademyLevel, medicalCenterLevel, trainingGroundLevel
      maxValue = 10;
    }
  }

  // Verificar se já está no máximo
  if (currentValue >= maxValue) {
    return {
      updatedStadium: stadium,
      remainingBudget: clubBudget,
      cost: 0,
    };
  }

  // Calcular custo do upgrade (baseado no nível actual e tipo)
  let cost = 0;
  let increment = 0;

  switch (facilityType) {
    case 'capacity':
      // Aumentar capacidade em 5% do atual (mínimo 1000 lugares)
      increment = Math.max(1000, Math.round(currentValue * 0.05));
      cost = increment * 200; // €200 por lugar
      break;
    case 'ticketPrice':
      increment = 2; // +€2
      cost = 50000; // custo fixo
      break;
    case 'pitchQuality':
      increment = 5;
      cost = 20000 + currentValue * 1000;
      break;
    case 'youthAcademyLevel':
    case 'medicalCenterLevel':
    case 'trainingGroundLevel':
      increment = 1;
      cost = 50000 + currentValue * 10000; // aumenta com o nível
      break;
    default:
      throw new Error(`Tipo de infraestrutura não suportado: ${facilityType}`);
  }

  // Verificar se o clube tem orçamento suficiente
  if (clubBudget < cost) {
    return {
      updatedStadium: stadium,
      remainingBudget: clubBudget,
      cost: 0,
    };
  }

  // Aplicar o upgrade
  const newValue = Math.min(maxValue, currentValue + increment);
  updated[facilityType] = newValue as any;

  // Subtrair custo do orçamento
  const remainingBudget = clubBudget - cost;

  return {
    updatedStadium: updated,
    remainingBudget,
    cost,
  };
}

/**
 * Calcula o nível de reputação de um clube com base nas suas infraestruturas.
 * @param stadium - Infraestruturas do clube
 * @param baseReputation - Reputação base do clube (0-100)
 * @returns Reputação ajustada (0-100)
 */
export function calculateClubReputation(
  stadium: StadiumFacilities,
  baseReputation: number
): number {
  // Fatores de infraestrutura que influenciam a reputação
  const pitchFactor = stadium.pitchQuality / 100; // 0-1
  const academyFactor = stadium.youthAcademyLevel / 10; // 0-1
  const medicalFactor = stadium.medicalCenterLevel / 10; // 0-1
  const trainingFactor = stadium.trainingGroundLevel / 10; // 0-1

  // Média dos fatores (peso 40%)
  const infraScore = (pitchFactor + academyFactor + medicalFactor + trainingFactor) / 4;
  const infraBonus = infraScore * 40; // 0-40 pontos

  // A capacidade do estádio também influencia (capacidade / 1000, até 50 pontos)
  const capacityFactor = Math.min(stadium.capacity / 2000, 50); // 0-50

  // Reputação final = base (60%) + infra (40%)
  const total = baseReputation * 0.6 + infraBonus + capacityFactor * 0.4;

  return Math.min(100, Math.max(0, Math.round(total)));
}
