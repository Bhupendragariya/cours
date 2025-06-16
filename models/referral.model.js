import mongoose from "mongoose";


const referralSchema = new mongoose.Schema({
    referralDiscount: {
      type: Number,
      default: 0,
    
    },
    commissionPercent: {
      type: Number,
      default: 0,
    },
    
    usageCount: {
     type: Number,
      default: 0 
    },

}, { timestamps: true })

const ReferralSettings = mongoose.model("ReferralSettings", referralSchema);
export default ReferralSettings;
