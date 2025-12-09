/**
 * ========================================
 * 신규 회원 기본 카드 30장 세트
 * ========================================
 * 
 * 거래 내역이 없는 신규 회원을 위한 스타터 덱
 * 다양한 금융 테마의 창의적인 카드 구성
 */

import { Card } from '../types/game';

export const STARTER_DECK: Card[] = [
  // ========================================
  // 공격 카드 (10장) - 금융 거래 테마
  // ========================================
  {
    id: 'starter-attack-1',
    name: '월급날의 위력',
    category: 'ETC',
    description: '월급이 들어왔다! 2 피해를 줍니다.',
    cost: 1,
    attack: 2,
    defense: 0,
    effects: [],
    imageUrl: '💼',
    rarity: 'COMMON'
  },
  {
    id: 'starter-attack-2',
    name: '신용카드 결제',
    category: 'SHOPPING',
    description: '카드 한 번 긁기! 3 피해를 줍니다.',
    cost: 2,
    attack: 3,
    defense: 0,
    effects: [],
    imageUrl: '💳',
    rarity: 'COMMON'
  },
  {
    id: 'starter-attack-3',
    name: '보너스 폭탄',
    category: 'ETC',
    description: '예상치 못한 보너스! 4 피해를 줍니다.',
    cost: 3,
    attack: 4,
    defense: 0,
    effects: [],
    imageUrl: '🎁',
    rarity: 'COMMON'
  },
  {
    id: 'starter-attack-4',
    name: '대출 레버리지',
    category: 'ETC',
    description: '빚으로 공격한다. 5 피해를 줍니다.',
    cost: 4,
    attack: 5,
    defense: 0,
    effects: [],
    imageUrl: '⚡',
    rarity: 'RARE'
  },
  {
    id: 'starter-attack-5',
    name: '주식 대박',
    category: 'ETC',
    description: '수익 실현! 6 피해를 줍니다.',
    cost: 5,
    attack: 6,
    defense: 0,
    effects: [],
    imageUrl: '🚀',
    rarity: 'RARE'
  },
  {
    id: 'starter-attack-6',
    name: '세금 환급',
    category: 'ETC',
    description: '돌려받은 세금으로 공격! 3 피해.',
    cost: 2,
    attack: 3,
    defense: 0,
    effects: [],
    imageUrl: '🧾',
    rarity: 'COMMON'
  },
  {
    id: 'starter-attack-7',
    name: '적금 만기',
    category: 'ETC',
    description: '모아둔 돈의 힘! 4 피해를 줍니다.',
    cost: 3,
    attack: 4,
    defense: 0,
    effects: [],
    imageUrl: '💎',
    rarity: 'COMMON'
  },
  {
    id: 'starter-attack-8',
    name: '재테크 성공',
    category: 'ETC',
    description: '투자 수익! 3 피해를 줍니다.',
    cost: 2,
    attack: 3,
    defense: 0,
    effects: [],
    imageUrl: '📊',
    rarity: 'COMMON'
  },
  {
    id: 'starter-attack-9',
    name: '청약 당첨',
    category: 'ETC',
    description: '로또급 행운! 5 피해를 줍니다.',
    cost: 4,
    attack: 5,
    defense: 0,
    effects: [],
    imageUrl: '🏠',
    rarity: 'RARE'
  },
  {
    id: 'starter-attack-10',
    name: '연말정산 환급',
    category: 'ETC',
    description: '돌려받은 세금! 2 피해를 줍니다.',
    cost: 1,
    attack: 2,
    defense: 0,
    effects: [],
    imageUrl: '📄',
    rarity: 'COMMON'
  },

  // ========================================
  // 회복 카드 (5장) - 금융 안정 테마
  // ========================================
  {
    id: 'starter-heal-1',
    name: '예비 자금 활용',
    category: 'HEALTH',
    description: '비상금으로 회복! 체력 3 회복.',
    cost: 2,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 3, target: 'SELF' }],
    imageUrl: '🆘',
    rarity: 'COMMON'
  },
  {
    id: 'starter-heal-2',
    name: '건강보험 혜택',
    category: 'HEALTH',
    description: '보험의 힘! 체력 4 회복.',
    cost: 2,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 4, target: 'SELF' }],
    imageUrl: '🏥',
    rarity: 'COMMON'
  },
  {
    id: 'starter-heal-3',
    name: '저축 인출',
    category: 'HEALTH',
    description: '모아둔 돈 사용. 체력 2 회복.',
    cost: 1,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 2, target: 'SELF' }],
    imageUrl: '🏧',
    rarity: 'COMMON'
  },
  {
    id: 'starter-heal-4',
    name: '배당금 수령',
    category: 'ETC',
    description: '정기 수익! 체력 3 회복.',
    cost: 2,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 3, target: 'SELF' }],
    imageUrl: '💸',
    rarity: 'COMMON'
  },
  {
    id: 'starter-heal-5',
    name: '이자 수익',
    category: 'ETC',
    description: '예금 이자! 체력 2 회복.',
    cost: 1,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 2, target: 'SELF' }],
    imageUrl: '🪙',
    rarity: 'COMMON'
  },

  // ========================================
  // 방어 카드 (5장) - 금융 보호 테마
  // ========================================
  {
    id: 'starter-shield-1',
    name: '비상금 준비',
    category: 'ETC',
    description: '예비자금으로 방어! 방어막 3.',
    cost: 2,
    attack: 0,
    defense: 3,
    effects: [{ type: 'SHIELD', value: 3, target: 'SELF' }],
    imageUrl: '🔐',
    rarity: 'COMMON'
  },
  {
    id: 'starter-shield-2',
    name: '보험 가입',
    category: 'INSURANCE',
    description: '위험 대비! 방어막 4.',
    cost: 2,
    attack: 0,
    defense: 4,
    effects: [{ type: 'SHIELD', value: 4, target: 'SELF' }],
    imageUrl: '🛡️',
    rarity: 'COMMON'
  },
  {
    id: 'starter-shield-3',
    name: '안전 자산 확보',
    category: 'ETC',
    description: '채권 투자! 방어막 2.',
    cost: 1,
    attack: 0,
    defense: 2,
    effects: [{ type: 'SHIELD', value: 2, target: 'SELF' }],
    imageUrl: '📜',
    rarity: 'COMMON'
  },
  {
    id: 'starter-shield-4',
    name: '정기예금 만기',
    category: 'SAVINGS',
    description: '안전한 투자! 방어막 3.',
    cost: 2,
    attack: 0,
    defense: 3,
    effects: [{ type: 'SHIELD', value: 3, target: 'SELF' }],
    imageUrl: '🏦',
    rarity: 'COMMON'
  },
  {
    id: 'starter-shield-5',
    name: '손해보험 청구',
    category: 'INSURANCE',
    description: '피해 보상! 방어막 5.',
    cost: 3,
    attack: 0,
    defense: 5,
    effects: [{ type: 'SHIELD', value: 5, target: 'SELF' }],
    imageUrl: '🏛️',
    rarity: 'RARE'
  },

  // ========================================
  // 유틸리티 카드 (10장) - 금융 전략 테마
  // ========================================
  {
    id: 'starter-draw-1',
    name: '포트폴리오 분석',
    category: 'ETC',
    description: '투자 계획 수립! 카드 1장 드로우. 1 피해.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    imageUrl: '📋',
    rarity: 'COMMON'
  },
  {
    id: 'starter-draw-2',
    name: '금융 컨설팅',
    category: 'ETC',
    description: '전문가 조언! 카드 1장 드로우. 1 피해.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    imageUrl: '🎓',
    rarity: 'COMMON'
  },
  {
    id: 'starter-draw-3',
    name: '재무 설계',
    category: 'ETC',
    description: '미래 계획! 카드 1장 드로우. 1 피해.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    imageUrl: '📝',
    rarity: 'COMMON'
  },
  {
    id: 'starter-draw-4',
    name: '자산 재배분',
    category: 'ETC',
    description: '리밸런싱! 카드 1장 드로우. 1 피해.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    imageUrl: '⚖️',
    rarity: 'COMMON'
  },
  {
    id: 'starter-draw-5',
    name: '시장 분석',
    category: 'ETC',
    description: '트렌드 파악! 카드 1장 드로우. 1 피해.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    imageUrl: '🔍',
    rarity: 'COMMON'
  },
  {
    id: 'starter-energy-1',
    name: '급여 이체',
    category: 'ETC',
    description: '월급 입금! 2 피해 + 에너지 +1.',
    cost: 2,
    attack: 2,
    defense: 0,
    effects: [{ type: 'ENERGY_BUFF', value: 1, target: 'SELF' }],
    imageUrl: '💵',
    rarity: 'COMMON'
  },
  {
    id: 'starter-energy-2',
    name: '복리의 힘',
    category: 'SAVINGS',
    description: '이자가 이자를! 1 피해 + 에너지 +1.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'ENERGY_BUFF', value: 1, target: 'SELF' }],
    imageUrl: '🌱',
    rarity: 'COMMON'
  },
  {
    id: 'starter-energy-3',
    name: '티끌 모아 태산',
    category: 'SAVINGS',
    description: '적금의 마법! 1 피해 + 에너지 +1.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'ENERGY_BUFF', value: 1, target: 'SELF' }],
    imageUrl: '🏔️',
    rarity: 'COMMON'
  },
  {
    id: 'starter-combo-1',
    name: '절약의 미학',
    category: 'ETC',
    description: '아끼고 모으기! 2 피해 + 방어막 1.',
    cost: 2,
    attack: 2,
    defense: 1,
    effects: [{ type: 'SHIELD', value: 1, target: 'SELF' }],
    imageUrl: '💡',
    rarity: 'COMMON'
  },
  {
    id: 'starter-combo-2',
    name: '분산 투자',
    category: 'INVESTMENT',
    description: '리스크 관리! 2 피해 + 방어막 2.',
    cost: 2,
    attack: 2,
    defense: 2,
    effects: [{ type: 'SHIELD', value: 2, target: 'SELF' }],
    imageUrl: '🎲',
    rarity: 'COMMON'
  },

  // ========================================
  // 특수 카드 (10장) - 금융 상품 테마
  // ========================================
  {
    id: 'starter-special-1',
    name: '정기예금 개설',
    category: 'SAVINGS',
    description: '안전한 선택! 방어막 3.',
    cost: 2,
    attack: 0,
    defense: 3,
    effects: [{ type: 'SHIELD', value: 3, target: 'SELF' }],
    imageUrl: '🏦',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-2',
    name: 'CMA 통장',
    category: 'DEPOSIT',
    description: '유동성 확보! 체력 2 회복.',
    cost: 1,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 2, target: 'SELF' }],
    imageUrl: '💼',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-3',
    name: 'ISA 계좌',
    category: 'INVESTMENT',
    description: '세금 우대! 2 피해 + 체력 1 회복.',
    cost: 2,
    attack: 2,
    defense: 0,
    effects: [{ type: 'HEAL', value: 1, target: 'SELF' }],
    imageUrl: '🎫',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-4',
    name: '청약저축 납입',
    category: 'SAVINGS',
    description: '내 집 마련 준비! 방어막 2.',
    cost: 1,
    attack: 0,
    defense: 2,
    effects: [{ type: 'SHIELD', value: 2, target: 'SELF' }],
    imageUrl: '🏘️',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-5',
    name: 'IRP 적립',
    category: 'INVESTMENT',
    description: '은퇴 준비! 체력 3 회복.',
    cost: 2,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 3, target: 'SELF' }],
    imageUrl: '🎯',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-6',
    name: '펀드 매수',
    category: 'INVESTMENT',
    description: '장기 투자! 2 피해 + 카드 1장 드로우.',
    cost: 2,
    attack: 2,
    defense: 0,
    effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    imageUrl: '💹',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-7',
    name: '체크카드 사용',
    category: 'CARD',
    description: '현금처럼! 2 피해.',
    cost: 1,
    attack: 2,
    defense: 0,
    effects: [],
    imageUrl: '💳',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-8',
    name: '캐시백 적립',
    category: 'SHOPPING',
    description: '포인트 쌓기! 1 피해 + 체력 1 회복.',
    cost: 1,
    attack: 1,
    defense: 0,
    effects: [{ type: 'HEAL', value: 1, target: 'SELF' }],
    imageUrl: '🎉',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-9',
    name: '실손보험 청구',
    category: 'INSURANCE',
    description: '의료비 돌려받기! 체력 3 회복.',
    cost: 2,
    attack: 0,
    defense: 0,
    effects: [{ type: 'HEAL', value: 3, target: 'SELF' }],
    imageUrl: '💊',
    rarity: 'COMMON'
  },
  {
    id: 'starter-special-10',
    name: '자동이체 설정',
    category: 'SUBSCRIPTION',
    description: '편리한 관리! 2 피해.',
    cost: 1,
    attack: 2,
    defense: 0,
    effects: [],
    imageUrl: '🔄',
    rarity: 'COMMON'
  }
];
