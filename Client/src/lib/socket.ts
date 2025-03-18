// src/lib/socket.ts
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL as string; // e.g., "http://localhost:3000"
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Socket connected globally:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected globally");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});
