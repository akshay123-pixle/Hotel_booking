import mongoose, { Schema } from "mongoose";

const adminSchema = new mongoose.Schema(
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
    userBookingDetails: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
