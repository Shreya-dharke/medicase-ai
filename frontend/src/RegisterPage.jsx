
import { useState } from "react";
import "./RegisterPage.css";

const API_URL = "http://127.0.0.1:8000";

export default function RegisterPage({ onLogin, onBack }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    age: "",
    gender: "",
    contact_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(null);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          age: Number(form.age),
          gender: form.gender.toLowerCase(),
          contact_number: form.contact_number.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data.detail;
        throw new Error(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((item) => item.msg).join(". ")
              : "Registration failed. Please check your details."
        );
      }

      setRegistered(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure your FastAPI backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <main className="rp-page">
        <section className="rp-card rp-success">
          <div className="rp-success-icon" aria-hidden="true">✓</div>
          <p className="rp-eyebrow">ACCOUNT CREATED</p>
          <h1>Welcome to <em>MediCase.</em></h1>
          <p className="rp-description">
            Your patient account has been registered successfully.
            Keep your patient ID available for your future case intake.
          </p>

          <div className="rp-id-panel">
            <span>YOUR PATIENT ID</span>
            <strong>{registered.patient_id}</strong>
            <button
              type="button"
              className="rp-copy-button"
              onClick={() => navigator.clipboard?.writeText(registered.patient_id)}
            >
              Copy patient ID
            </button>
          </div>

          <div className="rp-account-details">
            <span>Registered name</span>
            <strong>{registered.name}</strong>
            <span>Email address</span>
            <strong>{registered.email}</strong>
          </div>

          <p className="rp-notice">
            Keep this ID private. This demo does not yet provide login-based
            access control for patient records.
          </p>

          <button className="rp-primary-button" onClick={onLogin}>
            Continue to login <span>→</span>
          </button>
          <button className="rp-back-button" onClick={onBack}>
            Return to home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="rp-page">
      <section className="rp-layout">
        <aside className="rp-aside">
          <button className="rp-brand" onClick={onBack} type="button">
            <span className="rp-brand-mark">M</span>
            <span>
              <strong>MediCase</strong>
              <small>INTELLIGENT PATIENT INTAKE</small>
            </span>
          </button>

          <div className="rp-aside-content">
            <p className="rp-eyebrow">A THOUGHTFUL FIRST STEP</p>
            <h1>Your health story deserves <em>to be heard.</em></h1>
            <p>
              Create your patient account to begin organizing your health
              history before a clinical consultation.
            </p>
            <div className="rp-aside-note">
              <span>✳</span>
              Information you share. Structured with care.
            </div>
          </div>

          <p className="rp-aside-footer">
            Designed to support—not replace—clinical judgment.
          </p>
        </aside>

        <section className="rp-form-panel">
          <div className="rp-form-top">
            <button type="button" className="rp-back-button" onClick={onBack}>
              ← Back to home
            </button>
            <p>ALREADY REGISTERED?{" "}
              <button type="button" className="rp-inline-link" onClick={onLogin}>
                Sign in
              </button>
            </p>
          </div>

          <div className="rp-form-heading">
            <p className="rp-eyebrow">PATIENT REGISTRATION</p>
            <h2>Create your <em>account.</em></h2>
            <p>Enter your details below to get started.</p>
          </div>

          <form className="rp-form" onSubmit={handleSubmit}>
            <label className="rp-field">
              <span>Full name <b>*</b></span>
              <input
                name="full_name"
                value={form.full_name}
                onChange={updateField}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </label>

            <label className="rp-field">
              <span>Email address <b>*</b></span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <div className="rp-two-columns">
              <label className="rp-field">
                <span>Age <b>*</b></span>
                <input
                  name="age"
                  type="number"
                  min="0"
                  max="120"
                  value={form.age}
                  onChange={updateField}
                  placeholder="Your age"
                  required
                />
              </label>

              <label className="rp-field">
                <span>Gender <b>*</b></span>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={updateField}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <label className="rp-field">
              <span>Contact number <b>*</b></span>
              <input
                name="contact_number"
                type="tel"
                value={form.contact_number}
                onChange={updateField}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                pattern="\+?\d{10,13}"
                title="Enter 10–13 digits, optionally starting with +"
                required
              />
            </label>

            <div className="rp-two-columns">
              <label className="rp-field">
                <span>Password <b>*</b></span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={128}
                  required
                />
              </label>

              <label className="rp-field">
                <span>Confirm password <b>*</b></span>
                <input
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={updateField}
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={128}
                  required
                />
              </label>
            </div>

            {error && (
              <div className="rp-error" role="alert">{error}</div>
            )}

            <button
              className="rp-primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating your account..." : "Create patient account"}
              {!loading && <span>→</span>}
            </button>

            <p className="rp-privacy-note">
              Your password is sent to your backend over the local development
              connection and should be stored only as a secure hash. Do not use
              real patient information until authentication and production
              security are implemented.
            </p>
          </form>
        </section>
      </section>
    </main>
  );
}
