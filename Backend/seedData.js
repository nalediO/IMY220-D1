// seedData.js
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Project = require('./models/Project');
const Checkin = require('./models/Checkin');
const FriendRequest = require('./models/FriendRequest');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Version_Control';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(' Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Checkin.deleteMany({});
    await FriendRequest.deleteMany({});
    console.log(' Cleared old data');

    // ================= USERS =================
    const users = [
      {
        username: 'alice_dev',
        email: 'alice@test.com',
        password: 'test1234',
        firstName: 'Alice',
        lastName: 'Johnson',
        birthday: new Date('1995-05-15'),
        profileImage: '/uploads/alice.png',
        bio: 'Frontend & backend developer passionate about React, Node.js, and MongoDB',
        programmingLanguages: ['JavaScript', 'React', 'Node.js', 'Python'],
        friends: [] // will be updated
      },
      {
        username: 'bob_coder',
        email: 'bob@test.com',
        password: 'test1234',
        firstName: 'Bob',
        lastName: 'Smith',
        birthday: new Date('1992-09-22'),
        profileImage: '/uploads/bob.png',
        bio: 'Fullstack developer and UX enthusiast',
        programmingLanguages: ['JavaScript', 'React', 'Node.js', 'CSS'],
        friends: [] // will be updated
      },
      {
        username: 'carol_tester',
        email: 'carol@test.com',
        password: 'test1234',
        firstName: 'Carol',
        lastName: 'Williams',
        birthday: new Date('1998-01-10'),
        profileImage: '/uploads/carol.png',
        bio: 'QA engineer and Python developer',
        programmingLanguages: ['Python', 'Selenium', 'JavaScript'],
        friends: [] // will be updated
      }
    ];
    const createdUsers = await User.insertMany(users);
    console.log(` Created ${createdUsers.length} users`);

    // Add mutual friends
    createdUsers[0].friends.push(createdUsers[1]._id); // Alice -> Bob
    createdUsers[1].friends.push(createdUsers[0]._id); // Bob -> Alice
    await createdUsers[0].save();
    await createdUsers[1].save();

    // ================= PROJECTS =================
    const projects = [
      {
        name: 'Weather Dashboard',
        description: 'Real-time weather app with forecasts using React and OpenWeather API',
        owner: createdUsers[0]._id,
        members: [createdUsers[0]._id, createdUsers[1]._id], // Alice and Bob
        projectType: 'web-application',
        hashtags: ['React', 'JavaScript', 'API', 'CSS', 'OpenWeather'],
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
        members: [createdUsers[1]._id, createdUsers[2]._id], // Bob and Carol
        projectType: 'web-application',
        hashtags: ['React', 'Node.js', 'MongoDB', 'SocketIO', 'Express'],
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
    const createdCheckins = await Checkin.insertMany(checkins);
    console.log(`✅ Created ${createdCheckins.length} checkins`);

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
    createdUsers.forEach(u => console.log(`- ${u.username} | ${u.email} | Password: test1234`));

  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

seedDatabase();
