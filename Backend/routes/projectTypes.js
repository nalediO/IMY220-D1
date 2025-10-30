// routes/projectTypes.js
const express = require("express");
const router = express.Router();

// Example: predefined types
const PROJECT_TYPES = ["Desktop App", "Web App", "Mobile App", "Framework", "Library"];

router.get("/", (req, res) => {
  res.json(PROJECT_TYPES);
});

module.exports = router;
