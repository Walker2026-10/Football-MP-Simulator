// src/components/ui/TrainingUI.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Zap,
  Target,
  Send,
  Users,
  Shield,
  Dumbbell,
  Activity,
  Heart,
  AlertTriangle,
  Clock,
  Pill,
  Stethoscope,
  Scissors,
  Bed,
  Syringe,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { PlayerAttributes } from '@/types/game';

// ============================================================
// TIPOS
// ============================================================

interface TrainingSessionOption {
  id: string;
  name: string;
  focusArea: keyof PlayerAttributes;
  icon: React.ReactNode;
  intensity: 'Baixa' | 'Média' | 'Alta' | 'Intensa';
  energyCost: number;
  injuryRisk: number;
  description: string;
}

interface TreatmentPlan {
  type: 'Fisioterapia' | 'Descanso Total' | 'Injeção/Infiltração' | 'Cirurgia';
  cost: number;
  recoverySpeedMultiplier: number;
  riskFactor: number;
  label: string;
  description: string;
}

// ============================================================
// DADOS DE EXEMPLO (SESSÕES DE TREINO)
// ============================================================

const TRAINING_SESSIONS: TrainingSessionOption[] = [
  {
    id: 'pace',
    name: 'Treino de Ritmo',
    focusArea: 'pace',
    icon: <Zap className="w-5 h-5" />,
    intensity: 'Alta',
    energyCost: 30,
    injuryRisk: 0.2,
    description: 'Melhora a velocidade e agilidade.',
  },
  {
    id: 'shooting',
    name: 'Treino de Remate',
    focusArea: 'shooting',
    icon: <Target className="w-5 h-5" />,
    intensity: 'Média',
    energyCost: 25,
    injuryRisk: 0.1,
    description: 'Aperfeiçoa a finalização e precisão.',
  },
  {
    id: 'passing',
    name: 'Treino de Passe',
    focusArea: 'passing',
    icon: <Send className="w-5 h-5" />,
    intensity: 'Baixa',
    energyCost: 20,
    injuryRisk: 0.05,
    description: 'Desenvolve a visão e qualidade de passe.',
  },
  {
    id: 'dribbling',
    name: 'Treino de Drible',
    focusArea: 'dribbling',
    icon: <Users className="w-5 h-5" />,
    intensity: 'Média',
    energyCost: 25,
    injuryRisk: 0.15,
    description: 'Aprimora o controlo de bola e capacidade de 1x1.',
  },
  {
    id: 'defending',
    name: 'Treino de Defesa',
    focusArea: 'defending',
    icon: <Shield className="w-5 h-5" />,
    intensity: 'Alta',
    energyCost: 30,
    injuryRisk: 0.2,
    description: 'Fortalecimento defensivo e antecipação.',
  },
  {
    id: 'physical',
    name: 'Treino Físico',
    focusArea: 'physical',
    icon: <Dumbbell className="w-5 h-5" />,
    intensity: 'Intensa',
    energyCost: 35,
    injuryRisk: 0.3,
    description: 'Ganha força, resistência e potência física.',
  },
];

// ============================================================
// PLANOS DE TRATAMENTO
// ============================================================

