import express, { Router } from "express";
import { blockUser, getUploadUrl, getUsers, updateProfile } from "../Controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.post("/upload-url", authMiddleware.verifyAccessToken, getUploadUrl);
router.put("/update-profile", authMiddleware.verifyAccessToken, updateProfile);
router.get("/get-users", getUsers);
router.post("/block", blockUser);



export default router;
