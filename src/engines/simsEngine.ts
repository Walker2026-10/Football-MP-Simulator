// src/engines/simsEngine.ts

import { Player, SimsData, PlayerAttributes, Morale } from '@/types/game';

/**
 * Gera um log de evento aleatório da vida pessoal.
 */
function generateRandomLifeEvent(player: Player): string | null {
  const events = [
    `${player.name} passou o dia com a família e sente-se revigorado.`,
    `${player.name} recebeu um convite para um evento comercial e ganhou um bónus.`,
    `${player.name} está insatisfeito com o seu salário e pensa em pedir um aumento.`,
    `${player.name} teve uma discussão com um colega de equipa.`,
    `${player.name} foi elogiado pela imprensa após um bom treino.`,
    `${player.name} sofreu uma pequena lesão durante o treino (recuperação rápida).`,
    `${player.name} participou numa ação de caridade e sente-se realizado.`,
    `${player.name} está a considerar mudar de agente.`,
    `${player.name} recebeu uma proposta publicitária interessante.`,
  ];

  // 15% de probabilidade de evento aleatório
  if (Math.random() < 0.15) {
    const eventIndex = Math.floor(Math.random() * events.length);
    return events[eventIndex];
  }
  return null;
}

/**
 * Atualiza a moral com base na energia, felicidade e outros fatores.
 */
function updateMorale(energy: number, happiness: number, bankBalance: number): Morale {
  // Pontuação ponderada
  const score = (energy * 0.3 + happiness * 0.5 + Math.min(bankBalance / 100000, 1) * 20);

  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Boa';
  if (score >= 50) return 'Normal';
  if (score >= 30) return 'Baixa';
  return 'Péssima';
}

/**
 * Avança um dia na vida pessoal e treino do jogador.
 * @param player - O jogador a processar
 * @returns Objeto com o jogador atualizado e um log diário
 */
export function advanceDaySims(player: Player): { updatedPlayer: Player; dailyLog: string } {
  const sims = { ...player.sims };
  const logs: string[] = [];

  // 1. Consumo/recuperação de energia e felicidade com base no estilo de vida
  // Estilo de vida 1 (mais simples) - recupera mais energia, mas menos felicidade
  // Estilo de vida 5 (luxo) - menos energia, mais felicidade
  const lifestyleLevel = sims.lifestyleLevel;
  const energyChange = 5 + (5 - lifestyleLevel) * 2; // +15 a +5
  const happinessChange = 2 + (lifestyleLevel) * 2;  // +4 a +12

  sims.energy = Math.min(100, Math.max(0, sims.energy + energyChange));
  sims.happiness = Math.min(100, Math.max(0, sims.happiness + happinessChange));

  // 2. Pequena variação aleatória
  sims.energy += Math.floor(Math.random() * 6 - 3);
  sims.happiness += Math.floor(Math.random() * 6 - 3);
  sims.energy = Math.min(100, Math.max(0, sims.energy));
  sims.happiness = Math.min(100, Math.max(0, sims.happiness));

  // 3. Evento aleatório da vida pessoal
  const eventLog = generateRandomLifeEvent(player);
  if (eventLog) {
    logs.push(eventLog);
    // Ajustar energia/felicidade conforme o evento (efeitos simplificados)
    if (eventLog.includes('revigorado') || eventLog.includes('elogiado') || eventLog.includes('realizado')) {
      sims.energy = Math.min(100, sims.energy + 10);
      sims.happiness = Math.min(100, sims.happiness + 10);
    } else if (eventLog.includes('insatisfeito') || eventLog.includes('discussão') || eventLog.includes('lesão')) {
      sims.energy = Math.max(0, sims.energy - 10);
      sims.happiness = Math.max(0, sims.happiness - 10);
    } else if (eventLog.includes('bónus') || eventLog.includes('proposta publicitária')) {
      sims.bankBalance += 5000 + Math.floor(Math.random() * 15000);
    }
  }

  // 4. Atualizar moral
  sims.morale = updateMorale(sims.energy, sims.happiness, sims.bankBalance);

  // 5. Ganho diário de salário (proporcional)
  const dailySalary = Math.floor(player.salary / 365);
  sims.bankBalance += dailySalary;

  // 6. Ocasionalmente, pequenas despesas (lifestyle)
  const dailyExpense = Math.floor(lifestyleLevel * 50 + Math.random() * 100);
  sims.bankBalance -= dailyExpense;
  if (sims.bankBalance < 0) sims.bankBalance = 0;

  // 7. Atualizar o jogador
  const updatedPlayer: Player = {
    ...player,
    sims,
  };

  // Log de resumo diário (se não houve evento, colocar algo genérico)
  if (logs.length === 0) {
    logs.push(`Dia normal: energia ${sims.energy}%, felicidade ${sims.happiness}%.`);
  }

  return {
    updatedPlayer,
    dailyLog: logs.join(' '),
  };
}

/**
 * Processa um treino focado numa área específica.
 * @param player - O jogador a treinar
 * @param focusArea - Atributo a melhorar
 * @returns O jogador atualizado
 */
