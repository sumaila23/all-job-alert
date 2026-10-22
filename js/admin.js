function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function checkLogin() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
  }
}

checkLogin();

document.getElementById("logout-btn").addEventListener("click", async function () {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

const heading = document.getElementById("pending-heading");
const list = document.getElementById("pending-jobs");
const feedbackHeading = document.getElementById("feedback-heading");
const feedbackList = document.getElementById("feedback-list");
const remoteListHeading = document.getElementById("remote-list-heading");
const remoteList = document.getElementById("remote-list");
const remoteForm = document.getElementById("remote-form");
const remoteStatus = document.getElementById("remote-status");
const regionSelect = document.getElementById("r-region");
const regionOther = document.getElementById("r-region-other");

async function loadPending() {
  const { data, error } = await supabaseClient
    .from("jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    list.innerHTML = "<p>Could not load jobs.</p>";
    console.error(error);
    return;
  }

  heading.textContent = `Pending jobs (${data.length})`;

  if (data.length === 0) {
    list.innerHTML = "<p>No pending jobs right now.</p>";
    return;
  }

  list.innerHTML = data.map(job => `
    <article class="admin-card">
      <h3>${escapeHtml(job.title)}</h3>
      <p>${escapeHtml(job.company)} · ${escapeHtml(job.city)}, ${escapeHtml(job.district)}</p>
      <div class="admin-actions">
        <button class="approve-btn" data-id="${job.id}">Approve</button>
        <button class="reject-btn" data-id="${job.id}">Reject</button>
      </div>
    </article>
  `).join("");

  list.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.dataset.id, "approved"));
  });

  list.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.dataset.id, "rejected"));
  });
}

async function loadRemoteJobs() {
  const { data, error } = await supabaseClient
    .from("jobs")
    .select("*")
    .eq("scope", "remote")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    remoteList.innerHTML = "<p>Could not load remote jobs.</p>";
    console.error(error);
    return;
  }

  remoteListHeading.textContent = `Live remote jobs (${data.length})`;

  if (data.length === 0) {
    remoteList.innerHTML = "<p>No remote jobs posted yet.</p>";
    return;
  }

  remoteList.innerHTML = data.map(job => `
    <article class="admin-card">
      <h3>${escapeHtml(job.title)}</h3>
      <p>${escapeHtml(job.company)} · ${escapeHtml(job.city)}</p>
      <div class="admin-actions">
        <button class="reject-btn" data-id="${job.id}">Remove</button>
      </div>
    </article>
  `).join("");

  remoteList.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("Remove this remote job from the site?")) {
        updateStatus(btn.dataset.id, "rejected");
      }
    });
  });
}

async function updateStatus(id, newStatus) {
  const { error } = await supabaseClient
    .from("jobs")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    alert("Something went wrong. Please try again.");
    console.error(error);
    return;
  }

  loadPending();
  loadRemoteJobs();
}

async function loadFeedback() {
  const { data, error } = await supabaseClient
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    feedbackList.innerHTML = "<p>Could not load feedback.</p>";
    console.error(error);
    return;
  }

  feedbackHeading.textContent = `Feedback (${data.length})`;

  if (data.length === 0) {
    feedbackList.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  feedbackList.innerHTML = data.map(fb => `
    <article class="admin-card">
      <p><strong>${escapeHtml(fb.name || "Anonymous")}</strong> ${fb.email ? `· ${escapeHtml(fb.email)}` : ""}</p>
      <p><span class="job-type">${escapeHtml(fb.reason)}</span></p>
      <p>${escapeHtml(fb.message)}</p>
    </article>
  `).join("");
}

regionSelect.addEventListener("change", function () {
  if (regionSelect.value === "Other") {
    regionOther.style.display = "block";
    regionOther.setAttribute("required", "true");
  } else {
    regionOther.style.display = "none";
    regionOther.removeAttribute("required");
    regionOther.value = "";
  }
});

remoteForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const newRemoteJob = {
    title: document.getElementById("r-title").value,
    company: document.getElementById("r-company").value,
    city: regionSelect.value === "Other" ? regionOther.value : regionSelect.value,
    district: "Remote",
    type: document.getElementById("r-type").value,
    deadline: document.getElementById("r-deadline").value || null,
    description: document.getElementById("r-description").value,
    how_to_apply: document.getElementById("r-apply").value,
    source: document.getElementById("r-source").value || null,
    image_url: null,
    category: "Job Vacancy",
    scope: "remote",
    status: "approved"
  };

  const { error } = await supabaseClient.from("jobs").insert([newRemoteJob]);

  if (error) {
    console.error(error);
    remoteStatus.textContent = "Something went wrong. Please try again.";
    remoteStatus.style.color = "red";
  } else {
    remoteStatus.textContent = "Remote job posted.";
    remoteStatus.style.color = "green";
    remoteForm.reset();
    regionOther.style.display = "none";
    regionOther.removeAttribute("required");
    loadRemoteJobs();
  }
});

loadPending();
loadRemoteJobs();
loadFeedback();