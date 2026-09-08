import { db } from "../../js/firebase.js";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function loadApprovedEvents(currentUser, userProfile = {}) {
  const container = document.getElementById("approvedEventsContainer");
  if (!container) return;

  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("status", "in", ["Approved", "approved"]));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = "<p>No upcoming approved events.</p>";
      return;
    }

    container.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const allowedDepts = data.eligibleDepartments || ["All"];
      const allowedYears = data.eligibleYears || ["All"];

      const studentDept = userProfile?.department || userProfile?.dept || "";
      const studentYear = userProfile?.year || "";

      const deptMatch = allowedDepts.includes("All") || allowedDepts.includes(studentDept);
      const yearMatch = allowedYears.includes("All") || allowedYears.includes(studentYear);

      if (!deptMatch || !yearMatch) {
        return; 
      }

      const registeredList = data.registeredStudents || [];
      const isRegistered = currentUser ? registeredList.includes(currentUser.uid) : false;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${data.title || data.eventName || "Untitled Event"}</h3>
        <p><strong>Venue:</strong> ${data.venue || "TBA"}</p>
        <p><strong>Date:</strong> ${data.date || "TBA"}</p>
        <p><strong>Max Capacity:</strong> ${data.maxParticipants || data.capacity || "N/A"}</p>
        <button class="submit-btn reg-btn" ${isRegistered ? "disabled" : ""} style="margin-top: 1rem;">
          <i class="fa-solid ${isRegistered ? 'fa-check' : 'fa-user-plus'}"></i>
          ${isRegistered ? "Already Registered" : "Register Now"}
        </button>
      `;

      if (!isRegistered) {
        card.querySelector(".reg-btn")?.addEventListener("click", async () => {
          try {
            await addDoc(collection(db, "registrations"), {
              eventId: id,
              eventTitle: data.title || data.eventName || "Untitled Event",
              studentUid: currentUser.uid,
              registerNumber: userProfile?.registerNumber || userProfile?.regNo || "N/A",
              studentEmail: currentUser.email,
              registeredAt: serverTimestamp()
            });

            await updateDoc(doc(db, "events", id), {
              registeredStudents: arrayUnion(currentUser.uid),
              registeredCount: increment(1)
            });

            alert(`Successfully registered for ${data.title || data.eventName}!`);
            loadApprovedEvents(currentUser, userProfile);
          } catch (err) {
            console.error("Registration failed:", err);
            alert("Failed to register. Try again.");
          }
        });
      }

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Events error:", err);
    container.innerHTML = "<p>Error loading events.</p>";
  }
}