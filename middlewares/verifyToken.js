// Middleware to verify JWT token
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config(); // Loads environment variables from .env file

export const verifyToken = (req, res, next) => {
  // Read token from cookies
  let token = req.cookies.token; // { token: "..." }
  console.log("token :", token);
  if (token === undefined) {
    // If token is missing, reject request
    return res.status(400).json({ message: "Unauthorized req. Please login" });
  }
  // Verify and decode the token
  let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  // Attach decoded token to request and proceed
  req.decodedToken = decodedToken;
  next();
};