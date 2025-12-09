/**
 * ========================================
 * 오픈뱅킹 연동 팝업 + 히든 카드 획득
 * ========================================
 * 패배 시 추가 상품 가입으로 역전 승 기회
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { BankProduct } from '../data/mockUsers';

interface OpenBankingPopupProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const OpenBankingPopup: React.FC<OpenBankingPopupProps> = ({
  onClose,
  onSuccess
}) => {
  const { currentUser, updateUserProducts, unlockHiddenCard } = useAuth();
  const [step, setStep] = useState(1); // 1: 선택, 2: 연동, 3: 완료
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleConnect = () => {
    if (!selectedOption) return;

    // 오픈뱅킹 연동 시뮬레이션
    const newProducts: BankProduct[] = [];

    switch (selectedOption) {
      case 'IRP':
        newProducts.push({
          type: 'INVESTMENT',
          name: '신한 IRP (타행 이전)',
          provider: '신한은행',
          balance: 10_000_000,
          returnRate: 6.8
        });
        break;
      case 'AUTOPAY':
        newProducts.push({
          type: 'DEPOSIT',
          name: '신한 자동이체 통장',
          provider: '신한은행',
          balance: 3_000_000
        });
        break;
      case 'SAVINGS':
        newProducts.push({
          type: 'SAVINGS',
          name: '신한 주택청약종합저축',
          provider: '신한은행',
          balance: 1_000_000,
          monthlyPayment: 100_000
        });
        newProducts.push({
          type: 'INVESTMENT',
          name: '신한 연금저축',
          provider: '신한은행',
          balance: 5_000_000,
          returnRate: 5.5
        });
        break;
      case 'SUBSCRIPTION':
        newProducts.push({
          type: 'SAVINGS',
          name: '신한 청약통장 (타행 이전)',
          provider: '신한은행',
          balance: 2_000_000,
          monthlyPayment: 100_000
        });
        break;
    }

    // 상품 추가
    updateUserProducts(newProducts);
    
    // 히든 카드 획득!
    unlockHiddenCard();

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        className="w-full max-w-2xl rounded-2xl border border-purple-500/60 bg-slate-900 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-purple-100">
              {step === 1 && '🏦 오픈뱅킹 연동'}
              {step === 2 && '🔐 타 은행 인증 중...'}
              {step === 3 && '🎁 히든 카드 획득!'}
            </h2>
            <p className="text-xs text-slate-400">
              {step === 1 && '다른 은행의 상품을 가져와 더 강력해지세요'}
              {step === 2 && '잠시만 기다려주세요'}
              {step === 3 && '역전승의 기회가 생겼습니다!'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: 옵션 선택 */}
            {step === 1 && (
              <motion.div
                key="step1"
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-4 rounded-lg border border-blue-500/50 bg-blue-900/20 p-3 text-sm text-blue-200">
                  🏦 <strong>신한은행과 함께 더 강해지세요!</strong> 추가 금융 상품으로 <strong>히든 카드</strong>를 획득하고 역전의 기회를 잡으세요.
                </div>

                {[
                  { id: 'IRP', icon: '💼', name: '타행 IRP → 신한은행 이전', desc: '타 은행의 개인형 퇴직연금을 신한은행으로 이전합니다', bonus: '잔액 1천만원 + 우대 금리' },
                  { id: 'AUTOPAY', icon: '🔄', name: '자동 정기결제 → 신한은행 변경', desc: '각종 자동이체/정기결제를 신한은행 계좌로 변경합니다', bonus: '월 100만원 자동이체' },
                  { id: 'SAVINGS', icon: '💰', name: '추가 신한은행 상품 가입', desc: '신한 주택청약종합저축 또는 연금저축 가입', bonus: '청약 100만원 + 연금 500만원' },
                  { id: 'SUBSCRIPTION', icon: '🏠', name: '청약상품 → 신한은행 이전', desc: '타 은행의 청약통장을 신한은행으로 이전합니다', bonus: '청약 횟수 유지 + 우대' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedOption === option.id
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-100">{option.name}</div>
                        <div className="mt-1 text-xs text-slate-400">{option.desc}</div>
                        <div className="mt-2 text-xs font-semibold text-purple-300">
                          ✨ {option.bonus}
                        </div>
                      </div>
                      {selectedOption === option.id && (
                        <div className="text-2xl text-purple-400">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: 연동 중 */}
            {step === 2 && (
              <motion.div
                key="step2"
                className="py-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="mb-4 text-6xl"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                >
                  🔐
                </motion.div>
                <div className="text-lg font-semibold text-slate-100">
                  타 은행과 연동 중...
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  보안 인증을 진행하고 있습니다
                </div>
              </motion.div>
            )}

            {/* Step 3: 완료 + 히든 카드 */}
            {step === 3 && (
              <motion.div
                key="step3"
                className="py-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className="mb-4 text-7xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  🎴
                </motion.div>
                <div className="mb-2 text-2xl font-bold text-purple-100">
                  히든 카드 획득!
                </div>
                <div className="mb-6 text-sm text-slate-400">
                  오픈뱅킹 연동으로 특별한 카드를 얻었습니다
                </div>

                <div className="mx-auto max-w-sm rounded-lg border-2 border-blue-500 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-6">
                  <div className="mb-2 text-xl font-bold text-blue-100">
                    🏦 신한 금융의 힘 (HIDDEN)
                  </div>
                  <div className="mb-4 text-xs text-blue-200">
                    코스트: 4 | 공격력: 8 | 방어: 3
                  </div>
                  <div className="text-sm text-blue-100">
                    신한은행 통합 금융의 힘을 발휘합니다.
                    <div className="mt-2 space-y-1 text-xs">
                      • 상대에게 8 피해
                      • 내 체력 5 회복
                      • 방어막 3 생성
                      • 다음 턴 에너지 +2
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-cyan-300">
                    💎 밸런스 잡힌 역전의 카드
                  </div>
                </div>

                <div className="mt-6 text-xs text-slate-400">
                  이제 덱에 자동으로 추가되었습니다!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 푸터 */}
        <div className="flex justify-between border-t border-slate-700 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-600 bg-slate-800 px-6 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            {step === 3 ? '닫기' : '취소'}
          </button>
          {step === 1 && (
            <button
              onClick={() => {
                if (selectedOption) {
                  setStep(2);
                  setTimeout(() => handleConnect(), 2000);
                }
              }}
              disabled={!selectedOption}
              className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-semibold text-slate-950 shadow-lg hover:from-purple-400 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              연동하기
            </button>
          )}
          {step === 3 && (
            <button
              onClick={onSuccess}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-2 font-semibold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400"
            >
              재도전하기
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

