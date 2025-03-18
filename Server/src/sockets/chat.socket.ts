// src/sockets/chat.socket.ts
import { Server, Socket } from "socket.io";

export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on(
      "joinChatRoom",
      ({ courseId, userId }: { courseId: string; userId: string }) => {
        const room = `chat_${courseId}_${userId}`;
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
        console.log(
          `Clients in room ${room}:`,
          io.sockets.adapter.rooms.get(room)?.size || 0
        );
      }
    );

    socket.on(
      "joinInstructorRoom",
      ({ instructorId }: { instructorId: string }) => {
        const room = `instructor_${instructorId}`;
        socket.join(room);
        console.log(`User ${socket.id} joined instructor room: ${room}`);
      }
    );

    socket.on(
      "sendMessage",
      (messageData: {
        _id: string;
        courseId: string;
        senderId: string;
        recipientId: string;
        message: string;
        timestamp: string;
        isRead: boolean;
        courseTitle?: string;
        senderName?: string;
        role?: "student" | "instructor";
      }) => {
        console.log("Received message via Socket.IO:", messageData);
        const studentId =
          messageData.role === "student"
            ? messageData.senderId
            : messageData.recipientId;
        const room = `chat_${messageData.courseId}_${studentId}`;

        // Broadcast to the chat room
        io.to(room).emit("newMessage", messageData);
        console.log(`Message broadcasted to room: ${room}`);
        console.log(
          `Clients in room ${room}:`,
          io.sockets.adapter.rooms.get(room)?.size || 0
        );

        // If this is a student message (new or existing chat), notify the instructor globally
        if (messageData.role === "student") {
          const instructorRoom = `instructor_${messageData.recipientId}`;
          io.to(instructorRoom).emit("newChatMessage", messageData);
          console.log(`Notified instructor room: ${instructorRoom}`);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
