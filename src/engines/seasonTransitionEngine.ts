// src/engines/seasonTransitionEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Club, Player, LeagueTableEntry, PlayerAttributes } from '@/types/game';

// ============================================================
// INTERFACES (exportadas)
// ============================================================

export interface SeasonEndResult {
  champions: Club;
  europeanQualifications: {
    championsLeague: Club[];
    europaLeague: Club[];
    conferenceLeague: Club[];
  };
  relegated: Club[];
  promoted: Club[];
}

// ============================================================
// FUNÇÕES AUXILIARES (internas)
// ============================================================

/**
 * Gera um jovem jogador para a academia de formação.
 */
function generateYouthAcademyPlayer(clubId: string, clubName: string): Player {
  const positions = ['Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'];
  const position = positions[Math.floor(Math.random() * positions.length)];

  // Base de atributos entre 50 e 65
  const baseAttributes = () => Math.floor(Math.random() * 16) + 50; // 50-65

  const attributes: PlayerAttributes = {
    pace: baseAttributes(),
    shooting: baseAttributes(),
    passing: baseAttributes(),
    dribbling: baseAttributes(),
    defending: baseAttributes(),
    physical: baseAttributes(),
  };

  // Ajustes por posição
  switch (position) {
    case 'Guarda-Redes':
      attributes.defending += 10;
      attributes.physical += 5;
      attributes.shooting -= 10;
      break;
    case 'Defesa Central':
      attributes.defending += 12;
      attributes.physical += 8;
      attributes.shooting -= 5;
      break;
    case 'Lateral':
      attributes.pace += 8;
      attributes.dribbling += 5;
      attributes.defending += 5;
      break;
    case 'Médio':
      attributes.passing += 10;
      attributes.dribbling += 5;
      break;
    case 'Extremo':
      attributes.pace += 12;
      attributes.dribbling += 8;
      attributes.shooting += 5;
      attributes.defending -= 5;
      break;
    case 'Avançado':
      attributes.shooting += 12;
      attributes.pace += 5;
      attributes.physical += 5;
      attributes.defending -= 5;
      break;
  }

  // Garantir limites 1-99
  const clamp = (val: number) => Math.min(99, Math.max(1, Math.round(val)));
  Object.keys(attributes).forEach(key => {
    attributes[key as keyof PlayerAttributes] = clamp(attributes[key as keyof PlayerAttributes]);
  });

  const overall = Math.round(
    (attributes.pace + attributes.shooting + attributes.passing +
     attributes.dribbling + attributes.defending + attributes.physical) / 6
  );

  // Potencial entre 75 e 92
  const potential = 75 + Math.floor(Math.random() * 18); // 75-92
  const growthRate = 1.0 + Math.random() * 0.8; // 1.0-1.8

  return {
    id: uuidv4(),
    name: `Jovem Promessa ${Math.floor(Math.random() * 1000)}`,
    nationality: 'Portugal',
    age: 15,
    position,
    overall,
    attributes,
    clubId,
    clubName: `${clubName} Sub-15`,
    isSub15: true,
    marketValue: 50000 + Math.floor(Math.random() * 200000),
    salary: 20000 + Math.floor(Math.random() * 30000),
    contractYears: 3,
    sims: {
      energy: 80 + Math.floor(Math.random() * 20),
      happiness: 70 + Math.floor(Math.random() * 30),
      morale: 'Boa',
      lifestyleLevel: 1,
      bankBalance: 1000 + Math.floor(Math.random() * 4000),
      relationships: [],
    },
    stats: {
      goals: 0,
      assists: 0,
      matchesPlayed: 0,
      averageRating: 0,
    },
    potential,
    growthRate,
  };
}

/**
 * Atualiza as idades de todos os jogadores de um clube.
 */
function agePlayers(club: Club): Club {
  const agedMain = club.mainSquad.map(p => ({ ...p, age: p.age + 1 }));
  const agedSub15 = club.sub15Squad.map(p => ({ ...p, age: p.age + 1 }));
  return {
    ...club,
    mainSquad: agedMain,
    sub15Squad: agedSub15,
  };
}

/**
 * Renova o orçamento anual de um clube (baseado na reputação e receitas).
 */
function renewClubBudget(club: Club): Club {
  const baseBudget = 1000000 + club.reputation * 200000;
  const budgetBoost = Math.floor(Math.random() * 5000000);
  return {
    ...club,
    budget: baseBudget + budgetBoost,
  };
}

// ============================================================
// FUNÇÕES PRINCIPAIS (exportadas)
// ============================================================

/**
 * Processa o final da época, determinando campeão, qualificações europeias e despromoções.
 * @param leagueTable - Tabela classificativa da época
 * @param clubs - Lista de todos os clubes
 * @param numRelegated - Número de clubes a descer (default 3)
 * @param numChampionsLeague - Número de vagas para a Champions (default 4)
 * @param numEuropaLeague - Número de vagas para a Liga Europa (default 2)
 * @param numConferenceLeague - Número de vagas para a Conference League (default 1)
 * @returns Objeto com campeão, qualificações europeias, despromovidos e promovidos
 */
