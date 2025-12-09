/**
 * ========================================
 * 히든 카드 정의
 * ========================================
 * PvP 패배 후 추가 거래 시 획득 가능한 특별 카드
 */

import { Card } from '../types/game';

export const HIDDEN_CARD: Card = {
  id: 'hidden-card-shinhan',
  name: '🏦 신한 금융의 힘',
  category: 'ETC',
  description: '신한은행 통합 금융의 힘! 8 피해 + 체력 5 회복 + 방어막 3 + 다음 턴 에너지 +2',
  cost: 4,
  attack: 8,
  defense: 3,
  effects: [
    { type: 'HEAL', value: 5, target: 'SELF' },
    { type: 'SHIELD', value: 3, target: 'SELF' },
    { type: 'ENERGY_NEXT_TURN', value: 2, target: 'SELF' }
  ],
  imageUrl: '🏦',
  rarity: 'LEGENDARY'
};

