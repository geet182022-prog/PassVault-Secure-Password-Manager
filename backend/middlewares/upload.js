import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`),
});


// ✅ File filter
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only JPG and PNG allowed"), false);
  } else {
    cb(null, true);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only images allowed"), false);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
