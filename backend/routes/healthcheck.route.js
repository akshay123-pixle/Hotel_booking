import express from "express"
import { healthCheck } from "../controllers/healthcheck.controller.js"

const healthRouter=express.Router()

healthRouter.get('/',healthCheck)

export default healthRouter