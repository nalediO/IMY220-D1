// migrate-users.js
const mongoose = require('mongoose');

const migrateUsers = async () => {
  try {
    // Connect to your MongoDB
    await mongoose.connect('mongodb+srv://test-user:test-password@cluster0.doal6nz.mongodb.net/Version_Control?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users that need migration
    const users = await usersCollection.find({}).toArray();
    
    console.log(`Found ${users.length} users to check for migration`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      const updateFields = {};
      let needsUpdate = false;

      // Check and set default values for new fields
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

      // Update the document if needed
      if (needsUpdate) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updateFields }
        );

        migratedCount++;
        console.log(`Migrated user: ${user.username}`);
      } else {
        skippedCount++;
        console.log(`User ${user.username} already up to date`);
      }
    }

    console.log(`\nMigration Summary:`);
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`⏭️  Already up to date: ${skippedCount} users`);
    console.log(`📊 Total processed: ${users.length} users`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateUsers();