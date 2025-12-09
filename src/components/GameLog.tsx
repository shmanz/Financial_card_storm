import React from 'react';

interface GameLogProps {
  entries: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  return (
    <div className="flex h-32 flex-col rounded-xl border border-slate-700/80 bg-slate-900/80 p-2 text-[11px] text-slate-200">
      <div className="mb-1 text-[11px] font-semibold text-slate-300">전투 로그</div>
      <div className="flex-1 space-y-0.5 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="text-slate-500">아직 이벤트가 없습니다.</div>
        ) : (
          entries
            .slice(-8)
            .map((entry, idx) => (
              <div key={idx} className="leading-snug">
                • {entry}
              </div>
            ))
        )}
      </div>
    </div>
  );
};







