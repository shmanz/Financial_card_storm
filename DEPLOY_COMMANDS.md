# 🚀 Railway 배포 명령어

## 수정 완료된 파일

1. ✅ `nixpacks.toml` - npm install 사용, package-lock.json 삭제
2. ✅ `.npmrc` - optional deps 강제, legacy-peer-deps
3. ✅ `package.json` - postinstall 스크립트 추가
4. ✅ `vite.config.ts` - rollup 최적화 설정

---

## Git 커밋 및 푸시

```powershell
# 변경사항 확인
git status

# 파일 추가
git add nixpacks.toml .npmrc package.json vite.config.ts RAILWAY_BUILD_FIX.md

# 커밋
git commit -m "Fix: Resolve rollup native dependency issue for Railway Linux build

- Change npm ci to npm install in nixpacks.toml
- Remove package-lock.json before install to regenerate for Linux
- Add --legacy-peer-deps flag for peer dependency conflicts
- Configure .npmrc to force optional dependencies
- Add postinstall script to rebuild native modules
- Optimize vite.config.ts for rollup native dependencies"

# 푸시
git push
```

---

## Railway 배포 확인

### 1. 배포 시작 확인
- Railway 대시보드 → 백엔드 서비스 → **Deployments**
- 새로운 배포가 자동으로 시작됨

### 2. 로그 확인
다음 단계가 성공적으로 실행되는지 확인:

```
[setup phase]
✅ Node.js 18, npm 9.x 설치

[install phase]
✅ rm -rf node_modules package-lock.json
✅ npm install --legacy-peer-deps
✅ Linux용 rollup 모듈 자동 설치

[build phase]
✅ npm run build
✅ Vite 빌드 성공

[start phase]
✅ npm start
✅ 서버 시작
```

---

## 예상 결과

✅ **빌드 성공**
- `npm install --legacy-peer-deps` 성공
- Linux용 `@rollup/rollup-linux-x64-gnu` 자동 설치
- `npm run build` 성공
- `dist` 폴더 생성

✅ **서버 시작**
- `npm start` 성공
- 서버가 정상적으로 실행됨

---

## 문제 해결 체크리스트

- [x] `npm ci` → `npm install` 변경
- [x] `package-lock.json` 삭제 후 재생성
- [x] `--legacy-peer-deps` 옵션 추가
- [x] Optional dependencies 강제 설치
- [x] Postinstall 스크립트 추가
- [x] Vite rollup 최적화 설정

---

## 완료! 🎉

이제 Railway 배포가 성공할 것입니다!
