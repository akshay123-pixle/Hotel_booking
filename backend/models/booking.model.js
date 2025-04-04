import mongoose, { Schema } from "mongoose";

const bookingSchema = mongoose.Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    paymentStatus: {
      type: String,  
      enum: ["Pending", "Completed", "Failed", "In_Progress"],  
      default: "Pending",  
    },
  },
  { timestamps: true }
);


export const Booking = mongoose.model("Booking", bookingSchema);

