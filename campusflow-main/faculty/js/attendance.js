// js/attendance.js
import * as eventService from './services/eventService.js';
import { attendanceService } from "./services/attendanceService.js";

export async function initAttendanceManager(currentUser) {
  const select = document.getElementById("attendance-event-select");
  const display = document.getElementById("code-display");
  const startBtn = document.getElementById("start-attendance-btn");
  const stopBtn = document.getElementById("stop-attendance-btn");

  if (!select) return;

  const events = await eventService.getFacultyEvents(currentUser.uid);
  const approved = events.filter(e => e.status === "Approved");

  select.innerHTML = '<option value="">-- Select Approved Event --</option>' + 
    approved.map(e => `<option value="${e.id}" data-code="${e.attendanceCode || ''}" data-open="${e.attendanceOpen}">${e.title}</option>`).join("");

  select.addEventListener("change", () => {
    const opt = select.options[select.selectedIndex];
    if (!select.value) {
      display.textContent = "------";
      startBtn.disabled = true;
      stopBtn.disabled = true;
      return;
    }

    const isOpen = opt.dataset.open === "true";
    if (isOpen) {
      display.textContent = opt.dataset.code;
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      display.textContent = "------";
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  });

  startBtn.addEventListener("click", async () => {
    const eventId = select.value;
    const code = await attendanceService.startAttendance(eventId);
    display.textContent = code;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    // Update local dataset
    select.options[select.selectedIndex].dataset.open = "true";
    select.options[select.selectedIndex].dataset.code = code;
  });

  stopBtn.addEventListener("click", async () => {
    const eventId = select.value;
    await attendanceService.stopAttendance(eventId);
    display.textContent = "------";
    startBtn.disabled = false;
    stopBtn.disabled = true;
    select.options[select.selectedIndex].dataset.open = "false";
    select.options[select.selectedIndex].dataset.code = "";
  });
}