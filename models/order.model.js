import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    amount: Number,

    finalAmount: Number,

    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

  


    commissionEarned: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    }
      
  },

  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
