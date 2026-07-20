// src/engines/medicalEngine.ts

import { Player, Injury } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Representa a equipa médica do clube.
 */
export interface MedicalStaff {
  doctorQuality: number;      // 1-100
  physioQuality: number;      // 1-100
}

/**
 * Representa um plano de tratamento para uma lesão.
 */
export interface TreatmentPlan {
  type: 'Fisioterapia' | 'Descanso Total' | 'Injeção/Infiltração' | 'Cirurgia';
  cost: number;              // custo em euros
  recoverySpeedMultiplier: number; // >1 acelera, <1 atrasa
  riskFactor: number;        // 0-1 probabilidade de complicação/recaída
}

// ============================================================
// FUNÇÕES
// ============================================================

/**
 * Diagnostica uma lesão, estimando o tempo de paragem com base na qualidade médica.
 * @param player - O jogador lesionado (deve ter um objeto injury)
 * @param medicalStaff - A equipa médica do clube
 * @returns Objeto com o nome da lesão, dias estimados e gravidade
 */
export function diagnoseInjury(
  player: Player,
  medicalStaff: MedicalStaff
): { injuryName: string; estimatedDays: number; severity: string } {
  // Se o jogador não tiver lesão ativa, gerar uma lesão fictícia para diagnóstico
  let injury = player.injury;
  if (!injury || injury.durationDays <= 0) {
    // Criar uma lesão simulada (exemplo: lesão ligeira)
    injury = {
      type: 'Lesão muscular ligeira',
      severity: 'Leve',
      durationDays: 5 + Math.floor(Math.random() * 5),
      fitnessImpact: -10,
    };
  }

  // Fator de qualidade médica (0.5 a 1.5)
  const qualityFactor = 0.5 + (medicalStaff.doctorQuality + medicalStaff.physioQuality) / 200;
  // Precisão do diagnóstico: melhores médicos dão estimativas mais precisas (menos variação)
  const precision = qualityFactor / 1.5; // 0.33 a 1.0

  // Estimativa do tempo de recuperação: duração base ± variação controlada pela precisão
  const baseDays = injury.durationDays;
  const variation = Math.floor((1 - precision) * baseDays * 0.5);
  const estimatedDays = Math.max(1, baseDays + (Math.random() * variation * 2 - variation));

  // Determinar gravidade (pode ser ajustada pelo diagnóstico)
  let severity = injury.severity;
  if (medicalStaff.doctorQuality < 30) {
    // Médicos ruins podem subestimar ou superestimar
    if (Math.random() < 0.3) {
      severity = severity === 'Leve' ? 'Moderada' : (severity === 'Moderada' ? 'Grave' : 'Grave');
    }
  }

  return {
    injuryName: injury.type,
    estimatedDays: Math.round(estimatedDays),
    severity,
  };
}

/**
 * Aplica um plano de tratamento a um jogador lesionado.
 * @param player - O jogador
 * @param plan - O plano de tratamento escolhido
 * @param medicalStaff - A equipa médica (para ajustar eficácia)
 * @returns Objeto com o jogador atualizado e um log
 */