export function processSeasonEnd(
  leagueTable: LeagueTableEntry[],
  clubs: Club[],
  numRelegated: number = 3,
  numChampionsLeague: number = 4,
  numEuropaLeague: number = 2,
  numConferenceLeague: number = 1
): SeasonEndResult {
  // Ordenar tabela (já deve estar ordenada, mas garantimos)
  const sorted = [...leagueTable].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // 1. Campeão
  const championEntry = sorted[0];
  const champion = clubs.find(c => c.id === championEntry.clubId);
  if (!champion) throw new Error('Campeão não encontrado.');

  // 2. Qualificações europeias
  const championsLeague: Club[] = [];
  const europaLeague: Club[] = [];
  const conferenceLeague: Club[] = [];

  // Champions League: top N
  for (let i = 0; i < Math.min(numChampionsLeague, sorted.length); i++) {
    const club = clubs.find(c => c.id === sorted[i].clubId);
    if (club) championsLeague.push(club);
  }

  // Europa League: próximos N
  const europaStart = numChampionsLeague;
  const europaEnd = Math.min(europaStart + numEuropaLeague, sorted.length);
  for (let i = europaStart; i < europaEnd; i++) {
    const club = clubs.find(c => c.id === sorted[i].clubId);
    if (club) europaLeague.push(club);
  }

  // Conference League: próximo N
  const conferenceStart = europaEnd;
  const conferenceEnd = Math.min(conferenceStart + numConferenceLeague, sorted.length);
  for (let i = conferenceStart; i < conferenceEnd; i++) {
    const club = clubs.find(c => c.id === sorted[i].clubId);
    if (club) conferenceLeague.push(club);
  }

  // 3. Despromoções (últimos N)
  const relegated: Club[] = [];
  const relegatedStart = sorted.length - numRelegated;
  for (let i = relegatedStart; i < sorted.length; i++) {
    const club = clubs.find(c => c.id === sorted[i].clubId);
    if (club) relegated.push(club);
  }

  // 4. Promovidos (simulação - na prática viriam da divisão inferior)
  // Para efeitos de demonstração, geramos clubes promovidos fictícios
  const promoted: Club[] = [];
  for (let i = 0; i < numRelegated; i++) {
    const promotedClub: Club = {
      id: uuidv4(),
      name: `Clube Promovido ${i + 1}`,
      shortName: `CP${i + 1}`,
      leagueId: 'pl', // mesma liga
      budget: 500000 + Math.floor(Math.random() * 2000000),
      stadiumName: `Estádio do CP${i + 1}`,
      mainSquad: [],
      sub15Squad: [],
      reputation: 30 + Math.floor(Math.random() * 20),
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
    };
    promoted.push(promotedClub);
  }

  return {
    champions: champion,
    europeanQualifications: {
      championsLeague,
      europaLeague,
      conferenceLeague,
    },
    relegated,
    promoted,
  };
}

/**
 * Prepara a nova época, envelhecendo jogadores, renovando orçamentos e gerando jovens promessas.
 * @param clubs - Lista de clubes
 * @param currentYear - Ano atual (ex: 2026)
 * @param youthPerClub - Número de jovens promessas a gerar por clube (default 3)
 * @returns Objeto com clubes atualizados e o novo ano
 */
export function resetForNewSeason(
  clubs: Club[],
  currentYear: number,
  youthPerClub: number = 3
): { updatedClubs: Club[]; newYear: number } {
  const newYear = currentYear + 1;

  const updatedClubs = clubs.map(club => {
    // 1. Envelhecer jogadores
    let agedClub = agePlayers(club);

    // 2. Renovar orçamento
    agedClub = renewClubBudget(agedClub);

    // 3. Promover jogadores Sub-15 que completam 16 anos para o plantel principal
    const toPromote = agedClub.sub15Squad.filter(p => p.age >= 16);
    const remainingSub15 = agedClub.sub15Squad.filter(p => p.age < 16);

    // Adicionar ao plantel principal (como jovens promessas)
    const promotedPlayers = toPromote.map(p => ({
      ...p,
      isSub15: false,
      clubName: agedClub.name,
      // Subir ligeiramente o overall (experiência)
      overall: Math.min(99, p.overall + Math.floor(Math.random() * 3) + 1),
    }));

    // Atualizar plantéis
    const newMainSquad = [...agedClub.mainSquad, ...promotedPlayers];
    const newSub15Squad = [...remainingSub15];

    // 4. Gerar novos jovens (15 anos) para a academia
    const newYouths: Player[] = [];
    for (let i = 0; i < youthPerClub; i++) {
      const youth = generateYouthAcademyPlayer(agedClub.id, agedClub.name);
      newYouths.push(youth);
    }

    // 5. Limitar tamanho do plantel (ex: máximo 30 na principal)
    let finalMainSquad = newMainSquad;
    if (finalMainSquad.length > 30) {
      // Descartar os piores (menor overall) se for necessário
      finalMainSquad = finalMainSquad.sort((a, b) => b.overall - a.overall).slice(0, 30);
    }

    // 6. Limitar Sub-15 (máximo 20)
    let finalSub15Squad = [...newSub15Squad, ...newYouths];
    if (finalSub15Squad.length > 20) {
      finalSub15Squad = finalSub15Squad.sort((a, b) => b.overall - a.overall).slice(0, 20);
    }

    return {
      ...agedClub,
      mainSquad: finalMainSquad,
      sub15Squad: finalSub15Squad,
    };
  });

  return {
    updatedClubs,
    newYear,
  };
}
