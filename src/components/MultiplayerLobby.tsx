/**
 * ========================================
 * PART 4: 멀티플레이 로비 UI
 * ========================================
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Socket } from 'socket.io-client';

interface Player {
  id: string;
  socketId: string;
  nickname: string;
  isReady: boolean;
}

interface Room {
  id: string;
  name: string;
  host: Player;
  guest: Player | null;
  createdAt: Date;
}

interface MultiplayerLobbyProps {
  socket: Socket;
  onStartGame: (roomId: string, isFirstPlayer: boolean, opponentNickname: string) => void;
  onBack: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  socket,
  onStartGame,
  onBack
}) => {
  const [nickname, setNickname] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // 연결 상태 확인
    setIsConnected(socket.connected);

    socket.on('connect', () => {
      setIsConnected(true);
      setError('');
      console.log('[멀티플레이] 서버 연결 성공');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setError('서버 연결이 끊어졌습니다. 백엔드 서버를 실행해주세요.');
      console.log('[멀티플레이] 서버 연결 종료');
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setError('서버에 연결할 수 없습니다. npm run server로 백엔드를 실행해주세요.');
      console.error('[멀티플레이] 연결 실패:', err.message);
    });

    // 방 목록 수신
    socket.on('room:list', (data: { rooms: Room[] }) => {
      setRooms(data.rooms);
    });

    // 방 생성 성공
    socket.on('room:created', (data: { roomId: string; room: Room }) => {
      setCurrentRoom(data.room);
    });

    // 방 참가 성공
    socket.on('room:joined', (data: { room: Room }) => {
      setCurrentRoom(data.room);
    });

    // 방 업데이트
    socket.on('room:update', (data: { room: Room }) => {
      setCurrentRoom(data.room);
    });

    // 게임 시작
    socket.on('game:start', (data: { room: Room; firstPlayer: string }) => {
      const isFirst = socket.id === data.firstPlayer;
      
      // 상대 닉네임 찾기
      const mySocketId = socket.id;
      const opponent = data.room.host.socketId === mySocketId ? data.room.guest : data.room.host;
      const opponentName = opponent?.nickname || '상대';
      
      console.log('[로비] 게임 시작! 내가 선공:', isFirst, '상대:', opponentName);
      onStartGame(data.room.id, isFirst, opponentName);
    });

    // 방 닫힘
    socket.on('room:closed', (data: { message: string }) => {
      setError(data.message);
      setCurrentRoom(null);
    });

    // 에러
    socket.on('room:error', (data: { message: string }) => {
      setError(data.message);
    });

    // 초기 방 목록 요청
    socket.emit('room:list');

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room:list');
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:update');
      socket.off('game:start');
      socket.off('room:closed');
      socket.off('room:error');
    };
  }, [socket, onStartGame]);

  const handleCreateRoom = () => {
    if (!socket || !nickname.trim() || !roomName.trim()) {
      setError('닉네임과 방 이름을 입력하세요.');
      return;
    }

    socket.emit('room:create', { nickname: nickname.trim(), roomName: roomName.trim() });
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket || !nickname.trim()) {
      setError('닉네임을 입력하세요.');
      return;
    }

    socket.emit('room:join', { roomId, nickname: nickname.trim() });
  };

  const handleReady = () => {
    if (!socket) return;
    socket.emit('player:ready');
  };

  const handleLeaveRoom = () => {
    if (!socket) return;
    socket.emit('room:leave');
    setCurrentRoom(null);
  };

  const isMyTurn = (player: Player) => {
    return socket && player.socketId === socket.id;
  };

  // 대기실에 있을 때
  if (currentRoom) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
        <motion.div
          className="w-full max-w-2xl rounded-2xl border border-cyan-500/60 bg-slate-900/90 p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-cyan-100">{currentRoom.name}</h2>
            <button
              onClick={handleLeaveRoom}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
            >
              방 나가기
            </button>
          </div>

          <div className="space-y-4">
            {/* 플레이어 1 (호스트) */}
            <div
              className={`rounded-xl border-2 p-4 ${
                isMyTurn(currentRoom.host)
                  ? 'border-cyan-500 bg-cyan-900/20'
                  : 'border-slate-600 bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold">
                    👑
                  </div>
                  <div>
                    <div className="font-semibold text-cyan-100">
                      {currentRoom.host.nickname}
                    </div>
                    <div className="text-xs text-slate-400">호스트</div>
                  </div>
                </div>
                {currentRoom.host.isReady && (
                  <span className="rounded-full bg-green-500/30 px-3 py-1 text-xs font-semibold text-green-300">
                    준비 완료
                  </span>
                )}
              </div>
            </div>

            {/* 플레이어 2 (게스트) */}
            {currentRoom.guest ? (
              <div
                className={`rounded-xl border-2 p-4 ${
                  isMyTurn(currentRoom.guest)
                    ? 'border-cyan-500 bg-cyan-900/20'
                    : 'border-slate-600 bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-xl font-bold">
                      🎮
                    </div>
                    <div>
                      <div className="font-semibold text-rose-100">
                        {currentRoom.guest.nickname}
                      </div>
                      <div className="text-xs text-slate-400">도전자</div>
                    </div>
                  </div>
                  {currentRoom.guest.isReady && (
                    <span className="rounded-full bg-green-500/30 px-3 py-1 text-xs font-semibold text-green-300">
                      준비 완료
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 p-4 text-center text-slate-400">
                플레이어 대기 중...
              </div>
            )}

            {/* 준비 버튼 */}
            <button
              onClick={handleReady}
              disabled={!currentRoom.guest}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:from-cyan-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {socket && isMyTurn(currentRoom.host)
                ? currentRoom.host.isReady
                  ? '준비 취소'
                  : '준비 완료'
                : currentRoom.guest && isMyTurn(currentRoom.guest)
                ? currentRoom.guest.isReady
                  ? '준비 취소'
                  : '준비 완료'
                : '준비하기'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 로비 화면
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <motion.div
        className="w-full max-w-4xl space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-cyan-100">멀티플레이 로비</h1>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-slate-400">
                {isConnected ? '서버 연결됨' : '서버 연결 안됨'}
              </span>
            </div>
          </div>
          <button
            onClick={onBack}
            className="rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            뒤로 가기
          </button>
        </div>

        {error && (
          <motion.div
            className="rounded-lg border border-red-500/50 bg-red-900/30 p-4 text-sm text-red-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="font-semibold mb-1">❌ {error}</div>
            {!isConnected && (
              <div className="mt-2 text-xs text-red-300 space-y-1">
                <p>📌 백엔드 서버를 실행해주세요:</p>
                <code className="block bg-red-950/50 p-2 rounded mt-1">npm run server</code>
                <p className="mt-1">또는 프론트엔드+백엔드 동시 실행:</p>
                <code className="block bg-red-950/50 p-2 rounded mt-1">npm run dev:full</code>
              </div>
            )}
          </motion.div>
        )}

        {!isConnected && !error && (
          <motion.div
            className="rounded-lg border border-yellow-500/50 bg-yellow-900/30 p-4 text-sm text-yellow-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="font-semibold mb-1">⚠️ 백엔드 서버 연결 필요</div>
            <div className="text-xs text-yellow-300 space-y-1">
              <p>멀티플레이를 하려면 백엔드 서버를 실행해주세요:</p>
              <code className="block bg-yellow-950/50 p-2 rounded mt-1">npm run server</code>
              <p className="mt-1">또는:</p>
              <code className="block bg-yellow-950/50 p-2 rounded mt-1">npm run dev:full</code>
            </div>
          </motion.div>
        )}

        {/* 방 생성 */}
        <div className="rounded-2xl border border-cyan-500/60 bg-slate-900/90 p-6">
          <h2 className="mb-4 text-lg font-semibold text-cyan-100">새 방 만들기</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="방 이름"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected}
              className="rounded-lg bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-600"
            >
              방 생성
            </button>
          </div>
        </div>

        {/* 방 목록 */}
        <div className="rounded-2xl border border-cyan-500/60 bg-slate-900/90 p-6">
          <h2 className="mb-4 text-lg font-semibold text-cyan-100">
            대기 중인 방 ({rooms.length})
          </h2>
          <div className="space-y-2">
            <AnimatePresence>
              {rooms.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  대기 중인 방이 없습니다. 새로운 방을 만들어보세요!
                </div>
              ) : (
                rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div>
                      <div className="font-semibold text-slate-100">{room.name}</div>
                      <div className="text-xs text-slate-400">
                        호스트: {room.host.nickname}
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="rounded-md bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                    >
                      참가하기
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

