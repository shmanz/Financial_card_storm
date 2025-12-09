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

import React, { useEffect, useState } from 'react';
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
  const { currentUser } = useAuth();
  
  // 상대 플레이어 상태
  const [opponentHp, setOpponentHp] = useState(20);
  const [opponentMaxHp] = useState(20);
  const [opponentShield, setOpponentShield] = useState(0);
  const [opponentStatusEffects, setOpponentStatusEffects] = useState<StatusEffect[]>([]);
  const [opponentEnergy, setOpponentEnergy] = useState(1);

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
      if (data.bossHp !== undefined) {
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
      }
      
      // 상대의 실제 HP/실드 (상대의 playerHp)
      if (data.hp !== undefined) {
        console.log('[PvP] 상대 HP 설정:', data.hp, '(화면 상단 보스 HP로 표시됨)');
        setOpponentHp(data.hp);
        onUpdateOpponentHp(data.hp, data.shield || 0);
      }
      if (data.shield !== undefined) {
        setOpponentShield(data.shield);
      }
      if (data.statusEffects) {
        setOpponentStatusEffects(data.statusEffects);
      }
      if (data.energy !== undefined) {
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
        console.log('[PvP] 상대(공격자) 상태 업데이트 - HP:', data.attackerHp, 'Shield:', data.attackerShield);
        setOpponentHp(data.attackerHp);
        setOpponentShield(data.attackerShield || 0);
      }
      
      // 상대가 준 피해를 내가 받음 - 무조건 호출!
      console.log('[PvP] 🔥 피해 적용 함수 호출! damage:', data.damage);
      onReceiveDamage(data.damage || 0, []); // effects는 빈 배열
    });

    // ========================================
    // Socket 이벤트: 게임 종료
    // ========================================
    
    socket.on('game:end', (data) => {
      console.log('[PvP] 게임 종료:', data.winner);
      // 승패 처리
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
  }, [socket, onTurnReceived]);

  // ========================================
  // 내 상태를 상대에게 실시간 전송
  // ========================================
  
  useEffect(() => {
    if (!socket) return;
    
    socket.emit('game:syncState', {
      hp: gameState.playerHp,
      shield: gameState.playerShield,
      statusEffects: gameState.playerStatusEffects,
      energy: gameState.currentEnergy
    });
  }, [socket, gameState.playerHp, gameState.playerShield, gameState.currentEnergy]);

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* 디버그 정보 */}
      <div className="rounded border border-purple-500/50 bg-purple-900/20 p-2 text-xs text-purple-200">
        <strong>PvP 디버그:</strong> 내 턴 = {isMyTurn ? 'YES' : 'NO'} | 턴 #{gameState.turn} | 모드 = {gameState.gameMode} | 피로도 = {gameState.fatigue}
      </div>

      {/* 상단: 상대 플레이어 (기존 보스 위치) */}
      <section className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <HeroPanel
            isBoss
            name={opponentName}
            hp={opponentHp}
            maxHp={opponentMaxHp}
            shield={opponentShield}
            statusEffects={opponentStatusEffects}
            description="상대 플레이어"
          />
        </div>
        <div className="text-right text-[11px] text-slate-300">
          <div>턴 {gameState.turn}</div>
          <div className={`font-semibold ${isMyTurn ? 'text-cyan-300' : 'text-rose-300'}`}>
            {isMyTurn ? '⚔️ 내 턴!' : '⏳ 상대 턴'}
          </div>
          <div className="mt-1 text-[10px]">상대 에너지: {opponentEnergy}</div>
          <div className="mt-1 text-[10px]">덱: {gameState.deck.length}장</div>
          {gameState.fatigue > 0 && (
            <div className="mt-1 text-red-400 font-semibold text-[10px]">
              ⚠️ 피로도: {gameState.fatigue}
            </div>
          )}
        </div>
      </section>

      {/* 중앙: 전장 + 사이드바 */}
      <section className="flex flex-1 flex-col gap-3 md:flex-row">
        {/* 전장 + 로그 */}
        <div className="flex-1 space-y-3">
          <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950 p-3">
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70">
              {isMyTurn ? (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                >
                  <div className="text-2xl">⚔️</div>
                  <div className="mt-2 text-sm font-semibold text-cyan-300">
                    당신의 턴입니다!
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    카드를 사용하거나 턴을 종료하세요
                  </div>
                </motion.div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl text-slate-600">⏳</div>
                  <div className="mt-2 text-sm text-slate-400">
                    상대의 턴을 기다리는 중...
                  </div>
                </div>
              )}
            </div>
          </div>
          <GameLog entries={gameState.log} />
        </div>

        {/* 우측: 에너지 + 행동 */}
        <div className="flex w-full flex-row gap-3 md:w-52 md:flex-col">
          <div className="h-40 w-24 md:h-auto md:w-full">
            <EnergyBar current={gameState.currentEnergy} max={gameState.maxEnergy} />
          </div>
          <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-3 text-[11px]">
            <button
              type="button"
              onClick={onEndTurn}
              disabled={!isMyTurn || gameState.isGameOver}
              className="w-full rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              {isMyTurn ? '턴 종료' : '상대 턴 대기 중'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-slate-800"
            >
              나가기
            </button>
            <div className="mt-2 text-[9px] text-slate-500">
              PvP 모드에서는 보스 AI가 없습니다. 상대 플레이어와만 대결합니다.
            </div>
          </div>
        </div>
      </section>

      {/* 하단: 나 + 손패 */}
      <section className="rounded-2xl bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/80 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="w-64 max-w-full">
            <HeroPanel
              name={currentUser.name}
              hp={gameState.playerHp}
              maxHp={gameState.playerMaxHp}
              shield={gameState.playerShield}
              statusEffects={gameState.playerStatusEffects}
              description="당신"
            />
          </div>
          <div className="text-right text-[10px] text-slate-300">
            {isMyTurn ? '카드를 사용하세요' : '상대의 턴입니다'}
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
            
            {/* 디버그 정보 */}
            <div className="mb-3 rounded bg-slate-800/50 p-2 text-xs text-left text-slate-400">
              <div>승자: {gameState.winner}</div>
              <div>히든카드 보유: {hasHiddenCard ? 'YES' : 'NO'}</div>
              <div>버튼 표시 조건: {gameState.winner === 'BOSS' && !hasHiddenCard ? 'TRUE' : 'FALSE'}</div>
            </div>
            
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
