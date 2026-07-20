// src/engines/clubAIEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Club, Player, LeagueTableEntry } from '@/types/game';

// ============================================================
// TIPOS INTERNOS
// ============================================================

/**
 * Representa um treinador com estilo de jogo.
 */
interface Manager {
  id: string;
  name: string;
  style: 'Ataque' | 'Defesa' | 'Posse' | 'Contra-Ataque' | 'Equilibrado';
  rating: number; // 1-100
}

/**
 * Representa a posição atual de um clube na tabela.
 */
interface ClubStanding {
  clubId: string;
  position: number;
  points: number;
}

// ============================================================
// DADOS DE EXEMPLO (para simulação)
// ============================================================

// Lista de nomes de treinadores para o carrossel
const managerNames = [
  'José Mourinho', 'Pep Guardiola', 'Jürgen Klopp', 'Carlo Ancelotti',
  'Diego Simeone', 'Thomas Tuchel', 'Mikel Arteta', 'Rúben Amorim',
  'Roberto De Zerbi', 'Unai Emery', 'Erik ten Hag', 'Luis Enrique',
  'Zinedine Zidane', 'Antonio Conte', 'Mauricio Pochettino', 'Ralf Rangnick',
  'Julian Nagelsmann', 'Eddie Howe', 'Marco Silva', 'André Villas-Boas'
];

// Estilos de jogo possíveis
const managerStyles: Manager['style'][] = ['Ataque', 'Defesa', 'Posse', 'Contra-Ataque', 'Equilibrado'];

/**
 * Gera um treinador aleatório.
 */
function generateRandomManager(): Manager {
  const name = managerNames[Math.floor(Math.random() * managerNames.length)];
  const style = managerStyles[Math.floor(Math.random() * managerStyles.length)];
  const rating = 50 + Math.floor(Math.random() * 50); // 50-100
  return {
    id: uuidv4(),
    name,
    style,
    rating,
  };
}

/**
 * Avalia se um clube precisa de reforços numa determinada posição.
 */
function needsReinforcement(club: Club, position: string, minPlayers: number = 2): boolean {
  const count = club.mainSquad.filter(p => p.position === position).length;
  return count < minPlayers;
}

/**
 * Encontra jogadores livres (agentes livres) com uma posição específica.
 */
function findFreeAgentsByPosition(freeAgents: Player[], position: string): Player[] {
  return freeAgents.filter(p => p.position === position && p.clubId === null);
}

/**
 * Calcula a posição atual de um clube na tabela.
 */
function getClubPosition(clubId: string, leagueTable: LeagueTableEntry[]): number {
  const entry = leagueTable.find(e => e.clubId === clubId);
  return entry ? entry.rank : 999;
}

/**
 * Avalia a forma recente de um clube (simulada).
 */
