import React, { useMemo, useReducer, useState } from 'react';
import { computeCategoryStats } from './utils/transactions';
import { generateCardsFromStats } from './utils/cards';
import { gameReducer, createInitialGameState } from './gameState';
import { HeroPanel } from './components/HeroPanel';
import { HandArea } from './components/HandArea';
import { EnergyBar } from './components/EnergyBar';
import { GameLog } from './components/GameLog';
import { TransactionPreview } from './components/TransactionPreview';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { LoginScreen } from './components/LoginScreen';
import { PvPBattle } from './components/PvPBattle';
import { OpenBankingPopup } from './components/OpenBankingPopup';
import { AccountOverview } from './components/AccountOverview';
import { DeckManager } from './components/DeckManager';
import { CardShop } from './components/CardShop';
import { useSocket } from './hooks/useSocket';
import { useAuth } from './contexts/AuthContext';
import { Card } from './types/game';
import { BankProduct } from './data/mockUsers';
import { STARTER_DECK } from './data/starterCards';

type Screen = 'MAIN' | 'BATTLE' | 'MULTIPLAYER_LOBBY' | 'MULTIPLAYER_BATTLE' | 'ACCOUNT' | 'DECK_MANAGER' | 'CARD_SHOP';

const App: React.FC = () => {
  const { currentUser, isAuthenticated, isGuest, logout, updateProductBalance, addPurchasedProduct, updateUserProducts } = useAuth();
  
  // State 선언 (먼저!)
  const [screen, setScreen] = useState<Screen>('MAIN');
  const [showTxPreview, setShowTxPreview] = useState(false);
  const [showOpenBanking, setShowOpenBanking] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [opponentNickname, setOpponentNickname] = useState('상대 플레이어');
  const [selectedDeck, setSelectedDeck] = useState<Card[]>([]);
  
  // 거래 기반 카드와 기본 카드를 분리하여 관리
  const { transactionCards, purchasedCards: userPurchasedCards, starterCards } = useMemo(() => {
    if (!currentUser) return { transactionCards: [], purchasedCards: [], starterCards: STARTER_DECK };
    
    let txCards: Card[] = [];
    
    // 거래 패턴 기반 카드 생성 (신규 회원 제외)
    if (currentUser.transactions.length >= 10) {
      const stats = computeCategoryStats(currentUser.transactions);
      txCards = generateCardsFromStats(stats);
      console.log('[카드 분류] 거래 기반 카드:', txCards.length, '장');
    }
    
    const purchased = currentUser.purchasedCards || [];
    console.log('[카드 분류] 상점 구매 카드:', purchased.length, '장');
    console.log('[카드 분류] 기본 카드:', STARTER_DECK.length, '장');
    
    return {
      transactionCards: txCards,
      purchasedCards: purchased,
      starterCards: STARTER_DECK
    };
  }, [currentUser]);

  // 전체 카드 덱 생성 (최대 100장) - 표시용
  const allCards = useMemo(() => {
    // 우선순위: 거래 카드 → 구매 카드 → 기본 카드
    const deck = [
      ...transactionCards,
      ...userPurchasedCards,
      ...starterCards
    ];
    
    // 전체 카드 100장 제한
    if (deck.length > 100) {
      console.log('[전체 카드] 100장 초과, 100장으로 제한:', deck.length);
      return deck.slice(0, 100);
    }
    
    console.log('[전체 카드] 최종:', deck.length, '장 (거래', transactionCards.length, '+ 구매', userPurchasedCards.length, '+ 기본', starterCards.length, ')');
    return deck;
  }, [transactionCards, userPurchasedCards, starterCards]);

  // 디버그: showOpenBanking 상태 추적
  React.useEffect(() => {
    console.log('[App] 🏦 showOpenBanking 상태 변경:', showOpenBanking);
  }, [showOpenBanking]);

  // 히든 카드 (purchasedCards에서 가져옴)
  const hiddenCard: Card | null = currentUser?.purchasedCards?.find(
    card => card.id === 'hidden-card-shinhan'
  ) || null;

  // 전투 덱 (정확히 30장, 동일 카드 최대 2장)
  const battleDeck = useMemo(() => {
    // ========================================
    // 동일 카드명 제한 함수 (최대 2장)
    // ========================================
    const addCardsWithLimit = (
      currentDeck: Card[], 
      cardsToAdd: Card[], 
      maxTotal: number = 30
    ): { deck: Card[], nameCount: Record<string, number> } => {
      const result = [...currentDeck];
      const nameCount: Record<string, number> = {};
      
      // 현재 덱의 카드명 카운트
      result.forEach(c => {
        nameCount[c.name] = (nameCount[c.name] || 0) + 1;
      });
      
      // 새 카드 추가 (동일 카드 2장 제한)
      const existingIds = new Set(result.map(c => c.id));
      
      for (const card of cardsToAdd) {
        if (result.length >= maxTotal) break;
        if (existingIds.has(card.id)) continue; // 이미 추가된 카드 제외
        
        const count = nameCount[card.name] || 0;
        if (count < 2) {
          result.push(card);
          nameCount[card.name] = count + 1;
          existingIds.add(card.id);
        } else {
          console.log('[전투 덱] 제외:', card.name, '(이미 2장 선택됨)');
        }
      }
      
      return { deck: result, nameCount };
    };
    
    // ========================================
    // 사용자 선택 덱 사용 여부
    // ========================================
    if (selectedDeck.length >= 10) {
      // 사용자가 선택한 전투 덱 사용 (이미 DeckManager에서 2장 제한 적용됨)
      let userDeck = [...selectedDeck].slice(0, 30);
      console.log('[전투 덱] 사용자 선택 덱 사용:', userDeck.length, '장');
      
      // 히든 카드 추가
      if (hiddenCard) {
        if (userDeck.length >= 30) {
          userDeck = [...userDeck.slice(0, 29), hiddenCard];
        } else {
          userDeck = [...userDeck, hiddenCard];
        }
      }
      
      console.log('[전투 덱] 최종 (사용자 선택):', userDeck.length, '장');
      return userDeck;
    }
    
    // ========================================
    // 자동 선택: 우선순위 적용 (동일 카드 최대 2장)
    // 1순위: 히든 카드
    // 2순위: 거래 기반 카드 (동일 카드 최대 2장)
    // 3순위: 구매한 카드 (카드 상점, 동일 카드 최대 2장)
    // 4순위: 기본 카드 (부족분만, 동일 카드 최대 2장)
    // ========================================
    let autoDeck: Card[] = [];
    let nameCount: Record<string, number> = {};
    
    // 1순위: 히든 카드
    if (hiddenCard) {
      autoDeck.push(hiddenCard);
      nameCount[hiddenCard.name] = 1;
      console.log('[전투 덱] 🔹 1순위 - 히든 카드:', hiddenCard.name);
    }
    
    // 2순위: 거래 기반 카드 (동일 카드 최대 2장)
    const beforeTx = autoDeck.length;
    const txResult = addCardsWithLimit(autoDeck, transactionCards, 30);
    autoDeck = txResult.deck;
    nameCount = txResult.nameCount;
    console.log('[전투 덱] 📊 2순위 - 거래 카드 추가:', autoDeck.length - beforeTx, '장, 현재 총:', autoDeck.length, '장');
    
    // 3순위: 구매한 카드 (카드 상점, 히든 카드 제외)
    if (autoDeck.length < 30) {
      const purchasedCardsExcludingHidden = userPurchasedCards.filter(
        card => card.id !== 'hidden-card-shinhan'
      );
      
      const beforePurchased = autoDeck.length;
      const purchasedResult = addCardsWithLimit(autoDeck, purchasedCardsExcludingHidden, 30);
      autoDeck = purchasedResult.deck;
      nameCount = purchasedResult.nameCount;
      console.log('[전투 덱] 🛒 3순위 - 구매 카드 추가:', autoDeck.length - beforePurchased, '장, 현재 총:', autoDeck.length, '장');
    }
    
    // 4순위: 기본 카드 (부족분만, 동일 카드 최대 2장)
    if (autoDeck.length < 30) {
      const needed = 30 - autoDeck.length;
      console.log('[전투 덱] 🎴 4순위 - 기본 카드로', needed, '장 채우기');
      
      const basicResult = addCardsWithLimit(autoDeck, starterCards, 30);
      autoDeck = basicResult.deck;
      nameCount = basicResult.nameCount;
      
      console.log('[전투 덱] 기본 카드 추가 후:', autoDeck.length, '장');
    }
    
    // 동일 카드 통계
    const duplicates = Object.entries(nameCount).filter(([_, count]) => count === 2);
    console.log('[전투 덱] ✅ 최종:', autoDeck.length, '장');
    console.log('[전투 덱] 📊 동일 카드 2장:', duplicates.length, '종류');
    
    return autoDeck;
  }, [transactionCards, userPurchasedCards, starterCards, selectedDeck, hiddenCard]);

  // 덱 변경 핸들러
  const handleDeckChange = (newDeck: Card[]) => {
    setSelectedDeck(newDeck);
    console.log('[덱 변경] 새 덱 적용:', newDeck.length, '장');
  };

  // 카드 구매 핸들러
  const handleCardPurchase = (
    card: Card, 
    productId: string, 
    newProduct?: BankProduct,
    updateInfo?: { type: string; name: string; balanceIncrease: number }
  ) => {
    console.log('[카드 구매] 카드 획득:', card.name);
    
    // 사용자별 구매 내역에 추가 (AuthContext에 저장)
    addPurchasedProduct(productId, card);
    
    // 새 금융 상품 추가 (AuthContext를 통해 상태 업데이트)
    if (newProduct) {
      console.log('[카드 구매] 금융 상품 추가:', newProduct.name);
      updateUserProducts([newProduct]);
    }
    
    // 기존 상품 잔액 업데이트
    if (updateInfo) {
      console.log('[카드 구매] 기존 상품 업데이트:', updateInfo);
      updateProductBalance(updateInfo.type, updateInfo.name, updateInfo.balanceIncrease);
    }
  };

  // 신한금융 상품 보유 여부
  const hasShinhanProduct = currentUser?.bankProducts.some(p => p.provider.includes('신한')) || false;

  // 초기 상태를 직접 생성 (useMemo 사용)
  const initialState = useMemo(() => {
    if (battleDeck.length > 0) {
      return createInitialGameState(battleDeck, 'SINGLE');
    }
    // 덱이 없어도 기본 상태 제공
    return {
      playerHp: 20,
      playerMaxHp: 20,
      playerShield: 0,
      playerStatusEffects: [],
      fatigue: 0,
      bossHp: 20,
      bossMaxHp: 20,
      bossShield: 0,
      bossStatusEffects: [],
      maxEnergy: 1,
      currentEnergy: 1,
      deck: [],
      hand: [],
      discardPile: [],
      turn: 1,
      round: 1,
      isPlayerTurn: true,
      isGameOver: false,
      winner: null,
      log: ['게임을 시작하세요.'],
      gameMode: 'SINGLE'
    };
  }, [battleDeck]);

  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Socket.IO 연결 (멀티플레이 모드용)
  const { socket, connected } = useSocket();

  // PvP 모드에서 state 변경 감지해서 자동 동기화 (Hook 순서 유지를 위해 조건부 return 전에 배치)
  React.useEffect(() => {
    if (screen === 'MULTIPLAYER_BATTLE' && socket && state && isAuthenticated) {
      console.log('========================================');
      console.log('[PvP Auto Sync] 🚀 상태 자동 전송!');
      console.log('[PvP Auto Sync] 내 HP:', state.playerHp, '내 실드:', state.playerShield);
      console.log('[PvP Auto Sync] 상대 HP (내가 본):', state.bossHp, '상대 실드:', state.bossShield);
      console.log('========================================');
      
      socket.emit('game:stateSync', {
        hp: state.playerHp,
        shield: state.playerShield,
        statusEffects: state.playerStatusEffects,
        energy: state.currentEnergy,
        bossHp: state.bossHp, // 내가 공격한 후 줄어든 상대 HP
        bossShield: state.bossShield
      });
    }
  }, [state?.playerHp, state?.bossHp, state?.playerShield, state?.bossShield, screen, socket, isAuthenticated]);

  // 로그인하지 않았으면 로그인 화면 표시
  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLoginSuccess={() => setScreen('MAIN')} />;
  }

  // Guest가 멀티플레이 시도 시
  const handleMultiplayerClick = () => {
    if (isGuest) {
      setShowLoginPrompt(true);
    } else {
      setScreen('MULTIPLAYER_LOBBY');
    }
  };

  const handleStartGame = () => {
    dispatch({ type: 'RESTART', payload: { deck: battleDeck, mode: 'SINGLE' } });
    setScreen('BATTLE');
  };

  const handlePlayCard = (cardId: string) => {
    console.log('[App] 카드 사용 시작:', cardId, 'isMyTurn:', isMyTurn);
    
    // PvP에서는 내 턴일 때만
    if (screen === 'MULTIPLAYER_BATTLE' && !isMyTurn) {
      alert('상대의 턴입니다!');
      return;
    }

    // 로컬에서 카드 사용 (리듀서 호출)
    // 리듀서가 bossHp를 줄이면 useEffect가 자동으로 Socket 전송
    dispatch({ type: 'PLAY_CARD', payload: { cardId } });
  };

  const handleEndTurn = () => {
    const isPvP = screen === 'MULTIPLAYER_BATTLE';
    dispatch({ type: 'END_TURN', payload: { mode: isPvP ? 'PVP' : 'SINGLE' } });
    
    // PvP일 경우 Socket으로 상태 전송
    if (isPvP && socket) {
      // 현재 내 상태를 상대에게 전송
      socket.emit('game:turnEnded', {
        hp: state.playerHp,
        shield: state.playerShield,
        statusEffects: state.playerStatusEffects,
        energy: state.currentEnergy,
        turn: state.turn
      });
      
      // 턴 종료 알림
      socket.emit('game:endTurn');
      
      // 상대 턴으로 전환
      setIsMyTurn(false);
    }
  };

  const handleRestart = () => {
    const mode = screen === 'MULTIPLAYER_BATTLE' ? 'PVP' : 'SINGLE';
    dispatch({ type: 'RESTART', payload: { deck: battleDeck, mode } });
  };

  // 패배 시 오픈뱅킹 팝업 표시 (히든 카드가 없을 때만)
  const handleDefeat = () => {
    if (!currentUser?.hasHiddenCard) {
      setShowOpenBanking(true);
    }
  };

  // 안전성 체크
  if (!state) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-cyan-300">
              Financial Card Storm
            </h1>
            <p className="text-[11px] text-slate-300">
              {isGuest ? '🎮 Guest 체험 모드' : `${currentUser.name}님의 거래 패턴 기반 카드 배틀`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isGuest && (
              <button
                type="button"
                onClick={() => {
                  logout();
                }}
                className="rounded-md border border-yellow-500/70 bg-yellow-900/30 px-3 py-1.5 text-xs font-semibold text-yellow-100 hover:bg-yellow-900/50"
              >
                회원가입하기
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowTxPreview(true)}
              className="rounded-md border border-cyan-500/70 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-slate-800"
            >
              내 거래 내역
            </button>
            {!isGuest && (
              <button
                type="button"
                onClick={() => {
                  logout();
                }}
                className="rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                로그아웃
              </button>
            )}
          </div>
        </header>

        {/* Debug Info (개발용) */}
        <div className="mb-2 rounded border border-yellow-500/50 bg-yellow-900/20 p-2 text-xs text-yellow-200">
          <strong>디버그:</strong> 현재 화면 = {screen} | 사용자 = {currentUser.name} | 거래 = {currentUser.transactions.length}건 | <strong>전체 카드 = {allCards.length}/100장</strong> | <strong>전투 덱 = {battleDeck.length}/30장</strong> {selectedDeck.length > 0 && '(사용자 선택)'} | 구매 카드 = {currentUser.purchasedCards?.length || 0}장 | 피로도 = {state?.fatigue || 0}
        </div>

        {/* Main screen */}
        {screen === 'MAIN' && (
          <main className="flex flex-1 flex-col gap-6">
            {/* 로비 상단 - 빠른 액션 */}
            <div className="rounded-2xl border border-cyan-500/60 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="mb-2 text-2xl font-bold text-slate-50">
                  💳 Financial Card Storm 로비
                </h2>
                <p className="text-sm text-slate-300">
                  거래 {currentUser.transactions.length}건 분석 완료 · 전체 카드: {allCards.length}/100장 · 전투 덱: {battleDeck.length}/30장 {hiddenCard && '+ 💎'}
                </p>
              </div>
              
              {/* 게임 시작 버튼 */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-8 py-4 text-base font-bold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400"
                >
                  <span className="text-2xl">⚔️</span>
                  <span>싱글 플레이 시작</span>
                </button>
                <button
                  type="button"
                  onClick={handleMultiplayerClick}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-base font-bold text-slate-950 shadow-lg hover:from-purple-400 hover:to-pink-400"
                >
                  <span className="text-2xl">🎮</span>
                  <span>멀티플레이 (PvP)</span>
                  {isGuest && <span className="text-xs">(로그인 필요)</span>}
                </button>
              </div>
            </div>

            {/* 로비 메뉴 그리드 */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* 계좌 현황 카드 */}
              <button
                onClick={() => setScreen('ACCOUNT')}
                className="group rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-6 text-left hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 text-3xl shadow-lg">
                    🏦
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-100">계좌 현황</h3>
                    <p className="text-xs text-slate-400">내 금융 상품 관리</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• 보유 상품: {currentUser.bankProducts.length}개</div>
                  <div>• 신한은행 상품: {currentUser.bankProducts.filter(p => p.provider.includes('신한')).length}개</div>
                </div>
                <div className="mt-4 text-xs text-cyan-400 group-hover:text-cyan-300">
                  클릭하여 상세 보기 →
                </div>
              </button>

              {/* 카드 덱 관리 카드 */}
              <button
                onClick={() => setScreen('DECK_MANAGER')}
                className="group rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-6 text-left hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-3xl shadow-lg">
                    🎴
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-100">카드 덱 관리</h3>
                    <p className="text-xs text-slate-400">전투 덱 30장 선택</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• <strong>전체 카드:</strong> {allCards.length}/100장</div>
                  <div>• <strong>전투 덱:</strong> {selectedDeck.length > 0 ? selectedDeck.length : Math.min(allCards.length, 30)}/30장</div>
                  {selectedDeck.length > 0 ? (
                    <div className="text-cyan-400">✓ 사용자 선택 덱</div>
                  ) : (
                    <div className="text-slate-400">○ 자동 선택 (30장)</div>
                  )}
                </div>
                <div className="mt-4 text-xs text-purple-400 group-hover:text-purple-300">
                  클릭하여 전투 덱 편집 →
                </div>
              </button>

              {/* 카드 상점 카드 */}
              <button
                onClick={() => setScreen('CARD_SHOP')}
                className="group rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-orange-900/40 to-red-900/40 p-6 text-left hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-3 text-3xl shadow-lg">
                    🛒
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-orange-100">카드 상점</h3>
                    <p className="text-xs text-slate-400">추가 거래로 카드 획득</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• 구매 가능: {9 - (currentUser.purchasedShopProducts?.length || 0)}개</div>
                  <div>• 획득한 카드: {currentUser.purchasedCards?.length || 0}장</div>
                </div>
                <div className="mt-4 text-xs text-orange-400 group-hover:text-orange-300">
                  클릭하여 상점 보기 →
                </div>
              </button>

              {/* 거래 내역 카드 */}
              <button
                onClick={() => setShowTxPreview(true)}
                className="group rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-6 text-left hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 text-3xl shadow-lg">
                    📊
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-100">거래 내역</h3>
                    <p className="text-xs text-slate-400">소비 패턴 분석</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• 거래 건수: {currentUser.transactions.length}건</div>
                  <div>• 분석 기간: 최근 90일</div>
                </div>
                <div className="mt-4 text-xs text-green-400 group-hover:text-green-300">
                  클릭하여 상세 분석 →
                </div>
              </button>

              {/* 튜토리얼/가이드 카드 */}
              <button
                onClick={() => alert('🎮 게임 가이드\n\n1. 카드 덱 관리에서 전투 덱을 구성하세요\n2. 싱글 플레이로 연습하세요\n3. 멀티플레이로 다른 플레이어와 대결하세요!\n\n💡 Tip: 신한은행 상품이 많을수록 더 강력한 카드를 얻을 수 있습니다!')}
                className="group rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-yellow-900/40 to-amber-900/40 p-6 text-left hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 p-3 text-3xl shadow-lg">
                    📖
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-yellow-100">게임 가이드</h3>
                    <p className="text-xs text-slate-400">플레이 방법 배우기</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• 기본 룰 안내</div>
                  <div>• 카드 효과 설명</div>
                </div>
                <div className="mt-4 text-xs text-yellow-400 group-hover:text-yellow-300">
                  클릭하여 가이드 보기 →
                </div>
              </button>
            </div>
          </main>
        )}

        {/* Account Overview Screen */}
        {screen === 'ACCOUNT' && (
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setScreen('MAIN')}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                ← 로비로 돌아가기
              </button>
            </div>
            <AccountOverview
              bankProducts={currentUser.bankProducts}
              userName={currentUser.name}
            />
          </div>
        )}

        {/* Deck Manager Screen */}
        {screen === 'DECK_MANAGER' && (
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setScreen('MAIN')}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                ← 로비로 돌아가기
              </button>
            </div>
            <DeckManager
              allCards={allCards}
              currentDeck={selectedDeck.length > 0 ? selectedDeck : battleDeck}
              onDeckChange={handleDeckChange}
              maxDeckSize={30}
            />
          </div>
        )}

        {/* Card Shop Screen */}
        {screen === 'CARD_SHOP' && (
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setScreen('MAIN')}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                ← 로비로 돌아가기
              </button>
            </div>
            <CardShop
              hasShinhanProduct={hasShinhanProduct}
              userProducts={currentUser.bankProducts}
              onPurchase={handleCardPurchase}
              purchasedProducts={currentUser.purchasedShopProducts || []}
            />
          </div>
        )}

        {/* Multiplayer Lobby */}
        {screen === 'MULTIPLAYER_LOBBY' && socket && (
          <MultiplayerLobby
            socket={socket}
            onStartGame={(roomId, isFirstPlayer, opponentName) => {
              console.log('멀티플레이 게임 시작:', roomId, '선공:', isFirstPlayer, '상대:', opponentName);
              setCurrentRoomId(roomId);
              setIsMyTurn(isFirstPlayer);
              setOpponentNickname(opponentName); // 상대 닉네임 저장
              dispatch({ type: 'RESTART', payload: { deck: battleDeck, mode: 'PVP' } });
              setScreen('MULTIPLAYER_BATTLE');
            }}
            onBack={() => setScreen('MAIN')}
          />
        )}

        {/* Multiplayer Battle */}
        {screen === 'MULTIPLAYER_BATTLE' && socket && (
          <PvPBattle
            socket={socket}
            roomId={currentRoomId}
            isMyTurn={isMyTurn}
            gameState={state}
            opponentName={opponentNickname}
            hasHiddenCard={currentUser?.hasHiddenCard || false}
            onPlayCard={handlePlayCard}
            onEndTurn={handleEndTurn}
            onTurnReceived={() => {
              console.log('[턴 수신] 내 턴으로 전환');
              setIsMyTurn(true);
              
              // PvP 모드에서 턴 시작 - 매 턴마다 에너지 +1, 카드 드로우 +1
              dispatch({ 
                type: 'START_MY_TURN'
              });
            }}
            onReceiveDamage={(damage, effects) => {
              console.log('[App] onReceiveDamage (레거시)');
            }}
            onUpdateMyHp={(hp, shield) => {
              console.log('[App] 🔥 내 HP 직접 업데이트!', hp, shield);
              dispatch({
                type: 'UPDATE_MY_HP_FROM_OPPONENT',
                payload: { myHp: hp, myShield: shield }
              });
            }}
            onUpdateOpponentHp={(hp, shield) => {
              console.log('[App] 상대 HP 업데이트', hp, shield);
              dispatch({
                type: 'OPPONENT_ACTION',
                payload: { opponentHp: hp, opponentShield: shield }
              });
            }}
            onOpenBanking={() => {
              console.log('[App] 오픈뱅킹 콜백 호출됨!');
              console.log('[App] currentUser.hasHiddenCard:', currentUser?.hasHiddenCard);
              // PvP 패배 시에도 오픈뱅킹 표시
              setShowOpenBanking(true);
            }}
            onBack={() => {
              if (socket) {
                socket.emit('room:leave');
              }
              setScreen('MAIN');
            }}
          />
        )}

        {/* Battle screen */}
        {screen === 'BATTLE' && (
          <main className="flex flex-1 flex-col gap-3">
            {/* Top: Boss */}
            <section className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <HeroPanel
                  isBoss
                  name="소비 패턴 보스"
                  hp={state.bossHp}
                  maxHp={state.bossMaxHp}
                  shield={state.bossShield}
                  statusEffects={state.bossStatusEffects}
                  description="당신의 지출 습관을 시험하는 데이터 기반 보스입니다."
                />
              </div>
              <div className="hidden text-right text-[11px] text-slate-300 sm:block">
                <div>턴 {state.turn}</div>
                <div>덱 {state.deck.length}장 · 손패 {state.hand.length}장</div>
                {state.fatigue > 0 && (
                  <div className="mt-1 text-red-400 font-semibold">
                    ⚠️ 피로도: {state.fatigue} (다음: {state.fatigue + 1} 피해)
                  </div>
                )}
              </div>
            </section>

            {/* Middle: Board + Sidebars */}
            <section className="flex flex-1 flex-col gap-3 md:flex-row">
              {/* Left: Turn info + board background + log */}
              <div className="flex-1 space-y-3">
                <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-200">
                    <span>현재 턴: {state.turn}</span>
                    <span>{state.isPlayerTurn ? '플레이어 턴' : '보스 턴 처리 중'}</span>
                  </div>
                  <div className="mt-1 flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-[11px] text-slate-300">
                    향후 미니언/효과 카드가 배치될 전장 영역입니다.
                  </div>
                </div>
                <GameLog entries={state.log} />
              </div>

              {/* Right: Energy + Actions */}
              <div className="flex w-full flex-row gap-3 md:w-52 md:flex-col">
                <div className="h-40 w-24 md:h-auto md:w-full">
                  <EnergyBar current={state.currentEnergy} max={state.maxEnergy} />
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-3 text-[11px]">
                  <div className="mb-1 text-xs font-semibold text-slate-100">행동</div>
                  <button
                    type="button"
                    onClick={handleEndTurn}
                    disabled={state.isGameOver}
                    className="w-full rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                  >
                    턴 종료
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-slate-800"
                  >
                    다시 시작
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('MAIN')}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-900"
                  >
                    메인 화면으로
                  </button>
                  <div className="mt-1 text-[10px] text-slate-400">
                    앞으로 이 영역에 실제 은행/카드 연동 설정, 소비 패턴 리포트, LLM 기반
                    추천 메시지를 붙일 수 있습니다.
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom: Player + Hand */}
            <section className="mt-1 flex flex-col gap-2 rounded-2xl bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/80 p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="w-64 max-w-full">
                  <HeroPanel
                    name="가상 고객"
                    hp={state.playerHp}
                    maxHp={state.playerMaxHp}
                    shield={state.playerShield}
                    statusEffects={state.playerStatusEffects}
                    description="당신의 은행 계좌를 대표하는 영웅입니다."
                  />
                </div>
                <div className="hidden text-right text-[10px] text-slate-300 sm:block">
                  <div>손패에서 카드를 클릭해 보스에게 피해를 입히세요.</div>
                  <div>코스트 &gt; 현재 에너지인 카드는 비활성화됩니다.</div>
                </div>
              </div>
              <HandArea
                hand={state.hand}
                currentEnergy={state.currentEnergy}
                onPlayCard={handlePlayCard}
              />
            </section>
          </main>
        )}
      </div>

      {/* Result modal */}
      {state.isGameOver && screen === 'BATTLE' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-2xl border border-cyan-500/70 bg-slate-900 p-5 text-center shadow-xl">
            <div className="mb-3 text-lg font-bold text-slate-50">
              {state.winner === 'PLAYER' ? '🎉 승리!' : '😢 패배'}
            </div>
            <p className="mb-4 text-sm text-slate-200">
              {state.winner === 'PLAYER'
                ? '당신의 소비 패턴 카드가 보스를 압도했습니다!'
                : '보스에게 재정이 침식당했습니다.'}
            </p>
            <div className="flex flex-col gap-2">
              {state.winner !== 'PLAYER' && !currentUser?.hasHiddenCard && (
                <button
                  type="button"
                  onClick={() => {
                    handleDefeat();
                  }}
                  className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg hover:from-purple-400 hover:to-pink-400"
                >
                  🏦 오픈뱅킹 연동하고 역전하기
                </button>
              )}
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="rounded-md bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  다시 시작
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('MAIN')}
                  className="rounded-md border border-slate-600 bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                >
                  메인 화면
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 오픈뱅킹 팝업 */}
      {showOpenBanking && (
        <>
          {console.log('[App] 🏦 오픈뱅킹 팝업 렌더링 중...')}
          <OpenBankingPopup
            onClose={() => {
              console.log('[App] 오픈뱅킹 팝업 닫기');
              setShowOpenBanking(false);
            }}
            onSuccess={() => {
              console.log('[App] 오픈뱅킹 성공!');
              setShowOpenBanking(false);
              // PvP 모드면 로비로, 싱글이면 재시작
              if (screen === 'MULTIPLAYER_BATTLE') {
                console.log('[App] PvP 모드 - 로비로 이동');
                if (socket) {
                  socket.emit('room:leave');
                }
                setScreen('MULTIPLAYER_LOBBY');
              } else {
                console.log('[App] 싱글 모드 - 재시작');
                handleRestart();
              }
            }}
          />
        </>
      )}

      {/* Transaction preview modal */}
      {showTxPreview && (
        <TransactionPreview
          transactions={currentUser.transactions}
          onClose={() => setShowTxPreview(false)}
        />
      )}

      {/* Guest 로그인 유도 모달 */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/60 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mb-4 text-5xl">🔐</div>
            <h2 className="mb-2 text-xl font-bold text-purple-100">
              로그인이 필요합니다
            </h2>
            <p className="mb-6 text-sm text-slate-300">
              멀티플레이는 회원만 이용 가능합니다.<br />
              계정을 만들고 다른 플레이어와 대전하세요!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                취소
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowLoginPrompt(false);
                }}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg hover:from-purple-400 hover:to-pink-400"
              >
                회원가입하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;



