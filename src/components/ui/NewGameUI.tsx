// src/components/ui/NewGameUI.tsx

'use client';

import React, { useState, useMemo } from 'react';
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
  Shield,
  Footprints,
  Crown,
  Star,
  Zap,
  MoveRight,
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

// Mapeamento de bandeiras para emojis
const flagEmojis: Record<string, string> = {
  Portugal: '🇵🇹',
  Brasil: '🇧🇷',
  Espanha: '🇪🇸',
  Inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Alemanha: '🇩🇪',
  França: '🇫🇷',
  Itália: '🇮🇹',
  Argentina: '🇦🇷',
};

// Cores de posição para a carta
const positionColors: Record<string, string> = {
  'Guarda-Redes': 'from-yellow-400 to-yellow-600',
  'Defesa Central': 'from-blue-400 to-blue-600',
  Lateral: 'from-blue-300 to-blue-500',
  Médio: 'from-green-400 to-green-600',
  Extremo: 'from-purple-400 to-purple-600',
  Avançado: 'from-red-400 to-red-600',
};

export function NewGameUI({ onBack, onStartCareer, isLoading = false }: NewGameUIProps) {
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('Médio');
  const [careerMode, setCareerMode] = useState<'player' | 'manager'>('player');
  const [nationality, setNationality] = useState('Portugal');

  // Overall dinâmico para a carta
  const overall = useMemo(() => {
    if (!playerName) return '??';
    const base = 55 + Math.floor(Math.random() * 15);
    const bonus: Record<string, number> = {
      'Guarda-Redes': 5,
      'Defesa Central': 4,
      Lateral: 3,
      Médio: 2,
      Extremo: 3,
      Avançado: 5,
    };
    return Math.min(75, base + (bonus[position] || 0));
  }, [playerName, position]);

  const flagEmoji = flagEmojis[nationality] || '🌍';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Por favor, insere o teu nome.');
      return;
    }
    onStartCareer(playerName.trim(), position, careerMode, nationality);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark-bg select-none">
      {/* ============================================================
          FUNDO IMERSIVO
      ============================================================ */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card/90 to-emerald-900/20" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00ff87]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diag" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <line x1="0" y1="0" x2="60" y2="60" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* ============================================================
          TOP BAR
      ============================================================ */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Menu Principal</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Trophy className="w-4 h-4 text-[#00ff87]" />
          <span className="font-mono text-[#00ff87]/60">CRIAR CARREIRA</span>
        </div>
      </header>

      {/* ============================================================
          CONTEÚDO PRINCIPAL
      ============================================================ */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 md:px-10 pt-20 pb-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* ============================================================
              COLUNA ESQUERDA (3/5) - CARDS DE MODO
          ============================================================ */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              <span className="bg-gradient-to-r from-[#00ff87] to-[#00e5ff] bg-clip-text text-transparent">
                ESCOLHE O TEU CAMINHO
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Jogador */}
              <button
                type="button"
                onClick={() => setCareerMode('player')}
                className={`
                  group relative p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${careerMode === 'player'
                    ? 'border-[#00ff87] bg-[#00ff87]/10 shadow-[0_0_40px_rgba(0,255,135,0.15)]'
                    : 'border-dark-border/40 bg-dark-card/20 backdrop-blur-sm hover:border-[#00ff87]/50 hover:bg-dark-card/30'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff87]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`
                      p-4 rounded-xl
                      ${careerMode === 'player'
                        ? 'bg-[#00ff87]/20 text-[#00ff87]'
                        : 'bg-dark-card/50 text-gray-400 group-hover:text-[#00ff87]'
                      }
                    `}>
                      <Footprints className="w-10 h-10" />
                    </div>
                    {careerMode === 'player' && (
                      <CheckCircle className="w-7 h-7 text-[#00ff87] animate-in fade-in zoom-in" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mt-4 tracking-tight">
                    CARREIRA DE<br />
                    <span className="text-[#00ff87]">JOGADOR</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    Cria a tua lenda desde os Sub-15. Evolui, ganha títulos e torna-te uma lenda.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="text-xs bg-[#00ff87]/10 text-[#00ff87] px-3 py-1 rounded-full">15 anos</span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">Evolução</span>
                  </div>
                </div>
              </button>

              {/* Card Treinador */}
              <button
                type="button"
                onClick={() => setCareerMode('manager')}
                className={`
                  group relative p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${careerMode === 'manager'
                    ? 'border-[#00e5ff] bg-[#00e5ff]/10 shadow-[0_0_40px_rgba(0,229,255,0.15)]'
                    : 'border-dark-border/40 bg-dark-card/20 backdrop-blur-sm hover:border-[#00e5ff]/50 hover:bg-dark-card/30'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`
                      p-4 rounded-xl
                      ${careerMode === 'manager'
                        ? 'bg-[#00e5ff]/20 text-[#00e5ff]'
                        : 'bg-dark-card/50 text-gray-400 group-hover:text-[#00e5ff]'
                      }
                    `}>
                      <Shield className="w-10 h-10" />
                    </div>
                    {careerMode === 'manager' && (
                      <CheckCircle className="w-7 h-7 text-[#00e5ff] animate-in fade-in zoom-in" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mt-4 tracking-tight">
                    CARREIRA DE<br />
                    <span className="text-[#00e5ff]">TREINADOR</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    Assume o comando técnico do clube. Gerência táticas, mercado e balneário.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full">Gestão</span>
                    <span className="text-xs bg-gold-fc/10 text-gold-fc px-3 py-1 rounded-full">Táticas</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ============================================================
              COLUNA DIREITA (2/5) - CARTA DINÂMICA + FORMULÁRIO
          ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carta de Jogador (EA FC Style) */}
            <div className="relative bg-dark-card/60 backdrop-blur-xl border border-dark-border/40 rounded-3xl p-6 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff87]/5 via-transparent to-transparent" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ff87]/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 tracking-widest">CARTA DE JOGADOR</span>
                  <span className="text-xs font-mono text-[#00ff87]/60">#2026</span>
                </div>

                <div className={`
                  relative rounded-xl p-4 bg-gradient-to-br ${positionColors[position] || 'from-gray-600 to-gray-800'} shadow-lg
                  ${!playerName ? 'opacity-60' : ''}
                `}>
                  <div className="absolute inset-0 bg-black/20 rounded-xl" />
                  <div className="relative z-10 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black tracking-tight">
                        {typeof overall === 'number' ? overall : '??'}
                      </span>
                      <span className="text-2xl">{flagEmoji}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/70">
                        {position || 'POSIÇÃO'}
                      </div>
                      <div className="text-xl font-black uppercase tracking-tight leading-tight">
                        {playerName || 'NOME'}
                      </div>
                      <div className="text-sm font-semibold text-white/80">
                        {nationality || 'NACIONALIDADE'}
                      </div>
                    </div>
                    {/* Atributos simplificados (EA FC style) */}
                    <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                        <span>Ritmo</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 10) : '--'}</span>
                      </div>
                      <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                        <span>Remate</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 5) : '--'}</span>
                      </div>
                      <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                        <span>Passe</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 8) : '--'}</span>
                      </div>
                      <div className="flex justify-between bg-black/30 px-2 py-1 rounded">
                        <span>Defesa</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall - 5) : '--'}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      🔹 PROMESSA SUB-15
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-gold-fc fill-gold-fc/50" />
                    Potencial: {typeof overall === 'number' ? Math.min(99, overall + 20) : '--'}
                  </span>
                  <span>Football MP</span>
                </div>
              </div>
            </div>

            {/* Formulário de Dados do Jogador */}
            <div className="bg-dark-card/40 backdrop-blur-sm border border-dark-border/30 rounded-2xl p-6 shadow-lg">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Dados do Jogador
              </h4>

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                      placeholder="EX: JOÃO SILVA"
                      className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00ff87]/50 focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Nacionalidade */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Nacionalidade
                  </label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-[#00ff87]/50 focus:border-transparent transition-all"
                    >
                      {Object.keys(flagEmojis).map(n => (
                        <option key={n} value={n}>{flagEmojis[n]} {n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Posição (apenas para modo jogador) */}
                {careerMode === 'player' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Posição
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-[#00ff87]/50 focus:border-transparent transition-all"
                      >
                        {['Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botão Avançar */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !playerName.trim()}
                className={`
                  group flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300
                  ${!isLoading && playerName.trim()
                    ? 'bg-[#00ff87] text-black hover:brightness-110 hover:scale-[1.02] shadow-[0_0_40px_rgba(0,255,135,0.3)]'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
                ) : (
                  <>
                    Avançar para o Campo
                    <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
