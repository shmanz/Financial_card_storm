/**
 * ========================================
 * 50종 카드 능력 데이터베이스 (수정됨)
 * ========================================
 * 
 * 중요: attack 값과 effects의 DAMAGE 중복 방지!
 * - baseAttack: 화면에 표시될 공격력
 * - effects: 추가 효과만 (DAMAGE는 baseAttack에 포함)
 */

import { CardEffect, TransactionCategory } from '../types/game';

export interface CardAbilityTemplate {
  id: string;
  category: TransactionCategory;
  name: string;
  description: string;
  effects: CardEffect[];
  baseCost: number;
  baseAttack: number; // 실제 피해량 (화면 표시 + 실제 계산 모두 사용)
  baseDefense: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// ========================================
// 🍔 FOOD (10종)
// ========================================
const FOOD_ABILITIES: CardAbilityTemplate[] = [
  {
    id: 'FOOD_1',
    category: 'FOOD',
    name: '든든한 한 끼',
    description: '체력을 2 회복합니다.',
    effects: [{ type: 'HEAL', value: 2, target: 'SELF' }],
    baseCost: 1,
    baseAttack: 0, // 공격 없음
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'FOOD_2',
    category: 'FOOD',
    name: '보양식 풀코스',
    description: '체력을 4 회복합니다.',
    effects: [{ type: 'HEAL', value: 4, target: 'SELF' }],
    baseCost: 2,
    baseAttack: 0,
    baseDefense: 0,
    rarity: 'RARE'
  },
  {
    id: 'FOOD_3',
    category: 'FOOD',
    name: '방어적 식사',
    description: '이번 턴 받는 피해를 2 감소시킵니다.',
    effects: [{ type: 'DAMAGE_REDUCTION', value: 2, duration: 1, target: 'SELF' }],
    baseCost: 1,
    baseAttack: 0,
    baseDefense: 2,
    rarity: 'COMMON'
  },
  {
    id: 'FOOD_4',
    category: 'FOOD',
    name: '영양 만점 도시락',
    description: '카드를 1장 드로우합니다.',
    effects: [{ type: 'DRAW', value: 1, target: 'SELF' }],
    baseCost: 1,
    baseAttack: 1, // 약한 공격
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'FOOD_5',
    category: 'FOOD',
    name: '야식 폭식',
    description: '2 피해를 주고 체력을 1 회복합니다.',
    effects: [{ type: 'HEAL', value: 1, target: 'SELF' }],
    baseCost: 2,
    baseAttack: 2, // 2 피해 (effects에 DAMAGE 없음!)
    baseDefense: 0,
    rarity: 'RARE'
  },
  {
    id: 'FOOD_6',
    category: 'FOOD',
    name: '매운맛 도전',
    description: '3 피해를 줍니다.',
    effects: [],
    baseCost: 1,
    baseAttack: 3, // 3 피해
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'FOOD_7',
    category: 'FOOD',
    name: '완벽한 영양 밸런스',
    description: '체력 3 회복 + 방어막 2',
    effects: [
      { type: 'HEAL', value: 3, target: 'SELF' },
      { type: 'SHIELD', value: 2, target: 'SELF' }
    ],
    baseCost: 3,
    baseAttack: 0,
    baseDefense: 2,
    rarity: 'EPIC'
  }
];

// ========================================
// ☕ CAFE (10종)
// ========================================
const CAFE_ABILITIES: CardAbilityTemplate[] = [
  {
    id: 'CAFE_1',
    category: 'CAFE',
    name: '카페인 러시',
    description: '2 피해 + 에너지를 즉시 1 얻습니다.',
    effects: [{ type: 'ENERGY_BUFF', value: 1, target: 'SELF' }],
    baseCost: 1,
    baseAttack: 2, // 2 피해
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'CAFE_2',
    category: 'CAFE',
    name: '더블샷 에스프레소',
    description: '카드 2장 드로우 후 1장을 버립니다.',
    effects: [
      { type: 'DRAW', value: 2, target: 'SELF' },
      { type: 'DISCARD', value: 1, target: 'SELF' }
    ],
    baseCost: 2,
    baseAttack: 0,
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'CAFE_3',
    category: 'CAFE',
    name: '쓴맛 공격',
    description: '2 피해를 주고 카드 1장을 버립니다.',
    effects: [{ type: 'DISCARD', value: 1, target: 'SELF' }],
    baseCost: 1,
    baseAttack: 2,
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'CAFE_4',
    category: 'CAFE',
    name: '라떼 아트',
    description: '방어막 3을 얻습니다.',
    effects: [{ type: 'SHIELD', value: 3, target: 'SELF' }],
    baseCost: 2,
    baseAttack: 0,
    baseDefense: 3,
    rarity: 'COMMON'
  },
  {
    id: 'CAFE_5',
    category: 'CAFE',
    name: '오버 카페인',
    description: '3 피해를 줍니다.',
    effects: [],
    baseCost: 3,
    baseAttack: 3,
    baseDefense: 0,
    rarity: 'RARE'
  }
];

// ========================================
// 🛒 SHOPPING (5종)
// ========================================
const SHOPPING_ABILITIES: CardAbilityTemplate[] = [
  {
    id: 'SHOPPING_1',
    category: 'SHOPPING',
    name: '지름신 소환',
    description: '5 피해를 줍니다.',
    effects: [],
    baseCost: 3,
    baseAttack: 5,
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'SHOPPING_2',
    category: 'SHOPPING',
    name: '세일 폭격',
    description: '상대를 1턴간 스턴시킵니다.',
    effects: [{ type: 'STUN', value: 1, duration: 1, target: 'ENEMY' }],
    baseCost: 4,
    baseAttack: 0,
    baseDefense: 0,
    rarity: 'EPIC'
  },
  {
    id: 'SHOPPING_3',
    category: 'SHOPPING',
    name: '플렉스 타임',
    description: '8 피해를 주지만 손패 1장을 버립니다.',
    effects: [{ type: 'DISCARD', value: 1, target: 'SELF' }],
    baseCost: 4,
    baseAttack: 8,
    baseDefense: 0,
    rarity: 'RARE'
  },
  {
    id: 'SHOPPING_4',
    category: 'SHOPPING',
    name: '할인 쿠폰',
    description: '2 피해를 줍니다.',
    effects: [],
    baseCost: 2,
    baseAttack: 2,
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'SHOPPING_5',
    category: 'SHOPPING',
    name: '명품 구매',
    description: '6 피해를 주고 방어막 4를 얻습니다.',
    effects: [{ type: 'SHIELD', value: 4, target: 'SELF' }],
    baseCost: 5,
    baseAttack: 6,
    baseDefense: 4,
    rarity: 'LEGENDARY'
  }
];

// ========================================
// 🚗 TRANSPORT, ⛽ FUEL, 👟 HEALTH 등 나머지도 동일 패턴으로 간소화
// ========================================
const OTHER_ABILITIES: CardAbilityTemplate[] = [
  {
    id: 'TRANSPORT_1',
    category: 'TRANSPORT',
    name: '정기 통근',
    description: '방어막 5를 얻습니다.',
    effects: [{ type: 'SHIELD', value: 5, target: 'SELF' }],
    baseCost: 2,
    baseAttack: 0,
    baseDefense: 5,
    rarity: 'COMMON'
  },
  {
    id: 'FUEL_1',
    category: 'FUEL',
    name: '고속도로 질주',
    description: '4 피해를 줍니다.',
    effects: [],
    baseCost: 3,
    baseAttack: 4,
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'HEALTH_1',
    category: 'HEALTH',
    name: '건강 투자',
    description: '체력 6 회복',
    effects: [{ type: 'HEAL', value: 6, target: 'SELF' }],
    baseCost: 3,
    baseAttack: 0,
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'TRAVEL_1',
    category: 'TRAVEL',
    name: '장거리 여행',
    description: '7 피해를 줍니다.',
    effects: [],
    baseCost: 4,
    baseAttack: 7,
    baseDefense: 0,
    rarity: 'RARE'
  },
  {
    id: 'SUBSCRIPTION_1',
    category: 'SUBSCRIPTION',
    name: '정기 결제',
    description: '3 피해를 줍니다.',
    effects: [],
    baseCost: 2,
    baseAttack: 3,
    baseDefense: 0,
    rarity: 'COMMON'
  },
  {
    id: 'GROCERIES_1',
    category: 'GROCERIES',
    name: '알뜰 장보기',
    description: '체력 3 회복 + 방어막 1',
    effects: [
      { type: 'HEAL', value: 3, target: 'SELF' },
      { type: 'SHIELD', value: 1, target: 'SELF' }
    ],
    baseCost: 2,
    baseAttack: 0,
    baseDefense: 1,
    rarity: 'COMMON'
  },
  {
    id: 'ETC_1',
    category: 'ETC',
    name: '잡비 폭발',
    description: '4 피해를 줍니다.',
    effects: [],
    baseCost: 2,
    baseAttack: 4,
    baseDefense: 0,
    rarity: 'COMMON'
  }
];

// ========================================
// 전체 카드 능력 데이터베이스
// ========================================
export const ALL_CARD_ABILITIES: CardAbilityTemplate[] = [
  ...FOOD_ABILITIES,
  ...CAFE_ABILITIES,
  ...SHOPPING_ABILITIES,
  ...OTHER_ABILITIES
];

// 카테고리별로 능력 가져오기
export const getAbilitiesByCategory = (category: TransactionCategory): CardAbilityTemplate[] => {
  const abilities = ALL_CARD_ABILITIES.filter((ab) => ab.category === category);
  // 해당 카테고리 능력이 없으면 기본 공격 카드 생성
  if (abilities.length === 0) {
    return [{
      id: `${category}_DEFAULT`,
      category,
      name: `${category} 공격`,
      description: '3 피해를 줍니다.',
      effects: [],
      baseCost: 2,
      baseAttack: 3,
      baseDefense: 0,
      rarity: 'COMMON'
    }];
  }
  return abilities;
};

// 랜덤 능력 가져오기
export const getRandomAbility = (category: TransactionCategory): CardAbilityTemplate => {
  const abilities = getAbilitiesByCategory(category);
  return abilities[Math.floor(Math.random() * abilities.length)];
};
