
import jwt from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./errorMiddlewares.js";

export const isAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;
      
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
     return next(new ErrorHandler(" Unauthorized ", 400));
    
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch {
         return next(new ErrorHandler(" Invalid or expired token ", 400));
  }
});


export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
     return next(new ErrorHandler("Forbidden: insufficient rights", 400));
  
  }
  next();
};
