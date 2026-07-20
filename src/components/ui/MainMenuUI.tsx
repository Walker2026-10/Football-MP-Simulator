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
  ArrowRight,
  Circle,
  Zap,
  Clock,
  Star,
  Activity,
  Server,
  Monitor,
  ChevronRight,
  ShieldCheck,
  Crown,
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
    <div className="relative w-screen h-screen overflow-hidden bg-dark-bg select-none">
      {/* ============================================================
          FUNDO DINÂMICO (ECRÃ INTEIRO)
      ============================================================ */}

      {/* Gradiente base profundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card/90 to-dark-bg" />

      {/* Luzes de estádio (stadium floodlights) - desfocadas nos cantos superiores */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent" />

      {/* Padrão de relvado com linhas táticas (SVG inline) */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pitch" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="#ffffff" strokeWidth="0.3" opacity="0.15" />
              <line x1="40" y1="0" x2="0" y2="40" stroke="#ffffff" strokeWidth="0.3" opacity="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pitch)" />
          <rect width="100%" height="100%" fill="url(#lines)" />
          {/* Círculo central */}
          <circle cx="50%" cy="50%" r="150" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.15" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#ffffff" strokeWidth="0.8" opacity="0.1" />
        </svg>
      </div>

      {/* Gradiente de vinheta para dar profundidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent pointer-events-none" />

      {/* ============================================================
          TOP BAR
      ============================================================ */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-200 bg-clip-text text-transparent">
                FOOTBALL MP
              </span>
              <span className="text-white/60 font-light ml-1">26</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs md:text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300">
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ENGINE:</span>
            <span className="font-bold">ACTIVE</span>
            <Circle className="w-2 h-2 fill-emerald-400 animate-pulse" />
          </span>
          <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 font-mono text-[10px] tracking-wider">
            v1.0 PRO
          </span>
        </div>
      </header>

      {/* ============================================================
          CONTEÚDO PRINCIPAL (HERO LAYOUT)
      ============================================================ */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-12 pt-20 pb-16">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* ============================================================
              LADO ESQUERDO - BOTÕES (3 colunas)
          ============================================================ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Título de impacto */}
            <div className="space-y-1 mb-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span className="text-white">SÊ A</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400">
                  PRÓXIMA LENDA
                </span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base max-w-md">
                Da formação aos holofotes — cada jornada começa aqui.
              </p>
            </div>

            {/* Botão principal - NOVA CARREIRA */}
            <button
              onClick={onStartNewGame}
              className="group relative w-full max-w-md flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xl md:text-2xl uppercase tracking-wider shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/60 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/40 shadow-lg" />
              <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              Nova Carreira
              <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Botões secundários */}
            <div className="space-y-3 max-w-md">
              <button
                onClick={onLoadGame}
                disabled={!hasSavedGame}
                className={`
                  w-full flex items-center gap-4 px-6 py-3.5 rounded-xl border transition-all duration-300
                  ${hasSavedGame
                    ? 'border-dark-border/40 bg-dark-card/30 backdrop-blur-sm text-white hover:border-emerald-400/50 hover:bg-dark-card/50 hover:shadow-lg hover:shadow-emerald-500/5'
                    : 'border-dark-border/20 bg-dark-card/10 text-gray-500 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <Save className="w-5 h-5" />
                <span className="font-medium text-base">
                  {hasSavedGame ? 'Continuar Carreira' : 'Nenhum jogo guardado'}
                </span>
                {hasSavedGame && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
              </button>

              <button
                onClick={() => alert('Definições em desenvolvimento')}
                className="w-full flex items-center gap-4 px-6 py-3 rounded-xl border border-dark-border/20 bg-dark-card/10 backdrop-blur-sm text-gray-300 hover:border-emerald-400/30 hover:bg-dark-card/30 transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium text-base">Definições</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
              </button>

              <button
                onClick={() => alert('Créditos: Football MP Simulator 2026\nDesenvolvido com ❤️')}
                className="w-full flex items-center gap-4 px-6 py-3 rounded-xl border border-dark-border/20 bg-dark-card/10 backdrop-blur-sm text-gray-300 hover:border-emerald-400/30 hover:bg-dark-card/30 transition-all duration-300"
              >
                <Info className="w-5 h-5" />
                <span className="font-medium text-base">Estatísticas & Créditos</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
              </button>
            </div>
          </div>

          {/* ============================================================
              LADO DIREITO - PAINEL DE DESTAQUES (2 colunas)
          ============================================================ */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-dark-card/30 backdrop-blur-xl border border-dark-border/40 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Destaques do Simulador
                </h3>
              </div>

              <div className="space-y-4">
                {/* Item 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-bg/40 border border-dark-border/20 hover:border-emerald-400/20 transition-all">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Carreira Sub-15 → Profissional</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Evolução realista com atributos FC 26</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-bg/40 border border-dark-border/20 hover:border-emerald-400/20 transition-all">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Transferências em Tempo Real</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Mercado dinâmico com IA e scouting</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-bg/40 border border-dark-border/20 hover:border-emerald-400/20 transition-all">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Vida Pessoal & Patrocínios</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Estilo de vida, relacionamentos e marcas</p>
                  </div>
                </div>

                {/* Estatísticas do motor */}
                <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-emerald-500/10">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Motor de Jogo v2.1
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Simulação diária
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-gold-fc" />
                      20+ Ligas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge extra - "Pronto para Jogar" */}
            <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Sistema operacional
              </span>
              <span className="w-1 h-1 rounded-full bg-dark-border" />
              <span>Next.js 14 • Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          FOOTER BAR - Atalhos de teclado (estilo consola)
      ============================================================ */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-6 text-xs text-gray-400/70 font-mono">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">ENTER</kbd>
            <span>Confirmar</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">ESC</kbd>
            <span>Sair</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">↑↓</kbd>
            <span>Navegar</span>
          </span>
        </div>
        <div className="text-[10px] text-gray-500/50">
          <span>© 2026 Football MP Simulator</span>
        </div>
      </footer>
    </div>
  );
}
