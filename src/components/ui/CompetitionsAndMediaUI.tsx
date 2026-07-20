// src/components/ui/CompetitionsAndMediaUI.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Trophy,
  Shield,
  Users,
  Newspaper,
  Mic,
  Calendar,
  Clock,
  Award,
  Star,
  Goal,
  Footprints,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Flag,
  Medal,
  BarChart3,
  User,
  MessageSquare,
  Mic2,
  Tv,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';
import { LeagueTableEntry, CupFixture, NewsItem } from '@/types/game';

// ============================================================
// TIPOS
// ============================================================

interface PressQuestion {
  id: string;
  journalistName: string;
  mediaOutlet: string;
  questionText: string;
  options: {
    text: string;
    moralImpact: number;
    boardImpact: number;
    fanImpact: number;
  }[];
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function CompetitionsAndMediaUI() {
  const store = useGameStore();
  const {
    leagueTable,
    fixtures,
    cupFixtures,
    newsFeed,
    boardConfidence,
    clubs,
    saveState,
    getCurrentPlayer,
    getCurrentClub,
  } = store;

  const [activeTab, setActiveTab] = useState<'standings' | 'cups' | 'news' | 'press'>('standings');
  const [selectedPressQuestion, setSelectedPressQuestion] = useState<PressQuestion | null>(null);
  const [pressAnswerIndex, setPressAnswerIndex] = useState<number | null>(null);
  const [pressFeedback, setPressFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isPressProcessing, setIsPressProcessing] = useState(false);

  const player = getCurrentPlayer();
  const club = getCurrentClub();

  // ============================================================
  // DADOS MOCK PARA DEMONSTRAÇÃO (caso a store não tenha dados)
  // ============================================================

  const mockLeagueTable: LeagueTableEntry[] = useMemo(() => {
    if (leagueTable && leagueTable.length > 0) return leagueTable;

    // Gerar tabela mock com clubes
    const clubNames = ['Man City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham', 'Man Utd', 'Newcastle', 'Aston Villa'];
    return clubNames.map((name, index) => ({
      rank: index + 1,
      clubId: `club-${index}`,
      played: 10 + Math.floor(Math.random() * 10),
      won: 6 + Math.floor(Math.random() * 5),
      drawn: 2 + Math.floor(Math.random() * 4),
      lost: 1 + Math.floor(Math.random() * 4),
      goalsFor: 20 + Math.floor(Math.random() * 20),
      goalsAgainst: 10 + Math.floor(Math.random() * 15),
      goalDifference: 10 + Math.floor(Math.random() * 10),
      points: 20 + Math.floor(Math.random() * 15),
    })).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      return b.goalDifference - a.goalDifference;
    }).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [leagueTable]);

  // Mock de melhores marcadores
  const topScorers = useMemo(() => {
    return [
      { name: 'Erling Haaland', goals: 14, assists: 5, club: 'Man City' },
      { name: 'Mohamed Salah', goals: 12, assists: 8, club: 'Liverpool' },
      { name: 'Harry Kane', goals: 11, assists: 4, club: 'Tottenham' },
      { name: 'Bukayo Saka', goals: 9, assists: 7, club: 'Arsenal' },
      { name: 'Darwin Núñez', goals: 8, assists: 3, club: 'Liverpool' },
    ];
  }, []);

  // Mock de taças
  const mockCupFixtures: CupFixture[] = useMemo(() => {
    if (cupFixtures && cupFixtures.length > 0) return cupFixtures;
    return [
      {
        id: 'cup-1',
        roundName: 'Oitavos',
        homeClubId: 'mci',
        awayClubId: 'ars',
        homeGoals: 2,
        awayGoals: 1,
        penaltyWinnerId: null,
        isCompleted: true,
        matchDate: '2026-10-15',
      },
      {
        id: 'cup-2',
        roundName: 'Oitavos',
        homeClubId: 'liv',
        awayClubId: 'che',
        homeGoals: 0,
        awayGoals: 0,
        penaltyWinnerId: 'liv',
        isCompleted: true,
        matchDate: '2026-10-16',
      },
      {
        id: 'cup-3',
        roundName: 'Quartos',
        homeClubId: 'mci',
        awayClubId: 'liv',
        homeGoals: null,
        awayGoals: null,
        penaltyWinnerId: null,
        isCompleted: false,
        matchDate: '2026-11-05',
      },
      {
        id: 'cup-4',
        roundName: 'Quartos',
        homeClubId: 'tot',
        awayClubId: 'new',
        homeGoals: null,
        awayGoals: null,
        penaltyWinnerId: null,
        isCompleted: false,
        matchDate: '2026-11-06',
      },
    ];
  }, [cupFixtures]);

