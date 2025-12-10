# 🚨 긴급: npm ci 에러 해결

## 문제
Railway 배포 중 `npm ci` 실패:
```
npm error Missing: @types/pg@8.15.6 from lock file
npm error Missing: dotenv@16.6.1 from lock file
npm error Missing: pg@8.16.3 from lock file
```

## 원인
`package.json`에는 `pg`, `dotenv`, `@types/pg`가 있지만, `package-lock.json`에 반영되지 않았습니다.

## 해결 방법

### 방법 1: package-lock.json 수동 업데이트 (권장)

1. **로컬에서 다음 명령어 실행:**

```powershell
# package-lock.json 삭제
Remove-Item package-lock.json -Force

# 새로 생성
npm install

# 확인
Get-Content package-lock.json | Select-String -Pattern "pg|dotenv" | Select-Object -First 5
```

2. **Git에 커밋 및 푸시:**

```powershell
git add package-lock.json
git commit -m "Fix: Update package-lock.json with pg and dotenv"
git push
```

### 방법 2: Railway에서 npm install 사용 (임시 해결)

Railway 배포 설정에서 `npm ci` 대신 `npm install` 사용:

1. Railway 대시보드 → 백엔드 서비스 → **Settings**
2. **Build Command** 변경:
   - 기존: `npm ci`
   - 변경: `npm install`
3. 재배포

⚠️ **주의**: 이 방법은 권장되지 않습니다. `package-lock.json`을 업데이트하는 것이 올바른 해결책입니다.

### 방법 3: package.json에서 패키지 제거 후 재추가

```powershell
# package.json에서 제거
# (수동으로 package.json 편집)

# 재설치
npm install pg dotenv @types/pg --save --save-dev

# package-lock.json 확인
Get-Content package-lock.json | Select-String -Pattern "pg"
```

---

## 확인 사항

### package.json 확인
```json
{
  "dependencies": {
    "dotenv": "^16.4.7",
    "pg": "^8.13.1",
    ...
  },
  "devDependencies": {
    "@types/pg": "^8.11.10",
    ...
  }
}
```

### package-lock.json 확인
다음이 포함되어야 합니다:
- `"node_modules/pg"`
- `"node_modules/dotenv"`
- `"node_modules/@types/pg"`

---

## 다음 단계

1. ✅ `package-lock.json` 업데이트
2. ✅ Git 커밋 및 푸시
3. ✅ Railway 자동 배포 확인
4. ✅ 배포 성공 확인

---

## 예상 결과

배포 성공 후:
- ✅ `npm ci` 성공
- ✅ 서버 시작
- ✅ 데이터베이스 테이블 자동 생성
- ✅ API 정상 작동
