"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./Routes/auth.routes"));
const user_routes_1 = __importDefault(require("./Routes/user.routes"));
const instructor_routes_1 = __importDefault(require("./Routes/instructor.routes"));
const category_routes_1 = __importDefault(require("./Routes/category.routes"));
const course_routes_1 = __importDefault(require("./Routes/course.routes"));
const cart_routes_1 = __importDefault(require("./Routes/cart.routes"));
const wishlist_routes_1 = __importDefault(require("./Routes/wishlist.routes"));
const payment_routes_1 = __importDefault(require("./Routes/payment.routes"));
const course_progress_routes_1 = __importDefault(require("./Routes/course.progress.routes"));
const ratings_routes_1 = __importDefault(require("./Routes/ratings.routes"));
const offer_routes_1 = __importDefault(require("./Routes/offer.routes"));
const chat_routes_1 = __importDefault(require("./Routes/chat.routes"));
const discussion_routes_1 = __importDefault(require("./Routes/discussion.routes"));
const certificates_routes_1 = __importDefault(require("./Routes/certificates.routes"));
const notification_routes_1 = __importDefault(require("./Routes/notification.routes"));
const interview_routes_1 = __importDefault(require("./Routes/interview.routes"));
const multer_1 = __importDefault(require("multer"));
const chat_socket_1 = require("./sockets/chat.socket");
const discussion_socket_1 = require("./sockets/discussion.socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = [
    process.env.CLIENT_URL || "https://newlearn-lms.el.r.appspot.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://newlearn-lms.el.r.appspot.com",
];
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    },
});
app.set("io", io);
const upload = (0, multer_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
(0, db_1.connectDB)();
app.use("/api/auth", auth_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/instructor", instructor_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/courses", course_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/wishlist", wishlist_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/progress", course_progress_routes_1.default);
app.use("/api/certificates", certificates_routes_1.default);
app.use("/api/reviews", ratings_routes_1.default);
app.use("/api/offers", offer_routes_1.default);
app.use("/api/chat", chat_routes_1.default);
app.use("/api/discussion", discussion_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/interviews", interview_routes_1.default);
(0, chat_socket_1.setupChatSocket)(io);
(0, discussion_socket_1.setupDiscussionSocket)(io);
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
exports.default = httpServer;
