# 🔧 npm ci 에러 해결 가이드

## 문제
Railway 배포 중 `npm ci` 에러 발생:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: @types/pg@8.15.6 from lock file
npm error Missing: dotenv@16.6.1 from lock file
npm error Missing: pg@8.16.3 from lock file
```

## 원인
`package.json`에 새로운 패키지(`pg`, `dotenv`, `@types/pg`)가 추가되었지만, `package-lock.json`이 업데이트되지 않았습니다.

## 해결 방법

### 1단계: 로컬에서 package-lock.json 업데이트 ✅ (완료)
```bash
npm install
```
이미 실행 완료했습니다.

### 2단계: Git에 커밋 및 푸시

```bash
# 변경사항 확인
git status

# package-lock.json과 server/index.js 추가
git add package-lock.json server/index.js

# 커밋
git commit -m "Fix: Update package-lock.json and improve DB table auto-creation"

# 푸시
git push
```

### 3단계: Railway 자동 배포 확인

1. Railway 대시보드 → 백엔드 서비스 → **Deployments**
2. 새로운 배포가 시작되는지 확인
3. 로그에서 다음 메시지 확인:
   ```
   [DB] 🔄 데이터베이스 테이블 생성 시작...
   [DB] ✅ 데이터베이스 테이블 자동 생성 완료
   ```

---

## 확인 사항

### package-lock.json이 Git에 포함되어 있는지 확인

```bash
git ls-files | grep package-lock.json
```

만약 없다면:
```bash
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

---

## 예상 결과

배포 성공 후:
- ✅ `npm ci` 성공
- ✅ 서버 시작
- ✅ 데이터베이스 테이블 자동 생성
- ✅ API 정상 작동

---

## 추가 참고

- `npm ci`는 `package-lock.json`을 기반으로 정확한 버전을 설치합니다
- `package-lock.json`은 항상 Git에 포함해야 합니다
- 로컬에서 `npm install` 후 `package-lock.json` 변경사항을 커밋해야 합니다
