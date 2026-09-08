/* ==========================================================
   CampusFlow Authentication
   Part 1 - Login & Role Verification
========================================================== */

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================================================
   DOM Elements
========================================================== */

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const rememberMe = document.querySelector(".remember input");
const forgotPassword = document.getElementById("forgotPassword");
const loader = document.getElementById("loader");
const toast = document.getElementById("toast");
const roleButtons = document.querySelectorAll(".role-btn");

let selectedRole = "student";

/* ==========================================================
   Role Tabs Selection
========================================================== */

roleButtons.forEach(button => {
    button.addEventListener("click", () => {
        roleButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        selectedRole = button.dataset.role;

        const registerSection = document.getElementById("studentRegisterSection");

        if (registerSection) {
            if (selectedRole === "student") {
                registerSection.style.display = "block";
            } else {
                registerSection.style.display = "none";
            }
        }
    });
});

/* ==========================================================
   Loader UI Controls
========================================================== */

function showLoader() {
    if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
    if (loader) loader.classList.add("hidden");
}

/* ==========================================================
   Toast Notification System
========================================================== */

function showToast(message, type = "success") {
    if (!toast) return;

    toast.innerText = message;
    toast.className = type;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

/* ==========================================================
   Login Execution & Role Enforcement
========================================================== */

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!email || !password) {
            showToast("Please enter email and password.", "error");
            return;
        }

        showLoader();

        try {
            // Set session/local persistence
            await setPersistence(
                auth,
                rememberMe && rememberMe.checked
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );

            // Authenticate with Firebase Auth
            const credential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const uid = credential.user.uid;
            console.log("AUTH UID =", uid);

            // Retrieve User Profile Document from Firestore
            const userRef = doc(db, "users", uid);
            console.log("Reading:", userRef.path);

            const snapshot = await getDoc(userRef);
            console.log("Exists:", snapshot.exists());

            if (!snapshot.exists()) {
                console.log("Document Missing");
                hideLoader();
                showToast("User profile not found.", "error");
                return;
            }

            console.log("User Data:", snapshot.data());
            const user = snapshot.data();

            // Verify if selected tab role matches Firestore account role
            if (user.role !== selectedRole) {
                hideLoader();
                showToast(
                    `This account belongs to ${user.role}. Please switch tabs to login.`,
                    "error"
                );
                return;
            }

            showToast("Login Successful!");

            // Role-Based Redirection
            switch (user.role) {
                case "student":
                    window.location.href = "student/dashboard.html";
                    break;

                case "faculty":
                    window.location.href = "faculty/dashboard.html";
                    break;

                case "club":
                    window.location.href = "club/dashboard.html";
                    break;

                case "admin":
                    window.location.href = "admin/dashboard.html";
                    break;

                default:
                    hideLoader();
                    showToast("Invalid user role detected.", "error");
            }
        } catch (error) {
            hideLoader();
            console.error(error);

            switch (error.code) {
                case "auth/invalid-credential":
                    showToast("Invalid email or password.", "error");
                    break;

                case "auth/user-not-found":
                    showToast("Account not found.", "error");
                    break;

                case "auth/wrong-password":
                    showToast("Incorrect password.", "error");
                    break;

                case "auth/too-many-requests":
                    showToast("Too many attempts. Try again later.", "error");
                    break;

                default:
                    showToast(error.message, "error");
            }
        }
    });
}

/* ==========================================================
   Forgot Password Handler
========================================================== */

if (forgotPassword) {
    forgotPassword.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();

        if (!email) {
            showToast("Enter your email first.", "error");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showToast("Password reset email sent successfully.");
        } catch (error) {
            console.error(error);

            switch (error.code) {
                case "auth/user-not-found":
                    showToast("No account found with this email.", "error");
                    break;

                case "auth/invalid-email":
                    showToast("Invalid email format.", "error");
                    break;

                default:
                    showToast(error.message, "error");
            }
        }
    });
}

/* ==========================================================
   Logout Helper Export
========================================================== */

export async function logout() {
    try {
        await signOut(auth);
        window.location.href = "../index.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

/* ==========================================================
   Global Auth State Observer & Auto Redirect
========================================================== */

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) return;

        const data = snap.data();
        const path = window.location.pathname.toLowerCase();

        /* Check if user is on index/root route */
        if (
            path.endsWith("index.html") ||
            path === "/" ||
            path.endsWith("/")
        ) {
            switch (data.role) {
                case "student":
                    window.location.replace("student/dashboard.html");
                    break;

                case "faculty":
                    window.location.replace("faculty/dashboard.html");
                    break;

                case "club":
                    window.location.replace("club/dashboard.html");
                    break;

                case "admin":
                    window.location.replace("admin/dashboard.html");
                    break;
            }
        }
    } catch (error) {
        console.error("Auth State Observer Error:", error);
    }
});

/* ==========================================================
   Password Visibility Toggle
========================================================== */

document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
        const input = button.parentElement.querySelector("input");
        const icon = button.querySelector("i");

        if (!input) return;

        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });
});

/* ==========================================================
   Export Helpers
========================================================== */

export function getCurrentRole() {
    return selectedRole;
}

/* ==========================================================
   Initialization Log
========================================================== */

console.log("CampusFlow Authentication Module Loaded");