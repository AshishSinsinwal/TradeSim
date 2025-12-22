import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  public socket: Socket;

  constructor() {
    // 1. Initialize immediately so listeners can be attached before connection
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false, 
      reconnection: true,
    });

    // Debug listeners
    this.socket.on('connect', () => console.log('✅ Socket Connected:', this.socket.id));
    this.socket.on('disconnect', () => console.warn('❌ Socket Disconnected'));
    this.socket.on('connect_error', (err) => console.error('⚠️ Connection Error:', err.message));
  }

  connect(token: string) {
    if (this.socket.connected) return;

    this.socket.auth = { token };
    this.socket.connect();
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  on<T = any>(event: string, callback: (data: T) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket.off(event, callback);
  }

  // ✅ ADDED BACK: The missing method
  isConnected() {
    return this.socket.connected;
  }
}

export const socketService = new SocketService();