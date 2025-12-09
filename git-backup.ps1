# Git Backup Script
$ErrorActionPreference = "Stop"

Set-Location "C:\Cursor\New Project"

# Git 저장소 초기화 (이미 있으면 무시)
if (-not (Test-Path ".git")) {
    Write-Host "Git 저장소 초기화 중..."
    git init
}

# 모든 파일 추가
Write-Host "파일 스테이징 중..."
git add .

# 상태 확인
Write-Host "`n현재 Git 상태:"
git status --short

# 커밋
$commitMessage = @"
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

### 5. 테스트 완료
- 싱글 플레이 피로도 시스템
- PvP 피로도 시스템
- PvP 승패 판정
- 패배자 오픈뱅킹 팝업
"@

Write-Host "`n커밋 생성 중..."
git commit -m $commitMessage

Write-Host "`n✅ Git 커밋 완료!"

# 원격 저장소 확인
Write-Host "`n원격 저장소 확인:"
$remotes = git remote -v
if ($remotes) {
    Write-Host $remotes
    Write-Host "`n원격 저장소가 설정되어 있습니다."
    Write-Host "기존 백업을 덮어쓰려면 다음 명령을 실행하세요:"
    Write-Host "git push --force origin main"
} else {
    Write-Host "원격 저장소가 설정되지 않았습니다."
    Write-Host "원격 저장소를 추가하려면:"
    Write-Host "git remote add origin <저장소 URL>"
}



