const express = require('express');
const cors = require('cors');
const path = require("path");
const connectDB = require('./config/database');
require('dotenv').config();


// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/Projects');
const checkinRoutes = require('./routes/checkins');
const friendRoutes = require('./routes/friends');
const projectTypesRouter = require("./routes/projectTypes");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/friends', friendRoutes);
app.use("/api/project-types", projectTypesRouter);
app.use("/api/admin", adminRoutes);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});