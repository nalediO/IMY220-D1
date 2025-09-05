const express = require("express");

const app = express();
const PORT = 5000;

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

app.post("/api/signup", (req, res) => {
  console.log("Received signup data:", req.body);
  res.json({
    message: `Hello ${req.body.username}, your signup was successful (stubbed)!`
  });
});


app.post("/api/login", (req, res) => {
  console.log("Received login data:", req.body);


  if (req.body.email && req.body.password) {
    res.json({
      message: `Welcome back, ${req.body.email} (stubbed)!`,
      token: "dummy-token-12345" 
    });
  } else {
    res.status(400).json({ message: "Email and password required" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
