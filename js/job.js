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

  if (error || !data) {
    console.error(error);
    container.innerHTML = "<p>Job not found.</p>";
    return;
  }

  document.title = data.title + " - All Job Alert SL";

  const flyerHtml = data.image_url
    ? `<img src="${data.image_url}" alt="Job flyer" class="job-flyer">`
    : "";

  const applyLink = buildApplyLink(data.how_to_apply);

  const shareUrl = `${window.location.origin}/share/${jobId}?v=${Date.now()}`;
  const shareText = encodeURIComponent(`${data.title} at ${data.company} - ${data.district}\n\nSee full details and apply here:\n${shareUrl}`);
  const whatsappLink = `https://wa.me/?text=${shareText}`;

  container.innerHTML = `
    ${flyerHtml}
    <h2>${data.title}</h2>
    <p class="job-meta">${data.company} · ${data.city}, ${data.district}</p>

    <ul class="job-facts">
      <li>${data.type}</li>
      <li>${data.deadline ? `Closes ${data.deadline}` : "No closing date"}</li>
    </ul>

    <h3>About the job</h3>
    <p>${data.description}</p>

    <h3>How to apply</h3>
    <p>${data.how_to_apply}</p>

    <a href="${applyLink.href}" class="apply-btn">${applyLink.label}</a>
    <a href="${whatsappLink}" target="_blank" class="share-btn">Share on WhatsApp</a>
  `;
}

loadJob();