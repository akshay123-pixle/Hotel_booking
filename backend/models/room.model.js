import mongoose, { Schema } from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomDescription: {
      type: String,
      required: true,
    },
    roomPic: {
      type: String,
    },
    price: {
      type: String,
      required: true,
    },
    roomType: {
      type: String, 
      enum: ["AC", "Non AC"],
      default: "Non AC",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
