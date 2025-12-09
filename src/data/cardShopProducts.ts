/**
 * ========================================
 * 카드 상점 상품 데이터
 * ========================================
 * 추가 거래를 통해 획득할 수 있는 특별 카드
 */

import { Card } from '../types/game';
import { BankProduct } from './mockUsers';

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: '신한금융' | '투자' | '저축' | '보험' | '대출';
  price: number; // 필요한 금액
  emoji: string;
  card: Card; // 획득 카드
  requiresShinhan?: boolean; // 신한금융그룹 상품 보유 필요 여부
  requiresProduct?: {
    type: 'INVESTMENT' | 'DEPOSIT' | 'SAVINGS' | 'CARD' | 'INSURANCE' | 'LOAN';
    name: string; // 필요한 상품 이름 (예: 'IRP')
    mustNotHave?: boolean; // true면 이 상품이 없어야 구매 가능 (IRP 신규 가입 등)
  }; // 특정 상품 보유 필요/불필요
  addProduct?: BankProduct; // 구매 시 추가할 금융 상품
  updateProduct?: {
    type: 'INVESTMENT' | 'DEPOSIT' | 'SAVINGS' | 'CARD' | 'INSURANCE' | 'LOAN';
    name: string; // 업데이트할 상품 이름
    balanceIncrease: number; // 잔액 증가액
  }; // 기존 상품 업데이트
  isNewProduct?: boolean; // 신규 가입 상품 여부
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  // 신한금융 상품
  // IRP 추가 납입 (기존 IRP 보유 필요)
  {
    id: 'shop-irp',
    name: 'IRP 추가 납입',
    description: '개인형 퇴직연금에 100만원 추가 납입하고 세제혜택 카드를 받으세요! (기존 IRP 보유 필요)',
    category: '투자',
    price: 1000000,
    emoji: '📈',
    requiresShinhan: true,
    requiresProduct: {
      type: 'INVESTMENT',
      name: 'IRP'
    },
    updateProduct: {
      type: 'INVESTMENT',
      name: 'IRP',
      balanceIncrease: 1000000
    },
    card: {
      id: 'card-tax-benefit',
      name: '💰 세제혜택',
      category: 'ETC',
      description: '연금저축의 힘! 6 피해를 주고 체력 4 회복. 다음 턴 에너지 +1',
      cost: 3,
      attack: 6,
      defense: 0,
      effects: [
        { type: 'HEAL', value: 4, target: 'SELF' },
        { type: 'ENERGY_NEXT_TURN', value: 1, target: 'SELF' }
      ],
      imageUrl: '💰',
      rarity: 'EPIC'
    }
  },
  // IRP 신규 가입 (기존 IRP 없을 때만)
  {
    id: 'shop-irp-new',
    name: 'IRP 신규 가입',
    description: '신한은행 개인형 퇴직연금 신규 가입! 특별 세제혜택 카드 제공! (IRP 미보유자만)',
    category: '투자',
    price: 1000000,
    emoji: '🎁',
    requiresShinhan: true,
    requiresProduct: {
      type: 'INVESTMENT',
      name: 'IRP',
      mustNotHave: true // 이 상품이 없어야 구매 가능
    },
    isNewProduct: true,
    addProduct: {
      type: 'INVESTMENT',
      name: 'IRP (개인형 퇴직연금)',
      provider: '신한은행',
      balance: 1000000,
      returnRate: 7.5
    },
    card: {
      id: 'card-tax-benefit-new',
      name: '💰 신규가입 세제혜택',
      category: 'ETC',
      description: '신규 가입 특별! 7 피해 + 체력 5 회복 + 에너지 +2',
      cost: 3,
      attack: 7,
      defense: 0,
      effects: [
        { type: 'HEAL', value: 5, target: 'SELF' },
        { type: 'ENERGY_NEXT_TURN', value: 2, target: 'SELF' }
      ],
      imageUrl: '💰',
      rarity: 'EPIC'
    }
  },
  {
    id: 'shop-subscription-new',
    name: '청약저축 신규 가입',
    description: '신한은행 청약저축 신규 가입! 아파트 구매 방어 카드를 받으세요!',
    category: '저축',
    price: 500000,
    emoji: '🏘️',
    requiresShinhan: true,
    isNewProduct: true,
    addProduct: {
      type: 'SAVINGS',
      name: '신한 청약저축',
      provider: '신한은행',
      balance: 500000,
      monthlyPayment: 100000
    },
    card: {
      id: 'card-apartment',
      name: '🏘️ 아파트 구매',
      category: 'ETC',
      description: '내 집 마련의 꿈! 방어막 8을 얻고 적에게 3 피해',
      cost: 4,
      attack: 3,
      defense: 8,
      effects: [
        { type: 'SHIELD', value: 8, target: 'SELF' }
      ],
      imageUrl: '🏘️',
      rarity: 'EPIC'
    }
  },
  {
    id: 'shop-savings',
    name: '정기적금 가입',
    description: '신한은행 정기적금 월 30만원 가입하고 복리 카드를 받으세요!',
    category: '저축',
    price: 300000,
    emoji: '💎',
    requiresShinhan: true,
    isNewProduct: true,
    addProduct: {
      type: 'SAVINGS',
      name: '신한 정기적금',
      provider: '신한은행',
      balance: 300000,
      monthlyPayment: 300000
    },
    card: {
      id: 'card-compound',
      name: '💎 복리의 마법',
      category: 'ETC',
      description: '시간이 지날수록 강해진다! 4 피해 + 카드 2장 드로우',
      cost: 3,
      attack: 4,
      defense: 0,
      effects: [
        { type: 'DRAW', value: 2, target: 'SELF' }
      ],
      imageUrl: '💎',
      rarity: 'RARE'
    }
  },
  {
    id: 'shop-insurance',
    name: '건강보험 가입',
    description: '신한생명 건강보험 가입하고 건강 지키기 카드를 받으세요!',
    category: '보험',
    price: 200000,
    emoji: '🏥',
    requiresShinhan: true,
    card: {
      id: 'card-health-insurance',
      name: '🏥 건강 지키기',
      category: 'HEALTH',
      description: '예방이 최선! 체력 6 회복 + 방어막 3',
      cost: 3,
      attack: 0,
      defense: 3,
      effects: [
        { type: 'HEAL', value: 6, target: 'SELF' },
        { type: 'SHIELD', value: 3, target: 'SELF' }
      ],
      imageUrl: '🏥',
      rarity: 'RARE'
    }
  },
  {
    id: 'shop-credit-card',
    name: '신한카드 발급',
    description: '신한 Deep Dream 카드 발급하고 캐시백 카드를 받으세요!',
    category: '신한금융',
    price: 100000, // 연회비
    emoji: '💳',
    requiresShinhan: true,
    isNewProduct: true,
    addProduct: {
      type: 'CARD',
      name: '신한 Deep Dream',
      provider: '신한카드',
      cardLimit: 5000000
    },
    card: {
      id: 'card-cashback',
      name: '💳 캐시백 리워드',
      category: 'SHOPPING',
      description: '쓸수록 돌려받는다! 5 피해 + 에너지 +2',
      cost: 4,
      attack: 5,
      defense: 0,
      effects: [
        { type: 'ENERGY_BUFF', value: 2, target: 'SELF' }
      ],
      imageUrl: '💳',
      rarity: 'EPIC'
    }
  },
  {
    id: 'shop-loan',
    name: '신용대출 실행',
    description: '신한은행 신용대출 500만원 실행하고 레버리지 카드를 받으세요! (위험)',
    category: '대출',
    price: 100000, // 취급 수수료
    emoji: '⚡',
    requiresShinhan: true,
    isNewProduct: true,
    addProduct: {
      type: 'LOAN',
      name: '신한 신용대출',
      provider: '신한은행',
      balance: 5000000, // 대출금액
      monthlyPayment: 150000, // 월 상환액
      returnRate: 8.5 // 연 이자율
    },
    card: {
      id: 'card-leverage',
      name: '⚡ 레버리지',
      category: 'ETC',
      description: '빚의 양날의 검! 10 피해를 주지만 자신도 3 피해',
      cost: 5,
      attack: 10,
      defense: 0,
      effects: [],
      imageUrl: '⚡',
      rarity: 'LEGENDARY'
    }
  },
  {
    id: 'shop-fund',
    name: '펀드 가입',
    description: '신한투자증권 펀드 100만원 가입하고 분산투자 카드를 받으세요!',
    category: '투자',
    price: 1000000,
    emoji: '📊',
    requiresShinhan: true,
    isNewProduct: true,
    addProduct: {
      type: 'INVESTMENT',
      name: '신한 배당주 펀드',
      provider: '신한투자증권',
      balance: 1000000,
      returnRate: 9.5
    },
    card: {
      id: 'card-diversify',
      name: '📊 분산투자',
      category: 'INVESTMENT',
      description: '리스크 관리! 3 피해 + 방어막 4 + 카드 1장 드로우',
      cost: 3,
      attack: 3,
      defense: 4,
      effects: [
        { type: 'SHIELD', value: 4, target: 'SELF' },
        { type: 'DRAW', value: 1, target: 'SELF' }
      ],
      imageUrl: '📊',
      rarity: 'RARE'
    }
  },
  {
    id: 'shop-stock',
    name: '주식 투자',
    description: '신한금융지주 주식 50만원 매수하고 배당금 카드를 받으세요!',
    category: '투자',
    price: 500000,
    emoji: '📈',
    requiresShinhan: false,
    card: {
      id: 'card-dividend',
      name: '📈 배당금',
      category: 'INVESTMENT',
      description: '장기 투자의 보상! 2 피해 + 체력 3 회복 + 에너지 +1',
      cost: 2,
      attack: 2,
      defense: 0,
      effects: [
        { type: 'HEAL', value: 3, target: 'SELF' },
        { type: 'ENERGY_BUFF', value: 1, target: 'SELF' }
      ],
      imageUrl: '📈',
      rarity: 'COMMON'
    }
  }
];


