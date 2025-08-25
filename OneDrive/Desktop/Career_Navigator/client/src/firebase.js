import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUpMHa8mGVe4D2yBQPX0EYJmoyDkMw5Jw",
  authDomain: "career-path-navigator-c4d1b.firebaseapp.com",
  projectId: "career-path-navigator-c4d1b",
  storageBucket: "career-path-navigator-c4d1b.firebasestorage.app",
  messagingSenderId: "640577034327",
  appId: "1:640577034327:web:d4bd4350bb57e758edeb12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);