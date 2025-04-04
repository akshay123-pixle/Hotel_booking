import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    profile: {
      type: String,
    },
    address: {
      type: String,
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
