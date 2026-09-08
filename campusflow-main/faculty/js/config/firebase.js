// js/config/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  increment,
  orderBy, 
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDhjF9erNhYoWQjQ2MyhYLS5J39uCeFAt8",
  authDomain: "campusflow-c7c50.firebaseapp.com",
  projectId: "campusflow-c7c50",
  storageBucket: "campusflow-c7c50.firebasestorage.app",
  messagingSenderId: "325907042493",
  appId: "1:325907042493:web:91b9d67f7f9223d2b6a7d4",
  measurementId: "G-8VWTHEP4PR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  increment, // 👈 Included in exports
  orderBy, 
  serverTimestamp,
  writeBatch
};