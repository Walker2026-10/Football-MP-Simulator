// src/types/game.ts

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export type Morale = 'Péssima' | 'Baixa' | 'Normal' | 'Boa' | 'Excelente';

export interface Relationship {
  name: string;
  relationType: 'Amigo' | 'Familiar' | 'Colega de Equipa' | 'Treinador' | 'Agente' | 'Parceiro(a)' | 'Rival';
  affinityLevel: number;
}

export interface SimsData {
  energy: number;
  happiness: number;
  morale: Morale;
  lifestyleLevel: 1 | 2 | 3 | 4 | 5;
  bankBalance: number;
  relationships: Relationship[];
}

export interface PlayerStats {
  goals: number;
  assists: number;
  matchesPlayed: number;
  averageRating: number;
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  age: number;
  position: string;
  overall: number;
  attributes: PlayerAttributes;
  clubId: string | null;
  clubName: string | null;
  isSub15: boolean;
  marketValue: number;
  salary: number;
  contractYears: number;
  sims: SimsData;
  stats: PlayerStats;
  potential: number;
  growthRate: number;
  fitness?: number;
  injury?: Injury | null;
  honors?: Honor[];
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
  reputation: number;
  primaryColor: string;
  secondaryColor: string;
  manager?: any;
  recentResults?: string[];
  trophies?: Trophy[];
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
  minute: number;
  type: MatchEventType;
  description: string;
  teamId: string;
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
  matchDate: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  division: number;
  clubs: Club[];
}

export type CareerMode = 'player' | 'manager';

export interface SaveState {
  saveId: string;
  careerMode: CareerMode;
  currentDate: string;
  userPlayer: Player | null;
  userClubId: string | null;
  logs: string[];
}

// ============================================================
// INTERFACES ADICIONAIS
// ============================================================

export interface LeagueTableEntry {
  rank: number;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface CupFixture {
  id: string;
  roundName: string;
  homeClubId: string;
  awayClubId: string;
  homeGoals: number | null;
  awayGoals: number | null;
  penaltyWinnerId: string | null;
  isCompleted: boolean;
  matchDate: string;
}

export interface NewsItem {
  id: string;
  date: string;
  headline: string;
  body: string;
  category: 'TRANSFER' | 'MATCH' | 'INJURY' | 'CONTROVERSY' | 'STREAK';
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Injury {
  type: string;
  severity: 'Leve' | 'Moderada' | 'Grave';
  durationDays: number;
  fitnessImpact: number;
}

export interface TransferOffer {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  toClubName: string;
  transferFee: number;
  offeredSalary: number;
  contractYears: number;
  loan: boolean;
  loanDuration?: number;
  loanCoverage?: number;   // <-- corrigido
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface Scout {
  id: string;
  name: string;
  rating: number;
  region: string;
  dailyCost: number;
}

export interface ScoutReport {
  targetPlayerId: string;
  accurateAttributes: Partial<PlayerAttributes>;
  potentialRange: [number, number];
  fitRating: number;
  isComplete: boolean;
}

export interface LoanDeal {
  playerId: string;
  parentClubId: string;
  borrowingClubId: string;
  wageCoveragePercentage: number;
  buyOptionPrice?: number;
  isObligation: boolean;
  startDate: string;
  endDate: string;
  guaranteedPlayTime: number;
}

export interface SponsorContract {
  id: string;
  brandName: string;
  tier: 'LOCAL' | 'NACIONAL' | 'GLOBAL';
  weeklyPay: number;
  durationWeeks: number;
  bonusClause?: { target: string; reward: number };
  minReputation: number;
  active: boolean;
  weeksRemaining: number;
}

export interface LifestyleItem {
  id: string;
  name: string;
  category: 'Imóveis' | 'Veículos' | 'Luxo' | 'Investimentos';
  price: number;
  monthlyMaintenance: number;
  statusBoost: number;
  reputationBoost: number;
}

export interface Honor {
  name: string;
  season: string;
  type: 'individual' | 'team';
}

export interface Trophy {
  name: string;
  season: string;
  category: 'league' | 'cup' | 'continental' | 'national';
}
