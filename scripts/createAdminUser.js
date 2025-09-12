const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDZhPtcwi3SPcV-53CURM3XSATRsTL1BKc",
  authDomain: "showyourproject-com.firebaseapp.com",
  projectId: "showyourproject-com",
  storageBucket: "showyourproject-com.firebasestorage.app",
  messagingSenderId: "852681799745",
  appId: "1:852681799745:web:389ae59e436a6e5e2e2ec0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');

    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@showyourproject.com', 
      'admin123'
    );
    
    const user = userCredential.user;
    console.log('✅ Admin user created with UID:', user.uid);

    // Update display name
    await updateProfile(user, {
      displayName: 'Admin User'
    });
    console.log('✅ Display name updated');

    // Create user document in Firestore
    const userData = {
      email: 'admin@showyourproject.com',
      displayName: 'Admin User',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      socialLinks: {},
      points: 1000,
      tier: 'admin',
      createdAt: serverTimestamp(),
      emailVerified: true
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ Admin user document created in Firestore');

    console.log('🎉 Admin user setup completed!');
    console.log('📧 Email: admin@showyourproject.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

// Run the script
createAdminUser();
