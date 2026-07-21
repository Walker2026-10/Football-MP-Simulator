// src/components/ui/NewGameUI.tsx

'use client';

import React from 'react';
import { ArrowLeft, Footprints, Shield, Trophy } from 'lucide-react';

interface NewGameUIProps {
  onBack: () => void;
  onSelectMode: (mode: 'player' | 'manager') => void;
}

export function NewGameUI({ onBack, onSelectMode }: NewGameUIProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none">
      {/* Fundo com gradiente estilo FIFA 14 */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Menu Principal</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Trophy className="w-4 h-4 text-blue-400" />
          <span className="font-mono text-white/60">NOVA CARREIRA</span>
        </div>
      </header>

      {/* Conteúdo central */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 md:px-8 pt-16 pb-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              ESCOLHE O TEU CAMINHO
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10">
            Define o teu papel no mundo do futebol
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Card Jogador */}
            <button
              onClick={() => onSelectMode('player')}
              className="group relative p-8 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                  <Footprints className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white">JOGADOR</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Cria a tua lenda desde os Sub-15. Evolui, ganha títulos e torna-te uma lenda.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">15 anos</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">Evolução</span>
                </div>
              </div>
            </button>

            {/* Card Treinador */}
            <button
              onClick={() => onSelectMode('manager')}
              className="group relative p-8 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
                  <Shield className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white">TREINADOR</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Assume o comando técnico. Gerência táticas, mercado e balneário.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Gestão</span>
                  <span className="text-xs bg-gold-fc/20 text-gold-fc px-3 py-1 rounded-full">Táticas</span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-[10px] text-white/20">© 2026 Football MP Simulator</div>
        </div>
      </div>
    </div>
  );
}
