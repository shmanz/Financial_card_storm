/**
 * ========================================
 * 7명 가상 인물 데이터베이스
 * ========================================
 * 
 * 각 인물마다:
 * - 고유한 거래 패턴
 * - 보유 상품 (예금, 적금, 보험, 카드, 투자)
 * - 거래 내역
 */

import { Transaction, TransactionCategory } from '../types/game';

export interface BankProduct {
  type: 'DEPOSIT' | 'SAVINGS' | 'INSURANCE' | 'CARD' | 'INVESTMENT' | 'LOAN';
  name: string;
  provider: string; // 은행/보험사명
  balance?: number; // 잔액 (예금/적금/투자) 또는 대출금액 (음수)
  monthlyPayment?: number; // 월 납입액 (적금/보험) 또는 월 상환액 (대출)
  cardLimit?: number; // 카드 한도
  returnRate?: number; // 수익률 (투자) 또는 이자율 (대출, 음수)
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password: string; // 실제로는 해시 처리해야 함
  registeredAt: Date;
  bankProducts: BankProduct[];
  transactions: Transaction[];
  // 오픈뱅킹 연동 여부
  hasOpenBanking: boolean;
  // 히든 카드 보유 여부
  hasHiddenCard: boolean;
  // 카드 상점 구매 내역 (개인별)
  purchasedShopProducts?: string[];
  // 카드 상점에서 획득한 카드 (개인별)
  purchasedCards?: Card[];
  // PvP 전적 통계
  pvpStats?: {
    wins: number;
    losses: number;
    totalGames: number;
    winRate: number; // 승률 (0-1)
    // 주 단위 전적 기록
    weeklyRecords?: {
      week: string; // "2024-W01" 형식
      wins: number;
      losses: number;
      winRate: number;
    }[];
    // 최근 업데이트 시간
    lastUpdated?: Date;
  };
  // 명예의 전당 보상 카드
  hallOfFameRewards?: string[]; // 주차별로 획득한 보상 카드 ID
}

// Card 타입 임포트를 위한 임시 정의 (순환 참조 방지)
interface Card {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: number;
  attack: number;
  defense: number;
  effects: any[];
  imageUrl?: string;
  rarity?: string;
}

// ========================================
// 7명의 가상 인물
// ========================================

