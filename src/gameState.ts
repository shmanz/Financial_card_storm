/**
 * ========================================
 * PART 3: 게임 상태 관리 (고도화된 효과 시스템)
 * ========================================
 */

import { Card, GameState, StatusEffect, CardEffect } from './types/game';

const PLAYER_MAX_HP = 20;
const BOSS_MAX_HP = 20;
const BOSS_ATTACK = 2;
const MAX_ENERGY_CAP = 10;

export type GameAction =
  | { type: 'INIT_GAME'; payload: { deck: Card[]; mode?: 'SINGLE' | 'PVP' } }
  | { type: 'PLAY_CARD'; payload: { cardId: string } }
  | { type: 'END_TURN'; payload?: { mode?: 'SINGLE' | 'PVP' } }
  | { type: 'RESTART'; payload: { deck: Card[]; mode?: 'SINGLE' | 'PVP' } }
  | { type: 'OPPONENT_ACTION'; payload: { opponentHp: number; opponentShield: number } }
  | { type: 'RECEIVE_PVP_DAMAGE'; payload: { damage: number; shield: number } }
  | { type: 'UPDATE_MY_HP_FROM_OPPONENT'; payload: { myHp: number; myShield: number } } // 상대가 계산한 내 HP 반영
  | { type: 'START_MY_TURN'; payload?: { increaseEnergy?: boolean } };

// Util: simple shuffle
const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Draw one card from deck to hand (with fatigue support).
const drawOne = (
  deck: Card[], 
  hand: Card[], 
  fatigue: number, 
  playerHp: number
): { 
  deck: Card[]; 
  hand: Card[]; 
  fatigue: number; 
  playerHp: number; 
  fatigueMessage?: string 
} => {
  if (deck.length === 0) {
    // 덱이 비었을 때 피로도 증가
    const newFatigue = fatigue + 1;
    const fatigueDamage = newFatigue;
    const newHp = Math.max(0, playerHp - fatigueDamage);
    
    return { 
      deck, 
      hand, 
      fatigue: newFatigue, 
      playerHp: newHp,
      fatigueMessage: `⚠️ 피로도 ${newFatigue}! ${fatigueDamage} 피해를 받았습니다. (HP: ${playerHp} → ${newHp})`
    };
  }
  
  const [top, ...rest] = deck;
  return { 
    deck: rest, 
    hand: [...hand, top], 
    fatigue, 
    playerHp 
  };
};

// Draw multiple cards
const drawCards = (
  deck: Card[],
  hand: Card[],
  count: number,
  fatigue: number,
  playerHp: number
): { 
  deck: Card[]; 
  hand: Card[]; 
  fatigue: number; 
  playerHp: number;
  fatigueMessages: string[];
} => {
  let newDeck = deck;
  let newHand = hand;
  let newFatigue = fatigue;
  let newHp = playerHp;
  const fatigueMessages: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const result = drawOne(newDeck, newHand, newFatigue, newHp);
    newDeck = result.deck;
    newHand = result.hand;
    newFatigue = result.fatigue;
    newHp = result.playerHp;
    if (result.fatigueMessage) {
      fatigueMessages.push(result.fatigueMessage);
    }
  }
  return { deck: newDeck, hand: newHand, fatigue: newFatigue, playerHp: newHp, fatigueMessages };
};

// Discard cards from hand
const discardCards = (hand: Card[], count: number): Card[] => {
  const toDiscard = Math.min(count, hand.length);
  return hand.slice(toDiscard);
};

/**
 * ========================================
 * 효과 적용 시스템
 * ========================================
 */
