
import { useState } from "react";
import "./DoctorLogin.css";

const API_URL = "http://127.0.0.1:8000";

export default function DoctorLogin({ onBack, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/doctor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Doctor login failed.");
      }

      if (!data.access_token || data.doctor?.role !== "doctor") {
        throw new Error("The server returned an invalid login response.");
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that FastAPI is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="doctor-login-page">
      <section className="doctor-login-panel">
        <button
          className="doctor-login-back"
          type="button"
          onClick={onBack}
        >
          ← Back to MediCase
        </button>

        <div className="doctor-login-mark">M</div>
        <p className="doctor-login-eyebrow">MEDICASE AI · CLINICAL WORKSPACE</p>
        <h1>Doctor sign in</h1>
        <p className="doctor-login-description">
          Sign in to review patient histories and case records.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="doctor-email">Doctor email</label>
          <input
            id="doctor-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your registered email"
            required
          />

          <label htmlFor="doctor-password">Password</label>
          <input
            id="doctor-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="doctor-login-error" role="alert">{error}</p>}

          <button
            className="doctor-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in to dashboard →"}
          </button>
        </form>

        <p className="doctor-login-footer">
          Authorized medical personnel only.
        </p>
      </section>
    </main>
  );
}
