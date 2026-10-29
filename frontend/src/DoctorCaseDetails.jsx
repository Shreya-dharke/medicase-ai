
import { useEffect, useState } from "react";
import "./DoctorCaseDetails.css";

const API_URL = "http://127.0.0.1:8000";

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    return value.length ? value.map(displayValue).join(", ") : "Not provided";
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key.replaceAll("_", " ")}: ${displayValue(item)}`)
      .join("\n");
  }

  return String(value);
}

function Field({ label, value }) {
  return (
    <div className="case-detail-field">
      <span className="case-detail-label">{label}</span>
      <div className="case-detail-value">{displayValue(value)}</div>
    </div>
  );
}

export default function DoctorCaseDetails({
  caseId,
  token,
  onBack,
}) {
  const [caseData, setCaseData] = useState(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const response = await fetch(
          `${API_URL}/doctor/cases/${encodeURIComponent(caseId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load this case.");
        }

        if (cancelled) return;

        setCaseData(data);
        setStatus(data.status === "reviewed" ? "reviewed" : "pending");

        const review = data.doctor_review;
        const existingNotes =
          typeof review === "string"
            ? review
            : review?.notes || "";

        setNotes(existingNotes);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not connect to the MediCase AI server."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (caseId && token) {
      loadCase();
    } else {
      setError("Case ID or doctor login session is missing.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [caseId, token]);

  async function handleSaveReview(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/doctor/cases/${encodeURIComponent(caseId)}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes, status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Could not save the review.");
      }

      setMessage(data.message || "Review saved successfully.");
      setCaseData((previous) =>
        previous ? { ...previous, status } : previous
      );
    } catch (err) {
      setError(err.message || "Could not save the review.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="doctor-case-page">
        <button className="case-back-button" onClick={onBack} type="button">
          ← Back to cases
        </button>
        <p className="case-loading">Loading patient case…</p>
      </main>
    );
  }

  if (error && !caseData) {
    return (
      <main className="doctor-case-page">
        <button className="case-back-button" onClick={onBack} type="button">
          ← Back to cases
        </button>
        <div className="case-message case-error" role="alert">{error}</div>
      </main>
    );
  }

  const patient = caseData?.patient || {};
  const patientDetails = caseData?.patient_provided || {};
  const summary = caseData?.ai_summary;
  const review = caseData?.doctor_review;

  return (
    <main className="doctor-case-page">
      <header className="case-page-header">
        <button
          className="case-back-button"
          onClick={onBack}
          type="button"
        >
          ← Back to cases
        </button>

        <span className={`case-status ${status}`}>
          {status === "reviewed" ? "Reviewed" : "Pending review"}
        </span>
      </header>

      <section className="case-page-title">
        <p className="case-eyebrow">MEDICASE AI · PATIENT RECORD</p>
        <h1>Patient case details</h1>
        <p>Review the information collected before the consultation.</p>
      </section>

      {error && (
        <div className="case-message case-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="case-message case-success" role="status">
          {message}
        </div>
      )}

      <section className="case-detail-panel">
        <div className="case-panel-heading">
          <div>
            <p className="case-eyebrow">PATIENT INFORMATION</p>
            <h2>{patient.name || caseData?.patient_name || "Patient"}</h2>
          </div>
          <span className="case-id">
            Case ID: {caseData?.case_id || caseId}
          </span>
        </div>

        <div className="case-detail-grid">
          <Field label="Email" value={patient.email || caseData?.patient_email} />
          <Field label="Age" value={patient.age} />
          <Field label="Gender" value={patient.gender} />
          <Field label="Phone" value={patient.phone || patient.phone_number} />
          <Field label="Case created" value={formatDate(caseData?.created_at)} />
          <Field label="Language" value={caseData?.language} />
          <Field label="Intake source" value={caseData?.source} />
        </div>
      </section>

      <section className="case-detail-panel">
        <div className="case-panel-heading">
          <div>
            <p className="case-eyebrow">PATIENT HISTORY</p>
            <h2>Reported information</h2>
          </div>
        </div>

        {Object.keys(patientDetails).length > 0 ? (
          <div className="case-detail-grid">
            {Object.entries(patientDetails).map(([key, value]) => (
              <Field
                key={key}
                label={key.replaceAll("_", " ")}
                value={value}
              />
            ))}
          </div>
        ) : (
          <p className="case-empty">
            No patient history has been recorded for this case yet.
          </p>
        )}
      </section>

      <section className="case-detail-panel">
        <div className="case-panel-heading">
          <div>
            <p className="case-eyebrow">AI-GENERATED INFORMATION</p>
            <h2>Case summary</h2>
          </div>
        </div>

        {summary ? (
          <div className="case-summary-text">
            {typeof summary === "string"
              ? summary
              : Object.entries(summary).map(([key, value]) => (
                  <div className="case-summary-item" key={key}>
                    <strong>{key.replaceAll("_", " ")}</strong>
                    <p>{displayValue(value)}</p>
                  </div>
                ))}
          </div>
        ) : (
          <p className="case-empty">
            An AI-generated summary is not available for this case yet.
          </p>
        )}

        <p className="case-disclaimer">
          This summary organizes reported information. It is not a diagnosis
          or a treatment recommendation.
        </p>
      </section>

      <section className="case-detail-panel">
        <div className="case-panel-heading">
          <div>
            <p className="case-eyebrow">DOCTOR WORKSPACE</p>
            <h2>Clinical review</h2>
          </div>
        </div>

        {review?.doctor_name && (
          <p className="case-existing-review">
            Last reviewed by: {review.doctor_name}
            {review.reviewed_at
              ? ` · ${formatDate(review.reviewed_at)}`
              : ""}
          </p>
        )}

        <form onSubmit={handleSaveReview}>
          <label className="case-form-label" htmlFor="doctor-review-notes">
            Doctor's notes
          </label>
          <textarea
            id="doctor-review-notes"
            className="case-review-textarea"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={5000}
            rows={6}
            placeholder="Add your review notes here…"
          />

          <div className="case-review-footer">
            <label className="case-form-label" htmlFor="doctor-review-status">
              Review status
            </label>
            <select
              id="doctor-review-status"
              className="case-review-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="pending">Pending review</option>
              <option value="reviewed">Reviewed</option>
            </select>

            <button
              className="case-save-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save review"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
