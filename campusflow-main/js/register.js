// ===============================================
// CampusFlow Student Registration
// ===============================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================================
// DOM
// ===============================================
const registerForm = document.getElementById("studentRegisterForm");

const registerNumber = document.getElementById("registerNumber");

const studentEmail = document.getElementById("studentEmail");

const department = document.getElementById("department");

const year = document.getElementById("year");

const nameInput = document.getElementById("studentName");

const password = document.getElementById("registerPassword");

const confirmPassword = document.getElementById("confirmPassword");

const loader = document.getElementById("loader");

const toast = document.getElementById("toast");

const modal = document.getElementById("registerModal");


// ===============================================
// Toast
// ===============================================

function showToast(message, type = "success") {

    toast.innerText = message;

    toast.className = type;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}


// ===============================================
// Loader
// ===============================================

function showLoader() {

    loader.classList.remove("hidden");

}

function hideLoader() {

    loader.classList.add("hidden");

}


// ===============================================
// Department Mapping
// (Update according to your college register format)
// ===============================================

const departmentMap = {

    "01": "CSE",

    "12": "AI & DS",

    "66": "AI & ML",

    "04": "IT",

    "02": "ECE",

    "03": "EEE",

    "05": "Civil",

    "06": "Mechanical"

};


// ===============================================
// Auto Generate Email + Detect Department + Year
// ===============================================

registerNumber.addEventListener("input", () => {

    const reg = registerNumber.value.trim().toUpperCase();

    studentEmail.value = "";

    department.value = "";

    year.value = "";

    if (reg.length < 7)
        return;

    studentEmail.value = `${reg}@svecw.edu.in`;

    // Department Code
    const deptCode = reg.substring(5, 7);

    if (departmentMap[deptCode]) {

        department.value = departmentMap[deptCode];

    }

    // Admission Year

    const admissionYear =
        parseInt("20" + reg.substring(0, 2));

    const currentYear =
        new Date().getFullYear();

    const diff =
        currentYear - admissionYear + 1;

    switch (diff) {

        case 1:
            year.value = "1st Year";
            break;

        case 2:
            year.value = "2nd Year";
            break;

        case 3:
            year.value = "3rd Year";
            break;

        default:
            year.value = "4th Year";

    }

});


// ===============================================
// Registration
// ===============================================

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = nameInput.value.trim();

    const regNo = registerNumber.value.trim().toUpperCase();

    const email = studentEmail.value.trim();

    const dept = department.value;

    const studentYear = year.value;

    const pass = password.value;

    const confirm = confirmPassword.value;

    if (
        !name ||
        !regNo ||
        !email ||
        !dept ||
        !studentYear ||
        !pass ||
        !confirm
    ) {

        showToast("Please fill all fields.", "error");

        return;

    }

    if (pass !== confirm) {

        showToast("Passwords do not match.", "error");

        return;

    }

    if (pass.length < 8) {

        showToast(
            "Password should contain at least 8 characters.",
            "error"
        );

        return;

    }

    showLoader();

    try {

        // Check Duplicate Register Number

        const duplicate =
            await getDoc(doc(db, "registerNumbers", regNo));

        if (duplicate.exists()) {

            hideLoader();

            showToast(
                "Register Number already exists.",
                "error"
            );

            return;

        }

        // Create Auth User

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                pass
            );

        const uid = credential.user.uid;

        // Store Student

        await setDoc(doc(db, "users", uid), {

            uid,

            name,

            registerNo: regNo,

            email,

            department: dept,

            year: studentYear,

            role: "student",

            status: "active",

            photoURL: "",

            createdAt: serverTimestamp()

        });

        // Prevent Duplicate Register Numbers

        await setDoc(doc(db, "registerNumbers", regNo), {

            uid

        });

        hideLoader();

        showToast("Registration Successful!");

        registerForm.reset();

        studentEmail.value = "";

        department.value = "";

        year.value = "";

        modal.classList.remove("show");

    }

    catch (error) {

        hideLoader();

        console.error(error);

        switch (error.code) {

            case "auth/email-already-in-use":

                showToast(
                    "Student already registered.",
                    "error"
                );

                break;

            case "auth/weak-password":

                showToast(
                    "Weak password.",
                    "error"
                );

                break;

            case "auth/invalid-email":

                showToast(
                    "Invalid register number.",
                    "error"
                );

                break;

            default:

                showToast(
                    error.message,
                    "error"
                );

        }

    }
 /*  catch (error) {

    hideLoader();

    console.error(error);

    alert("Code: " + error.code);

    alert("Message: " + error.message);

}*/

});