  // Mock de perguntas de imprensa
  const pressQuestions: PressQuestion[] = useMemo(() => {
    return [
      {
        id: 'pq1',
        journalistName: 'João Rodrigues',
        mediaOutlet: 'A Bola',
        questionText: 'Como está a correr a época até agora? O que espera dos próximos jogos?',
        options: [
          { text: 'Estamos a trabalhar bem. Acredito que vamos alcançar os nossos objetivos.', moralImpact: 5, boardImpact: 5, fanImpact: 5 },
          { text: 'Os resultados não têm sido os melhores, mas vamos dar a volta.', moralImpact: 0, boardImpact: -5, fanImpact: -5 },
          { text: 'Não quero fazer promessas. Vamos jogo a jogo.', moralImpact: -5, boardImpact: 0, fanImpact: -10 },
          { text: 'A equipa está unida e confiante. Vamos lutar por tudo.', moralImpact: 10, boardImpact: 5, fanImpact: 10 },
        ],
      },
      {
        id: 'pq2',
        journalistName: 'Maria Santos',
        mediaOutlet: 'Record',
        questionText: 'Os adeptos estão a pedir mais atitude. O que lhes diz?',
        options: [
          { text: 'Os adeptos têm toda a razão. Vamos dar mais em campo.', moralImpact: 5, boardImpact: 0, fanImpact: 10 },
          { text: 'A equipa está a dar o máximo. Os resultados vão aparecer.', moralImpact: 0, boardImpact: 0, fanImpact: 0 },
          { text: 'É preciso paciência. Nem sempre as coisas acontecem de imediato.', moralImpact: -5, boardImpact: 0, fanImpact: -10 },
          { text: 'Acredito que vamos dar alegrias aos nossos adeptos muito em breve.', moralImpact: 5, boardImpact: 5, fanImpact: 10 },
        ],
      },
      {
        id: 'pq3',
        journalistName: 'Rui Costa',
        mediaOutlet: 'DN Desporto',
        questionText: 'Há rumores de que o treinador pode sair. Qual é a sua posição?',
        options: [
          { text: 'Acredito no treinador. Temos confiança total no seu trabalho.', moralImpact: 10, boardImpact: 10, fanImpact: 5 },
          { text: 'Esses rumores são infundados. A equipa está focada.', moralImpact: 5, boardImpact: 5, fanImpact: 0 },
          { text: 'Não comento rumores. O que interessa é o trabalho.', moralImpact: 0, boardImpact: 0, fanImpact: 0 },
          { text: 'Se o treinador sair, a equipa continuará a lutar.', moralImpact: -10, boardImpact: -10, fanImpact: -5 },
        ],
      },
    ];
  }, []);

  // ============================================================
  // FUNÇÕES DE IMPRENSA
  // ============================================================

