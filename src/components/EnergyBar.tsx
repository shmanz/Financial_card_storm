import React from 'react';
import { motion } from 'framer-motion';

interface EnergyBarProps {
  current: number;
  max: number;
  cap?: number;
}

const MAX_CRYSTALS = 10;

export const EnergyBar: React.FC<EnergyBarProps> = ({ current, max, cap = MAX_CRYSTALS }) => {
  const clampedMax = Math.min(max, cap);
  const clampedCurrent = Math.min(current, clampedMax);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-cyan-500/60 bg-slate-900/80 px-1.5 py-2 sm:gap-2 sm:rounded-2xl sm:px-2 sm:py-3">
      <div className="text-[10px] font-semibold text-cyan-200 sm:text-xs">에너지</div>
      <motion.div
        className="text-xs font-bold text-cyan-100 sm:text-sm"
        key={clampedCurrent}
        initial={{ scale: 1.5, color: '#38bdf8' }}
        animate={{ scale: 1, color: '#e0f2fe' }}
        transition={{ duration: 0.3 }}
      >
        {clampedCurrent}/{clampedMax}
      </motion.div>
      <div className="flex flex-1 flex-col items-center justify-end gap-0.5 sm:gap-1">
        {Array.from({ length: cap }).map((_, idx) => {
          const slot = cap - idx;
          const filled = slot <= clampedCurrent;
          const unlocked = slot <= clampedMax;
          return (
            <motion.div
              key={slot}
              className={`h-3 w-4 rounded-sm border text-[8px] sm:h-4 sm:w-5 sm:text-[9px] ${
                filled
                  ? 'border-cyan-400 bg-cyan-400/70 shadow shadow-cyan-400/40'
                  : unlocked
                  ? 'border-cyan-500/40 bg-slate-800'
                  : 'border-slate-700 bg-slate-900/80 opacity-40'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              whileHover={{ scale: 1.2 }}
            />
          );
        })}
      </div>
    </div>
  );
};



