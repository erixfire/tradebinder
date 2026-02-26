// Trading Engine - Core Logic for ManaVault PH

export interface ConditionMultiplier {
  condition: string;
  multiplier: number;
  storeCreditPercent: number;
  cashPercent: number;
}

export const CONDITION_MULTIPLIERS: Record<string, ConditionMultiplier> = {
  NM: { condition: 'Near Mint', multiplier: 1.0, storeCreditPercent: 70, cashPercent: 60 },
  LP: { condition: 'Lightly Played', multiplier: 0.9, storeCreditPercent: 60, cashPercent: 50 },
  MP: { condition: 'Moderately Played', multiplier: 0.75, storeCreditPercent: 45, cashPercent: 35 },
  HP: { condition: 'Heavily Played', multiplier: 0.5, storeCreditPercent: 30, cashPercent: 25 },
  DMG: { condition: 'Damaged', multiplier: 0.25, storeCreditPercent: 15, cashPercent: 10 },
};

export interface TradeCard {
  id: number;
  name: string;
  marketPrice: number; // in PHP
  condition: keyof typeof CONDITION_MULTIPLIERS;
  quantity?: number;
}

export interface TradeValuation {
  marketValue: number;
  conditionMultiplier: number;
  adjustedValue: number;
  storeCreditValue?: number;
  cashValue?: number;
}

/**
 * Calculate the adjusted value of a card based on condition
 */
export function calculateCardValue(card: TradeCard): TradeValuation {
  const config = CONDITION_MULTIPLIERS[card.condition];
  const quantity = card.quantity || 1;
  
  const marketValue = card.marketPrice * quantity;
  const adjustedValue = marketValue * config.multiplier;
  const storeCreditValue = adjustedValue * (config.storeCreditPercent / 100);
  const cashValue = adjustedValue * (config.cashPercent / 100);
  
  return {
    marketValue,
    conditionMultiplier: config.multiplier,
    adjustedValue,
    storeCreditValue,
    cashValue,
  };
}

/**
 * Calculate total value for an array of cards
 */
export function calculateTradeValue(cards: TradeCard[]): number {
  return cards.reduce((total, card) => {
    const valuation = calculateCardValue(card);
    return total + valuation.adjustedValue;
  }, 0);
}

/**
 * Calculate store buyback value
 */
export function calculateStoreBuyback(
  cards: TradeCard[],
  paymentType: 'STORE_CREDIT' | 'CASH'
): { total: number; breakdown: Array<{ card: TradeCard; value: number }> } {
  const breakdown = cards.map((card) => {
    const valuation = calculateCardValue(card);
    const value = paymentType === 'STORE_CREDIT' 
      ? valuation.storeCreditValue! 
      : valuation.cashValue!;
    
    return { card, value };
  });
  
  const total = breakdown.reduce((sum, item) => sum + item.value, 0);
  
  return { total, breakdown };
}

export interface TradeBalance {
  offeringValue: number;
  requestingValue: number;
  difference: number;
  isBalanced: boolean;
  cashTopupRequired: number;
}

/**
 * Calculate the value balance between two sets of cards (P2P Trade)
 */
export function calculateTradeBalance(
  offeringCards: TradeCard[],
  requestingCards: TradeCard[],
  tolerance: number = 50 // PHP tolerance for "balanced" trades
): TradeBalance {
  const offeringValue = calculateTradeValue(offeringCards);
  const requestingValue = calculateTradeValue(requestingCards);
  const difference = requestingValue - offeringValue;
  
  return {
    offeringValue,
    requestingValue,
    difference,
    isBalanced: Math.abs(difference) <= tolerance,
    cashTopupRequired: difference > 0 ? difference : 0,
  };
}

/**
 * Check if user qualifies for "Verified Trader" badge
 */
export function checkVerifiedTraderStatus(
  successfulTrades: number,
  averageRating: number,
  minTrades: number = 10,
  minRating: number = 4.0
): boolean {
  return successfulTrades >= minTrades && averageRating >= minRating;
}

/**
 * Calculate COGS (Cost of Goods Sold) for profit margin tracking
 */
export interface COGSData {
  acquisitionCost: number;
  salePrice: number;
  profit: number;
  profitMargin: number; // percentage
}

export function calculateCOGS(
  acquisitionCost: number,
  salePrice: number
): COGSData {
  const profit = salePrice - acquisitionCost;
  const profitMargin = (profit / salePrice) * 100;
  
  return {
    acquisitionCost,
    salePrice,
    profit,
    profitMargin,
  };
}

/**
 * Format PHP currency
 */
export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generate trade offer summary
 */
export function generateTradeSummary(
  offeringCards: TradeCard[],
  requestingCards: TradeCard[]
): string {
  const balance = calculateTradeBalance(offeringCards, requestingCards);
  
  let summary = `Offering: ${formatPHP(balance.offeringValue)}\n`;
  summary += `Requesting: ${formatPHP(balance.requestingValue)}\n`;
  
  if (balance.isBalanced) {
    summary += `Status: ✅ Balanced Trade`;
  } else if (balance.cashTopupRequired > 0) {
    summary += `Cash Top-up Required: ${formatPHP(balance.cashTopupRequired)}`;
  } else {
    summary += `You're offering ${formatPHP(Math.abs(balance.difference))} more`;
  }
  
  return summary;
}
