import { Router } from "express";
import authRouter from "./authRouter.js";



const publicRouter=Router();

publicRouter.use("/auth",authRouter)

export default publicRouter;