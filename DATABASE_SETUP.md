# 🗄️ 데이터베이스 설정 가이드

## 📋 데이터베이스 테이블 구조

### ✅ 승/패 관련 테이블 존재 확인

데이터베이스에 다음 테이블들이 이미 정의되어 있습니다:

#### 1. **`pvp_stats` 테이블** (전체 통계)
```sql
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
```

#### 2. **`weekly_records` 테이블** (주간 기록)
```sql
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
```

---

## 🔧 설정 방법

### 1단계: Railway에서 PostgreSQL 추가

1. Railway 대시보드 → 프로젝트 선택
2. **"New"** → **"Database"** → **"Add PostgreSQL"** 선택
3. PostgreSQL 서비스 생성 완료

### 2단계: 환경 변수 설정

**백엔드 서비스**의 **Variables** 탭:

1. PostgreSQL 서비스의 **"Variables"** 탭에서 `DATABASE_URL` 확인
2. 백엔드 서비스의 **"Variables"** 탭에 추가:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

### 3단계: 스키마 실행

**PostgreSQL 서비스**의 **"Query"** 탭에서:

1. `server/schema.sql` 파일 내용 복사
2. Query 탭에 붙여넣기
3. **"Run"** 클릭

또는 Railway CLI 사용:
```bash
railway run psql $DATABASE_URL < server/schema.sql
```

### 4단계: 서버 재배포

Railway가 자동으로 재배포하거나, 수동으로 재배포:

```bash
# Railway CLI
railway up
```

---

## ✅ 확인 방법

### API 테스트

```bash
# 통계 업데이트
curl -X PUT http://your-railway-url/api/pvp/user-1/stats \
  -H "Content-Type: application/json" \
  -d '{"won": true, "week": "2024-W50"}'

# 랭킹 조회
curl http://your-railway-url/api/pvp/ranking?week=2024-W50
```

### 로그 확인

Railway 대시보드 → **Deployments** → 로그에서:
```
[API] ✅ 데이터베이스 API 활성화 (사용자, 카드, PvP 통계)
[DB] ✅ PostgreSQL 연결 성공
```

---

## 🎯 실시간 순위 변동

### 작동 방식

1. **게임 종료 시**:
   ```
   PvP 게임 종료
   → updatePvPStats(won) 호출
   → 서버 API: PUT /api/pvp/:userId/stats
   → 데이터베이스에 저장
   ```

2. **명예의 전당 화면**:
   ```
   HallOfFame 컴포넌트 마운트
   → 5초마다 GET /api/pvp/ranking 호출
   → 최신 순위 표시
   ```

3. **순위 정렬 기준**:
   ```
   1순위: 승률 높은 순
   2순위: 총 경기 수 많은 순
   3순위: 승수 많은 순
   ```

---

## 📊 예시

### 염승훈: 2승 0패
```
승률: 100% (2/2)
순위: 1위
```

### 서재만: 0승 2패
```
승률: 0% (0/2)
순위: 2위
```

### 실시간 변동
```
염승훈이 3승 → 승률 100% (3/3) → 1위 유지
서재만이 1승 → 승률 33.3% (1/3) → 순위 상승 가능
```

---

## 🐛 문제 해결

### 문제 1: DATABASE_URL이 설정되지 않음

**증상:**
```
[API] ⚠️  DATABASE_URL이 설정되지 않아 데이터베이스 API가 비활성화되었습니다.
```

**해결:**
1. Railway에서 PostgreSQL 서비스 생성
2. `DATABASE_URL` 환경 변수 추가
3. 서버 재배포

### 문제 2: 테이블이 없음

**증상:**
```
relation "pvp_stats" does not exist
```

**해결:**
1. `server/schema.sql` 실행
2. 또는 Railway Query 탭에서 직접 생성

### 문제 3: 랭킹이 업데이트되지 않음

**증상:**
- 게임 후에도 순위가 변하지 않음

**해결:**
1. `updatePvPStats`가 서버 API를 호출하는지 확인
2. 브라우저 콘솔에서 에러 확인
3. 서버 로그에서 API 호출 확인

---

## 📚 추가 정보

- **스키마 파일**: `server/schema.sql`
- **API 라우트**: `server/api/pvp.js`
- **프론트엔드**: `src/contexts/AuthContext.tsx` (updatePvPStats)
- **랭킹 표시**: `src/components/HallOfFame.tsx`
