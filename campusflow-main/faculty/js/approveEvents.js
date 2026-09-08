// js/approveEvents.js
// ✅ Correct (imports the named function directly)
import * as eventService from './services/eventService.js';
export async function renderApproveEvents() {
  const container = document.getElementById("approval-list");
  if (!container) return;

  container.innerHTML = "<p>Loading pending requests...</p>";

  try {
    const pending = await eventService.getPendingEvents();
    
    if (!pending || pending.length === 0) {
      container.innerHTML = "<p>No pending event approvals.</p>";
      return;
    }

    container.innerHTML = pending.map(e => `
      <div class="card event-card" data-id="${e.id}">
        <h3>${e.title || 'Untitled Event'}</h3>
        <p><strong>Organizer:</strong> ${e.club || 'N/A'} (${e.facultyName || 'N/A'})</p>
        <p><strong>Date/Time:</strong> ${e.date || 'TBD'} | ${e.startTime || ''} - ${e.endTime || ''}</p>
        <p><strong>Venue:</strong> ${e.venue || 'N/A'}</p>
        <p>${e.description || ''}</p>
        <div class="actions">
          <button class="btn btn-primary approve-btn" data-id="${e.id}">Approve</button>
          <button class="btn btn-danger reject-btn" data-id="${e.id}">Reject</button>
        </div>
      </div>
    `).join("");

    // Attach Event Listeners safely with error handling and loading indicators
    container.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        try {
          e.target.disabled = true;
          e.target.innerText = "Approving...";
          await eventService.approveEvent(id);
          await renderApproveEvents(); // Refresh list
        } catch (err) {
          alert(`Failed to approve event: ${err.message}`);
          e.target.disabled = false;
          e.target.innerText = "Approve";
        }
      });
    });

    container.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        try {
          e.target.disabled = true;
          e.target.innerText = "Rejecting...";
          await eventService.rejectEvent(id);
          await renderApproveEvents(); // Refresh list
        } catch (err) {
          alert(`Failed to reject event: ${err.message}`);
          e.target.disabled = false;
          e.target.innerText = "Reject";
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<p class="error">Failed to load approvals: ${err.message}</p>`;
  }
}