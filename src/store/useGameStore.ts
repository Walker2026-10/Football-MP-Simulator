// src/store/useGameStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Tipos
import {
  Player,
  Club,
  League,
  Match,
  MatchEvent,
  LeagueTableEntry,
  CupFixture,
  NewsItem,
  PlayerAttributes,
  SaveState,
  CareerMode,
  SimsData,
  Injury,
  TransferOffer,
  SponsorContract,
  LifestyleItem,
} from '@/types/game';

// Data Loader
import {
  getAllLeagues,
  getClubById,
  getRandomSub15Club,
  generateYouthPlayer,
} from '@/utils/dataLoader';

// Engines
import { simulateMatch } from '@/engines/matchEngine';
import {
  advanceDaySims,
  processPlayerTraining,
  processAgeProgressAndGrowth,
} from '@/engines/simsEngine';
import {
  updateLeagueTable,
  generateCupDraw,
  processCupMatch,
} from '@/engines/competitionEngine';
import {
  calculateMarketValue,
  generateTransferOffers,
  processTransfer,
} from '@/engines/transferEngine';
import {
  evaluateLeagueWinner,
  calculateSeasonAwards,
  awardPlayerTrophy,
} from '@/engines/trophyEngine';
import { executeTrainingSession, processMedicalRecovery } from '@/engines/trainingEngine';
import {
  processWeeklyPaycheck,
  purchaseLifestyleItem,
  evaluateSponsorships,
  processSponsorshipPayment,
  calculateReputation,
} from '@/engines/financeEngine';
import { calculateMatchDayRevenue, upgradeFacility } from '@/engines/infrastructureEngine';
import { diagnoseInjury, applyTreatment } from '@/engines/medicalEngine';
import {
  generateMatchCommentary,
  evaluateBoardSatisfaction,
} from '@/engines/commentaryAndBoardEngine';
import { sendScoutOnMission, proposeLoanDeal } from '@/engines/scoutingEngine';
import {
  generateDailyNews,
  generatePressConference,
} from '@/engines/mediaEngine';
import {
  processCPUClubTransfers,
  processManagerCarousel,
} from '@/engines/clubAIEngine';
import {
  processSeasonEnd,
  resetForNewSeason,
} from '@/engines/seasonTransitionEngine';
import {
  generateSponsorOffers,
  evaluateSponsorObjectives,
} from '@/engines/sponsorsEngine';
import {
  archiveSeasonStats,
  getCareerTotals,
  buildSeasonHistory,
} from '@/engines/historyEngine';
import {
  initLiveMatch,
  tickLiveMatch,
  applyInGameTacticalChange,
} from '@/engines/liveMatchEngine';
import {
  checkNationalTeamCallUp,
  processPlayerRetirement,
  generateAgent,
  negotiateContract,
} from '@/engines/careerEngine';

// ============================================================
// INTERFACES DO STORE
// ============================================================

export interface GameStore {
  // Estado
  saveState: SaveState | null;
  clubs: Club[];
  leagues: League[];
  leagueTable: LeagueTableEntry[];
  fixtures: Match[];
  cupFixtures: CupFixture[];
  newsFeed: NewsItem[];
  boardConfidence: number;
  liveMatchState: any | null;
  isLoading: boolean;
  currentSeason: string;
  currentDate: string; // <-- adicionado

  // Métodos auxiliares
  getPlayerById: (playerId: string) => Player | undefined;
  getClubById: (clubId: string) => Club | undefined;
  getCurrentPlayer: () => Player | null;
  getCurrentClub: () => Club | null;