const applyCardEffects = (
  state: GameState,
  card: Card,
  isPlayer: boolean
): GameState => {
  let newState = { ...state };

  for (const effect of card.effects) {
    const target = effect.target || 'ENEMY';
    const targetSelf = (isPlayer && target === 'SELF') || (!isPlayer && target === 'ENEMY');

    switch (effect.type) {
      case 'DAMAGE': {
        // DAMAGE 효과는 이제 card.attack에 포함되어 있으므로
        // 여기서는 처리하지 않음 (중복 방지!)
        // 특수한 경우(999 등)만 처리
        if (effect.value === 999) {
          const damage = newState.currentEnergy * 2;
          if (!targetSelf) {
            const actualDamage = Math.max(0, damage - newState.bossShield);
            newState.bossShield = Math.max(0, newState.bossShield - damage);
            newState.bossHp = Math.max(0, newState.bossHp - actualDamage);
            newState.log = [...newState.log, `특수 효과: ${damage} 피해!`];
          }
        }
        break;
      }

      case 'HEAL': {
        if (targetSelf) {
          newState.playerHp = Math.min(newState.playerMaxHp, newState.playerHp + effect.value);
        } else {
          newState.bossHp = Math.min(newState.bossMaxHp, newState.bossHp + effect.value);
        }
        newState.log = [
          ...newState.log,
          `${targetSelf ? (isPlayer ? '플레이어' : '보스') : isPlayer ? '보스' : '플레이어'}가 체력 ${effect.value} 회복했습니다.`
        ];
        break;
      }

      case 'SHIELD': {
        if (targetSelf) {
          newState.playerShield += effect.value;
        } else {
          newState.bossShield += effect.value;
        }
        newState.log = [
          ...newState.log,
          `방어막 ${effect.value}을 얻었습니다.`
        ];
        break;
      }

      case 'ENERGY_BUFF': {
        if (isPlayer) {
          newState.currentEnergy = Math.min(
            newState.maxEnergy,
            newState.currentEnergy + effect.value
          );
          newState.log = [...newState.log, `에너지 ${effect.value}를 즉시 얻었습니다.`];
        }
        break;
      }

      case 'DRAW': {
        if (isPlayer) {
          const result = drawCards(newState.deck, newState.hand, effect.value, newState.fatigue, newState.playerHp);
          newState.deck = result.deck;
          newState.hand = result.hand;
          newState.fatigue = result.fatigue;
          newState.playerHp = result.playerHp;
          newState.log = [...newState.log, `카드 ${effect.value}장을 드로우했습니다.`, ...result.fatigueMessages];
        }
        break;
      }

      case 'DISCARD': {
        if (isPlayer) {
          const count = effect.value === 999 ? newState.hand.length : effect.value;
          newState.hand = discardCards(newState.hand, count);
          newState.log = [...newState.log, `카드 ${count}장을 버렸습니다.`];
        }
        break;
      }

      case 'STUN':
      case 'ATTACK_BUFF':
      case 'ATTACK_DEBUFF':
      case 'DAMAGE_REDUCTION':
      case 'ENERGY_NEXT_TURN':
      case 'DOT_DAMAGE':
      case 'HOT_HEAL': {
        // 버프/디버프는 StatusEffect로 추가
        const statusEffect: StatusEffect = {
          type: effect.type,
          value: effect.value,
          remainingTurns: effect.duration || 1,
          source: card.id
        };

        if (targetSelf) {
          newState.playerStatusEffects = [...newState.playerStatusEffects, statusEffect];
        } else {
          newState.bossStatusEffects = [...newState.bossStatusEffects, statusEffect];
        }
        newState.log = [
          ...newState.log,
          `${effect.type} 효과가 ${effect.duration || 1}턴간 적용되었습니다.`
        ];
        break;
      }

      case 'CLEANSE': {
        if (targetSelf) {
          const before = newState.playerStatusEffects.length;
          newState.playerStatusEffects = effect.value === 999 ? [] : newState.playerStatusEffects.slice(0, -effect.value);
          newState.log = [...newState.log, `디버프 ${before - newState.playerStatusEffects.length}개를 제거했습니다.`];
        }
        break;
      }

      case 'CARD_COST_REDUCTION': {
        // 손패 랜덤 카드 비용 감소 (UI에서 처리 필요)
        newState.log = [...newState.log, `손패 카드 비용이 ${effect.value} 감소했습니다.`];
        break;
      }

      case 'ENERGY_STEAL': {
        const steal = effect.value === 999 ? newState.currentEnergy : effect.value;
        if (!isPlayer) {
          newState.currentEnergy = Math.max(0, newState.currentEnergy - steal);
        }
        newState.log = [...newState.log, `에너지 ${steal}를 빼앗겼습니다.`];
        break;
      }

      case 'AOE_DAMAGE': {
        // 전체 피해 (현재 보스만 대상)
        const actualDamage = Math.max(0, effect.value - newState.bossShield);
        newState.bossShield = Math.max(0, newState.bossShield - effect.value);
        newState.bossHp = Math.max(0, newState.bossHp - actualDamage);
        newState.log = [...newState.log, `전체 ${effect.value} 피해를 입혔습니다.`];
        break;
      }

      default:
        break;
    }
  }

  return newState;
};

/**
 * 턴 종료 시 상태 효과 처리
 */
