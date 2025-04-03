"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChatSocket = void 0;
const notification_service_1 = __importDefault(require("../services/notification.service"));
const onlineUsers = new Map();
const setupChatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.on("joinUser", ({ userId }) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} joined with socket ${socket.id}`);
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        });
        socket.on("leaveUser", ({ userId }) => {
            onlineUsers.delete(userId);
            console.log(`User ${userId} left`);
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        });
        socket.on("joinChatRoom", ({ courseId, userId }) => {
            const room = `chat_${courseId}_${userId}`;
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });
        socket.on("joinInstructorRoom", ({ instructorId }) => {
            const room = `instructor_${instructorId}`;
            socket.join(room);
            console.log(`User ${socket.id} joined instructor room: ${room}`);
        });
        socket.on("sendMessage", (messageData) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Received message via Socket.IO:", messageData);
            const studentId = messageData.role === "student"
                ? messageData.senderId
                : messageData.recipientId;
            const room = `chat_${messageData.courseId}_${studentId}`;
            io.to(room).emit("newMessage", messageData);
            const recipientSocketId = onlineUsers.get(messageData.recipientId);
            if (messageData.role === "student") {
                const instructorRoom = `instructor_${messageData.recipientId}`;
                io.to(instructorRoom).emit("newChatMessage", messageData);
                const notification = yield notification_service_1.default.createNotification(messageData.recipientId, "message", "New Message", `${messageData.senderName} sent you a message in ${messageData.courseTitle}`, messageData._id);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit("newNotification", notification);
                    console.log(`Sent notification to instructor ${messageData.recipientId} at socket ${recipientSocketId}`);
                }
            }
            else {
                const notification = yield notification_service_1.default.createNotification(messageData.recipientId, "message", "Instructor Replied", `${messageData.senderName} replied to your message in ${messageData.courseTitle}`, messageData._id);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit("newNotification", notification);
                    console.log(`Sent notification to student ${messageData.recipientId} at socket ${recipientSocketId}`);
                }
            }
        }));
        socket.on("editMessage", (messageData) => {
            const studentId = messageData.role === "student"
                ? messageData.senderId
                : messageData.recipientId;
            const room = `chat_${messageData.courseId}_${studentId}`;
            io.to(room).emit("messageEdited", messageData);
        });
        socket.on("deleteMessage", (messageData) => {
            const studentId = messageData.role === "student"
                ? messageData.senderId
                : messageData.recipientId;
            const room = `chat_${messageData.courseId}_${studentId}`;
            io.to(room).emit("messageDeleted", messageData);
        });
        socket.on("disconnect", () => {
            var _a;
            const userId = (_a = [...onlineUsers.entries()].find(([, sid]) => sid === socket.id)) === null || _a === void 0 ? void 0 : _a[0];
            if (userId) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
                io.emit("onlineUsers", Array.from(onlineUsers.keys()));
            }
        });
    });
};
exports.setupChatSocket = setupChatSocket;
