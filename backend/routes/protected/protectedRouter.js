import { Router } from "express";
import AdminUserRouter from "./Admin/AdminUserRouter.js";
import { isSuperAdminMiddleware } from "../../utils/JwtToken.js";
import AdminTaskRouter from "./Admin/AdminTaskRouter.js";
import UserRouter from "./User/UserRouter.js";

const protectedRouter = Router();

//api

protectedRouter.use("/admin", isSuperAdminMiddleware, AdminUserRouter);
protectedRouter.use("/Task", isSuperAdminMiddleware, AdminTaskRouter);
protectedRouter.use("/user", UserRouter);
protectedRouter.use("/redirect",redirectpathController)

export default protectedRouter;

async function redirectpathController(req, res) {
    try {
      const role = res.locals.role;
      const path = `/${role}`;
  
      res.redirect(path);
    } catch (error) {
      errorResponse(res, "not response");
    }
  }
  