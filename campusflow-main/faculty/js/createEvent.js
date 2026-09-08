// js/create-event.js
import * as eventService from './services/eventService.js';

let uploadedImage = null;
let certificateTemplateDataUrl = "";

export function setupCertificateListeners() {
  const templateInput = document.getElementById("certTemplateInput");
  const certEnabledCheckbox = document.getElementById("certificateEnabled");
  const certPreviewContainer = document.getElementById("certPreviewContainer");
  const canvas = document.getElementById("certCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const titleInput = document.getElementById("eventTitle");

  certEnabledCheckbox?.addEventListener("change", (e) => {
    if (certPreviewContainer) {
      certPreviewContainer.style.display = e.target.checked ? "block" : "none";
    }
  });

  templateInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedImage = new Image();
      uploadedImage.onload = () => {
        if (canvas && ctx) {
          const maxWidth = 1000;
          let scale = 1;
          if (uploadedImage.width > maxWidth) {
            scale = maxWidth / uploadedImage.width;
          }

          canvas.width = uploadedImage.width * scale;
          canvas.height = uploadedImage.height * scale;

          drawCertificatePreview(canvas, ctx, titleInput?.value);
          canvas.style.display = "block";
          certificateTemplateDataUrl = canvas.toDataURL("image/jpeg", 0.6);
        }
      };
      uploadedImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  titleInput?.addEventListener("input", () => {
    if (canvas && ctx && uploadedImage) {
      drawCertificatePreview(canvas, ctx, titleInput.value);
    }
  });
}

function drawCertificatePreview(canvas, ctx, titleValue) {
  if (!uploadedImage || !ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

  const sampleName = "Sample Student Name";
  const fontSize = Math.round(canvas.width * 0.04);
  ctx.font = `bold ${fontSize}px 'Poppins', sans-serif`;
  ctx.fillStyle = "#1e293b";
  ctx.textAlign = "center";

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  ctx.fillText(sampleName, x, y);

  const eventTitle = titleValue?.trim() || "Event Title";
  const subFontSize = Math.round(fontSize * 0.5);
  ctx.font = `${subFontSize}px 'Poppins', sans-serif`;
  ctx.fillStyle = "#64748b";
  ctx.fillText(`For participating in ${eventTitle}`, x, y + fontSize * 1.2);

  certificateTemplateDataUrl = canvas.toDataURL("image/jpeg", 0.6);
}

export async function handleCreateEventSubmit(e, currentUser) {
  e.preventDefault(); 
  
  const form = e.target;
  const submitBtn = form.querySelector("button[type='submit']");
  const certEnabledCheckbox = document.getElementById("certificateEnabled");
  const isCertEnabled = certEnabledCheckbox ? certEnabledCheckbox.checked : false;
  
  const canvas = document.getElementById("certCanvas");
  
  let finalTemplateUrl = certificateTemplateDataUrl;
  if (isCertEnabled && !finalTemplateUrl && canvas && canvas.style.display !== "none") {
    finalTemplateUrl = canvas.toDataURL("image/jpeg", 0.6);
  }

  if (isCertEnabled && !finalTemplateUrl) {
    alert("Please upload a certificate template image or uncheck the certificate option.");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Event...";
  }

  try {
    const eventData = {
      title: document.getElementById("eventTitle")?.value || "",
      description: document.getElementById("eventDescription")?.value || "",
      club: document.getElementById("eventClub")?.value || "",
      venue: document.getElementById("eventVenue")?.value || "",
      date: document.getElementById("eventDate")?.value || "",
      startTime: document.getElementById("eventStartTime")?.value || "",
      endTime: document.getElementById("eventEndTime")?.value || "",
      registrationDeadline: document.getElementById("eventRegistrationDeadline")?.value || "",
      maxParticipants: document.getElementById("eventMaxParticipants")?.value || 0,
      eligibleYears: Array.from(document.querySelectorAll("input[name='eligibleYears']:checked")).map((cb) => cb.value),
      eligibleDepartments: Array.from(document.querySelectorAll("input[name='eligibleDepartments']:checked")).map((cb) => cb.value),
      certificateEnabled: isCertEnabled,
      certificateTemplate: isCertEnabled ? finalTemplateUrl : null,
      status: "pending"
    };

    await eventService.createEvent(eventData, currentUser);

    alert("Event request submitted successfully!");
    form.reset();

    if (canvas) canvas.style.display = "none";
    const certPreviewContainer = document.getElementById("certPreviewContainer");
    if (certPreviewContainer) certPreviewContainer.style.display = "none";

    uploadedImage = null;
    certificateTemplateDataUrl = "";
  } catch (err) {
    console.error("Error creating event:", err);
    alert("Failed to create event: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Event";
    }
  }
}

export function initCreateEvent(currentUser) {
  setupCertificateListeners();

  const form = document.getElementById("createEventForm");
  if (form) {
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", (e) => {
      handleCreateEventSubmit(e, currentUser);
    });
  }
}