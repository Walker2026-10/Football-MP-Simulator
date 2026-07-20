// src/components/ui/MainMenuUI.tsx

'use client';

import React, { useState, useEffect } from 'react';
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
// COMPONENTE: MODAL DE AUTENTICAÇÃO (simples e funcional)
// ============================================================

function AuthModal({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }: any) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsLoading(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
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
      <div className="relative w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white/60 uppercase tracking-wider">
              {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex border-b border-white/10 mx-6 mt-4">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'login' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}
          >
            Iniciar Sessão
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'register' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}
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
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value.trim())} placeholder="EX: JOGADORPRO" className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent transition-all" required />
              </div>
            </div>
            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="EX: JOGADOR@EMAIL.COM" className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent transition-all" required />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent transition-all" required />
              </div>
            </div>
            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmar Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent transition-all" required />
                </div>
              </div>
            )}
            <button type="submit" disabled={isLoading} className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${!isLoading ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'}`}>
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" /> : <>{activeTab === 'login' ? 'Entrar' : 'Criar Conta'}</>}
            </button>
          </form>
          <div className="mt-4 text-center text-[10px] text-gray-500">
            {activeTab === 'login' ? (
              <>Não tens conta? <button onClick={() => setActiveTab('register')} className="text-emerald-400 hover:underline font-bold">Criar Conta</button></>
            ) : (
              <>Já tens conta? <button onClick={() => setActiveTab('login')} className="text-emerald-400 hover:underline font-bold">Iniciar Sessão</button></>
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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">

      {/* ============================================================
          FUNDO - CAMPO DE FUTEBOL (CSS puro)
      ============================================================ */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 via-emerald-600 to-emerald-900" />

      {/* Linhas do campo (SVG) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grass" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="0.1" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grass)" />
          {/* Linhas laterais */}
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          {/* Linha do meio */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          {/* Círculo central */}
          <circle cx="50" cy="50" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          {/* Áreas (grandes) */}
          <rect x="5" y="25" width="12" height="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="83" y="25" width="12" height="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          {/* Pequenas áreas */}
          <rect x="10" y="35" width="5" height="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="85" y="35" width="5" height="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Gradiente de sobreposição para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50" />

      {/* ============================================================
          TOP BAR
      ============================================================ */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-white" strokeWidth={1.5} />
          <span className="text-2xl md:text-3xl font-black tracking-tight text-white">
            FOOTBALL MP <span className="text-emerald-400">26</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
              <span className="text-sm font-bold text-white">@{currentUser}</span>
              <button onClick={handleLogout} className="text-xs text-gray-300 hover:text-red-400 transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition text-sm font-medium">
                Entrar
              </button>
              <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 hover:bg-emerald-500/30 transition text-sm font-medium">
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ============================================================
          CONTEÚDO PRINCIPAL
      ============================================================ */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-12 pt-20 pb-16">
        <div className="w-full max-w-4xl mx-auto">

          {/* Título principal */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
              SÊ A<br />
              <span className="text-emerald-300">PRÓXIMA LENDA</span>
            </h1>
            <p className="text-gray-300 text-lg mt-2 max-w-2xl mx-auto">
              Da formação aos holofotes — cada jornada começa aqui.
            </p>
          </div>

          {/* Botões principais (estilo FIFA) */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <button
              onClick={handleStartNewGame}
              onMouseEnter={() => setHoveredButton('new')}
              onMouseLeave={() => setHoveredButton(null)}
              className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-6 h-6 fill-current" />
              Nova Carreira
              <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${hoveredButton === 'new' ? 'translate-x-1' : ''}`} />
            </button>

            <button
              onClick={onLoadGame}
              disabled={!hasSavedGame}
              className={`w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-semibold text-white transition-all duration-300 ${hasSavedGame ? 'hover:bg-white/20 hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'}`}
            >
              <Save className="w-5 h-5" />
              {hasSavedGame ? 'Continuar Carreira' : 'Nenhum jogo guardado'}
              {hasSavedGame && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>

            <div className="flex gap-4 w-full">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition text-sm">
                <Settings className="w-4 h-4" />
                Definições
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition text-sm">
                <Info className="w-4 h-4" />
                Créditos
              </button>
            </div>
          </div>

          {/* Rodapé com estatísticas rápidas */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Circle className="w-1.5 h-1.5 fill-emerald-400" />
                Motor v2.1
              </span>
              <span>20+ Ligas</span>
              <span>12.4K Jogadores</span>
              <span>Simulação diária</span>
            </div>
            <div className="mt-2 text-[10px] text-white/30">
              © 2026 Football MP Simulator
            </div>
          </div>
        </div>
      </div>

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
