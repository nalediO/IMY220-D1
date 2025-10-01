const mongoose = require('mongoose');
const mime = require('mime-types'); // Using the comprehensive library

const migrateProjects = async () => {
  try {
    await mongoose.connect('mongodb+srv://test-user:test-password@cluster0.doal6nz.mongodb.net/Version_Control?retryWrites=true&w=majority');
    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');

    const projects = await projectsCollection.find({}).toArray();
    console.log(`Found ${projects.length} projects to migrate`);

    let migratedCount = 0;

    for (const project of projects) {
      const updateFields = {};

      // Update files array structure if it exists
      if (project.files && project.files.length > 0) {
        updateFields.files = project.files.map(file => ({
          originalName: file.filename || 'unknown',
          storedName: file.filename || 'unknown',
          fileUrl: file.fileUrl || '',
          mimetype: mime.lookup(file.filename) || 'application/octet-stream',
          uploadDate: file.uploadDate || new Date()
        }));
      } else {
        updateFields.files = [];
      }

      // Update other fields as needed
      if (!project.projectType) updateFields.projectType = '';
      
      await projectsCollection.updateOne(
        { _id: project._id },
        { $set: updateFields }
      );

      migratedCount++;
      console.log(`Migrated project: ${project.name}`);
    }

    console.log(`Successfully migrated ${migratedCount} projects`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

migrateProjects();