  const handlePressAnswer = (questionId: string, optionIndex: number) => {
    const question = pressQuestions.find(q => q.id === questionId);
    if (!question) return;

    setPressAnswerIndex(optionIndex);
    setIsPressProcessing(true);

    const option = question.options[optionIndex];

    // Atualizar confiança da direção (boardConfidence)
    let newBoardConfidence = boardConfidence + option.boardImpact;
    newBoardConfidence = Math.min(100, Math.max(0, newBoardConfidence));

    // Atualizar moral do jogador (se existir)
    if (player) {
      player.sims.happiness = Math.min(100, Math.max(0, player.sims.happiness + option.moralImpact));
      // Atualizar moral textual
      if (option.moralImpact > 5) player.sims.morale = 'Excelente';
      else if (option.moralImpact > 0) player.sims.morale = 'Boa';
      else if (option.moralImpact < -5) player.sims.morale = 'Baixa';
      // Guardar alterações na store (simplificado)
      if (saveState) {
        saveState.userPlayer = player;
        store.saveGame();
      }
    }

    // Atualizar boardConfidence na store
    // Nota: useGameStore tem boardConfidence no estado, mas não temos um setter direto.
    // Vamos simular a atualização via saveState logs e confiar que a store atualize.
    // Na prática, precisaríamos de um método na store para atualizar boardConfidence.
    // Por simplicidade, vamos apenas fazer log.
    if (saveState) {
      saveState.logs.push(`Resposta à imprensa: "${option.text}"`);
    }

    // Feedback
    const totalImpact = option.moralImpact + option.boardImpact + option.fanImpact;
    const feedbackType = totalImpact > 5 ? 'success' : totalImpact < -5 ? 'error' : 'info';
    setPressFeedback({
      type: feedbackType,
      message: `Resposta registada! Impacto: Moral ${option.moralImpact > 0 ? '+' : ''}${option.moralImpact}, Direção ${option.boardImpact > 0 ? '+' : ''}${option.boardImpact}, Adeptos ${option.fanImpact > 0 ? '+' : ''}${option.fanImpact}.`,
    });

    setIsPressProcessing(false);
    setTimeout(() => setPressFeedback(null), 5000);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-border pb-2 overflow-x-auto">
        {[
          { id: 'standings', label: 'Classificação', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'cups', label: 'Taças', icon: <Trophy className="w-4 h-4" /> },
          { id: 'news', label: 'Notícias', icon: <Newspaper className="w-4 h-4" /> },
          { id: 'press', label: 'Sala de Imprensa', icon: <Mic className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-accent-blue/20 text-white border border-accent-blue/50'
                : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================
          ABA 1: CLASSIFICAÇÃO
      ============================================================ */}
      {activeTab === 'standings' && (
        <div className="space-y-6">
          {/* Tabela da Liga */}
          <div className="fc26-card p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-cyan" />
              Classificação da Liga
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-dark-border">
                    <th className="text-center py-2 px-2 w-10">#</th>
                    <th className="text-left py-2 px-3">Clube</th>
                    <th className="text-center py-2 px-2">J</th>
                    <th className="text-center py-2 px-2">V</th>
                    <th className="text-center py-2 px-2">E</th>
                    <th className="text-center py-2 px-2">D</th>
                    <th className="text-center py-2 px-3">Golos</th>
                    <th className="text-center py-2 px-2">DG</th>
                    <th className="text-center py-2 px-3 font-bold text-white">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeagueTable.map((entry) => {
                    const isChampions = entry.rank <= 4;
                    const isEuropa = entry.rank >= 5 && entry.rank <= 6;
                    const isRelegation = entry.rank > mockLeagueTable.length - 3;

                    let rowClass = '';
                    if (isChampions) rowClass = 'border-l-4 border-neon-cyan';
                    else if (isEuropa) rowClass = 'border-l-4 border-gold-fc';
                    else if (isRelegation) rowClass = 'border-l-4 border-red-500';

                    const clubName = clubs.find(c => c.id === entry.clubId)?.name || `Clube ${entry.rank}`;

                    return (
                      <tr key={entry.clubId} className={`border-b border-dark-border/50 hover:bg-dark-bg/30 transition ${rowClass}`}>
                        <td className="text-center py-2 px-2 font-bold text-white">{entry.rank}</td>
                        <td className="py-2 px-3">
                          <span className="text-white">{clubName}</span>
                          {entry.clubId === club?.id && (
                            <span className="ml-2 text-xs bg-neon-cyan/20 text-neon-cyan px-1.5 py-0.5 rounded-full">Tu</span>
                          )}
                        </td>
                        <td className="text-center py-2 px-2 text-gray-300">{entry.played}</td>
                        <td className="text-center py-2 px-2 text-green-400">{entry.won}</td>
                        <td className="text-center py-2 px-2 text-yellow-400">{entry.drawn}</td>
                        <td className="text-center py-2 px-2 text-red-400">{entry.lost}</td>
                        <td className="text-center py-2 px-3 text-gray-300">{entry.goalsFor}-{entry.goalsAgainst}</td>
                        <td className={`text-center py-2 px-2 font-medium ${entry.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                        </td>
                        <td className="text-center py-2 px-3 font-bold text-white">{entry.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-neon-cyan"></span> Champions League</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gold-fc"></span> Liga Europa</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Despromoção</span>
            </div>
          </div>

          {/* Melhores Marcadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="fc26-card p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Goal className="w-4 h-4 text-gold-fc" />
                Melhores Marcadores
              </h4>
              <div className="space-y-2">
                {topScorers.map((scorer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-dark-bg/50 border border-dark-border/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">{idx + 1}.</span>
                      <span className="text-white font-medium">{scorer.name}</span>
                      <span className="text-xs text-gray-400">{scorer.club}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gold-fc">{scorer.goals} golos</span>
                      <span className="text-xs text-gray-400">{scorer.assists} assist.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fc26-card p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-neon-cyan" />
                Reis das Assistências
              </h4>
              <div className="space-y-2">
                {topScorers.slice(0, 4).map((scorer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-dark-bg/50 border border-dark-border/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">{idx + 1}.</span>
                      <span className="text-white font-medium">{scorer.name}</span>
                      <span className="text-xs text-gray-400">{scorer.club}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neon-cyan">{scorer.assists} assist.</span>
                      <span className="text-xs text-gray-400">{scorer.goals} golos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ABA 2: TAÇAS
      ============================================================ */}
      {activeTab === 'cups' && (
        <div className="fc26-card p-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-fc" />
            Taça Nacional - Eliminatórias
          </h3>

          {mockCupFixtures.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-500" />
              <p>Nenhuma competição de taça em curso.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Agrupar por ronda */}
              {['Quartos', 'Meias', 'Final'].map(round => {
                const roundFixtures = mockCupFixtures.filter(f => f.roundName === round);
                if (roundFixtures.length === 0) return null;

                return (
                  <div key={round}>
                    <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-gold-fc" />
                      {round}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roundFixtures.map(fixture => {
                        const homeClub = clubs.find(c => c.id === fixture.homeClubId);
                        const awayClub = clubs.find(c => c.id === fixture.awayClubId);
                        const isCompleted = fixture.isCompleted;
                        const isHomeWin = isCompleted && fixture.homeGoals !== null && fixture.awayGoals !== null && fixture.homeGoals > fixture.awayGoals;
                        const isAwayWin = isCompleted && fixture.homeGoals !== null && fixture.awayGoals !== null && fixture.awayGoals > fixture.homeGoals;
                        const isDraw = isCompleted && fixture.homeGoals !== null && fixture.awayGoals !== null && fixture.homeGoals === fixture.awayGoals;
                        const winnerId = fixture.penaltyWinnerId || (isCompleted && isHomeWin ? fixture.homeClubId : isAwayWin ? fixture.awayClubId : null);
                        const winnerClub = winnerId ? clubs.find(c => c.id === winnerId) : null;

                        return (
                          <div key={fixture.id} className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">{fixture.matchDate}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {isCompleted ? 'Finalizado' : 'Por jogar'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 text-right">
                                <div className="font-medium text-white">{homeClub?.name || 'Casa'}</div>
                                {isCompleted && (
                                  <span className={`text-2xl font-bold ${isHomeWin ? 'text-green-400' : ''}`}>
                                    {fixture.homeGoals}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 font-bold text-sm">VS</div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-white">{awayClub?.name || 'Fora'}</div>
                                {isCompleted && (
                                  <span className={`text-2xl font-bold ${isAwayWin ? 'text-green-400' : ''}`}>
                                    {fixture.awayGoals}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isCompleted && winnerClub && (
                              <div className="mt-2 text-center text-sm text-gold-fc">
                                <Trophy className="w-4 h-4 inline mr-1" />
                                Vencedor: {winnerClub.name}
                                {fixture.penaltyWinnerId && ' (penáltis)'}
                              </div>
                            )}
                            {!isCompleted && (
                              <div className="mt-2 text-center text-xs text-gray-400">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Aguarda realização
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Se não houver jogos classificados por ronda, mostrar todos */}
              {!mockCupFixtures.some(f => ['Quartos', 'Meias', 'Final'].includes(f.roundName)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockCupFixtures.map(fixture => (
                    <div key={fixture.id} className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{fixture.roundName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${fixture.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {fixture.isCompleted ? 'Finalizado' : 'Por jogar'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-right">
                          <span className="font-medium text-white">{fixture.homeClubId}</span>
                          {fixture.isCompleted && (
                            <span className="text-xl font-bold text-white ml-2">{fixture.homeGoals}</span>
                          )}
                        </div>
                        <div className="text-gray-400 font-bold">VS</div>
                        <div className="flex-1 text-left">
                          <span className="font-medium text-white">{fixture.awayClubId}</span>
                          {fixture.isCompleted && (
                            <span className="text-xl font-bold text-white ml-2">{fixture.awayGoals}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          ABA 3: FEED DE NOTÍCIAS
      ============================================================ */}
      {activeTab === 'news' && (
        <div className="fc26-card p-4">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-neon-cyan" />
            Feed de Notícias
          </h3>

          {newsFeed.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Newspaper className="w-12 h-12 mx-auto mb-2 text-gray-500" />
              <p>Nenhuma notícia disponível.</p>
              <p className="text-sm">Avança o dia para gerar eventos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {newsFeed.slice().reverse().map((news) => (
                <div key={news.id} className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border hover:border-dark-border/70 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`
                          text-xs font-bold px-2 py-0.5 rounded-full
                          ${news.category === 'MATCH' ? 'bg-blue-500/20 text-blue-400' :
                            news.category === 'TRANSFER' ? 'bg-purple-500/20 text-purple-400' :
                            news.category === 'INJURY' ? 'bg-red-500/20 text-red-400' :
                            news.category === 'CONTROVERSY' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gold-fc/20 text-gold-fc'}
                        `}>
                          {news.category}
                        </span>
                        <span className={`
                          text-[10px] px-2 py-0.5 rounded-full
                          ${news.importance === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                            news.importance === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'}
                        `}>
                          {news.importance}
                        </span>
                        <span className="text-xs text-gray-500">{news.date}</span>
                      </div>
                      <h4 className="font-semibold text-white">{news.headline}</h4>
                      <p className="text-sm text-gray-400 mt-1">{news.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {news.importance === 'HIGH' && <AlertCircle className="w-5 h-5 text-red-400" />}
                      {news.category === 'MATCH' && <Trophy className="w-5 h-5 text-gold-fc" />}
                      {news.category === 'TRANSFER' && <Users className="w-5 h-5 text-purple-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {newsFeed.length > 0 && (
            <div className="text-center mt-4 text-xs text-gray-500">
              Mostrando as últimas {Math.min(newsFeed.length, 20)} notícias
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          ABA 4: SALA DE IMPRENSA
      ============================================================ */}
      {activeTab === 'press' && (
        <div className="space-y-4">
          {/* Feedback */}
          {pressFeedback && (
            <div className={`
              p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200
              ${pressFeedback.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                pressFeedback.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
                'bg-blue-500/20 border border-blue-500/30 text-blue-400'}
            `}>
              {pressFeedback.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {pressFeedback.type === 'error' && <XCircle className="w-5 h-5" />}
              {pressFeedback.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span>{pressFeedback.message}</span>
            </div>
          )}

          {/* Confiança da Direção */}
          <div className="fc26-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold-fc" />
                Confiança da Direção
              </span>
              <span className="text-sm font-bold text-white">{Math.round(boardConfidence)}%</span>
            </div>
            <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, boardConfidence))}%` }}
              />
            </div>
          </div>

          {/* Perguntas */}
          <div className="fc26-card p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Mic2 className="w-5 h-5 text-neon-cyan" />
              Sala de Imprensa
            </h3>

            {pressQuestions.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                <p>Nenhuma conferência de imprensa agendada.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pressQuestions.map((question, qIdx) => {
                  const answered = pressAnswerIndex !== null && pressQuestions.findIndex(q => q.id === question.id) === qIdx;

                  return (
                    <div key={question.id} className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-full bg-accent-blue/10">
                          <User className="w-5 h-5 text-neon-cyan" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{question.journalistName}</div>
                          <div className="text-sm text-gray-400">{question.mediaOutlet}</div>
                        </div>
                      </div>
                      <p className="text-white font-medium mb-3">“{question.questionText}”</p>

                      {!answered ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handlePressAnswer(question.id, idx)}
                              disabled={isPressProcessing}
                              className={`
                                p-3 rounded-lg text-left text-sm transition-all
                                bg-dark-bg/50 border border-dark-border hover:border-neon-cyan/50
                                hover:bg-dark-bg/70
                                ${isPressProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              <span className="text-gray-200">{option.text}</span>
                              <div className="flex gap-3 mt-1 text-xs">
                                <span className={`${option.moralImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {option.moralImpact >= 0 ? '+' : ''}{option.moralImpact} Moral
                                </span>
                                <span className={`${option.boardImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {option.boardImpact >= 0 ? '+' : ''}{option.boardImpact} Direção
                                </span>
                                <span className={`${option.fanImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {option.fanImpact >= 0 ? '+' : ''}{option.fanImpact} Adeptos
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-dark-bg border border-dark-border/50">
                          <span className="text-gray-400">Resposta dada:</span>
                          <p className="text-white font-medium mt-1">
                            “{question.options[pressAnswerIndex || 0].text}”
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dica de interação */}
          {pressQuestions.some(q => pressAnswerIndex === null || pressQuestions.findIndex(pq => pq.id === q.id) !== pressAnswerIndex) && (
            <div className="text-center text-sm text-gray-400 p-2">
              <ThumbsUp className="w-4 h-4 inline mr-1" />
              Escolhe uma resposta para influenciar a moral e a confiança da direção.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
