/**
 * ========================================
 * 카드 상점 컴포넌트
 * ========================================
 * 추가 거래를 통해 특별 카드를 획득할 수 있는 상점
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHOP_PRODUCTS, ShopProduct } from '../data/cardShopProducts';
import { CardView } from './CardView';
import { Card } from '../types/game';

import { BankProduct } from '../data/mockUsers';

interface CardShopProps {
  hasShinhanProduct: boolean; // 신한금융그룹 상품 보유 여부
  userProducts: BankProduct[]; // 사용자 보유 금융 상품
  onPurchase: (card: Card, productId: string, newProduct?: BankProduct, updateInfo?: { type: string; name: string; balanceIncrease: number }) => void;
  purchasedProducts: string[]; // 이미 구매한 상품 ID 목록
}

export const CardShop: React.FC<CardShopProps> = ({
  hasShinhanProduct,
  userProducts,
  onPurchase,
  purchasedProducts
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [showProductRequirement, setShowProductRequirement] = useState<ShopProduct | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('전체');

  const categories = ['전체', '신한금융', '투자', '저축', '보험', '대출'];

  // 필터링된 상품 목록
  const filteredProducts = SHOP_PRODUCTS.filter(product => {
    if (filterCategory !== '전체' && product.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const handlePurchase = (product: ShopProduct) => {
    if (purchasedProducts.includes(product.id)) {
      alert('⚠️ 이미 구매한 상품입니다!');
      return;
    }

    if (product.requiresShinhan && !hasShinhanProduct) {
      alert('⚠️ 신한금융그룹 상품 보유 고객만 이용 가능합니다.\n\n계좌 개설 후 다시 시도해주세요!');
      return;
    }

    // 특정 상품 보유 필요/불필요 체크
    if (product.requiresProduct) {
      const hasProduct = userProducts.some(p => 
        p.type === product.requiresProduct!.type && 
        p.name.includes(product.requiresProduct!.name)
      );

      // mustNotHave가 true면 상품이 없어야 구매 가능 (IRP 신규 가입 등)
      if (product.requiresProduct.mustNotHave) {
        if (hasProduct) {
          alert(
            `⚠️ 이미 ${product.requiresProduct.name} 상품을 보유하고 계십니다.\n\n` +
            `${product.requiresProduct.name}는 1인 1계좌만 가능합니다.\n` +
            `대신 "${product.requiresProduct.name} 추가 납입" 상품을 이용해주세요!`
          );
          return;
        }
      } else {
        // 일반적인 경우: 상품이 있어야 구매 가능
        if (!hasProduct) {
          setShowProductRequirement(product);
          return;
        }
      }
    }

    let confirmMessage = `💳 ${product.name}\n\n` +
      `💰 ${product.price === 0 ? '무료 (대출)' : `금액: ${formatMoney(product.price)}원`}\n` +
      `🎴 획득 카드: ${product.card.name}\n`;
    
    if (product.addProduct) {
      confirmMessage += `\n🏦 신규 상품: ${product.addProduct.name}`;
    } else if (product.updateProduct) {
      confirmMessage += `\n📈 추가 납입: ${formatMoney(product.updateProduct.balanceIncrease)}원`;
    }
    
    confirmMessage += `\n\n구매하시겠습니까?`;

    const confirmed = confirm(confirmMessage);

    if (confirmed) {
      onPurchase(product.card, product.id, product.addProduct, product.updateProduct);
      
      let message = `✅ 거래 완료!\n\n🎴 ${product.card.name} 카드를 획득했습니다!`;
      
      if (product.addProduct) {
        message += `\n\n🏦 ${product.addProduct.name}이(가) 계좌에 추가되었습니다!`;
      } else if (product.updateProduct) {
        message += `\n\n📈 ${product.updateProduct.name} 잔액이 ${formatMoney(product.updateProduct.balanceIncrease)}원 증가했습니다!`;
      }
      
      message += '\n계좌 현황에서 확인하실 수 있습니다.';
      
      alert(message);
      setSelectedProduct(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '신한금융':
        return 'from-cyan-500 to-blue-500';
      case '투자':
        return 'from-yellow-500 to-amber-500';
      case '저축':
        return 'from-green-500 to-emerald-500';
      case '보험':
        return 'from-purple-500 to-pink-500';
      case '대출':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-cyan-100">
          🛒 카드 상점
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          신한금융 거래를 통해 특별한 카드를 획득하세요
        </p>
      </div>

      {/* 신한금융 상품 안내 */}
      {!hasShinhanProduct && (
        <motion.div
          className="rounded-xl border-2 border-yellow-500/60 bg-yellow-900/30 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <div className="font-bold text-yellow-200">신한금융그룹 상품 미보유</div>
              <div className="text-sm text-yellow-300">
                일부 프리미엄 상품은 신한금융그룹 고객만 이용 가능합니다.
                계좌 개설 후 더 많은 혜택을 받아보세요!
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const isPurchased = purchasedProducts.includes(product.id);
          const isLockedShinhan = product.requiresShinhan && !hasShinhanProduct;
          
          // IRP 신규 가입은 이미 IRP 보유 시 잠금
          const hasIRP = product.requiresProduct?.mustNotHave && 
            userProducts.some(p => 
              p.type === product.requiresProduct!.type && 
              p.name.includes(product.requiresProduct!.name)
            );
          const isLockedIRP = hasIRP || false;
          
          const isLocked = isLockedShinhan || isLockedIRP;
          const categoryColor = getCategoryColor(product.category);

          return (
            <motion.div
              key={product.id}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                isPurchased
                  ? 'border-green-500/50 bg-green-900/20 opacity-60'
                  : isLocked
                  ? 'border-slate-700 bg-slate-900/50 opacity-70'
                  : 'border-cyan-500/50 bg-slate-900/70 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: isPurchased || isLocked ? 1 : 1.03 }}
            >
              {/* 잠금 또는 구매 완료 표시 */}
              {(isLocked || isPurchased) && (
                <div className="absolute right-2 top-2 z-10 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold">
                  {isPurchased ? '✅ 구매완료' : isLockedIRP ? '🔒 이미보유' : '🔒 잠김'}
                </div>
              )}

              <div className="p-4">
                {/* 카테고리 배지 */}
                <div className={`mb-3 inline-block rounded-full bg-gradient-to-r ${categoryColor} px-3 py-1 text-xs font-bold text-slate-950`}>
                  {product.category}
                </div>

                {/* 상품 정보 */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="text-4xl">{product.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-100">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* 획득 카드 미리보기 */}
                <div className="mb-3 rounded-lg border border-cyan-500/30 bg-cyan-900/20 p-3">
                  <div className="mb-1 text-xs font-semibold text-cyan-300">
                    🎴 획득 카드
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{product.card.imageUrl}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-100">
                        {product.card.name}
                      </div>
                      <div className="flex gap-1 text-xs">
                        <span className="rounded bg-amber-500/30 px-1 text-amber-200">
                          ⚡{product.card.cost}
                        </span>
                        <span className="rounded bg-red-500/30 px-1 text-red-200">
                          ⚔️{product.card.attack}
                        </span>
                        {product.card.defense > 0 && (
                          <span className="rounded bg-blue-500/30 px-1 text-blue-200">
                            🛡️{product.card.defense}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 가격 및 구매 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-cyan-300">
                    {product.price === 0 ? '무료' : `${formatMoney(product.price)}원`}
                  </div>
                  <button
                    onClick={() => !isPurchased && !isLocked && setSelectedProduct(product)}
                    disabled={isPurchased || isLocked}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400"
                  >
                    {isPurchased ? '구매완료' : isLocked ? '잠김' : '구매하기'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 카드 상세 보기 모달 */}
      <AnimatePresence>
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-2xl border-2 border-cyan-500 bg-slate-900 p-6"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-cyan-100">
                    {selectedProduct.emoji} {selectedProduct.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedProduct.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-2xl text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              {/* 카드 프리뷰 */}
              <div className="mb-6 flex justify-center">
                <div className="w-64">
                  <CardView
                    card={selectedProduct.card}
                    currentEnergy={999}
                    onClick={() => {}}
                  />
                </div>
              </div>

              {/* 구매 정보 */}
              <div className="mb-6 space-y-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">카테고리</span>
                  <span className="font-semibold text-slate-100">{selectedProduct.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">가격</span>
                  <span className="text-lg font-bold text-cyan-300">
                    {selectedProduct.price === 0 ? '무료' : `${formatMoney(selectedProduct.price)}원`}
                  </span>
                </div>
                {selectedProduct.requiresShinhan && (
                  <div className="rounded-lg bg-cyan-900/30 p-2 text-xs text-cyan-300">
                    ℹ️ 신한금융그룹 상품 보유 고객 전용
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 font-semibold text-slate-300 hover:bg-slate-700"
                >
                  취소
                </button>
                <button
                  onClick={() => handlePurchase(selectedProduct)}
                  className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 py-3 font-bold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400"
                >
                  구매하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 안내 메시지 */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 text-xs text-slate-400">
        <div className="mb-2 font-semibold text-slate-300">💡 이용 안내</div>
        <ul className="list-inside list-disc space-y-1">
          <li>각 상품은 1회만 구매 가능합니다</li>
          <li>구매한 카드는 자동으로 카드 덱에 추가됩니다</li>
          <li>일부 상품은 기존 금융상품 보유가 필요합니다 (예: IRP 추가납입)</li>
          <li>신규 가입 상품은 계좌 현황에도 추가됩니다</li>
          <li>획득한 카드는 즉시 전투에서 사용 가능합니다</li>
        </ul>
      </div>

      {/* 상품 보유 필요 안내 모달 */}
      <AnimatePresence>
        {showProductRequirement && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowProductRequirement(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border-2 border-yellow-500 bg-slate-900 p-6"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="mb-4 text-center text-5xl">⚠️</div>
              <h3 className="mb-2 text-center text-xl font-bold text-yellow-200">
                상품 보유 필요
              </h3>
              <p className="mb-4 text-center text-sm text-slate-300">
                <strong>{showProductRequirement.name}</strong>을(를) 이용하려면<br />
                <strong className="text-cyan-300">{showProductRequirement.requiresProduct?.name}</strong> 상품을 먼저 보유해야 합니다.
              </p>
              
              <div className="mb-4 rounded-lg border border-cyan-500/50 bg-cyan-900/20 p-4">
                <div className="mb-2 font-semibold text-cyan-200">💡 신규 가입하시겠습니까?</div>
                <p className="text-xs text-slate-400">
                  {showProductRequirement.requiresProduct?.name} 상품을 신규로 가입하시면<br />
                  더 많은 혜택과 특별 카드를 받을 수 있습니다!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProductRequirement(null)}
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 font-semibold text-slate-300 hover:bg-slate-700"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    setShowProductRequirement(null);
                    // IRP 신규 가입 상품으로 이동 (필터 변경)
                    if (showProductRequirement.requiresProduct?.name === 'IRP') {
                      setFilterCategory('투자');
                      alert('💡 "IRP 신규 가입" 상품을 확인해보세요!\n더 많은 혜택을 제공합니다.');
                    }
                  }}
                  className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 py-3 font-bold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400"
                >
                  신규 가입 보기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


