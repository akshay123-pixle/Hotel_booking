import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    const res=await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected successfully");
  } catch (error) {
    console.log(
      `DB could not connected please check database directory`,
      error
    );
  }
};
