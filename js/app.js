const searchBox = document.getElementById("search");
const districtBox = document.getElementById("district");
const categoryBox = document.getElementById("category-filter");
const jobsList = document.getElementById("jobs");
const jobsHeading = document.querySelector("main h2");

let allJobs = [];

async function loadJobs() {
  const { data, error } = await supabaseClient
    .from("jobs")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    jobsList.innerHTML = "<p>Could not load jobs. Please try again later.</p>";
    return;
  }

  allJobs = data;
  renderJobs();
}

function renderJobs() {
  const searchText = searchBox.value.toLowerCase();
  const selectedDistrict = districtBox.value;
  const selectedCategory = categoryBox.value;

  const filtered = allJobs.filter(job => {
    const matchesText = (job.title + " " + job.company + " " + job.city).toLowerCase().includes(searchText);
    const matchesDistrict = selectedDistrict === "" || job.district === selectedDistrict;
    const matchesCategory = selectedCategory === "" || job.category === selectedCategory;
    return matchesText && matchesDistrict && matchesCategory;
  });

  jobsHeading.textContent = `Latest jobs (${filtered.length})`;

  if (filtered.length === 0) {
    jobsList.innerHTML = "<p>No jobs found. Try a different search or filter.</p>";
    return;
  }

 jobsList.innerHTML = filtered.map(job => `
  <article class="job-card">
    ${job.image_url ? `<img src="${job.image_url}" alt="Flyer" class="job-thumb">` : ""}
    <span class="job-category">${job.category}</span>
    <h3>${job.title}</h3>
    <p>${job.company} · ${job.city}, ${job.district}</p>
    <p><span class="job-type">${job.type}</span> ${job.deadline ? `Closes ${job.deadline}` : "No closing date"}</p>
    <a href="job.html?id=${job.id}">View details</a>
  </article>
`).join("");
}

searchBox.addEventListener("input", renderJobs);
districtBox.addEventListener("change", renderJobs);
categoryBox.addEventListener("change", renderJobs);
loadJobs();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

document.addEventListener("contextmenu", function (event) {
  if (event.target.closest(".job-card")) {
    event.preventDefault();
  }
});