function evaluateClubForm(club: Club, recentResults: string[]): number {
  // Simula uma forma entre 0 e 10 com base em resultados recentes
  // Se não houver resultados, assume forma média (5)
  if (!recentResults || recentResults.length === 0) return 5;
  const wins = recentResults.filter(r => r === 'W').length;
  const draws = recentResults.filter(r => r === 'D').length;
  const points = wins * 3 + draws * 1;
  const maxPoints = recentResults.length * 3;
  return (points / maxPoints) * 10;
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Processa transferências autónomas entre clubes geridos pela IA.
 * @param clubs - Lista de todos os clubes
 * @param freeAgents - Lista de jogadores livres (sem clube)
 * @param leagueTable - Tabela da liga (para avaliar posições)
 * @param maxTransfers - Número máximo de transferências a processar (default 5)
 * @returns Objeto com clubes atualizados e notícias de transferências
 */
export function processCPUClubTransfers(
  clubs: Club[],
  freeAgents: Player[],
  leagueTable: LeagueTableEntry[] = [],
  maxTransfers: number = 5
): { updatedClubs: Club[]; transferNews: string[] } {
  // Clonar clubes para não modificar o original
  const updatedClubs = clubs.map(club => ({ ...club }));
  const news: string[] = [];
  let transfersMade = 0;

  // Ordenar clubes por posição (os mais mal posicionados têm prioridade)
  const sortedClubs = [...updatedClubs].sort((a, b) => {
    const posA = getClubPosition(a.id, leagueTable);
    const posB = getClubPosition(b.id, leagueTable);
    return posA - posB;
  });

  for (const club of sortedClubs) {
    if (transfersMade >= maxTransfers) break;

    // Verificar se o clube tem orçamento suficiente para contratar (mínimo 1M)
    if (club.budget < 1000000) continue;

    // Posições que precisam de reforço (prioridade: defesa, médio, ataque)
    const positions = ['Defesa Central', 'Lateral', 'Médio', 'Extremo', 'Avançado', 'Guarda-Redes'];
    for (const pos of positions) {
      if (transfersMade >= maxTransfers) break;
      if (!needsReinforcement(club, pos, 2)) continue;

      // Procurar agentes livres
      const availableFree = findFreeAgentsByPosition(freeAgents, pos);
      if (availableFree.length > 0) {
        // Escolher o melhor agente livre (maior overall)
        const bestFree = availableFree.sort((a, b) => b.overall - a.overall)[0];
        if (bestFree) {
          // Calcular custo (salário anual baseado no overall)
          const salary = 500000 + bestFree.overall * 10000;
          if (club.budget > salary * 2) { // mínimo para cobrir 2 anos
            // Contratar agente livre
            const updatedPlayer = { ...bestFree, clubId: club.id, clubName: club.name, isSub15: false };
            club.mainSquad.push(updatedPlayer);
            club.budget -= salary;
            transfersMade++;

            // Remover da lista de agentes livres
            const idx = freeAgents.findIndex(p => p.id === bestFree.id);
            if (idx !== -1) freeAgents.splice(idx, 1);

            news.push(`${club.name} contratou ${bestFree.name} (${bestFree.position}) por ${salary.toLocaleString()}€/ano.`);
            break; // passou a uma posição, passar para a próxima
          }
        }
      } else {
        // Se não houver agentes livres, tentar comprar de outro clube (simplificado)
        // Procurar um clube com excesso de jogadores na mesma posição
        const potentialSellers = updatedClubs.filter(c => c.id !== club.id);
        for (const seller of potentialSellers) {
          if (transfersMade >= maxTransfers) break;
          const sellablePlayers = seller.mainSquad
            .filter(p => p.position === pos && p.age >= 20 && p.overall >= 60)
            .sort((a, b) => a.overall - b.overall); // vender os piores primeiro

          if (sellablePlayers.length > 0 && seller.mainSquad.length > 16) {
            const target = sellablePlayers[0];
            const marketValue = 500000 + target.overall * 20000;
            if (club.budget > marketValue) {
              // Transferir
              const updatedPlayer = { ...target, clubId: club.id, clubName: club.name };
              club.mainSquad.push(updatedPlayer);
              club.budget -= marketValue;
              seller.budget += marketValue;
              seller.mainSquad = seller.mainSquad.filter(p => p.id !== target.id);
              transfersMade++;
              news.push(`${club.name} comprou ${target.name} ao ${seller.name} por ${marketValue.toLocaleString()}€.`);
              break;
            }
          }
        }
      }
    }
  }

  return { updatedClubs, transferNews: news };
}

/**
 * Processa o carrossel de treinadores: despede e contrata novos treinadores com base no desempenho.
 * @param clubs - Lista de clubes
 * @param leagueTable - Tabela da liga (para avaliar posições)
 * @param targetPositions - Objeto com posições alvo por clube (ex: { 'mci': 1, 'ars': 4 })
 * @param maxChanges - Número máximo de mudanças (default 3)
 * @returns Objeto com clubes atualizados e notícias sobre treinadores
 */
export function processManagerCarousel(
  clubs: Club[],
  leagueTable: LeagueTableEntry[] = [],
  targetPositions: Record<string, number> = {},
  maxChanges: number = 3
): { updatedClubs: Club[]; managerNews: string[] } {
  const updatedClubs = clubs.map(club => ({
    ...club,
    // Adicionar campo manager se não existir
    manager: club.manager || generateRandomManager(),
    // Adicionar field para resultados recentes (simulado)
    recentResults: club.recentResults || [],
  }));

  const news: string[] = [];
  let changesMade = 0;

  // Ordenar clubes por posição (piores primeiro)
  const sortedClubs = [...updatedClubs].sort((a, b) => {
    const posA = getClubPosition(a.id, leagueTable);
    const posB = getClubPosition(b.id, leagueTable);
    return posA - posB;
  });

  for (const club of sortedClubs) {
    if (changesMade >= maxChanges) break;

    const currentPos = getClubPosition(club.id, leagueTable);
    const targetPos = targetPositions[club.id] || 10; // objetivo padrão: top 10

    // Avaliar forma (simular com base em resultados recentes)
    const form = evaluateClubForm(club, club.recentResults || []);

    // Critério para despedimento:
    // - Posição atual muito abaixo do objetivo (diferença > 5) E forma < 4
    // - Ou forma muito baixa (< 3) independentemente da posição
    const shouldFire = (currentPos - targetPos > 5 && form < 4) || (form < 3);

    if (shouldFire && club.manager) {
      // Despedir treinador
      const firedManager = club.manager;
      news.push(`${club.name} despediu o treinador ${firedManager.name} devido aos maus resultados.`);

      // Contratar novo treinador (com estilo diferente, se possível)
      let newManager = generateRandomManager();
      // Evitar contratar o mesmo estilo
      let attempts = 0;
      while (newManager.style === firedManager.style && attempts < 10) {
        newManager = generateRandomManager();
        attempts++;
      }
      // Dar um rating ligeiramente superior (esperança)
      newManager.rating = Math.min(100, firedManager.rating + Math.floor(Math.random() * 10) - 3);

      club.manager = newManager;
      news.push(`${club.name} contratou ${newManager.name} (estilo ${newManager.style}) como novo treinador.`);
      changesMade++;
    }
  }

  return { updatedClubs, managerNews: news };
}
