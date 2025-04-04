import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
export const authCheckAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(400).json(new ApiResponse(400, null, "Admin is not logged in"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    
    const admin = await Admin.findById(decoded.userId);
    if (!admin) {
      return res.status(400).json(new ApiResponse(400, null, "Admin not found"));
    }

    req.admin = admin; 
    next();
  } catch (error) {
    return next(new ApiError(500, "Error occurred in Auth check middleware"));
  }
};
