/**
 * ========================================
 * PART 3: UI/UX - 하스스톤 스타일 카드 UI
 * ========================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types/game';

interface CardViewProps {
  card: Card;
  disabled?: boolean;
  onPlay?: () => void;
}

// 카테고리별 색상 테마
const CATEGORY_COLORS: Record<string, { border: string; bg: string; glow: string }> = {
  FOOD: { border: 'border-orange-500/70', bg: 'bg-gradient-to-b from-orange-900/60 to-slate-900', glow: 'shadow-orange-500/30' },
  CAFE: { border: 'border-amber-500/70', bg: 'bg-gradient-to-b from-amber-900/60 to-slate-900', glow: 'shadow-amber-500/30' },
  SHOPPING: { border: 'border-pink-500/70', bg: 'bg-gradient-to-b from-pink-900/60 to-slate-900', glow: 'shadow-pink-500/30' },
  TRANSPORT: { border: 'border-blue-500/70', bg: 'bg-gradient-to-b from-blue-900/60 to-slate-900', glow: 'shadow-blue-500/30' },
  FUEL: { border: 'border-red-500/70', bg: 'bg-gradient-to-b from-red-900/60 to-slate-900', glow: 'shadow-red-500/30' },
  HEALTH: { border: 'border-green-500/70', bg: 'bg-gradient-to-b from-green-900/60 to-slate-900', glow: 'shadow-green-500/30' },
  TRAVEL: { border: 'border-purple-500/70', bg: 'bg-gradient-to-b from-purple-900/60 to-slate-900', glow: 'shadow-purple-500/30' },
  SUBSCRIPTION: { border: 'border-violet-500/70', bg: 'bg-gradient-to-b from-violet-900/60 to-slate-900', glow: 'shadow-violet-500/30' },
  GROCERIES: { border: 'border-lime-500/70', bg: 'bg-gradient-to-b from-lime-900/60 to-slate-900', glow: 'shadow-lime-500/30' },
  ETC: { border: 'border-slate-500/70', bg: 'bg-gradient-to-b from-slate-800/60 to-slate-900', glow: 'shadow-slate-500/30' }
};

// 희귀도별 테두리
const RARITY_BORDER: Record<string, string> = {
  COMMON: 'border-2',
  RARE: 'border-2 shadow-lg',
  EPIC: 'border-4 shadow-xl animate-pulse',
  LEGENDARY: 'border-4 shadow-2xl animate-pulse'
};

/**
 * Single card visual inspired by Hearthstone, themed for banking.
 * 
 * Features:
 * - Framer Motion hover/tap animations
 * - Category-based color themes
 * - Rarity-based borders
 * - Effect icons display
 * - Card image placeholder
 */
export const CardView: React.FC<CardViewProps> = ({ card, disabled, onPlay }) => {
  const canPlay = !disabled && !!onPlay;
  const theme = CATEGORY_COLORS[card.category] || CATEGORY_COLORS.ETC;
  const rarityBorder = RARITY_BORDER[card.rarity || 'COMMON'];

  const handleClick = () => {
    console.log('[CardView] 카드 클릭:', card.name, 'canPlay:', canPlay, 'disabled:', disabled);
    if (canPlay && onPlay) {
      onPlay();
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={!canPlay}
      whileHover={canPlay ? { scale: 1.05, y: -8 } : {}}
      whileTap={canPlay ? { scale: 0.95 } : {}}
      className={`relative flex w-full flex-col rounded-2xl border ${theme.border} ${theme.bg} ${rarityBorder} p-3 shadow-lg transition-all duration-200 ${
        !canPlay ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer hover:shadow-2xl ' + theme.glow
      }`}
    >
      {/* 비용 배지 */}
      <motion.div
        className="absolute -left-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-base font-extrabold text-slate-950 shadow-lg ring-2 ring-cyan-300 sm:-left-2 sm:-top-2 sm:h-10 sm:w-10 sm:text-xl"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {card.cost}
      </motion.div>

      {/* 희귀도 뱃지 */}
      {card.rarity && card.rarity !== 'COMMON' && (
        <div className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-950 shadow">
          {card.rarity}
        </div>
      )}

      {/* 카드 이름 */}
      <div className="mt-2 text-center text-xs font-bold text-cyan-100 sm:text-sm line-clamp-2">{card.name}</div>

      {/* 카테고리 필 */}
      <div className="mt-1 self-center rounded-full bg-slate-700/80 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-cyan-300 shadow-inner sm:px-2 sm:text-[9px]">
        {card.category}
      </div>

      {/* 카드 일러스트 (카테고리 이모지) */}
      <div className="relative my-2 overflow-hidden rounded-lg border border-slate-600/50 bg-gradient-to-br from-slate-700 to-slate-900">
        <div className="flex h-16 items-center justify-center text-3xl sm:h-24 sm:text-5xl">
          {card.imageUrl || '💳'}
        </div>
      </div>

      {/* 효과 아이콘 (간단 표시) */}
      <div className="mb-1 flex flex-wrap justify-center gap-1">
        {card.effects.slice(0, 3).map((effect, idx) => (
          <span
            key={idx}
            className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[8px] uppercase text-amber-300"
          >
            {effect.type.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* 설명 */}
      <div className="flex-1 rounded-md bg-slate-900/70 p-1.5 text-[9px] leading-snug text-slate-200 shadow-inner line-clamp-2 sm:p-2 sm:text-[10px]">
        {card.description}
      </div>

      {/* 공격력 / 방어력 푸터 */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold sm:text-xs">
        <span className="flex items-center gap-1 text-amber-300">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/30 text-[8px] sm:h-5 sm:w-5 sm:text-[10px]">
            ⚔️
          </span>
          {card.attack}
        </span>
        <span className="flex items-center gap-1 text-sky-300">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/30 text-[8px] sm:h-5 sm:w-5 sm:text-[10px]">
            🛡️
          </span>
          {card.defense}
        </span>
      </div>
    </motion.button>
  );
};