  // Ações
  startNewCareer: (
    playerName: string,
    position: string,
    mode: CareerMode,
    nationality?: string
  ) => void;
  loadGame: () => void;
  saveGame: () => void;
  advanceDay: () => Promise<void>;
  trainPlayer: (focusArea: keyof PlayerAttributes) => void;
  buyLifestyleItem: (item: LifestyleItem) => { success: boolean; message: string };
  respondToPressConference: (questionId: string, optionIndex: number) => void;
  simulateLiveMatch: (homeTactics?: string, awayTactics?: string) => void;
  applyTacticalChange: (newMentality: 'DEFENSIVE' | 'BALANCED' | 'ATTACKING', forTeam: 'HOME' | 'AWAY') => void;
  processTransferOffer: (offerId: string, accept: boolean) => void;
  scoutPlayer: (playerId: string) => void;
  processLoanDeal: (playerId: string, borrowingClubId: string, terms: any) => void;
  resetGame: () => void;
}

// ============================================================
// FUNÇÃO AUXILIAR PARA GERAR FIXTURES
// ============================================================

function generateFixtures(clubs: Club[], leagueId: string, season: string): Match[] {
  const fixtures: Match[] = [];
  const clubIds = clubs.map(c => c.id);

  // Jogos de ida e volta
  for (let i = 0; i < clubIds.length; i++) {
    for (let j = i + 1; j < clubIds.length; j++) {
      const homeId = clubIds[i];
      const awayId = clubIds[j];
      const home = clubs.find(c => c.id === homeId);
      const away = clubs.find(c => c.id === awayId);
      if (home && away) {
        // Jogo de ida
        fixtures.push({
          id: uuidv4(),
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeTeamName: home.name,
          awayTeamName: away.name,
          homeScore: 0,
          awayScore: 0,
          events: [],
          played: false,
          matchDate: `${season}-09-01`,
        });
        // Jogo de volta
        fixtures.push({
          id: uuidv4(),
          homeTeamId: awayId,
          awayTeamId: homeId,
          homeTeamName: away.name,
          awayTeamName: home.name,
          homeScore: 0,
          awayScore: 0,
          events: [],
          played: false,
          matchDate: `${season}-12-01`,
        });
      }
    }
  }
  return fixtures;
}

