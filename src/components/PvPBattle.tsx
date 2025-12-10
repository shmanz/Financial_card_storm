/**
 * ========================================
 * PvP 실제 전투 화면 (Socket.IO 실시간 동기화)
 * ========================================
 * 
 * 주요 개선사항:
 * 1. 보스 AI 로직 완전 제거
 * 2. 플레이어 vs 플레이어만 존재
 * 3. 턴 종료 시 상대에게만 턴 넘김
 * 4. 실시간 상태 동기화
 */

import React, { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { HeroPanel } from './HeroPanel';
import { HandArea } from './HandArea';
import { EnergyBar } from './EnergyBar';
import { GameLog } from './GameLog';
import { motion } from 'framer-motion';
import { GameState, StatusEffect } from '../types/game';

interface PvPBattleProps {
  socket: Socket | null;
  roomId: string;
  isMyTurn: boolean;
  gameState: GameState;
  opponentName: string;
  hasHiddenCard: boolean; // 히든 카드 보유 여부
  onPlayCard: (cardId: string) => void;
  onEndTurn: () => void;
  onTurnReceived: () => void;
  onReceiveDamage: (damage: number, effects: any[]) => void;
  onUpdateMyHp: (hp: number, shield: number) => void;
  onUpdateOpponentHp: (hp: number, shield: number) => void;
  onOpenBanking: () => void; // 오픈뱅킹 팝업 열기
  onBack: () => void;
}

export const PvPBattle: React.FC<PvPBattleProps> = ({
  socket,
  roomId,
  isMyTurn,
  gameState,
  opponentName,
  hasHiddenCard,
  onPlayCard,
  onEndTurn,
  onTurnReceived,
  onReceiveDamage,
  onUpdateMyHp,
  onUpdateOpponentHp,
  onOpenBanking,
  onBack
}) => {
  const { currentUser, updatePvPStats } = useAuth();
  
  // 상대 플레이어 상태
  const [opponentHp, setOpponentHp] = useState(20);
  const [opponentMaxHp] = useState(20);
  const [opponentShield, setOpponentShield] = useState(0);
  const [opponentStatusEffects, setOpponentStatusEffects] = useState<StatusEffect[]>([]);
  const [opponentEnergy, setOpponentEnergy] = useState(1);
  
  // 애니메이션 이펙트 상태
  const [opponentDamageEffect, setOpponentDamageEffect] = useState(0);
  const [opponentHealEffect, setOpponentHealEffect] = useState(0);
  const [opponentShieldEffect, setOpponentShieldEffect] = useState(0);
  const [myDamageEffect, setMyDamageEffect] = useState(0);
  const [myHealEffect, setMyHealEffect] = useState(0);
  const [myShieldEffect, setMyShieldEffect] = useState(0);
  
  // 이전 HP 추적 (변화 감지용)
  const prevOpponentHp = React.useRef(20);
  const prevOpponentShield = React.useRef(0);
  const prevMyHp = React.useRef(20);
  const prevMyShield = React.useRef(0);
  
  // 초기화
  useEffect(() => {
    prevOpponentHp.current = opponentHp;
    prevMyHp.current = gameState.playerHp;
    prevOpponentShield.current = opponentShield;
    prevMyShield.current = gameState.playerShield;
  }, []);

  useEffect(() => {
    if (!socket) return;

    // ========================================
    // Socket 이벤트: 상대 전체 상태 수신 (통합)
    // ========================================
    
    socket.on('game:stateSync', (data) => {
      console.log('========================================');
      console.log('[PvP] 🔄 상대 상태 동기화 수신!');
      console.log('[PvP] 상대 HP:', data.hp);
      console.log('[PvP] 상대 Shield:', data.shield);
      console.log('[PvP] 상대 Energy:', data.energy);
      console.log('[PvP] bossHp (내 HP를 상대가 봄):', data.bossHp);
      console.log('========================================');
      
      // ========================================
      // 핵심: data.bossHp = 내 실제 HP!
      // ========================================
      // 상대가 나를 공격 → 상대의 bossHp 감소 → 그게 내 playerHp
      // 무한 루프 방지: 현재 HP와 다를 때만 업데이트
      if (data.bossHp !== undefined && data.bossHp !== gameState.playerHp) {
        const newMyHp = data.bossHp;
        const newMyShield = data.bossShield || 0;
        
        console.log('========================================');
        console.log('[PvP] 🔥🔥🔥 내 HP 업데이트!!!');
        console.log('[PvP] 현재 내 HP:', gameState.playerHp);
        console.log('[PvP] 새로운 내 HP:', newMyHp);
        console.log('[PvP] 현재 내 실드:', gameState.playerShield);
        console.log('[PvP] 새로운 내 실드:', newMyShield);
        console.log('========================================');
        
        onUpdateMyHp(newMyHp, newMyShield);
      } else if (data.bossHp !== undefined) {
        console.log('[PvP] ⏭️ HP 변경 없음, 업데이트 스킵 (무한 루프 방지)');
      }
      
      // 상대의 실제 HP/실드 (상대의 playerHp)
      if (data.hp !== undefined && data.hp !== opponentHp) {
        console.log('[PvP] 상대 HP 설정:', data.hp, '(화면 상단 보스 HP로 표시됨)');
        setOpponentHp(data.hp);
        onUpdateOpponentHp(data.hp, data.shield || 0);
      }
      if (data.shield !== undefined && data.shield !== opponentShield) {
        setOpponentShield(data.shield);
      }
      if (data.statusEffects) {
        setOpponentStatusEffects(data.statusEffects);
      }
      if (data.energy !== undefined && data.energy !== opponentEnergy) {
        setOpponentEnergy(data.energy);
      }
    });

    // ========================================
    // Socket 이벤트: 상대가 턴 종료
    // ========================================
    
    socket.on('game:turnEnded', (data) => {
      console.log('[PvP] 상대가 턴을 종료했습니다:', data);
      setOpponentHp(data.hp);
      setOpponentShield(data.shield);
      setOpponentStatusEffects(data.statusEffects || []);
      setOpponentEnergy(data.energy);
      
      // 내 턴 시작 (매 턴마다 에너지 +1, 카드 드로우 +1)
      onTurnReceived();
    });

    // ========================================
    // Socket 이벤트: 상대가 카드 사용
    // ========================================
    
    socket.on('game:cardPlayed', (data) => {
      console.log('========================================');
      console.log('[PvP] ✅ game:cardPlayed 이벤트 수신!');
      console.log('[PvP] 전체 데이터:', JSON.stringify(data, null, 2));
      console.log('[PvP] damage:', data.damage);
      console.log('[PvP] attackerHp:', data.attackerHp);
      console.log('[PvP] attackerShield:', data.attackerShield);
      console.log('========================================');
      
      // 상대 상태 업데이트 (상대가 회복/실드 등을 받았을 수 있음)
      if (data.attackerHp !== undefined) {
        const newHp = data.attackerHp;
        const newShield = data.attackerShield || 0;
        
        // HP 변화 감지
        if (newHp > prevOpponentHp.current) {
          const heal = newHp - prevOpponentHp.current;
          setOpponentHealEffect(heal);
        }
        
        // 실드 변화 감지
        if (newShield > prevOpponentShield.current) {
          const shieldGain = newShield - prevOpponentShield.current;
          setOpponentShieldEffect(shieldGain);
        }
        
        prevOpponentHp.current = newHp;
        prevOpponentShield.current = newShield;
        
        console.log('[PvP] 상대(공격자) 상태 업데이트 - HP:', newHp, 'Shield:', newShield);
        setOpponentHp(newHp);
        setOpponentShield(newShield);
      }
      
      // 상대가 준 피해를 내가 받음 - 무조건 호출!
      const damage = data.damage || 0;
      console.log('[PvP] 🔥 피해 적용 함수 호출! damage:', damage);
      
      // 피해 이펙트 트리거
      if (damage > 0) {
        setMyDamageEffect(damage);
      }
      
      onReceiveDamage(damage, []); // effects는 빈 배열
    });

    // ========================================
    // Socket 이벤트: 게임 종료
    // ========================================
    
    socket.on('game:end', (data) => {
      console.log('[PvP] 게임 종료:', data.winner);
      // 승패 처리
      // data.winner가 'player1' 또는 'player2'일 수 있음
      // 현재 사용자가 이겼는지 확인해야 함
    });

    // ========================================
    // Socket 이벤트: 라운드 완료 (양쪽 에너지 증가)
    // ========================================
    
    socket.on('game:roundComplete', (data) => {
      console.log('[PvP] 라운드 완료:', data);
      // 에너지 증가는 START_MY_TURN 액션으로 처리됨
    });

    // ========================================
    // Socket 이벤트: 상대가 나갔을 때
    // ========================================
    
    socket.on('game:playerLeft', (data) => {
      console.log('[PvP] 상대가 나갔습니다:', data);
      alert('상대방이 게임을 떠났습니다. 로비로 돌아갑니다.');
      onBack();
    });

    return () => {
      socket.off('game:stateSync');
      socket.off('game:turnEnded');
      socket.off('game:cardPlayed');
      socket.off('game:end');
      socket.off('game:roundComplete');
      socket.off('game:playerLeft');
    };
  }, [socket, onTurnReceived, gameState.playerHp, opponentHp, opponentShield, opponentEnergy, onReceiveDamage]);
  
  // 내 HP/실드 변화 감지 (카드 사용 후)
  useEffect(() => {
    const hpDiff = gameState.playerHp - prevMyHp.current;
    const shieldDiff = gameState.playerShield - prevMyShield.current;
    
    if (hpDiff > 0) {
      setMyHealEffect(hpDiff);
    }
    if (shieldDiff > 0) {
      setMyShieldEffect(shieldDiff);
    }
    
    prevMyHp.current = gameState.playerHp;
    prevMyShield.current = gameState.playerShield;
  }, [gameState.playerHp, gameState.playerShield]);
  
  // 상대 HP 감소 감지 (내가 공격할 때 - gameState.bossHp 변화)
  useEffect(() => {
    if (gameState.bossHp < prevOpponentHp.current && isMyTurn) {
      const damage = prevOpponentHp.current - gameState.bossHp;
      setOpponentDamageEffect(damage);
      // 상대 HP 상태도 업데이트 (애니메이션과 동기화)
      setOpponentHp(gameState.bossHp);
    }
    prevOpponentHp.current = gameState.bossHp;
  }, [gameState.bossHp, isMyTurn]);
  
  // stateSync로 받은 상대 HP 변화 감지
  useEffect(() => {
    if (opponentHp !== prevOpponentHp.current) {
      // stateSync로 받은 경우는 애니메이션 없이 업데이트만
      prevOpponentHp.current = opponentHp;
    }
  }, [opponentHp]);
  
  // 게임 종료 시 승/패 기록 (PvP 모드만) - 한 번만 실행
  const recordedGameRef = useRef<string | null>(null);
  useEffect(() => {
    if (gameState.isGameOver && gameState.winner && updatePvPStats && currentUser) {
      // Guest 사용자는 기록하지 않음
      if (currentUser.id.includes('guest')) return;
      
      // 이미 기록한 게임인지 확인 (게임 ID = roomId + turn + winner)
      const gameId = `${roomId}-${gameState.turn}-${gameState.winner}`;
      if (recordedGameRef.current === gameId) {
        console.log('[PvP] 이미 기록된 게임, 스킵');
        return;
      }
      
      const won = gameState.winner === 'PLAYER';
      console.log('[PvP] 승/패 기록 시작:', won ? '승리' : '패배', 'gameId:', gameId);
      updatePvPStats(won);
      recordedGameRef.current = gameId;
      console.log('[PvP] 승/패 기록 완료:', won ? '승리' : '패배');
    }
  }, [gameState.isGameOver, gameState.winner, gameState.turn, roomId, updatePvPStats, currentUser]);

  // ========================================
  // 내 상태를 상대에게 실시간 전송 (무한 루프 방지)
  // ========================================
  // 주의: game:stateSync 수신으로 인한 HP 변경은 emit하지 않음
  // 카드 사용, 턴 종료 등 실제 액션 시에만 전송
  
  const lastSyncRef = useRef<{ hp: number; shield: number; energy: number } | null>(null);
  
  useEffect(() => {
    if (!socket || !isMyTurn) return; // 내 턴일 때만 전송
    
    const currentState = {
      hp: gameState.playerHp,
      shield: gameState.playerShield,
      energy: gameState.currentEnergy
    };
    
    // 이전 상태와 비교하여 실제 변경이 있을 때만 전송
    const lastState = lastSyncRef.current;
    if (lastState && 
        lastState.hp === currentState.hp &&
        lastState.shield === currentState.shield &&
        lastState.energy === currentState.energy) {
      return; // 변경 없음, 전송 안 함
    }
    
    // 상태 저장
    lastSyncRef.current = currentState;
    
    // 상대에게 전송 (bossHp는 내가 본 상대 HP)
    socket.emit('game:stateSync', {
      hp: gameState.playerHp,
      shield: gameState.playerShield,
      statusEffects: gameState.playerStatusEffects,
      energy: gameState.currentEnergy,
      bossHp: gameState.bossHp, // 내가 본 상대 HP
      bossShield: gameState.bossShield
    });
    
    console.log('[PvP] 내 상태 전송:', currentState);
  }, [socket, isMyTurn, gameState.playerHp, gameState.playerShield, gameState.currentEnergy, gameState.bossHp, gameState.bossShield]);

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 z-10 flex h-screen max-h-screen flex-col gap-1 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-1 sm:gap-3 sm:p-4">
      <style>{`
        /* 버튼 영역이 항상 보이도록 보장 */
        .pvp-action-buttons {
          flex-shrink: 0 !important;
          min-width: fit-content !important;
        }
        /* 나가기 버튼이 항상 보이도록 */
        .pvp-action-buttons button {
          flex-shrink: 0 !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* 상단: 상대 플레이어 (기존 보스 위치) */}
      <section className="flex items-start justify-between gap-1.5 flex-shrink-0 sm:gap-3">
        <div className="flex-1 min-w-0">
          <HeroPanel
            isBoss
            name={opponentName}
            hp={opponentHp}
            maxHp={opponentMaxHp}
            shield={opponentShield}
            statusEffects={opponentStatusEffects}
            description="상대 플레이어"
            damageEffect={opponentDamageEffect}
            healEffect={opponentHealEffect}
            shieldEffect={opponentShieldEffect}
          />
        </div>
        <div className="text-right text-[9px] text-slate-300 flex-shrink-0 sm:text-[11px]">
          <div className="font-semibold">턴 {gameState.turn}</div>
          <div className={`font-bold text-[10px] sm:text-sm ${isMyTurn ? 'text-cyan-300' : 'text-rose-300'}`}>
            {isMyTurn ? '⚔️' : '⏳'}
          </div>
          <div className="mt-0.5 text-[8px] sm:text-[10px]">E:{opponentEnergy}</div>
          <div className="mt-0.5 text-[8px] sm:text-[10px]">D:{gameState.deck.length}</div>
        </div>
      </section>

      {/* 중앙: 전장 + 사이드바 */}
      <section className="flex flex-1 min-h-0 flex-col gap-1 sm:gap-3 md:flex-row overflow-x-hidden overflow-y-auto items-start">
        {/* 전장 + 로그 */}
        <div className="flex flex-1 min-h-0 flex-col space-y-1 sm:space-y-3">
          <div className="rounded-lg border border-slate-700/80 bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950 p-1 flex-shrink-0 sm:rounded-2xl sm:p-3">
            <div className="flex h-12 items-center justify-center rounded border border-dashed border-slate-700 bg-slate-900/70 sm:h-32 sm:rounded-xl">
              {isMyTurn ? (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                >
                  <div className="text-base sm:text-2xl">⚔️</div>
                  <div className="mt-0.5 text-[9px] font-semibold text-cyan-300 sm:mt-2 sm:text-sm">
                    내 턴
                  </div>
                </motion.div>
              ) : (
                <div className="text-center">
                  <div className="text-base text-slate-600 sm:text-2xl">⏳</div>
                  <div className="mt-0.5 text-[9px] text-slate-400 sm:mt-2 sm:text-sm">
                    대기 중...
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <GameLog entries={gameState.log} />
          </div>
        </div>

        {/* 우측: 에너지 + 행동 */}
        <div className="pvp-action-buttons flex w-full flex-row gap-1 flex-shrink-0 sm:gap-3 md:w-52 md:flex-col relative z-20 self-start">
          <div className="h-24 w-16 flex-shrink-0 sm:h-40 sm:w-24 md:h-auto md:w-full">
            <EnergyBar current={gameState.currentEnergy} max={gameState.maxEnergy} />
          </div>
          <div className="flex flex-shrink-0 flex-col gap-1 rounded-lg border border-slate-700/80 bg-slate-900/90 p-1.5 text-[9px] sm:gap-2 sm:rounded-2xl sm:p-3 sm:text-[11px] min-w-[80px] sm:min-w-[120px] md:min-w-0 overflow-visible h-auto">
            <button
              type="button"
              onClick={onEndTurn}
              disabled={!isMyTurn || gameState.isGameOver}
              className="w-full flex-shrink-0 rounded-md bg-amber-500 px-2 py-1.5 text-[9px] font-semibold text-slate-950 shadow hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 sm:px-3 sm:py-2 sm:text-xs touch-manipulation whitespace-nowrap"
            >
              {isMyTurn ? '턴 종료' : '대기'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full flex-shrink-0 rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-[9px] font-semibold text-slate-100 hover:bg-slate-800 sm:px-3 sm:py-1.5 sm:text-[11px] touch-manipulation whitespace-nowrap relative z-30"
            >
              로비로 나가기
            </button>
          </div>
        </div>
      </section>

      {/* 하단: 나 + 손패 */}
      <section className="rounded-lg bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/80 p-1 flex-shrink-0 sm:rounded-2xl sm:p-3 relative z-10">
        <div className="mb-1 flex items-center justify-between gap-1.5 sm:mb-2 sm:gap-3">
          <div className="w-40 max-w-full sm:w-64">
            <HeroPanel
              name={currentUser.name}
              hp={gameState.playerHp}
              maxHp={gameState.playerMaxHp}
              shield={gameState.playerShield}
              statusEffects={gameState.playerStatusEffects}
              description="당신"
              damageEffect={myDamageEffect}
              healEffect={myHealEffect}
              shieldEffect={myShieldEffect}
            />
          </div>
        </div>
        <HandArea
          hand={gameState.hand}
          currentEnergy={gameState.currentEnergy}
          onPlayCard={(cardId) => {
            console.log('[HandArea] 카드 클릭:', cardId, 'isMyTurn:', isMyTurn);
            if (isMyTurn && !gameState.isGameOver) {
              onPlayCard(cardId);
            } else if (!isMyTurn) {
              console.log('[차단] 상대 턴입니다');
            }
          }}
        />
      </section>

      {/* 게임 종료 모달 */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-2xl border border-cyan-500/70 bg-slate-900 p-5 text-center shadow-xl">
            <div className="mb-3 text-lg font-bold text-slate-50">
              {gameState.winner === 'PLAYER' ? '🎉 승리!' : '😢 패배'}
            </div>
            <p className="mb-4 text-sm text-slate-200">
              {gameState.winner === 'PLAYER'
                ? '상대를 물리쳤습니다!'
                : '더 강해져서 돌아오세요'}
            </p>
            
            
            {/* 패배 시 오픈뱅킹 버튼 */}
            {gameState.winner === 'BOSS' && !hasHiddenCard && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log('[PvP 패배] 오픈뱅킹 버튼 클릭!');
                    console.log('[PvP 패배] hasHiddenCard:', hasHiddenCard);
                    console.log('[PvP 패배] winner:', gameState.winner);
                    onOpenBanking();
                  }}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 mb-2"
                >
                  🏦 신한은행 추가 상품으로 역전하기
                </button>
                <div className="text-xs text-blue-300">
                  💎 히든 카드를 받고 다시 도전하세요!
                </div>
              </div>
            )}
            
            {/* 이미 히든 카드 보유 시 */}
            {gameState.winner === 'BOSS' && hasHiddenCard && (
              <div className="mb-4 rounded-lg border border-cyan-500/50 bg-cyan-900/20 p-3">
                <div className="text-xs text-cyan-200">
                  💎 이미 히든 카드를 보유하고 있습니다!
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={onBack}
              className="rounded-md bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
            >
              로비로
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
