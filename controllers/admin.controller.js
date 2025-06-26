import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Order from "../models/order.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import ReferralSettings from "../models/referral.model.js";
import { generateAccessAndRefreshTokens } from "../utils/jwtToken.js";
import jwt from "jsonwebtoken";

export const updateReferral = catchAsyncErrors(async (req, res, next) => {
  const { commissionPercent, referralDiscount } = req.body;
  try {
    const settings = await ReferralSettings.findOneAndUpdate(
      {},
      { commissionPercent, referralDiscount },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Referral settings updated",
      settings,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const AddAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password, phone,  role } =
    req.body;

  try {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      
      !role
    ) {
      return next(new ErrorHandler("Please fill out the full form!", 400));
    }

    const isAdmin = await User.findOne({ email });

    if (isAdmin) {
      return next(
        new ErrorHandler(`Admin with the email ${email} already exists.`, 400)
      );
    }

    if (role !== "Admin") {
      return next(new ErrorHandler("invalid role assignment", 403));
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
     
      role: "Admin",
    });

    const {
      accessToken,
      refreshToken
    } = await generateAccessAndRefreshTokens(user._id);

  

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      accessToken,
      user,
      message: "admin create successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const AddCourse = catchAsyncErrors(async (req, res) => {
  const { title, description, price, thumbnail } = req.body;

  try {
    if (!title || !description || !price || !thumbnail) {
      return console.log(" please full fill this failed");
    }

    await Course.create({
      title,
      description,
      price,
      thumbnail,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getAdminDashboard = catchAsyncErrors(async (req, res, next) => {
  try {
    const employees = await User.find({ role: "employee" }).select(
      "firstName email earnings referredSales phone"
    );

    if (!employees) {
      return next(new ErrorHandler("employees is not founds", 400));
    }

    const courses = await Course.find();

    if (!courses) {
      return next(new ErrorHandler("courses is not founds", 400));
    }

    res.status(200).json({
      employees,
      courses,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const addWalletAmount = catchAsyncErrors(async (req, res, next) => {
  try {
    let { amount } = req.body;
    const userId = req.params.id;

    amount = parseFloat(amount);

    if (!amount || amount <= 0) {
      return next(
        new ErrorHandler("Please provide a valid positive amount", 400)
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    user.wallet = parseFloat(((user.wallet || 0) + amount).toFixed(2));
    await user.save();

    res.status(200).json({
      success: true,
      message: `₹${amount} added to user's wallet successfully`,
      walletBalance: user.wallet,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const approveOfflineOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    order.paymentStatus = "paid";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order approved successfully",
      order,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const allOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find()
    .populate("courseIds", "title price")
    .populate("referrerId", "firstName email")
    .sort({ createdAt: -1 });

      res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});
