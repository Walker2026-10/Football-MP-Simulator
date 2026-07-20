// src/components/ui/DashboardUI.tsx

'use client';

import React, { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { format, parseISO, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  User,
  Shield,
  Trophy,
  Calendar,
  Clock,
  Coins,
  Zap,
  Heart,
  Smile,
  ArrowRight,
  RefreshCw,
  Newspaper,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function DashboardUI() {
  const {
    saveState,
    currentDate,
    newsFeed,
    fixtures,
    isLoading,
    advanceDay,
    getCurrentPlayer,
    getCurrentClub,
  } = useGameStore();

  const player = getCurrentPlayer();
  const club = getCurrentClub();

  // Formatar data atual
  const formattedDate = useMemo(() => {
    if (!currentDate) return '—';
    try {
      return format(parseISO(currentDate), "dd 'de' MMMM 'de' yyyy", { locale: pt });
    } catch {
      return currentDate;
    }
  }, [currentDate]);

  // Próximo jogo
  const nextMatch = useMemo(() => {
    if (!fixtures || fixtures.length === 0) return null;
    const today = currentDate ? parseISO(currentDate) : new Date();
    const upcoming = fixtures
      .filter(f => !f.played && f.matchDate)
      .sort((a, b) => a.matchDate.localeCompare(b.matchDate));
    return upcoming[0] || null;
  }, [fixtures, currentDate]);

  // Dias até ao próximo jogo
  const daysUntilMatch = useMemo(() => {
    if (!nextMatch || !currentDate) return null;
    try {
      const matchDate = parseISO(nextMatch.matchDate);
      const today = parseISO(currentDate);
      return differenceInDays(matchDate, today);
    } catch {
      return null;
    }
  }, [nextMatch, currentDate]);

  // Últimas 3 notícias
  const latestNews = useMemo(() => {
    return newsFeed.slice(-3).reverse();
  }, [newsFeed]);

  // Estado de carregamento do botão
  const [isAdvancing, setIsAdvancing] = React.useState(false);

  const handleAdvanceDay = async () => {
    if (isAdvancing || isLoading) return;
    setIsAdvancing(true);
    try {
      await advanceDay();
    } catch (error) {
      console.error('Erro ao avançar dia:', error);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Se não houver carreira iniciada
  if (!saveState || !player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="fc26-card max-w-md w-full p-8 border-gold-fc/30">
          <Trophy className="w-16 h-16 text-gold-fc mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Nenhuma Carreira Ativa</h2>
          <p className="text-gray-400 mb-6">
            Inicia uma nova carreira no menu principal para começar a tua jornada.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-neon-cyan to-accent-blue text-dark-bg font-bold py-2 px-6 rounded-lg hover:shadow-neon-cyan transition"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <div className="fc26-card flex flex-col md:flex-row md:items-center justify-between gap-4 border-dark-border">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-accent-blue/10 border border-accent-blue/20">
            <User className="w-8 h-8 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{player.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-neon-cyan" />
                {player.position}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-gold-fc" />
                Overall {player.overall}
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-gold-fc" />
                {club?.name || 'Sem clube'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Saldo</div>
            <div className="text-lg font-bold text-neon-green flex items-center gap-1">
              <Coins className="w-5 h-5" />
              {player.sims.bankBalance.toLocaleString('pt-PT')} €
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Data</div>
            <div className="text-sm font-medium text-white flex items-center gap-1">
              <Calendar className="w-4 h-4 text-neon-cyan" />
              {formattedDate}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PAINEL THE SIMS (VIDA PESSOAL)
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Energia */}
        <div className="fc26-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Energia
            </span>
            <span className="text-sm font-bold text-white">
              {Math.round(player.sims.energy)}%
            </span>
          </div>
          <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, player.sims.energy))}%` }}
            />
          </div>
        </div>

        {/* Felicidade */}
        <div className="fc26-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Smile className="w-5 h-5 text-pink-400" />
              Felicidade
            </span>
            <span className="text-sm font-bold text-white">
              {Math.round(player.sims.happiness)}%
            </span>
          </div>
          <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-pink-400 to-purple-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, player.sims.happiness))}%` }}
            />
          </div>
        </div>

        {/* Moral */}
        <div className="fc26-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Moral
            </span>
            <span className="text-sm font-bold text-white">
              {player.sims.morale}
            </span>
          </div>
          <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-orange-400 to-green-400 transition-all duration-500"
              style={{
                width: `${
                  player.sims.morale === 'Excelente' ? 100 :
                  player.sims.morale === 'Boa' ? 75 :
                  player.sims.morale === 'Normal' ? 50 :
                  player.sims.morale === 'Baixa' ? 25 : 10
                }%`
              }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          PRÓXIMO JOGO + BOTÃO AVANÇAR
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Próximo jogo */}
        <div className="fc26-card p-4 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Próximo Jogo
            </div>
            {nextMatch ? (
              <>
                <div className="text-lg font-bold text-white">
                  {nextMatch.homeTeamName} vs {nextMatch.awayTeamName}
                </div>
                <div className="text-sm text-gray-300 flex items-center gap-3 mt-1">
                  <span>{nextMatch.matchDate}</span>
                  {daysUntilMatch !== null && (
                    <span className="flex items-center gap-1 text-neon-cyan">
                      <Clock className="w-4 h-4" />
                      {daysUntilMatch === 0 ? 'Hoje!' : `daqui a ${daysUntilMatch} dias`}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-gray-400">Nenhum jogo agendado</div>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {nextMatch ? 'Competição: Liga' : '—'}
          </div>
        </div>

        {/* Botão Avançar Dia */}
        <div className="fc26-card p-4 flex flex-col items-center justify-center border-neon-cyan/20 hover:border-neon-cyan/50 transition">
          <button
            onClick={handleAdvanceDay}
            disabled={isAdvancing || isLoading}
            className={`
              w-full py-3 px-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2
              transition-all duration-200
              ${isAdvancing || isLoading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-cyan to-accent-blue text-dark-bg hover:shadow-neon-cyan hover:scale-[1.02]'
              }
            `}
          >
            {isAdvancing || isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            AVANÇAR DIA
          </button>
          <span className="text-xs text-gray-500 mt-2">
            Simula um dia de jogo
          </span>
        </div>
      </div>

      {/* ============================================================
          FEED DE NOTÍCIAS RÁPIDAS
      ============================================================ */}
      <div className="fc26-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-gold-fc" />
            Últimas Notícias
          </h3>
          <span className="text-xs text-gray-500">{newsFeed.length} notícias</span>
        </div>

        {latestNews.length === 0 ? (
          <div className="text-sm text-gray-500 flex items-center gap-2 py-2">
            <AlertCircle className="w-4 h-4" />
            Nenhuma notícia disponível
          </div>
        ) : (
          <div className="space-y-2">
            {latestNews.map((news) => (
              <div
                key={news.id}
                className="flex items-start gap-3 p-2 rounded-lg bg-dark-bg/50 border border-dark-border/50 hover:border-dark-border transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-neon-cyan">
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-500">{news.date}</span>
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full
                      ${news.importance === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        news.importance === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'}
                    `}>
                      {news.importance}
                    </span>
                  </div>
                  <p className="text-sm text-white mt-0.5 line-clamp-2">{news.headline}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
