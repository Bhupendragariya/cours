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
    },

    


     Name:{
      type: String,
      required: true,
     },

      Email:{
      type: String,
      required: [true, "Email is required"],
     },
      Phone:{
      type: Number,
      required: true,
     },
      Gender:{
      type: String,
      required: true,
      enum: ["Male", "Female", "other"],
     },
      Duration:{
      type: String,
      required: true,
      enum: ["3 Month", "6 Month"],
     },
      Country:{
      type: String,
      required: true,
     },
      State:{
      type: String,
      required: true,
     },
      Postcode:{
      type: Number,
      required: true,
     },


      
  },

  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
