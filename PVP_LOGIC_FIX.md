# ✅ PvP 전투 로직 완전 수정

## 🔧 주요 변경 사항

### ❌ 기존 문제점

PvP 모드에서도 **보스 AI 공격 로직**이 실행되었음:
```
턴 종료 → 보스가 2 데미지 공격 → 플레이어 HP 감소
```

이는 PvP(플레이어 vs 플레이어)에 맞지 않는 동작!

### ✅ 수정 완료

**PvP 모드에서는 보스 AI 완전 제거**:
```
턴 종료 → 상대 플레이어에게 턴 넘김 → 상태 동기화
```

---

## 📊 게임 모드 분리

### 1. 싱글 플레이 (`SINGLE`)

```
플레이어 → 카드 사용 → 턴 종료
↓
보스 AI가 2 데미지 공격 ✅
↓
다음 턴 시작 (에너지 회복, 카드 드로우)
```

### 2. PvP 멀티플레이 (`PVP`)

```
플레이어 A → 카드 사용 → 턴 종료
↓
보스 AI 공격 없음! ✅
↓
플레이어 B에게 턴 넘김
↓
Socket.IO로 실시간 동기화
```

---

## 🔄 실시간 동기화 흐름

### 플레이어 A가 턴 종료할 때

```typescript
// 1. 내 상태를 상대에게 전송
socket.emit('game:turnEnded', {
  hp: 15,              // 내 현재 HP
  shield: 3,           // 내 방어막
  statusEffects: [...],// 내 버프/디버프
  energy: 7,           // 내 현재 에너지
  turn: 5              // 현재 턴 수
});

// 2. 서버가 플레이어 B에게 브로드캐스트
server → broadcast to Player B

// 3. 플레이어 B 화면에 상대 상태 업데이트
Player B sees:
  상대 HP: 15/20
  상대 방어막: 3
  상대 에너지: 7
```

### 플레이어 B가 카드 사용할 때

```typescript
// 1. 카드 효과 적용 (로컬)
dispatch({ type: 'PLAY_CARD', payload: { cardId } });

// 2. 상대에게 알림
socket.emit('game:playCard', { cardId });

// 3. 상태 변화 전송
socket.emit('game:syncState', {
  hp: 18,
  shield: 0,
  energy: 5
});

// 4. 플레이어 A 화면에 반영
Player A sees:
  상대가 카드를 사용했습니다
  상대 HP: 18/20
```

---

## 🎯 Socket.IO 이벤트 정의

### 클라이언트 → 서버

| 이벤트 | 데이터 | 설명 |
|--------|--------|------|
| `game:turnEnded` | `{ hp, shield, statusEffects, energy, turn }` | 턴 종료 + 내 상태 전송 |
| `game:playCard` | `{ cardId }` | 카드 사용 알림 |
| `game:syncState` | `{ hp, shield, energy }` | 실시간 상태 동기화 |

### 서버 → 클라이언트

| 이벤트 | 데이터 | 설명 |
|--------|--------|------|
| `game:turnEnded` | `{ hp, shield, statusEffects, energy, turn }` | 상대 턴 종료 알림 |
| `game:turnChanged` | `{ currentTurn }` | 턴 전환 알림 |
| `game:opponentState` | `{ hp, shield, energy }` | 상대 상태 업데이트 |
| `game:cardPlayed` | `{ playerId, cardId }` | 상대 카드 사용 알림 |

---

## 🎮 실제 PvP 플레이 플로우

### 초기 상태

```
플레이어 A (호스트, 선공)
- HP: 20/20
- 에너지: 1/1
- 손패: 3장
- 턴: 1
- isMyTurn: true ✅

플레이어 B (게스트, 후공)
- HP: 20/20
- 에너지: 1/1 (아직 사용 불가)
- 손패: 3장
- 턴: 1
- isMyTurn: false ❌
```

### 턴 1: 플레이어 A

