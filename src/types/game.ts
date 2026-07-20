// src/types/game.ts

export interface PlayerAttributes {
  pace: number;        // 1-99
  shooting: number;    // 1-99
  passing: number;     // 1-99
  dribbling: number;   // 1-99
  defending: number;   // 1-99
  physical: number;    // 1-99
}

export type Morale = 'Péssima' | 'Baixa' | 'Normal' | 'Boa' | 'Excelente';

export interface Relationship {
  name: string;
  relationType: 'Amigo' | 'Familiar' | 'Colega de Equipa' | 'Treinador' | 'Agente' | 'Parceiro(a)' | 'Rival';
  affinityLevel: number; // 0-100
}

export interface SimsData {
  energy: number;           // 0-100
  happiness: number;        // 0-100
  morale: Morale;
  lifestyleLevel: 1 | 2 | 3 | 4 | 5;
  bankBalance: number;
  relationships: Relationship[];
}

export interface PlayerStats {
  goals: number;
  assists: number;
  matchesPlayed: number;
  averageRating: number; // 0.0 - 10.0
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  age: number;            // começa em 15
  position: string;       // ex: 'Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'
  overall: number;        // 1-99
  attributes: PlayerAttributes;
  clubId: string | null;
  clubName: string | null;
  isSub15: boolean;
  marketValue: number;    // em euros
  salary: number;         // salário anual em euros
  contractYears: number;  // anos restantes de contrato
  sims: SimsData;
  stats: PlayerStats;
  potential: number;      // 1-99 – potencial máximo que pode atingir
  growthRate: number;     // 0.5 a 2.0 – fator de evolução por temporada
  // Campos opcionais para integração com motores
  fitness?: number;       // 0-100
  injury?: {
    type: string;
    severity: 'Leve' | 'Moderada' | 'Grave';
    durationDays: number;
    fitnessImpact: number;
  } | null;
  honors?: { name: string; season: string; type: 'individual' | 'team' }[];
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  budget: number;
  stadiumName: string;
  mainSquad: Player[];
  sub15Squad: Player[];
  reputation: number;         // 1-100
  primaryColor: string;       // código hex
  secondaryColor: string;     // código hex
  // Campos opcionais para motores
  manager?: any;
  recentResults?: string[];
}

export interface Sub15Club {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  budget: number;
  stadiumName: string;
  sub15Squad: Player[];
  reputation: number;
  primaryColor: string;
  secondaryColor: string;
}

export type MatchEventType = 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'commentary';

export interface MatchEvent {
  minute: number;          // 1-90+ (incluindo descontos)
  type: MatchEventType;
  description: string;     // texto descritivo do evento
  teamId: string;          // equipa responsável pelo evento
  playerInvolvedName: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  played: boolean;
  matchDate: string;       // formato YYYY-MM-DD
}

export interface League {
  id: string;
  name: string;
  country: string;
  division: number;        // 1, 2, etc.
  clubs: Club[];
}

export type CareerMode = 'player' | 'manager';

export interface SaveState {
  saveId: string;
  careerMode: CareerMode;
  currentDate: string;      // formato YYYY-MM-DD
  userPlayer: Player | null;  // só preenchido no modo Jogador
  userClubId: string | null;  // clube que o utilizador gere (modo Treinador) ou onde o jogador está (modo Jogador)
  logs: string[];           // notícias / alertas do mundo
}

// ============================================================
// INTERFACES ADICIONAIS PARA COMPETIÇÕES, MEDIA E HISTÓRICO
// ============================================================

/**
 * Entrada na tabela classificativa de uma liga.
 */
export interface LeagueTableEntry {
  rank: number;             // posição na tabela
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;   // goalsFor - goalsAgainst
  points: number;
}

/**
 * Representa um jogo de eliminatória (Taça).
 */
export interface CupFixture {
  id: string;
  roundName: string;        // ex: '1/16', 'Oitavos', 'Quartos', 'Meias', 'Final'
  homeClubId: string;
  awayClubId: string;
  homeGoals: number | null; // null se ainda não jogado
  awayGoals: number | null;
  penaltyWinnerId: string | null; // ID do clube vencedor nos penáltis (se aplicável)
  isCompleted: boolean;
  matchDate: string;        // formato YYYY-MM-DD
}

/**
 * Item de notícia para o feed do jogo.
 */
export interface NewsItem {
  id: string;
  date: string; // YYYY-MM-DD
  headline: string;
  body: string;
  category: 'TRANSFER' | 'MATCH' | 'INJURY' | 'CONTROVERSY' | 'STREAK';
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}
