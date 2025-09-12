// Migration script to add shortId to existing projects
// Run this once to update existing projects in Firebase

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // You can get this from your Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate short ID (6 characters)
function generateShortId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function addShortIdToProjects() {
  try {
    console.log('Starting migration: Adding shortId to existing projects...');
    
    // Get all projects
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    console.log(`Found ${snapshot.docs.length} projects to update`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const projectData = docSnapshot.data();
      
      // Skip if project already has shortId
      if (projectData.shortId) {
        console.log(`Skipping project "${projectData.name}" - already has shortId: ${projectData.shortId}`);
        skippedCount++;
        continue;
      }
      
      // Generate new shortId
      const shortId = generateShortId();
      
      // Update the project
      const projectRef = doc(db, 'projects', docSnapshot.id);
      await updateDoc(projectRef, {
        shortId: shortId
      });
      
      console.log(`Updated project "${projectData.name}" with shortId: ${shortId}`);
      updatedCount++;
    }
    
    console.log('\nMigration completed!');
    console.log(`Updated: ${updatedCount} projects`);
    console.log(`Skipped: ${skippedCount} projects (already had shortId)`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
addShortIdToProjects();
