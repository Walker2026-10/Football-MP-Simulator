// src/components/ui/MainMenuUI.tsx

'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Save,
  Settings,
  Info,
  Sparkles,
  Trophy,
  Users,
  ArrowRight,
  Circle,
  Zap,
  Clock,
  Star,
  Activity,
  Server,
  ChevronRight,
  ShieldCheck,
  Crown,
  LogIn,
  UserPlus,
  User,
  Lock,
  Mail,
  LogOut,
  X,
  TrendingUp,
  Calendar,
  Award,
  Globe,
  Footprints,
  Flame,
  Medal,
  BarChart3,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Github,
  Twitter,
  Youtube,
  Twitch,
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  onRegisterSuccess: (username: string) => void;
}

interface WeatherOption {
  label: string;
  icon: string;
  gradient: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  time: string;
  icon: React.ReactNode;
}

// ============================================================
// DADOS MOCK
// ============================================================

const weatherOptions: WeatherOption[] = [
  { label: '☀️ Ensolarado', icon: '☀️', gradient: 'from-yellow-400/20 to-orange-400/20' },
  { label: '⛅ Nublado', icon: '⛅', gradient: 'from-gray-400/20 to-blue-400/20' },
  { label: '🌧️ Chuvoso', icon: '🌧️', gradient: 'from-blue-400/20 to-indigo-400/20' },
  { label: '🌙 Noite', icon: '🌙', gradient: 'from-indigo-400/20 to-purple-400/20' },
];

const newsFeed: NewsItem[] = [
  { id: '1', title: '⚡ Nova atualização do motor de simulação', excerpt: 'O motor de jogo foi otimizado para simulações mais realistas minuto a minuto.', category: 'Atualização', time: '2h', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
  { id: '2', title: '🏆 Liga dos Campeões 2026: começa a fase de grupos', excerpt: 'Os melhores clubes europeus preparam-se para a maior competição de clubes do mundo.', category: 'Competição', time: '5h', icon: <Trophy className="w-4 h-4 text-gold-fc" /> },
  { id: '3', title: '📊 Transferências de verão: mercado aquece', excerpt: 'Os clubes já começaram a movimentar-se no mercado de transferências com contratações milionárias.', category: 'Mercado', time: '8h', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
  { id: '4', title: '🌟 Jovem promessa de 15 anos faz estreia histórica', excerpt: 'Um jogador de 15 anos torna-se o mais jovem a marcar num jogo profissional.', category: 'Destaque', time: '12h', icon: <Star className="w-4 h-4 text-gold-fc" /> },
  { id: '5', title: '📰 Mudanças no formato da Liga Nacional', excerpt: 'A liga nacional anuncia novo formato com mais equipas e mais emoção.', category: 'Notícia', time: '1d', icon: <Globe className="w-4 h-4 text-blue-400" /> },
];

// ============================================================
// COMPONENTE: PARTÍCULAS (estádio)
// ============================================================

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }>>([]);
  const animationFrame = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 20000));
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animationFrame.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-5" />;
};

// ============================================================
// COMPONENTE: RELÓGIO E CLIMA
// ============================================================

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  const [weatherIndex, setWeatherIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    const weatherInterval = setInterval(() => {
      setWeatherIndex((prev) => (prev + 1) % weatherOptions.length);
    }, 30000);
    return () => {
      clearInterval(interval);
      clearInterval(weatherInterval);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
      <span className="font-mono font-bold text-emerald-400">{formattedTime}</span>
      <span className="text-gray-500">|</span>
      <span className="text-gray-400">{formattedDate}</span>
      <span className="text-gray-500">|</span>
      <span className="flex items-center gap-1">
        <span>{weatherOptions[weatherIndex].icon}</span>
        <span className="text-gray-400">{weatherOptions[weatherIndex].label}</span>
      </span>
    </div>
  );
};

// ============================================================
// COMPONENTE: MODAL DE AUTENTICAÇÃO
// ============================================================

