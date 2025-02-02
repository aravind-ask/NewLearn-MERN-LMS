import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

export const tokenUtils = {
  generateAccessToken(payload: object): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
  },

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  },

  verifyAccessToken(token: string): any {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  },

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  },
};
