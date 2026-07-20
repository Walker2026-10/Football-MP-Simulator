// src/components/App.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Home,
  Heart,
  Dumbbell,
  Shield,
  Users,
  Trophy,
  Building2,
  Menu,
  X,
  User,
  Target,
  Play,
  Loader2,
  LogOut,
  Save,
} from 'lucide-react';

// Importação dos componentes de UI
import { DashboardUI } from '@/components/ui/DashboardUI';
import { LifestyleUI } from '@/components/ui/LifestyleUI';
import { TrainingUI } from '@/components/ui/TrainingUI';
import { MatchUI } from '@/components/ui/MatchUI';
import { TransferUI } from '@/components/ui/TransferUI';
import { CompetitionsAndMediaUI } from '@/components/ui/CompetitionsAndMediaUI';
import { ClubAndHistoryUI } from '@/components/ui/ClubAndHistoryUI';

// ============================================================
// TIPOS E CONSTANTES
// ============================================================

type TabId =
  | 'dashboard'
  | 'lifestyle'
  | 'training'
  | 'match'
  | 'transfer'
  | 'competitions'
  | 'club';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function App() {
  const store = useGameStore();
  const {
    saveState,
    isLoading,
    startNewCareer,
    loadGame,
    saveGame,
    resetGame,
    getCurrentPlayer,
    getCurrentClub,
  } = store;

  // Estado local
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('Médio');
  const [careerMode, setCareerMode] = useState<'player' | 'manager'>('player');
  const [nationality, setNationality] = useState('Portugal');

  // Verificar se há um save carregado
  const hasGame = useMemo(() => !!saveState && !!getCurrentPlayer(), [saveState, getCurrentPlayer]);

  // Carregar jogo automaticamente ao montar
  useEffect(() => {
    if (!saveState) {
      loadGame();
    }
  }, [loadGame, saveState]);

  // Definição das abas
  const tabs: TabItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      component: <DashboardUI />,
    },
    {
      id: 'lifestyle',
      label: 'Vida Pessoal',
      icon: <Heart className="w-5 h-5" />,
      component: <LifestyleUI />,
    },
    {
      id: 'training',
      label: 'Treinos',
      icon: <Dumbbell className="w-5 h-5" />,
      component: <TrainingUI />,
    },
    {
      id: 'match',
      label: 'Jogo',
      icon: <Shield className="w-5 h-5" />,
      component: <MatchUI />,
    },
    {
      id: 'transfer',
      label: 'Transferências',
      icon: <Users className="w-5 h-5" />,
      component: <TransferUI />,
    },
    {
      id: 'competitions',
      label: 'Competições',
      icon: <Trophy className="w-5 h-5" />,
      component: <CompetitionsAndMediaUI />,
    },
    {
      id: 'club',
      label: 'Clube',
      icon: <Building2 className="w-5 h-5" />,
      component: <ClubAndHistoryUI />,
    },
  ], []);

  // ============================================================
  // FUNÇÕES DE NAVEGAÇÃO
  // ============================================================

  const handleStartCareer = () => {
    if (!playerName.trim()) {
      alert('Por favor, insere o teu nome.');
      return;
    }
    setIsCreating(true);
    try {
      startNewCareer(playerName.trim(), position, careerMode, nationality);
    } catch (error) {
      console.error('Erro ao iniciar carreira:', error);
      alert('Ocorreu um erro ao iniciar a carreira. Tenta novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveGame = () => {
    saveGame();
    alert('Jogo guardado com sucesso!');
  };

  const handleResetGame = () => {
    if (window.confirm('Tens a certeza que queres reiniciar o jogo? Todo o progresso será perdido.')) {
      resetGame();
      window.location.reload();
    }
  };

  // ============================================================
  // RENDER - ECRÃ DE CRIAÇÃO (sem jogo ativo)
  // ============================================================

  if (!hasGame && !isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="fc26-card max-w-lg w-full p-6 md:p-8 border-gold-fc/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <Trophy className="w-10 h-10 text-gold-fc" strokeWidth={1.5} />
              <span className="text-3xl font-bold text-gradient-gold">Football MP</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Nova Carreira</h2>
            <p className="text-sm text-gray-400">Cria o teu caminho para a glória.</p>
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                autoFocus
              />
            </div>

            {/* Nacionalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nacionalidade</label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
              >
                {['Portugal', 'Brasil', 'Espanha', 'Inglaterra', 'Alemanha', 'França', 'Itália', 'Argentina'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Posição (apenas para modo jogador) */}
            {careerMode === 'player' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Posição</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                >
                  {['Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Modo de Carreira */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Modo de Carreira</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCareerMode('player')}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${careerMode === 'player'
                      ? 'bg-accent-blue/20 border-accent-blue/50 text-white'
                      : 'bg-dark-bg/50 border-dark-border text-gray-400 hover:border-dark-border/70'
                    }
                  `}
                >
                  <User className="w-6 h-6 mx-auto mb-1" />
                  <div className="font-medium">Jogador</div>
                  <div className="text-xs">Começa nos Sub-15</div>
                </button>
                <button
                  onClick={() => setCareerMode('manager')}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${careerMode === 'manager'
                      ? 'bg-accent-blue/20 border-accent-blue/50 text-white'
                      : 'bg-dark-bg/50 border-dark-border text-gray-400 hover:border-dark-border/70'
                    }
                  `}
                >
                  <Target className="w-6 h-6 mx-auto mb-1" />
                  <div className="font-medium">Treinador</div>
                  <div className="text-xs">Gerência de clubes</div>
                </button>
              </div>
            </div>

            {/* Botão Começar */}
            <button
              onClick={handleStartCareer}
              disabled={isCreating || !playerName.trim()}
              className={`
                w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2
                ${!isCreating && playerName.trim()
                  ? 'bg-gradient-to-r from-neon-cyan to-accent-blue text-dark-bg hover:shadow-neon-cyan transition'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isCreating ? 'A iniciar...' : 'Começar Carreira'}
            </button>

            {/* Botão Carregar Save (se existir) */}
            <button
              onClick={() => loadGame()}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Carregar jogo existente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - LAYOUT PRINCIPAL (jogo ativo)
  // ============================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col md:flex-row">
      {/* ============================================================
          SIDEBAR (Desktop)
      ============================================================ */}
      <aside className="hidden md:flex md:flex-col md:w-20 lg:w-64 bg-dark-card border-r border-dark-border h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 border-b border-dark-border flex items-center justify-center lg:justify-start gap-2">
          <Trophy className="w-8 h-8 text-gold-fc" />
          <span className="hidden lg:inline text-xl font-bold text-gradient-gold">FMPS</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all
                ${activeTab === tab.id
                  ? 'bg-accent-blue/20 text-white border border-accent-blue/50'
                  : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
                }
              `}
            >
              {tab.icon}
              <span className="hidden lg:inline text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-border space-y-2">
          <button
            onClick={handleSaveGame}
            className="w-full flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-dark-bg/50 transition"
          >
            <Save className="w-4 h-4" />
            <span className="hidden lg:inline">Guardar</span>
          </button>
          <button
            onClick={handleResetGame}
            className="w-full flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Sair</span>
          </button>
          <div className="text-xs text-gray-500 text-center lg:text-left hidden lg:block">
            {getCurrentPlayer()?.name} • {getCurrentClub()?.name}
          </div>
        </div>
      </aside>

      {/* ============================================================
          CONTEÚDO PRINCIPAL
      ============================================================ */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header (mobile) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-dark-card border-b border-dark-border sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold-fc" />
            <span className="text-lg font-bold text-white">FMPS</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-dark-bg/50 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu (overlay) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-dark-card/95 backdrop-blur-sm">
            <div className="flex flex-col h-full p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-white">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${activeTab === tab.id
                        ? 'bg-accent-blue/20 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
                      }
                    `}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-auto border-t border-dark-border pt-4 space-y-2">
                <button
                  onClick={handleSaveGame}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-dark-bg/50 transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={handleResetGame}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
                <div className="text-xs text-gray-500 text-center">
                  {getCurrentPlayer()?.name} • {getCurrentClub()?.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da aba ativa */}
        <div className="flex-1 overflow-y-auto">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>

        {/* Bottom Navigation (mobile) */}
        <nav className="md:hidden flex items-center justify-around bg-dark-card border-t border-dark-border p-2 sticky bottom-0 z-10">
          {tabs.slice(0, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
                ${activeTab === tab.id
                  ? 'text-neon-cyan'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-gray-400 hover:text-white transition"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Mais</span>
          </button>
        </nav>
      </main>
    </div>
  );
        }
