const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");

feedbackForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const newFeedback = {
    name: document.getElementById("fb-name").value || null,
    email: document.getElementById("fb-email").value || null,
    reason: document.getElementById("fb-reason").value,
    message: document.getElementById("fb-message").value
  };

  const { error } = await supabaseClient.from("feedback").insert([newFeedback]);

  if (error) {
    console.error(error);
    feedbackStatus.textContent = "Something went wrong. Please try again.";
    feedbackStatus.style.color = "red";
  } else {
    feedbackStatus.textContent = "Thank you! Your feedback has been sent.";
    feedbackStatus.style.color = "green";
    feedbackForm.reset();
  }
});