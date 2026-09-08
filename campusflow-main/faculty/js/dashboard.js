// js/dashboard.js
import { auth, onAuthStateChanged, signOut, db, doc, getDoc } from "./config/firebase.js";
import { handleCreateEventSubmit, setupCertificateListeners } from "./createEvent.js";
import { renderApproveEvents } from "./approveEvents.js";
import { renderManageEvents } from "./manageEvents.js";
import { initAttendanceManager } from "./attendance.js";
import { initCertificateManager } from "./certificates.js";
import * as eventService from './services/eventService.js';
// Store user globally in module scope
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  // Setup certificate preview/canvas listeners
  setupCertificateListeners();

  // Authentication & Role Check
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/index.html";
      return;
    }

    // Assign globally so the submit listener can access it
    currentUser = user;

    // Role Verification Guard
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== "faculty") {
      alert("Access denied. Faculty privileges required.");
      await signOut(auth);
      window.location.href = "/index.html";
      return;
    }

    // Initialize Navigation and Logout
    setupNavigation(currentUser);
    initLogout();
  });
});

// Navigation tab handler
function setupNavigation(user) {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".tab-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSectionId = link.getAttribute("data-target");

      navLinks.forEach((l) => l.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      link.classList.add("active");
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) targetSection.classList.add("active");

      // Lazy load section data when navigated
      switch (targetSectionId) {
        case "approve-events-section":
          renderApproveEvents();
          break;
        case "manage-events-section":
          renderManageEvents(user);
          break;
        case "attendance-section":
          initAttendanceManager(user);
          break;
        case "certificates-section":
          initCertificateManager(user);
          break;
      }
    });
  });
}

// Global Form Submit Interceptor (Stops page reloads)
document.addEventListener("submit", (e) => {
  if (e.target && e.target.id === "createEventForm") {
    handleCreateEventSubmit(e, currentUser);
  }
});

// Logout handler
function initLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/index.html";
    });
  }
}