# 🔧 문제 해결 가이드

## ❌ 자주 발생하는 에러

### 1. `[nodemon] app crashed - waiting for file changes before starting..`

**원인**: 백엔드 서버가 시작 중 크래시

**해결**: ✅ 이미 해결됨!

아래 파일들이 추가되었습니다:
- `tsconfig.server.json` - 백엔드 전용 TypeScript 설정
- `nodemon.json` - Nodemon 설정
- `@types/node` 패키지 설치

**이제 다시 실행**:
```powershell
npm run server
```

또는

```powershell
npm run dev:full
```

---

### 2. `Module not found` 또는 `Cannot find module`

**원인**: 의존성 패키지 미설치

**해결**:
```powershell
npm install
```

---

### 3. `Port 3001 is already in use`

**원인**: 포트가 이미 다른 프로그램에서 사용 중

**해결 (Windows)**:
```powershell
# 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :3001

# PID 확인 후 종료 (예: PID가 1234인 경우)
taskkill /PID 1234 /F
```

또는 `server/index.ts`에서 포트 변경:
```typescript
const PORT = process.env.PORT || 3002; // 3001 → 3002로 변경
```

---

### 4. `CORS error` 또는 `Access-Control-Allow-Origin`

**원인**: Socket.IO 서버와 프론트엔드 주소 불일치

**확인**:
- `server/index.ts`: `cors: { origin: 'http://localhost:5173' }`
- `src/hooks/useSocket.ts`: `const SERVER_URL = 'http://localhost:3001'`

---

### 5. `socket.io-client` 연결 실패

**증상**: 멀티플레이 로비에서 🔴 **서버 연결 안됨**

**해결**:
1. 백엔드 서버 실행 여부 확인:
   ```powershell
   npm run server
   ```

2. 브라우저에서 테스트:
   ```
   http://localhost:3001/api/health
   ```
   → `{"status":"ok"}` 응답이 와야 함

3. 프론트엔드 재시작:
   ```powershell
   # Ctrl + C로 종료 후
   npm run dev
   ```

---

### 6. TypeScript 빌드 에러

**증상**: `tsc` 에러, 타입 불일치

**해결**:
```powershell
# node_modules 삭제 후 재설치
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

---

### 7. Framer Motion 애니메이션 작동 안 함

**원인**: 패키지 미설치

**해결**:
```powershell
npm install framer-motion
```

---

### 8. 카드 이미지 깨짐 (이모지 대신 깨진 이미지)

**원인**: ✅ 이미 해결됨! (이모지 사용)

실제 이미지 파일 사용하려면:
- `CUSTOM_CARD_IMAGES.md` 참고

---

### 9. `npm run dev:full` 실행 안 됨

**원인**: `concurrently` 패키지 미설치

**해결**:
```powershell
npm install -D concurrently
```

---

### 10. 백엔드 로그가 안 보여요

**확인**: 별도 터미널에서 실행 시:
```powershell
npm run server
```

로그 예시:
```
========================================
🎮 Financial Card Storm 멀티플레이 서버
========================================
포트: 3001
Socket.IO: 활성화
========================================
```

---

## 🆘 완전 초기화 (마지막 수단)

모든 게 작동하지 않을 때:

```powershell
# 1. node_modules 삭제
Remove-Item -Recurse -Force node_modules

# 2. package-lock.json 삭제
Remove-Item -Force package-lock.json

# 3. 캐시 정리
npm cache clean --force

# 4. 재설치
npm install

# 5. 실행
npm run dev:full
```

---

## 📞 추가 도움

### 로그 확인

**프론트엔드**: 브라우저 개발자 도구 (F12) → Console 탭

**백엔드**: 터미널 로그 확인

### 자주 사용하는 명령어

```powershell
# 프론트엔드만
npm run dev

# 백엔드만
npm run server

# 둘 다 동시에
npm run dev:full

# 빌드 테스트
npm run build
```

---

## ✅ 정상 작동 확인 체크리스트

- [ ] `npm install` 성공
- [ ] `npm run dev` 실행 → `http://localhost:5173` 접속 가능
- [ ] `npm run server` 실행 → 백엔드 로그 출력
- [ ] 멀티플레이 화면에서 🟢 **서버 연결됨**
- [ ] 싱글 플레이 → 카드 사용 → 보스 HP 감소
- [ ] 멀티플레이 → 방 생성 → 시크릿 모드에서 참가 가능

---

**여전히 문제가 있다면**: 에러 메시지 전체를 복사해서 질문해주세요!