const processStatusEffects = (state: GameState): GameState => {
  let newState = { ...state };

  // 플레이어 상태 효과 처리
  for (const effect of newState.playerStatusEffects) {
    switch (effect.type) {
      case 'DOT_DAMAGE':
        newState.playerHp = Math.max(0, newState.playerHp - effect.value);
        newState.log = [...newState.log, `지속 피해 ${effect.value}를 받았습니다.`];
        break;
      case 'HOT_HEAL':
        newState.playerHp = Math.min(newState.playerMaxHp, newState.playerHp + effect.value);
        newState.log = [...newState.log, `지속 회복 ${effect.value}를 받았습니다.`];
        break;
    }
  }

  // 보스 상태 효과 처리
  for (const effect of newState.bossStatusEffects) {
    switch (effect.type) {
      case 'DOT_DAMAGE':
        newState.bossHp = Math.max(0, newState.bossHp - effect.value);
        newState.log = [...newState.log, `보스가 지속 피해 ${effect.value}를 받았습니다.`];
        break;
      case 'HOT_HEAL':
        newState.bossHp = Math.min(newState.bossMaxHp, newState.bossHp + effect.value);
        break;
    }
  }

  // 상태 효과 턴 감소 및 제거
  newState.playerStatusEffects = newState.playerStatusEffects
    .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
    .filter((e) => e.remainingTurns > 0);

  newState.bossStatusEffects = newState.bossStatusEffects
    .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
    .filter((e) => e.remainingTurns > 0);

  return newState;
};

