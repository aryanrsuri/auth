import mongoose from "mongoose";
const Schema = mongoose.Schema;

const User = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    required: true,
    unique: true,
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
