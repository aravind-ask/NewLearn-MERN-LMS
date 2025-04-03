"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        console.log("user:", user === null || user === void 0 ? void 0 : user.role);
        if (!user || !roles.includes(user.role)) {
            (0, responseHandler_1.errorResponse)(res, "Forbidden", 403);
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
