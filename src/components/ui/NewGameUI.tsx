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
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Fundo com gradiente preto/dourado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-950/30" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/90 to-transparent">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Menu Principal</span>
        </button>
        <div className="flex items-center gap-2 text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-yellow-400/70">NOVA CARREIRA</span>
        </div>
      </header>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 md:px-8 pt-16 pb-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ESCOLHE O TEU CAMINHO
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-10">
            Define o teu papel no mundo do futebol
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <button
              onClick={() => onSelectMode('player')}
              className="group relative p-8 rounded-2xl border border-amber-500/20 bg-white/5 backdrop-blur-sm hover:border-amber-400 hover:bg-amber-500/10 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all">
                  <Footprints className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white">JOGADOR</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Cria a tua lenda desde os Sub-15. Evolui, ganha títulos e torna-te uma lenda.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">15 anos</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">Evolução</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectMode('manager')}
              className="group relative p-8 rounded-2xl border border-amber-500/20 bg-white/5 backdrop-blur-sm hover:border-amber-400 hover:bg-amber-500/10 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all">
                  <Shield className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white">TREINADOR</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Assume o comando técnico. Gerência táticas, mercado e balneário.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">Gestão</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">Táticas</span>
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
