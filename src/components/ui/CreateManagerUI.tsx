// src/components/ui/CreateManagerUI.tsx

'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Flag,
  Trophy,
  MapPin,
  Ruler,
  Weight,
  Shield,
  Users,
  CheckCircle,
  MoveRight,
  Calendar,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface CreateManagerUIProps {
  onBack: () => void;
  onSubmit: (data: ManagerCreationData) => void;
  isLoading?: boolean;
}

export interface ManagerCreationData {
  name: string;
  nationality: string;
  age: number;
  height: number;
  weight: number;
  license: string;
  favoriteTactic: string;
  favoriteClub: string;
  favoritePlayer: string;
  favoriteManager: string;
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

const licenseOptions = ['UEFA Pro', 'UEFA A', 'UEFA B', 'UEFA C', 'Nacional'];
const tacticOptions = ['Posse de Bola', 'Contra-Ataque', 'Pressão Alta', 'Defesa Organizada', 'Transições Rápidas', 'Jogo Direto'];
const clubOptions = ['Benfica', 'Porto', 'Sporting', 'Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal'];
const playerOptions = ['Cristiano Ronaldo', 'Lionel Messi', 'Erling Haaland', 'Kylian Mbappé', 'Kevin De Bruyne'];
const managerOptions = ['José Mourinho', 'Pep Guardiola', 'Jürgen Klopp', 'Carlo Ancelotti', 'Diego Simeone'];

export function CreateManagerUI({ onBack, onSubmit, isLoading = false }: CreateManagerUIProps) {
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('Portugal');
  const [age, setAge] = useState(35);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [license, setLicense] = useState('UEFA Pro');
  const [favoriteTactic, setFavoriteTactic] = useState('Posse de Bola');
  const [favoriteClub, setFavoriteClub] = useState('');
  const [favoritePlayer, setFavoritePlayer] = useState('');
  const [favoriteManager, setFavoriteManager] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Preenche todos os campos obrigatórios.');
      return;
    }
    onSubmit({
      name: name.trim(),
      nationality,
      age,
      height,
      weight,
      license,
      favoriteTactic,
      favoriteClub,
      favoritePlayer,
      favoriteManager,
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Voltar</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-white/60">CRIAR TREINADOR</span>
        </div>
      </header>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-8 pt-16 pb-12 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Assume o comando
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
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  >
                    {Object.keys(flagEmojis).map(n => (
                      <option key={n} value={n}>{flagEmojis[n]} {n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Idade</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
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
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Licença</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  >
                    {licenseOptions.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tática favorita</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={favoriteTactic}
                    onChange={(e) => setFavoriteTactic(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  >
                    {tacticOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clube favorito</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={favoriteClub}
                    onChange={(e) => setFavoriteClub(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={favoritePlayer}
                    onChange={(e) => setFavoritePlayer(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  >
                    <option value="">Selecionar</option>
                    {playerOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Treinador favorito</label>
                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={favoriteManager}
                    onChange={(e) => setFavoriteManager(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  >
                    <option value="">Selecionar</option>
                    {managerOptions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 bg-purple-500 text-black hover:bg-purple-400 shadow-lg shadow-purple-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
                ) : (
                  <>
                    ASSUMIR COMANDO <MoveRight className="w-4 h-4" />
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
