// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {

//   const token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).json({ error: "No token, access denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.userId = decoded.id;   // attach user id to request
//     next();

//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// export default authMiddleware;

// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const authMiddleware = async (req, res, next) => {
//   // const token = req.header("Authorization");
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "Not  authorized" });
//     }

//     const token = authHeader.split(" ")[1]; // Bearer <token>

//     if (!token) {
//       return res.status(401).json({ msg: "No token, auth denied" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.id;
//     next();
//   } catch (err) {
//     console.error("Auth error:", err.message);
//     res.status(401).json({ message: "Invalid token" });
//   }
// };
// export default authMiddleware;


import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;     //THIS is what routes use
    next();
  } catch (err) {
    console.error("JWT ERROR:", err?.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;

