// src/engines/transferEngine.ts

import { v4 as uuidv4 } from 'uuid';
import { Player, Club, SaveState } from '@/types/game';

/**
 * Interface que representa uma proposta de transferência.
 */
export interface TransferOffer {
  id: string;
  playerId: string;
  fromClubId: string;         // Clube que vende (atual)
  toClubId: string;           // Clube que oferece
  toClubName: string;
  transferFee: number;        // Valor da transferência (em euros)
  offeredSalary: number;      // Salário anual proposto (em euros)
  contractYears: number;      // Duração do contrato
  loan: boolean;              // true se for empréstimo
  loanDuration?: number;      // meses (se for empréstimo)
  expiresAt: string;          // data de expiração da proposta (YYYY-MM-DD)
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

/**
 * Calcula o valor de mercado de um jogador com base em múltiplos fatores.
 * @param player - O jogador
 * @returns Valor estimado em euros
 */
export function calculateMarketValue(player: Player): number {
  // Fatores que influenciam o valor de mercado:
  // - Overall (base)
  // - Idade (jovens têm mais valor, >30 desvaloriza)
  // - Potencial (quanto maior, maior valor)
  // - Anos de contrato restantes (contratos longos aumentam valor)
  // - Estatísticas recentes (golos, assistências, média)

  const baseValue = 100000; // 100k base
  const overallFactor = Math.max(0, (player.overall - 40) * 150000); // 150k por ponto acima de 40
  const ageFactor = player.age <= 22 ? 2.0 : (player.age <= 28 ? 1.5 : (player.age <= 32 ? 1.0 : 0.6));
  const potentialBonus = Math.max(0, (player.potential - player.overall) * 100000); // 100k por ponto de potencial não realizado
  const contractFactor = 1 + (player.contractYears - 1) * 0.1; // contratos longos (+10% por ano extra)

  // Estatísticas: cada golo + 50k, cada assistência + 20k, média de rating + 1M por ponto acima de 6
  const goalsBonus = player.stats.goals * 50000;
  const assistsBonus = player.stats.assists * 20000;
  const ratingBonus = Math.max(0, (player.stats.averageRating - 6.0) * 1000000);

  let marketValue = (baseValue + overallFactor) * ageFactor * contractFactor +
                    potentialBonus + goalsBonus + assistsBonus + ratingBonus;

  // Arredondar para milhares
  marketValue = Math.round(marketValue / 1000) * 1000;
  // Valor mínimo de 50k
  return Math.max(50000, marketValue);
}

/**
 * Gera propostas de transferência ou empréstimo para um jogador.
 * @param player - O jogador em questão
 * @param currentClub - Clube atual do jogador
 * @param allClubs - Lista de todos os clubes (para selecionar potenciais compradores)
 * @param currentDate - Data atual (formato YYYY-MM-DD) para definir prazo de expiração
 * @returns Array de propostas (pode estar vazio)
 */
export function generateTransferOffers(
  player: Player,
  currentClub: Club,
  allClubs: Club[],
  currentDate: string = new Date().toISOString().slice(0, 10)
): TransferOffer[] {
  const offers: TransferOffer[] = [];

  // Não gerar propostas se o jogador estiver em fim de contrato (contractYears <= 0) ou for muito jovem (idade < 18)
  if (player.contractYears <= 0 || player.age < 18) return offers;

  // Probabilidade de receber propostas baseada no overall e reputação (implícita)
  // Quanto maior o overall, mais propostas
  const baseChance = (player.overall - 50) / 100; // 0 a 0.5
  const randomFactor = Math.random() * 0.3; // adicional aleatório
  const totalChance = Math.min(0.7, baseChance + randomFactor);

  // Determinar número de propostas (0 a 3)
  const numOffers = Math.random() < totalChance ? Math.floor(Math.random() * 3) + 1 : 0;

  // Se não houver propostas, retornar array vazio
  if (numOffers === 0) return offers;

  // Selecionar clubes interessados (excluindo o clube atual e clubes com orçamento baixo)
  const potentialBuyers = allClubs.filter(club =>
    club.id !== currentClub.id &&
    club.budget > calculateMarketValue(player) * 0.5 // tem dinheiro para pelo menos metade do valor
  );

  if (potentialBuyers.length === 0) return offers;

  // Embaralhar lista e selecionar alguns
  const shuffled = potentialBuyers.sort(() => Math.random() - 0.5);
  const selectedBuyers = shuffled.slice(0, Math.min(numOffers, shuffled.length));

  // Calcular valor de mercado
  const marketValue = calculateMarketValue(player);

  for (const buyer of selectedBuyers) {
    // Tipo de proposta: 80% transferência, 20% empréstimo
    const isLoan = Math.random() < 0.2;
    // Ajustar valor: entre 80% e 120% do valor de mercado, dependendo do orçamento do comprador
    const feeFactor = 0.8 + Math.random() * 0.4;
    let transferFee = Math.round(marketValue * feeFactor);

    // Se for empréstimo, a taxa é mais baixa (10% a 30% do valor)
    if (isLoan) {
      transferFee = Math.round(marketValue * (0.1 + Math.random() * 0.2));
    }

    // Salário oferecido: entre 80% e 130% do salário atual (ou para empréstimo, o mesmo)
    const salaryFactor = 0.8 + Math.random() * 0.5;
    const offeredSalary = Math.round(player.salary * salaryFactor / 1000) * 1000;

    // Duração do contrato: 3 a 5 anos para transferência, 1 ano para empréstimo
    const contractYears = isLoan ? 1 : (3 + Math.floor(Math.random() * 3));

    // Data de expiração: 7 a 14 dias a partir da data atual
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(expiryDate.getDate() + 7 + Math.floor(Math.random() * 8));
    const expiresAt = expiryDate.toISOString().slice(0, 10);

    offers.push({
      id: uuidv4(),
      playerId: player.id,
      fromClubId: currentClub.id,
      toClubId: buyer.id,
      toClubName: buyer.name,
      transferFee,
      offeredSalary,
      contractYears,
      loan: isLoan,
      loanDuration: isLoan ? 12 : undefined,
      expiresAt,
      status: 'pending',
    });
  }

  return offers;
}

/**
 * Avalia se o clube comprador aceita as exigências salariais do jogador.
 * @param offer - A proposta original
 * @param userDemandSalary - Salário anual exigido pelo jogador
 * @returns Objeto com aceitação e mensagem
 */
export function evaluateOfferResponse(
  offer: TransferOffer,
  userDemandSalary: number
): { accepted: boolean; message: string } {
  // Regras: o clube comprador pode negociar até um teto máximo
  // Teto máximo: 130% do salário oferecido originalmente (margem de negociação)
  const maxSalary = Math.round(offer.offeredSalary * 1.3);

  if (userDemandSalary <= maxSalary) {
    // Se o salário exigido estiver dentro do teto, aceita
    return {
      accepted: true,
      message: `Oferta aceite! O ${offer.toClubName} concorda com o salário de ${userDemandSalary.toLocaleString()}€/ano.`,
    };
  } else {
    // Negociação falhou
    return {
      accepted: false,
      message: `O ${offer.toClubName} não pode ultrapassar os ${maxSalary.toLocaleString()}€/ano. A proposta foi rejeitada.`,
    };
  }
}

/**
 * Executa a transferência de um jogador, atualizando clubes e jogador.
 * @param player - O jogador a transferir
 * @param sellerClub - Clube que vende (atual)
 * @param buyerClub - Clube que compra
 * @param transferFee - Valor da transferência
 * @param newSalary - Novo salário anual
 * @returns Objeto com o jogador atualizado e os dois clubes atualizados
 */
export function processTransfer(
  player: Player,
  sellerClub: Club,
  buyerClub: Club,
  transferFee: number,
  newSalary: number
): { updatedPlayer: Player; updatedSeller: Club; updatedBuyer: Club } {
  // 1. Clonar os dados para não modificar os originais
  const updatedPlayer: Player = {
    ...player,
    clubId: buyerClub.id,
    clubName: buyerClub.name,
    salary: newSalary,
    contractYears: 4, // contrato padrão de 4 anos após transferência (a negociar)
    isSub15: false, // se era sub15, passa a profissional
    marketValue: calculateMarketValue({ ...player, clubId: buyerClub.id, salary: newSalary }),
    // Não atualizar o contrato além do número de anos, mas podemos adicionar data de início futura
  };

  // 2. Remover jogador do plantel do vendedor
  let updatedSeller = { ...sellerClub };
  // Verificar se está no mainSquad ou sub15Squad
  const inMain = updatedSeller.mainSquad.some(p => p.id === player.id);
  const inSub15 = updatedSeller.sub15Squad.some(p => p.id === player.id);

  if (inMain) {
    updatedSeller.mainSquad = updatedSeller.mainSquad.filter(p => p.id !== player.id);
  } else if (inSub15) {
    updatedSeller.sub15Squad = updatedSeller.sub15Squad.filter(p => p.id !== player.id);
  }

  // Atualizar orçamento do vendedor (recebe a taxa)
  updatedSeller.budget += transferFee;

  // 3. Adicionar jogador ao plantel do comprador
  let updatedBuyer = { ...buyerClub };
  // Se for jovem (idade < 20) ou se o comprador tiver vaga, colocar no mainSquad
  if (updatedPlayer.age < 20) {
    // Pode ir para o sub15 ou mainSquad; vamos colocar no mainSquad (subindo)
    updatedBuyer.mainSquad.push(updatedPlayer);
  } else {
    updatedBuyer.mainSquad.push(updatedPlayer);
  }

  // Atualizar orçamento do comprador (gasta a taxa)
  updatedBuyer.budget -= transferFee;

  // Garantir que o orçamento não fique negativo
  if (updatedBuyer.budget < 0) {
    // Caso extremo: comprador não tinha dinheiro suficiente (falha na validação prévia)
    // Vamos reverter? Melhor lançar erro ou ajustar.
    // Na prática, a geração de ofertas já verifica orçamento, mas protegemos.
    updatedBuyer.budget = 0;
  }

  return {
    updatedPlayer,
    updatedSeller,
    updatedBuyer,
  };
}

/**
 * Atualiza uma proposta de transferência (por exemplo, quando expira).
 * @param offer - A proposta
 * @param currentDate - Data atual
 * @returns A proposta atualizada (status alterado para 'expired' se necessário)
 */
export function checkOfferExpiration(offer: TransferOffer, currentDate: string): TransferOffer {
  if (offer.status !== 'pending') return offer;
  if (new Date(currentDate) > new Date(offer.expiresAt)) {
    return { ...offer, status: 'expired' };
  }
  return offer;
}
