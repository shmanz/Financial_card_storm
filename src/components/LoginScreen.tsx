/**
 * ========================================
 * 로그인/회원가입 화면
 * ========================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_USERS } from '../data/mockUsers';
import { NewAccountPopup } from './NewAccountPopup';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'check'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showNewAccountPopup, setShowNewAccountPopup] = useState(false);

  const handleGuestLogin = () => {
    loginAsGuest();
    onLoginSuccess();
  };

  const handleLogin = () => {
    if (!name.trim() || !password.trim()) {
      setError('이름과 비밀번호를 입력하세요.');
      return;
    }

    const success = login(name, password);
    if (success) {
      onLoginSuccess();
    } else {
      setError('이름 또는 비밀번호가 잘못되었습니다.');
    }
  };

  const handleCheckExisting = () => {
    if (!name.trim()) {
      setError('이름을 입력하세요.');
      return;
    }

    const existing = MOCK_USERS.find(u => u.name === name);
    if (existing) {
      setError('');
      setMode('login');
    } else {
      // 신규 고객 - 계좌개설 팝업
      setShowNewAccountPopup(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-cyan-500/60 bg-slate-900/90 p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 로고/타이틀 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-cyan-300">
            💳 Financial Card Storm
          </h1>
          <p className="text-sm text-slate-400">
            은행 거래 데이터 기반 카드 배틀 게임
          </p>
        </div>

        {mode === 'check' ? (
          // 기존 고객 확인
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckExisting()}
                placeholder="예: 염승훈"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {error && (
              <motion.div
                className="rounded-lg border border-red-500/50 bg-red-900/30 p-3 text-sm text-red-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleCheckExisting}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 font-semibold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400"
            >
              거래 내역 확인
            </button>

            <button
              onClick={() => setMode('login')}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700"
            >
              이미 계정이 있습니다
            </button>
          </div>
        ) : (
          // 로그인
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="예: 염승훈"
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
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="password123"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {error && (
              <motion.div
                className="rounded-lg border border-red-500/50 bg-red-900/30 p-3 text-sm text-red-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleLogin}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 font-semibold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400"
            >
              로그인
            </button>

            <button
              onClick={() => {
                setMode('check');
                setError('');
              }}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700"
            >
              신규 고객입니다
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400">또는</span>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="w-full rounded-lg border-2 border-dashed border-cyan-500/50 bg-slate-800/30 px-6 py-3 text-sm font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-slate-800/50"
            >
              🎮 Guest로 시작하기 (로그인 없이 체험)
            </button>
          </div>
        )}

        {/* 테스트 계정 안내 */}
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="mb-2 text-xs font-semibold text-slate-300">
            💡 테스트 계정
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <div>이름: 염승훈, 이태영, 좌상목, 서재만, 강승완, 배형준, 임지훈</div>
            <div>비밀번호: password123</div>
          </div>
        </div>
      </motion.div>

      {/* 신규 고객 계좌개설 팝업 */}
      {showNewAccountPopup && (
        <NewAccountPopup
          customerName={name}
          onClose={() => setShowNewAccountPopup(false)}
          onSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
};

