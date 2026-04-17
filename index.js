require('dotenv').config(); // ✅ MUST BE FIRST

const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const userRouter = require("./routes");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

// Serve uploads folder
const uploadsPath = path.join(process.cwd(), "uploads");
console.log("Serving uploads from:", uploadsPath);

// Debug: list files in uploads folder
if (fs.existsSync(uploadsPath)) {
  console.log("Files in uploads folder:", fs.readdirSync(uploadsPath));
} else {
  console.log("❌ Uploads folder not found!");
}

app.use("/uploads", express.static(uploadsPath));
app.use("/api", userRouter);

// Test route to serve a specific file
app.get("/check-file", (req, res) => {
  const filePath = path.join(uploadsPath, "2026-03-21_15-12-38.png");
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found on server!");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});