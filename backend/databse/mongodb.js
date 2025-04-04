import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Connect to MongoDB using URI from environment variable
    const res = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected successfully:", res.connection.host);
  } catch (error) {
    // Log error and exit process if DB connection fails
    console.error("DB connection failed:", error);
    throw error;
  }
};
