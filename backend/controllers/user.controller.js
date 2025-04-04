import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Room } from "../models/room.model.js";
import express from "express";
import { Booking } from "../models/booking.model.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if ([name, email, password].some((field) => field?.trim() === "")) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "please provide all fields"));
    }

    const existsUser = await User.findOne({ email });
    if (existsUser) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "email already exists"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashPassword });

    const createUser = await User.findById(user._id).select(
      "-password -profile -address"
    );
    if (!createUser) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Problem occurred while creating the user")
        );
    }

    const token = jwt.sign({ userId: createUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, createUser, "User Created successfully"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Please provide the email and password")
        );
    }

    const checkEmailExists = await User.findOne({ email });
    if (!checkEmailExists) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "User not registered, please sign up")
        );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      checkEmailExists.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Please enter a valid password"));
    }

    const token = jwt.sign(
      { userId: checkEmailExists._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || true,

      maxAge: 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, checkEmailExists, "User Logged In successfully")
      );
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, { userId }, "Please login to get the Rooms")
        );
    }

    const rooms = await Room.find();
    if (rooms.length < 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, { userId }, "No Room Found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { rooms }, "Fetched Rooms Successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, { error }, "Erro occured in getAllRooms"));
  }
};

export const getRoom = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Please login to get the Rooms"));
    }

    if (!id) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Please provide the Room ID"));
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid Room ID"));
    }

    const room = await Room.findById({ _id: id }).select("-createdBy");

    if (!room) {
      return res.status(404).json(new ApiResponse(404, null, "No Room Found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { room }, "Fetched Room Successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, { error }, "Error occurred in getRoom"));
  }
};

const router = express.Router(); // Initialize the router

// Webhook Route to handle Stripe events
export const stripeWebHooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  // Verify webhook signature and retrieve event object
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  console.log("Received Stripe event:", event);

  // Handle different event types
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object; // contains the session object
      const { userId, roomId } = session.metadata; // assuming metadata contains userId and roomId

      try {
        // Find the room
        const room = await Room.findById(roomId);
        if (!room) {
          throw new Error("Room not found");
        }

        // Create a booking record with status "Completed"
        const booking = new Booking({
          room: room._id,
          user: userId, // The userId from the metadata
          paymentStatus: "Completed",
        });

        await booking.save();
        console.log("Booking saved:", booking);
      } catch (error) {
        console.error("Error while saving booking:", error.message);
        return res.status(500).send("Error processing webhook");
      }
      break;

    case "checkout.session.async_payment_failed":
      const failedSession = event.data.object;
      const { failedUser, failedRoomId } = failedSession.metadata;

      try {
        // Find the room for the failed payment
        const failedRoom = await Room.findById(failedRoomId);
        if (!failedRoom) {
          throw new Error("Room not found");
        }

        // Create a booking record with status "Failed"
        const failedBooking = new Booking({
          room: failedRoom._id,
          user: failedUser, // The userId from the metadata
          paymentStatus: "Failed",
        });

        await failedBooking.save();
        console.log("Failed booking saved:", failedBooking);
      } catch (error) {
        console.error("Error while saving failed booking:", error.message);
        return res.status(500).send("Error processing webhook");
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.status(200).send("Event received");
};

export default router;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const bookRoom = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { roomId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Please login to get the Rooms"));
    }

    if (!roomId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Please provide a valid room Id"));
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(400).json(new ApiResponse(404, null, "Room not found"));
    }

    const price = room.price;

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Room Booking",
              description: room.roomDescription,
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3001/cancel`,
      metadata: {
        user: String(userId), // Pass the userId as metadata
        roomId: String(roomId), // Pass the roomId as metadata
      },
    });

    // Return the session URL for the frontend or Postman to use
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { checkoutUrl: session.url },
          "Checkout session created successfully"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { error: error.message },
          "Unexpected Error occurred"
        )
      );
  }
};
