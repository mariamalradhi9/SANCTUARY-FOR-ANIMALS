"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS, setSession } from "@/lib/session";
import { usePageTitle } from "@/lib/usePageTitle";

type Tab = "signin" | "signup";

export default function LoginPage() {
  usePageTitle("Sign In — Aamal Almoayyed Sanctuary");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinError, setSigninError] = useState(false);
  const [signinBusy, setSigninBusy] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupBusy, setSignupBusy] = useState(false);

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSigninError(false);
    const email = signinEmail.trim().toLowerCase();
    const account = DEMO_ACCOUNTS[email];

    if (!account || account.password !== signinPassword) {
      setSigninError(true);
      return;
    }

    setSession({ email, role: account.role, name: account.name });
    setSigninBusy(true);
    setTimeout(() => router.push(account.redirect), 700);
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const email = signupEmail.trim().toLowerCase();
    // New sign-ups aren't one of the two fixed demo accounts, so they're always
    // treated as a regular user (never staff) and land on the Home page.
    setSession({
      email,
      role: "user",
      name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || "New Member",
    });
    setSignupBusy(true);
    setTimeout(() => router.push("/"), 700);
  }

  return (
    <div className="auth-page">
      <div className="auth-center">
        <div className="auth-card">
          <img src="/img/logo.png" alt="Aamal Almoayyed Sanctuary for Animals" className="auth-card-logo" />
          <h2>Welcome Back</h2>
          <p className="auth-card-sub">Sign in to manage your adoption applications, saved pets, and upcoming visits.</p>

          <div className="auth-tabs">
            <button type="button" className={`auth-tab${tab === "signin" ? " active" : ""}`} onClick={() => setTab("signin")}>Sign In</button>
            <button type="button" className={`auth-tab${tab === "signup" ? " active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
          </div>

          <form className={`auth-form${tab === "signin" ? " active" : ""}`} onSubmit={handleSignIn}>
            <div className="field">
              <label htmlFor="signinEmail">Email</label>
              <input type="email" id="signinEmail" placeholder="you@example.com" required value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} />
              <p className="hint">Demo accounts — Staff: admin@aamalalmoayyed.bh · User: user@aamalalmoayyed.bh (password: 12345)</p>
            </div>
            <div className="field">
              <label htmlFor="signinPassword">Password</label>
              <input type="password" id="signinPassword" placeholder="••••••••" required value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} />
            </div>
            {signinError && <p className="field-error">Incorrect email or password. Try one of the demo accounts above.</p>}
            <div className="auth-row">
              <label className="checkbox-inline small"><input type="checkbox" /> Remember me</label>
              <a href="#" className="auth-link">Forgot password?</a>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={signinBusy}>
              {signinBusy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <form className={`auth-form${tab === "signup" ? " active" : ""}`} onSubmit={handleSignUp}>
            <div className="row-2">
              <div className="field"><label htmlFor="signupFirst">First Name</label><input type="text" id="signupFirst" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div className="field"><label htmlFor="signupLast">Last Name</label><input type="text" id="signupLast" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            </div>
            <div className="field">
              <label htmlFor="signupEmail">Email</label>
              <input type="email" id="signupEmail" placeholder="you@example.com" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="signupPassword">Password</label>
              <input type="password" id="signupPassword" placeholder="At least 8 characters" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={signupBusy}>
              {signupBusy ? "Creating your account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-switch-text">
            {tab === "signin" ? (
              <span>Don&apos;t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab("signup"); }}>Sign Up</a></span>
            ) : (
              <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab("signin"); }}>Sign In</a></span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
