// seedData.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Checkin = require('./models/Checkin');
const FriendRequest = require('./models/FriendRequest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Version_Control';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Checkin.deleteMany({});
    await FriendRequest.deleteMany({});
    console.log('🧹 Cleared old data');

    // ================= USERS =================
    const users = [
      { username: 'alice_dev', email: 'alice@test.com', password: 'test1234', firstName: 'Alice', lastName: 'Johnson', birthday: new Date('1995-05-15'), profileImage: '/uploads/alice.png', bio: 'Frontend & backend developer passionate about React, Node.js, and MongoDB', programmingLanguages: ['JavaScript','React','Node.js','Python'], friends: [], role: 'admin' },
      { username: 'bob_coder', email: 'bob@test.com', password: 'test1234', firstName: 'Bob', lastName: 'Smith', birthday: new Date('1992-09-22'), profileImage: '/uploads/bob.png', bio: 'Fullstack developer and UX enthusiast', programmingLanguages: ['JavaScript','React','Node.js','CSS'], friends: [], role: 'user' },
      { username: 'carol_tester', email: 'carol@test.com', password: 'test1234', firstName: 'Carol', lastName: 'Williams', birthday: new Date('1998-01-10'), profileImage: '/uploads/carol.png', bio: 'QA engineer and Python developer', programmingLanguages: ['Python','Selenium','JavaScript'], friends: [], role: 'user' },
      { username: 'dave_backend', email: 'dave@test.com', password: 'test1234', firstName: 'Dave', lastName: 'Brown', birthday: new Date('1990-03-12'), profileImage: '/uploads/dave.png', bio: 'Backend developer, Node.js & MongoDB enthusiast', programmingLanguages: ['Node.js','MongoDB','Express'], friends: [], role: 'user' },
      { username: 'eve_frontend', email: 'eve@test.com', password: 'test1234', firstName: 'Eve', lastName: 'Davis', birthday: new Date('1993-07-25'), profileImage: '/uploads/eve.png', bio: 'Frontend developer focused on React and UI/UX', programmingLanguages: ['JavaScript','React','CSS','HTML'], friends: [], role: 'user' },
      { username: 'frank_fullstack', email: 'frank@test.com', password: 'test1234', firstName: 'Frank', lastName: 'Miller', birthday: new Date('1991-11-30'), profileImage: '/uploads/frank.png', bio: 'Fullstack developer working with MERN stack', programmingLanguages: ['JavaScript','React','Node.js','MongoDB'], friends: [], role: 'user' },
      { username: 'grace_data', email: 'grace@test.com', password: 'test1234', firstName: 'Grace', lastName: 'Wilson', birthday: new Date('1994-02-18'), profileImage: '/uploads/grace.png', bio: 'Data scientist with Python & ML experience', programmingLanguages: ['Python','Pandas','NumPy','Scikit-learn'], friends: [], role: 'user' },
      { username: 'henry_devops', email: 'henry@test.com', password: 'test1234', firstName: 'Henry', lastName: 'Taylor', birthday: new Date('1989-08-09'), profileImage: '/uploads/henry.png', bio: 'DevOps engineer automating CI/CD pipelines', programmingLanguages: ['Bash','Docker','Kubernetes','Python'], friends: [], role: 'user' },
      { username: 'irene_uiux', email: 'irene@test.com', password: 'test1234', firstName: 'Irene', lastName: 'Anderson', birthday: new Date('1996-06-17'), profileImage: '/uploads/irene.png', bio: 'UI/UX designer & frontend developer', programmingLanguages: ['Figma','CSS','JavaScript'], friends: [], role: 'user' },
      { username: 'jack_security', email: 'jack@test.com', password: 'test1234', firstName: 'Jack', lastName: 'Thomas', birthday: new Date('1992-12-05'), profileImage: '/uploads/jack.png', bio: 'Cybersecurity enthusiast & backend developer', programmingLanguages: ['Python','Node.js','C++'], friends: [], role: 'admin' }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // ================= MUTUAL FRIENDSHIPS =================
    // For simplicity, make each user friends with the next two users
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const friend1 = createdUsers[(i + 1) % createdUsers.length]._id;
      const friend2 = createdUsers[(i + 2) % createdUsers.length]._id;
      user.friends.push(friend1, friend2);
      await user.save();
    }
    console.log('🤝 Added mutual friendships');

    // ================= PROJECTS =================
    const projects = [
      {
        name: 'Weather Dashboard',
        description: 'Real-time weather app with forecasts using React and OpenWeather API',
        owner: createdUsers[0]._id,
        members: [createdUsers[0]._id, createdUsers[1]._id],
        projectType: 'web-application',
        hashtags: ['React','JavaScript','API','CSS','OpenWeather'],
        currentVersion: '2.0.0',
        isCheckedOut: false,
        checkedOutBy: null,
        imageUrl: '/uploads/weather-app.jpg',
        files: [
          { originalName: 'App.js', storedName: 'App.js', fileUrl: '/uploads/App.js', mimetype: 'text/javascript' },
          { originalName: 'WeatherService.js', storedName: 'WeatherService.js', fileUrl: '/uploads/WeatherService.js', mimetype: 'text/javascript' },
          { originalName: 'styles.css', storedName: 'styles.css', fileUrl: '/uploads/styles.css', mimetype: 'text/css' }
        ]
      },
      {
        name: 'Task Manager',
        description: 'Collaborative task manager with drag-and-drop and real-time updates',
        owner: createdUsers[1]._id,
        members: [createdUsers[1]._id, createdUsers[2]._id],
        projectType: 'web-application',
        hashtags: ['React','Node.js','MongoDB','SocketIO','Express'],
        currentVersion: '1.3.0',
        isCheckedOut: true,
        checkedOutBy: createdUsers[1]._id,
        imageUrl: '/uploads/task-manager.jpg',
        files: [
          { originalName: 'index.html', storedName: 'index.html', fileUrl: '/uploads/index.html', mimetype: 'text/html' },
          { originalName: 'main.js', storedName: 'main.js', fileUrl: '/uploads/main.js', mimetype: 'text/javascript' },
          { originalName: 'database.js', storedName: 'database.js', fileUrl: '/uploads/database.js', mimetype: 'text/javascript' }
        ]
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // ================= CHECKINS =================
    const checkins = [
      {
        project: createdProjects[0]._id,
        user: createdUsers[0]._id,
        message: 'Initial project setup with React components and basic styling',
        version: '1.0.0',
        files: [
          { filename: 'App.js', fileUrl: '/uploads/App.js' },
          { filename: 'WeatherService.js', fileUrl: '/uploads/WeatherService.js' }
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        project: createdProjects[0]._id,
        user: createdUsers[1]._id,
        message: 'Added weather API integration with error handling and loading states',
        version: '1.1.0',
        files: [
          { filename: 'WeatherService.js', fileUrl: '/uploads/WeatherService.js' },
          { filename: 'styles.css', fileUrl: '/uploads/styles.css' }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        project: createdProjects[1]._id,
        user: createdUsers[2]._id,
        message: 'Implemented task board with drag-and-drop functionality',
        version: '1.0.0',
        files: [
          { filename: 'index.html', fileUrl: '/uploads/index.html' },
          { filename: 'main.js', fileUrl: '/uploads/main.js' }
        ],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await Checkin.insertMany(checkins);
    console.log('✅ Created checkins');

    // ================= FRIEND REQUESTS =================
    const friendRequests = [
      {
        from: createdUsers[2]._id, // Carol
        to: createdUsers[0]._id,   // Alice
        status: 'pending'
      }
    ];
    await FriendRequest.insertMany(friendRequests);
    console.log('✅ Created friend request(s)');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('Test users:');
    createdUsers.forEach(u => console.log(`- ${u.username} | ${u.email} | Password: test1234 | Role: ${u.role}`));

  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();
