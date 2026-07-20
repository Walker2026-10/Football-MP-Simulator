// src/components/ui/MatchUI.tsx

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
  Shield,
  Target,
  Users,
  Clock,
  Calendar,
  Trophy,
  ArrowRight,
  Home,
  Users as UsersIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  CornerDownRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Eye,
  EyeOff,
  Gauge,
  Footprints,
  Award,
  BarChart,
  MoveRight,
  Flag,
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface MatchTeam {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  form: string[];
  tactics: 'DEFENSIVE' | 'BALANCED' | 'ATTACKING';
  rating: number;
}

interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'commentary';
  description: string;
  teamId: string;
  playerInvolvedName: string;
}

// ============================================================
// DADOS DE EXEMPLO (FORMA RECENTE)
// ============================================================

const generateMockForm = (): string[] => {
  const results = ['W', 'W', 'D', 'L', 'W', 'D', 'W'];
  return results.slice(0, 5);
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function MatchUI() {
  const store = useGameStore();
  const player = store.getCurrentPlayer();
  const club = store.getCurrentClub();
  const fixtures = store.fixtures;
  const { simulateLiveMatch, applyTacticalChange, saveState } = store;

  // Estados locais
  const [matchPhase, setMatchPhase] = useState<'pre' | 'live' | 'post'>('pre');
  const [selectedTactic, setSelectedTactic] = useState<'DEFENSIVE' | 'BALANCED' | 'ATTACKING'>('BALANCED');
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [liveEvents, setLiveEvents] = useState<MatchEvent[]>([]);
  const [liveScore, setLiveScore] = useState({ home: 0, away: 0 });
  const [liveMinute, setLiveMinute] = useState(0);
  const [possession, setPossession] = useState({ home: 50, away: 50 });
  const [momentum, setMomentum] = useState<'HOME' | 'NEUTRAL' | 'AWAY'>('NEUTRAL');
  const [postMatchStats, setPostMatchStats] = useState<any>(null);
  const [isQuickSim, setIsQuickSim] = useState(false);

  const matchFeedRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Procurar próximo jogo
  const nextMatch = useMemo(() => {
    if (!fixtures || fixtures.length === 0) return null;
    const upcoming = fixtures
      .filter(f => !f.played && f.matchDate)
      .sort((a, b) => a.matchDate.localeCompare(b.matchDate));
    return upcoming[0] || null;
  }, [fixtures]);

  // Equipas para o pré-jogo
  const homeTeam: MatchTeam | null = useMemo(() => {
    if (!nextMatch || !club) return null;
    const homeClub = store.getClubById(nextMatch.homeTeamId);
    if (!homeClub) return null;
    return {
      id: homeClub.id,
      name: homeClub.name,
      shortName: homeClub.shortName,
      primaryColor: homeClub.primaryColor || '#3b82f6',
      secondaryColor: homeClub.secondaryColor || '#1e293b',
      form: generateMockForm(),
      tactics: selectedTactic,
      rating: homeClub.reputation || 70,
    };
  }, [nextMatch, club, selectedTactic, store]);

  const awayTeam: MatchTeam | null = useMemo(() => {
    if (!nextMatch) return null;
    const awayClub = store.getClubById(nextMatch.awayTeamId);
    if (!awayClub) return null;
    return {
      id: awayClub.id,
      name: awayClub.name,
      shortName: awayClub.shortName,
      primaryColor: awayClub.primaryColor || '#ef4444',
      secondaryColor: awayClub.secondaryColor || '#1e293b',
      form: generateMockForm(),
      tactics: 'BALANCED',
      rating: awayClub.reputation || 65,
    };
  }, [nextMatch, store]);

  // Scroll automático para o feed
  useEffect(() => {
    if (matchFeedRef.current) {
      matchFeedRef.current.scrollTop = matchFeedRef.current.scrollHeight;
    }
  }, [liveEvents]);

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // ============================================================
  // FUNÇÕES DE SIMULAÇÃO
  // ============================================================

  const startLiveMatch = (quickSim: boolean = false) => {
    if (!homeTeam || !awayTeam) return;

    setIsQuickSim(quickSim);
    setMatchPhase('live');
    setLiveEvents([]);
    setLiveScore({ home: 0, away: 0 });
    setLiveMinute(0);
    setPossession({ home: 50, away: 50 });
    setMomentum('NEUTRAL');
    setIsPaused(false);
    setIsLiveSimulating(true);

    // Evento inicial
    const initialEvent: MatchEvent = {
      minute: 0,
      type: 'commentary',
      description: '⚽ O jogo começou! Vamos para mais uma batalha no relvado.',
      teamId: 'neutral',
      playerInvolvedName: '—',
    };
    setLiveEvents([initialEvent]);

    if (quickSim) {
      // Simulação rápida - executar todos os minutos de uma vez
      quickSimulateMatch();
    } else {
      // Simulação minuto a minuto
      startTickSimulation();
    }
  };

  const startTickSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Determinar intervalo com base na velocidade
    const interval = Math.max(200, 1000 / speed);

    timerRef.current = setInterval(() => {
      if (isPaused) return;
      tickMatch();
    }, interval);
  };

  const tickMatch = () => {
    if (liveMinute >= 95) {
      // Fim do jogo
      endMatch();
      return;
    }

    const newMinute = liveMinute + 1;
    setLiveMinute(newMinute);

    // Simular evento para este minuto (probabilidade ~30%)
    if (Math.random() < 0.3) {
      generateEvent(newMinute);
    }

    // Atualizar posse de bola (simples)
    const possessionChange = (Math.random() - 0.5) * 6;
    setPossession(prev => ({
      home: Math.min(70, Math.max(30, prev.home + possessionChange)),
      away: Math.min(70, Math.max(30, prev.away - possessionChange)),
    }));

    // Atualizar momentum
    if (liveScore.home > liveScore.away) {
      setMomentum('HOME');
    } else if (liveScore.away > liveScore.home) {
      setMomentum('AWAY');
    } else {
      setMomentum('NEUTRAL');
    }
  };

  const generateEvent = (minute: number) => {
    const eventTypes: MatchEvent['type'][] = ['goal', 'yellow_card', 'commentary', 'commentary', 'commentary'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const isHome = Math.random() < 0.5;
    const teamId = isHome ? (homeTeam?.id || 'home') : (awayTeam?.id || 'away');
    const teamName = isHome ? (homeTeam?.name || 'Casa') : (awayTeam?.name || 'Fora');
    const playerName = `Jogador ${Math.floor(Math.random() * 30) + 1}`;

    let description = '';
    let newScore = { ...liveScore };

    switch (type) {
      case 'goal':
        if (isHome) {
          newScore.home += 1;
          description = `⚽ GOLO! ${playerName} marca para ${teamName}!`;
        } else {
          newScore.away += 1;
          description = `⚽ GOLO! ${playerName} marca para ${teamName}!`;
        }
        setLiveScore(newScore);
        break;
      case 'yellow_card':
        description = `🟨 ${playerName} (${teamName}) recebe cartão amarelo.`;
        break;
      case 'red_card':
        description = `🟥 ${playerName} (${teamName}) é expulso!`;
        break;
      default:
        const commentaries = [
          `${playerName} tenta o remate, mas a bola sai ao lado.`,
          `Grande defesa do guarda-redes! ${playerName} não conseguiu marcar.`,
          `${playerName} cruza para a área, mas a defesa corta.`,
          `Bela jogada de ${playerName}, mas o passe sai demasiado longo.`,
          `${playerName} tabela com o colega e avança no terreno.`,
        ];
        description = commentaries[Math.floor(Math.random() * commentaries.length)];
        break;
    }

    const event: MatchEvent = {
      minute,
      type,
      description,
      teamId,
      playerInvolvedName: playerName,
    };

    setLiveEvents(prev => [...prev, event]);
  };

  const quickSimulateMatch = () => {
    // Simular todos os minutos de uma vez
    let homeScore = 0;
    let awayScore = 0;
    const events: MatchEvent[] = [];

    for (let minute = 1; minute <= 90; minute++) {
      if (Math.random() < 0.15) {
        const isHome = Math.random() < 0.5;
        const playerName = `Jogador ${Math.floor(Math.random() * 30) + 1}`;
        const teamName = isHome ? (homeTeam?.name || 'Casa') : (awayTeam?.name || 'Fora');

        if (Math.random() < 0.35) {
          // Golo
          if (isHome) homeScore += 1;
          else awayScore += 1;
          events.push({
            minute,
            type: 'goal',
            description: `⚽ GOLO! ${playerName} marca para ${teamName}!`,
            teamId: isHome ? (homeTeam?.id || 'home') : (awayTeam?.id || 'away'),
            playerInvolvedName: playerName,
          });
        } else {
          events.push({
            minute,
            type: 'commentary',
            description: `${playerName} cria perigo, mas a defesa adversária corta.`,
            teamId: isHome ? (homeTeam?.id || 'home') : (awayTeam?.id || 'away'),
            playerInvolvedName: playerName,
          });
        }
      }

      // Evento de comentário a cada 15 minutos
      if (minute % 15 === 0 && minute < 90) {
        const playerName = `Jogador ${Math.floor(Math.random() * 30) + 1}`;
        events.push({
          minute,
          type: 'commentary',
          description: `${minute}' - Jogo equilibrado, ${playerName} tenta criar oportunidades.`,
          teamId: 'neutral',
          playerInvolvedName: playerName,
        });
      }
    }

    // Adicionar eventos de fim de jogo
    events.push({
      minute: 90,
      type: 'commentary',
      description: `⏱️ Fim do jogo! Resultado final: ${homeTeam?.name} ${homeScore} - ${awayScore} ${awayTeam?.name}`,
      teamId: 'neutral',
      playerInvolvedName: '—',
    });

    // Atualizar estado
    setLiveScore({ home: homeScore, away: awayScore });
    setLiveMinute(90);
    setLiveEvents(prev => [...prev, ...events]);

    // Calcular estatísticas pós-jogo
    const stats = {
      shots: { home: Math.floor(Math.random() * 12) + 3, away: Math.floor(Math.random() * 12) + 3 },
      shotsOnTarget: { home: Math.floor(Math.random() * 6), away: Math.floor(Math.random() * 6) },
      possession: { home: 45 + Math.floor(Math.random() * 20), away: 45 + Math.floor(Math.random() * 20) },
      fouls: { home: Math.floor(Math.random() * 10), away: Math.floor(Math.random() * 10) },
      corners: { home: Math.floor(Math.random() * 6), away: Math.floor(Math.random() * 6) },
      playerRatings: generatePlayerRatings(),
    };
    setPostMatchStats(stats);

    setIsLiveSimulating(false);
    setMatchPhase('post');
  };

  const generatePlayerRatings = () => {
    const ratings = [];
    const positions = ['GR', 'DC', 'DC', 'LD', 'LE', 'MC', 'MC', 'MD', 'ME', 'PL', 'AC'];
    for (let i = 0; i < 11; i++) {
      const rating = 5 + Math.random() * 4;
      const goals = Math.random() < 0.2 ? 1 : 0;
      const assists = Math.random() < 0.15 ? 1 : 0;
      ratings.push({
        name: `Jogador ${i + 1}`,
        position: positions[i % positions.length],
        rating: Math.round(rating * 10) / 10,
        goals,
        assists,
        minutes: 90 - Math.floor(Math.random() * 20),
      });
    }
    return ratings;
  };

  const endMatch = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsLiveSimulating(false);

    // Gerar estatísticas pós-jogo
    const stats = {
      shots: {
        home: Math.floor(Math.random() * 12) + 3,
        away: Math.floor(Math.random() * 12) + 3,
      },
      shotsOnTarget: {
        home: Math.floor(Math.random() * 6),
        away: Math.floor(Math.random() * 6),
      },
      possession: possession,
      fouls: {
        home: Math.floor(Math.random() * 10),
        away: Math.floor(Math.random() * 10),
      },
      corners: {
        home: Math.floor(Math.random() * 6),
        away: Math.floor(Math.random() * 6),
      },
      playerRatings: generatePlayerRatings(),
    };
    setPostMatchStats(stats);
    setMatchPhase('post');
  };

  // ============================================================
  // CONTROLOS DE SIMULAÇÃO
  // ============================================================

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const changeSpeed = (newSpeed: 1 | 2 | 4) => {
    setSpeed(newSpeed);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      if (!isPaused && matchPhase === 'live') {
        startTickSimulation();
      }
    }
  };

  const handleTacticalChange = (newTactic: 'DEFENSIVE' | 'BALANCED' | 'ATTACKING') => {
    setSelectedTactic(newTactic);
    if (matchPhase === 'live') {
      applyTacticalChange(newTactic, 'HOME');
    }
  };

  // ============================================================
  // RENDER PRÉ-JOGO
  // ============================================================

  if (matchPhase === 'pre') {
    if (!nextMatch || !homeTeam || !awayTeam) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
          <div className="fc26-card max-w-md w-full p-8">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Nenhum Jogo Agendado</h2>
            <p className="text-gray-400">Aguarda o próximo jogo para ativares a simulação ao vivo.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="fc26-card p-4 text-center">
          <h2 className="text-2xl font-bold text-gold-fc mb-1">Pré-Jogo</h2>
          <p className="text-sm text-gray-400">{nextMatch.matchDate}</p>
        </div>

        {/* Equipas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Casa */}
          <div className="fc26-card p-6 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: homeTeam.primaryColor, color: homeTeam.secondaryColor }}
            >
              {homeTeam.shortName.substring(0, 2)}
            </div>
            <h3 className="text-xl font-bold text-white">{homeTeam.name}</h3>
            <div className="flex justify-center gap-1 mt-2">
              {homeTeam.form.map((result, idx) => (
                <span
                  key={idx}
                  className={`
                    w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                    ${result === 'W' ? 'bg-green-500/20 text-green-400' :
                      result === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'}
                  `}
                >
                  {result}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Rating: {homeTeam.rating}
            </div>
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-400">VS</div>
            <div className="text-sm text-gray-500 mt-2">Próximo Jogo</div>
          </div>

          {/* Fora */}
          <div className="fc26-card p-6 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: awayTeam.primaryColor, color: awayTeam.secondaryColor }}
            >
              {awayTeam.shortName.substring(0, 2)}
            </div>
            <h3 className="text-xl font-bold text-white">{awayTeam.name}</h3>
            <div className="flex justify-center gap-1 mt-2">
              {awayTeam.form.map((result, idx) => (
                <span
                  key={idx}
                  className={`
                    w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                    ${result === 'W' ? 'bg-green-500/20 text-green-400' :
                      result === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'}
                  `}
                >
                  {result}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Rating: {awayTeam.rating}
            </div>
          </div>
        </div>

        {/* Seletor Tático */}
        <div className="fc26-card p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Mentalidade Tática
          </h3>
          <div className="flex flex-wrap gap-3">
            {(['DEFENSIVE', 'BALANCED', 'ATTACKING'] as const).map((tactic) => (
              <button
                key={tactic}
                onClick={() => setSelectedTactic(tactic)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
                  ${selectedTactic === tactic
                    ? 'bg-accent-blue/20 text-white border border-accent-blue/50'
                    : 'bg-dark-bg/50 text-gray-400 border border-dark-border hover:border-dark-border/70'
                  }
                `}
              >
                {tactic === 'DEFENSIVE' && <Shield className="w-4 h-4" />}
                {tactic === 'BALANCED' && <Minus className="w-4 h-4" />}
                {tactic === 'ATTACKING' && <Target className="w-4 h-4" />}
                {tactic.charAt(0) + tactic.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => startLiveMatch(false)}
            className="px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-neon-cyan to-accent-blue text-dark-bg hover:shadow-neon-cyan transition flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Ver Jogo Ao Vivo
          </button>
          <button
            onClick={() => startLiveMatch(true)}
            className="px-8 py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-gold-fc to-yellow-500 text-dark-bg hover:shadow-gold transition flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Simulação Rápida
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER AO VIVO
  // ============================================================

  if (matchPhase === 'live') {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Marcador */}
        <div className="fc26-card p-4 bg-dark-card/80 backdrop-blur-sm border-neon-cyan/20">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">{homeTeam?.name || 'Casa'}</div>
              <div className="text-4xl font-bold text-white">{liveScore.home}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-fc">{liveMinute}'</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-16 h-1.5 rounded-full bg-dark-border overflow-hidden">
                  <div
                    className="h-full bg-neon-cyan transition-all duration-300"
                    style={{ width: `${(liveMinute / 95) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isPaused ? '⏸️ Pausado' : '▶️ Ao Vivo'}
              </div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-400">{awayTeam?.name || 'Fora'}</div>
              <div className="text-4xl font-bold text-white">{liveScore.away}</div>
            </div>
          </div>
        </div>

        {/* Indicadores de Posse e Momentum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="fc26-card p-3">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>{homeTeam?.name || 'Casa'}</span>
              <span>{Math.round(possession.home)}%</span>
              <span>{awayTeam?.name || 'Fora'}</span>
            </div>
            <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden flex">
              <div
                className="h-full bg-neon-cyan transition-all duration-500"
                style={{ width: `${possession.home}%` }}
              />
              <div
                className="h-full bg-orange-400 transition-all duration-500"
                style={{ width: `${possession.away}%` }}
              />
            </div>
          </div>
          <div className="fc26-card p-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Momentum</span>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${momentum === 'HOME' ? 'text-neon-cyan' : 'text-gray-500'}`}>
                {homeTeam?.shortName}
              </span>
              <div className="flex items-center gap-1">
                {momentum === 'HOME' && <TrendingUp className="w-5 h-5 text-neon-cyan" />}
                {momentum === 'NEUTRAL' && <Minus className="w-5 h-5 text-gray-400" />}
                {momentum === 'AWAY' && <TrendingDown className="w-5 h-5 text-orange-400" />}
              </div>
              <span className={`text-sm font-medium ${momentum === 'AWAY' ? 'text-orange-400' : 'text-gray-500'}`}>
                {awayTeam?.shortName}
              </span>
            </div>
          </div>
        </div>

        {/* Feed de Narração */}
        <div
          ref={matchFeedRef}
          className="fc26-card p-4 h-60 overflow-y-auto bg-dark-bg/50 border-dark-border"
        >
          <div className="space-y-1.5">
            {liveEvents.map((event, idx) => (
              <div
                key={idx}
                className={`
                  text-sm py-1 px-2 rounded flex items-start gap-2
                  ${event.type === 'goal' ? 'bg-green-500/10 text-green-400' :
                    event.type === 'yellow_card' ? 'bg-yellow-500/10 text-yellow-400' :
                    event.type === 'red_card' ? 'bg-red-500/10 text-red-400' :
                    'text-gray-300'}
                  ${event.teamId === 'neutral' ? 'border-l-2 border-gray-500' : ''}
                `}
              >
                <span className="text-xs text-gray-500 font-mono min-w-[32px]">
                  {event.minute}'
                </span>
                <span className="flex-1">{event.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controlos */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className="p-2 rounded-lg bg-dark-bg/50 border border-dark-border hover:border-dark-border/70 transition"
            >
              {isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            </button>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s as 1 | 2 | 4)}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium transition
                  ${speed === s
                    ? 'bg-accent-blue/20 text-white border border-accent-blue/50'
                    : 'bg-dark-bg/50 text-gray-400 border border-dark-border hover:border-dark-border/70'
                  }
                `}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            onClick={endMatch}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Terminar Jogo
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER PÓS-JOGO
  // ============================================================

  if (matchPhase === 'post' && postMatchStats) {
    const stats = postMatchStats;

    return (
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="fc26-card p-6 text-center border-gold-fc/30">
          <Trophy className="w-12 h-12 text-gold-fc mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">Jogo Terminado!</h2>
          <div className="text-4xl font-bold text-gold-fc my-2">
            {homeTeam?.name} {liveScore.home} - {liveScore.away} {awayTeam?.name}
          </div>
          <p className="text-sm text-gray-400">
            {nextMatch?.matchDate} • {liveMinute} minutos jogados
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="fc26-card p-4 text-center">
            <Target className="w-6 h-6 text-neon-cyan mx-auto mb-1" />
            <div className="text-sm text-gray-400">Remates</div>
            <div className="text-xl font-bold text-white">
              {stats.shots.home} - {stats.shots.away}
            </div>
          </div>
          <div className="fc26-card p-4 text-center">
            <Eye className="w-6 h-6 text-neon-cyan mx-auto mb-1" />
            <div className="text-sm text-gray-400">Remates à Baliza</div>
            <div className="text-xl font-bold text-white">
              {stats.shotsOnTarget.home} - {stats.shotsOnTarget.away}
            </div>
          </div>
          <div className="fc26-card p-4 text-center">
            <Gauge className="w-6 h-6 text-neon-cyan mx-auto mb-1" />
            <div className="text-sm text-gray-400">Posse de Bola</div>
            <div className="text-xl font-bold text-white">
              {Math.round(stats.possession.home)}% - {Math.round(stats.possession.away)}%
            </div>
          </div>
          <div className="fc26-card p-4 text-center">
            <Footprints className="w-6 h-6 text-neon-cyan mx-auto mb-1" />
            <div className="text-sm text-gray-400">Faltas</div>
            <div className="text-xl font-bold text-white">
              {stats.fouls.home} - {stats.fouls.away}
            </div>
          </div>
        </div>

        {/* Notas dos Jogadores */}
        <div className="fc26-card p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-fc" />
            Notas Individuais
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-dark-border">
                  <th className="text-left py-2 px-3">Jogador</th>
                  <th className="text-left py-2 px-3">Pos.</th>
                  <th className="text-center py-2 px-3">Nota</th>
                  <th className="text-center py-2 px-3">Golos</th>
                  <th className="text-center py-2 px-3">Assist.</th>
                  <th className="text-center py-2 px-3">Min.</th>
                </tr>
              </thead>
              <tbody>
                {stats.playerRatings.map((p: any, idx: number) => (
                  <tr key={idx} className="border-b border-dark-border/50 hover:bg-dark-bg/30 transition">
                    <td className="py-2 px-3 text-white">
                      {p.name}
                      {p.name.includes('Jogador') && player && idx === 0 && (
                        <span className="ml-2 text-xs text-neon-cyan">(Tu)</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-400">{p.position}</td>
                    <td className="py-2 px-3 text-center font-bold">
                      <span className={`
                        px-2 py-1 rounded-full text-xs
                        ${p.rating >= 8 ? 'bg-green-500/20 text-green-400' :
                          p.rating >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'}
                      `}>
                        {p.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-gold-fc">{p.goals}</td>
                    <td className="py-2 px-3 text-center text-neon-cyan">{p.assists}</td>
                    <td className="py-2 px-3 text-center text-gray-400">{p.minutes}'</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botão Voltar */}
        <button
          onClick={() => setMatchPhase('pre')}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-accent-blue text-dark-bg font-bold hover:shadow-neon-cyan transition flex items-center justify-center gap-2"
        >
          <MoveRight className="w-5 h-5" />
          Voltar à Dashboard
        </button>
      </div>
    );
  }

  return null;
}
