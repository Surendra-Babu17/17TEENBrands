// main.js — improved login/register helper + form wiring

// Simple navigation helpers (used by buttons / links)
const login = () => window.location.href = "./login.html";
const reg = () => window.location.href = "./register.html";

// Utility: validate email with a simple regex
function isValidEmail(email) {
  // conservative email pattern — good for client-side check only
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Utility: show inline message in the demo element
function showInlineMessage(text, { type = "error", timeout = 3500 } = {}) {
  const el = document.getElementById("demo");
  if (!el) {
    // fallback alert if no element present
    if (type === "error") alert(text);
    else console.log(text);
    return;
  }
  el.textContent = text;
  el.style.color = type === "error" ? "#d32f2f" : "green";
  el.classList.add(type === "error" ? "error-visible" : "success-visible");

  if (timeout) {
    clearTimeout(el._msgTimer);
    el._msgTimer = setTimeout(() => {
      el.textContent = "";
      el.classList.remove("error-visible", "success-visible");
    }, timeout);
  }
}

// Enable/disable submit button and optionally change its text
function setSubmitting(isSubmitting, text = "Please wait...") {
  const btn = document.querySelector("#loginForm button[type='submit'], form button[type='submit']");
  if (!btn) return;
  btn.disabled = isSubmitting;
  btn.dataset.orig = btn.dataset.orig || btn.textContent;
  btn.textContent = isSubmitting ? text : btn.dataset.orig;
  btn.style.opacity = isSubmitting ? 0.8 : 1;
  btn.style.cursor = isSubmitting ? "not-allowed" : "pointer";
}

/**
 * log_sub(event)
 * Main login function. Attach to form submit or call manually.
 * Accepts an Event (from form submit) OR no arg (if called from onclick).
 */
async function log_sub(event) {
  if (event && event.preventDefault) event.preventDefault();

  const user_email_el = document.getElementById("user_email");
  const user_password_el = document.getElementById("user_password");
  const email = user_email_el ? user_email_el.value.trim() : "";
  const password = user_password_el ? user_password_el.value : "";

  // quick client-side checks
  if (!email || !password) {
    showInlineMessage("Please enter email and password.");
    (user_email_el || user_password_el || {}).focus?.();
    return;
  }
  if (!isValidEmail(email)) {
    showInlineMessage("Please enter a valid email address.");
    user_email_el.focus();
    return;
  }

  setSubmitting(true, "Checking...");

  try {
    // Try to fetch users list from local JSON server
    // Ensure your json-server is running at http://localhost:3000
    const response = await fetch("http://localhost:3000/users", { cache: "no-store" });

    if (!response.ok) {
      // handle non-2xx responses
      throw new Error(`Server responded ${response.status}`);
    }

    const users = await response.json();
    console.log("Fetched users:", users);

    // Match user by email and password (note: storing plaintext passwords is insecure — this is demo only)
    const matchedUser = Array.isArray(users) ? users.find(u => u.email === email && u.password === password) : null;

    if (matchedUser) {
      // Save a simple session indicator (don't store sensitive info in production)
      try {
        localStorage.setItem("loggedInUser", JSON.stringify({ id: matchedUser.id ?? null, email: matchedUser.email }));
      } catch (e) {
        console.warn("localStorage not available:", e);
      }

      showInlineMessage("Login successful! Redirecting...", { type: "success", timeout: 1200 });

      // small delay then redirect
      setTimeout(() => {
        // replace with your desired post-login page
        window.location.href = "https://surendra-babu17.github.io/17TEEN-Brands/";
      }, 900);
    } else {
      showInlineMessage("User Not Found. Please register or check credentials.");
    }
  } catch (err) {
    console.error("Login error:", err);
    // fallback: check localStorage 'demoUsers' if developer stored any
    const fallback = (() => {
      try {
        const raw = localStorage.getItem("demoUsers");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    })();

    if (fallback && Array.isArray(fallback)) {
      const found = fallback.find(u => u.email === email && u.password === password);
      if (found) {
        showInlineMessage("Login (local fallback) successful! Redirecting...", { type: "success", timeout: 1200 });
        setTimeout(() => window.location.href = "https://surendra-babu17.github.io/17TEEN-Brands/", 900);
        setSubmitting(false);
        return;
      }
    }

    showInlineMessage("⚠️ Unable to reach server. If you're running locally, start json-server at http://localhost:3000");
  } finally {
    setSubmitting(false);
  }
}

// Attach to window for inline onclick usage if page expects it
window.log_sub = log_sub;
window.login = login;
window.reg = reg;

/**
 * Auto-wire forms:
 * If a form with id="loginForm" exists, attach submit handler.
 * If a form with id="regForm" exists, attach registration logic (simple).
 */
document.addEventListener("DOMContentLoaded", () => {
  // Hook login form if present
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", log_sub);
  }

  // Hook simple register form (regForm) to save demo user into localStorage for quick testing
  const regForm = document.getElementById("regForm");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // gather minimal fields (safe for demo only)
      const username = (regForm.querySelector("#username") || {}).value?.trim?.() || "";
      const email = (regForm.querySelector("#email") || {}).value?.trim?.() || "";
      const password = (regForm.querySelector("#password") || {}).value || "";
      const phone = (regForm.querySelector("#phone") || {}).value?.trim?.() || "";

      if (!username || !email || !password) {
        showInlineMessage("Please complete required fields.");
        return;
      }
      if (!isValidEmail(email)) {
        showInlineMessage("Please enter a valid email.");
        return;
      }

      // Save into local 'demoUsers' array — useful if you don't have json-server running.
      try {
        const raw = localStorage.getItem("demoUsers");
        const arr = raw ? JSON.parse(raw) : [];
        // avoid duplicate email
        if (arr.find(u => u.email === email)) {
          showInlineMessage("An account with this email already exists.");
          return;
        }
        const newUser = { id: Date.now(), username, email, password, phone };
        arr.push(newUser);
        localStorage.setItem("demoUsers", JSON.stringify(arr));
        showInlineMessage("Registered locally. You can now login (local fallback).", { type: "success", timeout: 2000 });
        // optional: auto-redirect to login after a moment
        setTimeout(() => window.location.href = "./login.html", 1200);
      } catch (err) {
        console.error("Failed saving demo user:", err);
        showInlineMessage("Failed to register (storage error).");
      }
    });
  }
});
