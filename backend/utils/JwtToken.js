import jwt from "jsonwebtoken";
import crypto from "crypto";
import { errorResponse } from "./serverResponse.js";

const key = crypto.randomBytes(32).toString("hex");

export function generatToken(payload) {
  const accessToken = jwt.sign(payload, key, {
    expiresIn: "6m",
  });
  const refreshToken = jwt.sign(payload, key, {
    expiresIn: "24h",
  });
  return { accessToken, refreshToken };
}

export function verifyToken(accessToken) {
  try {
    return jwt.verify(accessToken, key);
  } catch (error) {
    console.log("error", error.message);
    return null;
  }
}
//authmiddleware

export async function authmiddleware(req, res, next) {
  try {
    const bearertoken = req.headers.authorization || req.headers.Authorization;
    console.log("un-athorized", bearertoken);
    if (!bearertoken) {
      return errorResponse(res, 401, "authorization header mising");
    }

    const tokendata = bearertoken.split(" ");
    console.log("token data", tokendata);
    if (!tokendata || tokendata?.length !== 2 || tokendata[0] !== "Bearer") {
      errorResponse(res, 401, "invalid token");
      return;
    }
    console.log("token", tokendata[1]);
    const payload = verifyToken(tokendata[1]);
    if (!payload) {
      errorResponse(res, 401, "token invalid");
      return;
    }
    console.log("payload", payload);
    res.locals.email = payload.email;
    res.locals.role = payload.role;
    res.locals.userId = payload.userId;

console.log("res.locals.userId set to:", res.locals.userId); 
    next();
  } catch (error) {
    console.log(error);
    errorResponse(res, "internal server error");
  }
}

//superadmin middlware
export async function isSuperAdminMiddleware(req, res, next) {
  try {
    const role = res.locals.role;
    if (!role || role !== "superadmin") {
      return errorResponse(res, 401, "not authorized");
    }
    next();
  } catch (error) {
    console.log(error);
    errorResponse(res, "internal server error");
  }
}




