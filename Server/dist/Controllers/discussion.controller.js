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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscussionController = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const customError_1 = require("../utils/customError");
class DiscussionController {
    constructor(discussionService) {
        this.discussionService = discussionService;
    }
    getDiscussionsByLecture(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lectureId } = req.params;
                if (!lectureId)
                    throw new customError_1.BadRequestError("Lecture ID required");
                const discussions = yield this.discussionService.getDiscussionsByLecture(lectureId);
                (0, responseHandler_1.successResponse)(res, discussions, "Discussions retrieved successfully");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    createDiscussion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { lectureId, topic, mediaUrl } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!lectureId || !topic || !userId)
                    throw new customError_1.BadRequestError("Missing required fields");
                const discussion = yield this.discussionService.createDiscussion({
                    lectureId,
                    userId,
                    topic,
                    mediaUrl,
                });
                (0, responseHandler_1.successResponse)(res, discussion, "Discussion created successfully");
                const io = req.app.get("io");
                io.to(`lecture_${lectureId}`).emit("newDiscussion", discussion);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    getDiscussionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { discussionId } = req.params;
                if (!discussionId)
                    throw new customError_1.BadRequestError("Discussion ID required");
                const discussion = yield this.discussionService.getDiscussionById(discussionId);
                (0, responseHandler_1.successResponse)(res, discussion, "Discussion retrieved successfully");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    createComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { discussionId, content, mediaUrl } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!discussionId || !content || !userId)
                    throw new customError_1.BadRequestError("Missing required fields");
                const comment = yield this.discussionService.createComment({
                    discussionId,
                    userId,
                    content,
                    mediaUrl,
                });
                (0, responseHandler_1.successResponse)(res, comment, "Comment added successfully");
                const io = req.app.get("io");
                io.to(`discussion_${discussionId}`).emit("newComment", comment);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    editDiscussion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { discussionId, topic, mediaUrl } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!discussionId || !topic || !userId)
                    throw new customError_1.BadRequestError("Missing required fields");
                const updatedDiscussion = yield this.discussionService.editDiscussion(discussionId, userId, topic, mediaUrl);
                (0, responseHandler_1.successResponse)(res, updatedDiscussion, "Discussion updated successfully");
                const io = req.app.get("io");
                io.to(`lecture_${updatedDiscussion.lectureId}`).emit("editDiscussion", updatedDiscussion);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    deleteDiscussion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { discussionId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!discussionId || !userId)
                    throw new customError_1.BadRequestError("Missing required fields");
                const discussion = yield this.discussionService.getDiscussionById(discussionId);
                yield this.discussionService.deleteDiscussion(discussionId, userId);
                (0, responseHandler_1.successResponse)(res, null, "Discussion deleted successfully");
                const io = req.app.get("io");
                io.to(`lecture_${discussion.lectureId}`).emit("deleteDiscussion", {
                    discussionId,
                });
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    editComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { commentId, content, mediaUrl } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!commentId || !content || !userId)
                    throw new customError_1.BadRequestError("Missing required fields");
                const updatedComment = yield this.discussionService.editComment(commentId, userId, content, mediaUrl);
                (0, responseHandler_1.successResponse)(res, updatedComment, "Comment updated successfully");
                const io = req.app.get("io");
                io.to(`discussion_${updatedComment.discussionId}`).emit("editComment", updatedComment);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { commentId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!commentId || !userId)
                    throw new customError_1.BadRequestError("Missing required fields");
                const { discussionId } = yield this.discussionService.deleteComment(commentId, userId);
                (0, responseHandler_1.successResponse)(res, null, "Comment deleted successfully");
                const io = req.app.get("io");
                io.to(`discussion_${discussionId}`).emit("deleteComment", { commentId });
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
}
exports.DiscussionController = DiscussionController;
