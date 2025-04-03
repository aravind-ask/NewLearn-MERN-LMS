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
exports.DiscussionRepository = void 0;
const Discussion_1 = require("../models/Discussion");
const Comment_1 = require("../models/Comment");
const customError_1 = require("../utils/customError");
const mongoose_1 = __importDefault(require("mongoose"));
class DiscussionRepository {
    getDiscussionsByLecture(lectureId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Discussion_1.Discussion.find({
                lectureId: new mongoose_1.default.Types.ObjectId(lectureId),
            })
                .populate("userId", "name")
                .lean();
        });
    }
    createDiscussion(discussion) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdDiscussion = yield Discussion_1.Discussion.create(discussion);
            return createdDiscussion.toObject();
        });
    }
    getDiscussionById(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield Discussion_1.Discussion.findById(new mongoose_1.default.Types.ObjectId(discussionId))
                .populate("userId", "name")
                .lean();
            if (!discussion)
                throw new customError_1.NotFoundError("Discussion not found");
            return discussion;
        });
    }
    getCommentsByDiscussion(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield Comment_1.Comment.find({
                discussionId: new mongoose_1.default.Types.ObjectId(discussionId),
            })
                .populate("userId", "name")
                .lean();
            // @ts-ignore: Temporarily bypass type checking for this call
            return comments;
        });
    }
    createComment(comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdComment = yield Comment_1.Comment.create(comment);
            return createdComment.toObject();
        });
    }
    editDiscussion(discussionId, topic, mediaUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield Discussion_1.Discussion.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(discussionId), { topic, mediaUrl, updatedAt: new Date() }, { new: true })
                .populate("userId", "name")
                .lean();
            if (!discussion)
                throw new customError_1.NotFoundError("Discussion not found");
            return discussion;
        });
    }
    deleteDiscussion(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Discussion_1.Discussion.findByIdAndDelete(new mongoose_1.default.Types.ObjectId(discussionId));
            if (!result)
                throw new customError_1.NotFoundError("Discussion not found");
            yield Comment_1.Comment.deleteMany({
                discussionId: new mongoose_1.default.Types.ObjectId(discussionId),
            });
        });
    }
    editComment(commentId, content, mediaUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield Comment_1.Comment.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(commentId), { content, mediaUrl, updatedAt: new Date() }, { new: true })
                .populate("userId", "name")
                .lean();
            if (!comment)
                throw new customError_1.NotFoundError("Comment not found");
            // @ts-ignore: Temporarily bypass type checking for this call
            return comment;
        });
    }
    deleteComment(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield Comment_1.Comment.findById(new mongoose_1.default.Types.ObjectId(commentId)).lean();
            if (!comment)
                throw new customError_1.NotFoundError("Comment not found");
            yield Comment_1.Comment.findByIdAndDelete(new mongoose_1.default.Types.ObjectId(commentId));
            return { discussionId: comment.discussionId.toString() };
        });
    }
}
exports.DiscussionRepository = DiscussionRepository;
