const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBH0CuFsuPiZd3X-Q5lJ5Zw8yOoOhM",
  authDomain: "showyourproject-com.firebaseapp.com",
  projectId: "showyourproject-com",
  storageBucket: "showyourproject-com.firebasestorage.app",
  messagingSenderId: "1057512177722",
  appId: "1:1057512177722:web:8b8f8f8f8f8f8f8f8f8f8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixProjectImages() {
  try {
    console.log('🔧 Fixing project images...');
    
    // Get all projects
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    console.log(`Found ${snapshot.docs.length} projects`);
    
    for (const docSnapshot of snapshot.docs) {
      const project = { id: docSnapshot.id, ...docSnapshot.data() };
      console.log(`\n📋 Project: ${project.name}`);
      console.log(`   logoUrl: ${project.logoUrl || 'none'}`);
      console.log(`   screenshotUrl: ${project.screenshotUrl || 'none'}`);
      console.log(`   galleryUrls: ${project.galleryUrls?.length || 0} images`);
      
      // Force update to use thumbnail as screenshotUrl
      let needsUpdate = true;
      const updates = {};

      // Always use thumbnail as screenshotUrl if we have one
      if (project.logoUrl && project.logoUrl.includes('/thumbnails/')) {
        console.log('   🔄 Force updating screenshotUrl to use thumbnail');
        console.log(`   📸 Old screenshotUrl: ${project.screenshotUrl}`);
        console.log(`   📸 New screenshotUrl: ${project.logoUrl}`);
        updates.screenshotUrl = project.logoUrl; // Use thumbnail as main screenshot
      } else {
        needsUpdate = false;
      }
      
      if (needsUpdate) {
        const projectRef = doc(db, 'projects', project.id);
        await updateDoc(projectRef, updates);
        console.log('   ✅ Updated project images');
      } else {
        console.log('   ✅ Project images are correct');
      }
    }
    
    console.log('\n🎉 All projects fixed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing projects:', error);
    process.exit(1);
  }
}

fixProjectImages();
