import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
export const authCheck = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(400).json(new ApiResponse(400, null, "User is not logged in"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json(new ApiResponse(400, null, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(500, "Error occurred in Auth check middleware"));
  }
};
