// Login / sign-up screen. Visual only — not wired to any real authentication
// or route protection, so every page remains directly reachable without signing in.
// Sign-in checks against two fixed demo accounts (see DEMO_ACCOUNTS) so the prototype
// can show staff vs. regular-user routing without a real backend.

const DEMO_ACCOUNTS = {
  "admin@aamalalmoayyed.bh": { password: "12345", role: "admin", redirect: "admin.html", name: "Staff Admin" },
  "user@aamalalmoayyed.bh": { password: "12345", role: "user", redirect: "index.html", name: "Sarina Adams" },
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
  document.querySelectorAll("[data-switch]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(link.dataset.switch);
    });
  });

  document.getElementById("signinForm").addEventListener("submit", handleSignIn);
  document.getElementById("signupForm").addEventListener("submit", (e) => handleSubmit(e, "Creating your account…", "index.html"));
});

function switchTab(tab) {
  document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  document.querySelectorAll(".auth-form").forEach((f) => f.classList.toggle("active", f.dataset.form === tab));
  document.querySelectorAll("[data-show]").forEach((s) => {
    s.style.display = s.dataset.show === tab ? "inline" : "none";
  });
}

function handleSubmit(e, loadingText, redirectTo) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  btn.textContent = loadingText;
  btn.disabled = true;
  setTimeout(() => {
    window.location.href = redirectTo;
  }, 700);
}

function handleSignIn(e) {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById("signinError");
  errorEl.style.display = "none";

  const email = document.getElementById("signinEmail").value.trim().toLowerCase();
  const password = document.getElementById("signinPassword").value;
  const account = DEMO_ACCOUNTS[email];

  if (!account || account.password !== password) {
    errorEl.style.display = "block";
    return;
  }

  localStorage.setItem("pp_session", JSON.stringify({ email, role: account.role, name: account.name }));

  const btn = form.querySelector("button[type=submit]");
  btn.textContent = "Signing in…";
  btn.disabled = true;
  setTimeout(() => {
    window.location.href = account.redirect;
  }, 700);
}
