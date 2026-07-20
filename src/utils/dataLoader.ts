// src/utils/dataLoader.ts

import { v4 as uuidv4 } from 'uuid';
import { Club, League, Player, PlayerAttributes } from '@/types/game';

// Importação dos ficheiros JSON (cada clube e respetivo sub15)
import manCityData from '@/data/ligas/premier-league/manchester-city.json';
import manCitySub15Data from '@/data/ligas/premier-league/manchester-city-sub15.json';
import arsenalData from '@/data/ligas/premier-league/arsenal.json';
import arsenalSub15Data from '@/data/ligas/premier-league/arsenal-sub15.json';

// Tipo para os dados brutos do clube (inclui mainSquad e sub15Squad)
type RawClubData = Omit<Club, 'mainSquad' | 'sub15Squad'> & {
  mainSquad: Player[];
  sub15Squad: Player[];
};

// Função auxiliar para fundir os dados do clube principal com os Sub-15
function mergeClubData(mainData: RawClubData, sub15Data: RawClubData): Club {
  return {
    ...mainData,
    mainSquad: mainData.mainSquad || [],
    sub15Squad: sub15Data.sub15Squad || [],
  };
}

// Lista de todos os clubes carregados (cada clube já com os respetivos sub15)
const allClubs: Club[] = [
  mergeClubData(manCityData as RawClubData, manCitySub15Data as RawClubData),
  mergeClubData(arsenalData as RawClubData, arsenalSub15Data as RawClubData),
];

// Construção da liga Premier League
const premierLeague: League = {
  id: 'pl',
  name: 'Premier League',
  country: 'Inglaterra',
  division: 1,
  clubs: allClubs,
};

// Lista de todas as ligas (por enquanto apenas a Premier League)
const allLeagues: League[] = [premierLeague];

/**
 * Retorna a lista de todas as ligas e clubes carregados no sistema.
 */
export function getAllLeagues(): League[] {
  return allLeagues;
}

/**
 * Retorna um clube específico pelo ID.
 * @param clubId - ID do clube a procurar
 * @returns O clube encontrado ou undefined se não existir
 */
export function getClubById(clubId: string): Club | undefined {
  for (const league of allLeagues) {
    const found = league.clubs.find(club => club.id === clubId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Retorna aleatoriamente uma equipa Sub-15 (clube) para servir de ponto de partida na Carreira de Jogador.
 * @returns Um clube (com os Sub-15 preenchidos)
 */
export function getRandomSub15Club(): Club {
  const sub15Clubs = allClubs.filter(club => club.sub15Squad.length > 0);
  if (sub15Clubs.length === 0) {
    throw new Error('Nenhum clube Sub-15 disponível.');
  }
  const randomIndex = Math.floor(Math.random() * sub15Clubs.length);
  return sub15Clubs[randomIndex];
}

/**
 * Gera atributos aleatórios para um jovem jogador com base na posição.
 * @param position - Posição do jogador
 * @param baseOverall - Overall base (ex: 55-65 para Sub-15)
 * @returns Atributos preenchidos
 */
function generateRandomAttributes(position: string, baseOverall: number): PlayerAttributes {
  // Variação aleatória de ±10 em cada atributo em torno do baseOverall ajustado por posição
  const randomVariation = () => Math.floor(Math.random() * 20) - 10; // -10 a +10

  let pace = baseOverall + randomVariation();
  let shooting = baseOverall + randomVariation();
  let passing = baseOverall + randomVariation();
  let dribbling = baseOverall + randomVariation();
  let defending = baseOverall + randomVariation();
  let physical = baseOverall + randomVariation();

  // Ajustes específicos por posição para dar realismo
  switch (position) {
    case 'Guarda-Redes':
      defending += 10;
      physical += 5;
      shooting -= 15;
      dribbling -= 10;
      passing += 5;
      break;
    case 'Defesa Central':
      defending += 12;
      physical += 8;
      shooting -= 10;
      dribbling -= 5;
      pace += 2;
      break;
    case 'Lateral':
      pace += 10;
      dribbling += 5;
      defending += 5;
      shooting -= 5;
      physical += 2;
      break;
    case 'Médio':
      passing += 10;
      dribbling += 5;
      defending += 3;
      shooting += 2;
      physical += 2;
      break;
    case 'Extremo':
      pace += 12;
      dribbling += 10;
      shooting += 5;
      passing += 3;
      defending -= 10;
      physical -= 2;
      break;
    case 'Avançado':
      shooting += 15;
      pace += 5;
      dribbling += 5;
      passing += 2;
      defending -= 15;
      physical += 5;
      break;
    default:
      break;
  }

  // Garantir que os atributos ficam entre 1 e 99
  const clamp = (value: number) => Math.min(99, Math.max(1, value));

  return {
    pace: clamp(pace),
    shooting: clamp(shooting),
    passing: clamp(passing),
    dribbling: clamp(dribbling),
    defending: clamp(defending),
    physical: clamp(physical),
  };
}

/**
 * Cria um novo jogador jovem de 15 anos com atributos base ajustados.
 * @param name - Nome do jogador
 * @param position - Posição do jogador
 * @param age - Idade (opcional, por defeito 15)
 * @param nationality - Nacionalidade (opcional, por defeito 'Portugal')
 * @param clubId - ID do clube (opcional)
 * @param clubName - Nome do clube (opcional)
 * @returns Um objeto Player preenchido
 */
export function generateYouthPlayer(
  name: string,
  position: string,
  age: number = 15,
  nationality: string = 'Portugal',
  clubId: string | null = null,
  clubName: string | null = null
): Player {
  // Overall base entre 55 e 65 (aleatório)
  const baseOverall = Math.floor(Math.random() * 11) + 55; // 55-65
  const attributes = generateRandomAttributes(position, baseOverall);

  // Potencial aleatório entre 80 e 92 (jovem promessa)
  const potential = Math.floor(Math.random() * 13) + 80; // 80-92
  // GrowthRate entre 1.0 e 2.0 (quanto maior, mais rápido cresce)
  const growthRate = Math.round((Math.random() * 1.0 + 1.0) * 10) / 10; // 1.0-2.0

  // Overall calculado a partir da média dos atributos (arredondado)
  const avg = (attributes.pace + attributes.shooting + attributes.passing + attributes.dribbling + attributes.defending + attributes.physical) / 6;
  const overall = Math.round(avg);

  const player: Player = {
    id: uuidv4(),
    name,
    nationality,
    age,
    position,
    overall,
    attributes,
    clubId,
    clubName,
    isSub15: true,
    marketValue: 100000 + Math.floor(Math.random() * 400000), // entre 100k e 500k
    salary: 30000 + Math.floor(Math.random() * 20000), // entre 30k e 50k
    contractYears: 3,
    sims: {
      energy: 80 + Math.floor(Math.random() * 20),
      happiness: 70 + Math.floor(Math.random() * 30),
      morale: 'Boa',
      lifestyleLevel: 1,
      bankBalance: 2000 + Math.floor(Math.random() * 3000),
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

  return player;
}
