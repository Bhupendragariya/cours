import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
      required: true,
      default: 0,
    },
    walletUsed: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      required: true,
    },

    finalAmount: {
      type: Number,
      required: true,
    },

    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    courseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    commissionEarned: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["created", "pending", "paid", "failed"],
      default: "created",
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    appliedWallet: {
      type: Boolean,
      default: false,
    },
    appliedCoupon: {
      type: Boolean,
      default: false,
    },

    Name: {
      type: String,
      required: true,
    },

    Email: {
      type: String,
      required: [true, "Email is required"],
    },
    Phone: {
      type: Number,
      required: true,
    },
    Gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "other"],
    },
    Duration: {
      type: String,
      required: true,
      enum: ["3 Month", "6 Month"],
    },
    Country: {
      type: String,
      required: true,
    },
    State: {
      type: String,
      required: true,
    },
    Postcode: {
      type: Number,
      required: true,
    },
  },

  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
