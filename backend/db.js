import { connect } from "mongoose";
import { DB_URL } from "./ServerConfig.js";



async function dbConnect() {
  try {
    await connect(DB_URL),
      {
        timeoutMS: 100000,
      };

    console.log("dbCOnnect successfull!!!");
  } catch (error) {
    console.log("db error", error);
  }
}
export default dbConnect;
