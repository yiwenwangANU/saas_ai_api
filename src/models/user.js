import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    subscriptionActive: {
      type: Boolean,
      default: false,
      required: true,
    },
    subscriptionTier: {
      type: String,
      require: false,
    },
    stripeSubscriptionId: {
      type: String,
      require: false,
      unique: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export default mongoose.model("User", userSchema);
