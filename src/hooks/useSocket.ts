/**
 * ========================================
 * Socket.IO 연결 훅
 * ========================================
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// 환경 변수로 백엔드 URL 관리 (Vercel 배포 대비)
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002'; // 백엔드 포트와 일치

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] 서버 연결 성공:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket.IO] 서버 연결 종료');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      // 싱글 플레이만 사용 시 경고 최소화
      console.warn('[Socket.IO] ⚠️ 멀티플레이 서버 미실행 (싱글 플레이는 정상)');
    });

    newSocket.on('error', (error) => {
      console.error('[Socket.IO] 에러:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
};

