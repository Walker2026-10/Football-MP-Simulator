// src/components/ui/MainMenuUI.tsx

'use client';

import React from 'react';
import {
  Gamepad2,
  Play,
  Save,
  Settings,
  Info,
  Sparkles,
  Trophy,
  Users,
  Goal,
} from 'lucide-react';

interface MainMenuUIProps {
  onStartNewGame: () => void;
  onLoadGame: () => void;
  hasSavedGame: boolean;
}

export function MainMenuUI({
  onStartNewGame,
  onLoadGame,
  hasSavedGame,
}: MainMenuUIProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-dark-bg flex items-center justify-center p-4 md:p-8">
      {/* Background com gradientes e luzes */}
      <div className="absolute inset-0 z-0">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card/80 to-dark-bg" />

        {/* Glow verde (relvado) */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        {/* Glow azul */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

        {/* Padrão de linhas de campo (sutil) */}
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
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Glass card principal */}
        <div className="w-full max-w-2xl bg-dark-card/60 backdrop-blur-xl border border-dark-border/60 rounded-3xl shadow-2xl p-8 md:p-12 transition-all hover:shadow-emerald-500/5">
          {/* Cabeçalho com branding */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <Trophy className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-200 bg-clip-text text-transparent">
                FOOTBALL MP
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl font-light text-gray-300 mt-1">
              Simulator <span className="text-emerald-400 font-semibold">2026</span>
            </h2>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-xs font-mono text-gray-500 bg-dark-bg/50 px-3 py-1 rounded-full border border-dark-border/50">
                v1.0 Pro
              </span>
              <span className="text-xs font-mono text-gray-500 bg-dark-bg/50 px-3 py-1 rounded-full border border-dark-border/50">
                🏆 Carreira
              </span>
            </div>
          </div>

          {/* Slogan */}
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              SÊ A PRÓXIMA
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                LENDA DO FUTEBOL
              </span>
            </h3>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Gerência a tua carreira dentro e fora do campo — desde os Sub-15 até à glória eterna.
            </p>
          </div>

          {/* Botões principais */}
          <div className="space-y-4">
            {/* Nova Carreira */}
            <button
              onClick={onStartNewGame}
              className="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Play className="w-5 h-5 fill-current" />
              Nova Carreira
              <span className="text-xs font-normal opacity-70 ml-2 hidden sm:inline">
                (Sub-15 → Lenda)
              </span>
            </button>

            {/* Continuar / Carregar Jogo */}
            <button
              onClick={onLoadGame}
              disabled={!hasSavedGame}
              className={`
                w-full py-4 px-6 rounded-2xl border-2 font-semibold text-base flex items-center justify-center gap-3 transition-all duration-200
                ${hasSavedGame
                  ? 'border-emerald-500/30 text-white bg-dark-bg/50 hover:bg-dark-bg/70 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
                  : 'border-dark-border/50 text-gray-500 bg-dark-bg/30 cursor-not-allowed opacity-60'
                }
              `}
            >
              <Save className="w-5 h-5" />
              {hasSavedGame ? 'Continuar Carreira' : 'Nenhum jogo guardado'}
            </button>

            {/* Divisor com ícones decorativos */}
            <div className="relative flex items-center justify-center gap-4 my-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent" />
              <span className="text-xs text-gray-500 flex items-center gap-2">
                <Users className="w-3 h-3" />
                <Goal className="w-3 h-3" />
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent" />
            </div>

            {/* Botões secundários */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => alert('Configurações em desenvolvimento')}
                className="py-3 px-4 rounded-xl border border-dark-border/50 bg-dark-bg/30 text-gray-300 hover:bg-dark-bg/60 hover:border-dark-border transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Definições
              </button>
              <button
                onClick={() => alert('Créditos: Football MP Simulator 2026\nDesenvolvido com ❤️')}
                className="py-3 px-4 rounded-xl border border-dark-border/50 bg-dark-bg/30 text-gray-300 hover:bg-dark-bg/60 hover:border-dark-border transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Info className="w-4 h-4" />
                Créditos
              </button>
            </div>
          </div>

          {/* Rodapé com estatísticas ou informação extra */}
          <div className="mt-10 pt-6 border-t border-dark-border/40 text-center">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
              <span>⚡ Simulação avançada</span>
              <span>🎮 FC 26 + Football Manager</span>
              <span>🏟️ Gestão total</span>
            </div>
            <div className="mt-3 text-[10px] text-gray-600">
              © 2026 Football MP Simulator — Todos os direitos reservados.
            </div>
          </div>
        </div>

        {/* Versão flutuante (canto inferior direito) */}
        <div className="absolute bottom-4 right-4 text-[10px] text-gray-600/50 md:text-xs select-none">
          build v1.0.0 • Next.js 14
        </div>
      </div>
    </div>
  );
}
