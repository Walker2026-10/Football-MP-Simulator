'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Users, 
  Save, 
  Settings, 
  X,
  User,
  Flag,
  Target,
  Sparkles,
  Play,
  Gamepad2
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [showNewCareerModal, setShowNewCareerModal] = useState(false);
  const [careerMode, setCareerMode] = useState<'player' | 'manager'>('player');
  const [playerName, setPlayerName] = useState('');
  const [nationality, setNationality] = useState('Portugal');
  const [position, setPosition] = useState('Médio');

  const nacionalidades = ['Portugal', 'Brasil', 'Espanha', 'Inglaterra', 'Alemanha', 'França', 'Itália', 'Argentina'];
  const posicoes = ['Guarda-Redes', 'Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado'];

  const handleStartCareer = () => {
    if (!playerName.trim()) {
      alert('Por favor, insere o teu nome.');
      return;
    }

    // Guarda os dados iniciais no localStorage para a store usar depois
    const initialData = {
      name: playerName.trim(),
      nationality,
      position,
      mode: careerMode,
      age: 15,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('football-mp-session', JSON.stringify(initialData));

    // Redireciona para a página da carreira correspondente
    if (careerMode === 'player') {
      router.push('/carreira/jogador');
    } else {
      router.push('/carreira/treinador');
    }
  };

  const handleLoadGame = () => {
    const saved = localStorage.getItem('football-mp-session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Redireciona conforme o modo guardado
        if (data.mode === 'player') {
          router.push('/carreira/jogador');
        } else if (data.mode === 'manager') {
          router.push('/carreira/treinador');
        } else {
          alert('Sessão inválida. Inicia uma nova carreira.');
        }
      } catch {
        alert('Erro ao carregar o jogo. Tenta novamente.');
      }
    } else {
      alert('Nenhum jogo guardado encontrado.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg">
      {/* Background com gradientes e luzes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-accent-blue/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-neon-green/5 via-transparent to-transparent opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-gold-fc/5 via-transparent to-transparent opacity-30"></div>
        {/* Linhas de grade estilo campo de futebol */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 w-full max-w-5xl mx-auto">
        {/* Cabeçalho com ícone e título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-gold-fc" strokeWidth={1.5} />
            <Sparkles className="w-6 h-6 text-neon-cyan animate-pulse-glow" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-gradient-gold">Football MP</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-light text-gray-300 mt-2">
            Simulator <span className="text-neon-cyan font-medium">2026</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto">
            Gerência a tua carreira dentro e fora do campo — desde os Sub-15 até à lenda.
          </p>
        </div>

        {/* Grid de botões do menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">
          <button
            onClick={() => {
              setCareerMode('player');
              setShowNewCareerModal(true);
            }}
            className="group relative fc26-card hover:border-neon-cyan/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-neon-cyan"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent-blue/10 group-hover:bg-accent-blue/20 transition">
                <User className="w-7 h-7 text-neon-cyan" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-white block">Nova Carreira - Jogador</span>
                <span className="text-sm text-gray-400">Começa nos Sub-15 aos 15 anos</span>
              </div>
            </div>
            <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition">
              <Play className="w-4 h-4 text-neon-cyan" />
            </div>
          </button>

          <button
            onClick={() => {
              setCareerMode('manager');
              setShowNewCareerModal(true);
            }}
            className="group relative fc26-card hover:border-gold-fc/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-gold"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gold-fc/10 group-hover:bg-gold-fc/20 transition">
                <Users className="w-7 h-7 text-gold-fc" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-white block">Nova Carreira - Treinador</span>
                <span className="text-sm text-gray-400">Comanda clubes e seleções</span>
              </div>
            </div>
            <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition">
              <Play className="w-4 h-4 text-gold-fc" />
            </div>
          </button>

          <button
            onClick={handleLoadGame}
            className="group fc26-card hover:border-neon-green/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-neon-green"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-neon-green/10 group-hover:bg-neon-green/20 transition">
                <Save className="w-7 h-7 text-neon-green" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-white block">Carregar Jogo</span>
                <span className="text-sm text-gray-400">Retoma a tua jornada</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => alert('Configurações em desenvolvimento')}
            className="group fc26-card hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition">
                <Settings className="w-7 h-7 text-gray-400 group-hover:text-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-white block">Configurações</span>
                <span className="text-sm text-gray-400">Ajusta o jogo</span>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <span className="inline-flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> versão 0.1.0
          </span>
        </div>
      </div>

      {/* Modal de Nova Carreira */}
      {showNewCareerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative fc26-card max-w-md w-full border border-dark-border shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Botão fechar */}
            <button
              onClick={() => setShowNewCareerModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-gradient-gold mb-2">
              {careerMode === 'player' ? '🌟 Nova Carreira - Jogador' : '🧑‍🏫 Nova Carreira - Treinador'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {careerMode === 'player' 
                ? 'Cria a tua lenda desde os Sub-15. Define o teu nome, nacionalidade e posição.' 
                : 'Assume o comando de um clube. Define o teu nome e nacionalidade.'}
            </p>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Treinador/Jogador</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                  autoFocus
                />
              </div>

              {/* Nacionalidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                  <Flag className="w-4 h-4" /> Nacionalidade
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                >
                  {nacionalidades.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Posição (apenas para jogador) */}
              {careerMode === 'player' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Posição
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition"
                  >
                    {posicoes.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botão iniciar */}
              <button
                onClick={handleStartCareer}
                className="w-full mt-4 bg-gradient-to-r from-neon-cyan to-accent-blue text-dark-bg font-bold py-3 rounded-lg hover:shadow-neon-cyan transition duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Iniciar Carreira
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
