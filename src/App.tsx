// src/App.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { MainMenuUI } from '@/components/ui/MainMenuUI';
import { NewGameUI } from '@/components/ui/NewGameUI';
import { CreatePlayerUI, PlayerCreationData } from '@/components/ui/CreatePlayerUI';
import { CreateManagerUI, ManagerCreationData } from '@/components/ui/CreateManagerUI';
import { Loader2 } from 'lucide-react';

// Placeholder para o Dashboard (podes substituir pelo layout completo)
function DashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-400">Carreira ativa. Integra aqui o layout completo do jogo.</p>
        <button className="mt-4 px-4 py-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition">
          Voltar ao Menu
        </button>
      </div>
    </div>
  );
}

export function App() {
  const store = useGameStore();
  const {
    saveState,
    isLoading,
    startNewCareer,
    loadGame,
    getCurrentPlayer,
  } = store;

  const [currentScreen, setCurrentScreen] = useState<'main_menu' | 'new_game' | 'create_player' | 'create_manager' | 'dashboard'>('main_menu');
  const [isCreating, setIsCreating] = useState(false);

  const hasGame = !!saveState && !!getCurrentPlayer();

  const handleLoadGame = useCallback(() => {
    loadGame();
    if (getCurrentPlayer()) {
      setCurrentScreen('dashboard');
    } else {
      alert('Nenhum jogo guardado encontrado.');
    }
  }, [loadGame, getCurrentPlayer]);

  // Callbacks para criação
  const handlePlayerSubmit = (data: PlayerCreationData) => {
    setIsCreating(true);
    try {
      // Aqui podes usar os dados para criar o jogador via store
      // Por agora, apenas simulamos o início
      console.log('Player data:', data);
      // startNewCareer(data.name, data.position, 'player', data.nationality);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar jogador.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleManagerSubmit = (data: ManagerCreationData) => {
    setIsCreating(true);
    try {
      console.log('Manager data:', data);
      // startNewCareer(data.name, 'manager', data.nationality);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar treinador.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
      </div>
    );
  }

  switch (currentScreen) {
    case 'main_menu':
      return (
        <MainMenuUI
          onStartNewGame={() => setCurrentScreen('new_game')}
          onLoadGame={handleLoadGame}
          hasSavedGame={hasGame}
        />
      );
    case 'new_game':
      return (
        <NewGameUI
          onBack={() => setCurrentScreen('main_menu')}
          onSelectMode={(mode) => setCurrentScreen(mode === 'player' ? 'create_player' : 'create_manager')}
        />
      );
    case 'create_player':
      return (
        <CreatePlayerUI
          onBack={() => setCurrentScreen('new_game')}
          onSubmit={handlePlayerSubmit}
          isLoading={isCreating}
        />
      );
    case 'create_manager':
      return (
        <CreateManagerUI
          onBack={() => setCurrentScreen('new_game')}
          onSubmit={handleManagerSubmit}
          isLoading={isCreating}
        />
      );
    case 'dashboard':
    default:
      return <DashboardPlaceholder />;
  }
}
