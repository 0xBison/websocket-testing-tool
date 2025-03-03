import { ref, reactive } from "vue";

export interface WebSocketMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: "sent" | "received" | "system";
  sessionId: string;
  systemType?: "connection" | "disconnection" | "error";
}

export interface WebSocketSession {
  id: string;
  url: string;
  name: string;
  status: "connected" | "disconnected";
  messages: WebSocketMessage[];
  connection: WebSocket | null;
  createdAt: Date;
  closedAt: Date | null;
}

// Create a reactive state for WebSocket sessions
const sessions = reactive<Record<string, WebSocketSession>>({});
const activeSessionId = ref<string | null>(null);

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Create a new WebSocket session
const createSession = (url: string, name?: string): string => {
  const id = generateId();
  const generatedName =
    name || `Connection ${Object.keys(sessions).length + 1}`;

  sessions[id] = {
    id,
    url,
    name: generatedName,
    status: "disconnected",
    messages: [],
    connection: null,
    createdAt: new Date(),
    closedAt: null,
  };
  return id;
};

// Update session name
const updateSessionName = (sessionId: string, newName: string): boolean => {
  const session = sessions[sessionId];
  if (!session) return false;

  session.name = newName;
  return true;
};

// Connect to a WebSocket
const connect = (sessionId: string): Promise<void> => {
  const session = sessions[sessionId];
  if (!session) return Promise.reject(new Error("Session not found"));

  if (session.status === "connected") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(session.url);

      // Update the session's connection
      session.connection = ws;

      ws.onopen = () => {
        session.status = "connected";

        // Add connection message to the session
        const message: WebSocketMessage = {
          id: generateId(),
          content: `Connected to: ${session.url}`,
          timestamp: new Date(),
          type: "system",
          sessionId: session.id,
          systemType: "connection",
        };
        session.messages.push(message);

        resolve();
      };

      ws.onmessage = (event) => {
        // Add received message to the session
        const message: WebSocketMessage = {
          id: generateId(),
          content: event.data,
          timestamp: new Date(),
          type: "received",
          sessionId: session.id,
        };
        session.messages.push(message);
      };

      ws.onerror = (error) => {
        // Add error message to the session
        const message: WebSocketMessage = {
          id: generateId(),
          content: `Failed to connect to: ${session.url}`,
          timestamp: new Date(),
          type: "system",
          sessionId: session.id,
          systemType: "error",
        };
        session.messages.push(message);

        // Reject the promise
        reject(new Error(`WebSocket connection error: ${error}`));
      };

      ws.onclose = () => {
        session.status = "disconnected";
        session.closedAt = new Date();

        // Add disconnection message to the session
        const message: WebSocketMessage = {
          id: generateId(),
          content: `Disconnected from: ${session.url}`,
          timestamp: new Date(),
          type: "system",
          sessionId: session.id,
          systemType: "disconnection",
        };
        session.messages.push(message);
      };
    } catch (error) {
      // Add error message to the session
      const message: WebSocketMessage = {
        id: generateId(),
        content: `Failed to connect to: ${session.url}`,
        timestamp: new Date(),
        type: "system",
        sessionId: session.id,
        systemType: "error",
      };
      session.messages.push(message);

      reject(error);
    }
  });
};

// Disconnect from a WebSocket
const disconnect = (sessionId: string): void => {
  const session = sessions[sessionId];
  if (!session || !session.connection) return;

  session.connection.close();
  session.status = "disconnected";
  session.connection = null;
  session.closedAt = new Date();

  if (activeSessionId.value === sessionId) {
    activeSessionId.value = null;
  }
};

// Send a message through the WebSocket
const sendMessage = (sessionId: string, content: string): void => {
  const session = sessions[sessionId];
  if (!session || !session.connection || session.status !== "connected") return;

  session.connection.send(content);

  const message: WebSocketMessage = {
    id: generateId(),
    content,
    timestamp: new Date(),
    type: "sent",
    sessionId,
  };

  session.messages.push(message);
};

// Get all sessions
const getSessions = (): Record<string, WebSocketSession> => {
  return sessions;
};

// Get a specific session
const getSession = (sessionId: string): WebSocketSession | undefined => {
  return sessions[sessionId];
};

// Get the active session
const getActiveSession = (): WebSocketSession | null => {
  if (!activeSessionId.value) return null;
  return sessions[activeSessionId.value] || null;
};

// Set the active session
const setActiveSession = (sessionId: string | null): void => {
  activeSessionId.value = sessionId;
};

export default {
  createSession,
  connect,
  disconnect,
  sendMessage,
  getSessions,
  getSession,
  getActiveSession,
  setActiveSession,
  updateSessionName,
  activeSessionId,
};