const TREATMENT_PLANS: TreatmentPlan[] = [
  {
    type: 'Descanso Total',
    cost: 0,
    recoverySpeedMultiplier: 1.0,
    riskFactor: 0.05,
    label: 'Descanso Total',
    description: 'Recuperação natural, sem riscos.',
  },
  {
    type: 'Fisioterapia',
    cost: 500,
    recoverySpeedMultiplier: 1.3,
    riskFactor: 0.1,
    label: 'Fisioterapia',
    description: 'Acelera a recuperação com baixo risco.',
  },
  {
    type: 'Injeção/Infiltração',
    cost: 1500,
    recoverySpeedMultiplier: 1.7,
    riskFactor: 0.3,
    label: 'Injeção / Infiltração',
    description: 'Permite jogar mais cedo, mas com risco de recaída.',
  },
  {
    type: 'Cirurgia',
    cost: 10000,
    recoverySpeedMultiplier: 0.5,
    riskFactor: 0.15,
    label: 'Cirurgia',
    description: 'Solução definitiva para lesões graves.',
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function TrainingUI() {
  const store = useGameStore();
  const player = store.getCurrentPlayer();
  const { trainPlayer, saveState, getCurrentClub } = store;

  // Estados locais
  const [selectedSession, setSelectedSession] = useState<TrainingSessionOption>(TRAINING_SESSIONS[0]);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentPlan>(TREATMENT_PLANS[0]);
  const [treatmentFeedback, setTreatmentFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isTreating, setIsTreating] = useState(false);

  // Calcular recommended workload
  const workloadRecommendation = useMemo(() => {
    if (!player) return { intensity: 'Média', reason: 'Sem dados disponíveis.' };
    const energy = player.sims.energy;
    if (energy < 30) return { intensity: 'Baixa', reason: 'Energia muito baixa. Risco de lesão elevado.' };
    if (energy < 50) return { intensity: 'Média', reason: 'Energia moderada. Treino médio.' };
    if (energy >= 80) return { intensity: 'Intensa', reason: 'Energia alta. Aproveitar para evoluir.' };
    return { intensity: 'Alta', reason: 'Energia boa. Treino intenso.' };
  }, [player]);

  // Verificar se o jogador está lesionado
  const isInjured = player?.injury && player.injury.durationDays > 0;

  // Executar treino
  const handleTrain = () => {
    if (!player || isTraining || isInjured) return;

    // Verificar energia
    if (player.sims.energy < selectedSession.energyCost) {
      setTreatmentFeedback({
        type: 'error',
        message: `Energia insuficiente para este treino (${selectedSession.energyCost} energia necessária).`,
      });
      setTimeout(() => setTreatmentFeedback(null), 4000);
      return;
    }

    setIsTraining(true);
    try {
      trainPlayer(selectedSession.focusArea);
      setTreatmentFeedback({
        type: 'success',
        message: `Treino de ${selectedSession.name} concluído com sucesso!`,
      });
    } catch (error) {
      setTreatmentFeedback({
        type: 'error',
        message: `Erro ao executar treino: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    } finally {
      setIsTraining(false);
      setTimeout(() => setTreatmentFeedback(null), 4000);
    }
  };

  // Aplicar tratamento
  const handleApplyTreatment = () => {
    if (!player || !isInjured || isTreating) return;

    setIsTreating(true);
    try {
      // Simular aplicação do tratamento via medicalEngine
      const medicalStaff = {
        doctorQuality: 70,
        physioQuality: 65,
      };
      // Aplicar tratamento (simplificado - idealmente via store)
      const updatedPlayer = { ...player };
      const injury = { ...updatedPlayer.injury! };
      const plan = selectedTreatment;

      // Simular redução do tempo de recuperação
      const effectiveMultiplier = plan.recoverySpeedMultiplier * (0.8 + Math.random() * 0.4);
      injury.durationDays = Math.max(0, Math.round(injury.durationDays / effectiveMultiplier));

      // Risco de complicação
      const risk = plan.riskFactor * (1 - 0.5); // simplificado
      if (Math.random() < risk) {
        injury.durationDays += 3;
        setTreatmentFeedback({
          type: 'error',
          message: `Complicação no tratamento! +3 dias de recuperação.`,
        });
      } else {
        setTreatmentFeedback({
          type: 'success',
          message: `Tratamento de ${plan.label} aplicado com sucesso!`,
        });
      }

      if (injury.durationDays <= 0) {
        updatedPlayer.injury = null;
        setTreatmentFeedback({
          type: 'success',
          message: `Lesão curada! ${player.name} está apto para treinar.`,
        });
      } else {
        updatedPlayer.injury = injury;
      }

      // Atualizar jogador na store (simplificado - idealmente via store)
      if (saveState?.userPlayer) {
        saveState.userPlayer = updatedPlayer;
        store.saveGame();
      }

      // Atualizar estado local
      setTreatmentFeedback(prev => prev || {
        type: 'info',
        message: 'Tratamento aplicado. Aguarde recuperação.',
      });

    } catch (error) {
      setTreatmentFeedback({
        type: 'error',
        message: `Erro ao aplicar tratamento: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    } finally {
      setIsTreating(false);
      setTimeout(() => setTreatmentFeedback(null), 5000);
    }
  };

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
        <div className="fc26-card max-w-md w-full p-8">
          <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sem Jogador Ativo</h2>
          <p className="text-gray-400">Inicia uma carreira para aceder ao centro de treinos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* ============================================================
          FEEDBACK
      ============================================================ */}
      {treatmentFeedback && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200
          ${treatmentFeedback.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
            treatmentFeedback.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
            'bg-blue-500/20 border border-blue-500/30 text-blue-400'}
        `}>
          {treatmentFeedback.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {treatmentFeedback.type === 'error' && <XCircle className="w-5 h-5" />}
          {treatmentFeedback.type === 'info' && <Clock className="w-5 h-5" />}
          <span>{treatmentFeedback.message}</span>
        </div>
      )}

      {/* ============================================================
          GRELHA DE ATRIBUTOS ATUAIS
      ============================================================ */}
      <div className="fc26-card p-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-neon-cyan" />
          Atributos do Jogador
          <span className="text-sm font-normal text-gray-400 ml-2">
            (Overall: {player.overall})
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(player.attributes).map(([key, value]) => {
            const attrKey = key as keyof PlayerAttributes;
            const potential = player.potential;
            const maxValue = Math.min(99, potential);
            const percentage = (value / 99) * 100;
            const potentialPercentage = (potential / 99) * 100;

            // Mapear nomes para exibição
            const labels: Record<keyof PlayerAttributes, string> = {
              pace: 'Ritmo',
              shooting: 'Remate',
              passing: 'Passe',
              dribbling: 'Drible',
              defending: 'Defesa',
              physical: 'Físico',
            };

            const icons: Record<keyof PlayerAttributes, React.ReactNode> = {
              pace: <Zap className="w-4 h-4" />,
              shooting: <Target className="w-4 h-4" />,
              passing: <Send className="w-4 h-4" />,
              dribbling: <Users className="w-4 h-4" />,
              defending: <Shield className="w-4 h-4" />,
              physical: <Dumbbell className="w-4 h-4" />,
            };

            return (
              <div key={key} className="p-3 rounded-lg bg-dark-bg/50 border border-dark-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                    {icons[attrKey]}
                    {labels[attrKey]}
                  </span>
                  <span className="text-sm font-bold text-white">{Math.round(value)}</span>
                </div>
                <div className="relative w-full h-2 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-accent-blue transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  {/* Linha de potencial */}
                  <div
                    className="absolute top-0 w-0.5 h-full bg-gold-fc"
                    style={{ left: `${potentialPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Atual: {Math.round(value)}</span>
                  <span>Potencial: {potential}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SELETOR DE FOCO DE TREINO + EXECUÇÃO
      ============================================================ */}
      <div className="fc26-card p-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-gold-fc" />
          Central de Treinos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Lista de sessões */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRAINING_SESSIONS.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${selectedSession.id === session.id
                      ? 'bg-accent-blue/10 border-accent-blue/50 ring-1 ring-accent-blue/50'
                      : 'bg-dark-bg/50 border-dark-border hover:border-dark-border/70 hover:bg-dark-bg/70'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-dark-card border border-dark-border">
                      {session.icon}
                    </div>
                    <div>
                      <div className="font-medium text-white">{session.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">{session.description}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className={`
                      px-2 py-0.5 rounded-full
                      ${session.intensity === 'Baixa' ? 'bg-green-500/20 text-green-400' :
                        session.intensity === 'Média' ? 'bg-yellow-500/20 text-yellow-400' :
                        session.intensity === 'Alta' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'}
                    `}>
                      {session.intensity}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      Energia: {session.energyCost}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                      Risco: {(session.injuryRisk * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Painel de execução */}
          <div className="fc26-card p-4 border-dark-border bg-dark-bg/30">
            <h3 className="font-semibold text-white mb-3">Sessão Selecionada</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Treino:</span>
                <span className="text-white font-medium">{selectedSession.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Intensidade:</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${selectedSession.intensity === 'Baixa' ? 'bg-green-500/20 text-green-400' :
                    selectedSession.intensity === 'Média' ? 'bg-yellow-500/20 text-yellow-400' :
                    selectedSession.intensity === 'Alta' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'}
                `}>
                  {selectedSession.intensity}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Energia necessária:</span>
                <span className="text-white">{selectedSession.energyCost}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Risco de lesão:</span>
                <span className="text-red-400">{(selectedSession.injuryRisk * 100).toFixed(0)}%</span>
              </div>

              <button
                onClick={handleTrain}
                disabled={isTraining || isInjured || player.sims.energy < selectedSession.energyCost}
                className={`
                  w-full py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2
                  ${!isTraining && !isInjured && player.sims.energy >= selectedSession.energyCost
                    ? 'bg-gradient-to-r from-neon-green to-green-500 text-dark-bg hover:shadow-neon-green transition'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isTraining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Dumbbell className="w-4 h-4" />
                )}
                {isInjured ? 'Lesionado' : 'Executar Treino'}
              </button>

              {isInjured && (
                <div className="text-xs text-red-400 text-center mt-2">
                  Jogador lesionado. Não é possível treinar.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PAINEL DE CONDIÇÃO FÍSICA & FADIGA
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="fc26-card p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Condição Física
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Energia</span>
                <span>{Math.round(player.sims.energy)}%</span>
              </div>
              <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, player.sims.energy))}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Fitness</span>
                <span>{player.fitness !== undefined ? Math.round(player.fitness) : '—'}%</span>
              </div>
              <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, player.fitness || 0))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="fc26-card p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Recomendação de Carga
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Intensidade recomendada:</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${workloadRecommendation.intensity === 'Baixa' ? 'bg-green-500/20 text-green-400' :
                  workloadRecommendation.intensity === 'Média' ? 'bg-yellow-500/20 text-yellow-400' :
                  workloadRecommendation.intensity === 'Alta' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'}
              `}>
                {workloadRecommendation.intensity}
              </span>
            </div>
            <p className="text-sm text-gray-300">{workloadRecommendation.reason}</p>
            {isInjured && (
              <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Jogador lesionado. Repouso absoluto.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          GABINETE MÉDICO
      ============================================================ */}
      <div className="fc26-card p-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-neon-cyan" />
          Gabinete Médico
        </h2>

        {isInjured ? (
          <div className="space-y-4">
            {/* Diagnóstico */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h4 className="font-semibold text-white">Lesão Diagnósticada</h4>
                  <p className="text-sm text-gray-400">
                    {player.injury?.type || 'Lesão desconhecida'} • {player.injury?.severity || 'Leve'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>Tempo estimado: <span className="text-white font-medium">{player.injury?.durationDays || 0} dias</span></span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Activity className="w-4 h-4" />
                  <span>Impacto fitness: <span className="text-red-400">{player.injury?.fitnessImpact || 0}%</span></span>
                </div>
              </div>
            </div>

            {/* Planos de Tratamento */}
            <div>
              <h4 className="font-semibold text-white mb-3">Planos de Tratamento</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TREATMENT_PLANS.map((plan) => (
                  <button
                    key={plan.type}
                    onClick={() => setSelectedTreatment(plan)}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${selectedTreatment.type === plan.type
                        ? 'bg-accent-blue/10 border-accent-blue/50 ring-1 ring-accent-blue/50'
                        : 'bg-dark-bg/50 border-dark-border hover:border-dark-border/70'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">{plan.label}</span>
                      <span className="text-xs text-gray-400">{plan.cost === 0 ? 'Grátis' : `${plan.cost.toLocaleString()}€`}</span>
                    </div>
                    <p className="text-xs text-gray-400">{plan.description}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        Velocidade: {plan.recoverySpeedMultiplier.toFixed(1)}x
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        Risco: {(plan.riskFactor * 100).toFixed(0)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleApplyTreatment}
                disabled={isTreating}
                className={`
                  mt-4 w-full py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2
                  ${!isTreating
                    ? 'bg-gradient-to-r from-accent-blue to-neon-cyan text-dark-bg hover:shadow-neon-cyan transition'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isTreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Pill className="w-4 h-4" />
                )}
                Aplicar Tratamento
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
            <h4 className="text-lg font-semibold text-white">Jogador Saudável</h4>
            <p className="text-sm text-gray-400">Sem lesões registadas. Mantém o bom trabalho!</p>
            <div className="mt-2 text-sm text-gray-500">
              Energia: {Math.round(player.sims.energy)}% • Fitness: {player.fitness !== undefined ? Math.round(player.fitness) : '—'}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
