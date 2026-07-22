// src/components/ui/CreatePlayerUI.tsx

'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Flag,
  Target,
  Trophy,
  MapPin,
  Ruler,
  Weight,
  Footprints,
  Star,
  Shield,
  Users,
  MoveRight,
} from 'lucide-react';

interface CreatePlayerUIProps {
  onBack: () => void;
  onSubmit: (data: PlayerCreationData) => void;
  isLoading?: boolean;
}

export interface PlayerCreationData {
  name: string;
  nationality: string;
  city: string;
  position: string;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right' | 'both';
  topAttributes: string[];
  favoriteClub: string;
  favoritePlayer: string;
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

const positionOptions = ['Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'];
const attributeOptions = ['Ritmo', 'Remate', 'Passe', 'Drible', 'Defesa', 'Físico'];
const clubOptions = ['Benfica', 'Porto', 'Sporting', 'Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal'];
const playerOptions = ['Cristiano Ronaldo', 'Lionel Messi', 'Erling Haaland', 'Kylian Mbappé', 'Kevin De Bruyne', 'Bukayo Saka'];

export function CreatePlayerUI({ onBack, onSubmit, isLoading = false }: CreatePlayerUIProps) {
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('Portugal');
  const [city, setCity] = useState('');
  const [position, setPosition] = useState('Médio');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [preferredFoot, setPreferredFoot] = useState<'left' | 'right' | 'both'>('right');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [favoriteClub, setFavoriteClub] = useState('');
  const [favoritePlayer, setFavoritePlayer] = useState('');

  const handleAttributeToggle = (attr: string) => {
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter(a => a !== attr));
    } else if (selectedAttributes.length < 3) {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedAttributes.length !== 3) {
      alert('Preenche todos os campos e escolhe 3 atributos principais.');
      return;
    }
    onSubmit({
      name: name.trim(),
      nationality,
      city: city.trim(),
      position,
      height,
      weight,
      preferredFoot,
      topAttributes: selectedAttributes,
      favoriteClub,
      favoritePlayer,
    });
  };

  const flagEmoji = flagEmojis[nationality] || '🌍';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-950/30" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={onBack} className="group flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Voltar</span>
        </button>
        <div className="flex items-center gap-2 text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-yellow-400/70">CRIAR JOGADOR</span>
        </div>
      </header>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-8 pt-16 pb-12 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6 text-center">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Cria a tua lenda
            </span>
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    placeholder="NOME COMPLETO"
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    required
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
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    {Object.keys(flagEmojis).map(n => (
                      <option key={n} value={n}>{flagEmojis[n]} {n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cidade de Nascimento</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value.toUpperCase())}
                    placeholder="CIDADE"
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Posição</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    {positionOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Altura (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Peso (kg)</label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pé dominante</label>
                <div className="flex gap-3 mt-1">
                  {['left', 'right', 'both'].map((foot) => (
                    <button
                      key={foot}
                      type="button"
                      onClick={() => setPreferredFoot(foot as any)}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all ${
                        preferredFoot === foot
                          ? 'border-amber-400 bg-amber-500/20 text-white'
                          : 'border-amber-500/20 bg-black/30 text-gray-400 hover:border-amber-400/50'
                      }`}
                    >
                      {foot === 'left' ? '👈 Esquerdo' : foot === 'right' ? '👉 Direito' : '🔄 Ambidestro'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">3 Atributos principais</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {attributeOptions.map(attr => (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => handleAttributeToggle(attr)}
                      className={`py-2 rounded-xl border-2 transition-all text-sm font-bold ${
                        selectedAttributes.includes(attr)
                          ? 'border-amber-400 bg-amber-500/20 text-white'
                          : 'border-amber-500/20 bg-black/30 text-gray-400 hover:border-amber-400/50'
                      }`}
                    >
                      {attr}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {selectedAttributes.length}/3 selecionados
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clube favorito</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={favoriteClub}
                    onChange={(e) => setFavoriteClub(e.target.value)}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <option value="">Selecionar</option>
                    {clubOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jogador favorito</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={favoritePlayer}
                    onChange={(e) => setFavoritePlayer(e.target.value)}
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <option value="">Selecionar</option>
                    {playerOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:brightness-110 shadow-lg shadow-amber-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
                ) : (
                  <>
                    CRIAR LENDA <MoveRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
              }
