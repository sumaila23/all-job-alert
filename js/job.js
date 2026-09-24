const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");
const container = document.getElementById("job-details");

function buildApplyLink(applyText) {
  if (applyText.includes("@")) {
    return { href: "mailto:" + applyText, label: "Apply by Email" };
  }
  if (applyText.startsWith("http")) {
    return { href: applyText, label: "Apply Now" };
  }
  return { href: "tel:" + applyText, label: "Apply by Phone" };
}

async function loadJob() {
  if (!jobId) {
    container.innerHTML = "<p>Job not found.</p>";
    return;
  }

  const { data, error } = await supabaseClient
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

    const applyLink = buildApplyLink(data.how_to_apply);
    
  if (error || !data) {
    container.innerHTML = "<p>Job not found.</p>";
    return;
  }

  document.title = data.title + " - All Job Alert SL";
  
// flyer section//
  const flyerHtml = data.image_url
  ? `<img src="${data.image_url}" alt="Job flyer" class="job-flyer">`
  : "";

container.innerHTML = `
  ${flyerHtml}
  <h2>${data.title}</h2>
  <p class="job-meta">${data.company} · ${data.city}, ${data.district}</p>


    <ul class="job-facts">
      <li>${data.type}</li>
      <li>Closes ${data.deadline}</li>
    </ul>

    <h3>About the job</h3>
    <p>${data.description}</p>

    <h3>How to apply</h3>
    <p>${data.how_to_apply}</p>

   <a href="${applyLink.href}" class="apply-btn">${applyLink.label}</a>
  `;
}

loadJob();