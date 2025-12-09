import { Card, CategoryStats, TransactionCategory } from '../types/game';
import { getRandomAbility, ALL_CARD_ABILITIES } from '../data/cardAbilities';

// Map transaction category semantics into card flavor.
const CARD_FLAVOR: Record<
  TransactionCategory,
  { names: string[]; descriptionTemplate: (attack: number) => string }
> = {
  FOOD: {
    names: ['든든한 한 끼', '폭식의 저녁', '야식 파워'],
    descriptionTemplate: (atk) => `포만감으로 힘을 낸다. 보스에게 ${atk} 피해를 준다.`
  },
  CAFE: {
    names: ['카페인 러시', '밤샘 준비', '핸드드립 집중력'],
    descriptionTemplate: (atk) => `오늘도 커피로 버틴다. 보스에게 ${atk} 피해를 준다.`
  },
  GROCERIES: {
    names: ['알뜰 장보기', '창고 정리 세일', '대형 마트 쇼핑'],
    descriptionTemplate: (atk) =>
      `생활비가 쌓인다. 지출의 무게만큼 보스에게 ${atk} 피해를 준다.`
  },
  FUEL: {
    names: ['고속도로 질주', '풀악셀 드라이브', '장거리 주유'],
    descriptionTemplate: (atk) => `빠른 이동으로 기세를 올린다. 보스에게 ${atk} 피해를 준다.`
  },
  TRANSPORT: {
    names: ['정기 통근', '막차 질주', '환승 마스터'],
    descriptionTemplate: (atk) => `매일의 이동 패턴이 힘이 된다. 보스에게 ${atk} 피해.`
  },
  SHOPPING: {
    names: ['지름신 소환', '세일폭격', '플렉스 타임'],
    descriptionTemplate: (atk) => `큰 지출만큼 강한 공격. 보스에게 ${atk} 피해를 준다.`
  },
  SUBSCRIPTION: {
    names: ['정기 결제의 굴레', '자동 갱신', '끝없는 구독'],
    descriptionTemplate: (atk) =>
      `턴이 지날수록 강해지는 고정비. 지금은 보스에게 ${atk} 피해를 준다.`
  },
  HEALTH: {
    names: ['건강 투자', '헬스 등록', '병원 진료'],
    descriptionTemplate: (atk) =>
      `몸 관리는 필수. 재정 부담만큼 보스에게 ${atk} 피해를 준다.`
  },
  TRAVEL: {
    names: ['장거리 여행', '휴가 예약', '비행기 플렉스'],
    descriptionTemplate: (atk) =>
      `큰 여행 한방. 기억은 남고 돈은 나간다. 보스에게 ${atk} 피해.`
  },
  ETC: {
    names: ['알 수 없는 지출', '잡비 폭발', '예상치 못한 비용'],
    descriptionTemplate: (atk) =>
      `어디서 샌 건지 모르는 비용. 예산을 흔들며 보스에게 ${atk} 피해.`
  }
};

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

// Cost scaling based on average absolute spending per transaction.
const costFromAvgAmount = (avg: number): number => {
  if (avg < 15_000) return 1;
  if (avg < 40_000) return 2;
  if (avg < 80_000) return 3;
  if (avg < 150_000) return 4;
  return 5;
};

// Attack scaling based on total absolute spending per category.
const attackFromTotalAmount = (total: number): number => {
  if (total < 200_000) return 2;
  if (total < 500_000) return 3;
  if (total < 1_000_000) return 4;
  if (total < 2_000_000) return 5;

  // For large spenders, ramp up to 6~10
  if (total < 3_000_000) return 6;
  if (total < 4_000_000) return 7;
  if (total < 5_000_000) return 8;
  if (total < 6_000_000) return 9;
  return 10;
};

// Simple defense: tie loosely to cost for now.
const defenseFromCost = (cost: number): number => {
  if (cost <= 2) return 0;
  if (cost === 3) return 1;
  if (cost === 4) return 2;
  return 3;
};

/**
 * ========================================
 * PART 2: 카드 생성 로직 고도화 (50종 효과 사용)
 * ========================================
 * 
 * Generate a diverse set of cards per transaction category,
 * using the 50+ ability templates from cardAbilities.ts
 *
 * NOTE: 추후 개선 가능 지점:
 * - LLM API 연동으로 사용자 소비 패턴 기반 개인화된 카드 생성
 * - 실제 은행 DB 데이터 연동 시 통계 기반 자동 밸런싱
 * - 카드 일러스트 AI 생성 (DALL-E, Midjourney 등)
 */
export const generateCardsFromStats = (stats: CategoryStats[]): Card[] => {
  const cards: Card[] = [];
  let cardIdCounter = 0;

  for (const s of stats) {
    // 각 카테고리당 2~4장의 카드 생성
    const count = randInt(2, 4);
    
    for (let i = 0; i < count; i++) {
      // 해당 카테고리의 랜덤 능력 템플릿 가져오기
      const abilityTemplate = getRandomAbility(s.category);
      
      // 통계 기반 스케일링 (비용/공격력 조정)
      const costScale = costFromAvgAmount(s.avgAmountAbs);
      const attackScale = attackFromTotalAmount(s.totalAmountAbs);
      
      // 템플릿 기본값과 통계 스케일링을 조합
      const finalCost = Math.max(1, Math.min(10, abilityTemplate.baseCost + costScale - 2));
      
      // ========================================
      // attack = baseAttack (이제 중복 없음!)
      // ========================================
      const finalAttack = abilityTemplate.baseAttack;
      const finalDefense = abilityTemplate.baseDefense;
      
      // 설명을 실제 값으로 업데이트
      let finalDescription = abilityTemplate.description;
      if (finalAttack > 0) {
        // 공격력이 있으면 설명에 피해량 표시
        finalDescription = finalDescription.replace(/\d+\s*피해/g, `${finalAttack} 피해`);
      }
      
      // 카드 일러스트: 카테고리별 이모지 사용
      const categoryEmoji: Record<string, string> = {
        FOOD: '🍔',
        CAFE: '☕',
        GROCERIES: '🛒',
        FUEL: '⛽',
        TRANSPORT: '🚌',
        SHOPPING: '🛍️',
        SUBSCRIPTION: '💳',
        HEALTH: '🏥',
        TRAVEL: '✈️',
        ETC: '💰'
      };

      cards.push({
        id: `card-${cardIdCounter++}-${s.category}-${i}`,
        name: abilityTemplate.name, // 원래 이름 그대로
        category: s.category,
        description: finalDescription, // 실제 값으로 업데이트됨
        cost: finalCost,
        attack: finalAttack, // 실제 피해량 (표시와 계산 모두 사용)
        defense: finalDefense,
        effects: abilityTemplate.effects, // DAMAGE 제외, 추가 효과만
        imageUrl: categoryEmoji[s.category] || '💳',
        rarity: abilityTemplate.rarity
      });
    }
  }

  console.log('[카드 생성] 총', cards.length, '장 생성');
  return cards;
};