export function processPlayerTraining(
  player: Player,
  focusArea: keyof PlayerAttributes
): Player {
  // Clonar atributos e sims
  const attrs = { ...player.attributes };
  const sims = { ...player.sims };

  // Verificar se há energia suficiente para treinar (mínimo 20)
  if (sims.energy < 20) {
    // Treino leve (menos eficaz)
    sims.energy = Math.max(0, sims.energy - 10);
    sims.happiness = Math.max(0, sims.happiness - 5);
    // Log de aviso pode ser adicionado fora
    return { ...player, attributes: attrs, sims };
  }

  // Consumo de energia
  sims.energy = Math.max(0, sims.energy - 25);
  // Aumento da felicidade se o treino for bem-sucedido (ligeiro)
  sims.happiness = Math.min(100, sims.happiness + 2);

  // Fator de crescimento baseado no growthRate do jogador
  const growthFactor = player.growthRate;

  // Verificar se o atributo já atingiu o potencial
  // O potencial é um valor global, mas vamos aplicá-lo como teto para cada atributo individual,
  // com uma pequena margem de variação (cada atributo pode chegar perto do potencial global)
  const maxAttr = Math.min(player.potential, 99);
  const currentVal = attrs[focusArea];

  // Se já estiver no potencial, não progride
  if (currentVal >= maxAttr) {
    sims.happiness = Math.max(0, sims.happiness - 10); // frustração
    return { ...player, attributes: attrs, sims };
  }

  // Progresso: ganho base de 0.5 a 1.5 pontos, multiplicado pelo growthRate
  let gain = (0.5 + Math.random() * 1.0) * growthFactor;
  // Jovens (até 21) têm mais facilidade em evoluir
  if (player.age <= 21) {
    gain *= 1.2;
  } else if (player.age >= 30) {
    // Jogadores mais velhos evoluem mais devagar
    gain *= 0.7;
  }

  // Arredondar para 1 casa decimal e limitar
  let newVal = Math.round((currentVal + gain) * 10) / 10;
  newVal = Math.min(maxAttr, newVal);
  newVal = Math.max(1, newVal);

  attrs[focusArea] = newVal;

  // Atualizar overall (média simples)
  const overall = Math.round(
    (attrs.pace + attrs.shooting + attrs.passing + attrs.dribbling + attrs.defending + attrs.physical) / 6
  );
  player.overall = overall;

  return {
    ...player,
    attributes: attrs,
    sims,
    overall,
  };
}

/**
 * Processa a evolução natural e envelhecimento do jogador.
 * @param player - O jogador a processar
 * @returns O jogador atualizado
 */
export function processAgeProgressAndGrowth(player: Player): Player {
  // Clonar atributos e sims
  const attrs = { ...player.attributes };
  const sims = { ...player.sims };

  // 1. Envelhecer (quando chamado, incrementa a idade)
  // Note: esta função é chamada uma vez por temporada ou por período, não por dia.
  // Assumimos que é chamada numa base anual.
  player.age += 1;

  // 2. Evolução natural com base no potencial e idade
  // Fator de crescimento (0 a 1)
  let growthFactor = player.growthRate;

  // Jovens (15-21) evoluem naturalmente até ao potencial
  if (player.age >= 15 && player.age <= 21) {
    // Evolução automática gradual
    const progressChance = 0.7; // 70% de probabilidade de evoluir
    if (Math.random() < progressChance) {
      // Escolher um atributo aleatório para melhorar ligeiramente
      const keys = Object.keys(attrs) as (keyof PlayerAttributes)[];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const currentVal = attrs[randomKey];
      const maxAttr = Math.min(player.potential, 99);

      if (currentVal < maxAttr) {
        let gain = (0.3 + Math.random() * 0.5) * growthFactor;
        let newVal = Math.round((currentVal + gain) * 10) / 10;
        newVal = Math.min(maxAttr, newVal);
        newVal = Math.max(1, newVal);
        attrs[randomKey] = newVal;
      }
    }
  }

  // 3. Declínio físico para jogadores veteranos (a partir dos 30 anos)
  if (player.age >= 30) {
    const declineFactor = (player.age - 29) * 0.02; // 2% por ano após os 30
    if (Math.random() < declineFactor) {
      // Perda em atributos físicos (pace, physical)
      const physicalAttrs: (keyof PlayerAttributes)[] = ['pace', 'physical'];
      const key = physicalAttrs[Math.floor(Math.random() * physicalAttrs.length)];
      let currentVal = attrs[key];
      currentVal = Math.max(1, currentVal - (0.5 + Math.random() * 0.5));
      attrs[key] = Math.round(currentVal * 10) / 10;
    }
    // Perda de potencial? Não, o potencial permanece, mas o jogador pode nunca o atingir.
  }

  // 4. Recalcular overall
  const overall = Math.round(
    (attrs.pace + attrs.shooting + attrs.passing + attrs.dribbling + attrs.defending + attrs.physical) / 6
  );
  player.overall = overall;

  // 5. Atualizar salário e valor de mercado (ajuste anual simplificado)
  // Valor de mercado baseado em overall, idade e reputação implícita
  const baseMarket = 100000 + (overall - 50) * 200000;
  const ageFactor = player.age <= 22 ? 1.5 : (player.age <= 28 ? 1.2 : 0.8);
  const marketValue = Math.round(baseMarket * ageFactor / 1000) * 1000;
  player.marketValue = marketValue;

  // Salário proporcional ao overall e idade
  const salaryBase = 50000 + (overall - 50) * 20000;
  const salaryAgeFactor = player.age <= 22 ? 0.7 : (player.age <= 28 ? 1.0 : 0.9);
  player.salary = Math.round(salaryBase * salaryAgeFactor / 1000) * 1000;

  // Atualizar sims com possíveis mudanças de moral/happiness devido à idade
  if (player.age >= 30) {
    sims.happiness = Math.max(0, sims.happiness - 2); // ligeiro desgaste
  } else if (player.age <= 21) {
    sims.happiness = Math.min(100, sims.happiness + 2); // otimismo jovem
  }
  sims.morale = updateMorale(sims.energy, sims.happiness, sims.bankBalance);

  return {
    ...player,
    attributes: attrs,
    sims,
    marketValue,
    salary: player.salary,
  };
}
