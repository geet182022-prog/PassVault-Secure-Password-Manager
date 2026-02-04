import multer from "multer";

// store file in memory, not on disk (more secure)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
