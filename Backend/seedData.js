const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Checkin = require('./models/Checkin');
const FriendRequest = require('./models/FriendRequest');
require('dotenv').config();

// Use Version_Control database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Version_Control';

console.log('Using database: Version_Control');
console.log('Connection string:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password

async function seedDatabase() {
  try {
    console.log('Connecting to Version_Control database...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (mongoose.connection.db.databaseName !== 'Version_Control') {
      console.log('Switching to Version_Control database...');
      mongoose.connection.useDb('Version_Control');
    }

    console.log('✅ Using database:', mongoose.connection.db.databaseName);
    
    console.log('✅ Connected to Version_Control database successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Checkin.deleteMany({});
    await FriendRequest.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('Creating users...');
    const sampleUsers = [
      {
        username: 'alice_dev',
        email: 'alice@test.com',
        password: 'test1234',
        firstName: 'Alice',
        lastName: 'Johnson',
        profileImage: '/assets/profile.png',
        bio: 'Fullstack developer passionate about React and Node.js',
        programmingLanguages: ['JavaScript', 'React', 'Node.js', 'Python'],
      },
      {
        username: 'bob_coder',
        email: 'bob@test.com',
        password: 'test1234',
        firstName: 'Bob',
        lastName: 'Smith',
        profileImage: '/assets/profile.png',
        bio: 'Frontend specialist with UX design background',
        programmingLanguages: ['JavaScript', 'React', 'CSS', 'TypeScript'],
      },
      {
        username: 'testuser',
        email: 'test@test.com',
        password: 'test1234',
        firstName: 'Test',
        lastName: 'User',
        profileImage: '/assets/profile.png',
        bio: 'Test account for development',
        programmingLanguages: ['JavaScript', 'HTML', 'CSS'],
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create projects
    console.log('Creating projects...');
    const sampleProjects = [
      {
        name: 'Weather Dashboard App',
        description: 'A responsive weather application with real-time data and forecasts using React and OpenWeather API',
        projectType: 'web-application',
        hashtags: ['React', 'JavaScript', 'API', 'CSS', 'OpenWeather'],
        currentVersion: '2.1.0',
        isCheckedOut: false,
        imageUrl: '/assets/weather-app.jpg',
        files: [
          { filename: 'App.js', fileUrl: '/files/weather-app/App.js' },
          { filename: 'WeatherService.js', fileUrl: '/files/weather-app/WeatherService.js' },
          { filename: 'styles.css', fileUrl: '/files/weather-app/styles.css' }
        ]
      },
      {
        name: 'Task Management System',
        description: 'Collaborative task manager with real-time updates, drag-and-drop functionality, and team collaboration features',
        projectType: 'web-application',
        hashtags: ['React', 'Node.js', 'MongoDB', 'SocketIO', 'Express'],
        currentVersion: '1.3.2',
        isCheckedOut: true,
        imageUrl: '/assets/task-manager.jpg',
        files: [
          { filename: 'index.html', fileUrl: '/files/task-manager/index.html' },
          { filename: 'main.js', fileUrl: '/files/task-manager/main.js' },
          { filename: 'database.js', fileUrl: '/files/task-manager/database.js' }
        ]
      }
    ];

    const projectsWithOwners = sampleProjects.map((project, index) => ({
      ...project,
      owner: createdUsers[index % createdUsers.length]._id,
      members: [createdUsers[index % createdUsers.length]._id]
    }));

    const createdProjects = await Project.insertMany(projectsWithOwners);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // Create checkins
    console.log('Creating checkins...');
    const sampleCheckins = [
      {
        message: 'Initial project setup with React components and basic styling',
        version: '1.0.0',
        files: [
          { filename: 'package.json', fileUrl: '/files/package.json' },
          { filename: 'App.js', fileUrl: '/files/App.js' }
        ]
      },
      {
        message: 'Added weather API integration with error handling and loading states',
        version: '1.1.0',
        files: [
          { filename: 'WeatherService.js', fileUrl: '/files/WeatherService.js' },
          { filename: 'ErrorBoundary.js', fileUrl: '/files/ErrorBoundary.js' }
        ]
      },
      {
        message: 'Implemented responsive design for mobile devices and tablet screens',
        version: '2.0.0',
        files: [
          { filename: 'styles.css', fileUrl: '/files/styles.css' },
          { filename: 'responsive.css', fileUrl: '/files/responsive.css' }
        ]
      }
    ];

    const checkinsWithReferences = sampleCheckins.map((checkin, index) => ({
      ...checkin,
      project: createdProjects[0]._id, // All checkins for first project
      user: createdUsers[index % createdUsers.length]._id,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
    }));

    const createdCheckins = await Checkin.insertMany(checkinsWithReferences);
    console.log(`✅ Created ${createdCheckins.length} checkins`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test User Accounts:');
    createdUsers.forEach(user => {
      console.log(`   Email: ${user.email} | Password: test1234 | Username: ${user.username}`);
    });

    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Projects: ${createdProjects.length}`);
    console.log(`   Checkins: ${createdCheckins.length}`);
    console.log(`   Database: Version_Control`);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your connection string in .env file');
    console.log('3. Try: docker-compose up -d (if using Docker)');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
}

seedDatabase();