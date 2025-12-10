# 🚨 데이터베이스 테이블 생성 문제 해결

## 현재 상황
- Git 배포 후에도 테이블이 생성되지 않음
- Railway PostgreSQL에서 "You have no tables" 표시
- 명예의 전당에 기록이 없음

---

## ⚡ 즉시 해결 방법 (권장)

### Railway Query 탭에서 수동 실행

1. **Railway 대시보드** → **PostgreSQL 서비스** 선택
2. **"Database"** 탭 → **"Query"** 탭 클릭
3. 아래 SQL **전체 복사**하여 붙여넣기
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

-- 금융 상품 테이블
CREATE TABLE IF NOT EXISTS bank_products (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  balance BIGINT,
  monthly_payment BIGINT,
  card_limit BIGINT,
  return_rate DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_products_user_id ON bank_products(user_id);

-- 거래 내역 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  date VARCHAR(10) NOT NULL,
  time VARCHAR(8) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  description TEXT,
  amount BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- 구매한 카드 테이블
CREATE TABLE IF NOT EXISTS purchased_cards (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  card_id VARCHAR(255) NOT NULL,
  card_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_purchased_cards_user_id ON purchased_cards(user_id);

-- 사용자 덱 테이블
CREATE TABLE IF NOT EXISTS user_decks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  deck_name VARCHAR(255) DEFAULT 'default',
  card_ids TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, deck_name)
);

CREATE INDEX IF NOT EXISTS idx_user_decks_user_id ON user_decks(user_id);

-- PvP 통계 테이블 (중요!)
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

CREATE INDEX IF NOT EXISTS idx_pvp_stats_user_id ON pvp_stats(user_id);

-- 주간 기록 테이블 (중요!)
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

CREATE INDEX IF NOT EXISTS idx_weekly_records_week ON weekly_records(week);
CREATE INDEX IF NOT EXISTS idx_weekly_records_user_id ON weekly_records(user_id);

-- 카드 상점 구매 내역 테이블
CREATE TABLE IF NOT EXISTS purchased_shop_products (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_purchased_shop_products_user_id ON purchased_shop_products(user_id);
```

5. **확인**: "Database" → "Data" 탭에서 테이블 목록 확인

---

## 🔍 자동 생성 실패 원인 확인

### Railway 로그 확인

1. Railway 대시보드 → **백엔드 서비스** → **Deployments**
2. 최신 배포의 **로그** 확인
3. 다음 메시지 찾기:
   - `[DB] 🔄 데이터베이스 테이블 생성 시작...`
   - `[DB] ✅ 데이터베이스 테이블 자동 생성 완료`
   - 또는 `[DB] ❌ 테이블 자동 생성 실패`

### 가능한 원인

1. **schema.sql 파일이 배포에 포함되지 않음**
   - 확인: Railway 배포 로그에서 파일 경로 확인
   - 해결: `.gitignore`에 `schema.sql`이 없는지 확인

2. **DATABASE_URL 환경 변수 미설정**
   - 확인: Railway → 백엔드 서비스 → Variables → `DATABASE_URL` 확인
   - 해결: PostgreSQL 서비스의 Variables에서 `DATABASE_URL` 복사하여 백엔드 서비스에 추가

3. **데이터베이스 연결 실패**
   - 확인: 로그에서 `[DB] ✅ PostgreSQL 연결 성공` 메시지 확인
   - 해결: DATABASE_URL 형식 확인

4. **비동기 실행 타이밍 문제**
   - 확인: 서버가 시작되기 전에 테이블 생성이 완료되지 않음
   - 해결: 수동 실행 (위 방법) 또는 서버 재시작

---

## ✅ 테이블 생성 확인

### Railway에서 확인
1. PostgreSQL 서비스 → **"Database"** → **"Data"** 탭
2. 다음 테이블들이 보여야 함:
   - `users`
   - `pvp_stats` ⭐
   - `weekly_records` ⭐
   - `bank_products`
   - `transactions`
   - `purchased_cards`
   - `user_decks`
   - `purchased_shop_products`

### API 테스트
```bash
# 랭킹 조회 (테이블이 있으면 빈 배열 반환)
curl http://your-railway-url/api/pvp/ranking?week=2025-W50
```

---

## 🎯 다음 단계

테이블 생성 후:
1. **PvP 게임 플레이**
2. **게임 종료 후 승/패 기록 확인**
3. **명예의 전당에서 랭킹 확인**

---

## 💡 추천

**즉시 해결**: Railway Query 탭에서 위 SQL 실행 ✅
**장기 해결**: 서버 로그 확인 후 자동 생성 로직 개선
