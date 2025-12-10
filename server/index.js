/**
 * ========================================
 * PART 4: PvP 멀티플레이 백엔드 서버 (CommonJS)
 * ========================================
 */

require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// CORS 설정: 환경 변수로 프론트엔드 URL 관리 (배포 대비)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// ========================================
// 데이터 구조
// ========================================

// 메모리 내 방 저장소
const rooms = new Map();
const players = new Map(); // socketId -> roomId 매핑

// ========================================
// 유틸리티 함수
// ========================================

function generateRoomId() {
  return `room-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function getRoomList() {
  return Array.from(rooms.values())
    .filter((room) => room.state === 'WAITING')
    .map(({ id, name, host, guest, createdAt }) => ({ id, name, host, guest, createdAt }));
}

// ========================================
// Socket.IO 이벤트 핸들러
// ========================================

io.on('connection', (socket) => {
  console.log(`[Socket.IO] 클라이언트 접속: ${socket.id}`);

  // 방 목록 요청
  socket.on('room:list', () => {
    const roomList = getRoomList();
    socket.emit('room:list', { rooms: roomList });
  });

  // 방 생성
  socket.on('room:create', (data) => {
    const roomId = generateRoomId();
    const player = {
      id: socket.id,
      socketId: socket.id,
      nickname: data.nickname,
      isReady: false
    };

    const room = {
      id: roomId,
      name: data.roomName,
      host: player,
      guest: null,
      state: 'WAITING',
      currentTurn: null,
      firstPlayer: null, // 선공 플레이어
      round: 1, // 현재 라운드
      turnCount: 0, // 라운드 내 턴 수 (0, 1, 2...)
      createdAt: new Date()
    };

    rooms.set(roomId, room);
    players.set(socket.id, roomId);
    socket.join(roomId);

    socket.emit('room:created', { roomId, room });
    io.emit('room:list', { rooms: getRoomList() });

    console.log(`[방 생성] ${roomId} - ${data.roomName} by ${data.nickname}`);
  });

  // 방 참가
  socket.on('room:join', (data) => {
    const room = rooms.get(data.roomId);

    if (!room) {
      socket.emit('room:error', { message: '존재하지 않는 방입니다.' });
      return;
    }

    if (room.guest !== null) {
      socket.emit('room:error', { message: '방이 가득 찼습니다.' });
      return;
    }

    const player = {
      id: socket.id,
      socketId: socket.id,
      nickname: data.nickname,
      isReady: false
    };

    room.guest = player;
    players.set(socket.id, data.roomId);
    socket.join(data.roomId);

    io.to(data.roomId).emit('room:joined', { room });
    io.emit('room:list', { rooms: getRoomList() });

    console.log(`[방 참가] ${data.nickname} -> ${room.name}`);
  });

  // 준비 상태 토글
  socket.on('player:ready', () => {
    const roomId = players.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    if (room.host.socketId === socket.id) {
      room.host.isReady = !room.host.isReady;
    } else if (room.guest && room.guest.socketId === socket.id) {
      room.guest.isReady = !room.guest.isReady;
    }

    io.to(roomId).emit('room:update', { room });

    // 둘 다 준비되면 게임 시작
    if (room.host.isReady && room.guest && room.guest.isReady) {
      room.state = 'PLAYING';
      
      // 랜덤 선공 결정
      const firstPlayer = Math.random() < 0.5 ? room.host.id : room.guest.id;
      room.currentTurn = firstPlayer;
      room.firstPlayer = firstPlayer;
      room.round = 1;
      room.turnCount = 0;

      io.to(roomId).emit('game:start', {
        room,
        firstPlayer: firstPlayer
      });

      console.log(`[게임 시작] ${room.name} - 선공: ${firstPlayer === room.host.id ? '호스트' : '게스트'}`);
    }
  });

  // 카드 사용 이벤트
  socket.on('game:playCard', (data) => {
    const roomId = players.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    if (room.currentTurn !== socket.id) {
      socket.emit('game:error', { message: '당신의 턴이 아닙니다.' });
      console.log(`[카드 사용 거부] ${socket.id} - 턴이 아님`);
      return;
    }

    // 상대에게 카드 사용 + HP 변경 브로드캐스트
    socket.to(roomId).emit('game:cardPlayed', {
      playerId: socket.id,
      cardId: data.cardId,
      cardName: data.cardName,
      damage: data.damage,
      effects: data.effects,
      attackerHp: data.attackerHp, // 공격자(카드 사용자)의 HP
      attackerShield: data.attackerShield, // 공격자의 실드
      newOpponentHp: data.newOpponentHp,
      newOpponentShield: data.newOpponentShield
    });

    console.log(`[카드 사용 브로드캐스트] ${socket.id} - ${data.cardName || data.cardId} (피해: ${data.damage}) → 상대에게 전송`);
  });

  // ========================================
  // 턴 종료 (라운드 시스템)
  // ========================================
  
  socket.on('game:turnEnded', (data) => {
    const roomId = players.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.guest) return;

    // 상대에게 턴 종료 + 상태 브로드캐스트
    socket.to(roomId).emit('game:turnEnded', {
      hp: data.hp,
      shield: data.shield,
      statusEffects: data.statusEffects,
      energy: data.energy,
      turn: data.turn
    });

    // 턴 카운트 증가
    room.turnCount += 1;

    // 턴 전환
    const nextPlayer = room.currentTurn === room.host.id ? room.guest.id : room.host.id;
    room.currentTurn = nextPlayer;

    // 라운드 체크: 선공 + 후공 모두 턴을 수행했는가?
    let isRoundComplete = false;
    if (room.turnCount >= 2) {
      // 라운드 완료!
      room.round += 1;
      room.turnCount = 0;
      isRoundComplete = true;

      console.log(`[라운드 완료] ${room.name} - 라운드 ${room.round} 시작, 양쪽 에너지 증가!`);
    }

    // 턴 전환 이벤트 (라운드 완료 여부 포함)
    io.to(roomId).emit('game:turnChanged', {
      currentTurn: room.currentTurn,
      round: room.round,
      turnCount: room.turnCount,
      isRoundComplete: isRoundComplete // 라운드 완료 시 true
    });

    console.log(`[턴 종료] ${socket.id} -> 다음 턴: ${room.currentTurn} (라운드 ${room.round}, 턴카운트 ${room.turnCount}, 라운드완료: ${isRoundComplete})`);
  });

  // 턴 종료 (레거시, 하위 호환용)
  socket.on('game:endTurn', () => {
    const roomId = players.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.guest) return;

    room.currentTurn = room.currentTurn === room.host.id ? room.guest.id : room.host.id;

    io.to(roomId).emit('game:turnChanged', {
      currentTurn: room.currentTurn
    });

    console.log(`[턴 종료 레거시] 다음 턴: ${room.currentTurn}`);
  });

  // ========================================
  // 게임 상태 동기화 (통합)
  // ========================================
  socket.on('game:stateSync', (data) => {
    const roomId = players.get(socket.id);
    if (!roomId) return;

    console.log('[상태 동기화] ' + socket.id + ' → 방 ' + roomId);
    console.log('[상태 동기화] HP:', data.hp, 'Shield:', data.shield, 'bossHp:', data.bossHp);

    // 상대에게 내 전체 상태 브로드캐스트
    socket.to(roomId).emit('game:stateSync', {
      hp: data.hp,          // 내 HP
      shield: data.shield,  // 내 실드
      statusEffects: data.statusEffects,
      energy: data.energy,
      turn: data.turn,
      bossHp: data.bossHp,      // 내가 본 상대 HP (상대 입장에서는 자기 HP)
      bossShield: data.bossShield
    });
  });

  // 게임 종료
  socket.on('game:finish', (data) => {
    const roomId = players.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.state = 'FINISHED';

    io.to(roomId).emit('game:end', {
      winner: data.winner
    });

    console.log(`[게임 종료] ${room.name} - 승자: ${data.winner}`);
  });

  // 방 나가기
  socket.on('room:leave', () => {
    const roomId = players.get(socket.id);
    if (!roomId) return;

    handlePlayerLeave(socket.id, roomId);
  });

  // 연결 종료
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] 클라이언트 접속 종료: ${socket.id}`);

    const roomId = players.get(socket.id);
    if (roomId) {
      handlePlayerLeave(socket.id, roomId);
    }
  });
});

