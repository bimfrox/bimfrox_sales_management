import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: String,
  client: String,
  amount: Number,
  date: Date
});

const userSchema = new mongoose.Schema({

  username: { type: String, required: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin","sales"],
    default: "sales"
  },

  status: {
    type: String,
    enum: ["pending","approved","rejected"],
    default: "pending"
  },

  city: {
    type: String,
    required: true
  },

  phone: {
    type: String
  },

  email: {
    type: String
  },

  projects: [projectSchema]

}, { timestamps: true });

export default mongoose.model("User", userSchema);