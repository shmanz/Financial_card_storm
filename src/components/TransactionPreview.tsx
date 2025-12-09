import React from 'react';
import { Transaction } from '../types/game';

interface TransactionPreviewProps {
  transactions: Transaction[];
  onClose: () => void;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  transactions,
  onClose
}) => {
  const top = transactions.slice(0, 10);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-cyan-500/60 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-cyan-100">거래 데이터 미리보기</div>
            <div className="text-[11px] text-slate-300">
              최근 생성된 200건 중 상위 10건만 표시합니다.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            닫기
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto px-4 py-3">
          <table className="min-w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-800/80 text-[10px] uppercase text-slate-300">
                <th className="border-b border-slate-700 px-2 py-1 text-left">날짜</th>
                <th className="border-b border-slate-700 px-2 py-1 text-left">시간</th>
                <th className="border-b border-slate-700 px-2 py-1 text-left">채널</th>
                <th className="border-b border-slate-700 px-2 py-1 text-left">카테고리</th>
                <th className="border-b border-slate-700 px-2 py-1 text-left">가맹점</th>
                <th className="border-b border-slate-700 px-2 py-1 text-right">금액</th>
                <th className="border-b border-slate-700 px-2 py-1 text-right">잔액</th>
              </tr>
            </thead>
            <tbody>
              {top.map((tx) => (
                <tr key={tx.id} className="odd:bg-slate-900 even:bg-slate-800/40">
                  <td className="border-b border-slate-800 px-2 py-1">{tx.date}</td>
                  <td className="border-b border-slate-800 px-2 py-1">{tx.time}</td>
                  <td className="border-b border-slate-800 px-2 py-1 text-xs">{tx.channel}</td>
                  <td className="border-b border-slate-800 px-2 py-1 text-xs">{tx.category}</td>
                  <td className="border-b border-slate-800 px-2 py-1">{tx.merchant}</td>
                  <td className="border-b border-slate-800 px-2 py-1 text-right">
                    {tx.amount.toLocaleString('ko-KR')}원
                  </td>
                  <td className="border-b border-slate-800 px-2 py-1 text-right">
                    {tx.balanceAfter.toLocaleString('ko-KR')}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};







