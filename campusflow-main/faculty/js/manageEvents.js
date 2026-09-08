// js/manageEvents.js
import * as eventService from './services/eventService.js';

export async function renderManageEvents(currentUser) {
  const container = document.getElementById("manage-events-list");
  if (!container) return;

  container.innerHTML = "<p>Loading your events...</p>";

  try {
    const events = await eventService.getFacultyEvents(currentUser);
    
    if (!events || events.length === 0) {
      container.innerHTML = "<p>You have not created any events yet.</p>";
      return;
    }

    container.innerHTML = events.map(e => `
      <div class="card" style="border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 16px; border-radius: 8px;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">${e.title}</h3>
          <span class="badge badge-${(e.status || 'pending').toLowerCase()}">${e.status || 'Pending'}</span>
        </div>
        <p style="margin: 8px 0;"><strong>Venue:</strong> ${e.venue || 'N/A'} | <strong>Date:</strong> ${e.date || e.startTime || 'N/A'}</p>
        <p style="margin: 8px 0;"><strong>Registrations:</strong> ${e.registeredCount || 0} / ${e.maxParticipants || 'Unlimited'}</p>
        
        <div class="actions" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
          <button class="btn btn-secondary view-reg-btn" data-id="${e.id}">View Registrations</button>
          
          ${e.certificateEnabled !== false ? `
            <button class="btn btn-success issue-cert-btn" data-id="${e.id}" style="background-color: #10b981; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              <i class="fa-solid fa-award"></i> Issue Certificates
            </button>
          ` : ''}

          <button class="btn btn-danger delete-btn" data-id="${e.id}">Delete</button>
        </div>
        
        <div class="registration-drawer" id="drawer-${e.id}" style="display:none; margin-top: 12px; padding: 12px; background-color: #f8fafc; border-radius: 6px;"></div>
      </div>
    `).join("");

    // 1. Delete Button Listener
    container.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
          await eventService.deleteEvent(btn.dataset.id);
          renderManageEvents(currentUser);
        } catch (err) {
          alert("Failed to delete event: " + err.message);
        }
      });
    });

    // 2. View Registrations Drawer Listener
    container.querySelectorAll(".view-reg-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const drawer = document.getElementById(`drawer-${btn.dataset.id}`);
        if (drawer.style.display === "none") {
          drawer.style.display = "block";
          drawer.innerHTML = "<p>Loading registrations...</p>";
          
          try {
            const regs = await eventService.getEventRegistrations(btn.dataset.id);
            if (!regs || regs.length === 0) {
              drawer.innerHTML = "<p style='margin: 0; color: #64748b;'>No registrations yet.</p>";
            } else {
              drawer.innerHTML = `
                <ul style="margin: 0; padding-left: 1.2rem;">
                  ${regs.map(r => `
                    <li style="margin-bottom: 4px;">
                      <strong>Student:</strong> ${r.studentName || r.fullName || 'N/A'} |
                      <strong>ID:</strong> ${r.registerNumber || r.studentId || r.studentUid || 'N/A'} 
                      ${r.studentEmail ? `(${r.studentEmail})` : ''}
                    </li>
                  `).join("")}
                </ul>
              `;
            }
          } catch (err) {
            console.error("Error fetching registrations:", err);
            drawer.innerHTML = `<p style="color: #ef4444; margin: 0;">Failed to load registrations: ${err.message}</p>`;
          }
        } else {
          drawer.style.display = "none";
        }
      });
    });

    // 3. Issue Certificates Listener
    container.querySelectorAll(".issue-cert-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const eventId = btn.dataset.id;
        
        if (!confirm("Are you sure you want to generate and issue certificates to all students who attended?")) {
          return;
        }

        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Issuing...";

        try {
          const result = await eventService.issueCertificatesForEvent(eventId);
          alert(`Success! Issued ${result.count} new certificate(s).`);
        } catch (err) {
          console.error("Certificate issuance error:", err);
          alert("Failed to issue certificates: " + err.message);
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    });

  } catch (err) {
    console.error("Render error:", err);
    container.innerHTML = `<p class="error" style="color: #ef4444;">Failed to load events: ${err.message}</p>`;
  }
}