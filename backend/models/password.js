import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  {
    site: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      iv: { type: [Number], required: true },
      data: { type: [Number], required: true },
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Password = mongoose.model("Password", passwordSchema);

export default Password;
