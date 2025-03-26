import { Server, Socket } from "socket.io";
import NotificationService from "../services/notification.service";

const onlineUsers = new Map<string, string>();

export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinUser", ({ userId }: { userId: string }) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined with socket ${socket.id}`);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("leaveUser", ({ userId }: { userId: string }) => {
      onlineUsers.delete(userId);
      console.log(`User ${userId} left`);
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
      async (messageData: {
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
        io.to(room).emit("newMessage", messageData);

        const recipientSocketId = onlineUsers.get(messageData.recipientId);

        if (messageData.role === "student") {
          const instructorRoom = `instructor_${messageData.recipientId}`;
          io.to(instructorRoom).emit("newChatMessage", messageData);

          const notification = await NotificationService.createNotification(
            messageData.recipientId,
            "message",
            "New Message",
            `${messageData.senderName} sent you a message in ${messageData.courseTitle}`,
            messageData._id
          );
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("newNotification", notification);
            console.log(
              `Sent notification to instructor ${messageData.recipientId} at socket ${recipientSocketId}`
            );
          }
        } else {
          const notification = await NotificationService.createNotification(
            messageData.recipientId,
            "message",
            "Instructor Replied",
            `${messageData.senderName} replied to your message in ${messageData.courseTitle}`,
            messageData._id
          );
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("newNotification", notification);
            console.log(
              `Sent notification to student ${messageData.recipientId} at socket ${recipientSocketId}`
            );
          }
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
