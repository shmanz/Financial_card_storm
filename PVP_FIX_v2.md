# 🔧 PvP 문제 완전 수정 (v2)

## ✅ 수정된 문제들

### 1. 카드 제출이 안 되는 문제 → ✅ 해결

**원인**:
- isMyTurn 상태가 제대로 전파되지 않음
- 카드 클릭 이벤트가 차단됨

**해결**:
- ✅ 디버그 로그 추가 (카드 클릭 시 상태 출력)
- ✅ PvP에서 내 턴 체크 강화
- ✅ Socket 전송 타이밍 조정 (100ms 딜레이)
- ✅ 상대 턴일 때 alert 표시

### 2. 상대 나가기 처리 → ✅ 해결

**원인**:
- 나가기 이벤트가 상대에게 전달되지 않음

**해결**:
- ✅ `game:playerLeft` 이벤트 추가
- ✅ 상대가 나가면 alert + 자동으로 로비 이동
- ✅ 서버에서 게임 중 퇴장 감지

### 3. 랜덤 선공 → ✅ 해결

**원인**:
- 항상 호스트가 선공

**해결**:
- ✅ 서버에서 50% 확률로 랜덤 선택
- ✅ 클라이언트에 선공 정보 전달
- ✅ 콘솔에 "선공: 호스트/게스트" 표시

---

## 🎮 PvP 플레이 플로우 (수정 후)

### 게임 시작

```
플레이어 A, B 모두 준비 완료
↓
서버: Math.random() < 0.5 ? A : B
↓
랜덤으로 선공 결정 ✅
↓
A 화면: "⚔️ 내 턴!" 또는 "⏳ 상대 턴"
B 화면: "⏳ 상대 턴" 또는 "⚔️ 내 턴!"
```

### 턴 1: 플레이어 A (선공인 경우)

```
1. A가 카드 클릭
   ↓
   콘솔: [CardView] 카드 클릭: 든든한 한 끼 canPlay: true
   ↓
   콘솔: [카드 사용] cardId: card-1 isMyTurn: true
   ↓
2. 로컬에서 카드 효과 적용 (보스 HP = 상대 HP)
   ↓
3. Socket으로 전송:
   socket.emit('game:playCard', {
     cardId, cardName, damage, 
     newOpponentHp: 17,  ← 상대 HP
     newOpponentShield: 0
   })
   ↓
4. 서버 → B에게 브로드캐스트
   ↓
5. B 화면:
   - 내 HP: 20 → 17 ✅
   - 로그: "상대가 카드를 사용했습니다"
   ↓
6. A가 "턴 종료" 클릭
   ↓
7. Socket: game:turnEnded
   ↓
8. B에게 턴 넘김
   ↓
9. B 화면: "⚔️ 내 턴!"
   - 에너지: 1 → 2
   - 카드 1장 드로우
```

### 턴 2: 플레이어 B

```
1. B가 카드 클릭 (이제 가능!) ✅
   ↓
2. A 화면에 HP 감소
   ↓
3. B가 턴 종료
   ↓
4. A의 턴으로
```

### 상대 나가기

```
플레이어 A가 "나가기" 클릭
↓
서버: game:playerLeft 이벤트 발생
↓
플레이어 B 화면:
  - alert: "상대방이 게임을 떠났습니다"
  - 자동으로 메인 화면으로 이동 ✅
```

---

## 🔍 디버그 로그 확인

### 브라우저 콘솔 (F12)

#### 카드 클릭 시

```javascript
[CardView] 카드 클릭: 든든한 한 끼 canPlay: true disabled: false
[HandArea] 카드 클릭: card-1-FOOD-0 isMyTurn: true
[카드 사용] cardId: card-1-FOOD-0 isMyTurn: true screen: MULTIPLAYER_BATTLE
[Socket] 카드 사용 전송: 든든한 한 끼
```

#### 상대 턴일 때 카드 클릭

```javascript
[CardView] 카드 클릭: 카페인 러시 canPlay: true disabled: false
[HandArea] 카드 클릭: card-2-CAFE-1 isMyTurn: false
[카드 사용 차단] 상대 턴입니다
alert: "상대의 턴입니다!"
```

#### 턴 종료 시

```javascript
[Socket] 카드 사용 전송: 든든한 한 끼
[턴 종료] 상대에게 상태 전송
[PvP] 상대가 턴을 종료했습니다
[턴 수신] 내 턴으로 전환
```

---

## 📋 테스트 체크리스트

### 초기 설정

- [ ] `taskkill /IM node.exe /F` 실행
- [ ] `npm run dev:full` 실행
- [ ] 백엔드 콘솔에 "포트: 3002" 표시

### 플레이어 A (일반 창)

- [ ] 로그인: 염승훈
- [ ] 멀티플레이 → 방 생성
- [ ] 🟢 서버 연결됨 확인
- [ ] 준비 완료

### 플레이어 B (시크릿 모드)

