import User from "../models/user.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import Course from "../models/course.model.js";
import Order from "../models/order.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import ReferralSettings from "../models/referral.model.js";
import { generateAccessAndRefreshTokens } from "../utils/jwtToken.js";
import jwt from "jsonwebtoken";

import dotenv from 'dotenv';





dotenv.config();



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});




export const getReferralSettings = catchAsyncErrors(async (req, res, next) => {
  try {
    const settings = await ReferralSettings.findOne();
    if (!settings) {
      return next(new ErrorHandler("Referral settings not found", 400));
    }
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
  const token =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new ErrorHandler(401, "unauthorized request"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler(401, "invalid refresh  token"));
    }

      const isValid = await user.validateRefreshToken(token);
    if (!isValid) return res.status(401).json({ message: "Invalid refresh token" });

    const { accessToken: newAccessToken, refreshToken:newRefreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    
    await user.setRefreshToken(newRefreshToken);

    
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    return next(new ErrorHandler(401, "invalid refresh token"));
  }
});

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password, gender, phone, dob, role } =
    req.body;

  try {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !gender ||
      !dob ||
      !role
    ) {
      return next(new ErrorHandler("Please fill out the full form!", 400));
    }

    const isUser = await User.findOne({ email });

    if (isUser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    if (role !== "employee") {
      return next(new ErrorHandler("invalid role assignment", 400));
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      dob,
      role: "employee",
    });

    const {
      accessToken,
      refreshToken,
      role
    } = await generateAccessAndRefreshTokens(user._id);

    

    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      accessToken,
      user,
      message: "login  successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password,  } = req.body;

  try {
    if (!email || !password ) {
      return next(new ErrorHandler("please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler(" Invalid user and password ", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler(" Invalid user and password ", 400));
    }


    const {
      accessToken,
      refreshToken   } = await generateAccessAndRefreshTokens(user._id);


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });
    

    res.status(200).json({
      accessToken,
      user,
      message: "login  successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const purchaseCourse = catchAsyncErrors(async (req, res, next) => {
  const {
    courseIds,
    referralCode,
    Name,
    Email,
    Phone,
    Gender,
    Duration,
    Country,
    State,
    Postcode,
    paymentMethod,
  } = req.body;

  try {
    if (!courseIds || courseIds.length === 0) {
      return next(
        new ErrorHandler("At least one course must be selected", 400)
      );
    }

    const courses = await Course.find({ _id: { $in: courseIds } });

    if (!courses || courses.length === 0)
      return next(new ErrorHandler("Course not found", 404));

    let totalPrice = 0;

    for (const course of courses) {
      totalPrice += course.price;
    }

    const settings = await ReferralSettings.findOne();

    const discount = settings?.referralDiscount || 0;
    const commissionPercent = settings?.commissionPercent || 0;

    let referrer = 0;
    let walletUsed = 0;
    let referralBy = null;
    let commissionEarned = 0;
    let discountAmount = 0;
    let appliedCoupon = false;

    if (referralCode) {
      if (referralCode === req.user.referralCode) {
        return next(
          new ErrorHandler("You cannot use your own referral code", 400)
        );
      }

      referrer = await User.findOne({ referralCode, role: "employee" });

      if (!referrer) {
        return next(new ErrorHandler("Invalid referral code", 400));
      }

      referralBy = referrer._id;
      appliedCoupon = true;
      discountAmount = discount;
      commissionEarned =
        ((totalPrice - discountAmount) * commissionPercent) / 100;

      referrer.earnings += commissionEarned;
      referrer.wallet += commissionEarned;
      referrer.referredSales += 1;
      await referrer.save();

      await ReferralSettings.findOneAndUpdate(
        {},
        { $inc: { usageCount: 1 } },
        { new: true, upsert: true }
      );
    }

    let finalAmount = totalPrice - discountAmount;

    if (finalAmount < 0) {
      return next(new ErrorHandler("final amount cannot be negative", 400));
    }

    if (req.body.appliedWallet && req.user.wallet > 0) {
      if (req.user.wallet >= finalAmount) {
        walletUsed = finalAmount;
        finalAmount = 0;
      } else {
        walletUsed = req.user.wallet;
        finalAmount -= req.user.wallet;
      }

      req.user.wallet -= walletUsed;
      await req.user.save();
    }

    if (
      !Name ||
      !Duration ||
      !Email ||
      !Phone ||
      !Gender ||
      !Country ||
      !State ||
      !Postcode ||
      !paymentMethod
    ) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }

    const lastOrder = await Order.findOne({}).sort({ orderNumber: -1 }).exec();
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    if (paymentMethod === "offline") {
      const order = await Order.create({
        orderNumber: nextOrderNumber,
        courseIds,
        walletUsed,
        referrerId: referralBy,
        amount: totalPrice,
        finalAmount,
        commissionEarned,
        discountAmount,
        appliedCoupon,
        appliedWallet: req.body.appliedWallet || false,
        Name,
        Email,
        Phone,
        Gender,
        Duration,
        Country,
        State,
        Postcode,
        paymentMethod,
        paymentStatus: "pending",
      });

      for (const course of courses) {
        course.totalSales += 1;
        await course.save();
      }

      await order.save();

      return res.status(200).json({
        order,
        message:
          "Offline order created. Please visit our office to complete the payment.",
      });
    }

    if (paymentMethod === "online") {
      const options = {
        amount: (finalAmount * 100),
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const order = await Order.create({
        courseIds,
        referrerId: referralBy,
        amount: totalPrice,
        finalAmount,
        commissionEarned,
        discountAmount,
        appliedWallet: req.body.appliedWallet || false,
        finalAmount,
        Name,
        Email,
        Phone,
        Gender,
        Duration,
        Country,
        State,
        Postcode,
        appliedCoupon,
        paymentMethod,
        walletUsed,
        paymentStatus: "created",
        razorpayOrderId: razorpayOrder.id,
      });

      for (const course of courses) {
        course.totalSales += 1;
        await course.save();
      }

      await order.save();


      return res.status(200).json({
         success: true,
        order,
        razorpayOrderId: razorpayOrder.id,
        message: "Course purchased successfully",
      });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});



export const verifyPayment = catchAsyncErrors(async (req, res, next) => {
 try {
   
   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

   const generatedSignature = crypto
     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
     .update(razorpay_order_id + "|" + razorpay_payment_id)
     .digest("hex");
 
   if (generatedSignature !== razorpay_signature) {
     return next(new ErrorHandler("Invalid payment signature", 400));
   }
 
  
   const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
   if (!order) {
     return next(new ErrorHandler("Order not found", 404));
   }
 
   order.paymentStatus = "paid";
   order.razorpayPaymentId = razorpay_payment_id;
   await order.save();
 
   res.status(200).json({
     success: true,
     message: "Payment verified and order updated successfully",
   });
 } catch (error) {
  return next(new ErrorHandler(error.message, 500));
 }
});



export const getEmployeeDashboard = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user;

    const user = await User.findById(userId);

    if (!user || user.role !== "employee") {
      return next(new ErrorHandler("Employee not found", 404));
    }

    const order = await Order.find({ referrerId: userId }).populate("courseId");

    const totalSales = order.length;
    const totalEarnings = user.earnings;

    res.json({
      employeeName: user?.firstName,
      order,
      totalSales,
      totalEarnings,
      referralCode: user.referralCode,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not founds", 400));
    }

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const editAccount = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user;

    const {
      firstName,
      lastName,
      email,
      oldPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const user = await User.findById(userId).select("password");

    if (!user) {
      return next(new ErrorHandler("User not founds", 400));
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("All password fields are required", 400));
      }

      if (newPassword !== confirmPassword) {
        return next(
          new ErrorHandler(
            "New password and confirm password do not match",
            400
          )
        );
      }

      const isPasswordMatched = await user.comparePassword(oldPassword);

      if (!isPasswordMatched) {
        return next(new ErrorHandler(" Old password is incorrect ", 400));
      }

      user.password = newPassword;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const order = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user._id || req.user;

    const order = await Order.find({ referrerId: userId }).select(
      "number createdAt paymentStatus finalAmount courseIds orderNumber walletUsed"
    );

    if (!order) {
      return next(new ErrorHandler("Order not founds", 400));
    }

    if (!order || order.length === 0) {
      return next(new ErrorHandler("No orders found", 400));
    }

    res.status(200).json({
      orders: order.map((order) => ({
        OrderItems: order.courseIds.length,
        walletUsed: order.walletUsed,
        orderNumber: order.orderNumber,
        Date: order.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }),
        Status: order.paymentStatus,
        Total: order.finalAmount,
      })),
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getWallet = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("wallet earnings");

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    wallet: user.wallet,
    totalEarnings: user.earnings,
  });
});
