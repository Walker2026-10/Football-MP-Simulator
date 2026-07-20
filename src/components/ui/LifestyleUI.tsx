// src/components/ui/LifestyleUI.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Coins,
  Wallet,
  Home,
  Car,
  Gem,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Plus,
  Minus,
  Zap,
  Smile,
  Award,
  Building,
  CarFront,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  X,
  Check,
  AlertCircle,
  Clock,
  Briefcase,
  CreditCard,
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface LifestyleItem {
  id: string;
  name: string;
  category: 'Imóveis' | 'Veículos' | 'Luxo' | 'Investimentos';
  icon: React.ReactNode;
  price: number;
  monthlyMaintenance: number;
  statusBoost: number;
  reputationBoost: number;
  description: string;
}

interface SponsorContract {
  id: string;
  brandName: string;
  weeklyPay: number;
  durationWeeks: number;
  weeksRemaining: number;
  active: boolean;
  tier: 'LOCAL' | 'NACIONAL' | 'GLOBAL';
}

// ============================================================
// DADOS DE EXEMPLO (ITENS DE ESTILO DE VIDA)
// ============================================================

const AVAILABLE_ITEMS: LifestyleItem[] = [
  // Imóveis
  {
    id: 'apt-t1',
    name: 'Apartamento T1',
    category: 'Imóveis',
    icon: <Building className="w-6 h-6" />,
    price: 150000,
    monthlyMaintenance: 400,
    statusBoost: 15,
    reputationBoost: 5,
    description: 'Apartamento moderno no centro da cidade.',
  },
  {
    id: 'apt-t2',
    name: 'Apartamento T2',
    category: 'Imóveis',
    icon: <Building className="w-6 h-6" />,
    price: 250000,
    monthlyMaintenance: 600,
    statusBoost: 20,
    reputationBoost: 8,
    description: 'Amplo apartamento com vista para o mar.',
  },
  {
    id: 'house',
    name: 'Moradia',
    category: 'Imóveis',
    icon: <Home className="w-6 h-6" />,
    price: 450000,
    monthlyMaintenance: 1000,
    statusBoost: 25,
    reputationBoost: 12,
    description: 'Moradia luxuosa com piscina e jardim.',
  },
  {
    id: 'mansion',
    name: 'Mansão',
    category: 'Imóveis',
    icon: <Home className="w-6 h-6" />,
    price: 1200000,
    monthlyMaintenance: 2500,
    statusBoost: 35,
    reputationBoost: 20,
    description: 'Mansão de luxo com todas as comodidades.',
  },

  // Veículos
  {
    id: 'car-sport',
    name: 'Carro Desportivo',
    category: 'Veículos',
    icon: <CarFront className="w-6 h-6" />,
    price: 80000,
    monthlyMaintenance: 300,
    statusBoost: 10,
    reputationBoost: 8,
    description: 'Carro desportivo de alta performance.',
  },
  {
    id: 'car-luxury',
    name: 'Carro de Luxo',
    category: 'Veículos',
    icon: <CarFront className="w-6 h-6" />,
    price: 150000,
    monthlyMaintenance: 500,
    statusBoost: 15,
    reputationBoost: 12,
    description: 'Veículo premium com acabamentos exclusivos.',
  },
  {
    id: 'car-suv',
    name: 'SUV Premium',
    category: 'Veículos',
    icon: <CarFront className="w-6 h-6" />,
    price: 60000,
    monthlyMaintenance: 250,
    statusBoost: 8,
    reputationBoost: 5,
    description: 'SUV espaçoso e confortável para a família.',
  },

  // Luxo
  {
    id: 'watch-rolex',
    name: 'Relógio Rolex',
    category: 'Luxo',
    icon: <Sparkles className="w-6 h-6" />,
    price: 25000,
    monthlyMaintenance: 50,
    statusBoost: 8,
    reputationBoost: 6,
    description: 'Relógio de luxo suíço.',
  },
  {
    id: 'watch-patek',
    name: 'Relógio Patek Philippe',
    category: 'Luxo',
    icon: <Sparkles className="w-6 h-6" />,
    price: 60000,
    monthlyMaintenance: 80,
    statusBoost: 12,
    reputationBoost: 10,
    description: 'Relógio exclusivo de alta relojoaria.',
  },
  {
    id: 'jewelry',
    name: 'Jóias de Luxo',
    category: 'Luxo',
    icon: <Gem className="w-6 h-6" />,
    price: 40000,
    monthlyMaintenance: 60,
    statusBoost: 10,
    reputationBoost: 8,
    description: 'Coleção de joias finas.',
  },
  {
    id: 'art-piece',
    name: 'Obra de Arte',
    category: 'Luxo',
    icon: <Gem className="w-6 h-6" />,
    price: 75000,
    monthlyMaintenance: 100,
    statusBoost: 15,
    reputationBoost: 15,
    description: 'Pintura de artista renomado.',
  },

  // Investimentos
  {
    id: 'stocks-portfolio',
    name: 'Carteira de Ações',
    category: 'Investimentos',
    icon: <TrendingUpIcon className="w-6 h-6" />,
    price: 100000,
    monthlyMaintenance: 0,
    statusBoost: 5,
    reputationBoost: 8,
    description: 'Portfólio diversificado de ações.',
  },
  {
    id: 'real-estate-fund',
    name: 'Fundo Imobiliário',
    category: 'Investimentos',
    icon: <TrendingUpIcon className="w-6 h-6" />,
    price: 200000,
    monthlyMaintenance: 0,
    statusBoost: 5,
    reputationBoost: 10,
    description: 'Investimento em fundos imobiliários.',
  },
  {
    id: 'crypto-portfolio',
    name: 'Portfólio Cripto',
    category: 'Investimentos',
    icon: <TrendingUpIcon className="w-6 h-6" />,
    price: 50000,
    monthlyMaintenance: 0,
    statusBoost: 3,
    reputationBoost: 5,
    description: 'Carteira diversificada de criptomoedas.',
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function LifestyleUI() {
  const store = useGameStore();
  const player = store.getCurrentPlayer();
  const { buyLifestyleItem, saveState } = store;

  // Estados locais
  const [activeTab, setActiveTab] = useState<'Imóveis' | 'Veículos' | 'Luxo' | 'Investimentos'>('Imóveis');
  const [ownedItems, setOwnedItems] = useState<LifestyleItem[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Patrocínios (simulados)
  const [sponsorships, setSponsorships] = useState<SponsorContract[]>([
    {
      id: 'sponsor-1',
      brandName: 'Nike',
      weeklyPay: 8000,
      durationWeeks: 20,
      weeksRemaining: 15,
      active: true,
      tier: 'GLOBAL',
    },
    {
      id: 'sponsor-2',
      brandName: 'Red Bull',
      weeklyPay: 10000,
      durationWeeks: 16,
      weeksRemaining: 8,
      active: true,
      tier: 'GLOBAL',
    },
    {
      id: 'sponsor-3',
      brandName: 'Pepsi',
      weeklyPay: 5000,
      durationWeeks: 12,
      weeksRemaining: 0,
      active: false,
      tier: 'NACIONAL',
    },
  ]);

  // Cálculo do salário semanal
  const weeklySalary = player ? Math.floor(player.salary / 52) : 0;

  // Custo de manutenção mensal total
  const monthlyMaintenance = useMemo(() => {
    return ownedItems.reduce((sum, item) => sum + item.monthlyMaintenance, 0);
  }, [ownedItems]);

  // Itens filtrados por categoria
  const filteredItems = AVAILABLE_ITEMS.filter(item => item.category === activeTab);

  // Verificar se o jogador já possui um item
  const isItemOwned = (itemId: string) => {
    return ownedItems.some(item => item.id === itemId);
  };

  // Comprar item
  const handleBuyItem = (item: LifestyleItem) => {
    if (!player) {
      setFeedback({ type: 'error', message: 'Nenhum jogador encontrado.' });
      return;
    }

    if (isProcessing) return;

    // Verificar se já possui o item
    if (isItemOwned(item.id)) {
      setFeedback({ type: 'info', message: `Já possuis ${item.name}.` });
      return;
    }

    // Verificar saldo
    if (player.sims.bankBalance < item.price) {
      setFeedback({
        type: 'error',
        message: `Saldo insuficiente. Precisas de ${item.price.toLocaleString()}€, tens ${player.sims.bankBalance.toLocaleString()}€.`,
      });
      return;
    }

    setIsProcessing(true);

    // Chamar a store para processar a compra
    const result = buyLifestyleItem(item);

    if (result.success) {
      setOwnedItems([...ownedItems, item]);
      setFeedback({ type: 'success', message: result.message });
      // Atualizar o jogador na store (já feito pela store)
    } else {
      setFeedback({ type: 'error', message: result.message });
    }

    setIsProcessing(false);

    // Limpar feedback após 4 segundos
    setTimeout(() => setFeedback(null), 4000);
  };

  // Vender item (simplificado - remove da lista e reembolsa 70% do valor)
  const handleSellItem = (item: LifestyleItem) => {
    if (!player) return;

    const sellPrice = Math.floor(item.price * 0.7);
    setOwnedItems(ownedItems.filter(i => i.id !== item.id));

    // Atualizar saldo do jogador (simplificado - idealmente seria via store)
    if (saveState?.userPlayer) {
      const updatedPlayer = { ...saveState.userPlayer };
      updatedPlayer.sims.bankBalance += sellPrice;
      saveState.userPlayer = updatedPlayer;
      // A store deve atualizar isso via saveGame
      store.saveGame();
    }

    setFeedback({
      type: 'info',
      message: `${item.name} vendido por ${sellPrice.toLocaleString()}€.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Renderizar badge de categoria
  const renderCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Imóveis': 'bg-blue-500/20 text-blue-400',
      'Veículos': 'bg-purple-500/20 text-purple-400',
      'Luxo': 'bg-gold-fc/20 text-gold-fc',
      'Investimentos': 'bg-green-500/20 text-green-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  // Renderizar ícone da categoria para a aba
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Imóveis': return <Building className="w-5 h-5" />;
      case 'Veículos': return <CarFront className="w-5 h-5" />;
      case 'Luxo': return <Gem className="w-5 h-5" />;
      case 'Investimentos': return <TrendingUpIcon className="w-5 h-5" />;
      default: return <ShoppingBag className="w-5 h-5" />;
    }
  };

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
        <div className="fc26-card max-w-md w-full p-8">
          <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sem Jogador Ativo</h2>
          <p className="text-gray-400">Inicia uma carreira para gerir a vida pessoal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* ============================================================
          RESUMO FINANCEIRO PESSOAL
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="fc26-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-neon-green/10">
            <Coins className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Conta Bancária</div>
            <div className="text-xl font-bold text-white">
              {player.sims.bankBalance.toLocaleString('pt-PT')} €
            </div>
          </div>
        </div>

        <div className="fc26-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-accent-blue/10">
            <Wallet className="w-6 h-6 text-neon-cyan" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Salário Semanal</div>
            <div className="text-xl font-bold text-white">
              {weeklySalary.toLocaleString('pt-PT')} €
            </div>
          </div>
        </div>

        <div className="fc26-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10">
            <DollarSign className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Manutenção Mensal</div>
            <div className="text-xl font-bold text-red-400">
              {monthlyMaintenance.toLocaleString('pt-PT')} €
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          FEEDBACK
      ============================================================ */}
      {feedback && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200
          ${feedback.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
            feedback.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
            'bg-blue-500/20 border border-blue-500/30 text-blue-400'}
        `}>
          {feedback.type === 'success' && <Check className="w-5 h-5" />}
          {feedback.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {feedback.type === 'info' && <Clock className="w-5 h-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ============================================================
          LOJA DE ESTILO DE VIDA
      ============================================================ */}
      <div className="fc26-card p-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-gold-fc" />
          Loja de Estilo de Vida
        </h2>

        {/* Abas */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['Imóveis', 'Veículos', 'Luxo', 'Investimentos'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${activeTab === category
                  ? 'bg-accent-blue/20 text-white border border-accent-blue/50'
                  : 'bg-dark-bg/50 text-gray-400 hover:text-white hover:bg-dark-bg/70'
                }
              `}
            >
              {getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>

        {/* Grid de Itens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const owned = isItemOwned(item.id);
            const canAfford = player.sims.bankBalance >= item.price;

            return (
              <div
                key={item.id}
                className={`
                  p-4 rounded-lg border transition-all
                  ${owned
                    ? 'bg-green-500/10 border-green-500/30'
                    : canAfford
                      ? 'bg-dark-bg/50 border-dark-border hover:border-neon-cyan/50 hover:shadow-neon-cyan/10'
                      : 'bg-dark-bg/30 border-dark-border/50 opacity-60'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-dark-card border border-dark-border">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${renderCategoryBadge(item.category)}
                      `}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {owned && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Adquirido
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Preço</span>
                    <span className="font-medium text-gold-fc">{item.price.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Manutenção/mês</span>
                    <span className="font-medium text-red-400">{item.monthlyMaintenance.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Bónus</span>
                    <span className="font-medium text-neon-green">
                      +{item.statusBoost} Felicidade / +{item.reputationBoost} Reputação
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {owned ? (
                    <button
                      onClick={() => handleSellItem(item)}
                      className="flex-1 py-2 px-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Minus className="w-4 h-4" />
                      Vender
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={!canAfford || isProcessing}
                      className={`
                        flex-1 py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-1
                        ${canAfford && !isProcessing
                          ? 'bg-gradient-to-r from-neon-green to-green-500 text-dark-bg hover:shadow-neon-green transition'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <Plus className="w-4 h-4" />
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Nenhum item disponível nesta categoria.
          </div>
        )}
      </div>

      {/* ============================================================
          PROPRIEDADES ADQUIRIDAS
      ============================================================ */}
      <div className="fc26-card p-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Home className="w-6 h-6 text-neon-cyan" />
          Propriedades Adquiridas
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({ownedItems.length} itens)
          </span>
        </h2>

        {ownedItems.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>Nenhuma propriedade adquirida ainda.</p>
            <p className="text-sm">Visita a loja para comprar os teus primeiros bens.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-dark-bg/50 border border-dark-border flex items-center gap-4"
              >
                <div className="p-2 rounded-full bg-dark-card border border-dark-border">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="text-sm text-gray-400">
                    Manutenção: {item.monthlyMaintenance.toLocaleString()} €/mês
                  </div>
                </div>
                <button
                  onClick={() => handleSellItem(item)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  title="Vender"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          PATROCÍNIOS PESSOAIS
      ============================================================ */}
      <div className="fc26-card p-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-gold-fc" />
          Patrocínios Pessoais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contratos Ativos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Ativos
            </h3>
            {sponsorships.filter(s => s.active).length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum patrocínio ativo.</p>
            ) : (
              <div className="space-y-2">
                {sponsorships.filter(s => s.active).map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-white">{sponsor.brandName}</div>
                      <div className="text-sm text-gray-400">
                        {sponsor.weeklyPay.toLocaleString()} €/semana
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${sponsor.tier === 'GLOBAL' ? 'bg-gold-fc/20 text-gold-fc' :
                          sponsor.tier === 'NACIONAL' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'}
                      `}>
                        {sponsor.tier}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {sponsor.weeksRemaining} semanas restantes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Propostas Pendentes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              Propostas Pendentes
            </h3>
            {sponsorships.filter(s => !s.active).length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma proposta pendente.</p>
            ) : (
              <div className="space-y-2">
                {sponsorships.filter(s => !s.active).map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-white">{sponsor.brandName}</div>
                      <div className="text-sm text-gray-400">
                        {sponsor.weeklyPay.toLocaleString()} €/semana
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-yellow-400">
                        Expirou
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
