// src/components/ui/DashboardPlayer.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Shield,
  Target,
  Trophy,
  Calendar,
  Clock,
  Coins,
  Zap,
  Heart,
  Smile,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Home,
  Dumbbell,
  Footprints,
  Newspaper,
  Settings,
  LogOut,
  Menu,
  X,
  Save,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// IMPORTAÇÕES DA STORE E ENGINES
// ============================================================

import { useGameStore } from '@/store/useGameStore';
import { processPlayerTraining } from '@/engines/simsEngine';
import { simulateMatch } from '@/engines/matchEngine';
import { advanceDaySims } from '@/engines/simsEngine';
import { processMedicalRecovery } from '@/engines/trainingEngine';
import { Player, PlayerAttributes } from '@/types/game';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function DashboardPlayer() {
  const store = useGameStore();
  const player = store.getCurrentPlayer();
  const club = store.getCurrentClub();
  const { saveState, clubs, fixtures, leagueTable, newsFeed, boardConfidence, currentDate, advanceDay, trainPlayer, saveGame } = store;

  // Estado local
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<keyof PlayerAttributes>('pace');
  const [trainingFeedback, setTrainingFeedback] = useState<string | null>(null);

  // Se não houver jogador, mostrar placeholder
  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center text-white">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Nenhum jogador ativo</h2>
          <p className="text-gray-400">Inicia uma carreira para aceder ao dashboard.</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // FUNÇÕES DE INTERAÇÃO COM ENGINES
  // ============================================================

  const handleAdvanceDay = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      await advanceDay();
      // Após avançar, atualizar a UI com os novos dados
    } catch (error) {
      console.error('Erro ao avançar dia:', error);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleTrain = (focusArea: keyof PlayerAttributes) => {
    if (!player) return;
    try {
      trainPlayer(focusArea);
      setTrainingFeedback(`Treino de ${focusArea} concluído!`);
      setTimeout(() => setTrainingFeedback(null), 3000);
    } catch (error) {
      console.error('Erro no treino:', error);
      setTrainingFeedback('Erro no treino. Verifica a energia.');
      setTimeout(() => setTrainingFeedback(null), 3000);
    }
  };

  const handleSave = () => {
    saveGame();
    setTrainingFeedback('Jogo guardado!');
    setTimeout(() => setTrainingFeedback(null), 2000);
  };

  // ============================================================
  // CÁLCULO DO OVERALL (média dos atributos)
  // ============================================================

  const overall = player.overall || Math.round(
    (player.attributes.pace +
      player.attributes.shooting +
      player.attributes.passing +
      player.attributes.dribbling +
      player.attributes.defending +
      player.attributes.physical) / 6
  );

  // ============================================================
  // DADOS PARA EXIBIÇÃO
  // ============================================================

  const getMoraleColor = (morale: string) => {
    switch (morale) {
      case 'Excelente': return 'text-green-400';
      case 'Boa': return 'text-emerald-400';
      case 'Normal': return 'text-yellow-400';
      case 'Baixa': return 'text-orange-400';
      case 'Péssima': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMoraleEmoji = (morale: string) => {
    switch (morale) {
      case 'Excelente': return '😍';
      case 'Boa': return '😊';
      case 'Normal': return '😐';
      case 'Baixa': return '😕';
      case 'Péssima': return '😡';
      default: return '😐';
    }
  };

  // ============================================================
  // TABS (com navegação real)
  // ============================================================

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'training', label: 'Treinos', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'career', label: 'Carreira', icon: <Footprints className="w-5 h-5" /> },
    { id: 'news', label: 'Notícias', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'settings', label: 'Definições', icon: <Settings className="w-5 h-5" /> },
  ];

  // Renderizar conteúdo com base na tab ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'training':
        return renderTraining();
      case 'career':
        return renderCareer();
      case 'news':
        return renderNews();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  // ============================================================
  // RENDER DASHBOARD
  // ============================================================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Card do Perfil */}
      <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-3xl font-black text-black shadow-lg shadow-amber-500/20">
              {player.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{player.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-amber-400" />
                  {player.position}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-amber-400" />
                  Overall {overall}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  #{player.contractYears || '--'}
                </span>
                <span>{player.nationality}</span>
                {player.isSub15 && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Sub-15</span>
                )}
              </div>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-4 text-sm">
            <div className="bg-black/50 border border-amber-500/10 rounded-xl px-4 py-2 text-center">
              <div className="text-gray-400 text-[10px] uppercase">Jogos</div>
              <div className="text-white font-bold text-lg">{player.stats.matchesPlayed}</div>
            </div>
            <div className="bg-black/50 border border-amber-500/10 rounded-xl px-4 py-2 text-center">
              <div className="text-gray-400 text-[10px] uppercase">Golos</div>
              <div className="text-white font-bold text-lg">{player.stats.goals}</div>
            </div>
            <div className="bg-black/50 border border-amber-500/10 rounded-xl px-4 py-2 text-center">
              <div className="text-gray-400 text-[10px] uppercase">Assist.</div>
              <div className="text-white font-bold text-lg">{player.stats.assists}</div>
            </div>
            <div className="bg-black/50 border border-amber-500/10 rounded-xl px-4 py-2 text-center">
              <div className="text-gray-400 text-[10px] uppercase">Média</div>
              <div className="text-white font-bold text-lg">{player.stats.averageRating.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-amber-500/10 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Energia</div>
            <div className="text-xl font-bold text-white">{Math.round(player.sims.energy)}%</div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.round(player.sims.energy)}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-amber-500/10 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-pink-500/10">
            <Smile className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Felicidade</div>
            <div className="text-xl font-bold text-white">{Math.round(player.sims.happiness)}%</div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1">
              <div className="h-full bg-pink-400 rounded-full" style={{ width: `${Math.round(player.sims.happiness)}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-amber-500/10 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <Heart className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Moral</div>
            <div className={`text-xl font-bold ${getMoraleColor(player.sims.morale)}`}>
              {getMoraleEmoji(player.sims.morale)} {player.sims.morale}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-amber-500/10 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <Coins className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Saldo</div>
            <div className="text-xl font-bold text-white">{player.sims.bankBalance.toLocaleString()} €</div>
          </div>
        </div>
      </div>

      {/* Atributos */}
      <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          Atributos (Overall {overall})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(player.attributes).map(([key, value]) => {
            const labels: Record<string, string> = {
              pace: 'Ritmo',
              shooting: 'Remate',
              passing: 'Passe',
              dribbling: 'Drible',
              defending: 'Defesa',
              physical: 'Físico',
            };
            const maxAttr = player.potential || 99;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>{labels[key] || key}</span>
                  <span className="font-bold text-white">{Math.round(value)} / {Math.round(maxAttr)}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (value / maxAttr) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-gray-500">Potencial máximo: {player.potential}</div>
      </div>

      {/* Próximo jogo */}
      <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          Próximo Jogo
        </h3>
        {fixtures && fixtures.length > 0 ? (
          (() => {
            const next = fixtures.filter(f => !f.played).sort((a, b) => a.matchDate.localeCompare(b.matchDate))[0];
            if (next) {
              return (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Casa</div>
                      <div className="font-bold text-white">{next.homeTeamName}</div>
                    </div>
                    <div className="text-lg font-bold text-amber-400">VS</div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Fora</div>
                      <div className="font-bold text-white">{next.awayTeamName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">📅 {next.matchDate}</span>
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                      Em breve
                    </span>
                  </div>
                </div>
              );
            }
            return <div className="text-gray-400">Nenhum jogo agendado.</div>;
          })()
        ) : (
          <div className="text-gray-400">Nenhum jogo agendado.</div>
        )}
      </div>

      {/* Botão Avançar Dia */}
      <button
        onClick={handleAdvanceDay}
        disabled={isAdvancing}
        className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black rounded-xl hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isAdvancing ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Clock className="w-5 h-5" />
            AVANÇAR DIA
          </>
        )}
      </button>
    </div>
  );

  // ============================================================
  // RENDER TREINOS
  // ============================================================

  const renderTraining = () => {
    const trainingOptions: { key: keyof PlayerAttributes; label: string; icon: React.ReactNode }[] = [
      { key: 'pace', label: 'Ritmo', icon: <Zap className="w-4 h-4" /> },
      { key: 'shooting', label: 'Remate', icon: <Target className="w-4 h-4" /> },
      { key: 'passing', label: 'Passe', icon: <Activity className="w-4 h-4" /> },
      { key: 'dribbling', label: 'Drible', icon: <Footprints className="w-4 h-4" /> },
      { key: 'defending', label: 'Defesa', icon: <Shield className="w-4 h-4" /> },
      { key: 'physical', label: 'Físico', icon: <Dumbbell className="w-4 h-4" /> },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-amber-400" />
            Central de Treinos
          </h3>
          <p className="text-sm text-gray-400 mb-4">Escolhe um atributo para treinar. Consome 25 de energia.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {trainingOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleTrain(opt.key)}
                disabled={player.sims.energy < 25}
                className={`p-4 rounded-xl border-2 transition-all ${
                  player.sims.energy >= 25
                    ? 'border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10'
                    : 'border-white/10 text-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-amber-400">{opt.icon}</div>
                  <span className="font-bold text-sm">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
          {trainingFeedback && (
            <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 text-sm text-center">
              {trainingFeedback}
            </div>
          )}
          <div className="mt-4 text-sm text-gray-400">
            Energia: {Math.round(player.sims.energy)}% {player.sims.energy < 25 && <span className="text-red-400">(Insuficiente)</span>}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER CARREIRA
  // ============================================================

  const renderCareer = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Footprints className="w-5 h-5 text-amber-400" />
          Estatísticas de Carreira
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/50 border border-amber-500/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 uppercase">Jogos</div>
            <div className="text-2xl font-bold text-white">{player.stats.matchesPlayed}</div>
          </div>
          <div className="bg-black/50 border border-amber-500/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 uppercase">Golos</div>
            <div className="text-2xl font-bold text-green-400">{player.stats.goals}</div>
          </div>
          <div className="bg-black/50 border border-amber-500/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 uppercase">Assistências</div>
            <div className="text-2xl font-bold text-blue-400">{player.stats.assists}</div>
          </div>
          <div className="bg-black/50 border border-amber-500/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 uppercase">Média</div>
            <div className="text-2xl font-bold text-amber-400">{player.stats.averageRating.toFixed(1)}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <span className="text-amber-400 font-bold">📊 Rácio Golos/Jogo:</span>{' '}
          {player.stats.matchesPlayed > 0 ? (player.stats.goals / player.stats.matchesPlayed).toFixed(2) : '0.00'}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER NOTÍCIAS
  // ============================================================

  const renderNews = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-amber-400" />
          Feed de Notícias
        </h3>
        {newsFeed && newsFeed.length > 0 ? (
          <div className="space-y-3">
            {newsFeed.slice(-5).reverse().map((news, idx) => (
              <div key={idx} className="p-3 bg-black/30 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-400 font-bold uppercase">{news.category}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{news.date}</span>
                </div>
                <div className="text-sm text-white font-medium mt-1">{news.headline}</div>
                <div className="text-xs text-gray-400 mt-1">{news.body}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">Nenhuma notícia disponível.</div>
        )}
      </div>
    </div>
  );

  // ============================================================
  // RENDER DEFINIÇÕES
  // ============================================================

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          Definições
        </h3>
        <div className="space-y-4">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 font-bold hover:bg-amber-500/30 transition"
          >
            <Save className="w-5 h-5" />
            Guardar Jogo
          </button>
          <button
            onClick={() => {
              if (confirm('Tens a certeza que queres sair? O progresso será guardado.')) {
                handleSave();
                window.location.href = '/';
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-bold hover:bg-red-500/30 transition"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
          <div className="text-xs text-gray-500 text-center">
            Data atual: {currentDate || '--'}
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">

      {/* Fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-950/20" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      {/* ============================================================
          SIDEBAR (Desktop)
      ============================================================ */}
      <aside className="hidden md:flex flex-col w-64 bg-black/80 border-r border-amber-500/10 h-screen fixed left-0 top-0 z-30">
        <div className="p-6 border-b border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black text-white">FMPS</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Dashboard do Jogador</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-500/10">
          <button
            onClick={handleSave}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-amber-400 transition"
          >
            <Save className="w-5 h-5" />
            <span className="font-medium">Guardar</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Tens a certeza que queres sair?')) {
                handleSave();
                window.location.href = '/';
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* ============================================================
          CONTEÚDO PRINCIPAL
      ============================================================ */}
      <div className="md:ml-64 h-screen overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-sm border-b border-amber-500/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-xl font-black text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p className="text-xs text-gray-500">{player.name} • {player.position}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:inline">{player.clubName || 'Clube'}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-bold text-sm">
              {player.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* ============================================================
          SIDEBAR MOBILE (overlay)
      ============================================================ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-black border-r border-amber-500/10">
            <div className="p-6 border-b border-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-black" />
                </div>
                <span className="text-xl font-black text-white">FMPS</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">Dashboard do Jogador</div>
            </div>
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleSave}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-amber-400 transition"
              >
                <Save className="w-5 h-5" />
                <span className="font-medium">Guardar</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Tens a certeza que queres sair?')) {
                    handleSave();
                    window.location.href = '/';
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
