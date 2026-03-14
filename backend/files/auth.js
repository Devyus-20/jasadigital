const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token)
    return res.status(401).json({ ok: false, msg: "Token tidak ditemukan. Silakan login." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ ok: false, msg: "Token tidak valid atau sudah expired." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ ok: false, msg: "Akses ditolak. Hanya admin yang diizinkan." });
  next();
};

module.exports = { verifyToken, isAdmin };
