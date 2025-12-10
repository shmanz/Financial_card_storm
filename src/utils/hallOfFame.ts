/**
 * ========================================
 * 명예의 전당 유틸리티
 * ========================================
 * 주 단위 승률 랭킹 및 보상 카드 관리
 */

import { UserProfile } from '../data/mockUsers';

// API URL 가져오기
const getApiUrl = () => {
  // 환경 변수에서 API URL 가져오기
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/$/, ''); // 끝의 슬래시 제거
  }
  
  // Socket.IO URL에서 추출 (VITE_SOCKET_URL 사용)
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';
  // Socket.IO URL에서 프로토콜과 호스트 추출 (Socket.IO는 /socket.io 경로 사용)
  const url = new URL(socketUrl);
  return `${url.protocol}//${url.host}`;
};

// 주 단위 계산
export const getWeekNumber = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

// 현재 주의 승률 랭킹 가져오기 (DB에서) - 비동기 함수로 변경
export const getCurrentWeekRanking = async (): Promise<Array<{
  user: UserProfile;
  wins: number;
  losses: number;
  winRate: number;
  totalGames: number;
}>> => {
  const currentWeek = getWeekNumber(new Date());
  const apiUrl = getApiUrl();
  
  console.log('[명예의 전당] 랭킹 조회 시작, 현재 주:', currentWeek);
  console.log('[명예의 전당] API URL:', apiUrl);
  
  try {
    // 서버 API에서 랭킹 조회
    const response = await fetch(`${apiUrl}/api/pvp/ranking?week=${currentWeek}`);
    
    if (!response.ok) {
      console.error('[명예의 전당] API 호출 실패:', response.status, response.statusText);
      // API 실패 시 빈 배열 반환
      return [];
    }
    
    const rankingData: Array<{
      userId: string;
      userName: string;
      wins: number;
      losses: number;
      winRate: number;
      totalGames: number;
    }> = await response.json();
    
    console.log('[명예의 전당] API 응답:', rankingData);
    
    // UserProfile 형식으로 변환
    const ranking = rankingData.map(entry => ({
      user: {
        id: entry.userId,
        name: entry.userName,
        email: '',
        password: '',
        registeredAt: new Date(),
        hasOpenBanking: false,
        hasHiddenCard: false,
        bankProducts: [],
        transactions: [],
        purchasedShopProducts: [],
        purchasedCards: [],
        pvpStats: {
          wins: entry.wins,
          losses: entry.losses,
          totalGames: entry.totalGames,
          winRate: entry.winRate,
          weeklyRecords: [],
          lastUpdated: new Date()
        },
        hallOfFameRewards: []
      } as UserProfile,
      wins: entry.wins,
      losses: entry.losses,
      winRate: entry.winRate,
      totalGames: entry.totalGames
    }));
    
    console.log('[명예의 전당] 변환된 랭킹:', ranking.length, '명');
    ranking.forEach((entry, idx) => {
      console.log(`  ${idx + 1}위: ${entry.user.name} - ${entry.wins}승 ${entry.losses}패 (승률: ${(entry.winRate * 100).toFixed(1)}%)`);
    });
    
    return ranking;
  } catch (error) {
    console.error('[명예의 전당] 랭킹 조회 에러:', error);
    // 에러 발생 시 빈 배열 반환
    return [];
  }
};

// 1위 사용자에게 보상 카드 지급 확인 (비동기로 변경)
export const checkAndAwardWeeklyReward = async (): Promise<{
  rewarded: boolean;
  userId?: string;
  userName?: string;
  rewardCardId?: string;
}> => {
  const ranking = await getCurrentWeekRanking();
  if (ranking.length === 0) {
    return { rewarded: false };
  }

  const firstPlace = ranking[0];
  const currentWeek = getWeekNumber(new Date());
  const rewardCardId = `hall-of-fame-${currentWeek}`;

  // DB에서 보상 받았는지 확인 (나중에 구현)
  // 현재는 클라이언트에서 처리하도록 함
  
  return {
    rewarded: false, // HallOfFame 컴포넌트에서 직접 처리
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