export const MOCK_USERS: UserProfile[] = [
  // 1. 염승훈 - 보수적 투자자 (신한은행 주거래)
  {
    id: 'user-001',
    name: '염승훈',
    email: 'yeom@example.com',
    password: 'password123',
    registeredAt: new Date('2024-01-15'),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      // 신한금융그룹 상품
      {
        type: 'DEPOSIT',
        name: '신한 쏠편한 입출금통장',
        provider: '신한은행',
        balance: 8_500_000
      },
      {
        type: 'SAVINGS',
        name: '신한 청년도약적금',
        provider: '신한은행',
        balance: 15_000_000,
        monthlyPayment: 600_000
      },
      {
        type: 'CARD',
        name: '신한 Deep Dream',
        provider: '신한카드',
        cardLimit: 5_000_000
      },
      {
        type: 'INSURANCE',
        name: '신한 건강보험',
        provider: '신한생명',
        monthlyPayment: 180_000
      },
      // 오픈뱅킹 상품
      {
        type: 'DEPOSIT',
        name: '자유입출금통장',
        provider: '국민은행',
        balance: 3_200_000
      },
      {
        type: 'INSURANCE',
        name: '암보험',
        provider: '삼성생명',
        monthlyPayment: 150_000
      }
    ],
    transactions: [] // 아래에서 생성
  },

  // 2. 이태영 - 공격적 투자자 (신한투자증권 주거래)
  {
    id: 'user-002',
    name: '이태영',
    email: 'lee@example.com',
    password: 'password123',
    registeredAt: new Date('2024-02-20'),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      // 신한금융그룹 상품
      {
        type: 'DEPOSIT',
        name: '신한 ISA 계좌',
        provider: '신한은행',
        balance: 12_000_000
      },
      {
        type: 'INVESTMENT',
        name: '신한 글로벌 ETF',
        provider: '신한투자증권',
        balance: 30_000_000,
        returnRate: 15.2
      },
      {
        type: 'INVESTMENT',
        name: 'IRP (개인형 퇴직연금)',
        provider: '신한은행',
        balance: 18_000_000,
        returnRate: 8.5
      },
      {
        type: 'CARD',
        name: '신한 Deep Dream',
        provider: '신한카드',
        cardLimit: 7_000_000
      },
      // 오픈뱅킹 상품
      {
        type: 'INVESTMENT',
        name: '미국 S&P500 ETF',
        provider: '미래에셋증권',
        balance: 15_000_000,
        returnRate: 12.5
      },
      {
        type: 'INVESTMENT',
        name: '비트코인',
        provider: '업비트',
        balance: 10_000_000,
        returnRate: -5.3
      }
    ],
    transactions: []
  },

  // 3. 좌상목 - 쇼핑 중독자 (신한카드 주력)
  {
    id: 'user-003',
    name: '좌상목',
    email: 'jwa@example.com',
    password: 'password123',
    registeredAt: new Date('2024-03-10'),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      // 신한금융그룹 상품
      {
        type: 'DEPOSIT',
        name: '신한 쏠편한 통장',
        provider: '신한은행',
        balance: 4_500_000
      },
      {
        type: 'CARD',
        name: '신한 Mr.Life',
        provider: '신한카드',
        cardLimit: 6_000_000
      },
      {
        type: 'CARD',
        name: '신한 Deep Dream',
        provider: '신한카드',
        cardLimit: 5_000_000
      },
      {
        type: 'SAVINGS',
        name: '신한 자유적금',
        provider: '신한은행',
        balance: 8_000_000,
        monthlyPayment: 400_000
      },
      // 오픈뱅킹 상품
      {
        type: 'CARD',
        name: '현대 M포인트',
        provider: '현대카드',
        cardLimit: 4_000_000
      },
      {
        type: 'DEPOSIT',
        name: '입출금통장',
        provider: '하나은행',
        balance: 1_800_000
      }
    ],
    transactions: []
  },

  // 4. 서재만 - 균형잡힌 재테크형 (신한금융그룹 올인원)
  {
    id: 'user-004',
    name: '서재만',
    email: 'seo@example.com',
    password: 'password123',
    registeredAt: new Date('2024-04-05'),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      // 신한금융그룹 상품
      {
        type: 'DEPOSIT',
        name: '신한 SOL 통장',
        provider: '신한은행',
        balance: 15_000_000
      },
      {
        type: 'SAVINGS',
        name: '신한 정기적금',
        provider: '신한은행',
        balance: 22_000_000,
        monthlyPayment: 800_000
      },
      {
        type: 'INVESTMENT',
        name: '신한 배당주 펀드',
        provider: '신한투자증권',
        balance: 35_000_000,
        returnRate: 10.5
      },
      {
        type: 'INVESTMENT',
        name: 'IRP (개인형 퇴직연금)',
        provider: '신한은행',
        balance: 25_000_000,
        returnRate: 7.8
      },
      {
        type: 'INSURANCE',
        name: '신한 종합보험',
        provider: '신한생명',
        monthlyPayment: 200_000
      },
      {
        type: 'CARD',
        name: '신한 Deep Oil',
        provider: '신한카드',
        cardLimit: 8_000_000
      },
      // 오픈뱅킹 상품
      {
        type: 'DEPOSIT',
        name: 'CMA 통장',
        provider: '토스뱅크',
        balance: 5_000_000
      },
      {
        type: 'INSURANCE',
        name: '실손의료보험',
        provider: 'KB손해보험',
        monthlyPayment: 80_000
      }
    ],
    transactions: []
  },

  // 5. 강승완 - IT 프리랜서 (신한 디지털뱅킹)
  {
    id: 'user-005',
    name: '강승완',
    email: 'kang@example.com',
    password: 'password123',
    registeredAt: new Date('2024-05-12'),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      // 신한금융그룹 상품
      {
        type: 'DEPOSIT',
        name: '신한 개인사업자 통장',
        provider: '신한은행',
        balance: 18_000_000
      },
      {
        type: 'CARD',
        name: '신한 Deep Dream',
        provider: '신한카드',
        cardLimit: 9_000_000
      },
      {
        type: 'INVESTMENT',
        name: '신한 해외주식 ETF',
        provider: '신한투자증권',
        balance: 28_000_000,
        returnRate: 18.5
      },
      {
        type: 'SAVINGS',
        name: '신한 정기적금',
        provider: '신한은행',
        balance: 10_000_000,
        monthlyPayment: 500_000
      },
      // 오픈뱅킹 상품
      {
        type: 'DEPOSIT',
        name: '케이뱅크 통장',
        provider: '케이뱅크',
        balance: 5_000_000
      },
      {
        type: 'INVESTMENT',
        name: '나스닥 ETF',
        provider: '키움증권',
        balance: 15_000_000,
        returnRate: 15.8
      }
    ],
    transactions: []
  },

  // 6. 배형준 - 헬스/여행 애호가 (신한 트래블 특화)
  {
    id: 'user-006',
    name: '배형준',
    email: 'bae@example.com',
    password: 'password123',
    registeredAt: new Date('2024-06-18'),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      // 신한금융그룹 상품
      {
        type: 'DEPOSIT',
        name: '신한 급여통장',
        provider: '신한은행',
        balance: 7_200_000
      },
      {
        type: 'SAVINGS',
        name: '신한 여행적금',
        provider: '신한은행',
        balance: 12_000_000,
        monthlyPayment: 500_000
      },
      {
        type: 'INSURANCE',
        name: '신한 건강보험',
        provider: '신한생명',
        monthlyPayment: 250_000
      },
      {
        type: 'CARD',
        name: '신한 Deep Dream',
        provider: '신한카드',
        cardLimit: 6_000_000
      },
      // 오픈뱅킹 상품
      {
        type: 'DEPOSIT',
        name: 'IBK 통장',
        provider: 'IBK기업은행',
        balance: 2_500_000
      },
      {
        type: 'INSURANCE',
        name: '암보험',
        provider: '현대해상',
        monthlyPayment: 150_000
      }
    ],
    transactions: []
  },

  // 7. 임지훈 - 대학원생 (신한 청년금융)
  {
    id: 'user-007',
    name: '임지훈',
    email: 'lim@example.com',
    password: 'password123',
    registeredAt: new Date('2024-07-22'),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      // 신한금융그룹 상품
      {
        type: 'DEPOSIT',
        name: '신한 청년통장',
        provider: '신한은행',
        balance: 2_800_000
      },
      {
        type: 'SAVINGS',
        name: '신한 청년도약적금',
        provider: '신한은행',
        balance: 5_400_000,
        monthlyPayment: 200_000
      },
      {
        type: 'CARD',
        name: '신한 체크카드',
        provider: '신한카드',
        cardLimit: 2_000_000
      },
      // 오픈뱅킹 상품
      {
        type: 'DEPOSIT',
        name: '카카오뱅크 통장',
        provider: '카카오뱅크',
        balance: 800_000
      },
      {
        type: 'SAVINGS',
        name: '자유적금',
        provider: '카카오뱅크',
        balance: 2_000_000,
        monthlyPayment: 100_000
      }
    ],
    transactions: []
  }
];

