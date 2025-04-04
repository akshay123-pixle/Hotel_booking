import express from "express";
import {connectDB} from "./databse/mongodb.js";
import dotenv from "dotenv";
import  app  from "./app.js";

dotenv.config();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("server listeing at PORT :", PORT);
});
connectDB();

export default app;