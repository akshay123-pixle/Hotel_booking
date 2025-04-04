import express from "express";
import { bookRoom, getAllRooms, getRoom, signIn, signOut, signUp } from "../controllers/user.controller.js";
import {authCheck} from "../middlewares/auth.middleware.js"
const userRouter = express.Router();
userRouter.post("/signup", signUp);
userRouter.post("/signin", signIn);
userRouter.get("/signout", signOut);
userRouter.get("/all-rooms",authCheck,getAllRooms)
userRouter.get("/room/:id",authCheck,getRoom)
userRouter.post("/book-room",authCheck,bookRoom)

export default userRouter;
