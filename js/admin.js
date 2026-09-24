
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
      <h3>${job.title}</h3>
      <p>${job.company} · ${job.city}, ${job.district}</p>
      <div class="admin-actions">
        <button class="approve-btn" data-id="${job.id}">Approve</button>
        <button class="reject-btn" data-id="${job.id}">Reject</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.dataset.id, "approved"));
  });

  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.dataset.id, "rejected"));
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
}

loadPending();