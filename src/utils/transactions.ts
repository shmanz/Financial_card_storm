import { Transaction, TransactionCategory, TransactionChannel, CategoryStats } from '../types/game';

// Merchant name pools per category for more flavorful mock data.
const MERCHANTS_BY_CATEGORY: Record<TransactionCategory, string[]> = {
  FOOD: ['한끼식당', '든든분식', '야식천국', '점심마스터'],
  CAFE: ['스타모카', '빈하우스', '카페라떼온리', '라떼파크', '커피로드'],
  GROCERIES: ['굿마켓', '슈퍼365', '프레시마켓', '하나로마트'],
  FUEL: ['하이옥탄주유소', '에코오일스테이션', '스피드주유소'],
  TRANSPORT: ['메트로라인', '시내버스', '고속버스', '택시콜'],
  SHOPPING: ['메가몰', '하이브리드아울렛', '디바이스월드', '패션빌리지'],
  SUBSCRIPTION: ['넷플릭스', '뮤직플러스', '드라마온', '게임패스', '뉴스데일리'],
  HEALTH: ['굿케어의원', '스마트약국', '헬스앤핏', '피트니스존'],
  TRAVEL: ['에어원', '트립나우', '호텔조이', '투어랜드'],
  ETC: ['기타지출', '개인송금', '잡비정산']
};

const CHANNELS: TransactionChannel[] = [
  'DEBIT_CARD',
  'CREDIT_CARD',
  'ACCOUNT_TRANSFER',
  'ATM',
  'AUTOPAY'
];

// Helper: random integer inclusive
const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: pick random element
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

// Generate a random date within the last `days` days.
const randomRecentDate = (days: number): Date => {
  const now = new Date();
  const offsetDays = randInt(0, days - 1);
  const d = new Date(now);
  d.setDate(now.getDate() - offsetDays);
  d.setHours(randInt(8, 22), randInt(0, 59), 0, 0);
  return d;
};

const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatTime = (d: Date): string => {
  const h = `${d.getHours()}`.padStart(2, '0');
  const m = `${d.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
};

// Generate one mock transaction amount for a given category.
const generateAmountForCategory = (category: TransactionCategory): number => {
  switch (category) {
    case 'FOOD':
    case 'GROCERIES':
      return -randInt(10000, 50000);
    case 'CAFE':
      return -randInt(3000, 15000);
    case 'FUEL':
      return -randInt(50000, 150000);
    case 'TRANSPORT':
      return -randInt(1000, 10000);
    case 'SHOPPING':
      return -randInt(20000, 300000);
    case 'SUBSCRIPTION':
      return -randInt(5000, 30000);
    case 'HEALTH':
      return -randInt(10000, 200000);
    case 'TRAVEL':
      return -randInt(50000, 500000);
    case 'ETC':
    default:
      return -randInt(1000, 100000);
  }
};

// Generate a couple of positive income transactions (e.g. salary).
const generateIncomeTransactions = (count: number, startingBalance: number): Transaction[] => {
  const txs: Transaction[] = [];
  let balance = startingBalance;

  for (let i = 0; i < count; i++) {
    const d = randomRecentDate(90);
    const amount = randInt(2_000_000, 4_000_000); // positive
    balance += amount;
    const category: TransactionCategory = Math.random() < 0.5 ? 'ETC' : 'GROCERIES';

    txs.push({
      id: `INC-${i}-${d.getTime()}`,
      date: formatDate(d),
      time: formatTime(d),
      channel: 'ACCOUNT_TRANSFER',
      category,
      merchant: category === 'ETC' ? '급여이체' : '식비보조금',
      description: '정기 수입 (월급/보너스 등)',
      amount,
      balanceAfter: balance
    });
  }

  return txs;
};

/**
 * Generate mock transaction history for a single virtual customer.
 *
 * NOTE: In a real system this function would be replaced with:
 * - an API call to a backend that queries a transaction DB, or
 * - an LLM-powered generator that builds realistic scenarios per customer persona.
 */
export const generateMockTransactions = (count: number = 200): Transaction[] => {
  const transactions: Transaction[] = [];

  // Initial balance between 2,000,000 and 5,000,000
  let balance = randInt(2_000_000, 5_000_000);

  // Pre-generate a few income transactions to mix in.
  const incomeTxs = generateIncomeTransactions(randInt(2, 4), balance);
  // Update balance to reflect the last income transaction
  if (incomeTxs.length > 0) {
    balance = incomeTxs[incomeTxs.length - 1].balanceAfter;
  }

  // Generate expense transactions
  for (let i = 0; i < count - incomeTxs.length; i++) {
    const d = randomRecentDate(90);
    const categoryPool: TransactionCategory[] = [
      'FOOD',
      'CAFE',
      'GROCERIES',
      'FUEL',
      'TRANSPORT',
      'SHOPPING',
      'SUBSCRIPTION',
      'HEALTH',
      'TRAVEL',
      'ETC'
    ];
    const category = pick(categoryPool);
    const amount = generateAmountForCategory(category);
    balance += amount;

    const merchant = pick(MERCHANTS_BY_CATEGORY[category]);

    transactions.push({
      id: `TX-${i}-${d.getTime()}`,
      date: formatDate(d),
      time: formatTime(d),
      channel: pick(CHANNELS),
      category,
      merchant,
      description: `${merchant} 결제`,
      amount,
      balanceAfter: balance
    });
  }

  // Merge and sort by date/time ascending for a more realistic ledger.
  const all = [...transactions, ...incomeTxs].sort((a, b) => {
    const aKey = `${a.date} ${a.time}`;
    const bKey = `${b.date} ${b.time}`;
    return aKey.localeCompare(bKey);
  });

  return all;
};

/**
 * Aggregate category-level stats from the transaction list.
 * Income (amount > 0) is ignored for total/avg, as requested.
 */
export const computeCategoryStats = (transactions: Transaction[]): CategoryStats[] => {
  const map = new Map<TransactionCategory, { totalAbs: number; count: number }>();

  for (const tx of transactions) {
    if (tx.amount >= 0) continue; // ignore income
    const entry = map.get(tx.category) ?? { totalAbs: 0, count: 0 };
    entry.totalAbs += Math.abs(tx.amount);
    entry.count += 1;
    map.set(tx.category, entry);
  }

  const stats: CategoryStats[] = [];
  for (const [category, { totalAbs, count }] of map.entries()) {
    stats.push({
      category,
      totalAmountAbs: totalAbs,
      transactionCount: count,
      avgAmountAbs: count > 0 ? Math.round(totalAbs / count) : 0
    });
  }

  return stats;
};







