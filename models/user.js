import mongoose from "mongoose";
import crypto from "crypto";
const Schema = mongoose.Schema;

const User = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    default: crypto.randomBytes(8).toString("hex"),
  },
  password: {
    type: String,
    required: true,
  },
  temp: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("User", User);