// ========================================
// 개인별 맞춤 거래 내역 생성 함수
// ========================================

export function generateUserTransactions(userId: string, count: number = 200): Transaction[] {
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) return [];

  const transactions: Transaction[] = [];
  let balance = user.bankProducts.find(p => p.type === 'DEPOSIT')?.balance || 3_000_000;

  // 사용자별 카테고리 선호도
  const categoryWeights: Record<string, Record<TransactionCategory, number>> = {
    'user-001': { FOOD: 2, CAFE: 1, GROCERIES: 3, FUEL: 1, TRANSPORT: 2, SHOPPING: 1, SUBSCRIPTION: 1, HEALTH: 2, TRAVEL: 1, ETC: 1 },
    'user-002': { FOOD: 2, CAFE: 3, GROCERIES: 1, FUEL: 2, TRANSPORT: 1, SHOPPING: 3, SUBSCRIPTION: 4, HEALTH: 1, TRAVEL: 2, ETC: 2 },
    'user-003': { FOOD: 1, CAFE: 2, GROCERIES: 1, FUEL: 1, TRANSPORT: 2, SHOPPING: 5, SUBSCRIPTION: 2, HEALTH: 1, TRAVEL: 1, ETC: 1 },
    'user-004': { FOOD: 2, CAFE: 2, GROCERIES: 2, FUEL: 2, TRANSPORT: 2, SHOPPING: 2, SUBSCRIPTION: 2, HEALTH: 2, TRAVEL: 2, ETC: 2 },
    'user-005': { FOOD: 2, CAFE: 4, GROCERIES: 1, FUEL: 1, TRANSPORT: 1, SHOPPING: 2, SUBSCRIPTION: 5, HEALTH: 1, TRAVEL: 1, ETC: 2 },
    'user-006': { FOOD: 3, CAFE: 2, GROCERIES: 2, FUEL: 2, TRANSPORT: 2, SHOPPING: 2, SUBSCRIPTION: 2, HEALTH: 4, TRAVEL: 5, ETC: 1 },
    'user-007': { FOOD: 3, CAFE: 2, GROCERIES: 3, FUEL: 1, TRANSPORT: 3, SHOPPING: 1, SUBSCRIPTION: 2, HEALTH: 1, TRAVEL: 1, ETC: 1 }
  };

  const weights = categoryWeights[userId] || categoryWeights['user-004'];

  // 가중치 기반 카테고리 풀 생성
  const weightedCategories: TransactionCategory[] = [];
  for (const [cat, weight] of Object.entries(weights)) {
    for (let i = 0; i < weight; i++) {
      weightedCategories.push(cat as TransactionCategory);
    }
  }

  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

  const randomDate = () => {
    const now = new Date();
    const offset = randInt(0, 89);
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    d.setHours(randInt(8, 22), randInt(0, 59), 0, 0);
    return d;
  };

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatTime = (d: Date) => {
    const h = `${d.getHours()}`.padStart(2, '0');
    const m = `${d.getMinutes()}`.padStart(2, '0');
    return `${h}:${m}`;
  };

  for (let i = 0; i < count; i++) {
    const d = randomDate();
    const category = pick(weightedCategories);
    
    let amount = 0;
    switch (category) {
      case 'FOOD': amount = -randInt(10000, 50000); break;
      case 'CAFE': amount = -randInt(3000, 15000); break;
      case 'GROCERIES': amount = -randInt(20000, 80000); break;
      case 'FUEL': amount = -randInt(50000, 150000); break;
      case 'TRANSPORT': amount = -randInt(1000, 10000); break;
      case 'SHOPPING': amount = -randInt(30000, 500000); break;
      case 'SUBSCRIPTION': amount = -randInt(5000, 50000); break;
      case 'HEALTH': amount = -randInt(20000, 300000); break;
      case 'TRAVEL': amount = -randInt(100000, 1000000); break;
      default: amount = -randInt(5000, 100000);
    }

    balance += amount;

    transactions.push({
      id: `tx-${userId}-${i}`,
      date: formatDate(d),
      time: formatTime(d),
      channel: pick(['DEBIT_CARD', 'CREDIT_CARD', 'ACCOUNT_TRANSFER', 'ATM', 'AUTOPAY']),
      category,
      merchant: `${category} 가맹점 ${randInt(1, 99)}`,
      description: `${category} 결제`,
      amount,
      balanceAfter: balance
    });
  }

  // 월급 추가 (2~3회)
  for (let i = 0; i < randInt(2, 3); i++) {
    const d = randomDate();
    const salary = randInt(2500000, 4500000);
    balance += salary;
    
    transactions.push({
      id: `salary-${userId}-${i}`,
      date: formatDate(d),
      time: '09:00',
      channel: 'ACCOUNT_TRANSFER',
      category: 'ETC',
      merchant: '(주)급여이체',
      description: '월급',
      amount: salary,
      balanceAfter: balance
    });
  }

  // 날짜순 정렬
  transactions.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  
  return transactions;
}

// ========================================
// 거래 내역 생성 및 저장
// ========================================

export function initializeUserTransactions() {
  for (const user of MOCK_USERS) {
    user.transactions = generateUserTransactions(user.id, 200);
  }
}

// 초기화
initializeUserTransactions();



