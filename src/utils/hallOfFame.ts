/**
 * ========================================
 * 명예의 전당 유틸리티
 * ========================================
 * 주 단위 승률 랭킹 및 보상 카드 관리
 */

import { UserProfile } from '../data/mockUsers';
import { MOCK_USERS } from '../data/mockUsers';

// 주 단위 계산
export const getWeekNumber = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

// 현재 주의 승률 랭킹 가져오기 (1~3위만)
export const getCurrentWeekRanking = (): Array<{
  user: UserProfile;
  wins: number;
  losses: number;
  winRate: number;
  totalGames: number;
}> => {
  const currentWeek = getWeekNumber(new Date());
  const ranking: Array<{
    user: UserProfile;
    wins: number;
    losses: number;
    winRate: number;
    totalGames: number;
  }> = [];

  console.log('[명예의 전당] 랭킹 계산 시작, 현재 주:', currentWeek);
  console.log('[명예의 전당] 전체 사용자 수:', MOCK_USERS.length);

  // 모든 사용자의 현재 주 통계 수집 (MOCK_USERS 전체 확인)
  for (const user of MOCK_USERS) {
    // Guest 사용자는 제외
    if (user.id.includes('guest')) {
      console.log('[명예의 전당] Guest 사용자 제외:', user.name);
      continue;
    }

    // localStorage에서 통계 로드 (영구 저장된 데이터)
    const storageKey = `pvpStats_${user.id}`;
    let stats = null;
    try {
      const savedStats = localStorage.getItem(storageKey);
      if (savedStats) {
        stats = JSON.parse(savedStats);
        console.log(`[명예의 전당] ${user.name} 통계 로드:`, stats);
      } else {
        console.log(`[명예의 전당] ${user.name} 통계 없음 (키: ${storageKey})`);
      }
    } catch (e) {
      console.error('[명예의 전당] 통계 로드 실패:', user.name, e);
    }

    // 통계가 없거나 주간 기록이 없으면 스킵
    if (!stats || !stats.weeklyRecords || !Array.isArray(stats.weeklyRecords)) {
      console.log(`[명예의 전당] ${user.name} 주간 기록 없음`);
      continue;
    }

    const weekRecord = stats.weeklyRecords.find((r: any) => r.week === currentWeek);
    if (weekRecord && weekRecord.wins + weekRecord.losses >= 1) {
      // 최소 1경기 이상 플레이한 사용자만 포함
      const wins = weekRecord.wins || 0;
      const losses = weekRecord.losses || 0;
      const totalGames = wins + losses;
      // 승률 재계산 (혹시 저장된 값이 틀렸을 수 있으므로)
      const winRate = totalGames > 0 ? wins / totalGames : 0;
      
      console.log(`[명예의 전당] ${user.name} 랭킹 추가: ${wins}승 ${losses}패 (승률: ${(winRate * 100).toFixed(1)}%)`);
      
      ranking.push({
        user,
        wins,
        losses,
        winRate,
        totalGames
      });
    } else {
      console.log(`[명예의 전당] ${user.name} 현재 주 경기 기록 없음 (주간 기록:`, weekRecord, ')');
    }
  }

  console.log('[명예의 전당] 수집된 랭킹:', ranking.length, '명');
  ranking.forEach((entry, idx) => {
    console.log(`  ${idx + 1}. ${entry.user.name}: ${entry.wins}승 ${entry.losses}패 (승률: ${(entry.winRate * 100).toFixed(1)}%)`);
  });

  // 승률 기준 정렬 (동률시 총 경기 수가 많은 순)
  ranking.sort((a, b) => {
    // 승률이 동일한 경우 (0.1% 이내)
    if (Math.abs(a.winRate - b.winRate) < 0.001) {
      // 총 경기 수가 많은 순
      return b.totalGames - a.totalGames;
    }
    // 승률 높은 순
    return b.winRate - a.winRate;
  });

  console.log('[명예의 전당] 정렬 후 상위 3명:');
  ranking.slice(0, 3).forEach((entry, idx) => {
    console.log(`  ${idx + 1}위: ${entry.user.name} - ${entry.wins}승 ${entry.losses}패 (승률: ${(entry.winRate * 100).toFixed(1)}%)`);
  });

  // 1~3위만 반환
  return ranking.slice(0, 3);
};

// 1위 사용자에게 보상 카드 지급 확인
export const checkAndAwardWeeklyReward = (): {
  rewarded: boolean;
  userId?: string;
  userName?: string;
  rewardCardId?: string;
} => {
  const ranking = getCurrentWeekRanking();
  if (ranking.length === 0) {
    return { rewarded: false };
  }

  const firstPlace = ranking[0];
  const currentWeek = getWeekNumber(new Date());
  const rewardCardId = `hall-of-fame-${currentWeek}`;

  // 이미 보상을 받았는지 확인
  if (firstPlace.user.hallOfFameRewards?.includes(rewardCardId)) {
    return {
      rewarded: false,
      userId: firstPlace.user.id,
      userName: firstPlace.user.name
    };
  }

  // 보상 카드 ID만 기록 (실제 카드는 HallOfFame 컴포넌트에서 추가)
  if (!firstPlace.user.hallOfFameRewards) {
    firstPlace.user.hallOfFameRewards = [];
  }
  firstPlace.user.hallOfFameRewards.push(rewardCardId);

  return {
    rewarded: true,
    userId: firstPlace.user.id,
    userName: firstPlace.user.name,
    rewardCardId
  };
};

// 명예의 전당 보상 카드 생성
export const createHallOfFameRewardCard = (week: string) => {
  return {
    id: `hall-of-fame-${week}`,
    name: `🏆 주간 챔피언 ${week}`,
    category: 'ETC' as const,
    description: `주간 1위 보상 카드! 10 피해 + 체력 8 회복 + 방어막 5`,
    cost: 5,
    attack: 10,
    defense: 5,
    effects: [
      { type: 'HEAL' as const, value: 8, target: 'SELF' as const },
      { type: 'SHIELD' as const, value: 5, target: 'SELF' as const }
    ],
    imageUrl: '🏆',
    rarity: 'LEGENDARY' as const
  };
};

