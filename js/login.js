const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("login-error");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    errorMsg.textContent = "Incorrect email or password.";
    return;
  }

  window.location.href = "admin.html";
});