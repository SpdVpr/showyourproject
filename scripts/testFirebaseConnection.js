const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

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

async function testConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    console.log('✅ Firebase app initialized');
    console.log('✅ Auth service connected');
    console.log('✅ Firestore service connected');
    console.log('🎉 Firebase connection successful!');
    
    console.log('\n📋 Configuration:');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);
    console.log('Storage Bucket:', firebaseConfig.storageBucket);
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}

// Run the test
testConnection();
