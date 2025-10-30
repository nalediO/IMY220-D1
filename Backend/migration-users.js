// migrate-users.js
const mongoose = require('mongoose');

const migrateUsers = async () => {
  try {
    // Connect to your MongoDB
    await mongoose.connect(
      'mongodb+srv://test-user:test-password@cluster0.doal6nz.mongodb.net/Version_Control?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log('✅ Connected to MongoDB');

    // Access the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Fetch all users
    const users = await usersCollection.find({}).toArray();

    console.log(`Found ${users.length} users to migrate.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      const updateFields = {};
      let needsUpdate = false;

      // 🔹 Ensure new fields for admin/verification
      if (!user.role) {
        updateFields.role = 'user'; // default non-admin
        needsUpdate = true;
      }

      if (user.isVerified === undefined) {
        updateFields.isVerified = false;
        needsUpdate = true;
      }

      // 🔹 Keep your previous fields
      if (!user.programmingLanguages) {
        updateFields.programmingLanguages = [];
        needsUpdate = true;
      }

      if (!user.friends) {
        updateFields.friends = [];
        needsUpdate = true;
      }

      if (!user.firstName) {
        updateFields.firstName = "";
        needsUpdate = true;
      }

      if (!user.lastName) {
        updateFields.lastName = "";
        needsUpdate = true;
      }

      if (!user.bio) {
        updateFields.bio = "";
        needsUpdate = true;
      }

      if (!user.birthday) {
        updateFields.birthday = null;
        needsUpdate = true;
      }

      if (!user.profileImage) {
        updateFields.profileImage = "";
        needsUpdate = true;
      }

      if (needsUpdate) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updateFields }
        );
        console.log(`🛠️ Migrated user: ${user.username}`);
        migratedCount++;
      } else {
        console.log(`⏭️  User ${user.username} already up to date.`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Migration Summary`);
    console.log(`✅ Updated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`👥 Total processed: ${users.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run it
migrateUsers();
