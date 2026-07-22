// src/components/ui/CreatePlayerUI.tsx

'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  Flag,
  Target,
  Trophy,
  MapPin,
  Ruler,
  Weight,
  Footprints,
  Star,
  Shield,
  Users,
  MoveRight,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';

interface CreatePlayerUIProps {
  onBack: () => void;
  onSubmit: (data: PlayerCreationData) => void;
  isLoading?: boolean;
}

export interface PlayerCreationData {
  name: string;
  shirtNumber: number;
  preferredFoot: 'left' | 'right' | 'both';
  nationality: string;
  favoritePlayer: string;
  favoriteClub: string;
  height: number;
  weight: number;
  mainPosition: string;
  secondaryPositions: string[];
  topAttributes: string[];
  startingClub: string;
}

// ============================================================
// DADOS
// ============================================================

const flagEmojis: Record<string, string> = {
  Portugal: '🇵🇹',
  Brasil: '🇧🇷',
  Espanha: '🇪🇸',
  Inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Alemanha: '🇩🇪',
  França: '🇫🇷',
  Itália: '🇮🇹',
  Argentina: '🇦🇷',
};

// Posições do campo (coordenadas aproximadas para SVG)
const pitchPositions = [
  { id: 'gk', label: 'GR', x: 50, y: 88, category: 'gk' },
  { id: 'cb', label: 'DC', x: 20, y: 70, category: 'def' },
  { id: 'cb2', label: 'DC', x: 80, y: 70, category: 'def' },
  { id: 'lb', label: 'LE', x: 5, y: 55, category: 'def' },
  { id: 'rb', label: 'LD', x: 95, y: 55, category: 'def' },
  { id: 'cdm', label: 'MDC', x: 50, y: 55, category: 'mid' },
  { id: 'cm', label: 'MC', x: 35, y: 40, category: 'mid' },
  { id: 'cm2', label: 'MC', x: 65, y: 40, category: 'mid' },
  { id: 'cam', label: 'MO', x: 50, y: 30, category: 'mid' },
  { id: 'lw', label: 'EE', x: 15, y: 20, category: 'att' },
  { id: 'rw', label: 'ED', x: 85, y: 20, category: 'att' },
  { id: 'cf', label: 'PL', x: 50, y: 15, category: 'att' },
  { id: 'st', label: 'AC', x: 50, y: 8, category: 'att' },
];

// Mapeamento de categorias para restrições
const positionCategories: Record<string, string> = {
  gk: 'gk',
  cb: 'def',
  cb2: 'def',
  lb: 'def',
  rb: 'def',
  cdm: 'mid',
  cm: 'mid',
  cm2: 'mid',
  cam: 'mid',
  lw: 'att',
  rw: 'att',
  cf: 'att',
  st: 'att',
};

// Nomes completos das posições
const positionFullNames: Record<string, string> = {
  gk: 'Guarda-Redes',
  cb: 'Defesa Central',
  cb2: 'Defesa Central',
  lb: 'Lateral Esquerdo',
  rb: 'Lateral Direito',
  cdm: 'Médio Defensivo',
  cm: 'Médio Centro',
  cm2: 'Médio Centro',
  cam: 'Médio Ofensivo',
  lw: 'Extremo Esquerdo',
  rw: 'Extremo Direito',
  cf: 'Ponta de Lança',
  st: 'Avançado',
};

// Atributos por categoria de posição
const attributesByCategory: Record<string, string[]> = {
  gk: ['Reflexos', 'Posicionamento', 'Passe', 'Comunicação', 'Agilidade', 'Força'],
  def: ['Desarme', 'Corte', 'Cabeceamento', 'Posicionamento', 'Força', 'Passe'],
  mid: ['Passe', 'Visão', 'Drible', 'Desarme', 'Resistência', 'Remate'],
  att: ['Remate', 'Drible', 'Velocidade', 'Finalização', 'Cabeceamento', 'Passe'],
};

// Lista de clubes Sub-15 (mock)
const clubOptions = [
  'Benfica Sub-15',
  'Porto Sub-15',
  'Sporting Sub-15',
  'Real Madrid Sub-15',
  'Barcelona Sub-15',
  'Manchester City Sub-15',
  'Arsenal Sub-15',
  'Bayern Munique Sub-15',
];

