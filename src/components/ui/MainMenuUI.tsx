// src/components/ui/MainMenuUI.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Save,
  Settings,
  Info,
  Trophy,
  ArrowRight,
  Circle,
  LogIn,
  UserPlus,
  User,
  Lock,
  Mail,
  LogOut,
  X,
  ChevronRight,
  Gamepad2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Newspaper,
  Heart,
  Github,
  Twitter,
  Youtube,
  Sparkles,
  Zap,
  Clock,
  Star,
  Activity,
} from 'lucide-react';

// ============================================================
// INTERFACE
// ============================================================

export interface MainMenuUIProps {
  onStartNewGame: () => void;
  onLoadGame: () => void;
  hasSavedGame: boolean;
}

// ============================================================
// DADOS MOCK PARA NEWS
// ============================================================

const newsItems = [
  {
    id: 1,
    title: '⚡ Nova atualização do motor de simulação',
    excerpt: 'O motor de jogo foi otimizado para simulações mais realistas minuto a minuto.',
    category: 'Atualização',
    time: '2h',
  },
  {
    id: 2,
    title: '🏆 Liga dos Campeões 2026: começa a fase de grupos',
    excerpt: 'Os melhores clubes europeus preparam-se para a maior competição de clubes do mundo.',
    category: 'Competição',
    time: '5h',
  },
  {
    id: 3,
    title: '📊 Transferências de verão: mercado aquece',
    excerpt: 'Os clubes já começaram a movimentar-se no mercado com contratações milionárias.',
    category: 'Mercado',
    time: '8h',
  },
  {
    id: 4,
    title: '🌟 Jovem promessa de 15 anos faz estreia histórica',
    excerpt: 'Um jogador de 15 anos torna-se o mais jovem a marcar num jogo profissional.',
    category: 'Destaque',
    time: '12h',
  },
  {
    id: 5,
    title: '📰 Mudanças no formato da Liga Nacional',
    excerpt: 'A liga nacional anuncia novo formato com mais equipas e mais emoção.',
    category: 'Notícia',
    time: '1d',
  },
];

// ============================================================
// COMPONENTE: MODAL DE AUTENTICAÇÃO (com persistência)
// ============================================================

