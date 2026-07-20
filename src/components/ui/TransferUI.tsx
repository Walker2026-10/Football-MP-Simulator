// src/components/ui/TransferUI.tsx

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Search,
  Filter,
  User,
  Coins,
  Calendar,
  Shield,
  Target,
  Send,
  Eye,
  EyeOff,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Users,
  Briefcase,
  Loader2,
  Plus,
  Minus,
  DollarSign,
  Building2,
  Star,
  TrendingUp,
  Zap,
  Award,
} from 'lucide-react';
import { Player, Club } from '@/types/game';

// ============================================================
// TIPOS
// ============================================================

interface Scout {
  id: string;
  name: string;
  rating: number;
  region: string;
  dailyCost: number;
}

interface ScoutReport {
  targetPlayerId: string;
  accurateAttributes: Partial<Player['attributes']>;
  potentialRange: [number, number];
  fitRating: number;
  isComplete: boolean;
}

interface TransferOffer {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  toClubName: string;
  transferFee: number;
  offeredSalary: number;
  contractYears: number;
  loan: boolean;
  loanDuration?: number;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface NegotiationParams {
  transferFee: number;
  salary: number;
  contractYears: number;
  isLoan: boolean;
  loanCoverage: number;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function TransferUI() {
  const store = useGameStore();
  const player = store.getCurrentPlayer();
  const club = store.getCurrentClub();
  const clubs = store.clubs;
  const { processTransferOffer, scoutPlayer, getPlayerById, getClubById, saveState } = store;

  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('Todas');
  const [ageRange, setAgeRange] = useState<[number, number]>([15, 40]);
  const [minOverall, setMinOverall] = useState(50);
  const [maxOverall, setMaxOverall] = useState(99);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [negotiationParams, setNegotiationParams] = useState<NegotiationParams>({
    transferFee: 0,
    salary: 0,
    contractYears: 3,
    isLoan: false,
    loanCoverage: 50,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [negotiationFeedback, setNegotiationFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'market' | 'scouting' | 'offers'>('market');
  const [scoutReports, setScoutReports] = useState<ScoutReport[]>([]);
  const [scoutingTarget, setScoutingTarget] = useState<string>('');

  // Dados mock de olheiros
  const scouts: Scout[] = useMemo(() => [
    { id: 's1', name: 'João Pereira', rating: 85, region: 'Portugal', dailyCost: 500 },
    { id: 's2', name: 'Maria Silva', rating: 78, region: 'Brasil', dailyCost: 450 },
    { id: 's3', name: 'Carlos García', rating: 72, region: 'Espanha', dailyCost: 400 },
    { id: 's4', name: 'James Wilson', rating: 65, region: 'Inglaterra', dailyCost: 350 },
  ], []);

  // Propostas recebidas (mock)
  const [incomingOffers, setIncomingOffers] = useState<TransferOffer[]>([
    {
      id: 'off1',
      playerId: player?.id || 'mock-player',
      fromClubId: 'mci',
      toClubId: 'ars',
      toClubName: 'Arsenal',
      transferFee: 25000000,
      offeredSalary: 6000000,
      contractYears: 4,
      loan: false,
      expiresAt: '2026-10-01',
      status: 'pending',
    },
    {
      id: 'off2',
      playerId: player?.id || 'mock-player',
      fromClubId: 'mci',
      toClubId: 'liverpool',
      toClubName: 'Liverpool',
      transferFee: 30000000,
      offeredSalary: 7000000,
      contractYears: 5,
      loan: false,
      expiresAt: '2026-10-05',
      status: 'pending',
    },
  ]);

  // Lista de jogadores no mercado (todos os jogadores que não pertencem ao clube do utilizador)
  const marketPlayers = useMemo(() => {
    if (!club) return [];
    const allPlayers: Player[] = [];
    clubs.forEach(c => {
      if (c.id !== club.id) {
        c.mainSquad.forEach(p => allPlayers.push(p));
        c.sub15Squad.forEach(p => allPlayers.push(p));
      }
    });
    return allPlayers;
  }, [clubs, club]);

  // Filtrar jogadores
  const filteredPlayers = useMemo(() => {
    let filtered = marketPlayers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }

    if (positionFilter !== 'Todas') {
      filtered = filtered.filter(p => p.position === positionFilter);
    }

    filtered = filtered.filter(p => p.age >= ageRange[0] && p.age <= ageRange[1]);
    filtered = filtered.filter(p => p.overall >= minOverall && p.overall <= maxOverall);

    return filtered.sort((a, b) => b.overall - a.overall);
  }, [marketPlayers, searchTerm, positionFilter, ageRange, minOverall, maxOverall]);

  // Posições disponíveis
  const positions = useMemo(() => {
    const posSet = new Set<string>();
    marketPlayers.forEach(p => posSet.add(p.position));
    return ['Todas', ...Array.from(posSet)];
  }, [marketPlayers]);

  // ============================================================
  // FUNÇÕES DE NEGOCIAÇÃO
  // ============================================================

  const handleOpenNegotiation = (player: Player) => {
    setSelectedPlayer(player);
    const marketValue = player.marketValue || 1000000;
    setNegotiationParams({
      transferFee: Math.round(marketValue * 0.9 / 1000) * 1000,
      salary: Math.round(player.salary * 1.1 / 1000) * 1000,
      contractYears: 3,
      isLoan: false,
      loanCoverage: 50,
    });
    setShowNegotiationModal(true);
  };

  const handleNegotiate = () => {
    if (!selectedPlayer || !club) return;

    setIsProcessing(true);
    setNegotiationFeedback(null);

    // Simular negociação (integrando com transferEngine)
    setTimeout(() => {
      const accepted = Math.random() < 0.6;

      if (accepted) {
        // Verificar orçamento
        const totalCost = negotiationParams.transferFee + (negotiationParams.salary * negotiationParams.contractYears * 0.3);
        if (club.budget < totalCost) {
          setNegotiationFeedback({
            type: 'error',
            message: `Orçamento insuficiente! Precisas de ${totalCost.toLocaleString()}€, tens ${club.budget.toLocaleString()}€.`,
          });
          setIsProcessing(false);
          return;
        }

        setNegotiationFeedback({
          type: 'success',
          message: `Proposta aceite! ${selectedPlayer.name} junta-se ao ${club.name} por ${negotiationParams.transferFee.toLocaleString()}€.`,
        });
        // Simular atualização dos clubes (na prática, chamar processTransfer)
        if (saveState) {
          saveState.logs.push(`Transferência concluída: ${selectedPlayer.name} para ${club.name}.`);
        }
        setShowNegotiationModal(false);
      } else {
        setNegotiationFeedback({
          type: 'error',
          message: `Proposta recusada. O clube vendedor não aceita os termos.`,
        });
      }

      setIsProcessing(false);
      setTimeout(() => setNegotiationFeedback(null), 4000);
    }, 1000);
  };

  const handleRespondOffer = (offerId: string, accept: boolean) => {
    const offer = incomingOffers.find(o => o.id === offerId);
    if (!offer) return;

    setIncomingOffers(prev => prev.map(o =>
      o.id === offerId ? { ...o, status: accept ? 'accepted' : 'rejected' } : o
    ));

    if (saveState) {
      saveState.logs.push(
        accept
          ? `Transferência aceite! Jogador ruma ao ${offer.toClubName}.`
          : `Transferência rejeitada para ${offer.toClubName}.`
      );
    }

    // Se aceite, simular a saída do jogador
    if (accept && player) {
      // Na prática, remover o jogador do clube e adicionar ao novo
      // Aqui apenas log
      if (saveState) {
        saveState.logs.push(`${player.name} transferido para ${offer.toClubName} por ${offer.transferFee.toLocaleString()}€.`);
      }
    }
  };

  const handleSendScout = (playerId: string) => {
    if (!scoutingTarget) return;
    scoutPlayer(playerId);
    // Simular relatório
    const target = getPlayerById(playerId);
    if (target) {
      const report: ScoutReport = {
        targetPlayerId: playerId,
        accurateAttributes: {
          pace: target.attributes.pace + Math.floor(Math.random() * 6 - 3),
          shooting: target.attributes.shooting + Math.floor(Math.random() * 6 - 3),
          passing: target.attributes.passing + Math.floor(Math.random() * 6 - 3),
          dribbling: target.attributes.dribbling + Math.floor(Math.random() * 6 - 3),
          defending: target.attributes.defending + Math.floor(Math.random() * 6 - 3),
          physical: target.attributes.physical + Math.floor(Math.random() * 6 - 3),
        },
        potentialRange: [target.potential - 5, target.potential + 5],
        fitRating: 50 + Math.floor(Math.random() * 40),
        isComplete: Math.random() < 0.6,
      };
      setScoutReports(prev => [...prev, report]);
      setScoutingTarget('');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!player || !club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
        <div className="fc26-card max-w-md w-full p-8">
          <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sem Jogador Ativo</h2>
          <p className="text-gray-400">Inicia uma carreira para aceder ao mercado de transferências.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* ============================================================
          TABS
      ============================================================ */}
      <div className="flex gap-2 border-b border-dark-border pb-2 overflow-x-auto">
        {[
          { id: 'market', label: 'Mercado', icon: <Users className="w-4 h-4" /> },
          { id: 'scouting', label: 'Scouting', icon: <Eye className="w-4 h-4" /> },
          { id: 'offers', label: 'Propostas Recebidas', icon: <FileText className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${activeTab === tab.id
                ? 'bg-accent-blue/20 text-white border border-accent-blue/50'
                : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'offers' && incomingOffers.filter(o => o.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {incomingOffers.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================================
          TAB: MERCADO
      ============================================================ */}
      {activeTab === 'market' && (
        <>
          {/* Filtros */}
          <div className="fc26-card p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-gray-400 mb-1 block">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome do jogador..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                  />
                </div>
              </div>

              <div className="min-w-[150px]">
                <label className="text-sm text-gray-400 mb-1 block">Posição</label>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[120px]">
                <label className="text-sm text-gray-400 mb-1 block">Overall Min</label>
                <input
                  type="number"
                  value={minOverall}
                  onChange={(e) => setMinOverall(Number(e.target.value))}
                  min={1}
                  max={99}
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>

              <div className="min-w-[120px]">
                <label className="text-sm text-gray-400 mb-1 block">Overall Max</label>
                <input
                  type="number"
                  value={maxOverall}
                  onChange={(e) => setMaxOverall(Number(e.target.value))}
                  min={1}
                  max={99}
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>
            </div>
          </div>

          {/* Lista de jogadores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPlayers.length === 0 ? (
              <div className="fc26-card p-8 text-center col-span-2">
                <div className="text-gray-400">Nenhum jogador encontrado com os filtros atuais.</div>
              </div>
            ) : (
              filteredPlayers.map(p => {
                const marketValue = p.marketValue || 1000000;
                const isSub15 = p.isSub15;
                const clubName = getClubById(p.clubId || '')?.name || 'Agente Livre';

                return (
                  <div key={p.id} className="fc26-card p-4 hover:border-neon-cyan/30 transition">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{p.name}</h3>
                          {isSub15 && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                              Sub-15
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-1">
                          <span>{p.position}</span>
                          <span>•</span>
                          <span>{p.age} anos</span>
                          <span>•</span>
                          <span>Overall {p.overall}</span>
                          <span>•</span>
                          <span>Potencial {p.potential || 80}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-neon-cyan font-medium flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            {marketValue.toLocaleString()} €
                          </span>
                          <span className="text-gray-400">{clubName}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleOpenNegotiation(p)}
                            className="px-3 py-1.5 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Propor Negociação
                          </button>
                          <button
                            onClick={() => {
                              setScoutingTarget(p.id);
                              handleSendScout(p.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gold-fc/20 text-gold-fc hover:bg-gold-fc/30 transition text-sm flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Scout
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Valor de Mercado</div>
                        <div className="text-sm font-bold text-gold-fc">
                          {marketValue.toLocaleString()} €
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ============================================================
          TAB: SCOUTING
      ============================================================ */}
      {activeTab === 'scouting' && (
        <div className="space-y-4">
          {/* Olheiros disponíveis */}
          <div className="fc26-card p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-neon-cyan" />
              Olheiros Disponíveis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scouts.map(scout => (
                <div key={scout.id} className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{scout.name}</div>
                    <div className="text-sm text-gray-400">
                      Rating: {scout.rating} • {scout.region}
                    </div>
                    <div className="text-xs text-gray-500">Custo: {scout.dailyCost} €/dia</div>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-lg bg-accent-blue/20 text-white hover:bg-accent-blue/30 transition text-sm"
                    onClick={() => {
                      // Encontrar um jogador aleatório para scout
                      const randomPlayer = marketPlayers[Math.floor(Math.random() * marketPlayers.length)];
                      if (randomPlayer) {
                        setScoutingTarget(randomPlayer.id);
                        handleSendScout(randomPlayer.id);
                      }
                    }}
                  >
                    Enviar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Relatórios de Scouting */}
          <div className="fc26-card p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-fc" />
              Relatórios de Scouting
            </h3>
            {scoutReports.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p>Nenhum relatório disponível.</p>
                <p className="text-sm">Envia um olheiro para descobrir promessas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scoutReports.map((report, idx) => {
                  const target = getPlayerById(report.targetPlayerId);
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-white">{target?.name || 'Desconhecido'}</span>
                          {report.isComplete ? (
                            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              Completo
                            </span>
                          ) : (
                            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                              Incompleto
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">Fit: {report.fitRating}%</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Potencial: {report.potentialRange[0]} - {report.potentialRange[1]}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        {Object.entries(report.accurateAttributes).map(([key, value]) => (
                          <span key={key} className="px-2 py-0.5 rounded-full bg-dark-card border border-dark-border">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB: PROPOSTAS RECEBIDAS
      ============================================================ */}
      {activeTab === 'offers' && (
        <div className="fc26-card p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-gold-fc" />
            Propostas Recebidas
          </h3>
          {incomingOffers.filter(o => o.status === 'pending').length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p>Nenhuma proposta recebida no momento.</p>
              <p className="text-sm">Os clubes podem contactar-te quando tiveres um bom desempenho.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingOffers.filter(o => o.status === 'pending').map(offer => (
                <div key={offer.id} className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-white">{offer.toClubName}</h4>
                      <div className="text-sm text-gray-400 mt-1">
                        {offer.loan ? 'Empréstimo' : 'Transferência'} • {offer.transferFee.toLocaleString()} €
                        {offer.loan && ` • Cobertura: ${offer.loanCoverage || 50}%`}
                      </div>
                      <div className="text-sm text-gray-400">
                        Salário: {offer.offeredSalary.toLocaleString()} €/ano • {offer.contractYears} anos
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Expira em: {offer.expiresAt}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespondOffer(offer.id, true)}
                        className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition font-medium text-sm"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleRespondOffer(offer.id, false)}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium text-sm"
                      >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Propostas passadas */}
          {incomingOffers.filter(o => o.status !== 'pending').length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Histórico</h4>
              <div className="space-y-2">
                {incomingOffers.filter(o => o.status !== 'pending').map(offer => (
                  <div key={offer.id} className="p-3 rounded-lg bg-dark-bg/30 border border-dark-border/50 text-sm flex items-center justify-between">
                    <span className="text-gray-400">{offer.toClubName}</span>
                    <span className={`
                      ${offer.status === 'accepted' ? 'text-green-400' : 'text-red-400'}
                    `}>
                      {offer.status === 'accepted' ? '✅ Aceite' : '❌ Recusado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          MODAL DE NEGOCIAÇÃO
      ============================================================ */}
      {showNegotiationModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative fc26-card max-w-md w-full border border-dark-border shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
            <button
              onClick={() => setShowNegotiationModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Send className="w-6 h-6 text-neon-cyan" />
              Negociação
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {selectedPlayer.name} • {selectedPlayer.position} • Overall {selectedPlayer.overall}
            </p>

            {/* Feedback */}
            {negotiationFeedback && (
              <div className={`
                p-3 rounded-lg mb-4 flex items-center gap-2 text-sm
                ${negotiationFeedback.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  negotiationFeedback.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'}
              `}>
                {negotiationFeedback.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {negotiationFeedback.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                {negotiationFeedback.type === 'info' && <Clock className="w-4 h-4" />}
                <span>{negotiationFeedback.message}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Valor de Transferência (€)
                </label>
                <input
                  type="number"
                  value={negotiationParams.transferFee}
                  onChange={(e) => setNegotiationParams(prev => ({
                    ...prev,
                    transferFee: Number(e.target.value)
                  }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Salário Anual (€)
                </label>
                <input
                  type="number"
                  value={negotiationParams.salary}
                  onChange={(e) => setNegotiationParams(prev => ({
                    ...prev,
                    salary: Number(e.target.value)
                  }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duração do Contrato (anos)
                </label>
                <input
                  type="number"
                  value={negotiationParams.contractYears}
                  onChange={(e) => setNegotiationParams(prev => ({
                    ...prev,
                    contractYears: Number(e.target.value)
                  }))}
                  min={1}
                  max={5}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={negotiationParams.isLoan}
                    onChange={(e) => setNegotiationParams(prev => ({
                      ...prev,
                      isLoan: e.target.checked
                    }))}
                    className="w-4 h-4 accent-accent-blue"
                  />
                  Empréstimo
                </label>

                {negotiationParams.isLoan && (
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">
                      Cobertura Salarial (%)
                    </label>
                    <input
                      type="number"
                      value={negotiationParams.loanCoverage}
                      onChange={(e) => setNegotiationParams(prev => ({
                        ...prev,
                        loanCoverage: Number(e.target.value)
                      }))}
                      min={0}
                      max={100}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleNegotiate}
                disabled={isProcessing}
                className={`
                  w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2
                  ${!isProcessing
                    ? 'bg-gradient-to-r from-neon-cyan to-accent-blue text-dark-bg hover:shadow-neon-cyan transition'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Enviar Proposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
