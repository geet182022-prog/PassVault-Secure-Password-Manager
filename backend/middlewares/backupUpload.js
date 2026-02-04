import multer from "multer";

const storage = multer.memoryStorage();

const backupFilter = (req, file, cb) => {
  if (!file.originalname.endsWith(".enc")) {
    cb(new Error("Only .enc backup files allowed"), false);
  } else {
    cb(null, true);
  }
};

const uploadBackup = multer({
  storage,
  fileFilter: backupFilter,
});

export default uploadBackup;
