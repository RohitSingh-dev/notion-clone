// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOX8qbelhyA74YHi10D-HXxahQ3RLwZfo",
  authDomain: "notion-clone-646b3.firebaseapp.com",
  projectId: "notion-clone-646b3",
  storageBucket: "notion-clone-646b3.firebasestorage.app",
  messagingSenderId: "897155907124",
  appId: "1:897155907124:web:93c226e70ddc7893b35461"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export {db};