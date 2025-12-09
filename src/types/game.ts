// Core domain types for the financial card game.
// These are intentionally simple so that later we can swap the data source
// (e.g., real banking API / DB) without changing the UI layer.

export type TransactionChannel =
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'ACCOUNT_TRANSFER'
  | 'ATM'
  | 'AUTOPAY';

export type TransactionCategory =
  | 'FOOD'
  | 'CAFE'
  | 'GROCERIES'
  | 'FUEL'
  | 'TRANSPORT'
  | 'SHOPPING'
  | 'SUBSCRIPTION'
  | 'HEALTH'
  | 'TRAVEL'
  | 'ETC';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  channel: TransactionChannel;
  category: TransactionCategory;
  merchant: string;
  description: string;
  amount: number; // 음수 = 지출, 양수 = 수입
  balanceAfter: number; // 거래 후 잔액
}

export interface CategoryStats {
  category: TransactionCategory;
  totalAmountAbs: number; // 지출 절대값 합 (수입 제외)
  transactionCount: number;
  avgAmountAbs: number;
}

// ========================================
// PART 1: 카드 효과 타입 시스템 (50종 지원)
// ========================================
export type CardEffectType =
  | 'DAMAGE'
  | 'HEAL'
  | 'SHIELD'
  | 'STUN'
  | 'ENERGY_BUFF'
  | 'ENERGY_NEXT_TURN'
  | 'DRAW'
  | 'DISCARD'
  | 'DEBUFF'
  | 'SELF_BUFF'
  | 'AOE_DAMAGE'
  | 'DAMAGE_REDUCTION'
  | 'ATTACK_BUFF'
  | 'ATTACK_DEBUFF'
  | 'ENERGY_STEAL'
  | 'CARD_COST_REDUCTION'
  | 'CARD_UPGRADE'
  | 'CLEANSE'
  | 'DOT_DAMAGE' // Damage Over Time
  | 'HOT_HEAL'; // Heal Over Time

export interface CardEffect {
  type: CardEffectType;
  value: number;
  duration?: number; // 버프/디버프 지속 턴 (optional)
  target?: 'SELF' | 'ENEMY' | 'ALL'; // 대상
}

export interface Card {
  id: string;
  name: string;
  category: TransactionCategory;
  description: string;
  cost: number; // 1~5
  attack: number; // 1~10 (기본 공격력, DAMAGE 효과와 별개)
  defense: number; // 0~5
  effects: CardEffect[]; // 카드 효과 배열 (1~2개)
  imageUrl?: string; // 카드 일러스트 placeholder
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// ========================================
// 버프/디버프 상태 추가
// ========================================
export interface StatusEffect {
  type: CardEffectType;
  value: number;
  remainingTurns: number;
  source: string; // 카드 ID
}

export interface GameState {
  playerHp: number;
  playerMaxHp: number; // 최대 HP 추가
  playerShield: number; // 방어막
  playerStatusEffects: StatusEffect[]; // 버프/디버프
  fatigue: number; // 피로도 카운터 (덱이 비었을 때)
  
  bossHp: number;
  bossMaxHp: number;
  bossShield: number;
  bossStatusEffects: StatusEffect[];
  
  maxEnergy: number;
  currentEnergy: number;
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  turn: number; // PvP에서는 개인 턴, 싱글에서는 전체 턴
  round: number; // PvP 전용: 라운드 (선공+후공 1번씩 = 1라운드)
  isPlayerTurn: boolean;
  isGameOver: boolean;
  winner: 'PLAYER' | 'BOSS' | null;
  log: string[];
  
  // PvP 대비 추가
  gameMode: 'SINGLE' | 'PVP'; // 게임 모드 구분
  roomId?: string;
  opponentId?: string;
  isMultiplayer?: boolean;
}



