/**
 * ========================================
 * PostgreSQL 데이터베이스 연결 모듈
 * ========================================
 */

const { Pool } = require('pg');

// 환경 변수에서 데이터베이스 연결 정보 가져오기
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // 연결 풀 설정
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('[DB] ✅ PostgreSQL 연결 성공');
});

pool.on('error', (err) => {
  console.error('[DB] ❌ 예상치 못한 클라이언트 에러:', err);
  process.exit(-1);
});

module.exports = pool;

