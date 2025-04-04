import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Admin} from "../models/admin.model.js"
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { Room } from "../models/room.model.js";

export const adminSignUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log("in signup");
    
    if ([name, email, password].some((field) => field?.trim() === "")) {
      return res.status(400).json(new ApiResponse(400,null,"please provide all fields"))
    }

    const existsUser = await Admin.findOne({ email });
    if (existsUser) {
        return res.status(400).json(new ApiResponse(400,null,"email already exists"))

    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await Admin.create({ name, email, password: hashPassword });

    const createUser = await Admin.findById(user._id).select(" -profile -userBookingDetails");
    if (!createUser) {
      return res.status(400).json(new ApiResponse(400,null,"Problem occurred while creating the Admin"))

    }

    const token = jwt.sign({ userId: createUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(201).json(new ApiResponse(201, createUser, "Admin Created successfully"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const adminSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      return res.status(400).json(new ApiResponse(400,null,"Please provide the email and password"))

      
    }

    const checkEmailExists = await Admin.findOne({ email });
    if (!checkEmailExists) {
      return res.status(400).json(new ApiResponse(400,null,"Admin not registered, please sign up"))

    }

    const isPasswordValid = await bcrypt.compare(password, checkEmailExists.password);
    if (!isPasswordValid) {
      return res.status(400).json(new ApiResponse(400,null,"Please enter a valid password"))

    }

    const token = jwt.sign({ userId: checkEmailExists._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || true,

      maxAge:24 * 60 * 60 * 1000,
    });

    return res.status(200).json(new ApiResponse(200, checkEmailExists, "Admin Logged In successfully"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const adminSignOut = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return res.status(200).json(new ApiResponse(200, {}, "Admin logged out successfully"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};


export const addRoom = async (req, res) => {
    try {
      const adminId = req.admin._id; 
      const {roomDescription,price,roomType}=req.body

      if (!adminId) {
        return res.status(400).json(new ApiResponse(400, {}, "Please log in to add a room"));
      }

      if([roomDescription,price,roomType].some((field)=>field.trim()==="")){
        return res.status(400).json(new ApiResponse(400, {}, "Please provide all the field in order add room"));

      }

      const room=await Room.create({roomDescription,price,roomType,createdBy:adminId._id})

      if(room.length<0){
        return res.status(400).json(new ApiResponse(400, {}, "Room Not created"));
      }
      return res.status(200).json(new ApiResponse(200, { room }, "Room added successfully"));
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, {error}, "Internal server error"));
    }
  };
  