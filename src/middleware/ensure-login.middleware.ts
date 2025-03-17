
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenSecret=process.env.ACCESS_TOKEN_SECRET as string;


export const EnsureLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      res.status(401).json({
         status:"error",
         message:"Access Token is missing"
      });
      return;
    }
    jwt.verify(accessToken,accessTokenSecret,(err,decode)=>{
         if(err){
            const message=err.message==="TokenExpiredError"?"Access Token has Expired":"Invalid Access Token";
            res.status(401).json({
               status:"error",
               message:message
            });
            return;
         }

         req.user=decode;
         console.log("user",decode);
         next();
    })
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
};
