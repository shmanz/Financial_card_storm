/**
 * ========================================
 * 계좌 현황 컴포넌트
 * ========================================
 * 신한은행 거래 계좌, 카드, IRP 등 전체 거래 계좌 현황 표시
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BankProduct } from '../data/mockUsers';

interface AccountOverviewProps {
  bankProducts: BankProduct[];
  userName: string;
  onShowTransactionHistory?: () => void;
}

// 상품 타입별 이모지 및 한글명
const PRODUCT_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  DEPOSIT: { emoji: '🏦', label: '예금/입출금', color: 'from-blue-500 to-cyan-500' },
  SAVINGS: { emoji: '💰', label: '적금', color: 'from-green-500 to-emerald-500' },
  CARD: { emoji: '💳', label: '카드', color: 'from-purple-500 to-pink-500' },
  INSURANCE: { emoji: '🛡️', label: '보험', color: 'from-orange-500 to-red-500' },
  INVESTMENT: { emoji: '📈', label: '투자/IRP', color: 'from-yellow-500 to-amber-500' },
  LOAN: { emoji: '⚡', label: '대출', color: 'from-red-500 to-orange-500' }
};

export const AccountOverview: React.FC<AccountOverviewProps> = ({ bankProducts, userName, onShowTransactionHistory }) => {
  // 신한금융그룹 상품 필터링 (신한은행, 신한카드, 신한투자증권, 신한생명 등)
  const shinhanProducts = bankProducts.filter(p => 
    p.provider.includes('신한')
  );

  // 오픈뱅킹 상품 (신한금융그룹 외 모든 상품)
  const openBankingProducts = bankProducts.filter(p => 
    !p.provider.includes('신한')
  );

  // 신한금융그룹 타입별 그룹화
  const groupedShinhan = shinhanProducts.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = [];
    }
    acc[product.type].push(product);
    return acc;
  }, {} as Record<string, BankProduct[]>);

  // 오픈뱅킹 타입별 그룹화
  const groupedOpenBanking = openBankingProducts.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = [];
    }
    acc[product.type].push(product);
    return acc;
  }, {} as Record<string, BankProduct[]>);

  // 신한금융그룹 자산 계산
  const shinhanAssets = shinhanProducts.reduce((sum, p) => {
    return sum + (p.balance || 0);
  }, 0);

  // 오픈뱅킹 자산 계산
  const openBankingAssets = openBankingProducts.reduce((sum, p) => {
    return sum + (p.balance || 0);
  }, 0);

  // 전체 자산
  const totalAssets = shinhanAssets + openBankingAssets;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-100">
            💼 {userName}님의 금융 현황
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            신한금융그룹과 함께하는 스마트 금융 관리
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">총 보유 자산</div>
          <div className="text-2xl font-bold text-cyan-300">
            {formatMoney(totalAssets)}원
          </div>
        </div>
      </div>

      {/* 신한금융그룹 메인 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="text-3xl">🏦</div>
          <h3 className="text-xl font-bold text-cyan-100">
            신한금융그룹 거래 상품
          </h3>
          <div className="ml-auto rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-300">
            {shinhanProducts.length}개 상품 · {formatMoney(shinhanAssets)}원
          </div>
        </div>

        {shinhanProducts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedShinhan).map(([type, products]) => {
          const info = PRODUCT_INFO[type];
          const count = products.length;
          const totalValue = products.reduce((sum, p) => sum + (p.balance || 0), 0);

          return (
            <motion.div
              key={type}
              className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 transition-all ${
                type === 'DEPOSIT' && onShowTransactionHistory 
                  ? 'group cursor-pointer hover:bg-slate-800/70 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20' 
                  : 'hover:bg-slate-800/70'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                // 예금/입출금 상품만 클릭 시 거래 내역 표시
                if (type === 'DEPOSIT' && onShowTransactionHistory) {
                  onShowTransactionHistory();
                }
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className={`rounded-lg bg-gradient-to-br ${info.color} p-2 text-2xl shadow-lg`}>
                  {info.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-100">{info.label}</div>
                  <div className="text-xs text-slate-400">{count}개 상품</div>
                </div>
                {type === 'DEPOSIT' && onShowTransactionHistory && (
                  <div className="text-xs text-cyan-400 opacity-70 group-hover:opacity-100">
                    거래 내역 →
                  </div>
                )}
              </div>
              
              {totalValue > 0 && (
                <div className="mt-2 rounded-lg bg-slate-800/50 p-2">
                  <div className="text-xs text-slate-400">총액</div>
                  <div className="text-sm font-bold text-slate-100">
                    {formatMoney(totalValue)}원
                  </div>
                </div>
              )}

              {/* 상품 목록 상세 표시 */}
              <div className="mt-2 space-y-1">
                {products.map((product, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-cyan-500/30 bg-slate-900/50 p-2"
                  >
                    <div className="mb-1 text-xs font-semibold text-slate-200">
                      {product.name}
                    </div>
                    {product.balance !== undefined && product.type !== 'LOAN' && (
                      <div className="text-xs text-cyan-300">
                        잔액: <span className="font-bold">{formatMoney(product.balance)}</span>원
                      </div>
                    )}
                    {product.type === 'LOAN' && product.balance !== undefined && (
                      <>
                        <div className="text-xs text-red-300">
                          대출금: <span className="font-bold">{formatMoney(product.balance)}</span>원
                        </div>
                        {product.monthlyPayment !== undefined && (
                          <div className="text-xs text-orange-300">
                            월 상환: <span className="font-bold">{formatMoney(product.monthlyPayment)}</span>원
                          </div>
                        )}
                        {product.returnRate !== undefined && (
                          <div className="text-xs text-yellow-300">
                            연 이자율: <span className="font-bold">{product.returnRate}%</span>
                          </div>
                        )}
                      </>
                    )}
                    {product.cardLimit !== undefined && (
                      <div className="text-xs text-purple-300">
                        한도: <span className="font-bold">{formatMoney(product.cardLimit)}</span>원
                      </div>
                    )}
                    {product.monthlyPayment !== undefined && product.type !== 'LOAN' && (
                      <div className="text-xs text-green-300">
                        월 {formatMoney(product.monthlyPayment)}원
                      </div>
                    )}
                    {product.returnRate !== undefined && product.type !== 'LOAN' && (
                      <div className="text-xs text-yellow-300">
                        수익률 {product.returnRate}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
        </div>
        ) : (
          <motion.div
            className="rounded-xl border border-yellow-500/50 bg-yellow-900/20 p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-2 text-4xl">🏦</div>
            <div className="mb-1 text-base font-semibold text-yellow-200">
              신한금융그룹 상품이 없습니다
            </div>
            <div className="text-sm text-yellow-300">
              신한은행에서 계좌를 개설하고 더 강력한 카드를 받아보세요!
            </div>
          </motion.div>
        )}
      </div>

      {/* 오픈뱅킹 섹션 */}
      {openBankingProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🔗</div>
            <h3 className="text-xl font-bold text-purple-100">
              오픈뱅킹 연동 상품
            </h3>
            <div className="ml-auto rounded-full bg-purple-500/20 px-3 py-1 text-sm font-bold text-purple-300">
              {openBankingProducts.length}개 상품 · {formatMoney(openBankingAssets)}원
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedOpenBanking).map(([type, products]) => {
              const info = PRODUCT_INFO[type];
              const count = products.length;
              const totalValue = products.reduce((sum, p) => sum + (p.balance || 0), 0);

              return (
                <motion.div
                  key={type}
                  className="rounded-xl border border-purple-600/50 bg-purple-900/20 p-4 hover:bg-purple-800/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className={`rounded-lg bg-gradient-to-br ${info.color} p-2 text-2xl shadow-lg`}>
                      {info.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-purple-100">{info.label}</div>
                      <div className="text-xs text-purple-300">{count}개 상품</div>
                    </div>
                  </div>
                  
                  {totalValue > 0 && (
                    <div className="mt-2 rounded-lg bg-purple-800/30 p-2">
                      <div className="text-xs text-purple-300">총액</div>
                      <div className="text-sm font-bold text-purple-100">
                        {formatMoney(totalValue)}원
                      </div>
                    </div>
                  )}

                  {/* 상품 목록 간단 표시 */}
                  <div className="mt-2 space-y-1">
                    {products.slice(0, 2).map((product, idx) => (
                      <div
                        key={idx}
                        className="truncate rounded border border-purple-600/30 bg-purple-900/30 px-2 py-1 text-xs text-purple-200"
                        title={`${product.provider} - ${product.name}`}
                      >
                        <span className="font-semibold">{product.provider}</span>
                        <span className="text-purple-400"> · {product.name}</span>
                      </div>
                    ))}
                    {products.length > 2 && (
                      <div className="text-center text-xs text-purple-400">
                        +{products.length - 2}개 더 보기
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 오픈뱅킹 연동 안내 */}
      {openBankingProducts.length === 0 && (
        <motion.div
          className="rounded-xl border border-purple-500/50 bg-purple-900/20 p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-2 text-4xl">🔗</div>
          <div className="mb-1 text-base font-semibold text-purple-200">
            오픈뱅킹 연동 상품이 없습니다
          </div>
          <div className="text-sm text-purple-300">
            다른 금융사 상품을 연동하여 통합 관리해보세요
          </div>
        </motion.div>
      )}

      {/* 안내 메시지 */}
      {shinhanProducts.length === 0 && (
        <motion.div
          className="rounded-xl border border-yellow-500/50 bg-yellow-900/20 p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-2 text-3xl">🏦</div>
          <div className="mb-1 text-sm font-semibold text-yellow-200">
            신한은행 상품이 없습니다
          </div>
          <div className="text-xs text-yellow-300">
            신한은행 계좌를 개설하면 더 많은 혜택과 카드를 받을 수 있습니다!
          </div>
        </motion.div>
      )}
    </div>
  );
};


