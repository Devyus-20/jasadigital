const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"] }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/users",    require("./routes/users"));
app.use("/api/services", require("./routes/services"));
app.use("/api/orders",   require("./routes/orders"));

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "JasaDigital API berjalan!", version: "1.0.0" });
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DB_NAME}`);
});
