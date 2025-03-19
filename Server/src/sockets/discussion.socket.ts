// sockets/discussion.socket.ts
import { Server } from "socket.io";

export function setupDiscussionSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("User connected to discussion socket:", socket.id);

    socket.on("joinLectureRoom", ({ lectureId }) => {
      // Changed from joinCourseRoom
      socket.join(`lecture_${lectureId}`);
      console.log(`User joined lecture room: lecture_${lectureId}`);
    });

    socket.on("joinDiscussionRoom", ({ discussionId }) => {
      socket.join(`discussion_${discussionId}`);
      console.log(`User joined discussion room: discussion_${discussionId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from discussion socket:", socket.id);
    });
  });
}
