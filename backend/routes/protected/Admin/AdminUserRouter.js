import { Router } from "express";
import userModel from "../../../models/Usermodel.js";
import {errorResponse,successResponse,} from "../../../utils/serverResponse.js";
import { hashPassword } from "../../../utils/encryptPassword.js";

const AdminUserRouter = Router();

AdminUserRouter.get("/userall", getAllUsersController);
AdminUserRouter.put("/update", updateUsersController);
AdminUserRouter.delete("/delete", deleteUserController);
AdminUserRouter.post("/create", createUsersController);

export default AdminUserRouter;

//

async function getAllUsersController(req, res) {
  try {
    const { email } = res.locals;
    console.log("locals", email);
    const blogs = await userModel.find();

    successResponse(res, "all Users found", blogs);
  } catch (error) {
    errorResponse(res, 500, "internal server error");
  }
}

async function updateUsersController(req, res) {
  try {
    const id = req.query.id?.trim();
    const updateData = req.body;

    if (!id) {
      return errorResponse(res, 400, "id is not provided");
    }

    const updatedataUser = await userModel.findByIdAndUpdate(id, updateData);
    successResponse(res, "success", updatedataUser);
  } catch (error) {
    console.log("__getalluserController__", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteUserController(req, res) {
  try {
    const id = req.query.id?.trim();

    if (!id) {
      return errorResponse(res, 400, "id is not provided");
    }
    const deleteUser = await userModel.findByIdAndDelete(id);

    successResponse(res, "success", deleteUser);
  } catch (error) {
    console.log("__getalluserController__", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createUsersController(req, res) {
  try {
    const { fname, lname, email, password, age, mobile, role } = req.body;
    console.log("Create user:", req.body);

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 200, "Email already in use.");
    }

    // Hash the password correctly using await
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await userModel.create({
      fname,
      lname,
      email,
      age,
      mobile,
      role,
      password: hashedPassword,
    });

    return successResponse(res, "User created successfully", newUser);
  } catch (error) {
    console.error("Error in createUsersController:", error);
    return errorResponse(res, 500, "Internal server error");
  }
}
