# 🏗️ 배포 아키텍처 가이드

## 📊 전체 구조

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   Vercel        │  ────>  │   Railway       │  ────>  │   Railway       │
│  (프론트엔드)    │   API   │  (백엔드 서버)   │   SQL   │  (PostgreSQL)   │
│                 │  호출   │                 │  쿼리   │                 │
│  React App      │         │  Express +      │         │  Database       │
│                 │         │  Socket.IO      │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
      ↑                              ↑
      │                              │
      └─────────── Socket.IO ────────┘
              (PvP 멀티플레이)
```

## 🎯 각 서비스 역할

### 1. **Vercel** (프론트엔드)
- **역할**: React 앱 호스팅
- **URL**: `https://your-app.vercel.app`
- **기능**: 
  - 사용자 UI 렌더링
  - Railway 백엔드로 API 호출
  - Socket.IO로 실시간 멀티플레이 연결

### 2. **Railway** (백엔드 서버)
- **역할**: Express API 서버 + Socket.IO
- **URL**: `https://your-backend.up.railway.app`
- **기능**:
  - REST API 제공 (`/api/users`, `/api/cards`, `/api/pvp`)
  - Socket.IO 실시간 통신
  - PostgreSQL 데이터베이스에 연결

### 3. **Railway** (PostgreSQL 데이터베이스)
- **역할**: 데이터 영구 저장
- **위치**: Railway 프로젝트 내 별도 서비스
- **데이터**:
  - 사용자 정보
  - 거래 내역
  - 카드 덱
  - PvP 통계
  - 랭킹 데이터

---

## 🔗 연결 흐름

### API 호출 (일반적인 데이터)
```
사용자 액션 (프론트엔드)
    ↓
fetch('https://your-backend.up.railway.app/api/users/123')
    ↓
Railway 백엔드 서버
    ↓
PostgreSQL 쿼리 실행
    ↓
데이터 반환
```

### Socket.IO (실시간 멀티플레이)
```
플레이어 A (프론트엔드)
    ↓
Socket.IO 연결 → https://your-backend.up.railway.app
    ↓
Railway 백엔드 서버 (메모리: rooms, players)
    ↓
플레이어 B에게 브로드캐스트
```

---

## 🚂 Railway에 PostgreSQL 추가하기

### 단계 1: Railway 프로젝트 선택

1. [Railway.app](https://railway.app) 접속
2. 기존 프로젝트 선택 (백엔드 서버가 있는 프로젝트)

### 단계 2: PostgreSQL 데이터베이스 생성

1. **"New"** 버튼 클릭
2. **"Database"** 선택
3. **"Add PostgreSQL"** 클릭
4. Railway가 자동으로 PostgreSQL 데이터베이스 생성

### 단계 3: 데이터베이스 연결 정보 확인

생성된 PostgreSQL 서비스에서:
1. **"Variables"** 탭 클릭
2. `DATABASE_URL` 확인 (예: `postgresql://postgres:password@host:port/railway`)

### 단계 4: 백엔드 서버에 연결

1. 백엔드 서비스 (Express 서버) 선택
2. **"Variables"** 탭 클릭
3. **"New Variable"** 클릭
4. 이름: `DATABASE_URL`
5. 값: PostgreSQL 서비스의 `DATABASE_URL` 복사해서 붙여넣기

**또는**: Railway가 자동으로 연결을 제공할 수도 있습니다.

---

## 📝 Railway 프로젝트 구조 예시

```
My Project (Railway)
│
├── financial-card-storm-backend (웹 서비스)
│   ├── Type: Web Service
│   ├── Port: 3002
│   ├── Start Command: npm start
│   └── Environment Variables:
│       └── DATABASE_URL=postgresql://... (PostgreSQL 연결)
│
└── financial-card-storm-db (데이터베이스)
    ├── Type: PostgreSQL
    ├── Database: railway
    └── Variables:
        └── DATABASE_URL=postgresql://...
```

---

## 🔧 환경 변수 설정 요약

### Vercel (프론트엔드)

**Settings → Environment Variables:**

```env
VITE_SOCKET_URL=https://your-backend.up.railway.app
VITE_API_URL=https://your-backend.up.railway.app
```

### Railway (백엔드 서버)

**Variables 탭:**

```env
NODE_ENV=production
PORT=3002
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
DATABASE_URL=postgresql://postgres:password@host:port/railway
```

**중요**: `DATABASE_URL`은 PostgreSQL 서비스에서 자동 생성된 값을 사용합니다.

---

## 🗄️ 데이터베이스 초기화

### 방법 1: Railway 대시보드 사용

1. PostgreSQL 서비스 선택
2. **"Query"** 탭 클릭
3. `server/schema.sql` 내용 복사해서 붙여넣기
4. **"Run"** 클릭

### 방법 2: psql CLI 사용

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# PostgreSQL에 연결
railway connect postgres

# 스키마 실행
psql < server/schema.sql
```

### 방법 3: 환경 변수로 직접 연결

```bash
# DATABASE_URL 환경 변수 설정 후
psql $DATABASE_URL

# 스키마 실행
\i server/schema.sql
```

---

## ✅ 배포 체크리스트

### 1. Railway 설정
- [ ] PostgreSQL 데이터베이스 생성
- [ ] 백엔드 서버에 `DATABASE_URL` 환경 변수 추가
- [ ] 스키마 SQL 실행
- [ ] 백엔드 서버 배포

### 2. Vercel 설정
- [ ] `VITE_SOCKET_URL` 환경 변수 설정
- [ ] `VITE_API_URL` 환경 변수 설정 (선택)
- [ ] 프론트엔드 빌드 및 배포

### 3. 연결 테스트
- [ ] 브라우저에서 앱 접속
- [ ] 개발자 도구 → Network 탭에서 API 호출 확인
- [ ] 데이터베이스에 데이터 저장되는지 확인

---

## 🎯 요약

**질문: DB 서버는 어디를 참조하는가?**

**답변**: 
- **PostgreSQL은 Railway 프로젝트 내 별도 서비스**로 생성됩니다
- **백엔드 서버(Express)가 이 PostgreSQL을 참조**합니다
- 백엔드 서버의 `DATABASE_URL` 환경 변수에 PostgreSQL 연결 정보가 들어갑니다

**데이터 흐름**:
```
프론트엔드 (Vercel)
    → API 호출
백엔드 (Railway Express 서버)
    → SQL 쿼리
데이터베이스 (Railway PostgreSQL)
```

모든 것이 **Railway 프로젝트 내부**에서 이루어지므로 네트워크 지연이 적고 설정이 간단합니다!

