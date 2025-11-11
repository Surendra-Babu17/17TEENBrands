// main.js

// Helper navigation functions (optional)
const login = () => window.location.href = "./login.html";
const reg = () => window.location.href = "./register.html";

// Main login function — call this on form submit or button click
async function log_sub(event) {
  // If called from a form submit, prevent the default reload
  if (event && event.preventDefault) event.preventDefault();

  // Get input values
  const user_email = document.getElementById("user_email").value.trim();
  const user_password = document.getElementById("user_password").value;

  // Clear previous message
  const msgEl = document.getElementById("demo");
  msgEl.textContent = "";
  msgEl.classList.remove("error-visible");

  // Basic client-side validation (optional)
  if (!user_email || !user_password) {
    showInlineError("Please enter email and password.");
    return;
  }

  try {
    // Fetch user list from local server (db.json)
    const response = await fetch("http://localhost:3000/users");
    if (!response.ok) throw new Error("Failed to fetch users from server.");

    const all_users = await response.json();
    console.log("Fetched users:", all_users);

    const matchedUser = all_users.find(u => u.email === user_email && u.password === user_password);

    if (matchedUser) {
      // Login successful -> redirect
      alert("LOGIN Sucessfull ")
      window.location.href = "https://surendra-babu17.github.io/17TEEN-Brands/";
    } else {
      // Login failed -> use a function inside else block to show message
      function showError() {
        showInlineError("User Not Found Please Register.");
      }
      showError(); // call it
    }
  } catch (err) {
    console.error("Error during login:", err);
    showInlineError("⚠️ Something went wrong. Try again later.");
  }

  // small helper defined outside network try/catch for reuse
  function showInlineError(text) {
    const el = document.getElementById("demo");
    el.textContent = text;
    // Add class to trigger CSS animation (if present)
    el.classList.add("error-visible");
  }
}

// Export or attach to window if needed (for inline onclick usage)
window.log_sub = log_sub;


