const SUPABASE_URL = "https://ynstltrzsjdmcmqgchgz.supabase.co";
const SUPABASE_KEY = "sb_publishable_YXrKfPSCSZI6--FWXmH21w_Vc7zFPgp";
const SITE_URL = "https://all-job-alert-sl.netlify.app";
const FALLBACK_IMAGE = SITE_URL + "/image/logo-banner.png";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

exports.handler = async function (event) {
  const id = event.queryStringParameters.id;
  const realPageUrl = id ? `${SITE_URL}/job.html?id=${id}` : `${SITE_URL}/index.html`;

  let title = "All Job Alert SL";
  let description = "Sierra Leone's job and opportunity platform — jobs, scholarships, training, and workshops in every district.";
  let image = FALLBACK_IMAGE;
  const shareUrl = `${SITE_URL}/share/${id || ""}`;

  if (id) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/jobs?id=eq.${encodeURIComponent(id)}&select=*`,
        { headers: { apikey: SUPABASE_KEY } }
      );
      const rows = await res.json();

      if (!res.ok) {
        console.error("Supabase error:", res.status, JSON.stringify(rows));
      } else if (!rows.length) {
        console.error("No job found for id:", id);
      } else {
        const job = rows[0];
        title = `${job.title} — ${job.company}`;
        description = (job.description || "").slice(0, 160);
        if (job.image_url) image = job.image_url;
      }
    } catch (err) {
      console.error("Fetch failed:", err.message);
    }
  }

  title = escapeHtml(title);
  description = escapeHtml(description);
  image = escapeHtml(image);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta property="og:type" content="website">
<meta property="og:site_name" content="All Job Alert SL">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${shareUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta http-equiv="refresh" content="0;url=${realPageUrl}">
<script>window.location.replace("${realPageUrl}");</script>
</head>
<body>
<p>Redirecting to <a href="${realPageUrl}">${title}</a>…</p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html
  };
};