```
1. A가 카드 사용 (코스트 1)
   ↓
2. B 화면에 "상대가 카드를 사용했습니다" 표시
   ↓
3. B의 HP 감소 (카드 효과에 따라)
   ↓
4. A가 "턴 종료" 클릭
   ↓
5. Socket으로 상태 전송:
   socket.emit('game:turnEnded', { hp, shield, ... })
   ↓
6. 서버가 B에게 브로드캐스트
   ↓
7. B 화면:
   - 상대 HP 업데이트
   - "내 턴입니다!" 표시
   - 에너지 1→2로 증가
   - 카드 1장 드로우
```

### 턴 2: 플레이어 B

```
1. B가 카드 사용 (코스트 2)
   ↓
2. A 화면에 반영
   ↓
3. A의 HP 감소
   ↓
4. B가 "턴 종료"
   ↓
5. 다시 A의 턴으로
```

### 반복

```
A → B → A → B → ...
```

---

## ⚠️ 중요: 보스 개념 제거

### 기존 (잘못됨)

```typescript
// PvP에서도 보스 공격!
case 'END_TURN': {
  // ... 보스가 공격하는 로직
  playerHp -= BOSS_ATTACK; // ❌ 잘못됨!
}
```

### 수정 후 (올바름)

```typescript
case 'END_TURN': {
  if (state.gameMode === 'PVP') {
    // 보스 공격 없음! 턴만 넘김 ✅
    return { ...state, isPlayerTurn: false };
  }
  
  // 싱글 플레이일 때만 보스 공격
  if (state.gameMode === 'SINGLE') {
    playerHp -= BOSS_ATTACK; // ✅ 올바름!
  }
}
```

---

## 🧪 테스트 방법

### 1. 싱글 플레이 테스트

```
1. Guest 또는 로그인
2. "싱글 플레이 시작"
3. 카드 사용 → 보스 HP 감소 ✅
4. 턴 종료 → 보스가 2 피해 ✅
5. 내 HP 감소 확인 ✅
```

### 2. PvP 테스트

```
1. 회원 로그인 (플레이어 A)
2. 멀티플레이 → 방 생성
3. 시크릿 모드 → 다른 계정 (플레이어 B)
4. 방 참가 → 준비
5. 게임 시작
6. A가 카드 사용 → B의 HP만 감소 ✅
7. A가 턴 종료 → A는 공격받지 않음! ✅
8. B의 턴으로 전환 ✅
9. B가 카드 사용 → A의 HP 감소 ✅
10. B가 턴 종료 → B는 공격받지 않음! ✅
```

---

## 📝 변경된 파일

| 파일 | 변경 사항 |
|------|-----------|
| `src/types/game.ts` | `gameMode: 'SINGLE' \| 'PVP'` 추가 |
| `src/gameState.ts` | 턴 종료 시 모드별 분기 처리 |
| `src/App.tsx` | 모드 설정 + Socket 이벤트 연동 |
| `src/components/PvPBattle.tsx` | 실시간 동기화 구현 |
| `server/index.js` | `game:turnEnded` 이벤트 추가 |

---

## 🎯 핵심 개선 사항

### 1. 게임 모드 명확화

```typescript
gameState.gameMode = 'SINGLE' // 보스 AI 있음
gameState.gameMode = 'PVP'    // 보스 AI 없음
```

### 2. 턴 종료 로직 분리

```typescript
if (gameMode === 'PVP') {
  // 턴만 넘김, 공격 없음
  return { ...state, isPlayerTurn: false };
}

if (gameMode === 'SINGLE') {
  // 보스 공격 실행
  playerHp -= BOSS_ATTACK;
}
```

### 3. 실시간 동기화

```typescript
// 내 상태 전송
socket.emit('game:turnEnded', myState);

// 상대 상태 수신
socket.on('game:turnEnded', (opponentState) => {
  updateOpponentDisplay(opponentState);
});
```

---

## ✅ 완료!

**PvP 전투 로직이 완전히 수정되었습니다!**

### 테스트하세요

```powershell
# 서버 재시작
taskkill /IM node.exe /F
npm run dev:full
```

### PvP 테스트

1. 일반 창: 로그인 → 방 생성
2. 시크릿 모드: 다른 계정 → 방 참가
3. 준비 완료 → 게임 시작
4. 턴 종료 시 **보스 공격 없음** 확인 ✅
5. 상대 턴으로 정확히 전환 ✅

---

**이제 PvP가 올바르게 작동합니다!** ⚔️🎮





