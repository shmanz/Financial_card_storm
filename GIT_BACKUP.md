# 🚀 Git 백업 가이드

## 📦 이번 업데이트 변경사항 (v6.0)

### 1. 피로도 시스템 구현
- **파일**: `src/types/game.ts`, `src/gameState.ts`
- **기능**: 덱이 비었을 때 피로도 1→2→3→4... 순차적 피해
- **적용**: 싱글/PvP 모두

### 2. PvP 턴 관리 개선
- **파일**: `src/gameState.ts`, `src/App.tsx`, `src/components/PvPBattle.tsx`
- **수정**: 턴 시작 시에만 드로우, 턴 종료 시 드로우 제거
- **효과**: 본인 턴에만 카드 드로우 + 에너지 증가

### 3. PvP 승패 판정 수정
- **파일**: `src/gameState.ts`
- **수정**: 
  - `UPDATE_MY_HP_FROM_OPPONENT`: 패배 체크 추가
  - `OPPONENT_ACTION`: 승리 체크 추가
- **효과**: 패배자에게만 오픈뱅킹 팝업 표시

### 4. UI 개선
- **파일**: `src/App.tsx`, `src/components/PvPBattle.tsx`
- **추가**: 피로도 카운터 표시
- **추가**: 디버그 정보 강화

---

## 💻 Git 백업 명령어

### 방법 1: PowerShell 스크립트 사용 (추천)

```powershell
# 프로젝트 폴더에서 실행
.\git-backup.ps1
```

### 방법 2: 수동 명령어

#### 1단계: Git 초기화 및 커밋
```powershell
cd "C:\Cursor\New Project"
git init
git add .
git commit -m "feat: PvP 피로도 시스템 및 패배자 오픈뱅킹 구현"
```

#### 2단계: 원격 저장소 확인
```powershell
git remote -v
```

**원격 저장소가 없으면:**
```powershell
git remote add origin <GitHub/GitLab 저장소 URL>
```

#### 3단계: 푸시
```powershell
# 처음 푸시
git push -u origin main

# 기존 백업 덮어쓰기 (--force)
git push --force origin main
```

---

## 📝 상세 커밋 메시지

```
feat: PvP 피로도 시스템 및 패배자 오픈뱅킹 팝업 구현

## 주요 변경사항

### 1. 피로도 시스템 추가
- 덱이 비었을 때 카드 드로우 시 피로도 발동
- 피로도 1→2→3→4... 순차적으로 증가하며 해당 수치만큼 피해
- 싱글/PvP 모두 적용
- UI에 피로도 카운터 표시

### 2. PvP 승패 판정 수정
- UPDATE_MY_HP_FROM_OPPONENT: 내 HP 0 시 패배 처리
- OPPONENT_ACTION: 상대 HP 0 시 승리 처리
- 패배자에게만 오픈뱅킹 팝업 표시

### 3. 턴 관리 시스템 개선
- PvP 턴 시작: 에너지 +1, 카드 드로우 +1
- PvP 턴 종료: 상대에게 턴 넘김만 (드로우/에너지 증가 없음)
- END_TURN에서 중복 드로우 제거

### 4. 수정된 파일
- src/types/game.ts: GameState에 fatigue 필드 추가
- src/gameState.ts: 피로도 로직 및 승패 판정 수정
- src/App.tsx: 피로도 UI 및 오픈뱅킹 팝업 개선
- src/components/PvPBattle.tsx: PvP 피로도 표시 및 디버그 정보
```

---

## ✅ 백업 확인

```powershell
# 커밋 히스토리 확인
git log --oneline

# 변경된 파일 확인
git status

# 마지막 커밋 내용 확인
git show HEAD
```

---

## 🔄 다음 작업 시 백업

```powershell
# 변경사항 추가
git add .

# 커밋
git commit -m "update: 설명"

# 푸시 (덮어쓰기)
git push --force origin main
```



