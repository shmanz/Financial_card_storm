import React from 'react';

interface GameLogProps {
  entries: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  return (
    <div className="flex h-24 flex-col rounded-lg border border-slate-700/80 bg-slate-900/80 p-1.5 text-[10px] text-slate-200 sm:h-32 sm:rounded-xl sm:p-2 sm:text-[11px]">
      <div className="mb-1 text-[10px] font-semibold text-slate-300 sm:text-[11px]">전투 로그</div>
      <div className="flex-1 space-y-0.5 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="text-slate-500 text-[9px] sm:text-[10px]">아직 이벤트가 없습니다.</div>
        ) : (
          entries
            .slice(-6)
            .map((entry, idx) => (
              <div key={idx} className="leading-snug text-[9px] sm:text-[10px]">
                • {entry}
              </div>
            ))
        )}
      </div>
    </div>
  );
};







