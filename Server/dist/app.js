"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./Routes/auth.routes"));
const user_routes_1 = __importDefault(require("./Routes/user.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
(0, db_1.connectDB)();
app.use("/api/auth", auth_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
exports.default = app;
