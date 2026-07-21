// src/components/ui/NewGameUI.tsx

'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  Flag,
  Target,
  CheckCircle,
  Trophy,
  Shield,
  Footprints,
  Star,
  MoveRight,
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

export function NewGameUI({ onBack, onStartCareer, isLoading = false }: NewGameUIProps) {
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('Médio');
  const [careerMode, setCareerMode] = useState<'player' | 'manager'>('player');
  const [nationality, setNationality] = useState('Portugal');

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
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Menu Principal</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Trophy className="w-4 h-4 text-blue-400" />
          <span className="font-mono text-white/60">CRIAR CARREIRA</span>
        </div>
      </header>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-8 pt-16 pb-12">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                ESCOLHE O TEU CAMINHO
              </span>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => setCareerMode('player')}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  careerMode === 'player'
                    ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                    : 'border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${careerMode === 'player' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
                    <Footprints className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">CARREIRA DE JOGADOR</h3>
                    <p className="text-sm text-gray-400">Cria a tua lenda desde os Sub-15. Evolui e torna-te uma lenda.</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-0.5 rounded-full">15 anos</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full">Evolução</span>
                    </div>
                  </div>
                  {careerMode === 'player' && <CheckCircle className="w-6 h-6 text-blue-400 ml-auto" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCareerMode('manager')}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  careerMode === 'manager'
                    ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${careerMode === 'manager' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">CARREIRA DE TREINADOR</h3>
                    <p className="text-sm text-gray-400">Assume o comando técnico. Gerência táticas, mercado e balneário.</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-0.5 rounded-full">Gestão</span>
                      <span className="text-xs bg-gold-fc/20 text-gold-fc px-3 py-0.5 rounded-full">Táticas</span>
                    </div>
                  </div>
                  {careerMode === 'manager' && <CheckCircle className="w-6 h-6 text-purple-400 ml-auto" />}
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CARTA DE JOGADOR</span>
                <span className="text-xs font-mono text-gray-500">#2026</span>
              </div>
              <div className={`relative rounded-xl p-4 bg-gradient-to-br ${positionColors[position] || 'from-gray-600 to-gray-800'} shadow-lg ${!playerName ? 'opacity-70' : ''}`}>
                <div className="absolute inset-0 bg-black/30 rounded-xl" />
                <div className="absolute top-0 right-0 p-1">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="relative z-10 text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-4xl font-black">{typeof overall === 'number' ? overall : '??'}</span>
                    <span className="text-2xl">{flagEmoji}</span>
                  </div>
                  <div className="mt-1">
                    <div className="text-xs font-bold uppercase text-white/70">{position}</div>
                    <div className="text-xl font-black uppercase leading-tight">{playerName || 'NOME'}</div>
                    <div className="text-sm font-semibold text-white/80">{nationality}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                    <div className="bg-black/40 px-2 py-0.5 rounded flex justify-between">
                      <span>Ritmo</span>
                      <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 10) : '--'}</span>
                    </div>
                    <div className="bg-black/40 px-2 py-0.5 rounded flex justify-between">
                      <span>Remate</span>
                      <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 5) : '--'}</span>
                    </div>
                    <div className="bg-black/40 px-2 py-0.5 rounded flex justify-between">
                      <span>Passe</span>
                      <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall + 8) : '--'}</span>
                    </div>
                    <div className="bg-black/40 px-2 py-0.5 rounded flex justify-between">
                      <span>Defesa</span>
                      <span className="font-bold">{typeof overall === 'number' ? Math.min(99, overall - 5) : '--'}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-white/50">
                    <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                    Potencial: {typeof overall === 'number' ? Math.min(99, overall + 20) : '--'}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                    placeholder="EX: JOÃO SILVA"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nacionalidade</label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
                  >
                    {Object.keys(flagEmojis).map((n) => (
                      <option key={n} value={n}>
                        {flagEmojis[n]} {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {careerMode === 'player' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Posição</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
                    >
                      {['Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !playerName.trim()}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                  !isLoading && playerName.trim()
                    ? 'bg-blue-500 text-black hover:bg-blue-400 shadow-lg shadow-blue-500/30 hover:scale-[1.02]'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
                ) : (
                  <>
                    Avançar <MoveRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