// ============================================================
// CRIAÇÃO DO STORE
// ============================================================

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ============================================================
      // ESTADO INICIAL
      // ============================================================

      saveState: null,
      clubs: [],
      leagues: [],
      leagueTable: [],
      fixtures: [],
      cupFixtures: [],
      newsFeed: [],
      boardConfidence: 80,
      liveMatchState: null,
      isLoading: false,
      currentSeason: '2026/2027',
      currentDate: '2026-09-01', // <-- adicionado

      // ============================================================
      // MÉTODOS AUXILIARES
      // ============================================================

      getPlayerById: (playerId: string) => {
        const { clubs } = get();
        for (const club of clubs) {
          const found = club.mainSquad.find(p => p.id === playerId);
          if (found) return found;
          const foundSub = club.sub15Squad.find(p => p.id === playerId);
          if (foundSub) return foundSub;
        }
        return undefined;
      },

      getClubById: (clubId: string) => {
        return get().clubs.find(c => c.id === clubId);
      },

      getCurrentPlayer: () => {
        const { saveState } = get();
        return saveState?.userPlayer || null;
      },

      getCurrentClub: () => {
        const { saveState, clubs } = get();
        if (!saveState?.userClubId) return null;
        return clubs.find(c => c.id === saveState.userClubId) || null;
      },

      // ============================================================
      // INICIAR NOVA CARREIRA
      // ============================================================

      startNewCareer: (
        playerName: string,
        position: string,
        mode: CareerMode,
        nationality: string = 'Portugal'
      ) => {
        set({ isLoading: true });

        // 1. Carregar dados das ligas
        const leagues = getAllLeagues();
        const allClubs: Club[] = [];
        leagues.forEach(league => {
          allClubs.push(...league.clubs);
        });

        // 2. Escolher clube Sub-15 aleatório para começar
        const sub15Club = getRandomSub15Club();

        // 3. Gerar jogador jovem
        const player = generateYouthPlayer(
          playerName,
          position,
          15,
          nationality,
          sub15Club.id,
          sub15Club.name
        );

        // 4. Adicionar jogador ao plantel Sub-15 do clube
        const updatedClubs = allClubs.map(club => {
          if (club.id === sub15Club.id) {
            return {
              ...club,
              sub15Squad: [...club.sub15Squad, player],
            };
          }
          return club;
        });

        // 5. Criar estado de jogo
        const saveState: SaveState = {
          saveId: uuidv4(),
          careerMode: mode,
          currentDate: '2026-09-01',
          userPlayer: player,
          userClubId: sub15Club.id,
          logs: [`Carreira iniciada! ${playerName} junta-se aos Sub-15 do ${sub15Club.name}.`],
        };

        // 6. Gerar fixtures iniciais
        const fixtures = generateFixtures(
          updatedClubs.filter(c => c.leagueId === 'pl'),
          'pl',
          '2026'
        );

        // 7. Inicializar tabela
        const initialTable: LeagueTableEntry[] = updatedClubs
          .filter(c => c.leagueId === 'pl')
          .map(club => ({
            rank: 0,
            clubId: club.id,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
          }));

        set({
          saveState,
          clubs: updatedClubs,
          leagues,
          leagueTable: initialTable,
          fixtures,
          cupFixtures: [],
          newsFeed: [],
          boardConfidence: 80,
          currentSeason: '2026/2027',
          currentDate: '2026-09-01', // <-- definido
          isLoading: false,
        });

        // Salvar automaticamente
        get().saveGame();
      },

      // ============================================================
      // CARREGAR / SALVAR
      // ============================================================

      loadGame: () => {
        set({ isLoading: true });
        try {
          const stored = localStorage.getItem('football-mp-simulator-save');
          if (stored) {
            const parsed = JSON.parse(stored);
            // Restaurar estado a partir do persist
            const state = parsed.state;
            if (state) {
              set({
                saveState: state.saveState,
                clubs: state.clubs || [],
                leagues: state.leagues || [],
                leagueTable: state.leagueTable || [],
                fixtures: state.fixtures || [],
                cupFixtures: state.cupFixtures || [],
                newsFeed: state.newsFeed || [],
                boardConfidence: state.boardConfidence || 80,
                liveMatchState: state.liveMatchState || null,
                currentSeason: state.currentSeason || '2026/2027',
                currentDate: state.currentDate || '2026-09-01', // <-- carregar
                isLoading: false,
              });
            }
          }
        } catch (error) {
          console.error('Erro ao carregar jogo:', error);
        }
        set({ isLoading: false });
      },

      saveGame: () => {
        // O middleware persist já salva automaticamente
        // Esta função pode ser usada para forçar o salvamento
        const state = get();
        const dataToSave = {
          saveState: state.saveState,
          clubs: state.clubs,
          leagues: state.leagues,
          leagueTable: state.leagueTable,
          fixtures: state.fixtures,
          cupFixtures: state.cupFixtures,
          newsFeed: state.newsFeed,
          boardConfidence: state.boardConfidence,
          liveMatchState: state.liveMatchState,
          currentSeason: state.currentSeason,
          currentDate: state.currentDate, // <-- salvar
        };
        localStorage.setItem('football-mp-simulator-save', JSON.stringify({ state: dataToSave }));
      },

      resetGame: () => {
        localStorage.removeItem('football-mp-simulator-save');
        set({
          saveState: null,
          clubs: [],
          leagues: [],
          leagueTable: [],
          fixtures: [],
          cupFixtures: [],
          newsFeed: [],
          boardConfidence: 80,
          liveMatchState: null,
          isLoading: false,
          currentSeason: '2026/2027',
          currentDate: '2026-09-01',
        });
      },

      // ============================================================
      // AVANÇAR DIA (AÇÃO PRINCIPAL)
      // ============================================================

      advanceDay: async () => {
        const state = get();
        if (!state.saveState) return;

        set({ isLoading: true });

        let {
          saveState,
          clubs,
          leagueTable,
          fixtures,
          cupFixtures,
          newsFeed,
          boardConfidence,
          currentSeason,
          currentDate,
        } = state;

        // 1. Avançar data
        const dateObj = new Date(currentDate);
        dateObj.setDate(dateObj.getDate() + 1);
        const newDate = dateObj.toISOString().slice(0, 10);

        // 2. Processar vida pessoal do jogador (se existir)
        let updatedPlayer = saveState.userPlayer;
        let dailyLogs: string[] = [];

        if (updatedPlayer) {
          const { updatedPlayer: simsUpdated, dailyLog } = advanceDaySims(updatedPlayer);
          updatedPlayer = simsUpdated;
          dailyLogs.push(dailyLog);

          // Verificar convocatória para seleção
          const callUp = checkNationalTeamCallUp(updatedPlayer);
          if (callUp.isCalledUp) {
            dailyLogs.push(callUp.message);
          }

          // Verificar aposentadoria
          const retirement = processPlayerRetirement(updatedPlayer);
          if (retirement.isRetiring) {
            dailyLogs.push(`${updatedPlayer.name} anunciou a aposentadoria.`);
            if (retirement.transitionToManagerOption) {
              dailyLogs.push(`${updatedPlayer.name} pode transitar para treinador.`);
            }
          }
        }

        // 3. Processar recuperação médica (se houver lesões)
        clubs = clubs.map(club => {
          const updatedMain = club.mainSquad.map(p => {
            if (p.injury && p.injury.durationDays > 0) {
              const { updatedPlayer, recoveryLog } = processMedicalRecovery(p);
              dailyLogs.push(recoveryLog);
              return updatedPlayer;
            }
            return p;
          });
          const updatedSub15 = club.sub15Squad.map(p => {
            if (p.injury && p.injury.durationDays > 0) {
              const { updatedPlayer, recoveryLog } = processMedicalRecovery(p);
              dailyLogs.push(recoveryLog);
              return updatedPlayer;
            }
            return p;
          });
          return { ...club, mainSquad: updatedMain, sub15Squad: updatedSub15 };
        });

        // 4. Simular jogos do dia
        const todayFixtures = fixtures.filter(f => f.matchDate === newDate && !f.played);
        for (const fixture of todayFixtures) {
          const homeClub = clubs.find(c => c.id === fixture.homeTeamId);
          const awayClub = clubs.find(c => c.id === fixture.awayTeamId);
          if (homeClub && awayClub) {
            const matchResult = simulateMatch(homeClub, awayClub, newDate);
            // Atualizar fixture
            const fixtureIndex = fixtures.findIndex(f => f.id === fixture.id);
            fixtures[fixtureIndex] = matchResult;

            // Atualizar tabela
            leagueTable = updateLeagueTable(leagueTable, {
              homeId: fixture.homeTeamId,
              awayId: fixture.awayTeamId,
              homeGoals: matchResult.homeScore,
              awayGoals: matchResult.awayScore,
            });

            // Adicionar notícia do jogo
            const matchNews = generateDailyNews([matchResult], [], []);
            newsFeed = [...newsFeed, ...matchNews];

            // Processar estatísticas do jogador (se participou)
            if (updatedPlayer) {
              const playerEvents = matchResult.events.filter(e =>
                e.playerInvolvedName === updatedPlayer?.name
              );
              if (playerEvents.length > 0) {
                dailyLogs.push(`${updatedPlayer.name} participou no jogo contra ${awayClub.name}.`);
              }
            }
          }
        }

        // 5. Processar taças (se houver jogos de taça no dia)
        const todayCups = cupFixtures.filter(f => f.matchDate === newDate && !f.isCompleted);
        for (const cup of todayCups) {
          const processed = processCupMatch(cup);
          const cupIndex = cupFixtures.findIndex(f => f.id === cup.id);
          cupFixtures[cupIndex] = processed;
        }

        // 6. Processar transferências de CPU
        const { updatedClubs: cpuUpdatedClubs, transferNews } = processCPUClubTransfers(
          clubs,
          [], // freeAgents - simplificado
          leagueTable
        );
        clubs = cpuUpdatedClubs;
        dailyLogs.push(...transferNews);

        // 7. Processar carrossel de treinadores
        const { updatedClubs: managerUpdatedClubs, managerNews } = processManagerCarousel(
          clubs,
          leagueTable
        );
        clubs = managerUpdatedClubs;
        dailyLogs.push(...managerNews);

        // 8. Processar patrocínios (se houver)
        if (updatedPlayer) {
          const sponsorships = evaluateSponsorships(updatedPlayer);
          for (const sponsorship of sponsorships) {
            const { updatedPlayer: sponsoredPlayer, log } = processSponsorshipPayment(
              updatedPlayer,
              sponsorship,
              1
            );
            updatedPlayer = sponsoredPlayer;
            dailyLogs.push(log);
          }
        }

        // 9. Processar finanças do clube (salários)
        clubs = clubs.map(club => {
          // Calcular folha salarial semanal
          const weeklyWages = club.mainSquad.reduce((sum, p) => sum + Math.floor(p.salary / 52), 0);
          // Receita de jogo (simplificada)
          const { totalRevenue } = calculateMatchDayRevenue(
            { capacity: 30000, ticketPrice: 30, pitchQuality: 70, youthAcademyLevel: 5, medicalCenterLevel: 5, trainingGroundLevel: 5 },
            50,
            'Bom'
          );
          return {
            ...club,
            budget: club.budget + totalRevenue - weeklyWages,
          };
        });

        // 10. Atualizar jogador no saveState
        if (updatedPlayer) {
          // Procurar e atualizar o jogador nos clubes
          clubs = clubs.map(club => {
            const mainIndex = club.mainSquad.findIndex(p => p.id === updatedPlayer?.id);
            if (mainIndex !== -1) {
              const newSquad = [...club.mainSquad];
              newSquad[mainIndex] = updatedPlayer;
              return { ...club, mainSquad: newSquad };
            }
            const subIndex = club.sub15Squad.findIndex(p => p.id === updatedPlayer?.id);
            if (subIndex !== -1) {
              const newSquad = [...club.sub15Squad];
              newSquad[subIndex] = updatedPlayer;
              return { ...club, sub15Squad: newSquad };
            }
            return club;
          });
          saveState.userPlayer = updatedPlayer;
        }

        // 11. Gerar notícias do dia
        const dailyNews = generateDailyNews(
          fixtures.filter(f => f.played),
          [],
          []
        );
        newsFeed = [...newsFeed, ...dailyNews];

        // 12. Limitar feed de notícias (últimas 50)
        if (newsFeed.length > 50) {
          newsFeed = newsFeed.slice(-50);
        }

        // 13. Verificar se é fim de época (31 de Maio)
        if (newDate.endsWith('05-31')) {
          // Processar fim de época
          const seasonResult = processSeasonEnd(leagueTable, clubs);
          const { champions, europeanQualifications, relegated, promoted } = seasonResult;

          // Atualizar clubes (promovidos e despromovidos)
          const allClubsAfterSeason = [
            ...clubs.filter(c => !relegated.some(r => r.id === c.id)),
            ...promoted,
          ];

          // Reset para nova época
          const { updatedClubs: resetClubs, newYear } = resetForNewSeason(
            allClubsAfterSeason,
            parseInt(currentSeason.split('/')[0])
          );
          clubs = resetClubs;
          currentSeason = `${newYear}/${newYear + 1}`;

          // Gerar novas fixtures
          const newFixtures = generateFixtures(
            clubs.filter(c => c.leagueId === 'pl'),
            'pl',
            String(newYear)
          );
          fixtures = newFixtures;

          // Reset tabela
          leagueTable = clubs
            .filter(c => c.leagueId === 'pl')
            .map(club => ({
              rank: 0,
              clubId: club.id,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
            }));

          dailyLogs.push(`🏆 ${champions.name} é campeão da época ${currentSeason}!`);
          dailyLogs.push(`📊 Nova época ${currentSeason} iniciada.`);
        }

        // 14. Avaliar satisfação da direção (mensalmente)
        const day = parseInt(newDate.split('-')[2]);
        if (day === 1) {
          const currentPos = leagueTable.find(e => e.clubId === saveState.userClubId)?.rank || 10;
          const { boardConfidence: newConfidence, statusMessage } = evaluateBoardSatisfaction(
            currentPos,
            5,
            70,
            7
          );
          boardConfidence = newConfidence;
          dailyLogs.push(statusMessage);
        }

        // 15. Atualizar estado
        saveState.currentDate = newDate;
        saveState.logs = [...saveState.logs, ...dailyLogs];

        // Limitar logs (últimos 100)
        if (saveState.logs.length > 100) {
          saveState.logs = saveState.logs.slice(-100);
        }

        set({
          saveState,
          clubs,
          leagueTable,
          fixtures,
          cupFixtures,
          newsFeed,
          boardConfidence,
          currentSeason,
          currentDate: newDate, // <-- atualizar
          isLoading: false,
        });

        // Salvar automaticamente
        get().saveGame();
      },

      // ============================================================
      // TREINO DO JOGADOR
      // ============================================================

      trainPlayer: (focusArea: keyof PlayerAttributes) => {
        const state = get();
        const player = state.getCurrentPlayer();
        if (!player) return;

        const { updatedPlayer, resultLog, injuryOccurred, injury } = executeTrainingSession(
          player,
          {
            intensity: 'Média',
            focusArea,
            energyCost: 20,
            injuryRisk: 0.1,
          }
        );

        // Atualizar jogador nos clubes
        const clubs = state.clubs.map(club => {
          const mainIndex = club.mainSquad.findIndex(p => p.id === player.id);
          if (mainIndex !== -1) {
            const newSquad = [...club.mainSquad];
            newSquad[mainIndex] = updatedPlayer;
            return { ...club, mainSquad: newSquad };
          }
          const subIndex = club.sub15Squad.findIndex(p => p.id === player.id);
          if (subIndex !== -1) {
            const newSquad = [...club.sub15Squad];
            newSquad[subIndex] = updatedPlayer;
            return { ...club, sub15Squad: newSquad };
          }
          return club;
        });

        // Atualizar saveState
        const saveState = state.saveState;
        if (saveState) {
          saveState.userPlayer = updatedPlayer;
          saveState.logs.push(resultLog);
        }

        set({ clubs, saveState });
        get().saveGame();
      },

      // ============================================================
      // COMPRA DE ITENS DE ESTILO DE VIDA
      // ============================================================

      buyLifestyleItem: (item: LifestyleItem) => {
        const state = get();
        const player = state.getCurrentPlayer();
        if (!player) {
          return { success: false, message: 'Nenhum jogador encontrado.' };
        }

        const result = purchaseLifestyleItem(player, item, []);
        if (result.success) {
          // Atualizar jogador nos clubes
          const clubs = state.clubs.map(club => {
            const mainIndex = club.mainSquad.findIndex(p => p.id === player.id);
            if (mainIndex !== -1) {
              const newSquad = [...club.mainSquad];
              newSquad[mainIndex] = result.updatedPlayer;
              return { ...club, mainSquad: newSquad };
            }
            const subIndex = club.sub15Squad.findIndex(p => p.id === player.id);
            if (subIndex !== -1) {
              const newSquad = [...club.sub15Squad];
              newSquad[subIndex] = result.updatedPlayer;
              return { ...club, sub15Squad: newSquad };
            }
            return club;
          });

          const saveState = state.saveState;
          if (saveState) {
            saveState.userPlayer = result.updatedPlayer;
            saveState.logs.push(result.message);
          }

          set({ clubs, saveState });
          get().saveGame();
        }

        return result;
      },

      // ============================================================
      // RESPOSTA A CONFERÊNCIA DE IMPRENSA
      // ============================================================

      respondToPressConference: (questionId: string, optionIndex: number) => {
        const state = get();
        const questions = generatePressConference('BIG_MATCH');
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const option = question.options[optionIndex];
        if (!option) return;

        let newBoardConfidence = state.boardConfidence + option.boardImpact;
        newBoardConfidence = Math.min(100, Math.max(0, newBoardConfidence));

        const player = state.getCurrentPlayer();
        if (player) {
          player.sims.happiness = Math.min(100, Math.max(0, player.sims.happiness + option.moralImpact));
        }

        set({
          boardConfidence: newBoardConfidence,
        });

        state.saveState?.logs.push(`Resposta à imprensa: ${option.text}`);
        get().saveGame();
      },

      // ============================================================
      // SIMULAÇÃO DE JOGO AO VIVO
      // ============================================================

      simulateLiveMatch: (homeTactics: string = 'BALANCED', awayTactics: string = 'BALANCED') => {
        const state = get();
        const homeClub = state.getCurrentClub();
        if (!homeClub) return;

        const awayClub = state.clubs.find(c => c.id !== homeClub.id);
        if (!awayClub) return;

        const liveState = initLiveMatch(homeClub, awayClub, homeTactics, awayTactics);
        set({ liveMatchState: liveState });

        let currentState = liveState;
        for (let i = 0; i < 90; i++) {
          const { newState, generatedEvent } = tickLiveMatch(currentState);
          currentState = newState;
        }

        set({ liveMatchState: currentState });
        get().saveGame();
      },

      applyTacticalChange: (
        newMentality: 'DEFENSIVE' | 'BALANCED' | 'ATTACKING',
        forTeam: 'HOME' | 'AWAY'
      ) => {
        const state = get();
        if (!state.liveMatchState) return;

        const newState = applyInGameTacticalChange(state.liveMatchState, newMentality, forTeam);
        set({ liveMatchState: newState });
      },

      // ============================================================
      // TRANSFERÊNCIAS
      // ============================================================

      processTransferOffer: (offerId: string, accept: boolean) => {
        const state = get();
        state.saveState?.logs.push(
          accept ? 'Transferência aceite!' : 'Transferência rejeitada.'
        );
        get().saveGame();
      },

      // ============================================================
      // SCOUTING
      // ============================================================

      scoutPlayer: (playerId: string) => {
        const state = get();
        const target = state.getPlayerById(playerId);
        if (!target) return;

        const scout = {
          id: uuidv4(),
          name: 'Scout Principal',
          rating: 70,
          region: 'Europa',
          dailyCost: 1000,
        };

        const club = state.getCurrentClub();
        if (!club) return;

        const report = sendScoutOnMission(scout, target, club);
        state.saveState?.logs.push(
          `Relatório de scouting para ${target.name}: Potencial entre ${report.potentialRange[0]} e ${report.potentialRange[1]}.`
        );
        get().saveGame();
      },

      // ============================================================
      // EMPRÉSTIMOS
      // ============================================================

      processLoanDeal: (playerId: string, borrowingClubId: string, terms: any) => {
        const state = get();
        const player = state.getPlayerById(playerId);
        const parentClub = state.getCurrentClub();
        const borrowingClub = state.getClubById(borrowingClubId);

        if (!player || !parentClub || !borrowingClub) return;

        const result = proposeLoanDeal(player, parentClub, borrowingClub, terms);
        state.saveState?.logs.push(result.message);
        get().saveGame();
      },
    }),
    {
      name: 'football-mp-simulator-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        saveState: state.saveState,
        clubs: state.clubs,
        leagues: state.leagues,
        leagueTable: state.leagueTable,
        fixtures: state.fixtures,
        cupFixtures: state.cupFixtures,
        newsFeed: state.newsFeed,
        boardConfidence: state.boardConfidence,
        liveMatchState: state.liveMatchState,
        currentSeason: state.currentSeason,
        currentDate: state.currentDate, // <-- persistir
      }),
    }
  )
);
