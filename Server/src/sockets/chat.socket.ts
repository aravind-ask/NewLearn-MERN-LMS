import { Server, Socket } from "socket.io";

const onlineUsers = new Map<string, string>(); 

export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinUser", ({ userId }: { userId: string }) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined with socket ${socket.id}`);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on(
      "joinChatRoom",
      ({ courseId, userId }: { courseId: string; userId: string }) => {
        const room = `chat_${courseId}_${userId}`;
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
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
        mediaUrl?: string;
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
        io.to(room).emit("newMessage", messageData);

        if (messageData.role === "student") {
          const instructorRoom = `instructor_${messageData.recipientId}`;
          io.to(instructorRoom).emit("newChatMessage", messageData);
        }
      }
    );

    socket.on("editMessage", (messageData) => {
      const studentId =
        messageData.role === "student"
          ? messageData.senderId
          : messageData.recipientId;
      const room = `chat_${messageData.courseId}_${studentId}`;
      io.to(room).emit("messageEdited", messageData);
    });

    socket.on("deleteMessage", (messageData) => {
      const studentId =
        messageData.role === "student"
          ? messageData.senderId
          : messageData.recipientId;
      const room = `chat_${messageData.courseId}_${studentId}`;
      io.to(room).emit("messageDeleted", messageData);
    });

    socket.on("disconnect", () => {
      const userId = [...onlineUsers.entries()].find(
        ([, sid]) => sid === socket.id
      )?.[0];
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      }
    });
  });
};
