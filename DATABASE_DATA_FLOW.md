# 📊 데이터베이스 데이터 흐름 가이드

## ✅ 현재 상태

**테이블은 생성되었지만 데이터가 없는 것은 정상입니다!**

데이터는 **게임을 플레이하면서 자동으로 생성**됩니다.

---

## 🔄 자동 데이터 생성 시점

### 1. **PvP 통계 데이터** (`pvp_stats`, `weekly_records`)

**자동 생성 시점:**
- ✅ PvP 게임을 플레이하고 게임이 종료될 때
- ✅ 승리 또는 패배 시 자동으로 저장됨

**작동 방식:**
```
PvP 게임 종료
  ↓
updatePvPStats(won) 호출
  ↓
PUT /api/pvp/:userId/stats API 호출
  ↓
데이터베이스에 자동 저장
  - pvp_stats 테이블: 전체 통계 업데이트
  - weekly_records 테이블: 주간 통계 업데이트
```

**예시:**
- 염승훈이 PvP에서 승리 → `pvp_stats`에 `wins: 1` 자동 저장
- 서재만이 PvP에서 패배 → `pvp_stats`에 `losses: 1` 자동 저장
- 명예의 전당에서 실시간으로 순위 확인 가능

---

### 2. **사용자 데이터** (`users`)

**현재 상태:**
- ⚠️ 프론트엔드는 아직 `MOCK_USERS`와 `localStorage`를 사용 중
- 데이터베이스 연동은 준비되어 있지만 활성화되지 않음

**데이터베이스에 저장하려면:**
- 로그인/회원가입 시 `POST /api/users` API 호출 필요
- 현재는 로컬에서만 작동

---

### 3. **거래 내역** (`transactions`)

**현재 상태:**
- ⚠️ 프론트엔드에서 모의 데이터 생성
- 데이터베이스 연동 준비됨 (`POST /api/users`에 포함)

---

### 4. **구매한 카드** (`purchased_cards`)

**현재 상태:**
- ⚠️ 프론트엔드에서 `localStorage` 사용
- 데이터베이스 연동 준비됨

---

## 🎮 테스트 방법

### PvP 통계 자동 생성 테스트

1. **게임 플레이:**
   - 로그인 → 멀티플레이 로비 → PvP 게임 시작
   - 게임 종료 (승리 또는 패배)

2. **데이터베이스 확인:**
   ```sql
   -- Railway PostgreSQL Query 탭에서 실행
   SELECT * FROM pvp_stats;
   SELECT * FROM weekly_records;
   ```

3. **명예의 전당 확인:**
   - 로비 → 명예의 전당
   - 순위가 실시간으로 표시됨

---

## 📋 데이터 생성 순서

### 첫 번째 PvP 게임 플레이 후:

1. **`pvp_stats` 테이블:**
   ```sql
   user_id | wins | losses | total_games | win_rate
   --------|------|--------|-------------|----------
   염승훈  | 1    | 0      | 1           | 1.0
   서재만  | 0    | 1      | 1           | 0.0
   ```

2. **`weekly_records` 테이블:**
   ```sql
   user_id | week      | wins | losses | win_rate
   --------|-----------|------|--------|----------
   염승훈  | 2025-W50  | 1    | 0      | 1.0
   서재만  | 2025-W50  | 0    | 1      | 0.0
   ```

3. **명예의 전당:**
   - 염승훈: 1위 (승률 100%)
   - 서재만: 2위 (승률 0%)

---

## ✅ 확인 사항

### 현재 작동하는 것:
- ✅ PvP 통계 자동 저장 (`pvp_stats`, `weekly_records`)
- ✅ 명예의 전당 실시간 랭킹 (5초마다 갱신)
- ✅ 승/패에 따른 순위 자동 업데이트

### 아직 로컬에서만 작동하는 것:
- ⚠️ 사용자 정보 (`users` 테이블)
- ⚠️ 거래 내역 (`transactions` 테이블)
- ⚠️ 구매한 카드 (`purchased_cards` 테이블)

---

## 🚀 다음 단계

### PvP 통계는 이미 작동 중!

1. **PvP 게임 플레이:**
   - 게임 종료 시 자동으로 데이터베이스에 저장됨

2. **데이터 확인:**
   - Railway PostgreSQL → Query 탭:
     ```sql
     SELECT * FROM pvp_stats ORDER BY win_rate DESC;
     SELECT * FROM weekly_records ORDER BY week DESC, win_rate DESC;
     ```

3. **명예의 전당 확인:**
   - 게임 후 명예의 전당에서 순위 확인

---

## 💡 요약

**질문: 데이터가 하나도 없는데 자동으로 생성되나요?**

**답변:**
- ✅ **네, 자동으로 생성됩니다!**
- ✅ PvP 게임을 플레이하면 `pvp_stats`와 `weekly_records`에 자동 저장
- ✅ 테이블이 비어있는 것은 정상입니다 (아직 게임을 플레이하지 않았기 때문)
- ✅ 첫 번째 PvP 게임 후 데이터가 생성됩니다

**지금 바로 테스트:**
1. PvP 게임 플레이
2. 게임 종료
3. Railway PostgreSQL에서 데이터 확인
4. 명예의 전당에서 순위 확인