export const createInitialGameState = (deck: Card[], mode: 'SINGLE' | 'PVP' = 'SINGLE'): GameState => {
  const shuffled = shuffle(deck);
  let state: GameState = {
    playerHp: PLAYER_MAX_HP,
    playerMaxHp: PLAYER_MAX_HP,
    playerShield: 0,
    playerStatusEffects: [],
    fatigue: 0, // 피로도 초기화

    bossHp: BOSS_MAX_HP,
    bossMaxHp: BOSS_MAX_HP,
    bossShield: 0,
    bossStatusEffects: [],

    maxEnergy: 1,
    currentEnergy: 1,
    deck: shuffled,
    hand: [],
    discardPile: [],
    turn: 1,
    round: 1, // PvP용 라운드
    isPlayerTurn: true,
    isGameOver: false,
    winner: null,
    log: [mode === 'PVP' ? 'PvP 대전이 시작되었습니다! 선공+후공 1번씩 = 1라운드' : '게임이 시작되었습니다. 당신의 소비 패턴이 시험대에 오릅니다.'],
    gameMode: mode
  };

  // Initial hand: draw 3 cards
  const result = drawCards(state.deck, state.hand, 3, state.fatigue, state.playerHp);
  state.deck = result.deck;
  state.hand = result.hand;
  state.fatigue = result.fatigue;
  state.playerHp = result.playerHp;
  if (result.fatigueMessages.length > 0) {
    state.log = [...state.log, ...result.fatigueMessages];
  }

  return state;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INIT_GAME':
      return createInitialGameState(action.payload.deck, action.payload.mode || 'SINGLE');

    case 'PLAY_CARD': {
      console.log('========================================');
      console.log('[리듀서] PLAY_CARD 액션 시작');
      console.log('[리듀서] isPlayerTurn:', state.isPlayerTurn);
      console.log('[리듀서] isGameOver:', state.isGameOver);
      
      if (!state.isPlayerTurn || state.isGameOver) {
        console.log('[리듀서] 카드 사용 불가 (턴 아님 또는 게임 종료)');
        return state;
      }

      const card = state.hand.find((c) => c.id === action.payload.cardId);
      if (!card) {
        console.log('[리듀서] 카드를 찾을 수 없음:', action.payload.cardId);
        return state;
      }
      
      console.log('[리듀서] 사용할 카드:', card.name, '⚔️', card.attack, '🛡️', card.defense);
      console.log('[리듀서] 현재 에너지:', state.currentEnergy, '/ 카드 코스트:', card.cost);
      
      if (card.cost > state.currentEnergy) {
        console.log('[리듀서] 에너지 부족!');
        return state;
      }

      // 에너지 소모
      const newEnergy = state.currentEnergy - card.cost;
      const newHand = state.hand.filter((c) => c.id !== card.id);
      const newDiscard = [...state.discardPile, card];

      console.log('[리듀서] 에너지 차감:', state.currentEnergy, '→', newEnergy);
      console.log('[리듀서] 손패:', state.hand.length, '→', newHand.length);

      let nextState: GameState = {
        ...state,
        currentEnergy: newEnergy,
        hand: newHand,
        discardPile: newDiscard,
        log: [...state.log, `'${card.name}' 카드를 사용했습니다.`]
      };

      // ========================================
      // 카드의 attack으로 기본 피해 처리
      // ========================================
      console.log('[리듀서] 피해 처리 시작 - card.attack:', card.attack);
      console.log('[리듀서] 현재 보스/상대 HP:', nextState.bossHp);
      console.log('[리듀서] 현재 보스/상대 실드:', nextState.bossShield);
      
      if (card.attack > 0) {
        const damage = card.attack;
        const actualDamage = Math.max(0, damage - nextState.bossShield);
        const newBossShield = Math.max(0, nextState.bossShield - damage);
        const newBossHp = Math.max(0, nextState.bossHp - actualDamage);
        
        console.log('[리듀서] 피해 계산:');
        console.log('[리듀서]   - 카드 피해:', damage);
        console.log('[리듀서]   - 실드로 막음:', Math.min(damage, nextState.bossShield));
        console.log('[리듀서]   - 실제 HP 피해:', actualDamage);
        console.log('[리듀서]   - 보스 HP:', nextState.bossHp, '→', newBossHp);
        console.log('[리듀서]   - 보스 실드:', nextState.bossShield, '→', newBossShield);
        
        nextState = {
          ...nextState,
          bossShield: newBossShield,
          bossHp: newBossHp,
          log: [...nextState.log, `${damage} 피해를 입혔습니다. (HP: ${nextState.bossHp} → ${newBossHp})`]
        };
      } else {
        console.log('[리듀서] 공격력 0 - 피해 없음');
      }

      // 추가 효과 적용 (HEAL, SHIELD, DRAW 등)
      console.log('[리듀서] 추가 효과 적용:', card.effects.length, '개');
      nextState = applyCardEffects(nextState, card, true);

      // 승리 조건 체크
      console.log('[리듀서] 최종 보스 HP:', nextState.bossHp);
      if (nextState.bossHp <= 0) {
        console.log('[리듀서] 🎉 승리!');
        nextState = {
          ...nextState,
          isGameOver: true,
          winner: 'PLAYER',
          log: [...nextState.log, '승리했습니다!']
        };
      }

      console.log('[리듀서] PLAY_CARD 완료, 새 상태 반환');
      console.log('========================================');
      return nextState;
    }

    case 'END_TURN': {
      if (!state.isPlayerTurn || state.isGameOver) return state;

      const isPvP = state.gameMode === 'PVP';
      let nextState = { ...state };

      // 상태 효과 처리 (지속 피해/회복 등)
      nextState = processStatusEffects(nextState);

      // ========================================
      // PvP 모드: 보스 공격 없음, 턴만 교대
      // ========================================
      if (isPvP) {
        nextState.log = [...nextState.log, '턴을 종료했습니다. 상대 턴으로 넘어갑니다.'];
        
        // 다음 턴 준비
        const nextTurn = state.turn + 1;

        // PvP에서는 END_TURN에서 카드를 드로우하지 않음!
        // START_MY_TURN에서만 드로우하도록 변경
        nextState = {
          ...nextState,
          turn: nextTurn,
          isPlayerTurn: false, // PvP에서는 상대 턴으로
          log: [...nextState.log, `턴이 상대에게 넘어갔습니다.`]
        };

        return nextState;
      }

      // ========================================
      // 싱글 플레이 모드: 보스 공격 로직 실행
      // ========================================
      
      // 보스 스턴 체크
      const bossStunned = nextState.bossStatusEffects.some((e) => e.type === 'STUN');

      if (!bossStunned) {
        // 보스 공격
        let bossAttack = BOSS_ATTACK;
        // 공격력 버프/디버프 적용
        for (const effect of nextState.bossStatusEffects) {
          if (effect.type === 'ATTACK_BUFF') bossAttack += effect.value;
          if (effect.type === 'ATTACK_DEBUFF') bossAttack -= effect.value;
        }
        bossAttack = Math.max(1, bossAttack);

        // 플레이어 피해 감소 적용
        let damageReduction = 0;
        for (const effect of nextState.playerStatusEffects) {
          if (effect.type === 'DAMAGE_REDUCTION') {
            damageReduction += effect.value;
          }
        }

        const finalDamage = Math.max(0, bossAttack - damageReduction);
        const actualDamage = Math.max(0, finalDamage - nextState.playerShield);
        nextState.playerShield = Math.max(0, nextState.playerShield - finalDamage);
        nextState.playerHp = Math.max(0, nextState.playerHp - actualDamage);

        nextState.log = [
          ...nextState.log,
          '턴을 종료했습니다.',
          `보스가 반격하여 ${finalDamage} 피해를 입혔습니다.`
        ];
      } else {
        nextState.log = [...nextState.log, '보스가 스턴 상태입니다!'];
      }

      // 패배 체크
      if (nextState.playerHp <= 0) {
        return {
          ...nextState,
          isGameOver: true,
          winner: 'BOSS',
          log: [...nextState.log, '당신의 HP가 0이 되었습니다. 패배했습니다.']
        };
      }

      // 다음 턴 준비
      const nextTurn = state.turn + 1;
      const nextMaxEnergy = Math.min(state.maxEnergy + 1, MAX_ENERGY_CAP);

      // 다음 턴 에너지 버프 적용
      let energyBonus = 0;
      for (const effect of nextState.playerStatusEffects) {
        if (effect.type === 'ENERGY_NEXT_TURN') {
          energyBonus += effect.value;
        }
      }

      // 카드 드로우 (피로도 포함)
      const drawResult = drawOne(nextState.deck, nextState.hand, nextState.fatigue, nextState.playerHp);

      nextState = {
        ...nextState,
        turn: nextTurn,
        maxEnergy: nextMaxEnergy,
        currentEnergy: Math.max(0, nextMaxEnergy + energyBonus),
        deck: drawResult.deck,
        hand: drawResult.hand,
        fatigue: drawResult.fatigue,
        playerHp: drawResult.playerHp,
        isPlayerTurn: true,
        log: drawResult.fatigueMessage 
          ? [...nextState.log, `${nextTurn}턴이 시작되었습니다. 에너지가 회복되었습니다.`, drawResult.fatigueMessage]
          : [...nextState.log, `${nextTurn}턴이 시작되었습니다. 에너지가 회복되었습니다.`]
      };

      // 피로도로 인한 패배 체크
      if (nextState.playerHp <= 0) {
        return {
          ...nextState,
          isGameOver: true,
          winner: 'BOSS',
          log: [...nextState.log, '피로도로 인해 HP가 0이 되었습니다. 패배했습니다.']
        };
      }

      return nextState;
    }

    case 'RESTART':
      return createInitialGameState(action.payload.deck, action.payload.mode || 'SINGLE');

    case 'OPPONENT_ACTION': {
      // PvP에서 상대 HP/Shield 업데이트 (화면 상단에 표시되는 "상대 플레이어")
      console.log('========================================');
      console.log('[리듀서] 🔥 OPPONENT_ACTION 실행!');
      console.log('[리듀서] 현재 상대(보스) HP:', state.bossHp);
      console.log('[리듀서] 새로운 상대 HP:', action.payload.opponentHp);
      console.log('[리듀서] 현재 상대 실드:', state.bossShield);
      console.log('[리듀서] 새로운 상대 실드:', action.payload.opponentShield);
      
      let newState: GameState = {
        ...state,
        bossHp: action.payload.opponentHp,
        bossShield: action.payload.opponentShield
      };
      
      // 승리 체크 추가! (상대 HP가 0이 되면 내가 승리)
      if (action.payload.opponentHp <= 0 && !state.isGameOver) {
        console.log('[리듀서] 🎉 승리! 상대 HP가 0이 되었습니다');
        newState = {
          ...newState,
          isGameOver: true,
          winner: 'PLAYER', // 상대가 패배 = 내가 승리
          log: [...newState.log, '상대를 물리쳤습니다! 승리!']
        };
      }
      
      console.log('[리듀서] ✅ 새 상태 반환! bossHp:', newState.bossHp, 'isGameOver:', newState.isGameOver);
      console.log('========================================');
      
      return newState;
    }

    case 'UPDATE_MY_HP_FROM_OPPONENT': {
      // 상대가 계산한 내 HP를 반영 (PvP 전용)
      console.log('========================================');
      console.log('[리듀서] 🔥🔥🔥 UPDATE_MY_HP_FROM_OPPONENT 실행!');
      console.log('[리듀서] 현재 내 HP:', state.playerHp);
      console.log('[리듀서] 새로운 내 HP:', action.payload.myHp);
      console.log('[리듀서] 현재 내 실드:', state.playerShield);
      console.log('[리듀서] 새로운 내 실드:', action.payload.myShield);
      
      let newState: GameState = {
        ...state,
        playerHp: action.payload.myHp,
        playerShield: action.payload.myShield,
        log: [...state.log, `상대 공격으로 HP가 ${state.playerHp} → ${action.payload.myHp}로 변경되었습니다.`]
      };
      
      // 패배 체크 추가!
      if (action.payload.myHp <= 0) {
        console.log('[리듀서] ❌ 패배! 내 HP가 0이 되었습니다');
        newState = {
          ...newState,
          isGameOver: true,
          winner: 'BOSS', // 내가 패배 = 상대가 승리
          log: [...newState.log, '패배했습니다!']
        };
      }
      
      console.log('[리듀서] ✅ 새 상태 반환 완료! playerHp:', newState.playerHp, 'isGameOver:', newState.isGameOver);
      console.log('========================================');
      
      return newState;
    }

    case 'RECEIVE_PVP_DAMAGE': {
      // PvP에서 상대 카드로부터 피해 받음
      const damage = action.payload.damage;
      console.log('========================================');
      console.log('[리듀서] 🔥 RECEIVE_PVP_DAMAGE 액션 실행!');
      console.log('[리듀서] 받은 피해:', damage);
      console.log('[리듀서] 현재 HP:', state.playerHp);
      console.log('[리듀서] 현재 실드:', state.playerShield);
      
      const actualDamage = Math.max(0, damage - state.playerShield);
      const newShield = Math.max(0, state.playerShield - damage);
      const newHp = Math.max(0, state.playerHp - actualDamage);

      console.log('[리듀서] 실드로 막은 피해:', Math.min(damage, state.playerShield));
      console.log('[리듀서] 실제 HP 피해:', actualDamage);
      console.log('[리듀서] 새로운 HP:', state.playerHp, '→', newHp);
      console.log('[리듀서] 새로운 실드:', state.playerShield, '→', newShield);
      console.log('========================================');

      let nextState: GameState = {
        ...state,
        playerHp: newHp,
        playerShield: newShield,
        log: [...state.log, `상대 카드로 ${damage} 피해를 받았습니다. (HP: ${state.playerHp} → ${newHp})`]
      };

      // 패배 체크
      if (newHp <= 0) {
        nextState = {
          ...nextState,
          isGameOver: true,
          winner: 'BOSS', // PvP에서는 상대 = 보스 위치
          log: [...nextState.log, '패배했습니다!']
        };
        console.log('[리듀서] ❌ 패배! HP가 0이 되었습니다');
      }

      console.log('[리듀서] ✅ RECEIVE_PVP_DAMAGE 처리 완료, 새 상태 반환');
      return nextState;
    }

    case 'START_MY_TURN': {
      // PvP에서 내 턴 시작 - 매 턴마다 에너지 +1, 카드 드로우 +1
      const nextTurn = state.turn + 1;
      
      // 매 턴마다 무조건 에너지 +1
      const nextMaxEnergy = Math.min(state.maxEnergy + 1, MAX_ENERGY_CAP);

      // 상태 효과로 인한 추가 에너지 보너스
      let energyBonus = 0;
      for (const effect of state.playerStatusEffects) {
        if (effect.type === 'ENERGY_NEXT_TURN') {
          energyBonus += effect.value;
        }
      }

      const nextCurrentEnergy = Math.max(0, nextMaxEnergy + energyBonus);

      // 카드 1장 드로우 (피로도 포함)
      const drawResult = drawOne(state.deck, state.hand, state.fatigue, state.playerHp);

      let nextState: GameState = {
        ...state,
        turn: nextTurn,
        maxEnergy: nextMaxEnergy,
        currentEnergy: nextCurrentEnergy,
        deck: drawResult.deck,
        hand: drawResult.hand,
        fatigue: drawResult.fatigue,
        playerHp: drawResult.playerHp,
        isPlayerTurn: true,
        log: drawResult.fatigueMessage 
          ? [...state.log, `${nextTurn}턴 시작! 에너지 회복 + 카드 1장 드로우`, drawResult.fatigueMessage]
          : [...state.log, `${nextTurn}턴 시작! 에너지 회복 + 카드 1장 드로우`]
      };

      // 피로도로 인한 패배 체크
      if (nextState.playerHp <= 0) {
        return {
          ...nextState,
          isGameOver: true,
          winner: 'BOSS', // PvP에서는 상대가 승리
          log: [...nextState.log, '피로도로 인해 HP가 0이 되었습니다. 패배했습니다.']
        };
      }

      return nextState;
    }

    default:
      return state;
  }
};
