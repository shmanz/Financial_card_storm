-- ========================================
-- Financial Card Storm 데이터베이스 스키마
-- ========================================

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  has_open_banking BOOLEAN DEFAULT FALSE,
  has_hidden_card BOOLEAN DEFAULT FALSE,
  hall_of_fame_rewards TEXT[], -- 보상 카드 ID 배열
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

CREATE INDEX idx_bank_products_user_id ON bank_products(user_id);

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

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- 구매한 카드 테이블
CREATE TABLE IF NOT EXISTS purchased_cards (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  card_id VARCHAR(255) NOT NULL,
  card_data JSONB NOT NULL, -- 전체 카드 정보를 JSON으로 저장
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

CREATE INDEX idx_purchased_cards_user_id ON purchased_cards(user_id);

-- 사용자 덱 테이블
CREATE TABLE IF NOT EXISTS user_decks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  deck_name VARCHAR(255) DEFAULT 'default',
  card_ids TEXT[], -- 카드 ID 배열
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, deck_name)
);

CREATE INDEX idx_user_decks_user_id ON user_decks(user_id);

-- PvP 통계 테이블
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

-- 주간 기록 테이블
CREATE TABLE IF NOT EXISTS weekly_records (
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
CREATE INDEX idx_weekly_records_user_id ON weekly_records(user_id);

-- 카드 상점 구매 내역 테이블
CREATE TABLE IF NOT EXISTS purchased_shop_products (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_purchased_shop_products_user_id ON purchased_shop_products(user_id);

