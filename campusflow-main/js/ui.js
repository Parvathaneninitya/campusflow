/* ===============================================
    CampusFlow UI Controls
=============================================== */
import { auth, onAuthStateChanged } from "./firebase.js";
// Update this line at the top of js/ui.js:
import { handleCreateEventSubmit, setupCertificateListeners } from "../faculty/js/createevent.js"; 

let currentUser = null;

// Track active user
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// GLOBAL SUBMIT DELEGATION (Prevents page reloads across the entire app)
document.addEventListener("submit", (e) => {
  if (e.target && e.target.id === "createEventForm") {
    handleCreateEventSubmit(e, currentUser);
  }
});

// Call certificate listeners when Create Event tab is opened/loaded
document.addEventListener("DOMContentLoaded", () => {
  setupCertificateListeners();
});
document.addEventListener("DOMContentLoaded", () => {

    /* ---------------------------
        Register Modal
    ---------------------------- */

    const openModalBtn = document.getElementById("openRegisterModal");
    const closeModalBtn = document.getElementById("closeModal");
    const registerModal = document.getElementById("registerModal");

    if (openModalBtn && registerModal) {
        openModalBtn.addEventListener("click", () => {
            registerModal.classList.add("show");
        });
    }

    if (closeModalBtn && registerModal) {
        closeModalBtn.addEventListener("click", () => {
            registerModal.classList.remove("show");
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === registerModal) {
            registerModal.classList.remove("show");
        }
    });

    /* ---------------------------
        Role Tab UI Switcher
    ---------------------------- */

    const roleButtons = document.querySelectorAll(".role-btn");
    const registerSection = document.getElementById("studentRegisterSection");
    const loginForm = document.getElementById("loginForm");

    if (roleButtons.length > 0) {
        roleButtons.forEach((button) => {
            button.addEventListener("click", () => {
                // Update active tab styling
                roleButtons.forEach((btn) => btn.classList.remove("active"));
                button.classList.add("active");

                const selectedRole = button.dataset.role;

                // Toggle Student Registration section visibility
                if (registerSection) {
                    if (selectedRole === "student") {
                        registerSection.style.display = "block";
                    } else {
                        registerSection.style.display = "none";
                    }
                }

                // Optional: Clear form inputs when switching roles for clean interaction
                if (loginForm) {
                    loginForm.reset();
                }
            });
        });
    }

    /* ---------------------------
        Password Toggle
    ---------------------------- */

    document.querySelectorAll(".toggle-password").forEach((button) => {
        button.addEventListener("click", () => {
            const input = button.parentElement.querySelector("input");
            const icon = button.querySelector("i");

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                if (icon) {
                    icon.classList.replace("fa-eye", "fa-eye-slash");
                }
            } else {
                input.type = "password";
                if (icon) {
                    icon.classList.replace("fa-eye-slash", "fa-eye");
                }
            }
        });
    });

});