import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [3, "first name must contain at least 3 characters!"],
    },
    lastName: {
      type: String,
      required: true,
      minLength: [3, "last name must contain at least 3 characters!"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phone: {
      type: Number,
      required: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["Admin", "employee"],
      default: "employee",
    },

    referralCode: {
      type: String,
      immutable: true,
      default: function () {
        return `REF${Math.floor(Math.random() * 1000000)}`;
      },
    },
    wallet: {
      type: Number,
      default: 0,
    },

    earnings: {
      type: Number,
      default: 0,
    },

    referredSales: {
      type: Number,
      default: 0,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 7);
  next();
});

userSchema.methods.comparePassword = async function (Password) {
  return await bcrypt.compare(Password, this.password);
};


userSchema.methods.setRefreshToken = async function (token) {
  this.refreshToken = await bcrypt.hash(token, 12);
    await this.save({ validateBeforeSave: false });
};

userSchema.methods.validateRefreshToken = async function (token) {
  return await bcrypt.compare(token, this.refreshToken);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