// Lista de jogadores favoritos
const playerOptions = [
  'Cristiano Ronaldo',
  'Lionel Messi',
  'Erling Haaland',
  'Kylian Mbappé',
  'Kevin De Bruyne',
  'Bukayo Saka',
  'Vinicius Jr',
  'Pedri',
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function CreatePlayerUI({ onBack, onSubmit, isLoading = false }: CreatePlayerUIProps) {
  // ============================================================
  // ESTADO DOS PASSOS
  // ============================================================
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // ============================================================
  // DADOS DO FORMULÁRIO
  // ============================================================
  const [name, setName] = useState('');
  const [shirtNumber, setShirtNumber] = useState(10);
  const [preferredFoot, setPreferredFoot] = useState<'left' | 'right' | 'both'>('right');
  const [nationality, setNationality] = useState('Portugal');
  const [favoritePlayer, setFavoritePlayer] = useState('');
  const [favoriteClub, setFavoriteClub] = useState('');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [mainPosition, setMainPosition] = useState<string | null>(null);
  const [secondaryPositions, setSecondaryPositions] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [startingClub, setStartingClub] = useState('');

  // ============================================================
  // VALIDAÇÃO E LÓGICA DE POSIÇÕES
  // ============================================================
  const mainCategory = mainPosition ? positionCategories[mainPosition] : null;

  const isPositionSelectable = (posId: string) => {
    if (!mainPosition) return true;
    const cat = positionCategories[posId];
    if (!cat) return false;
    // GK só pode escolher GK como secundária
    if (mainCategory === 'gk' && cat !== 'gk') return false;
    // Defesa só pode escolher defesa ou médio defensivo (restrição suave)
    if (mainCategory === 'def' && cat !== 'def' && cat !== 'mid') return false;
    // Médio pode escolher médio ou ataque (menos restritivo)
    if (mainCategory === 'mid' && cat === 'gk') return false;
    // Ataque só pode escolher ataque ou médio ofensivo
    if (mainCategory === 'att' && cat !== 'att' && cat !== 'mid') return false;
    return true;
  };

  const handlePositionClick = (posId: string) => {
    if (!mainPosition) {
      // Selecionar posição principal
      setMainPosition(posId);
      return;
    }
    // Se já tem principal, tentar adicionar como secundária
    if (posId === mainPosition) return;
    if (secondaryPositions.includes(posId)) {
      setSecondaryPositions(secondaryPositions.filter(p => p !== posId));
      return;
    }
    if (secondaryPositions.length >= 2) {
      alert('Máximo de 2 posições secundárias.');
      return;
    }
    if (!isPositionSelectable(posId)) {
      alert('Não podes escolher esta posição como secundária para a posição principal selecionada.');
      return;
    }
    setSecondaryPositions([...secondaryPositions, posId]);
  };

  const handleAttributeToggle = (attr: string) => {
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter(a => a !== attr));
    } else if (selectedAttributes.length < 3) {
      setSelectedAttributes([...selectedAttributes, attr]);
    } else {
      alert('Máximo de 3 atributos.');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0 && favoritePlayer && favoriteClub;
      case 2:
        return height > 0 && weight > 0;
      case 3:
        return mainPosition !== null;
      case 4:
        return selectedAttributes.length === 3;
      case 5:
        return startingClub.length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step < totalSteps && canProceed()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed()) return;
    if (!mainPosition) return;
    onSubmit({
      name: name.trim(),
      shirtNumber,
      preferredFoot,
      nationality,
      favoritePlayer,
      favoriteClub,
      height,
      weight,
      mainPosition,
      secondaryPositions,
      topAttributes: selectedAttributes,
      startingClub,
    });
  };

  // ============================================================
  // RENDER DOS PASSOS
  // ============================================================

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  // Passo 1: Identidade
  const renderStep1 = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
        <User className="w-5 h-5 text-amber-400" />
        Identidade do Jogador
      </h3>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nome</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="NOME COMPLETO"
            className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Número de Camisola</label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="number"
            value={shirtNumber}
            onChange={(e) => setShirtNumber(Number(e.target.value))}
            min={1}
            max={99}
            className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pé dominante</label>
        <div className="flex gap-3 mt-1">
          {['left', 'right', 'both'].map((foot) => (
            <button
              key={foot}
              type="button"
              onClick={() => setPreferredFoot(foot as any)}
              className={`flex-1 py-2 rounded-xl border-2 transition-all text-sm ${
                preferredFoot === foot
                  ? 'border-amber-400 bg-amber-500/20 text-white'
                  : 'border-amber-500/20 bg-black/30 text-gray-400 hover:border-amber-400/50'
              }`}
            >
              {foot === 'left' ? '👈 Esquerdo' : foot === 'right' ? '👉 Direito' : '🔄 Ambidestro'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nacionalidade</label>
        <div className="relative">
          <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            {Object.keys(flagEmojis).map(n => (
              <option key={n} value={n}>{flagEmojis[n]} {n}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jogador favorito</label>
        <div className="relative">
          <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={favoritePlayer}
            onChange={(e) => setFavoritePlayer(e.target.value)}
            className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="">Selecionar</option>
            {playerOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clube favorito</label>
        <div className="relative">
          <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={favoriteClub}
            onChange={(e) => setFavoriteClub(e.target.value)}
            className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="">Selecionar</option>
            {clubOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Passo 2: Físico
  const renderStep2 = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
        <Ruler className="w-5 h-5 text-amber-400" />
        Dados Físicos
      </h3>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Altura (cm)</label>
        <div className="relative">
          <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Peso (kg)</label>
        <div className="relative">
          <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>
    </div>
  );

  // Passo 3: Posição (campo interativo)
  const renderStep3 = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
        <Target className="w-5 h-5 text-amber-400" />
        Posição em Campo
      </h3>
      <p className="text-xs text-gray-400">Clica no campo para escolher a posição principal. Clica novamente para adicionar posições secundárias (máx 2).</p>
      <div className="relative w-full max-w-lg mx-auto aspect-[3/4] bg-gradient-to-b from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 rounded-xl border border-amber-500/20 overflow-hidden">
        {/* Campo SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Linhas do campo */}
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="5" y="25" width="12" height="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="83" y="25" width="12" height="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="10" y="35" width="5" height="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="85" y="35" width="5" height="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

          {pitchPositions.map((pos) => {
            const isMain = mainPosition === pos.id;
            const isSecondary = secondaryPositions.includes(pos.id);
            const isSelectable = mainPosition ? isPositionSelectable(pos.id) : true;
            const opacity = !isSelectable ? 'opacity-30' : 'opacity-100';

            return (
              <g
                key={pos.id}
                onClick={() => isSelectable && handlePositionClick(pos.id)}
                className={`cursor-pointer transition-all duration-200 ${opacity} ${
                  isMain ? 'scale-125' : 'hover:scale-110'
                }`}
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                <circle
                  r="3.5"
                  fill={isMain ? '#fbbf24' : isSecondary ? '#f59e0b' : 'rgba(255,255,255,0.3)'}
                  stroke={isMain ? '#fbbf24' : isSecondary ? '#f59e0b' : 'rgba(255,255,255,0.5)'}
                  strokeWidth="0.8"
                  className="transition-all"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="3"
                  fill="white"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {pos.label}
                </text>
                {isMain && (
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fontSize="2"
                    fill="#fbbf24"
                    className="pointer-events-none"
                  >
                    ★
                  </text>
                )}
                {isSecondary && (
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fontSize="2"
                    fill="#f59e0b"
                    className="pointer-events-none"
                  >
                    +
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legenda */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 justify-center text-[8px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Principal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Secundária</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/30" /> Disponível</span>
        </div>
      </div>
      {mainPosition && (
        <div className="text-center text-xs text-white">
          Posição Principal: <span className="text-amber-400 font-bold">{positionFullNames[mainPosition]}</span>
          {secondaryPositions.length > 0 && (
            <span className="ml-2 text-gray-400">
              Secundárias: {secondaryPositions.map(id => positionFullNames[id]).join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Passo 4: Atributos
  const renderStep4 = () => {
    const attrs = mainPosition ? attributesByCategory[positionCategories[mainPosition]] || attributesByCategory.mid : [];
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Escolhe os teus 3 atributos principais
        </h3>
        <p className="text-xs text-gray-400">Baseado na tua posição, seleciona os atributos que melhor te definem.</p>
        <div className="grid grid-cols-2 gap-2">
          {attrs.map((attr) => (
            <button
              key={attr}
              type="button"
              onClick={() => handleAttributeToggle(attr)}
              className={`py-3 rounded-xl border-2 transition-all text-sm font-bold ${
                selectedAttributes.includes(attr)
                  ? 'border-amber-400 bg-amber-500/20 text-white shadow-lg shadow-amber-500/10'
                  : 'border-amber-500/20 bg-black/30 text-gray-400 hover:border-amber-400/50'
              }`}
            >
              {attr}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-400 text-center">
          {selectedAttributes.length}/3 selecionados
        </div>
      </div>
    );
  };

  // Passo 5: Clube de partida
  const renderStep5 = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
        <Shield className="w-5 h-5 text-amber-400" />
        Clube de Partida
      </h3>
      <p className="text-xs text-gray-400">Escolhe o clube onde vais começar a tua carreira (Sub-15).</p>
      <div className="relative">
        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <select
          value={startingClub}
          onChange={(e) => setStartingClub(e.target.value)}
          className="w-full bg-black/50 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm uppercase appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          <option value="">Selecionar clube</option>
          {clubOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Fundo preto com toques dourados */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-950/20" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)]" />

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={onBack} className="group flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">Voltar</span>
        </button>
        <div className="flex items-center gap-2 text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-yellow-400/70">CRIAR JOGADOR</span>
          <span className="text-gray-500 ml-2">Passo {step}/{totalSteps}</span>
        </div>
      </header>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-8 pt-16 pb-12 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-3xl p-6 md:p-8">
          <div className="flex gap-2 mb-6 justify-center">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? 'bg-amber-400 w-8' : 'bg-white/10 w-4'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                  step > 1
                    ? 'border border-amber-500/30 text-white hover:bg-amber-500/10'
                    : 'border border-white/10 text-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4 inline" /> Anterior
              </button>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                    canProceed()
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:brightness-110'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Próximo <ChevronRight className="w-4 h-4 inline" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !canProceed()}
                  className={`px-8 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                    !isLoading && canProceed()
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:brightness-110 shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-transparent" />
                  ) : (
                    <>CRIAR LENDA <MoveRight className="w-4 h-4 inline" /></>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
