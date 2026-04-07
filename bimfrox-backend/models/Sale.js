import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({

  salespersonId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  businessName:{
    type:String,
    required:true
  },

  ownerName:{
    type:String,
    required:true
  },

  contact:{
    type:String,
    required:true
  },

  address:{
    type:String,
    required:true
  },

  subscriptionPlan:{
    type:Number,
    required:true
  },

  status:{
    type:String,
    enum:["pending","confirmed","rejected"],
    default:"pending"
  },

  date:{
    type:Date,
    default:Date.now
  }

});

export default mongoose.model("Sale",SaleSchema);