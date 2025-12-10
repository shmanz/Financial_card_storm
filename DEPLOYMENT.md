# 🚀 멀티플레이 서버 배포 가이드

## 📋 개요

이 가이드에서는 **Railway**를 사용하여 멀티플레이 백엔드 서버를 클라우드에 배포하는 방법을 설명합니다.

---

## 🎯 배포 옵션 비교

| 플랫폼 | 무료 티어 | 난이도 | 추천도 |
|--------|----------|--------|--------|
| **Railway** | ✅ $5 크레딧/월 | ⭐ 쉬움 | ⭐⭐⭐⭐⭐ |
| **Render** | ✅ 제한적 | ⭐⭐ 보통 | ⭐⭐⭐⭐ |
| **Fly.io** | ✅ 제한적 | ⭐⭐ 보통 | ⭐⭐⭐ |
| **Heroku** | ❌ 없음 | ⭐⭐ 보통 | ⭐⭐ |

**→ Railway 추천!** 가장 간단하고 빠릅니다.

---

## 🚂 Railway 배포 (추천)

### 1단계: Railway 계정 생성

1. [Railway.app](https://railway.app) 접속
2. **"Login"** 클릭 → GitHub 계정으로 로그인
3. 무료로 **$5 크레딧/월** 제공

### 2단계: 새 프로젝트 생성

1. Railway 대시보드에서 **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. GitHub 저장소 선택 (또는 먼저 GitHub에 푸시)

### 3단계: 서비스 설정

1. **"Add Service"** → **"Empty Service"** 선택
2. 서비스 이름: `financial-card-storm-backend`

### 4단계: 환경 변수 설정

Railway 대시보드 → **Variables** 탭에서 다음 변수 추가:

```env
NODE_ENV=production
PORT=3002
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

**중요:**
- `ALLOWED_ORIGINS`에 **Vercel 배포된 프론트엔드 URL** 추가
- 여러 URL은 쉼표(`,`)로 구분
- 예: `https://financial-card-storm.vercel.app,http://localhost:5173`

### 5단계: 배포 설정

Railway 대시보드 → **Settings** 탭:

- **Root Directory**: (비워두기 - 루트 사용)
- **Build Command**: (비워두기 - 빌드 불필요)
- **Start Command**: `npm start`

### 6단계: 배포 확인

1. Railway가 자동으로 배포 시작
2. **Deployments** 탭에서 배포 상태 확인
3. 배포 완료 후 **Settings** → **Generate Domain** 클릭
4. 생성된 URL 확인 (예: `https://financial-card-storm-backend-production.up.railway.app`)

### 7단계: PostgreSQL 데이터베이스 추가 (선택사항)

**데이터 영구 저장을 원한다면:**

1. Railway 프로젝트에서 **"New"** → **"Database"** → **"Add PostgreSQL"** 선택
2. PostgreSQL 서비스 생성 완료 후 **"Variables"** 탭에서 `DATABASE_URL` 확인
3. 백엔드 서비스의 **Variables** 탭에 `DATABASE_URL` 추가
4. PostgreSQL 서비스의 **"Query"** 탭에서 `server/schema.sql` 실행
5. 서버 재배포

**자세한 내용**: `DEPLOYMENT_ARCHITECTURE.md` 참조

### 8단계: 프론트엔드 환경 변수 설정

**Vercel 배포 시:**

1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. 다음 변수 추가:

```env
VITE_SOCKET_URL=https://your-railway-url.up.railway.app
VITE_API_URL=https://your-railway-url.up.railway.app
```

3. **Redeploy** 실행

**로컬 개발 시:**

`.env.local` 파일 생성:

```env
VITE_SOCKET_URL=https://your-railway-url.up.railway.app
VITE_API_URL=https://your-railway-url.up.railway.app
```

---

## 🌐 Render 배포 (대안)

### 1단계: Render 계정 생성

1. [Render.com](https://render.com) 접속
2. GitHub 계정으로 로그인

### 2단계: 새 Web Service 생성

1. **"New"** → **"Web Service"** 선택
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `financial-card-storm-backend`
   - **Environment**: `Node`
   - **Build Command**: (비워두기)
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3단계: 환경 변수 설정

**Environment Variables** 섹션:

```env
NODE_ENV=production
PORT=10000
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 4단계: 배포

1. **"Create Web Service"** 클릭
2. 배포 완료 후 URL 확인 (예: `https://financial-card-storm-backend.onrender.com`)

---

## 🔧 서버 설정 확인

### CORS 설정

서버는 `ALLOWED_ORIGINS` 환경 변수로 허용된 프론트엔드만 접속 가능합니다.

**로컬 개발:**
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**프로덕션:**
```env
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### 포트 설정

- Railway: 자동 할당 (환경 변수 `PORT` 사용)
- Render: `10000` 고정

---

## ✅ 배포 확인 체크리스트

- [ ] Railway/Render에서 서버 배포 완료
- [ ] 서버 URL 확인 (예: `https://xxx.up.railway.app`)
- [ ] 환경 변수 `ALLOWED_ORIGINS` 설정 완료
- [ ] Vercel에 `VITE_SOCKET_URL` 환경 변수 추가
- [ ] 프론트엔드 재배포 완료
- [ ] 브라우저에서 멀티플레이 테스트

---

## 🐛 문제 해결

### 문제 1: CORS 에러

**증상:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**해결:**
1. `ALLOWED_ORIGINS`에 프론트엔드 URL이 포함되어 있는지 확인
2. URL 끝에 슬래시(`/`) 없이 정확히 입력
3. 서버 재배포

### 문제 2: 연결 실패

**증상:**
```
Failed to connect to socket.io server
```

**해결:**
1. `VITE_SOCKET_URL` 환경 변수가 올바른지 확인
2. 서버가 실행 중인지 Railway/Render 대시보드에서 확인
3. 브라우저 콘솔에서 실제 연결 URL 확인

### 문제 3: 서버가 시작되지 않음

**증상:**
Railway/Render에서 배포 실패

**해결:**
1. `package.json`에 `"start": "node server/index.js"` 스크립트 확인
2. `server/index.js` 파일이 존재하는지 확인
3. 로컬에서 `npm start` 실행 테스트

---

## 📊 비용 예상

### Railway
- **무료**: $5 크레딧/월
- **Hobby Plan**: $5/월 (추가 크레딧)
- **예상 사용량**: 소규모 멀티플레이 → 무료 티어로 충분

### Render
- **무료**: 제한적 (15분 비활성 시 슬리핑)
- **Starter Plan**: $7/월 (항상 실행)
- **예상 사용량**: 테스트용 → 무료, 프로덕션 → 유료 권장

---

## 🎉 완료!

배포가 완료되면:

1. ✅ **프론트엔드**: Vercel에 배포
2. ✅ **백엔드**: Railway/Render에 배포
3. ✅ **멀티플레이**: 전 세계 어디서나 가능!

---

## 📚 추가 리소스

- [Railway 문서](https://docs.railway.app)
- [Render 문서](https://render.com/docs)
- [Socket.IO 배포 가이드](https://socket.io/docs/v4/deployment/)

