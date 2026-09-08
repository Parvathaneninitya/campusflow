import { db } from "../../js/firebase.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/**
 * Loads certificates from Firestore for the logged-in student
 */
export async function loadCertificates(currentUser) {
  const container = document.getElementById("certificatesContainer");
  if (!container) return;

  // Setup Event Delegation ONCE on the container so clicks are never missed
  if (!container.dataset.listenerAttached) {
    container.dataset.listenerAttached = "true";
    
    container.addEventListener("click", async (e) => {
      const btn = e.target.closest(".download-cert-btn");
      if (!btn) return;

      const studentName = btn.dataset.studentName;
      const eventTitle = btn.dataset.eventTitle;
      const templateDataUrl = btn.dataset.templateUrl || "";

      btn.disabled = true;
      btn.textContent = "Generating...";
      try {
        await downloadDynamicCertificate(studentName, eventTitle, templateDataUrl);
      } catch (err) {
        console.error("Download error:", err);
        alert("Failed to download certificate.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Download Certificate 🎓";
      }
    });
  }

  try {
    const q = query(
      collection(db, "certificates"), 
      where("studentUid", "==", currentUser.uid)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = "<p>No certificates issued yet. Attendance must be marked and approved by faculty.</p>";
      return;
    }

    container.innerHTML = "";

    for (const docSnap of snap.docs) {
      const cert = docSnap.data();
      const studentName = currentUser.displayName || cert.studentName || currentUser.email.split("@")[0];
      const eventTitle = cert.eventTitle || "Event";

      // Fetch the event document to get the certificate template data URL if available
      let templateDataUrl = cert.certificateTemplate || "";
      if (!templateDataUrl && cert.eventId) {
        try {
          const eventDocRef = doc(db, "events", cert.eventId);
          const eventDocSnap = await getDoc(eventDocRef);
          if (eventDocSnap.exists()) {
            templateDataUrl = eventDocSnap.data().certificateTemplate || "";
          }
        } catch (e) {
          console.warn("Could not fetch event template:", e);
        }
      }

      const card = document.createElement("div");
      card.className = "card";
      // Store data attributes directly on the button to make delegation bulletproof
      card.innerHTML = `
        <h3>${eventTitle}</h3>
        <p>Status: Issued ✅</p>
        <button class="submit-btn download-cert-btn" 
          data-student-name="${studentName}" 
          data-event-title="${eventTitle}" 
          data-template-url="${templateDataUrl}">
          Download Certificate 🎓
        </button>
      `;

      container.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading certificates:", error);
    container.innerHTML = "<p>Error loading certificates.</p>";
  }
}

/**
 * Canvas Generator: Writes student name onto the template image and triggers download
 */
async function downloadDynamicCertificate(studentName, eventTitle, templateDataUrl) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1200;
  canvas.height = 850;

  if (templateDataUrl) {
    await new Promise((resolve, reject) => {
      const templateImg = new Image();
      templateImg.onload = () => {
        canvas.width = templateImg.width;
        canvas.height = templateImg.height;
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      templateImg.onerror = reject;
      templateImg.src = templateDataUrl;
    });
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1b2a4a";
    ctx.lineWidth = 15;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    ctx.font = "bold 40px 'Georgia', serif";
    ctx.fillStyle = "#1b2a4a";
    ctx.textAlign = "center";
    ctx.fillText("CERTIFICATE OF PARTICIPATION", canvas.width / 2, 180);
  }

  ctx.font = "bold 55px 'Georgia', serif";
  ctx.fillStyle = "#1b2a4a";
  ctx.textAlign = "center";
  ctx.fillText(studentName, canvas.width / 2, canvas.height * 0.48);

  ctx.font = "28px 'Arial', sans-serif";
  ctx.fillStyle = "#4a5568";
  ctx.fillText(`for successfully participating in ${eventTitle}`, canvas.width / 2, canvas.height * 0.58);

  const link = document.createElement("a");
  link.download = `${studentName.replace(/\s+/g, "_")}_Certificate.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}