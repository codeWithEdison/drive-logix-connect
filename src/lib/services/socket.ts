import { io, Socket } from "socket.io-client";

type SocketEvents = {
  [event: string]: (...args: any[]) => void;
};

let socketInstance: Socket | null = null;
let currentToken: string | null = null;

// Always use deployed backend everywhere unless explicitly overridden via environment variable
const API_BASE = (import.meta.env.VITE_API_BASE_URL ||
  "https://api.lovewaylogistics.com") as string;

export function getSocket(token: string): Socket {
  if (socketInstance && currentToken === token) return socketInstance;

  // Disconnect existing if token changed
  if (socketInstance) {
    try {
      socketInstance.disconnect();
    } catch (error) {
      console.warn("Socket disconnect error:", error);
    }
    socketInstance = null;
  }

  currentToken = token;
  socketInstance = io(`${API_BASE}/socket.io`, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  });

  return socketInstance;
}

export function joinRoom(room: string) {
  if (!socketInstance) return;
  socketInstance.emit("join", { room });
}

export function leaveRoom(room: string) {
  if (!socketInstance) return;
  socketInstance.emit("leave", { room });
}

export function on<E extends keyof SocketEvents>(
  event: E,
  cb: SocketEvents[E]
) {
  if (!socketInstance) return;
  socketInstance.on(event as string, cb as any);
}

export function off<E extends keyof SocketEvents>(
  event: E,
  cb?: SocketEvents[E]
) {
  if (!socketInstance) return;
  if (cb) socketInstance.off(event as string, cb as any);
  else socketInstance.off(event as string);
}

export function disconnectSocket() {
  if (!socketInstance) return;
  try {
    socketInstance.disconnect();
  } finally {
    socketInstance = null;
    currentToken = null;
  }
}

// Helper for component lifecycle
export function setupRoom(
  token: string,
  room: string,
  handlers?: SocketEvents
) {
  const s = getSocket(token);
  s.once("connect", () => joinRoom(room));
  if (handlers) {
    Object.entries(handlers).forEach(([evt, fn]) => on(evt, fn as any));
  }
  const cleanup = () => {
    if (handlers) {
      Object.entries(handlers).forEach(([evt, fn]) =>
        off(evt as any, fn as any)
      );
    }
    leaveRoom(room);
  };
  return { socket: s, cleanup };
}
