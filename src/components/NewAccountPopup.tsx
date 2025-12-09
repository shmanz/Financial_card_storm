/**
 * ========================================
 * 신규 고객 계좌개설 팝업
 * ========================================
 * 계좌 + 카드 + 적금 동시 개설
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { BankProduct } from '../data/mockUsers';

interface NewAccountPopupProps {
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewAccountPopup: React.FC<NewAccountPopupProps> = ({
  customerName,
  onClose,
  onSuccess
}) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 신한은행 상품만 제공
  const [selectedDeposit, setSelectedDeposit] = useState('신한 쏠편한 입출금통장');
  const [selectedCard, setSelectedCard] = useState('신한 Deep Dream 체크카드');
  const [selectedSavings, setSelectedSavings] = useState('신한 쏠편한 적금');
  const [savingsAmount, setSavingsAmount] = useState(300000);
  
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: 정보입력, 2: 상품선택, 3: 완료
  
  // 신한은행 상품 목록
  const depositOptions = [
    '신한 쏠편한 입출금통장',
    '신한 S드림 통장',
    '신한 디지털 통장',
    '신한 첫거래 우대 통장'
  ];
  
  const cardOptions = [
    '신한 Deep Dream 체크카드',
    '신한 Deep Oil 체크카드',
    '신한 Deep Refresh 체크카드',
    '신한 Mr.Life 체크카드',
    '신한 The Platinum 체크카드'
  ];
  
  const savingsOptions = [
    '신한 쏠편한 적금',
    '신한 S20 적금',
    '신한 청년도약 적금',
    '신한 주거래 우대 적금'
  ];

  const handleNextStep = () => {
    if (step === 1) {
      if (!email.trim() || !password.trim()) {
        setError('이메일과 비밀번호를 입력하세요.');
        return;
      }
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      // 신한은행 3종 상품 개설
      const products: BankProduct[] = [
        {
          type: 'DEPOSIT',
          name: selectedDeposit,
          provider: '신한은행',
          balance: 1_000_000
        },
        {
          type: 'CARD',
          name: selectedCard,
          provider: '신한카드',
          cardLimit: 2_000_000
        },
        {
          type: 'SAVINGS',
          name: selectedSavings,
          provider: '신한은행',
          balance: 0,
          monthlyPayment: savingsAmount
        }
      ];

      const success = register(customerName, password, email, products);
      if (success) {
        setStep(3);
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } else if (step === 3) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        className="w-full max-w-2xl rounded-2xl border border-cyan-500/60 bg-slate-900 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-cyan-100">
              {step === 1 && '📝 신규 고객 회원가입'}
              {step === 2 && '🏦 3종 상품 동시 가입'}
              {step === 3 && '🎉 가입 완료!'}
            </h2>
            <p className="text-xs text-slate-400">
              {step === 1 && '거래 내역이 없는 신규 고객입니다'}
              {step === 2 && '계좌 + 카드 + 적금을 한번에 개설하세요'}
              {step === 3 && '이제 게임을 시작할 수 있습니다'}
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
            {/* Step 1: 정보 입력 */}
            {step === 1 && (
              <motion.div
                key="step1"
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">
                    고객명
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    disabled
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: 신한은행 상품 선택 */}
            {step === 2 && (
              <motion.div
                key="step2"
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="rounded-lg border border-blue-500/50 bg-blue-900/20 p-3 text-center">
                  <div className="text-sm font-semibold text-blue-200">
                    🏦 신한은행 3종 상품 동시 가입
                  </div>
                  <div className="mt-1 text-xs text-blue-300">
                    신규 고객님을 위한 맞춤 패키지입니다
                  </div>
                </div>

                {/* 1. 입출금통장 선택 */}
                <div className="rounded-lg border border-cyan-500/50 bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏦</span>
                    <div>
                      <div className="font-semibold text-cyan-100">1. 입출금 통장</div>
                      <div className="text-xs text-slate-400">신한은행 입출금 상품을 선택하세요</div>
                    </div>
                  </div>
                  <select
                    value={selectedDeposit}
                    onChange={(e) => setSelectedDeposit(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {depositOptions.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-slate-400">
                    초기 잔액: 100만원
                  </div>
                </div>

                {/* 2. 체크카드 선택 */}
                <div className="rounded-lg border border-cyan-500/50 bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    <div>
                      <div className="font-semibold text-cyan-100">2. 체크카드</div>
                      <div className="text-xs text-slate-400">신한카드 상품을 선택하세요</div>
                    </div>
                  </div>
                  <select
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {cardOptions.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-slate-400">
                    한도: 200만원
                  </div>
                </div>

                {/* 3. 적금 선택 + 금액 설정 */}
                <div className="rounded-lg border border-cyan-500/50 bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="font-semibold text-cyan-100">3. 적금</div>
                      <div className="text-xs text-slate-400">신한은행 적금 상품을 선택하세요</div>
                    </div>
                  </div>
                  <select
                    value={selectedSavings}
                    onChange={(e) => setSelectedSavings(e.target.value)}
                    className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {savingsOptions.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-300">월 납입 금액 설정</div>
                    <input
                      type="range"
                      min="100000"
                      max="1000000"
                      step="100000"
                      value={savingsAmount}
                      onChange={(e) => setSavingsAmount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-lg font-semibold text-cyan-300">
                      월 {savingsAmount.toLocaleString()}원
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: 완료 */}
            {step === 3 && (
              <motion.div
                key="step3"
                className="py-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="mb-4 text-6xl">🎉</div>
                <div className="mb-2 text-xl font-bold text-cyan-100">
                  신한은행 계좌 개설 완료!
                </div>
                <div className="mb-6 text-sm text-slate-400">
                  환영합니다! 기본 카드 30장이 자동으로 생성되었습니다.
                </div>
                <div className="mx-auto max-w-sm space-y-2 rounded-lg border border-blue-500/50 bg-blue-900/20 p-4 text-left text-sm text-blue-100">
                  <div className="font-semibold text-blue-200">✅ 개설 완료 상품</div>
                  <div className="mt-2 space-y-1 text-xs text-slate-300">
                    <div>🏦 {selectedDeposit}</div>
                    <div>💳 {selectedCard}</div>
                    <div>💰 {selectedSavings} (월 {savingsAmount.toLocaleString()}원)</div>
                  </div>
                  <div className="mt-3 border-t border-slate-600 pt-2">
                    <div className="font-semibold text-cyan-200">🎴 스타터 덱</div>
                    <div className="mt-1 text-xs text-slate-400">
                      기본 카드 30장 자동 지급
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              className="mt-4 rounded-lg border border-red-500/50 bg-red-900/30 p-3 text-sm text-red-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-between border-t border-slate-700 px-6 py-4">
          <button
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-6 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            {step === 1 ? '취소' : '이전'}
          </button>
          <button
            onClick={handleNextStep}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-2 font-semibold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400"
          >
            {step === 1 && '다음'}
            {step === 2 && '계좌 개설'}
            {step === 3 && '게임 시작'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

