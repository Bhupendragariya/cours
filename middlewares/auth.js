import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./errorMiddlewares.js";

export const isAdminAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token =
      req.cookies.adminToken ||
      req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return next(new ErrorHandler("admin not Authenticated", 402));
      }
     
    try {
      
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

       if (!decoded) {
        return next(new ErrorHandler("Invalid or expired admin token" , 402))
      }

      const user = await User.findById(decoded.id).select("+role");

      if (!user) {
        return next (new ErrorHandler("Admin user not found", 404));
      }

      if (user.role !== "Admin") {
        return next( new ErrorHandler(
          "Access denied. Admin privileges required.",
          403
        ));
      }

      req.user = user;

      next();
    } catch (error) {
      return next(new ErrorHandler("Invalid token", 400));
    }
  }
);

export const isEmployeeAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.employeeToken ||    req.header("Authorization")?.replace("Bearer ", "");
   
      if (!token) {
        return  next ( new ErrorHandler("you are not Authenticated", 400));
      }


       try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded) {
        return next(new ErrorHandler("Invalid token compare" , 402))
      }

      const user = await User.findById(decoded.id).select("+role");

      if (!user) {
        return next(new ErrorHandler("user not found", 400));
      }

      if (user.role !== "employee") {
        return next(
          new ErrorHandler(
            "you cannot authorized to access this resource ",
            403
          )
        );
      }

      req.user = user;

      next();
    } catch (error) {
      return next (new ErrorHandler("Invalid token", 401));
    }
  }
);
