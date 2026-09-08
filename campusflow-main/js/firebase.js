// =============================================
// CampusFlow Firebase Configuration
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// =============================================
// Firebase Config
// Replace these values with your Firebase project
// =============================================

const firebaseConfig = {
  apiKey: "AIzaSyDhjF9erNhYoWQjQ2MyhYLS5J39uCeFAt8",
  authDomain: "campusflow-c7c50.firebaseapp.com",
  projectId: "campusflow-c7c50",
  storageBucket: "campusflow-c7c50.firebasestorage.app",
  messagingSenderId: "325907042493",
  appId: "1:325907042493:web:91b9d67f7f9223d2b6a7d4",
  measurementId: "G-8VWTHEP4PR"
};


// =============================================
// Initialize Firebase
// =============================================

const app = initializeApp(firebaseConfig);


// =============================================
// Firebase Services
// =============================================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// =============================================
// Authentication Persistence
// Keeps user logged in after refresh
// =============================================

setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("✅ Authentication persistence enabled.");
    })
    .catch((error) => {
        console.error("Persistence Error:", error);
    });


// =============================================
// Collection Names
// =============================================

export const COLLECTIONS = {

    USERS: "users",

    EVENTS: "events",

    REGISTRATIONS: "registrations",

    ATTENDANCE: "attendance",

    CERTIFICATES: "certificates",

    NOTIFICATIONS: "notifications"

};


// =============================================
// User Roles
// =============================================

export const ROLES = {

    STUDENT: "student",

    FACULTY: "faculty",

    CLUB: "club",

    ADMIN: "admin"

};


// =============================================
// User Status
// =============================================

export const STATUS = {

    ACTIVE: "active",

    INACTIVE: "inactive",

    BLOCKED: "blocked"

};


// =============================================
// Export Firebase Services
// =============================================

export {

    app,

    auth,

    db,

    storage,

    serverTimestamp

};