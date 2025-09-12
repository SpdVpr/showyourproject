const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, sendEmailVerification, deleteUser } = require('firebase/auth');

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

async function testEmailVerification() {
  const testEmail = 'test-verification@example.com';
  const testPassword = 'testpassword123';
  
  try {
    console.log('🧪 Testing email verification...');
    console.log('📧 Test email:', testEmail);

    // Create test user
    console.log('👤 Creating test user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log('✅ Test user created with UID:', user.uid);

    // Send verification email
    console.log('📨 Sending verification email...');
    await sendEmailVerification(user, {
      url: 'https://showyourproject.com/dashboard',
      handleCodeInApp: false
    });
    console.log('✅ Email verification sent successfully!');

    // Clean up - delete test user
    console.log('🧹 Cleaning up test user...');
    await deleteUser(user);
    console.log('✅ Test user deleted');

    console.log('🎉 Email verification test completed successfully!');
    console.log('');
    console.log('If you didn\'t receive an email, check:');
    console.log('1. Firebase Console → Authentication → Templates → Email verification is ENABLED');
    console.log('2. Firebase Console → Authentication → Settings → Authorized domains includes your domain');
    console.log('3. Your spam/junk folder');
    console.log('4. Firebase Console → Authentication → Settings → Project settings has correct support email');
    
  } catch (error) {
    console.error('❌ Email verification test failed:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Test email already exists. Try with a different email.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('ℹ️  Invalid email format.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('ℹ️  Email/password authentication is not enabled in Firebase Console.');
    } else if (error.code === 'auth/weak-password') {
      console.log('ℹ️  Password is too weak.');
    } else {
      console.log('ℹ️  Check Firebase Console configuration.');
    }
  }
}

// Run the test
testEmailVerification();
