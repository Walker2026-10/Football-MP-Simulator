// src/engines/trainingEngine.ts

import { Player, PlayerAttributes } from '@/types/game';

// ============================================================
// INTERFACES
// ============================================================

/**
 * Representa uma sessão de treino.
 */
export interface TrainingSession {
  intensity: 'Baixa' | 'Média' | 'Alta' | 'Intensa';
  focusArea: keyof PlayerAttributes; // ex: 'pace', 'shooting', etc.
  energyCost: number;                // a calcular com base na intensidade
  injuryRisk: number;                // 0 a 1 (probabilidade de lesão)
}

/**
 * Representa uma lesão sofrida por um jogador.
 */
export interface Injury {
  type: string;                      // ex: 'Torção no tornozelo', 'Rotura muscular'
  severity: 'Leve' | 'Moderada' | 'Grave';
  durationDays: number;              // dias de recuperação
  fitnessImpact: number;             // -X a 0, redução no fitness
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Executa uma sessão de treino para um jogador, processando ganhos,
 * perda de energia e risco de lesão.
 * @param player - O jogador a treinar
 * @param session - A sessão de treino configurada
 * @returns Objeto com o jogador atualizado, log, e eventual lesão
 */
export function executeTrainingSession(
  player: Player,
  session: TrainingSession
): {
  updatedPlayer: Player;
  resultLog: string;
  injuryOccurred: boolean;
  injury?: Injury;
} {
  // Clonar jogador para não modificar o original
  const updatedPlayer = { ...player };
  const attrs = { ...updatedPlayer.attributes };
  const sims = { ...updatedPlayer.sims };

  // Inicializar fitness se não existir (assumir 100% se não houver)
  if (updatedPlayer.fitness === undefined) {
    updatedPlayer.fitness = 100;
  }
  // Inicializar lesão ativa se não existir
  if (updatedPlayer.injury === undefined) {
    updatedPlayer.injury = null;
  }

  // Verificar se o jogador está lesionado e não pode treinar
  if (updatedPlayer.injury !== null && updatedPlayer.injury.durationDays > 0) {
    return {
      updatedPlayer,
      resultLog: `${updatedPlayer.name} está lesionado e não pode treinar. Recupera em ${updatedPlayer.injury.durationDays} dias.`,
      injuryOccurred: false,
    };
  }

  // 1. Calcular custo de energia com base na intensidade
  const intensityMultipliers: Record<TrainingSession['intensity'], number> = {
    'Baixa': 0.5,
    'Média': 1.0,
    'Alta': 1.5,
    'Intensa': 2.0,
  };
  const energyMultiplier = intensityMultipliers[session.intensity];
  const energyCost = Math.round(15 * energyMultiplier + Math.random() * 10);
  session.energyCost = energyCost;

  // Verificar se há energia suficiente para treinar
  if (sims.energy < energyCost) {
    // Treino leve forçado (apenas 50% do custo, mas ganhos reduzidos)
    const reducedCost = Math.round(energyCost * 0.5);
    sims.energy = Math.max(0, sims.energy - reducedCost);
    return {
      updatedPlayer: { ...updatedPlayer, attributes: attrs, sims },
      resultLog: `${updatedPlayer.name} está com pouca energia (${sims.energy}%). Treino leve forçado.`,
      injuryOccurred: false,
    };
  }

  // Consumir energia
  sims.energy = Math.max(0, sims.energy - energyCost);

  // 2. Ganho de atributos na área focada
  const currentAttr = attrs[session.focusArea];
  const maxAttr = Math.min(updatedPlayer.potential, 99);

  if (currentAttr < maxAttr) {
    // Ganho base: 0.5 a 2.0 pontos, multiplicado por growthRate e intensidade
    let gain = (0.5 + Math.random() * 1.5) * updatedPlayer.growthRate * energyMultiplier;
    // Jovens (<=21) têm mais facilidade
    if (updatedPlayer.age <= 21) {
      gain *= 1.2;
    }
    // Jogadores >30 têm mais dificuldade
    if (updatedPlayer.age >= 30) {
      gain *= 0.7;
    }
    // Arredondar para 1 casa decimal
    let newVal = Math.round((currentAttr + gain) * 10) / 10;
    newVal = Math.min(maxAttr, newVal);
    newVal = Math.max(1, newVal);
    attrs[session.focusArea] = newVal;
  }

  // 3. Recalcular overall
  const overall = Math.round(
    (attrs.pace + attrs.shooting + attrs.passing + attrs.dribbling + attrs.defending + attrs.physical) / 6
  );
  updatedPlayer.overall = overall;

  // 4. Impacto na felicidade (treino intenso pode diminuir, treino leve pode aumentar ligeiramente)
  if (session.intensity === 'Intensa' || session.intensity === 'Alta') {
    sims.happiness = Math.max(0, sims.happiness - 5);
  } else {
    sims.happiness = Math.min(100, sims.happiness + 2);
  }

  // Atualizar sims e atributos no jogador
  updatedPlayer.attributes = attrs;
  updatedPlayer.sims = sims;

  // 5. Risco de lesão
  // Quanto menor a energia, maior o risco; quanto maior a intensidade, maior o risco
  const energyFactor = 1 - (sims.energy / 100);
  const intensityFactor = energyMultiplier / 2;
  const baseInjuryRisk = 0.05; // 5% base
  const totalRisk = baseInjuryRisk + (energyFactor * 0.3) + (intensityFactor * 0.3);
  const random = Math.random();

  // Se o jogador tiver fitness baixo, o risco aumenta
  const fitnessRisk = (100 - updatedPlayer.fitness) / 200; // 0 a 0.5
  const adjustedRisk = Math.min(0.9, totalRisk + fitnessRisk);

  if (random < adjustedRisk) {
    // Ocorreu lesão
    const injury = generateInjury(session.intensity, updatedPlayer);
    // Aplicar lesão ao jogador
    updatedPlayer.injury = injury;
    // Reduzir fitness
    updatedPlayer.fitness = Math.max(0, updatedPlayer.fitness + injury.fitnessImpact);
    // Reduzir energia extra
    sims.energy = Math.max(0, sims.energy - 10);

    return {
      updatedPlayer,
      resultLog: `${updatedPlayer.name} sofreu uma lesão: ${injury.type} (${injury.severity}). Recuperação: ${injury.durationDays} dias.`,
      injuryOccurred: true,
      injury,
    };
  }

  // 6. Ganho de fitness (recuperação natural) se não houve lesão
  updatedPlayer.fitness = Math.min(100, updatedPlayer.fitness + 2 + Math.random() * 3);

  // 7. Log de sucesso
  const gainMessage = currentAttr < maxAttr
    ? `${session.focusArea} melhorou de ${currentAttr.toFixed(1)} para ${attrs[session.focusArea].toFixed(1)}.`
    : `${session.focusArea} já está no potencial máximo (${maxAttr}).`;

  return {
    updatedPlayer,
    resultLog: `Treino ${session.intensity} em ${session.focusArea} concluído. ${gainMessage} Energia: ${sims.energy}%.`,
    injuryOccurred: false,
  };
}

/**
 * Gera uma lesão aleatória com base na intensidade do treino.
 */
function generateInjury(intensity: TrainingSession['intensity'], player: Player): Injury {
  const types = [
    'Torção no tornozelo',
    'Entorse no joelho',
    'Rotura muscular',
    'Fissura óssea',
    'Tendinite',
    'Distensão',
    'Lesão no tendão de Aquiles',
    'Contusão',
  ];

  const type = types[Math.floor(Math.random() * types.length)];

  // Severidade baseada na intensidade
  let severity: Injury['severity'];
  let durationDays: number;
  let fitnessImpact: number;

  const rand = Math.random();
  if (intensity === 'Intensa') {
    if (rand < 0.3) severity = 'Leve';
    else if (rand < 0.6) severity = 'Moderada';
    else severity = 'Grave';
  } else if (intensity === 'Alta') {
    if (rand < 0.4) severity = 'Leve';
    else if (rand < 0.75) severity = 'Moderada';
    else severity = 'Grave';
  } else {
    if (rand < 0.6) severity = 'Leve';
    else if (rand < 0.9) severity = 'Moderada';
    else severity = 'Grave';
  }

  // Duração e impacto no fitness
  switch (severity) {
    case 'Leve':
      durationDays = 3 + Math.floor(Math.random() * 5); // 3-7 dias
      fitnessImpact = -(5 + Math.floor(Math.random() * 10)); // -5 a -15
      break;
    case 'Moderada':
      durationDays = 10 + Math.floor(Math.random() * 15); // 10-25 dias
      fitnessImpact = -(15 + Math.floor(Math.random() * 15)); // -15 a -30
      break;
    case 'Grave':
      durationDays = 30 + Math.floor(Math.random() * 60); // 30-90 dias
      fitnessImpact = -(30 + Math.floor(Math.random() * 30)); // -30 a -60
      break;
  }

  return {
    type,
    severity,
    durationDays,
    fitnessImpact,
  };
}

/**
 * Processa a recuperação médica de um jogador, reduzindo a duração da lesão
 * e restaurando gradualmente o fitness.
 * @param player - O jogador em recuperação
 * @returns O jogador atualizado e um log
 */
export function processMedicalRecovery(player: Player): {
  updatedPlayer: Player;
  recoveryLog: string;
} {
  const updatedPlayer = { ...player };

  // Garantir que fitness e injury existem
  if (updatedPlayer.fitness === undefined) {
    updatedPlayer.fitness = 100;
  }
  if (updatedPlayer.injury === undefined) {
    updatedPlayer.injury = null;
  }

  // Se não houver lesão ativa, apenas regenera fitness lentamente
  if (updatedPlayer.injury === null || updatedPlayer.injury.durationDays <= 0) {
    updatedPlayer.fitness = Math.min(100, updatedPlayer.fitness + 2 + Math.random() * 3);
    return {
      updatedPlayer,
      recoveryLog: `${updatedPlayer.name} está em recuperação natural. Fitness: ${updatedPlayer.fitness}%.`,
    };
  }

  // Reduzir duração da lesão em 1 dia
  updatedPlayer.injury.durationDays -= 1;

  // Recuperar fitness gradualmente (dependendo da gravidade)
  const recoveryRate = updatedPlayer.injury.severity === 'Grave' ? 2 :
                       updatedPlayer.injury.severity === 'Moderada' ? 4 : 6;
  updatedPlayer.fitness = Math.min(100, updatedPlayer.fitness + recoveryRate + Math.random() * 3);

  // Se a lesão terminou, limpar e dar um boost de moral
  if (updatedPlayer.injury.durationDays <= 0) {
    updatedPlayer.injury = null;
    updatedPlayer.sims.happiness = Math.min(100, updatedPlayer.sims.happiness + 15);
    updatedPlayer.sims.morale = 'Boa';
    return {
      updatedPlayer,
      recoveryLog: `${updatedPlayer.name} recuperou totalmente da lesão! Fitness: ${updatedPlayer.fitness}%.`,
    };
  }

  return {
    updatedPlayer,
    recoveryLog: `${updatedPlayer.name} em recuperação. Faltam ${updatedPlayer.injury.durationDays} dias. Fitness: ${updatedPlayer.fitness}%.`,
  };
}

/**
 * Calcula a intensidade de treino recomendada com base na energia e calendário.
 * @param player - O jogador
 * @param nextMatchInDays - Dias até ao próximo jogo (opcional)
 * @returns Objeto com a recomendação e a razão
 */
export function calculateRecommendedWorkload(
  player: Player,
  nextMatchInDays: number = 7
): {
  recommendedIntensity: 'Baixa' | 'Média' | 'Alta' | 'Intensa';
  reason: string;
} {
  // Se estiver lesionado, recomenda repouso
  if (player.injury && player.injury.durationDays > 0) {
    return {
      recommendedIntensity: 'Baixa',
      reason: `Lesionado (${player.injury.severity}). Recomenda-se repouso total.`,
    };
  }

  const energy = player.sims.energy;

  // Se energia baixa, reduzir intensidade
  if (energy < 30) {
    return {
      recommendedIntensity: 'Baixa',
      reason: 'Energia muito baixa. Risco de lesão elevado. Treino leve.',
    };
  }

  if (energy < 50) {
    return {
      recommendedIntensity: 'Média',
      reason: 'Energia moderada. Treino médio para não sobrecarregar.',
    };
  }

  // Se próximo jogo (<=2 dias), reduzir intensidade para preservar
  if (nextMatchInDays <= 2) {
    return {
      recommendedIntensity: 'Baixa',
      reason: `Jogo em ${nextMatchInDays} dia(s). Preservar energia.`,
    };
  }

  // Se próximo jogo (3-5 dias), intensidade média
  if (nextMatchInDays <= 5) {
    return {
      recommendedIntensity: 'Média',
      reason: `Jogo em ${nextMatchInDays} dia(s). Treino equilibrado.`,
    };
  }

  // Se energia alta e jogo longe, pode treinar forte
  if (energy >= 80) {
    return {
      recommendedIntensity: 'Intensa',
      reason: 'Energia alta e sem jogos próximos. Aproveitar para evoluir.',
    };
  }

  if (energy >= 60) {
    return {
      recommendedIntensity: 'Alta',
      reason: 'Energia boa. Treino intenso para acelerar evolução.',
    };
  }

  // Fallback
  return {
    recommendedIntensity: 'Média',
    reason: 'Condições normais. Treino médio recomendado.',
  };
}
