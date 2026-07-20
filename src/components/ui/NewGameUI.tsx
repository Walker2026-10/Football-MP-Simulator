// src/components/ui/NewGameUI.tsx

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Users,
  Flag,
  Target,
  Play,
  CheckCircle,
  Trophy,
  Shield,
  Footprints,
  Star,
  MoveRight,
  Sparkles,
  Zap,
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

// ============================================================
// DADOS
// ============================================================

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

const positionColors: Record<string, string> = {
  'Guarda-Redes': 'from-yellow-400 to-yellow-600',
  'Defesa Central': 'from-blue-400 to-blue-600',
  Lateral: 'from-blue-300 to-blue-500',
  Médio: 'from-green-400 to-green-600',
  Extremo: 'from-purple-400 to-purple-600',
  Avançado: 'from-red-400 to-red-600',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function NewGameUI({ onBack, onStartCareer, isLoading = false }: NewGameUIProps) {
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('Médio');
  const [careerMode, setCareerMode] = useState<'player' | 'manager'>('player');
  const [nationality, setNationality] = useState('Portugal');
  const [isHoveringCard, setIsHoveringCard] = useState<string | null>(null);
  const [showCardGlow, setShowCardGlow] = useState(false);

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

  // Efeito de entrada
  useEffect(() => {
    setShowCardGlow(true);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark-bg select-none animate-in fade-in duration-700">

      {/* ============================================================
          FUNDO IMERSIVO (4K)
      ============================================================ */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card/90 to-red-900/30" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-3xl" />

      {/* Padrão de relvado HD */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-pitch" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <line x1="0" y1="0" x2="60" y2="60" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-pitch)" />
          <circle cx="50%" cy="50%" r="200" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>

      {/* Vinheta */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* ============================================================
          TOP BAR
      ============================================================ */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Menu Principal</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Trophy className="w-4 h-4 text-red-500" />
          <span className="font-mono text-red-400/70">CRIAR CARREIRA</span>
        </div>
      </header>

      {/* ============================================================
          CONTEÚDO PRINCIPAL
      ============================================================ */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-8 pt-16 pb-12">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">

          {/* ============================================================
              COLUNA ESQUERDA (CARDS)
          ============================================================ */}
          <div className="lg:col-span-3 space-y-5">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight animate-in slide-in-from-left duration-500">
              <span className="bg-gradient-to-r from-red-400 via-red-300 to-blue-400 bg-clip-text text-transparent">
                ESCOLHE O TEU CAMINHO
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card Jogador */}
              <button
                type="button"
                onClick={() => setCareerMode('player')}
                onMouseEnter={() => setIsHoveringCard('player')}
                onMouseLeave={() => setIsHoveringCard(null)}
                className={`
                  group relative p-6 md:p-8 rounded-2xl border-2 transition-all duration-500 text-left overflow-hidden
                  ${careerMode === 'player'
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_60px_rgba(239,68,68,0.2)] scale-[1.02]'
                    : 'border-dark-border/40 bg-dark-card/20 backdrop-blur-sm hover:border-red-400/50 hover:bg-dark-card/30 hover:scale-[1.02]'
                  }
                  ${isHoveringCard === 'player' ? 'scale-[1.03]' : ''}
                `}
              >
                {/* Glow animado */}
                <div className={`absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent transition-opacity duration-700 ${careerMode === 'player' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`
                      p-4 rounded-xl transition-all duration-500
                      ${careerMode === 'player'
                        ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20'
                        : 'bg-dark-card/50 text-gray-400 group-hover:text-red-400 group-hover:bg-red-500/10'
                      }
                    `}>
                      <Footprints className="w-10 h-10" />
                    </div>
                    {careerMode === 'player' && (
                      <CheckCircle className="w-7 h-7 text-red-400 animate-in zoom-in duration-300" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mt-4 tracking-tight">
                    CARREIRA DE<br />
                    <span className="text-red-400">JOGADOR</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    Cria a tua lenda desde os Sub-15. Evolui, ganha títulos e torna-te uma lenda.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full">15 anos</span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">Evolução</span>
                  </div>
                </div>
              </button>

              {/* Card Treinador */}
              <button
                type="button"
                onClick={() => setCareerMode('manager')}
                onMouseEnter={() => setIsHoveringCard('manager')}
                onMouseLeave={() => setIsHoveringCard(null)}
                className={`
                  group relative p-6 md:p-8 rounded-2xl border-2 transition-all duration-500 text-left overflow-hidden
                  ${careerMode === 'manager'
                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_60px_rgba(59,130,246,0.2)] scale-[1.02]'
                    : 'border-dark-border/40 bg-dark-card/20 backdrop-blur-sm hover:border-blue-400/50 hover:bg-dark-card/30 hover:scale-[1.02]'
                  }
                  ${isHoveringCard === 'manager' ? 'scale-[1.03]' : ''}
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent transition-opacity duration-700 ${careerMode === 'manager' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`
                      p-4 rounded-xl transition-all duration-500
                      ${careerMode === 'manager'
                        ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20'
                        : 'bg-dark-card/50 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10'
                      }
                    `}>
                      <Shield className="w-10 h-10" />
                    </div>
                    {careerMode === 'manager' && (
                      <CheckCircle className="w-7 h-7 text-blue-400 animate-in zoom-in duration-300" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mt-4 tracking-tight">
                    CARREIRA DE<br />
                    <span className="text-blue-400">TREINADOR</span>
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
              COLUNA DIREITA (CARTA + FORM)
          ============================================================ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Carta de Jogador com animação de brilho */}
            <div className={`relative bg-dark-card/60 backdrop-blur-xl border border-dark-border/40 rounded-3xl p-5 shadow-2xl shadow-black/40 transition-all duration-700 ${showCardGlow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent rounded-3xl" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/20 rounded-full blur-2xl animate-pulse" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 tracking-widest">CARTA DE JOGADOR</span>
                  <span className="text-xs font-mono text-red-400/60">#2026</span>
                </div>

                <div className={`
                  relative rounded-xl p-4 bg-gradient-to-br ${positionColors[position] || 'from-gray-600 to-gray-800'} shadow-lg
                  ${!playerName ? 'opacity-70' : 'opacity-100'}
                  transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl
                `}>
                  <div className="absolute inset-0 bg-black/30 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
                  <div className="relative z-10 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black tracking-tight drop-shadow-lg">
                        {typeof overall === 'number' ? overall : '??'}
                      </span>
                      <span className="text-2xl drop-shadow-md">{flagEmoji}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/70">
                        {position || 'POSIÇÃO'}
                      </div>
                      <div className="text-xl font-black uppercase tracking-tight leading-tight drop-shadow-md">
                        {playerName || 'NOME'}
                      </div>
                      <div className="text-sm font-semibold text-white/90">
                        {nationality || 'NACIONALIDADE'}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                        <span>Ritmo</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 10) : '--'}</span>
                      </div>
                      <div className="flex justify-between bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                        <span>Remate</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 5) : '--'}</span>
                      </div>
                      <div className="flex justify-between bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                        <span>Passe</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 8) : '--'}</span>
                      </div>
                      <div className="flex justify-between bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                        <span>Defesa</span>
                        <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall - 5) : '--'}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      PROMESSA SUB-15
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

            {/* Formulário com animação */}
            <div className={`bg-dark-card/40 backdrop-blur-sm border border-dark-border/30 rounded-2xl p-5 shadow-lg transition-all duration-700 delay-100 ${showCardGlow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3 text-red-400" />
                Dados do Jogador
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                      placeholder="EX: JOÃO SILVA"
                      className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nacionalidade</label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-transparent transition-all"
                    >
                      {Object.keys(flagEmojis).map(n => (
                        <option key={n} value={n}>{flagEmojis[n]} {n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {careerMode === 'player' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Posição</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-transparent transition-all"
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

            {/* Botão Avançar com ripple */}
            <div className={`flex justify-end transition-all duration-700 delay-200 ${showCardGlow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !playerName.trim()}
                className={`
                  group relative flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 overflow-hidden
                  ${!isLoading && playerName.trim()
                    ? 'bg-red-500 text-black hover:brightness-110 hover:scale-[1.03] shadow-[0_0_40px_rgba(239,68,68,0.4)]'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
                ) : (
                  <>
                    Avançar para o Campo
                    <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          FOOTER MINI
      ============================================================ */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-2 bg-gradient-to-t from-black/50 to-transparent">
        <div className="text-[10px] text-gray-500/50">
          <span>© 2026 Football MP Simulator</span>
        </div>
        <div className="text-[10px] text-gray-500/50 flex items-center gap-2">
          <span>Motor v2.1</span>
          <span className="w-1 h-1 rounded-full bg-dark-border" />
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>
      </footer>
    </div>
  );
}

export default NewGameUI;
