// src/components/ui/ClubAndHistoryUI.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Building,
  Home,
  Users,
  Ticket,
  Coins,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  BarChart3,
  Footprints,
  Goal,
  Trophy,
  Medal,
  Star,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wrench,
  Stethoscope,
  Dumbbell,
  Trees,
  BookOpen,
  History,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';

// ============================================================
// TIPOS (baseados nos motores)
// ============================================================

interface StadiumFacilities {
  capacity: number;
  ticketPrice: number;
  pitchQuality: number;
  youthAcademyLevel: number;
  medicalCenterLevel: number;
  trainingGroundLevel: number;
}

interface SeasonHistory {
  seasonYear: string;
  clubId: string;
  clubName: string;
  appearances: number;
  goals: number;
  assists: number;
  averageRating: number;
  trophiesWon: string[];
  individualAwards: string[];
}

interface CareerStats {
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  careerTrophies: string[];
  hallOfFameStatus: boolean;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ClubAndHistoryUI() {
  const store = useGameStore();
  const player = store.getCurrentPlayer();
  const club = store.getCurrentClub();
  const { boardConfidence, saveState, getCurrentClub } = store;

  // Estado local
  const [activeTab, setActiveTab] = useState<'facilities' | 'history' | 'trophies'>('facilities');
  const [upgradeTarget, setUpgradeTarget] = useState<keyof StadiumFacilities | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeFeedback, setUpgradeFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // ============================================================
  // DADOS MOCK (para demonstração)
  // ============================================================

  // Instalações do clube
  const stadium: StadiumFacilities = useMemo(() => {
    if (!club) {
      return {
        capacity: 30000,
        ticketPrice: 30,
        pitchQuality: 75,
        youthAcademyLevel: 5,
        medicalCenterLevel: 6,
        trainingGroundLevel: 7,
      };
    }
    // Idealmente, o clube teria estas propriedades. Vamos usar valores mock
    return {
      capacity: 30000 + (club.reputation || 50) * 200,
      ticketPrice: 20 + Math.floor((club.reputation || 50) / 10),
      pitchQuality: 60 + Math.floor((club.reputation || 50) / 5),
      youthAcademyLevel: 3 + Math.floor((club.reputation || 50) / 15),
      medicalCenterLevel: 3 + Math.floor((club.reputation || 50) / 15),
      trainingGroundLevel: 4 + Math.floor((club.reputation || 50) / 12),
    };
  }, [club]);

  // Histórico do jogador (mock)
  const seasonHistory: SeasonHistory[] = useMemo(() => {
    if (!player) return [];
    // Gerar algumas épocas mock
    const baseYear = 2026;
    return Array.from({ length: 3 }, (_, i) => ({
      seasonYear: `${baseYear + i}/${baseYear + i + 1}`,
      clubId: club?.id || 'unknown',
      clubName: club?.name || 'Clube',
      appearances: 20 + Math.floor(Math.random() * 20),
      goals: 5 + Math.floor(Math.random() * 10),
      assists: 3 + Math.floor(Math.random() * 8),
      averageRating: 6.5 + Math.random() * 2,
      trophiesWon: i === 0 ? ['Liga Nacional'] : i === 1 ? ['Liga Nacional', 'Taça'] : ['Liga Nacional', 'Taça', 'Supertaça'],
      individualAwards: i === 2 ? ['Melhor Jogador'] : [],
    }));
  }, [player, club]);

  // Troféus coletivos e individuais (mock)
  const teamTrophies = useMemo(() => {
    if (!club) return [];
    return [
      { name: 'Liga Nacional', season: '2026/2027', category: 'Liga' },
      { name: 'Taça Nacional', season: '2026/2027', category: 'Taça' },
      { name: 'Supertaça', season: '2027', category: 'Taça' },
    ];
  }, [club]);

  const individualAwards = useMemo(() => {
    if (!player) return [];
    return [
      { name: 'Bola de Ouro', season: '2027' },
      { name: 'Chuteira de Ouro', season: '2027' },
      { name: 'Melhor Jovem', season: '2026' },
    ];
  }, [player]);

  // Estatísticas da carreira (mock)
  const careerStats: CareerStats = useMemo(() => {
    if (!player) return { totalMatches: 0, totalGoals: 0, totalAssists: 0, careerTrophies: [], hallOfFameStatus: false };
    const totalMatches = seasonHistory.reduce((sum, s) => sum + s.appearances, 0);
    const totalGoals = seasonHistory.reduce((sum, s) => sum + s.goals, 0);
    const totalAssists = seasonHistory.reduce((sum, s) => sum + s.assists, 0);
    const allTrophies = seasonHistory.flatMap(s => s.trophiesWon);
    const uniqueTrophies = Array.from(new Set(allTrophies));
    const hallOfFame = totalMatches > 50 && totalGoals > 20;
    return {
      totalMatches,
      totalGoals,
      totalAssists,
      careerTrophies: uniqueTrophies,
      hallOfFameStatus: hallOfFame,
    };
  }, [seasonHistory]);

  // ============================================================
  // FUNÇÕES DE UPGRADE (simulação)
  // ============================================================

  const handleUpgrade = (facility: keyof StadiumFacilities) => {
    if (!club) return;
    setIsUpgrading(true);
    setUpgradeTarget(facility);

    // Simular custo e atualização
    const cost = 50000 + Math.floor(Math.random() * 200000);
    if (club.budget < cost) {
      setUpgradeFeedback({
        type: 'error',
        message: `Orçamento insuficiente! Precisas de ${cost.toLocaleString()}€, tens ${club.budget.toLocaleString()}€.`,
      });
      setIsUpgrading(false);
      setTimeout(() => setUpgradeFeedback(null), 4000);
      return;
    }

    // Simular upgrade
    setTimeout(() => {
      // Atualizar o estádio (mock)
      const updatedStadium = { ...stadium };
      const increment = facility === 'capacity' ? 2000 : facility === 'ticketPrice' ? 2 : 5;
      const maxVal = facility === 'capacity' ? 150000 : facility === 'ticketPrice' ? 200 : 100;
      const current = updatedStadium[facility] as number;
      const newVal = Math.min(maxVal, current + increment);
      updatedStadium[facility] = newVal as any;

      // Atualizar orçamento do clube (mock)
      if (saveState) {
        const updatedClub = { ...club, budget: club.budget - cost };
        // Na prática, a store deveria ter um método para atualizar o clube
        // Vamos simular via saveState
        saveState.logs.push(`Upgrade de ${facility} concluído! Custo: ${cost.toLocaleString()}€.`);
        store.saveGame();
      }

      setUpgradeFeedback({
        type: 'success',
        message: `${facility} melhorado com sucesso! Novo nível: ${newVal}.`,
      });
      setIsUpgrading(false);
      setTimeout(() => setUpgradeFeedback(null), 4000);
    }, 1000);
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!player || !club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
        <div className="fc26-card max-w-md w-full p-8">
          <Building className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sem Dados de Clube</h2>
          <p className="text-gray-400">Inicia uma carreira para gerir as instalações e histórico.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-border pb-2 overflow-x-auto">
        {[
          { id: 'facilities', label: 'Instalações', icon: <Building className="w-4 h-4" /> },
          { id: 'history', label: 'Histórico', icon: <History className="w-4 h-4" /> },
          { id: 'trophies', label: 'Troféus & Hall da Fama', icon: <Trophy className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-accent-blue/20 text-white border border-accent-blue/50'
                : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback de upgrade */}
      {upgradeFeedback && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200
          ${upgradeFeedback.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
            upgradeFeedback.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
            'bg-blue-500/20 border border-blue-500/30 text-blue-400'}
        `}>
          {upgradeFeedback.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {upgradeFeedback.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <span>{upgradeFeedback.message}</span>
        </div>
      )}

      {/* ============================================================
          ABA 1: INSTALAÇÕES & ESTÁDIO
      ============================================================ */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          {/* Resumo do clube */}
          <div className="fc26-card p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-neon-cyan" />
              {club.name} - Visão Geral
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Orçamento</div>
                <div className="text-xl font-bold text-neon-green">{club.budget.toLocaleString()} €</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Confiança Direção</div>
                <div className="text-xl font-bold text-white">{Math.round(boardConfidence)}%</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Reputação</div>
                <div className="text-xl font-bold text-gold-fc">{club.reputation || 50}</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Estádio</div>
                <div className="text-xl font-bold text-white">{stadium.capacity}</div>
              </div>
            </div>
          </div>

          {/* Instalações atuais */}
          <div className="fc26-card p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gold-fc" />
              Instalações Atuais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Capacidade</span>
                  <span className="font-bold text-white">{stadium.capacity}</span>
                </div>
                <button
                  onClick={() => handleUpgrade('capacity')}
                  disabled={isUpgrading}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isUpgrading && upgradeTarget === 'capacity' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Expandir (+2.000)
                </button>
              </div>

              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Preço do Bilhete</span>
                  <span className="font-bold text-white">{stadium.ticketPrice} €</span>
                </div>
                <button
                  onClick={() => handleUpgrade('ticketPrice')}
                  disabled={isUpgrading}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isUpgrading && upgradeTarget === 'ticketPrice' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Aumentar (+2€)
                </button>
              </div>

              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Qualidade do Relvado</span>
                  <span className="font-bold text-white">{stadium.pitchQuality}%</span>
                </div>
                <button
                  onClick={() => handleUpgrade('pitchQuality')}
                  disabled={isUpgrading}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isUpgrading && upgradeTarget === 'pitchQuality' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Melhorar (+5%)
                </button>
              </div>

              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Academia de Jovens</span>
                  <span className="font-bold text-white">{stadium.youthAcademyLevel}/10</span>
                </div>
                <button
                  onClick={() => handleUpgrade('youthAcademyLevel')}
                  disabled={isUpgrading}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isUpgrading && upgradeTarget === 'youthAcademyLevel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Melhorar (+1)
                </button>
              </div>

              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Centro Médico</span>
                  <span className="font-bold text-white">{stadium.medicalCenterLevel}/10</span>
                </div>
                <button
                  onClick={() => handleUpgrade('medicalCenterLevel')}
                  disabled={isUpgrading}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isUpgrading && upgradeTarget === 'medicalCenterLevel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Melhorar (+1)
                </button>
              </div>

              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Centro de Treinos</span>
                  <span className="font-bold text-white">{stadium.trainingGroundLevel}/10</span>
                </div>
                <button
                  onClick={() => handleUpgrade('trainingGroundLevel')}
                  disabled={isUpgrading}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isUpgrading && upgradeTarget === 'trainingGroundLevel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Melhorar (+1)
                </button>
              </div>
            </div>
          </div>

          {/* Receita estimada por jogo */}
          <div className="fc26-card p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-neon-cyan" />
              Receita Estimada por Jogo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Bilheteira</div>
                <div className="text-xl font-bold text-white">
                  {Math.round(stadium.capacity * 0.8 * stadium.ticketPrice).toLocaleString()} €
                </div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Catering</div>
                <div className="text-xl font-bold text-white">
                  {Math.round(stadium.capacity * 0.8 * 5).toLocaleString()} €
                </div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Merchandising</div>
                <div className="text-xl font-bold text-white">
                  {Math.round(stadium.capacity * 0.8 * 3).toLocaleString()} €
                </div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-gray-400">
              Estimativa baseada em 80% de ocupação
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ABA 2: HISTÓRICO DE ÉPOCAS & ESTATÍSTICAS
      ============================================================ */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Totais da carreira */}
          <div className="fc26-card p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold-fc" />
              Estatísticas de Carreira
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Jogos</div>
                <div className="text-2xl font-bold text-white">{careerStats.totalMatches}</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Golos</div>
                <div className="text-2xl font-bold text-neon-green">{careerStats.totalGoals}</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Assistências</div>
                <div className="text-2xl font-bold text-neon-cyan">{careerStats.totalAssists}</div>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border text-center">
                <div className="text-sm text-gray-400">Rácio Golos/Jogo</div>
                <div className="text-2xl font-bold text-gold-fc">
                  {careerStats.totalMatches > 0 ? (careerStats.totalGoals / careerStats.totalMatches).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela cronológica */}
          <div className="fc26-card p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-neon-cyan" />
              Épocas
            </h4>
            {seasonHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p>Nenhuma época registada ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-dark-border">
                      <th className="text-left py-2 px-3">Época</th>
                      <th className="text-left py-2 px-3">Clube</th>
                      <th className="text-center py-2 px-3">Jogos</th>
                      <th className="text-center py-2 px-3">Golos</th>
                      <th className="text-center py-2 px-3">Assist.</th>
                      <th className="text-center py-2 px-3">Média</th>
                      <th className="text-center py-2 px-3">Troféus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonHistory.map((season, idx) => (
                      <tr key={idx} className="border-b border-dark-border/50 hover:bg-dark-bg/30 transition">
                        <td className="py-2 px-3 text-white">{season.seasonYear}</td>
                        <td className="py-2 px-3 text-gray-300">{season.clubName}</td>
                        <td className="py-2 px-3 text-center text-gray-300">{season.appearances}</td>
                        <td className="py-2 px-3 text-center text-neon-green">{season.goals}</td>
                        <td className="py-2 px-3 text-center text-neon-cyan">{season.assists}</td>
                        <td className="py-2 px-3 text-center text-white">{season.averageRating.toFixed(1)}</td>
                        <td className="py-2 px-3 text-center text-gold-fc">
                          {season.trophiesWon.length > 0 ? (
                            <span className="flex items-center justify-center gap-1">
                              <Trophy className="w-4 h-4" />
                              {season.trophiesWon.length}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          ABA 3: TROFÉUS & HALL DA FAMA
      ============================================================ */}
      {activeTab === 'trophies' && (
        <div className="space-y-6">
          {/* Troféus Coletivos */}
          <div className="fc26-card p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-fc" />
              Troféus Coletivos
            </h3>
            {teamTrophies.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p>Nenhum troféu coletivo conquistado ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamTrophies.map((trophy, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gold-fc/10">
                      <Trophy className="w-8 h-8 text-gold-fc" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{trophy.name}</div>
                      <div className="text-sm text-gray-400">{trophy.season}</div>
                      <div className="text-xs text-gray-500">{trophy.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prémios Individuais */}
          <div className="fc26-card p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Medal className="w-5 h-5 text-neon-cyan" />
              Prémios Individuais
            </h3>
            {individualAwards.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p>Nenhum prémio individual conquistado ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {individualAwards.map((award, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border flex items-center gap-4">
                    <div className="p-3 rounded-full bg-accent-blue/10">
                      <Star className="w-8 h-8 text-neon-cyan" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{award.name}</div>
                      <div className="text-sm text-gray-400">{award.season}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hall da Fama */}
          <div className="fc26-card p-4 border-gold-fc/30">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-fc" />
              Hall da Fama
            </h3>
            <div className="flex flex-col items-center text-center p-6">
              <div className="text-6xl mb-4">
                {careerStats.hallOfFameStatus ? (
                  <Trophy className="w-16 h-16 text-gold-fc" />
                ) : (
                  <Shield className="w-16 h-16 text-gray-500" />
                )}
              </div>
              <h4 className="text-2xl font-bold text-white">
                {careerStats.hallOfFameStatus ? '🏆 Lenda do Futebol' : 'Caminho para a Lenda'}
              </h4>
              <p className="text-sm text-gray-400 mt-2 max-w-md">
                {careerStats.hallOfFameStatus
                  ? `Com ${careerStats.totalMatches} jogos e ${careerStats.totalGoals} golos, ${player.name} é uma lenda indiscutível.`
                  : `Com ${careerStats.totalMatches} jogos e ${careerStats.totalGoals} golos, ainda há muito a conquistar.`
                }
              </p>
              {!careerStats.hallOfFameStatus && (
                <div className="mt-4 text-sm text-gray-500">
                  <p>Critérios: 300+ jogos, 100+ golos, ou 50+ assistências</p>
                  <p className="text-xs mt-1">Faltam: {Math.max(0, 300 - careerStats.totalMatches)} jogos ou {Math.max(0, 100 - careerStats.totalGoals)} golos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
