import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  thumbnailUrl: { type: String },
  key: { type: String },
  status: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);
