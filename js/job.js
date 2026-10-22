const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");
const container = document.getElementById("job-details");

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildApplyLink(applyText) {
  const text = applyText.trim();
  if (text.startsWith("http")) {
    return { href: text, label: "Apply Now", external: true };
  }
  if (text.includes("@")) {
    return { href: "mailto:" + text, label: "Apply by Email", external: false };
  }
  return { href: "tel:" + text, label: "Apply by Phone", external: false };
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

  const isRemote = data.scope === "remote";

  const flyerHtml = data.image_url
    ? `<img src="${escapeHtml(data.image_url)}" alt="Job flyer" class="job-flyer">`
    : "";

  const backLink = isRemote
    ? `<p><a href="remote.html">← Back to remote jobs</a></p>`
    : "";

  const locationText = isRemote
    ? `${escapeHtml(data.city)} (Remote)`
    : `${escapeHtml(data.city)}, ${escapeHtml(data.district)}`;

  const applyLink = buildApplyLink(data.how_to_apply);
  const applyTarget = applyLink.external ? ' target="_blank" rel="noopener noreferrer"' : "";

  const shareUrl = `${window.location.origin}/share/${jobId}`;
  const shareText = encodeURIComponent(`${data.title} at ${data.company} - ${data.district}\n\nSee full details and apply here:\n${shareUrl}`);
  const whatsappLink = `https://wa.me/?text=${shareText}`;

  container.innerHTML = `
    ${backLink}
    ${flyerHtml}
    <h2>${escapeHtml(data.title)}</h2>
    <p class="job-meta">${escapeHtml(data.company)} · ${locationText}</p>

    <ul class="job-facts">
      <li>${escapeHtml(data.type)}</li>
      <li>${data.deadline ? `Closes ${escapeHtml(data.deadline)}` : "No closing date"}</li>
      ${data.source ? `<li>Source: ${escapeHtml(data.source)}</li>` : ""}
    </ul>

    <h3>About the job</h3>
    <p class="job-description">${escapeHtml(data.description)}</p>

    <h3>How to apply</h3>
    <p class="job-apply-text">${escapeHtml(data.how_to_apply)}</p>

    <a href="${escapeHtml(applyLink.href)}"${applyTarget} class="apply-btn">${applyLink.label}</a>
    <a href="${whatsappLink}" target="_blank" class="share-btn">Share on WhatsApp</a>
  `;
}

loadJob();