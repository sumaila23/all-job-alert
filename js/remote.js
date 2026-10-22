const searchBox = document.getElementById("search");
const jobsList = document.getElementById("jobs");
const jobsHeading = document.querySelector("main h2");

let allJobs = [];

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function loadJobs() {
  const { data, error } = await supabaseClient
    .from("jobs")
    .select("*")
    .eq("status", "approved")
    .eq("scope", "remote")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    jobsList.innerHTML = "<p>Could not load remote jobs. Please try again later.</p>";
    return;
  }

  allJobs = data;
  renderJobs();
}

function renderJobs() {
  const searchText = searchBox.value.toLowerCase();

  const filtered = allJobs.filter(job =>
    (job.title + " " + job.company + " " + job.city).toLowerCase().includes(searchText)
  );

  jobsHeading.textContent = `Remote jobs (${filtered.length})`;

  if (filtered.length === 0) {
    jobsList.innerHTML = "<p>No remote jobs found right now. Check back soon.</p>";
    return;
  }

  jobsList.innerHTML = filtered.map(job => `
    <article class="job-card">
      <span class="job-category">Remote</span>
      <h3>${escapeHtml(job.title)}</h3>
      <p>${escapeHtml(job.company)} · ${escapeHtml(job.city)}</p>
      <p><span class="job-type">${escapeHtml(job.type)}</span> ${job.deadline ? `Closes ${escapeHtml(job.deadline)}` : "No closing date"}</p>
      ${job.source ? `<p>Source: ${escapeHtml(job.source)}</p>` : ""}
      <a href="job.html?id=${job.id}">View details</a>
    </article>
  `).join("");
}

searchBox.addEventListener("input", renderJobs);
loadJobs();