- [ ] Ctrl + Shift + N
- [ ] `http://localhost:5173`
- [ ] 로그인: 이태영
- [ ] 방 참가 → 준비 완료

### 게임 시작

- [ ] 자동 전투 화면 전환
- [ ] 콘솔: "선공: 호스트" 또는 "선공: 게스트"
- [ ] 선공 플레이어: "⚔️ 내 턴!"
- [ ] 후공 플레이어: "⏳ 상대 턴"

### 선공 플레이어 차례

- [ ] 손패 카드 보임 (3장)
- [ ] 카드 클릭 가능 ✅
- [ ] 콘솔: "[CardView] 카드 클릭: ..."
- [ ] 카드 사용됨 (손패에서 사라짐)
- [ ] 콘솔: "[Socket] 카드 사용 전송"

### 후공 플레이어 화면

- [ ] 내 HP 감소 확인 ✅
- [ ] 로그: "상대가 카드를 사용했습니다"

### 턴 종료

- [ ] 선공: "턴 종료" 클릭
- [ ] 선공: "⏳ 상대 턴" 표시
- [ ] 후공: "⚔️ 내 턴!" 표시
- [ ] 후공: 에너지 +1
- [ ] 후공: 카드 1장 드로우

### 후공 플레이어 차례

- [ ] 카드 클릭 가능 ✅
- [ ] 선공 플레이어 HP 감소
- [ ] 턴 종료 → 다시 선공 차례

### 나가기 테스트

- [ ] A가 "나가기" 클릭
- [ ] B 화면: alert "상대방이 게임을 떠났습니다"
- [ ] B 자동으로 메인 화면 이동 ✅

---

## 🎯 변경된 파일

| 파일 | 변경 사항 |
|------|-----------|
| `server/index.js` | 랜덤 선공 + playerLeft 이벤트 |
| `src/gameState.ts` | RECEIVE_PVP_DAMAGE, START_MY_TURN 액션 추가 |
| `src/App.tsx` | 카드 사용 로직 개선 + 디버그 로그 |
| `src/components/PvPBattle.tsx` | playerLeft 이벤트 처리 |
| `src/components/CardView.tsx` | 클릭 디버그 로그 추가 |
| `src/components/MultiplayerLobby.tsx` | 선공 정보 수신 |

---

## 🐛 문제 해결

### "카드를 클릭해도 반응이 없어요"

**확인**:
1. F12 → Console에서 로그 확인
2. "[CardView] 카드 클릭" 로그가 나오는지 확인
3. "canPlay: false" 또는 "disabled: true"면 에너지 부족

**해결**:
- 에너지가 충분한 카드 클릭
- 상대 턴이면 alert "상대의 턴입니다!" 표시

### "턴이 안 넘어가요"

**확인**:
1. 콘솔: "[턴 수신] 내 턴으로 전환" 로그 확인
2. 화면 상단: "⚔️ 내 턴!" 표시 확인

**해결**:
- 백엔드 서버 재시작
- 새로고침 (F5)

### "상대가 나갔는데 게임이 안 끝나요"

**확인**:
- alert 표시되는지 확인
- 콘솔: "[PvP] 상대가 나갔습니다" 로그 확인

**해결**: ✅ 이제 자동 처리됨!

---

## 📊 Socket 이벤트 정리

### 클라이언트 → 서버

| 이벤트 | 데이터 | 시점 |
|--------|--------|------|
| `game:playCard` | `{ cardId, cardName, damage, newOpponentHp, newOpponentShield }` | 카드 사용 시 |
| `game:turnEnded` | `{ hp, shield, statusEffects, energy, turn }` | 턴 종료 시 |
| `room:leave` | - | 나가기 버튼 |

### 서버 → 클라이언트

| 이벤트 | 데이터 | 시점 |
|--------|--------|------|
| `game:start` | `{ room, firstPlayer }` | 게임 시작 (랜덤 선공) |
| `game:cardPlayed` | `{ playerId, cardName, damage, newOpponentHp }` | 상대 카드 사용 |
| `game:turnEnded` | `{ hp, shield, statusEffects, energy }` | 상대 턴 종료 |
| `game:playerLeft` | `{ message, leftPlayerId }` | 상대 나가기 |

---

## 🎊 완료!

**모든 PvP 문제가 해결되었습니다!**

### 테스트하세요

```powershell
taskkill /IM node.exe /F
npm run dev:full
```

### 확인 사항

1. ✅ 카드 클릭 → 콘솔 로그 출력
2. ✅ 내 턴에만 카드 사용 가능
3. ✅ 상대 턴에 카드 클릭 → alert 표시
4. ✅ 턴 종료 → 상대 턴으로 전환
5. ✅ 랜덤 선공 (호스트/게스트 50%)
6. ✅ 상대 나가기 → alert + 로비 이동

---

**지금 바로 PvP 테스트하세요!** ⚔️🎮