function AuthModal({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }: AuthModalProps) {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('football_mp_users') || '{}');
        const user = users[username];
        if (!user) { setError('Utilizador não encontrado.'); setIsLoading(false); return; }
        if (user.password !== password) { setError('Palavra-passe incorreta.'); setIsLoading(false); return; }
        localStorage.setItem('football_mp_session', JSON.stringify({ username }));
        onLoginSuccess(username);
        onClose();
      } catch (err) { setError('Erro ao iniciar sessão.'); } finally { setIsLoading(false); }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        if (!username.trim() || !email.trim() || !password.trim()) { setError('Todos os campos são obrigatórios.'); setIsLoading(false); return; }
        if (password !== confirmPassword) { setError('As palavras-passe não coincidem.'); setIsLoading(false); return; }
        if (password.length < 4) { setError('A palavra-passe deve ter pelo menos 4 caracteres.'); setIsLoading(false); return; }
        const users = JSON.parse(localStorage.getItem('football_mp_users') || '{}');
        if (users[username]) { setError('Nome de utilizador já existe.'); setIsLoading(false); return; }
        users[username] = { email, password, createdAt: new Date().toISOString() };
        localStorage.setItem('football_mp_users', JSON.stringify(users));
        localStorage.setItem('football_mp_session', JSON.stringify({ username }));
        onRegisterSuccess(username);
        onClose();
      } catch (err) { setError('Erro ao criar conta.'); } finally { setIsLoading(false); }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md bg-dark-card/80 backdrop-blur-xl border border-dark-border/60 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-400" />
            <span className="text-sm font-bold text-white/60 uppercase tracking-wider">
              {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex border-b border-dark-border/40 mx-6 mt-4">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'login' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}
          >
            Iniciar Sessão
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'register' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}
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
                  className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
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
                    className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
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
                  className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-12 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
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
                    className="w-full bg-dark-bg/70 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${!isLoading ? 'bg-red-500 text-black hover:brightness-110 hover:scale-[1.02] shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
              ) : (
                <>
                  {activeTab === 'login' ? 'Entrar no Campo' : 'Criar Conta de Jogador'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-[10px] text-gray-500">
            {activeTab === 'login' ? (
              <>
                Não tens conta?{' '}
                <button onClick={() => setActiveTab('register')} className="text-red-400 hover:underline font-bold">
                  Criar Conta
                </button>
              </>
            ) : (
              <>
                Já tens conta?{' '}
                <button onClick={() => setActiveTab('login')} className="text-red-400 hover:underline font-bold">
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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(100);
  const [quality, setQuality] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [weather, setWeather] = useState<'day' | 'night' | 'rain'>('day');
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'maintenance'>('online');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Efeito de loading simulado
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Rotação de notícias
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % newsFeed.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSettingsToggle = () => setIsSettingsVisible(!isSettingsVisible);
  const handleStatsToggle = () => setIsStatsVisible(!isStatsVisible);

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark-bg select-none" style={{ filter: `brightness(${brightness}%)` }}>

      {/* ============================================================
          FUNDO DINÂMICO 4K
      ============================================================ */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card/90 to-red-900/20" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-red-500/5 via-transparent to-transparent" />

      {/* Padrão de relvado HD */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pitch" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
            </pattern>
            <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
              <line x1="40" y1="0" x2="0" y2="40" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pitch)" />
          <rect width="100%" height="100%" fill="url(#lines)" />
          <circle cx="50%" cy="50%" r="150" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#ffffff" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>

      {/* Partículas */}
      <ParticleField />

      {/* Gradiente de vinheta */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent pointer-events-none" />

      {/* ============================================================
          TOP BAR (com interação)
      ============================================================ */}
      <header className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 md:px-8 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 md:w-8 md:h-8 text-red-500" strokeWidth={1.5} />
            <span className="text-xl md:text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-red-400 via-red-300 to-blue-400 bg-clip-text text-transparent">FOOTBALL MP</span>
              <span className="text-white/60 font-light ml-1">26</span>
            </span>
          </div>
          {/* Badge de estado do servidor com interação */}
          <button
            onClick={() => setServerStatus(prev => prev === 'online' ? 'maintenance' : prev === 'maintenance' ? 'offline' : 'online')}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono transition-all hover:scale-105"
            style={{
              background: serverStatus === 'online' ? 'rgba(34,197,94,0.15)' : serverStatus === 'maintenance' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
              borderColor: serverStatus === 'online' ? 'rgba(34,197,94,0.3)' : serverStatus === 'maintenance' ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.3)',
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-green-400' : serverStatus === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'}`} />
            <span className="uppercase tracking-wider">{serverStatus}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-xs">
          <LiveClock />

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
            title={isFullscreen ? 'Sair do ecrã inteiro' : 'Ecrã inteiro'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                {currentUser?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-white hidden sm:inline">@{currentUser}</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase hidden sm:inline">• Online</span>
              <button onClick={handleLogout} className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-1 md:gap-2">
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:border-red-400/50 hover:bg-red-500/10 transition-all duration-300">
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-medium">Entrar</span>
              </button>
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 hover:bg-red-500/30 transition-all duration-300">
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-medium">Criar Conta</span>
              </button>
            </div>
          )}

          <span className="hidden md:inline px-2 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 font-mono text-[10px] tracking-wider">
            v1.0 PRO
          </span>
        </div>
      </header>

      {/* ============================================================
          CONTEÚDO PRINCIPAL (com micro-interações)
      ============================================================ */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 md:px-8 pt-16 pb-14">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">

          {/* ============================================================
              COLUNA ESQUERDA (3/5) - BOTÕES COM HOVER DINÂMICO
          ============================================================ */}
          <div className="lg:col-span-3 space-y-5">
            <div className="space-y-1 mb-3">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span className="text-white">SÊ A</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-300 to-blue-400">
                  PRÓXIMA LENDA
                </span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base max-w-md flex items-center gap-2">
                <span>Da formação aos holofotes — cada jornada começa aqui.</span>
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Circle className="w-1.5 h-1.5 fill-emerald-400" />
                  {loadingProgress < 100 ? `Carregando ${loadingProgress}%` : 'Pronto'}
                </span>
              </p>
            </div>

            {/* Botão principal com hover 3D */}
            <button
              onClick={handleStartNewGame}
              onMouseEnter={() => setHoveredButton('new')}
              onMouseLeave={() => setHoveredButton(null)}
              className="group relative w-full max-w-md flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xl md:text-2xl uppercase tracking-wider shadow-2xl shadow-red-500/30 hover:shadow-red-500/60 hover:scale-[1.03] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/40 shadow-lg" />
              <Play className={`w-6 h-6 fill-current transition-transform duration-300 ${hoveredButton === 'new' ? 'scale-110 rotate-6' : ''}`} />
              Nova Carreira
              <ArrowRight className={`w-5 h-5 ml-auto transition-transform duration-300 ${hoveredButton === 'new' ? 'translate-x-2' : ''}`} />
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute -inset-1 bg-gradient-to-r from-red-400/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            {/* Botões secundários com hover dinâmico */}
            <div className="space-y-2.5 max-w-md">
              <button
                onClick={onLoadGame}
                disabled={!hasSavedGame}
                onMouseEnter={() => setHoveredButton('load')}
                onMouseLeave={() => setHoveredButton(null)}
                className={`
                  w-full flex items-center gap-4 px-6 py-3.5 rounded-xl border transition-all duration-300
                  ${hasSavedGame
                    ? 'border-dark-border/40 bg-dark-card/30 backdrop-blur-sm text-white hover:border-red-400/50 hover:bg-dark-card/50 hover:shadow-lg hover:shadow-red-500/5'
                    : 'border-dark-border/20 bg-dark-card/10 text-gray-500 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <Save className={`w-5 h-5 transition-transform duration-300 ${hoveredButton === 'load' && hasSavedGame ? 'scale-110' : ''}`} />
                <span className="font-medium text-base">
                  {hasSavedGame ? 'Continuar Carreira' : 'Nenhum jogo guardado'}
                </span>
                {hasSavedGame && <ChevronRight className={`w-4 h-4 ml-auto opacity-60 transition-transform duration-300 ${hoveredButton === 'load' ? 'translate-x-1' : ''}`} />}
              </button>

              <button
                onClick={handleSettingsToggle}
                onMouseEnter={() => setHoveredButton('settings')}
                onMouseLeave={() => setHoveredButton(null)}
                className="w-full flex items-center gap-4 px-6 py-3 rounded-xl border border-dark-border/20 bg-dark-card/10 backdrop-blur-sm text-gray-300 hover:border-red-400/30 hover:bg-dark-card/30 transition-all duration-300"
              >
                <Settings className={`w-5 h-5 transition-transform duration-300 ${hoveredButton === 'settings' ? 'rotate-90' : ''}`} />
                <span className="font-medium text-base">Definições</span>
                <ChevronRight className={`w-4 h-4 ml-auto opacity-40 transition-transform duration-300 ${hoveredButton === 'settings' ? 'translate-x-1' : ''}`} />
              </button>

              <button
                onClick={handleStatsToggle}
                onMouseEnter={() => setHoveredButton('stats')}
                onMouseLeave={() => setHoveredButton(null)}
                className="w-full flex items-center gap-4 px-6 py-3 rounded-xl border border-dark-border/20 bg-dark-card/10 backdrop-blur-sm text-gray-300 hover:border-red-400/30 hover:bg-dark-card/30 transition-all duration-300"
              >
                <BarChart3 className={`w-5 h-5 transition-transform duration-300 ${hoveredButton === 'stats' ? 'scale-110' : ''}`} />
                <span className="font-medium text-base">Estatísticas & Créditos</span>
                <ChevronRight className={`w-4 h-4 ml-auto opacity-40 transition-transform duration-300 ${hoveredButton === 'stats' ? 'translate-x-1' : ''}`} />
              </button>
            </div>
          </div>

          {/* ============================================================
              COLUNA DIREITA (2/5) - PAINEL DINÂMICO
          ============================================================ */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-dark-card/30 backdrop-blur-xl border border-dark-border/40 rounded-2xl p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Destaques do Simulador
                </h3>
                <button className="ml-auto text-[10px] text-gray-500 hover:text-white transition">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {/* Carrossel de notícias */}
              <div className="relative h-32 overflow-hidden rounded-xl bg-dark-bg/40 border border-dark-border/20">
                {newsFeed.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`absolute inset-0 p-4 transition-all duration-700 ease-in-out ${
                      idx === activeNewsIndex
                        ? 'opacity-100 translate-x-0'
                        : idx < activeNewsIndex
                          ? 'opacity-0 -translate-x-full'
                          : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-dark-card/50 border border-dark-border/20">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-red-400 font-bold uppercase">{item.category}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{item.time}</span>
                        </div>
                        <h4 className="text-white font-semibold text-sm mt-0.5 leading-tight">{item.title}</h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.excerpt}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Indicadores de slide */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {newsFeed.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveNewsIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeNewsIndex ? 'w-4 bg-red-400' : 'bg-gray-600 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats rápidos */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-dark-bg/40 border border-dark-border/20 text-center">
                  <div className="text-[10px] text-gray-400 uppercase">Jogadores ativos</div>
                  <div className="text-lg font-bold text-white">12.4K</div>
                </div>
                <div className="p-2 rounded-xl bg-dark-bg/40 border border-dark-border/20 text-center">
                  <div className="text-[10px] text-gray-400 uppercase">Partidas hoje</div>
                  <div className="text-lg font-bold text-white">847</div>
                </div>
              </div>
            </div>

            {/* Badge extra com interação */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                Sistema operacional
              </span>
              <span className="w-1 h-1 rounded-full bg-dark-border" />
              <span className="flex items-center gap-1">
                <Github className="w-3.5 h-3.5" />
                <span className="underline decoration-dotted cursor-pointer hover:text-white">GitHub</span>
              </span>
              <span className="flex items-center gap-1">
                <Twitter className="w-3.5 h-3.5" />
                <span className="underline decoration-dotted cursor-pointer hover:text-white">Twitter</span>
              </span>
              <span className="flex items-center gap-1">
                <Youtube className="w-3.5 h-3.5" />
                <span className="underline decoration-dotted cursor-pointer hover:text-white">YouTube</span>
              </span>
              <span className="flex items-center gap-1">
                <Twitch className="w-3.5 h-3.5" />
                <span className="underline decoration-dotted cursor-pointer hover:text-white">Twitch</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          FOOTER BAR (com mais interação)
      ============================================================ */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 md:px-8 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-4 text-xs text-gray-400/70 font-mono">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">ENTER</kbd>
            <span>Confirmar</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">ESC</kbd>
            <span>Sair</span>
          </span>
          <span className="flex items-center gap-1.5 hidden sm:flex">
            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">↑↓</kbd>
            <span>Navegar</span>
          </span>
          <span className="flex items-center gap-1.5 hidden md:flex">
            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">F</kbd>
            <span>Fullscreen</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-gray-500/50">
          <span>© 2026 Football MP Simulator</span>
          <span className="w-1 h-1 rounded-full bg-dark-border" />
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Motor v2.1</span>
          </span>
        </div>
      </footer>

      {/* ============================================================
          PAINEL DE DEFINIÇÕES (overlay)
      ============================================================ */}
      {isSettingsVisible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-dark-card/80 backdrop-blur-xl border border-dark-border/60 rounded-3xl shadow-2xl p-6">
            <button
              onClick={handleSettingsToggle}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-4">Definições</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-red-500"
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
                  className="w-full accent-red-500"
                />
                <span className="text-xs text-gray-400">{brightness}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Qualidade</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full bg-dark-bg/70 border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <button
                onClick={handleSettingsToggle}
                className="w-full py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-bold hover:bg-red-500/30 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          PAINEL DE ESTATÍSTICAS (overlay)
      ============================================================ */}
      {isStatsVisible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-dark-card/80 backdrop-blur-xl border border-dark-border/60 rounded-3xl shadow-2xl p-6">
            <button
              onClick={handleStatsToggle}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-400" /> Estatísticas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-dark-border/40 pb-2">
                <span className="text-gray-400">Total de jogos simulados</span>
                <span className="text-white font-bold">1,847,293</span>
              </div>
              <div className="flex justify-between border-b border-dark-border/40 pb-2">
                <span className="text-gray-400">Jogadores registados</span>
                <span className="text-white font-bold">12,482</span>
              </div>
              <div className="flex justify-between border-b border-dark-border/40 pb-2">
                <span className="text-gray-400">Troféus conquistados</span>
                <span className="text-white font-bold">6,382</span>
              </div>
              <div className="flex justify-between border-b border-dark-border/40 pb-2">
                <span className="text-gray-400">Transferências realizadas</span>
                <span className="text-white font-bold">94,201</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Versão do motor</span>
                <span className="text-white font-bold">v2.1.4</span>
              </div>
              <button
                onClick={handleStatsToggle}
                className="w-full mt-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 font-bold hover:bg-blue-500/30 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE AUTENTICAÇÃO
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
