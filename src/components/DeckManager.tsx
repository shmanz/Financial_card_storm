/**
 * ========================================
 * 카드 덱 관리 컴포넌트
 * ========================================
 * 보유 카드 목록 표시 및 전투 덱 선택 기능
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../types/game';
import { CardView } from './CardView';

interface DeckManagerProps {
  allCards: Card[];
  currentDeck: Card[];
  onDeckChange: (newDeck: Card[]) => void;
  maxDeckSize?: number;
}

export const DeckManager: React.FC<DeckManagerProps> = ({
  allCards,
  currentDeck,
  onDeckChange,
  maxDeckSize = 30
}) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(
    new Set(currentDeck.map(c => c.id))
  );
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'cost' | 'attack' | 'name'>('cost');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCardDetail, setShowCardDetail] = useState<Card | null>(null);
  
  // 전체 카드 최대 100장 제한
  const maxTotalCards = 100;

  // 카테고리 목록 추출
  const categories = ['ALL', ...Array.from(new Set(allCards.map(c => c.category)))];

  // 필터링 및 정렬
  const filteredCards = allCards
    .filter(card => {
      // 카테고리 필터
      const categoryMatch = filterCategory === 'ALL' || card.category === filterCategory;
      // 검색어 필터 (카드 이름에 검색어 포함 여부, 대소문자 무시)
      const searchMatch = searchQuery === '' || card.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return a.cost - b.cost;
        case 'attack':
          return b.attack - a.attack;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // 카드 선택/해제
  const toggleCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    const clickedCard = allCards.find(c => c.id === cardId);
    
    if (newSelected.has(cardId)) {
      // 선택 해제
      console.log('[카드 선택] 해제:', clickedCard?.name);
      newSelected.delete(cardId);
    } else {
      // 선택 추가
      if (newSelected.size >= maxDeckSize) {
        alert(`⚠️ 전투 덱은 최대 ${maxDeckSize}장까지만 구성할 수 있습니다.\n현재: ${newSelected.size}/${maxDeckSize}장`);
        return;
      }
      
      // 동일 카드명 개수 체크 (최대 2장)
      if (clickedCard) {
        const selectedCardsList = allCards.filter(c => newSelected.has(c.id));
        const sameNameCount = selectedCardsList.filter(c => c.name === clickedCard.name).length;
        
        console.log('[카드 선택]', clickedCard.name, '- 현재 선택된 동일 카드:', sameNameCount, '장');
        
        if (sameNameCount >= 2) {
          console.warn('[카드 선택] 제한! 동일 카드 2장 초과');
          alert(`⚠️ "${clickedCard.name}" 카드는 최대 2장까지만 선택할 수 있습니다.\n\n현재 선택: ${sameNameCount}장\n추가 선택: 불가`);
          return;
        }
        
        console.log('[카드 선택] 추가 가능:', clickedCard.name);
      }
      
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  // 덱 적용
  const applyDeck = () => {
    const newDeck = allCards.filter(card => selectedCards.has(card.id));
    
    // 최소/최대 장수 체크
    if (newDeck.length < 10) {
      alert('⚠️ 전투 덱은 최소 10장 이상이어야 합니다.\n현재: ' + newDeck.length + '장');
      return;
    }
    if (newDeck.length > maxDeckSize) {
      alert(`⚠️ 전투 덱은 최대 ${maxDeckSize}장까지만 구성할 수 있습니다.\n현재: ${newDeck.length}장`);
      return;
    }
    
    // 동일 카드 2장 제한 체크
    const nameCount: Record<string, number> = {};
    for (const card of newDeck) {
      nameCount[card.name] = (nameCount[card.name] || 0) + 1;
    }
    
    const violations = Object.entries(nameCount).filter(([_, count]) => count > 2);
    if (violations.length > 0) {
      const violationList = violations.map(([name, count]) => `  • "${name}": ${count}장`).join('\n');
      alert(`⚠️ 동일한 카드는 최대 2장까지만 선택할 수 있습니다.\n\n다음 카드가 2장을 초과했습니다:\n${violationList}\n\n일부 카드를 제거해주세요.`);
      return;
    }
    
    onDeckChange(newDeck);
    
    // 동일 카드 현황 표시
    const duplicates = Object.entries(nameCount).filter(([_, count]) => count === 2);
    let message = `✅ 전투 덱이 변경되었습니다!\n\n📊 덱 구성: ${newDeck.length}장`;
    
    if (duplicates.length > 0) {
      message += `\n\n🔢 중복 카드 (2장씩):`;
      duplicates.slice(0, 5).forEach(([name, _]) => {
        message += `\n  • ${name}`;
      });
      if (duplicates.length > 5) {
        message += `\n  ... 외 ${duplicates.length - 5}개`;
      }
    }
    
    message += '\n\n🎮 이제 싱글플레이와 PvP에서 이 덱으로 전투합니다!';
    alert(message);
  };

  // 전체 선택/해제 (동일 카드 2장 제한 적용)
  const selectAll = () => {
    const newSelected = new Set<string>();
    const nameCount: Record<string, number> = {};
    
    for (const card of filteredCards) {
      if (newSelected.size >= maxDeckSize) break;
      
      const count = nameCount[card.name] || 0;
      if (count < 2) {
        newSelected.add(card.id);
        nameCount[card.name] = count + 1;
      }
    }
    
    setSelectedCards(newSelected);
    console.log('[전체 선택] 동일 카드 2장 제한 적용:', newSelected.size, '장 선택됨');
  };

  const clearAll = () => {
    setSelectedCards(new Set());
  };

  // 카테고리별 이모지
  const categoryEmoji: Record<string, string> = {
    ALL: '🎴',
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

  return (
    <div className="w-full space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-100">
            🎴 카드 덱 관리
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            전체 카드 중 전투에 사용할 30장을 선택하세요
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="text-slate-400">전체 보유 카드</div>
            <div className={`font-bold ${allCards.length >= maxTotalCards ? 'text-yellow-400' : 'text-slate-300'}`}>
              {allCards.length} / {maxTotalCards}장
            </div>
          </div>
          <div className="h-8 w-px bg-slate-600"></div>
          <div className="text-right text-sm">
            <div className="text-slate-400">전투 덱 선택</div>
            <div className={`font-bold ${selectedCards.size >= maxDeckSize ? 'text-red-400' : 'text-cyan-300'}`}>
              {selectedCards.size} / {maxDeckSize}장
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
        {/* 검색 */}
        <div className="flex-1 min-w-[250px]">
          <label className="mb-1 block text-xs font-semibold text-slate-400">🔍 카드 검색</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="카드 이름으로 검색..."
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-semibold text-slate-400">카테고리</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {categoryEmoji[cat] || '💳'} {cat === 'ALL' ? '전체' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* 정렬 */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-1 block text-xs font-semibold text-slate-400">정렬</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
          >
            <option value="cost">⚡ 비용 순</option>
            <option value="attack">⚔️ 공격력 순</option>
            <option value="name">📝 이름 순</option>
          </select>
        </div>

        {/* 빠른 작업 */}
        <div className="flex items-end gap-2">
          <button
            onClick={selectAll}
            className="rounded-lg border border-cyan-600 bg-cyan-900/30 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/50"
          >
            전체 선택
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            전체 해제
          </button>
          <button
            onClick={applyDeck}
            disabled={selectedCards.size < 10}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-2 text-xs font-semibold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            덱 적용
          </button>
        </div>
      </div>

      {/* 카드 목록 */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-slate-300">
            전체 <span className="font-bold text-cyan-300">{allCards.length}</span>장 중 <span className="font-bold text-purple-300">{filteredCards.length}</span>장 표시
            {searchQuery && (
              <span className="ml-2 rounded-full bg-cyan-900/50 px-2 py-1 text-xs text-cyan-200">
                🔍 "{searchQuery}"
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            클릭하여 전투 덱에 추가/제거
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <div className="mb-2 text-4xl">🔍</div>
            <div className="text-lg font-semibold text-slate-300">
              {searchQuery ? '검색 결과가 없습니다' : '해당 카테고리에 카드가 없습니다'}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm">
                "{searchQuery}"에 해당하는 카드를 찾을 수 없습니다
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredCards.map((card) => {
              const isSelected = selectedCards.has(card.id);
              const isDeckFull = selectedCards.size >= maxDeckSize && !isSelected;
              
              // 동일 카드명 개수 체크
              const selectedCardsList = allCards.filter(c => selectedCards.has(c.id));
              const sameNameCount = selectedCardsList.filter(c => c.name === card.name).length;
              const isDuplicateLimit = sameNameCount >= 2 && !isSelected;
              
              const isDisabled = isDeckFull || isDuplicateLimit;
              
              return (
                <motion.div
                  key={card.id}
                  className={`relative rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-900/30 shadow-lg shadow-cyan-500/30 cursor-pointer'
                      : isDisabled
                      ? 'border-slate-800 bg-slate-900/30 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 cursor-pointer'
                  }`}
                  onClick={() => !isDisabled && toggleCard(card.id)}
                  onDoubleClick={() => setShowCardDetail(card)}
                  whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                  whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {isSelected && (
                    <div className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950 shadow-lg">
                      ✓
                    </div>
                  )}
                  {sameNameCount > 0 && isSelected && (
                    <div className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-slate-950 shadow-lg">
                      {sameNameCount}
                    </div>
                  )}
                  {isDeckFull && !isDuplicateLimit && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
                      <div className="text-center text-xs font-bold text-red-300">
                        <div>덱이</div>
                        <div>가득함</div>
                      </div>
                    </div>
                  )}
                  {isDuplicateLimit && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
                      <div className="text-center text-xs font-bold text-yellow-300">
                        <div>동일카드</div>
                        <div>2장 제한</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3">
                    <div className="mb-2 text-center text-3xl">
                      {card.imageUrl || categoryEmoji[card.category] || '💳'}
                    </div>
                    <div className="mb-1 text-center text-sm font-bold text-slate-100 line-clamp-1">
                      {card.name}
                    </div>
                    <div className="mb-2 flex items-center justify-center gap-2 text-xs">
                      <span className="rounded bg-amber-500/30 px-1.5 py-0.5 font-semibold text-amber-200">
                        ⚡{card.cost}
                      </span>
                      <span className="rounded bg-red-500/30 px-1.5 py-0.5 font-semibold text-red-200">
                        ⚔️{card.attack}
                      </span>
                      {card.defense > 0 && (
                        <span className="rounded bg-blue-500/30 px-1.5 py-0.5 font-semibold text-blue-200">
                          🛡️{card.defense}
                        </span>
                      )}
                    </div>
                    <div className="text-center text-xs text-slate-400 line-clamp-2">
                      {card.description}
                    </div>
                    {card.effects.length > 0 && (
                      <div className="mt-2 flex justify-center gap-1">
                        {card.effects.slice(0, 3).map((effect, idx) => (
                          <div
                            key={idx}
                            className="rounded-full bg-purple-500/30 px-2 py-0.5 text-xs text-purple-200"
                            title={effect.type}
                          >
                            {effect.type.substring(0, 3)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 카드 상세 보기 모달 */}
      <AnimatePresence>
        {showCardDetail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowCardDetail(null)}
          >
            <motion.div
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CardView card={showCardDetail} currentEnergy={999} onClick={() => {}} />
              <button
                onClick={() => setShowCardDetail(null)}
                className="mt-4 w-full rounded-lg bg-slate-800 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 안내 메시지 */}
      <div className="rounded-lg border border-cyan-700/50 bg-cyan-900/20 p-4 text-xs text-slate-300">
        <div className="mb-2 font-semibold text-cyan-200">💡 카드 덱 시스템 안내</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2">
            <div className="mb-1 font-semibold text-slate-200">📚 전체 카드 (최대 100장)</div>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-400">
              <li>거래 내역 기반 자동 생성</li>
              <li>카드 상점에서 구매한 카드</li>
              <li>최대 100장까지 보유 가능</li>
            </ul>
          </div>
          <div className="rounded-lg border border-purple-700 bg-purple-900/30 p-2">
            <div className="mb-1 font-semibold text-purple-200">⚔️ 전투 덱 (30장 선택)</div>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-purple-300">
              <li>실제 전투에서 사용할 카드</li>
              <li>최소 10장 ~ 최대 30장 선택</li>
              <li>전략에 맞게 구성하세요!</li>
            </ul>
          </div>
        </div>
        <div className="mt-2 space-y-0.5 text-xs text-slate-400">
          <div>• 카드 클릭: 전투 덱에 추가/제거</div>
          <div>• 더블클릭: 카드 상세 정보 확인</div>
          <div>• <strong className="text-yellow-300">동일 카드는 최대 2장</strong>까지만 선택 가능</div>
          <div>• "덱 적용" 버튼으로 저장 후 전투 시작!</div>
        </div>
      </div>
    </div>
  );
};


