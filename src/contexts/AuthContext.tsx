/**
 * ========================================
 * 인증 컨텍스트 (회원가입/로그인)
 * ========================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, UserProfile, BankProduct } from '../data/mockUsers';
import { generateMockTransactions } from '../utils/transactions';
import { STARTER_DECK } from '../data/starterCards';
import { Transaction } from '../types/game';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (name: string, password: string) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
  register: (name: string, password: string, email: string, products: BankProduct[]) => boolean;
  updateUserProducts: (products: BankProduct[]) => void;
  updateProductBalance: (type: string, name: string, balanceIncrease: number) => void;
  addPurchasedProduct: (productId: string, card: any) => void;
  unlockHiddenCard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Guest 사용자 생성
const createGuestUser = (): UserProfile => {
  // 기존 거래 생성 함수 재사용
  const guestTransactions = generateMockTransactions(200);

  return {
    id: 'guest-user',
    name: 'Guest',
    email: 'guest@example.com',
    password: '',
    registeredAt: new Date(),
    hasOpenBanking: false,
    hasHiddenCard: false,
    purchasedShopProducts: [],
    purchasedCards: [],
    bankProducts: [
      {
        type: 'DEPOSIT',
        name: '체험용 통장',
        provider: 'Guest Bank',
        balance: 3000000
      },
      {
        type: 'CARD',
        name: '체험용 카드',
        provider: 'Guest Card',
        cardLimit: 2000000
      }
    ],
    transactions: guestTransactions
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // LocalStorage에서 세션 복원
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      if (savedUserId === 'guest-user') {
        setCurrentUser(createGuestUser());
      } else {
        const user = MOCK_USERS.find(u => u.id === savedUserId);
        if (user) {
          setCurrentUser(user);
        }
      }
    }
  }, []);

  const login = (name: string, password: string): boolean => {
    const user = MOCK_USERS.find(
      u => u.name === name && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', user.id);
      return true;
    }

    return false;
  };

  const loginAsGuest = () => {
    const guestUser = createGuestUser();
    setCurrentUser(guestUser);
    localStorage.setItem('currentUserId', 'guest-user');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  const register = (
    name: string,
    password: string,
    email: string,
    products: BankProduct[]
  ): boolean => {
    // 이름 중복 체크
    const existing = MOCK_USERS.find(u => u.name === name || u.email === email);
    if (existing) {
      return false;
    }

    // 신규 회원용 최소 거래 내역 생성 (스타터 덱 생성 위해 필요)
    // 각 카테고리별 최소 1건씩 더미 거래
    const dummyTransactions: Transaction[] = [
      { id: 'new-1', date: '2024-12-01', time: '09:00', channel: 'ACCOUNT_TRANSFER', category: 'ETC', merchant: '신한은행', description: '계좌 개설', amount: 1000000, balanceAfter: 1000000 },
      { id: 'new-2', date: '2024-12-01', time: '10:00', channel: 'DEBIT_CARD', category: 'FOOD', merchant: '웰컴 세트', description: '신규 가입 축하', amount: -10000, balanceAfter: 990000 },
      { id: 'new-3', date: '2024-12-01', time: '11:00', channel: 'DEBIT_CARD', category: 'CAFE', merchant: '신한 카페', description: '신규 가입 축하', amount: -5000, balanceAfter: 985000 },
      { id: 'new-4', date: '2024-12-01', time: '12:00', channel: 'DEBIT_CARD', category: 'SHOPPING', merchant: '신한 쇼핑', description: '신규 가입 축하', amount: -20000, balanceAfter: 965000 },
      { id: 'new-5', date: '2024-12-01', time: '13:00', channel: 'DEBIT_CARD', category: 'TRANSPORT', merchant: '신한 교통', description: '신규 가입 축하', amount: -3000, balanceAfter: 962000 }
    ];

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      registeredAt: new Date(),
      hasOpenBanking: false,
      hasHiddenCard: false,
      purchasedShopProducts: [],
      purchasedCards: [],
      bankProducts: products,
      transactions: dummyTransactions // 최소 거래 내역
    };

    MOCK_USERS.push(newUser);
    setCurrentUser(newUser);
    localStorage.setItem('currentUserId', newUser.id);

    return true;
  };

  const updateUserProducts = (products: BankProduct[]) => {
    if (!currentUser) return;

    console.log('[계좌 추가] 새 금융 상품 추가:', products);
    currentUser.bankProducts = [...currentUser.bankProducts, ...products];
    setCurrentUser({ ...currentUser });
  };

  const updateProductBalance = (type: string, name: string, balanceIncrease: number) => {
    if (!currentUser) return;

    console.log('[계좌 업데이트] 상품 잔액 증가:', type, name, balanceIncrease);
    
    const productIndex = currentUser.bankProducts.findIndex(p => 
      p.type === type && p.name.includes(name)
    );

    if (productIndex !== -1) {
      currentUser.bankProducts[productIndex].balance = 
        (currentUser.bankProducts[productIndex].balance || 0) + balanceIncrease;
      
      setCurrentUser({ ...currentUser });
      console.log('[계좌 업데이트] 업데이트 완료. 새 잔액:', currentUser.bankProducts[productIndex].balance);
    } else {
      console.error('[계좌 업데이트] 상품을 찾을 수 없음:', type, name);
    }
  };

  const addPurchasedProduct = (productId: string, card: any) => {
    if (!currentUser) return;

    console.log('[상점 구매] 사용자별 구매 내역 저장:', productId);
    
    if (!currentUser.purchasedShopProducts) {
      currentUser.purchasedShopProducts = [];
    }
    if (!currentUser.purchasedCards) {
      currentUser.purchasedCards = [];
    }

    currentUser.purchasedShopProducts.push(productId);
    currentUser.purchasedCards.push(card);
    
    setCurrentUser({ ...currentUser });
  };

  const unlockHiddenCard = () => {
    if (!currentUser) {
      console.error('[히든 카드] ❌ currentUser가 없습니다!');
      return;
    }

    console.log('[히든 카드] 🎯 획득 프로세스 시작');
    console.log('[히든 카드] 현재 hasHiddenCard:', currentUser.hasHiddenCard);
    console.log('[히든 카드] 현재 purchasedCards:', currentUser.purchasedCards?.length || 0, '개');

    // 히든 카드 플래그 설정
    currentUser.hasHiddenCard = true;
    currentUser.hasOpenBanking = true;

    // 히든 카드를 purchasedCards에 추가 (중복 방지)
    const HIDDEN_CARD_ID = 'hidden-card-shinhan';
    const alreadyHas = currentUser.purchasedCards?.some(card => card.id === HIDDEN_CARD_ID);
    
    console.log('[히든 카드] 이미 보유 중?', alreadyHas);
    
    if (!alreadyHas) {
      const hiddenCard = {
        id: HIDDEN_CARD_ID,
        name: '🏦 신한 금융의 힘',
        category: 'ETC' as const,
        description: '신한은행 통합 금융의 힘! 8 피해 + 체력 5 회복 + 방어막 3 + 다음 턴 에너지 +2',
        cost: 4,
        attack: 8,
        defense: 3,
        effects: [
          { type: 'HEAL' as const, value: 5, target: 'SELF' as const },
          { type: 'SHIELD' as const, value: 3, target: 'SELF' as const },
          { type: 'ENERGY_NEXT_TURN' as const, value: 2, target: 'SELF' as const }
        ],
        imageUrl: '🏦',
        rarity: 'LEGENDARY' as const
      };

      if (!currentUser.purchasedCards) {
        currentUser.purchasedCards = [];
        console.log('[히든 카드] purchasedCards 배열 생성');
      }
      currentUser.purchasedCards.push(hiddenCard);
      
      console.log('[히든 카드] 💎 영구 획득! purchasedCards에 추가됨');
      console.log('[히든 카드] 현재 purchasedCards:', currentUser.purchasedCards.length, '개');
      console.log('[히든 카드] 카드 목록:', currentUser.purchasedCards.map(c => c.name));
    } else {
      console.log('[히든 카드] ⚠️ 이미 보유 중이므로 추가하지 않음');
    }

    setCurrentUser({ ...currentUser });
    console.log('[히든 카드] ✅ 상태 업데이트 완료');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isGuest: currentUser?.id === 'guest-user',
        login,
        loginAsGuest,
        logout,
        register,
        updateUserProducts,
        updateProductBalance,
        addPurchasedProduct,
        unlockHiddenCard
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

