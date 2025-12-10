# 🔧 Rollup Linux 모듈 에러 해결

## 문제
Railway 배포 중 빌드 에러:
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

## 원인
- `package-lock.json`이 Windows 환경에서 생성되어 Windows용 rollup만 포함됨
- Railway는 Linux 환경이므로 Linux용 rollup이 필요함
- `npm ci`는 optional dependencies를 기본적으로 설치하지 않음

## 해결 방법

### ✅ 해결책 적용 완료

1. **`.npmrc` 파일 생성** ✅
   - `optional=true` 설정으로 optional dependencies 항상 설치

2. **`nixpacks.toml` 파일 생성** ✅
   - `npm ci --include=optional` 사용하여 optional dependencies 포함

---

## 다음 단계

Git 커밋 및 푸시:

```powershell
git add .npmrc nixpacks.toml
git commit -m "Fix: Include optional dependencies for Railway Linux build (rollup-linux-x64-gnu)"
git push
```

---

## 예상 결과

배포 성공 후:
- ✅ `npm ci --include=optional` 성공
- ✅ Linux용 rollup 모듈 (`@rollup/rollup-linux-x64-gnu`) 설치
- ✅ `npm run build` 성공
- ✅ 서버 시작

---

## 참고

- `@rollup/rollup-linux-x64-gnu`는 rollup의 optional dependency입니다
- Windows에서는 `@rollup/rollup-win32-x64-gnu`가 설치됩니다
- Linux에서는 `@rollup/rollup-linux-x64-gnu`가 필요합니다
- `npm ci --include=optional`로 optional dependencies를 포함할 수 있습니다
- `.npmrc` 파일로 전역적으로 optional dependencies를 활성화할 수 있습니다

---

## 대안 방법 (Railway 대시보드)

만약 위 방법이 작동하지 않으면:

1. Railway 대시보드 → 백엔드 서비스 → **Settings**
2. **Build Command** 변경:
   - 기존: `npm ci`
   - 변경: `npm ci --include=optional`
3. 재배포
