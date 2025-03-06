import { Router } from "express";
import { errorResponse, successResponse } from "../../utils/serverResponse.js";


import userModel from "../../models/Usermodel.js";
import { generatToken } from "../../utils/JwtToken.js";
import { comparePassword, hashPassword } from "../../utils/encryptPassword.js";

const authRouter = Router();
//api
authRouter.post("/signin", signinController);
authRouter.post("/forgot", forgotPasswordController);
authRouter.post("/reset", resetPasswordController);
authRouter.post("/refreshToken",refreshtokenController)



export default authRouter;

async function signinController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.");
    }
    const user = await userModel.findOne({ email });
    let role = user ? user.role : null;
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const passwordvalid = comparePassword(password, user.password);

    if (!passwordvalid) {
      return errorResponse(res, 401, "invalid password");
    }
    const { accessToken, refreshToken } = generatToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    console.log("Generated roles:", email, role);
    const redirectPath = `/${role}`;
    return successResponse(res, "signin successfull", {
      accessToken,
      refreshToken,
      redirectPath,
    });
  } catch (error) {
    console.error("Error during signin", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}


// async function signinController(req, res) {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return errorResponse(res, 400, "Email and password are required.");
//     }
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return errorResponse(res, 404, "User not found.");
//     }

//     const passwordvalid = comparePassword(password, user.password);

//     if (!passwordvalid) {
//       return errorResponse(res, 401, "invalid password");
//     }
//     const {token,refreshtoken} = generatToken({
//       userid: user._id,
//       email: user.email,
//       // userid: user._id,
//       role: user.role,
//     });
//     console.log("Generated Token:", token);

//     return successResponse(res, "Signin successful", {token,refreshtoken,redirct});
//   } catch (error) {
//     console.error("Error during signin", error);
//     return errorResponse(res, 500, "Internal server error.");
//   }
// }

//forgot
async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, "email and password are required.");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 400, "user not found");
    }
    const randomNum = Math.round(Math.random() * 100000);
    const forgototp = randomNum < 1000000 ? randomNum + 100000 : randomNum;

    await userModel.findOneAndUpdate({ email }, { forgototp });
    //fuction to email otp to user email -

    //
    return successResponse(res, "otp generate successful.", { otp: forgototp });
  } catch (error) {
    console.log("error during signin", error);
    errorResponse(res, 500, "internal server error");
  }
}
//reset

async function resetPasswordController(req, res) {
  try {
    const { email, otp, password } = req.body;

    if (!email) {
      return errorResponse(res, 400, "email and password are required.");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 400, "user not found");
    }

    if (user.forgototp !== Number.otp) {
      return errorResponse(res, 400, "invalid otp");
    }

    await userModel.findOneAndUpdate(
      { email },
      { password: hashPassword(password) }
    );

    return successResponse(res, "password reset successful");
  } catch (error) {
    console.log("error during signin", error);
    errorResponse(res, 500, "internal server error");
  }
  
}



async function refreshtokenController(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, "refresh token not provided");
    }
    let payload = null;
    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      errorResponse(res, 400, "invalid refreshToken");
    }
    const tokens = generatToken({
      email: payload.email,
      role: payload.role,
    });

    return successResponse(res, "signin sucessfull", tokens);
  } catch (error) {
    console.error("Error during refresh token", error);
    errorResponse(res, 500, "Internal server error");
  }
}