function AuthModal({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }: any) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsLoading(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);

  // Verificar se há utilizadores guardados no localStorage
  useEffect(() => {
    if (isOpen && activeTab === 'login') {
      const users = JSON.parse(localStorage.getItem('football_mp_users') || '{}');
      if (Object.keys(users).length === 0) {
        // Se não houver utilizadores, sugerir registo
        setError('Nenhuma conta encontrada. Cria uma conta primeiro.');
      }
    }
  }, [isOpen, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('football_mp_users') || '{}');
        const user = users[username];
        if (!user) {
          setError('Utilizador não encontrado. Cria uma conta primeiro.');
          setIsLoading(false);
          return;
        }
        if (user.password !== password) {
          setError('Palavra-passe incorreta.');
          setIsLoading(false);
          return;
        }
        // Guardar sessão
        localStorage.setItem('football_mp_session', JSON.stringify({ username, loggedInAt: new Date().toISOString() }));
        onLoginSuccess(username);
        onClose();
      } catch (err) {
        setError('Erro ao iniciar sessão.');
      } finally {
        setIsLoading(false);
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError('Todos os campos são obrigatórios.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As palavras-passe não coincidem.');
          setIsLoading(false);
          return;
        }
        if (password.length < 4) {
          setError('A palavra-passe deve ter pelo menos 4 caracteres.');
          setIsLoading(false);
          return;
        }
        const users = JSON.parse(localStorage.getItem('football_mp_users') || '{}');
        if (users[username]) {
          setError('Nome de utilizador já existe.');
          setIsLoading(false);
          return;
        }
        users[username] = { email, password, createdAt: new Date().toISOString() };
        localStorage.setItem('football_mp_users', JSON.stringify(users));
        // Iniciar sessão automaticamente após registo
        localStorage.setItem('football_mp_session', JSON.stringify({ username, loggedInAt: new Date().toISOString() }));
        onRegisterSuccess(username);
        onClose();
      } catch (err) {
        setError('Erro ao criar conta.');
      } finally {
        setIsLoading(false);
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md bg-black border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white/60 uppercase tracking-wider">
              {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex border-b border-amber-500/20 mx-6 mt-4">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'login'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sessão
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'register'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {error}
            </div>
          )}
          <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome de Utilizador</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  placeholder="EX: JOGADORPRO"
                  className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    placeholder="EX: JOGADOR@EMAIL.COM"
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-12 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <X className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmar Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                !isLoading
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:brightness-110 shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
              ) : (
                <>{activeTab === 'login' ? 'Entrar' : 'Criar Conta'}</>
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-[10px] text-gray-500">
            {activeTab === 'login' ? (
              <>
                Não tens conta?{' '}
                <button onClick={() => setActiveTab('register')} className="text-amber-400 hover:underline font-bold">
                  Criar Conta
                </button>
              </>
            ) : (
              <>
                Já tens conta?{' '}
                <button onClick={() => setActiveTab('login')} className="text-amber-400 hover:underline font-bold">
                  Iniciar Sessão
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function MainMenuUI({ onStartNewGame, onLoadGame, hasSavedGame }: MainMenuUIProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(100);
  const [quality, setQuality] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);

  // Verificar sessão ao montar
  useEffect(() => {
    const session = localStorage.getItem('football_mp_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        if (data.username) {
          setIsLoggedIn(true);
          setCurrentUser(data.username);
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Rotação de notícias
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleRegisterSuccess = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('football_mp_session');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleStartNewGame = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    onStartNewGame();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">

      {/* ============================================================
          FUNDO PREMIUM
      ============================================================ */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-950/20" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      {/* ============================================================
          TOP BAR
      ============================================================ */}
      <header className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 md:px-8 py-3 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-6 h-6 text-black" strokeWidth={2} />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-black text-white tracking-tight">
              FOOTBALL MP <span className="text-amber-400">26</span>
            </span>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Simulador de Carreira</div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-sm">
          {/* Botões de ação rápida */}
          <button
            onClick={() => setShowNews(!showNews)}
            className="p-2 rounded-lg hover:bg-white/5 transition text-gray-400 hover:text-amber-400 relative"
            title="Notícias"
          >
            <Newspaper className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-white/5 transition text-gray-400 hover:text-amber-400"
            title="Definições"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-white/5 transition text-gray-400 hover:text-amber-400"
            title={isFullscreen ? 'Sair do ecrã inteiro' : 'Ecrã inteiro'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg hover:bg-white/5 transition text-gray-400 hover:text-amber-400"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Autenticação */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-amber-500/20 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-bold text-xs">
                {currentUser?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-white hidden sm:inline">@{currentUser}</span>
              <button
                onClick={handleLogout}
                className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400"
                title="Terminar Sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-medium">Entrar</span>
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 hover:bg-amber-500/30 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-medium">Criar Conta</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ============================================================
          CONTEÚDO CENTRAL
      ============================================================ */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 md:px-8 pt-16 pb-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                PRÓXIMA LENDA
              </span>
            </h1>
            <p className="text-gray-400 text-lg mt-2 max-w-2xl mx-auto">
              Da formação aos holofotes — cada jornada começa aqui.
            </p>
            <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-amber-400" /> Motor v2.1</span>
              <span>20+ Ligas</span>
              <span>12.4K Jogadores</span>
            </div>
          </div>

          {/* Menu principal */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <button
              onClick={handleStartNewGame}
              className="group w-full flex items-center justify-center gap-4 px-8 py-5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-black text-xl rounded-2xl shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Gamepad2 className="w-6 h-6" />
              Nova Carreira
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={onLoadGame}
              disabled={!hasSavedGame}
              className={`w-full flex items-center justify-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl font-semibold text-white transition-all duration-300 ${
                hasSavedGame ? 'hover:bg-white/10 hover:scale-[1.02]' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              {hasSavedGame ? 'Continuar Carreira' : 'Nenhum jogo guardado'}
              {hasSavedGame && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition text-sm"
              >
                <Settings className="w-4 h-4" />
                Definições
              </button>
              <button
                onClick={() => setShowCredits(!showCredits)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition text-sm"
              >
                <Info className="w-4 h-4" />
                Créditos
              </button>
              <button
                onClick={() => window.open('https://github.com/sponsors', '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-500/30 rounded-xl text-amber-400 hover:bg-amber-500/20 transition text-sm"
              >
                <Heart className="w-4 h-4 fill-amber-400" />
                Donate
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-[10px] text-white/20 flex items-center justify-center gap-4">
            <span>© 2026 Football MP Simulator</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>v1.0</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MODAL: DEFINIÇÕES
      ============================================================ */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-black border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-500/10 p-6">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" /> Definições
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <span className="text-xs text-gray-400">{volume}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Brilho</label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <span className="text-xs text-gray-400">{brightness}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Qualidade</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl hover:brightness-110 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: CRÉDITOS
      ============================================================ */}
      {showCredits && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-black border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-500/10 p-6">
            <button
              onClick={() => setShowCredits(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Créditos
            </h3>
            <div className="space-y-3 text-gray-300">
              <p className="text-sm">
                <span className="text-amber-400 font-bold">Football MP Simulator 2026</span>
              </p>
              <p className="text-sm">
                Desenvolvido com ❤️ por uma equipa apaixonada por futebol e simulação.
              </p>
              <div className="flex gap-4 mt-2">
                <a href="#" className="text-amber-400 hover:text-amber-300 transition">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-amber-400 hover:text-amber-300 transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-amber-400 hover:text-amber-300 transition">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
              <div className="text-[10px] text-gray-500 mt-2">
                Motor de Jogo v2.1 • Next.js 14 • Tailwind CSS
              </div>
              <button
                onClick={() => setShowCredits(false)}
                className="w-full mt-2 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl hover:brightness-110 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: NOTÍCIAS
      ============================================================ */}
      {showNews && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-black border border-amber-500/20 rounded-2xl shadow-2xl shadow-amber-500/10 p-6">
            <button
              onClick={() => setShowNews(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-400" /> Notícias
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {newsItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/30 transition"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400 font-bold uppercase">{item.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{item.time}</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm mt-0.5">{item.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.excerpt}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowNews(false)}
              className="w-full mt-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl hover:brightness-110 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: AUTENTICAÇÃO
      ============================================================ */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
