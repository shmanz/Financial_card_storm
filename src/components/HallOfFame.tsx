/**
 * ========================================
 * 명예의 전당 컴포넌트
 * ========================================
 * 주 단위 승률 1위 랭킹 및 보상 시스템
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeekRanking, createHallOfFameRewardCard, getWeekNumber } from '../utils/hallOfFame';
import { UserProfile } from '../data/mockUsers';

interface HallOfFameProps {
  onClose: () => void;
}

interface RankingEntry {
  user: UserProfile;
  wins: number;
  losses: number;
  winRate: number;
  totalGames: number;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ onClose }) => {
  const { currentUser, addPurchasedProduct } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      const week = getWeekNumber(new Date());
      setCurrentWeek(week);
      
      try {
        // DB에서 랭킹 조회
        const rankingData = await getCurrentWeekRanking();
        setRanking(rankingData);
        
        // 주차별 보상 확인 및 지급 (1위인 경우)
        if (rankingData.length > 0 && rankingData[0].user.id === currentUser?.id) {
          const firstPlace = rankingData[0];
          const rewardCardId = `hall-of-fame-${week}`;
          
          // 이미 보상을 받았는지 확인 (나중에 DB에서 확인하도록 개선 필요)
          if (!currentUser?.hallOfFameRewards?.includes(rewardCardId)) {
            const rewardCard = createHallOfFameRewardCard(week);
            if (currentUser && addPurchasedProduct) {
              addPurchasedProduct(rewardCardId, rewardCard);
              alert(`🏆 축하합니다! ${week} 주간 1위 보상을 획득했습니다!\n\n카드: ${rewardCard.name}`);
            }
          }
        }
      } catch (error) {
        console.error('[명예의 전당] 랭킹 로드 에러:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRanking();
    
    // 주기적으로 랭킹 갱신 (5초마다 - 실시간 순위 변동 반영)
    const interval = setInterval(() => {
      loadRanking();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentUser, addPurchasedProduct]);

  const myRank = currentUser
    ? ranking.findIndex(r => r.user.id === currentUser.id) + 1
    : -1;
  const myStats = currentUser
    ? ranking.find(r => r.user.id === currentUser.id)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-amber-300 mb-1">🏆 명예의 전당</h2>
            <p className="text-sm text-slate-300">
              {currentWeek} 주간 승률 랭킹
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            닫기
          </button>
        </div>

        {/* 보상 안내 */}
        <div className="mb-6 rounded-xl border border-amber-500/50 bg-amber-900/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💎</span>
            <h3 className="text-lg font-bold text-amber-200">주간 보상</h3>
          </div>
          <p className="text-sm text-slate-300">
            매주 일요일 자정에 현재 주의 승률 1위 플레이어에게 특별 보상 카드를 지급합니다.
          </p>
          <div className="mt-3 rounded-lg bg-slate-800/50 p-3">
            <div className="text-xs font-semibold text-amber-300 mb-1">보상 카드</div>
            <div className="text-sm text-slate-200">
              🏆 주간 챔피언 카드 - 10 피해 + 체력 8 회복 + 방어막 5
            </div>
          </div>
        </div>

        {/* 내 순위 */}
        {myStats && (
          <div className="mb-6 rounded-xl border border-cyan-500/50 bg-cyan-900/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-cyan-300 mb-1">나의 순위</div>
                <div className="text-2xl font-bold text-cyan-200">
                  {myRank > 0 ? `${myRank}위` : '순위 외'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">이번 주 전적</div>
                <div className="text-lg font-bold text-slate-200">
                  {myStats.wins}승 {myStats.losses}패
                </div>
                <div className="text-sm text-cyan-300">
                  승률 {(myStats.winRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 랭킹 리스트 (실시간 순위 변동) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700">
            <div className="w-12">순위</div>
            <div className="flex-1">플레이어</div>
            <div className="w-24 text-center">전적</div>
            <div className="w-20 text-center">승률</div>
          </div>
          <div className="text-[10px] text-slate-500 text-center py-1 flex items-center justify-center gap-1">
            <span className="animate-pulse">⚡</span>
            <span>실시간 업데이트 (5초마다 갱신)</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400">
              랭킹을 불러오는 중...
            </div>
          ) : ranking.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              아직 경기 기록이 없습니다.
              <div className="mt-2 text-xs text-slate-500">
                PvP 모드에서 경기를 플레이하면 랭킹에 표시됩니다.
              </div>
            </div>
          ) : (
            ranking.map((entry, index) => {
              const isMe = currentUser && entry.user.id === currentUser.id;
              const rank = index + 1;
              
              // 순위별 스타일
              let rankStyle = '';
              let rankIcon = '';
              
              if (rank === 1) {
                rankStyle = 'border-amber-500/60 bg-gradient-to-r from-amber-900/40 to-yellow-900/40';
                rankIcon = '👑';
              } else if (rank === 2) {
                rankStyle = 'border-slate-400/60 bg-gradient-to-r from-slate-800/40 to-slate-700/40';
                rankIcon = '🥈';
              } else if (rank === 3) {
                rankStyle = 'border-orange-500/60 bg-gradient-to-r from-orange-900/40 to-amber-900/40';
                rankIcon = '🥉';
              } else {
                rankStyle = 'border-slate-700 bg-slate-800/50';
              }
              
              return (
                <motion.div
                  key={entry.user.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    isMe && rank > 3 ? 'border-cyan-500/40 bg-cyan-900/20' : rankStyle
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-12 flex items-center gap-2">
                    {rankIcon ? (
                      <span className="text-xl">{rankIcon}</span>
                    ) : (
                      <span className={`text-lg font-bold ${isMe ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {rank}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      isMe ? 'text-cyan-200' : 
                      rank === 1 ? 'text-amber-200' : 
                      rank === 2 ? 'text-slate-200' :
                      rank === 3 ? 'text-orange-200' : 
                      'text-slate-200'
                    }`}>
                      {entry.user.name}
                      {isMe && <span className="ml-2 text-xs text-cyan-400">(나)</span>}
                      {rank === 1 && entry.user.hallOfFameRewards?.some(r => r.includes(currentWeek)) && (
                        <span className="ml-2 text-xs text-amber-400">🏆 보상 획득</span>
                      )}
                    </div>
                  </div>
                  <div className="w-24 text-center text-sm text-slate-300">
                    {entry.wins}승 {entry.losses}패
                  </div>
                  <div className="w-20 text-center">
                    <span className={`text-sm font-bold ${
                      rank === 1 ? 'text-amber-300' : 
                      rank === 2 ? 'text-slate-300' :
                      rank === 3 ? 'text-orange-300' : 
                      'text-slate-300'
                    }`}>
                      {(entry.winRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* 안내 */}
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/30 p-3 text-xs text-slate-400">
          <div className="mb-1">ℹ️ 랭킹 안내</div>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>최소 1경기 이상 플레이한 사용자만 랭킹에 표시됩니다</li>
            <li>승률이 동일할 경우 총 경기 수가 많은 플레이어가 상위에 표시됩니다</li>
            <li>주간 보상은 매주 일요일 자정에 자동으로 지급됩니다</li>
            <li>랭킹은 현재 주에 경기를 플레이한 모든 사용자 중 상위 3명만 표시됩니다</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

