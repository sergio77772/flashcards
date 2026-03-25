import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0G1QqjdYQnBpgmlGF5svZ-2cUVCUwPMs",
  authDomain: "mis-flashcards.firebaseapp.com",
  projectId: "mis-flashcards",
  storageBucket: "mis-flashcards.firebasestorage.app",
  messagingSenderId: "143909751069",
  appId: "1:143909751069:web:4d6b2a42e91527ad9fb9f4",
  measurementId: "G-LW39KZYG3Z"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
