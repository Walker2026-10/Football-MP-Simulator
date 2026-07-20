// src/components/ui/NewGameUI.tsx

'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Users,
  Flag,
  Target,
  Play,
  CheckCircle,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface NewGameUIProps {
  onBack: () => void;
  onStartCareer: (
    playerName: string,
    position: string,
    mode: 'player' | 'manager',
    nationality: string
  ) => void;
  isLoading?: boolean;
}

export function NewGameUI({ onBack, onStartCareer, isLoading = false }: NewGameUIProps) {
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('Médio');
  const [careerMode, setCareerMode] = useState<'player' | 'manager'>('player');
  const [nationality, setNationality] = useState('Portugal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Por favor, insere o teu nome.');
      return;
    }
    onStartCareer(playerName.trim(), position, careerMode, nationality);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-dark-bg flex items-center justify-center p-4 md:p-8">
      {/* Background com gradientes e luzes (mesmo estilo do menu) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card/80 to-dark-bg" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Glass card principal */}
        <div className="w-full bg-dark-card/60 backdrop-blur-xl border border-dark-border/60 rounded-3xl shadow-2xl p-6 md:p-10 transition-all hover:shadow-emerald-500/5">
          {/* Cabeçalho com botão voltar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Voltar ao Menu Principal</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Nova Carreira</span>
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Começa a tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Jornada</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Define o teu caminho para a glória
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Modo de Carreira - Cards interativos */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Escolhe o teu caminho
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card Jogador */}
                <button
                  type="button"
                  onClick={() => setCareerMode('player')}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                    ${careerMode === 'player'
                      ? 'border-emerald-500/70 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'border-dark-border/50 bg-dark-bg/30 hover:border-emerald-500/30 hover:bg-dark-bg/50'
                    }
                  `}
                >
                  {careerMode === 'player' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-xl
                      ${careerMode === 'player'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-dark-card/50 text-gray-400'
                      }
                    `}>
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Jogador</h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Começa como jovem promessa nos Sub-15 e constrói a tua lenda.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Sub-15</span>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">Evolução</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Card Treinador */}
                <button
                  type="button"
                  onClick={() => setCareerMode('manager')}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                    ${careerMode === 'manager'
                      ? 'border-blue-500/70 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                      : 'border-dark-border/50 bg-dark-bg/30 hover:border-blue-500/30 hover:bg-dark-bg/50'
                    }
                  `}
                >
                  {careerMode === 'manager' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-xl
                      ${careerMode === 'manager'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-dark-card/50 text-gray-400'
                      }
                    `}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Treinador</h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Comanda equipas, define táticas e domina o mercado.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">Gestão</span>
                        <span className="text-xs bg-gold-fc/10 text-gold-fc px-2 py-0.5 rounded-full">Táticas</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Campos do formulário */}
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Nome do {careerMode === 'player' ? 'Jogador' : 'Treinador'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Nacionalidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Nacionalidade
                </label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  >
                    {['Portugal', 'Brasil', 'Espanha', 'Inglaterra', 'Alemanha', 'França', 'Itália', 'Argentina'].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Posição (apenas para modo jogador) */}
              {careerMode === 'player' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Posição em Campo
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                    >
                      {['Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Botão Avançar */}
            <button
              type="submit"
              disabled={isLoading || !playerName.trim()}
              className={`
                w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200
                ${!isLoading && playerName.trim()
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Avançar para o Jogo
                </>
              )}
            </button>

            {/* Rodapé com dica */}
            <div className="text-center text-xs text-gray-500 pt-2">
              <Sparkles className="w-3 h-3 inline mr-1 text-emerald-400" />
              Inicia agora a tua história — cada lenda começa com um primeiro passo.
            </div>
          </form>
        </div>

        {/* Versão flutuante */}
        <div className="absolute bottom-4 right-4 text-[10px] text-gray-600/50 md:text-xs select-none">
          Football MP Simulator • v1.0
        </div>
      </div>
    </div>
  );
}
