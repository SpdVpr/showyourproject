const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');

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

async function updateAdminPassword() {
  try {
    console.log('🔐 Updating admin password...');

    // Sign in with current credentials
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'admin@showyourproject.com', 
      'admin123'
    );
    
    const user = userCredential.user;
    console.log('✅ Admin user signed in with UID:', user.uid);

    // Update password
    const newPassword = 'J&z@+33yD[jW(–7';
    await updatePassword(user, newPassword);
    console.log('✅ Admin password updated successfully');

    console.log('🎉 Admin password update completed!');
    console.log('📧 Email: admin@showyourproject.com');
    console.log('🔑 New Password: J&z@+33yD[jW(–7');
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('ℹ️  Admin user not found. Please create admin user first.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('ℹ️  Current password is incorrect.');
    } else if (error.code === 'auth/weak-password') {
      console.log('ℹ️  New password is too weak.');
    }
  }
}

// Run the script
updateAdminPassword();
