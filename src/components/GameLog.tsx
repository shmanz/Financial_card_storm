import React from 'react';

interface GameLogProps {
  entries: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-700/80 bg-slate-900/80 p-1 text-[9px] text-slate-200 sm:h-32 sm:rounded-xl sm:p-2 sm:text-[11px]">
      <div className="mb-0.5 text-[9px] font-semibold text-slate-300 flex-shrink-0 sm:mb-1 sm:text-[11px]">전투 로그</div>
      <div className="flex-1 space-y-0.5 overflow-y-auto pr-0.5 min-h-0">
        {entries.length === 0 ? (
          <div className="text-slate-500 text-[8px] sm:text-[10px]">이벤트 없음</div>
        ) : (
          entries
            .slice(-4)
            .map((entry, idx) => (
              <div key={idx} className="leading-tight text-[8px] sm:text-[10px]">
                • {entry}
              </div>
            ))
        )}
      </div>
    </div>
  );
};







