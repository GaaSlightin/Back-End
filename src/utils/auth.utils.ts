import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const accessTokenKey = process.env.ACCESS_TOKEN_SECRET as string;
const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET as string;

export const generateAccessToken = (id: string) => {
   return jwt.sign({id}, accessTokenKey, { expiresIn: '15m' });
};

export const generateRefreshToken = (id: string) => {
   return jwt.sign({id}, refreshTokenKey, { expiresIn: '7d' });
};

export function verifyToken(token: string, type: "access" | "refresh"): Promise<any> {
  return new Promise((resolve, reject) => {
    const secretKey = type === "access" ? accessTokenKey : refreshTokenKey;

    jwt.verify(token, secretKey, (err, decodedUser) => {
      if (err) return reject(new Error(`Invalid ${type} token`));
      resolve(decodedUser);
    });
  });
}
