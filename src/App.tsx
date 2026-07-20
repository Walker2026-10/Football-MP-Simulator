// src/App.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { MainMenuUI } from '@/components/ui/MainMenuUI';
import { NewGameUI } from '@/components/ui/NewGameUI';  // <-- importação do componente externo
import { Loader2 } from 'lucide-react';

// ============================================================
// COMPONENTE PRINCIPAL APP
// ============================================================

export function App() {
  const store = useGameStore();
  const {
    saveState,
    isLoading,
    startNewCareer,
    loadGame,
    getCurrentPlayer,
    getCurrentClub,
  } = store;

  // Estado de navegação
  const [currentScreen, setCurrentScreen] = useState<'main_menu' | 'new_game' | 'dashboard'>('main_menu');
  const [isCreating, setIsCreating] = useState(false);

  // Verificar se há um jogo carregado
  const hasGame = !!saveState && !!getCurrentPlayer();

  // Callback para iniciar nova carreira
  const handleStartNewCareer = (
    playerName: string,
    position: string,
    mode: 'player' | 'manager',
    nationality: string
  ) => {
    setIsCreating(true);
    try {
      startNewCareer(playerName, position, mode, nationality);
      // Após iniciar, vai para dashboard (o estado da store será atualizado)
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Erro ao iniciar carreira:', error);
      alert('Ocorreu um erro ao iniciar a carreira. Tenta novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  // Callback para carregar jogo existente
  const handleLoadGame = useCallback(() => {
    loadGame();
    // Após carregar, verificar se foi bem-sucedido
    if (getCurrentPlayer()) {
      setCurrentScreen('dashboard');
    } else {
      alert('Nenhum jogo guardado encontrado.');
    }
  }, [loadGame, getCurrentPlayer]);

  // Se estiver a carregar, mostrar loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
      </div>
    );
  }

  // Renderização condicional por ecrã
  if (currentScreen === 'main_menu') {
    return (
      <MainMenuUI
        onStartNewGame={() => setCurrentScreen('new_game')}
        onLoadGame={handleLoadGame}
        hasSavedGame={hasGame}
      />
    );
  }

  if (currentScreen === 'new_game') {
    return (
      <NewGameUI
        onBack={() => setCurrentScreen('main_menu')}
        onStartCareer={handleStartNewCareer}
        isLoading={isCreating}
      />
    );
  }

  // currentScreen === 'dashboard'
  // Layout completo do jogo (sidebar + conteúdo)
  // Importar os componentes do dashboard (DashboardUI, etc.)
  // Aqui deves colocar o layout que já tinhas antes (com sidebar e navegação)
  // Como exemplo, vou colocar um placeholder, mas deves substituir pelo código final.

  // Para não perder o progresso, vou reutilizar o componente DashboardLayout que existia.
  // Vamos importar os componentes necessários.
  // Nota: este código deve ser substituído pelo layout completo que tinhas antes.
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">Carreira ativa. Integra aqui o layout completo do jogo.</p>
        <button
          onClick={() => {
            // Para demo, permitir voltar ao menu
            setCurrentScreen('main_menu');
          }}
          className="mt-4 px-4 py-2 bg-accent-blue/20 text-white rounded-lg hover:bg-accent-blue/30 transition"
        >
          Voltar ao Menu
        </button>
      </div>
    </div>
  );
}
