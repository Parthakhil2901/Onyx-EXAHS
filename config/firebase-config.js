// Secure Firebase Configuration
// This file should be kept server-side and never exposed to client

const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyBRSeSueXpJWgsWfU_CG3YZUcqOF-oxeW8",
  authDomain: "job-verse-c35ff.firebaseapp.com",
  databaseURL: "https://job-verse-c35ff-default-rtdb.firebaseio.com",
  projectId: "job-verse-c35ff",
  storageBucket: "job-verse-c35ff.firebasestorage.app",
  messagingSenderId: "313840143364",
  appId: "1:313840143364:web:7de4898b589edbff54b951",
  measurementId: "G-F1VGQ7ELLW",
};

module.exports = firebaseConfig;
