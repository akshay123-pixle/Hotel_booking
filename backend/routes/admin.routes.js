import express from "express";
import {
  addRoom,
  adminSignIn,
  adminSignOut,
  adminSignUp,
} from "../controllers/admin.controller.js";
import { authCheckAdmin } from "../middlewares/authadmin.middleware.js";
const adminRouter = express.Router();

adminRouter.post("/admin-signup", adminSignUp);
adminRouter.post("/admin-signin", adminSignIn);
adminRouter.get("/admin-signout", adminSignOut);
adminRouter.post("/add-room", authCheckAdmin, addRoom);


export default adminRouter