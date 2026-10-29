
import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ onBack, onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to log in.");
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Check that your backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp-page">
      <header className="lp-header">
        <button className="lp-brand" onClick={onBack} type="button">
          <span className="lp-brand-mark">M</span>
          <span>MediCase <span className="lp-ai">AI</span></span>
        </button>
        <span className="lp-header-note">PATIENT PORTAL</span>
      </header>

      <section className="lp-content">
        <div className="lp-intro">
          <span className="lp-eyebrow">WELCOME BACK</span>
          <h1>Your health story<br />continues here.</h1>
          <p>
            Sign in to continue your patient history intake and help your
            healthcare team understand your story.
          </p>
          <div className="lp-note">
            <span className="lp-note-mark">✳</span>
            <span>Your story matters. Every detail helps build a clearer picture.</span>
          </div>
        </div>

        <form className="lp-form" onSubmit={handleSubmit}>
          <div className="lp-form-heading">
            <h2>Patient sign in</h2>
            <p>Enter the details you used to register.</p>
          </div>

          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="lp-error" role="alert">{error}</p>}

          <button className="lp-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to MediCase"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>

          <p className="lp-switch">
            New to MediCase?{" "}
            <button type="button" onClick={onRegister}>
              Create an account
            </button>
          </p>
        </form>
      </section>

      <footer className="lp-footer">
        <span>MEDICASE AI</span>
        <span>Patient history, thoughtfully organized.</span>
      </footer>
    </main>
  );
}
