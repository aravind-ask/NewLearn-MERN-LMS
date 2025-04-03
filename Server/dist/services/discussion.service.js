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
exports.DiscussionService = void 0;
const Comment_1 = require("../models/Comment");
const mongoose_1 = __importDefault(require("mongoose"));
const customError_1 = require("../utils/customError");
class DiscussionService {
    constructor(discussionRepository) {
        this.discussionRepository = discussionRepository;
    }
    getDiscussionsByLecture(lectureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussions = yield this.discussionRepository.getDiscussionsByLecture(lectureId);
            return Promise.all(discussions.map((discussion) => __awaiter(this, void 0, void 0, function* () {
                const commentsCount = yield Comment_1.Comment.countDocuments({
                    discussionId: discussion._id,
                });
                return Object.assign(Object.assign({}, discussion), { commentsCount });
            })));
        });
    }
    createDiscussion(discussion) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.discussionRepository.createDiscussion({
                lectureId: new mongoose_1.default.Types.ObjectId(discussion.lectureId),
                userId: new mongoose_1.default.Types.ObjectId(discussion.userId),
                topic: discussion.topic,
                mediaUrl: discussion.mediaUrl,
            });
        });
    }
    getDiscussionById(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield this.discussionRepository.getDiscussionById(discussionId);
            const comments = yield this.discussionRepository.getCommentsByDiscussion(discussionId);
            return Object.assign(Object.assign({}, discussion), { comments });
        });
    }
    createComment(comment) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.discussionRepository.createComment({
                discussionId: new mongoose_1.default.Types.ObjectId(comment.discussionId),
                userId: new mongoose_1.default.Types.ObjectId(comment.userId),
                content: comment.content,
                mediaUrl: comment.mediaUrl,
            });
        });
    }
    editDiscussion(discussionId, userId, topic, mediaUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield this.discussionRepository.getDiscussionById(discussionId);
            if (discussion.userId._id.toString() !== userId) {
                throw new customError_1.ForbiddenError("You can only edit your own discussions");
            }
            return yield this.discussionRepository.editDiscussion(discussionId, topic, mediaUrl);
        });
    }
    deleteDiscussion(discussionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield this.discussionRepository.getDiscussionById(discussionId);
            if (discussion.userId._id.toString() !== userId) {
                throw new customError_1.ForbiddenError("You can only delete your own discussions");
            }
            yield this.discussionRepository.deleteDiscussion(discussionId);
        });
    }
    editComment(commentId, userId, content, mediaUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield Comment_1.Comment.findById(new mongoose_1.default.Types.ObjectId(commentId)).lean();
            if (!comment)
                throw new Error("Comment not found");
            if (comment.userId.toString() !== userId) {
                throw new customError_1.ForbiddenError("You can only edit your own comments");
            }
            return yield this.discussionRepository.editComment(commentId, content, mediaUrl);
        });
    }
    deleteComment(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield Comment_1.Comment.findById(new mongoose_1.default.Types.ObjectId(commentId)).lean();
            if (!comment)
                throw new Error("Comment not found");
            if (comment.userId.toString() !== userId) {
                throw new customError_1.ForbiddenError("You can only delete your own comments");
            }
            return yield this.discussionRepository.deleteComment(commentId);
        });
    }
}
exports.DiscussionService = DiscussionService;
