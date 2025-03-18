import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const accessTokenKey = process.env.ACCESS_TOKEN_SECRET as string;
const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET as string;

export const generateAccessToken = (_id: string) => {
   return jwt.sign({_id}, accessTokenKey, { expiresIn: '7d' }); //change the access token duration to deacrease the compleixty
};

export const generateRefreshToken = (_id: string) => {
   return jwt.sign({_id}, refreshTokenKey, { expiresIn: '7d' });
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
