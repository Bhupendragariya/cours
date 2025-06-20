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
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new ErrorHandler(401, "unauthorized request"));
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user) {
      return next(new ErrorHandler(401, "invalid refresh  token"));
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return next(new ErrorHandler(401, "refresh token is not valid"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const cookieName = user.role === "Admin" ? "adminToken" : "employeeToken";

    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
      refreshToken,
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
      role: userRole,
    } = await generateAccessAndRefreshTokens(user._id);

    const cookieName = userRole === "Admin" ? "adminToken" : "employeeToken";

    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user,
      message: "login  successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
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

    if (user.role !== "employee") {
      return next(
        new ErrorHandler("You are not authorized to access this resource", 403)
      );
    }

    const {
      accessToken,
      refreshToken,
      role: userRole,
    } = await generateAccessAndRefreshTokens(user._id);

    const cookieName = userRole === "Admin" ? "adminToken" : "employeeToken";

    res.cookie(cookieName, accessToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user,
      message: "login  successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const AddAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password, phone, gender, dob, role } =
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
      gender,
      dob,
      role: "Admin",
    });

    const {
      accessToken,
      refreshToken,
      role: userRole,
    } = await generateAccessAndRefreshTokens(user._id);

    const cookieName = userRole === "Admin" ? "adminToken" : "employeeToken";

    res.cookie(cookieName, accessToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user,
      message: "admin create successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const AddCourse = async (req, res) => {
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
};

export const purchaseCourse = async (req, res, next) => {
  const {
    courseId,
    referralCode,
    Name,
    Email,
    Phone,
    Gender,
    Duration,
    Country,
    State,
    Postcode,
  } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).send("Course not found");

    const settings = await ReferralSettings.findOne();

    const discount = settings?.referralDiscount || 0;
    const commissionPercent = settings?.commissionPercent || 0;

    let referrer = 0;
    let commissionEarned = 0;
    let discountAmount = 0;

    if (referralCode) {
      if (referralCode === req.user.referralCode) {
        return res
          .status(400)
          .json({ message: "You cannot use your own referral code" });
      }
      referrer = await User.findOne({ referralCode, role: "employee" });
      if (!referrer)
        return res.status(400).json({ message: "Invalid referral code" });
      discountAmount = discount;
      commissionEarned = ((course.price - discount) * commissionPercent) / 100;
      referrer.earnings += commissionEarned;
      referrer.referredSales += 1;
      await referrer.save();

      await ReferralSettings.findOneAndUpdate(
        {},
        { $inc: { usageCount: 1 } },
        { new: true, upsert: true }
      );
    }
    const finalAmount = course.price - discountAmount;
    if (finalAmount < 0) {
      return res
        .status(400)
        .json({ message: "Final amount cannot be negative" });
    }

    if (
      !Name ||
      !Duration ||
      !Email ||
      !Phone ||
      !Gender ||
      !Country ||
      !State ||
      !Postcode
    ) {
      return console.log(" please full fill this failed");
    }

    const order = await Order.create({
      courseId,
      referrerId: referrer?._id || null,
      amount: course.price,
      finalAmount,
      commissionEarned,
      discountAmount,
      finalAmount,
      Name,
      Email,
      Phone,
      Gender,
      Duration,
      Country,
      State,
      Postcode,
    });
    await order.save();

    course.totalSales += 1;
    await course.save();

    return res.status(200).json({
      order,
      message: "Course purchased successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

export const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const user = await User.findById(employeeId);

    if (!user || user.role !== "employee") {
      return res.status(404).json({ message: "Employee not found" });
    }

    const order = await Order.find({ referrerId: employeeId }).populate(
      "courseId"
    );

    const totalSales = order.length;
    const totalEarnings = user.earnings;

    res.json({
      employeeName: user.name,
      totalSales,
      totalEarnings,
      referralCode: user.referralCode,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select(
      "fullName email earnings referredSales"
    );
    const courses = await Course.find();

    res.status(200).json({
      employees,
      courses,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