export function applyTreatment(
  player: Player,
  plan: TreatmentPlan,
  medicalStaff: MedicalStaff
): { updatedPlayer: Player; log: string } {
  const updatedPlayer = { ...player };

  // Verificar se o jogador está lesionado
  if (!updatedPlayer.injury || updatedPlayer.injury.durationDays <= 0) {
    return {
      updatedPlayer,
      log: `${updatedPlayer.name} não está lesionado. Tratamento não aplicado.`,
    };
  }

  // Clonar a lesão para não modificar o original
  const injury = { ...updatedPlayer.injury };
  const sims = { ...updatedPlayer.sims };

  // Factor de qualidade médica (0.5 a 1.5)
  const qualityFactor = 0.5 + (medicalStaff.doctorQuality + medicalStaff.physioQuality) / 200;

  // Eficácia do tratamento = recoverySpeedMultiplier * qualityFactor
  let effectiveMultiplier = plan.recoverySpeedMultiplier * qualityFactor;

  // Risco de complicação
  const risk = plan.riskFactor * (1 - qualityFactor / 2); // melhor médico reduz risco
  const complicationOccurred = Math.random() < risk;

  let logMessage = '';

  // Aplicar tratamento
  switch (plan.type) {
    case 'Fisioterapia':
      // Acelera recuperação com baixo risco
      injury.durationDays = Math.max(0, Math.round(injury.durationDays / effectiveMultiplier));
      logMessage = `Fisioterapia aplicada. Recuperação acelerada para ${injury.durationDays} dias.`;
      break;

    case 'Descanso Total':
      // Recuperação normal, mas com menos risco
      injury.durationDays = Math.max(0, Math.round(injury.durationDays / (1 + qualityFactor * 0.2)));
      logMessage = `Descanso total prescrito. Recuperação estimada em ${injury.durationDays} dias.`;
      break;

    case 'Injeção/Infiltração':
      // Permite jogar antes, mas com risco de recaída
      const reduction = effectiveMultiplier * 0.7;
      injury.durationDays = Math.max(0, Math.round(injury.durationDays / reduction));
      // Reduzir fitness temporariamente (efeito da infiltração)
      updatedPlayer.fitness = Math.max(0, (updatedPlayer.fitness || 100) - 10);
      logMessage = `Infiltração aplicada. Pode jogar mais cedo, mas fitness reduzido. `;
      if (complicationOccurred) {
        injury.durationDays += 3; // recaída
        logMessage += `Complicação: recaída! +3 dias de recuperação.`;
      }
      break;

    case 'Cirurgia':
      // Solução definitiva, mas cara e com maior tempo de paragem inicial
      const surgeryReduction = 0.3 + qualityFactor * 0.2; // 0.4 a 0.6
      injury.durationDays = Math.max(0, Math.round(injury.durationDays * surgeryReduction));
      // Custo elevado, mas recuperação mais completa
      if (complicationOccurred) {
        injury.durationDays += 10;
        logMessage = `Cirurgia com complicações! +10 dias de recuperação.`;
      } else {
        logMessage = `Cirurgia bem sucedida! Recuperação estimada em ${injury.durationDays} dias.`;
      }
      // Após cirurgia, fitness reduzido mas recupera melhor a longo prazo
      updatedPlayer.fitness = Math.max(0, (updatedPlayer.fitness || 100) - 15);
      break;

    default:
      logMessage = 'Tipo de tratamento desconhecido.';
      return { updatedPlayer, log: logMessage };
  }

  // Se a lesão terminou (durationDays <= 0), limpar
  if (injury.durationDays <= 0) {
    updatedPlayer.injury = null;
    // Boost de moral
    sims.happiness = Math.min(100, sims.happiness + 15);
    sims.morale = 'Boa';
    logMessage += ' Lesão curada!';
  } else {
    updatedPlayer.injury = injury;
    // Moral pode diminuir se a recuperação for longa
    if (injury.durationDays > 20) {
      sims.happiness = Math.max(0, sims.happiness - 5);
    }
  }

  // Atualizar sims
  updatedPlayer.sims = sims;

  // Subtrair custo do tratamento do saldo do jogador (ou do clube, mas aqui usamos o jogador)
  // Na prática, o clube pode pagar, mas simulamos no jogador para simplificar.
  sims.bankBalance -= plan.cost;
  if (sims.bankBalance < 0) sims.bankBalance = 0;

  return {
    updatedPlayer,
    log: logMessage,
  };
}

/**
 * Gera um plano de tratamento recomendado com base na lesão e na qualidade médica.
 * Função auxiliar para a UI sugerir opções ao utilizador.
 * @param injury - A lesão do jogador
 * @param medicalStaff - A equipa médica
 * @returns Array de planos de tratamento recomendados
 */
export function getRecommendedTreatments(
  injury: Injury,
  medicalStaff: MedicalStaff
): TreatmentPlan[] {
  const plans: TreatmentPlan[] = [];

  const qualityFactor = 0.5 + (medicalStaff.doctorQuality + medicalStaff.physioQuality) / 200;

  // Sempre incluir Descanso Total (mais seguro)
  plans.push({
    type: 'Descanso Total',
    cost: 0,
    recoverySpeedMultiplier: 1.0,
    riskFactor: 0.05,
  });

  // Fisioterapia se a qualidade for razoável (>40)
  if (medicalStaff.physioQuality > 40) {
    plans.push({
      type: 'Fisioterapia',
      cost: 500,
      recoverySpeedMultiplier: 1.3 + qualityFactor * 0.3,
      riskFactor: 0.1,
    });
  }

  // Injeção/Infiltração se for lesão muscular e qualidade médica > 50
  if (injury.type.toLowerCase().includes('muscular') && medicalStaff.doctorQuality > 50) {
    plans.push({
      type: 'Injeção/Infiltração',
      cost: 1500,
      recoverySpeedMultiplier: 1.5 + qualityFactor * 0.5,
      riskFactor: 0.3,
    });
  }

  // Cirurgia se lesão grave e qualidade médica > 70
  if (injury.severity === 'Grave' && medicalStaff.doctorQuality > 70) {
    plans.push({
      type: 'Cirurgia',
      cost: 10000,
      recoverySpeedMultiplier: 0.4 + qualityFactor * 0.2, // reduz tempo para 40-60%
      riskFactor: 0.15,
    });
  }

  return plans;
}
