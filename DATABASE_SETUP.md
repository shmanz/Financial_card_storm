# 🗄️ 데이터베이스 연동 가이드

## 📋 개요

현재 게임 재시작 시 모든 데이터가 초기화되는 문제를 해결하기 위해 **PostgreSQL** 데이터베이스를 연동합니다.

## 🎯 저장할 데이터

1. **거래 내역** (transactions)
2. **카드 덱 보유 내역** (purchasedCards, selectedDeck)
3. **승/패 통계** (pvpStats)
4. **사용자 정보** (bankProducts, purchasedShopProducts 등)

---

## 🏗️ 아키텍처

```
프론트엔드 (React)
    ↓ API 호출
백엔드 서버 (Express + Socket.IO)
    ↓ SQL 쿼리
PostgreSQL 데이터베이스 (Railway)
```

---

## 📦 필요한 패키지

```bash
npm install pg dotenv
npm install --save-dev @types/pg
```

---

## 🗄️ 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  has_open_banking BOOLEAN DEFAULT FALSE,
  has_hidden_card BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### bank_products 테이블
```sql
CREATE TABLE bank_products (
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
```

### transactions 테이블
```sql
CREATE TABLE transactions (
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

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

### purchased_cards 테이블
```sql
CREATE TABLE purchased_cards (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  card_id VARCHAR(255) NOT NULL,
  card_name VARCHAR(255) NOT NULL,
  card_data JSONB NOT NULL, -- 전체 카드 정보를 JSON으로 저장
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);
```

### user_decks 테이블
```sql
CREATE TABLE user_decks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  deck_name VARCHAR(255) DEFAULT 'default',
  card_ids TEXT[], -- 카드 ID 배열
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### pvp_stats 테이블
```sql
CREATE TABLE pvp_stats (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  win_rate DECIMAL(5,4) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### weekly_records 테이블
```sql
CREATE TABLE weekly_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  week VARCHAR(20) NOT NULL, -- '2024-W01' 형식
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week)
);

CREATE INDEX idx_weekly_records_week ON weekly_records(week);
```

### purchased_shop_products 테이블
```sql
CREATE TABLE purchased_shop_products (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

---

## 🔧 서버 설정

### 1. 환경 변수 설정

`.env` 파일 생성:
```env
# 데이터베이스 연결 정보 (Railway에서 제공)
DATABASE_URL=postgresql://user:password@host:port/dbname

# 또는 개별 설정
DB_HOST=your-db-host.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-password
```

### 2. 데이터베이스 연결 모듈

`server/db.js` 생성:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

---

## 📡 REST API 엔드포인트

### 사용자 관련
- `GET /api/users/:id` - 사용자 정보 조회
- `PUT /api/users/:id` - 사용자 정보 업데이트
- `POST /api/users` - 새 사용자 등록

### 거래 내역
- `GET /api/users/:id/transactions` - 거래 내역 조회
- `POST /api/users/:id/transactions` - 거래 내역 추가
- `PUT /api/users/:id/transactions/:txId` - 거래 내역 수정

### 카드 관련
- `GET /api/users/:id/cards` - 보유 카드 조회
- `POST /api/users/:id/cards` - 카드 추가 (구매)
- `DELETE /api/users/:id/cards/:cardId` - 카드 삭제
- `GET /api/users/:id/deck` - 덱 조회
- `PUT /api/users/:id/deck` - 덱 저장

### PvP 통계
- `GET /api/users/:id/pvp-stats` - PvP 통계 조회
- `PUT /api/users/:id/pvp-stats` - PvP 통계 업데이트
- `GET /api/pvp/ranking` - 랭킹 조회

---

## 🚀 Railway에 PostgreSQL 추가

1. Railway 대시보드 → 프로젝트 선택
2. **"New"** → **"Database"** → **"Add PostgreSQL"** 선택
3. 데이터베이스 생성 완료 후 **"Variables"** 탭에서 `DATABASE_URL` 확인
4. 백엔드 서비스의 환경 변수에 `DATABASE_URL` 추가

---

## 🔄 마이그레이션 전략

### Phase 1: 데이터베이스 스키마 생성
- Railway에서 PostgreSQL 생성
- 스키마 SQL 실행

### Phase 2: 서버 API 구현
- DB 연결 모듈 추가
- REST API 엔드포인트 구현

### Phase 3: 프론트엔드 연동
- AuthContext에서 API 호출로 변경
- localStorage 대신 서버에서 데이터 로드/저장

### Phase 4: 데이터 마이그레이션
- 기존 MOCK_USERS 데이터를 DB로 이전
- 테스트 및 검증

---

## ✅ 장점

1. **데이터 영구 저장**: 서버 재시작해도 데이터 유지
2. **동시 접속 지원**: 여러 클라이언트에서 동일 데이터 접근
3. **확장성**: 사용자 수 증가에 대응 가능
4. **백업**: 데이터베이스 백업 기능 제공
5. **보안**: SQL Injection 방지, 트랜잭션 지원

---

## 📝 다음 단계

1. [ ] PostgreSQL 데이터베이스 생성 (Railway)
2. [ ] 스키마 SQL 실행
3. [ ] 서버에 DB 연결 모듈 추가
4. [ ] REST API 엔드포인트 구현
5. [ ] 프론트엔드에서 API 호출하도록 수정
6. [ ] 테스트 및 검증