// ========================================
// 플레이어 퇴장 처리
// ========================================

function handlePlayerLeave(socketId, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  // 게임 중이었다면 상대에게 알림
  if (room.state === 'PLAYING') {
    io.to(roomId).emit('game:playerLeft', { 
      message: '상대방이 게임을 떠났습니다.',
      leftPlayerId: socketId
    });
    console.log(`[게임 중 퇴장] ${socketId} from ${room.name}`);
  }

  if (room.host.socketId === socketId) {
    io.to(roomId).emit('room:closed', { message: '방장이 나갔습니다.' });
    rooms.delete(roomId);
    console.log(`[방 삭제] ${room.name}`);
  } else if (room.guest && room.guest.socketId === socketId) {
    room.guest = null;
    room.state = 'WAITING';
    room.host.isReady = false;

    io.to(roomId).emit('room:update', { room });
    console.log(`[플레이어 퇴장] ${socketId} from ${room.name}`);
  }

  players.delete(socketId);
  io.emit('room:list', { rooms: getRoomList() });
}

// ========================================
// REST API 엔드포인트
// ========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, players: players.size });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: getRoomList() });
});

// 사용자 관련 API (데이터베이스 연동)
if (process.env.DATABASE_URL) {
  const usersRouter = require('./api/users');
  const cardsRouter = require('./api/cards');
  const pvpRouter = require('./api/pvp');
  
  app.use('/api/users', usersRouter);
  app.use('/api/cards', cardsRouter);
  app.use('/api/pvp', pvpRouter);
  
  console.log('[API] ✅ 데이터베이스 API 활성화 (사용자, 카드, PvP 통계)');
} else {
  console.log('[API] ⚠️  DATABASE_URL이 설정되지 않아 데이터베이스 API가 비활성화되었습니다.');
  console.log('[API]    로컬 개발 시 .env 파일에 DATABASE_URL을 추가하세요.');
}

// ========================================
// 서버 시작
// ========================================

const PORT = process.env.PORT || 3002; // 3001 → 3002로 변경

httpServer.listen(PORT, () => {
  console.log(`
  ========================================
  🎮 Financial Card Storm 멀티플레이 서버
  ========================================
  포트: ${PORT}
  Socket.IO: 활성화
  CORS: ${allowedOrigins.join(', ')}
  환경: ${process.env.NODE_ENV || 'development'}
  ========================================
  `);
});

