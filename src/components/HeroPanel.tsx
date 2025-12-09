import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusEffect } from '../types/game';

interface HeroPanelProps {
  name: string;
  hp: number;
  maxHp: number;
  shield?: number;
  statusEffects?: StatusEffect[];
  description?: string;
  isBoss?: boolean;
}

// 상태 효과 아이콘 매핑
const STATUS_ICONS: Record<string, string> = {
  STUN: '😵',
  ATTACK_BUFF: '⚔️↑',
  ATTACK_DEBUFF: '⚔️↓',
  DAMAGE_REDUCTION: '🛡️',
  ENERGY_NEXT_TURN: '⚡',
  DOT_DAMAGE: '🔥',
  HOT_HEAL: '💚'
};

export const HeroPanel: React.FC<HeroPanelProps> = ({
  name,
  hp,
  maxHp,
  shield = 0,
  statusEffects = [],
  description,
  isBoss
}) => {
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  const isLowHp = ratio < 0.3;

  return (
    <motion.div
      className={`flex flex-col rounded-lg border px-1.5 py-1 shadow-md sm:rounded-2xl sm:px-4 sm:py-3 ${
        isBoss
          ? 'border-rose-500/60 bg-gradient-to-b from-rose-900/70 to-slate-900/80'
          : 'border-cyan-500/60 bg-gradient-to-b from-slate-800 to-slate-900'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between gap-1 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          {/* 캐릭터 아이콘 */}
          <motion.div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 sm:h-10 sm:w-10 sm:text-lg ${
              isBoss ? 'bg-rose-400 text-rose-950' : 'bg-cyan-400 text-cyan-950'
            }`}
            animate={isLowHp ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {isBoss ? '👹' : '🧑'}
          </motion.div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-slate-50 truncate sm:text-sm">{name}</span>
            {description && (
              <span className="hidden text-[8px] text-slate-200/80 sm:block sm:text-[10px]">{description}</span>
            )}
          </div>
        </div>

        {/* HP 표시 */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 sm:gap-1">
          <div className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-50 sm:text-sm">
            <motion.span
              className={`rounded-full px-1 py-0.5 text-[9px] sm:px-2 sm:text-xs ${
                isBoss ? 'bg-rose-500/80' : 'bg-cyan-500/80'
              } text-slate-950`}
              animate={isLowHp ? { backgroundColor: ['#ef4444', '#dc2626', '#ef4444'] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {hp}/{maxHp}
            </motion.span>
          </div>

          {/* 실드 표시 */}
          {shield > 0 && (
            <motion.div
              className="flex items-center gap-0.5 text-[9px] font-semibold text-sky-300 sm:text-xs"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <span>🛡️</span>
              <span className="rounded bg-sky-500/30 px-1 py-0.5 text-[8px] sm:px-1.5 sm:text-[10px]">{shield}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* HP 바 */}
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800 sm:mt-2 sm:h-2">
        <motion.div
          className={`h-full rounded-full ${
            isLowHp
              ? 'bg-red-500'
              : isBoss
              ? 'bg-rose-400'
              : 'bg-cyan-400'
          } transition-all duration-300`}
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 상태 효과 아이콘 */}
      {statusEffects.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5 sm:mt-2 sm:gap-1">
          <AnimatePresence>
            {statusEffects.map((effect, idx) => (
              <motion.div
                key={`${effect.type}-${idx}`}
                className="flex items-center gap-0.5 rounded-full bg-slate-700/80 px-1 py-0.5 text-[8px] text-amber-300 sm:px-2 sm:text-[9px]"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <span>{STATUS_ICONS[effect.type] || '✨'}</span>
                <span>{effect.remainingTurns}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
