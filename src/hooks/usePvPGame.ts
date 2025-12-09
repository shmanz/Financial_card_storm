/**
 * ========================================
 * PvP 게임 동기화 훅
 * ========================================
 * 
 * 핵심 원리:
 * 1. 각 플레이어는 로컬에서 카드 효과 적용
 * 2. 변경된 전체 상태를 Socket으로 전송
 * 3. 상대는 받은 상태로 화면 업데이트
 */

import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '../types/game';

interface UsePvPGameProps {
  socket: Socket | null;
  roomId: string;
  gameState: GameState;
  isMyTurn: boolean;
  onOpponentStateUpdate: (opponentState: Partial<GameState>) => void;
  onTurnChanged: (isMyTurn: boolean) => void;
  onPlayerLeft: () => void;
}

export const usePvPGame = ({
  socket,
  roomId,
  gameState,
  isMyTurn,
  onOpponentStateUpdate,
  onTurnChanged,
  onPlayerLeft
}: UsePvPGameProps) => {
  
  useEffect(() => {
    if (!socket || !roomId) return;

    console.log('[usePvPGame] Socket 이벤트 등록');

    // ========================================
    // 상대의 전체 상태 수신
    // ========================================
    socket.on('game:stateSync', (data) => {
      console.log('[PvP Sync] 상대 상태 수신:', data);
      onOpponentStateUpdate({
        playerHp: data.hp,
        playerShield: data.shield,
        playerStatusEffects: data.statusEffects,
        currentEnergy: data.energy,
        turn: data.turn
      });
    });

    // ========================================
    // 턴 전환
    // ========================================
    socket.on('game:turnChanged', (data) => {
      console.log('[PvP Sync] 턴 전환:', data.currentTurn, '내 ID:', socket.id);
      const myTurn = data.currentTurn === socket.id;
      onTurnChanged(myTurn);
    });

    // ========================================
    // 상대 나가기
    // ========================================
    socket.on('game:playerLeft', (data) => {
      console.log('[PvP Sync] 상대가 나갔습니다');
      onPlayerLeft();
    });

    return () => {
      socket.off('game:stateSync');
      socket.off('game:turnChanged');
      socket.off('game:playerLeft');
    };
  }, [socket, roomId, onOpponentStateUpdate, onTurnChanged, onPlayerLeft]);

  // ========================================
  // 내 상태를 상대에게 실시간 전송
  // ========================================
  const syncMyState = () => {
    if (!socket) return;

    console.log('[PvP Sync] 내 상태 전송:', {
      hp: gameState.playerHp,
      shield: gameState.playerShield,
      energy: gameState.currentEnergy
    });

    socket.emit('game:stateSync', {
      hp: gameState.playerHp,
      shield: gameState.playerShield,
      statusEffects: gameState.playerStatusEffects,
      energy: gameState.currentEnergy,
      turn: gameState.turn
    });
  };

  // ========================================
  // 턴 종료 알림
  // ========================================
  const endMyTurn = () => {
    if (!socket) return;

    console.log('[PvP Sync] 턴 종료 알림 전송');
    
    // 최신 상태 전송
    syncMyState();
    
    // 턴 종료 이벤트
    socket.emit('game:endTurn');
  };

  return {
    syncMyState,
    endMyTurn
  };
};





