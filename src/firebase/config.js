// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByQyGG_6x-ItMsNrNAzdETxcqqG8K8zYY",
  authDomain: "kitzcorner.firebaseapp.com",
  projectId: "kitzcorner",
  storageBucket: "kitzcorner.firebasestorage.app",
  messagingSenderId: "109698668861",
  appId: "1:109698668861:web:6dffcc1be5717503a10d54",
  measurementId: "G-NB5LEEBZTS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);