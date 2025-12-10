# ⚡ 빠른 데이터베이스 테이블 생성 가이드

## 🎯 문제: Railway PostgreSQL에 테이블이 없음

Railway에서 PostgreSQL을 생성하면 **빈 데이터베이스**입니다. 테이블을 별도로 생성해야 합니다.

---

## ✅ 해결 방법 (2가지)

### 방법 1: Railway Query 탭에서 수동 실행 (즉시 가능) ⚡

1. **Railway 대시보드** → **PostgreSQL 서비스** 선택
2. **"Database"** 탭 → **"Query"** 탭 클릭
3. 아래 SQL 전체 복사하여 붙여넣기
4. **"Run"** 클릭

```sql
-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  has_open_banking BOOLEAN DEFAULT FALSE,
  has_hidden_card BOOLEAN DEFAULT FALSE,
  hall_of_fame_rewards TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PvP 통계 테이블 (승/패 기록)
CREATE TABLE IF NOT EXISTS pvp_stats (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  win_rate DECIMAL(5,4) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_pvp_stats_user_id ON pvp_stats(user_id);

-- 주간 기록 테이블 (주간 랭킹용)
CREATE TABLE IF NOT EXISTS weekly_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  week VARCHAR(20) NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week)
);

CREATE INDEX idx_weekly_records_week ON weekly_records(week);
CREATE INDEX idx_weekly_records_user_id ON weekly_records(user_id);
```

5. **확인**: Railway **"Database"** → **"Data"** 탭에서 테이블 확인

---

### 방법 2: 서버 자동 생성 (재배포 후) 🤖

서버가 시작될 때 자동으로 테이블을 생성하도록 설정했습니다:

1. **백엔드 서버 재배포**
   - Railway가 자동으로 재배포하거나
   - GitHub에 푸시하면 자동 배포

2. **로그 확인**
   - Railway 대시보드 → **Deployments** → 로그
   - 다음 메시지 확인:
     ```
     [DB] ✅ 데이터베이스 테이블 자동 생성 완료
     ```

3. **확인**: Railway **"Database"** → **"Data"** 탭에서 테이블 확인

---

## 📋 생성되는 테이블 목록

| 테이블 | 용도 |
|--------|------|
| `users` | 사용자 정보 |
| `pvp_stats` | 전체 승/패 통계 |
| `weekly_records` | 주간 승/패 기록 (랭킹용) |
| `bank_products` | 금융 상품 |
| `transactions` | 거래 내역 |
| `purchased_cards` | 구매한 카드 |
| `user_decks` | 사용자 덱 |
| `purchased_shop_products` | 카드 상점 구매 내역 |

---

## ✅ 확인 방법

### Railway에서 확인

1. **PostgreSQL 서비스** → **"Database"** → **"Data"** 탭
2. 테이블 목록 확인:
   - `users`
   - `pvp_stats`
   - `weekly_records`
   - ... (총 8개 테이블)

### API 테스트

```bash
# 랭킹 조회 (테이블이 있으면 빈 배열 반환)
curl http://your-railway-url/api/pvp/ranking?week=2024-W50
```

---

## 🐛 문제 해결

### 문제: "relation does not exist" 에러

**원인**: 테이블이 아직 생성되지 않음

**해결**:
1. 방법 1 (수동 실행) 사용
2. 또는 서버 재배포 후 로그 확인

### 문제: 자동 생성이 실패함

**원인**: `schema.sql` 파일 경로 문제

**해결**:
1. 방법 1 (수동 실행) 사용
2. 또는 Railway Query 탭에서 직접 실행

---

## 💡 추천

**즉시 테스트하려면**: 방법 1 (수동 실행) ✅
**자동화하려면**: 방법 2 (서버 재배포) ✅

두 방법 모두 동일한 결과를 제공합니다!
