import express from "express"
import { getProfile } from "../controllers/user/user.controller"
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware"

const userRouter=express.Router()


userRouter.get("/profile",EnsureLoggedIn,getProfile)

export default userRouter