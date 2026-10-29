
import { useEffect, useState } from "react";
import "./DoctorDashboard.css";
import DoctorCaseDetails from "./DoctorCaseDetails.jsx";

const API_URL = "http://127.0.0.1:8000";

export default function DoctorDashboard({ doctor, token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [statsResponse, casesResponse] = await Promise.all([
          fetch(`${API_URL}/doctor/dashboard`, { headers }),
          fetch(`${API_URL}/doctor/cases`, { headers }),
        ]);

        if (
          statsResponse.status === 401 ||
          casesResponse.status === 401
        ) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        if (!statsResponse.ok || !casesResponse.ok) {
          throw new Error("Could not load doctor dashboard data.");
        }

        const statsData = await statsResponse.json();
        const casesData = await casesResponse.json();

        if (!cancelled) {
          setStats(statsData);
          setCases(
            Array.isArray(casesData.cases) ? casesData.cases : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (token) {
      loadDashboard();
    } else {
      setError("Doctor login is required.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredCases = cases.filter((item) =>
    `${item.patient_name || ""} ${item.case_id || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Show the selected case instead of the dashboard.
  if (selectedCaseId) {
    return (
      <DoctorCaseDetails
        caseId={selectedCaseId}
        token={token}
        onBack={() => setSelectedCaseId(null)}
      />
    );
  }

  return (
    <main className="doctor-page">
      <aside className="doctor-sidebar">
        <div className="doctor-brand">
          <span className="doctor-brand-mark">M</span>
          <span>
            MediCase <b>AI</b>
          </span>
        </div>

        <p className="doctor-nav-label">WORKSPACE</p>

        <div className="doctor-nav-item active">
          ▦ &nbsp; Dashboard
        </div>

        <button
          type="button"
          className="doctor-nav-item"
          onClick={() => {
            setSearch("");
            document
              .querySelector(".doctor-search")
              ?.focus();
          }}
        >
          ♙ &nbsp; Patient cases
        </button>

        <div className="doctor-sidebar-note">
          <strong>Clinical reminder</strong>
          <p>
            AI organizes patient-reported information. Clinical
            decisions remain with the doctor.
          </p>
        </div>

        <button
          type="button"
          className="doctor-logout"
          onClick={onLogout}
        >
          ← Sign out
        </button>
      </aside>

      <section className="doctor-main">
        <header className="doctor-topbar">
          <div>
            <p className="doctor-eyebrow">CLINICAL WORKSPACE</p>
            <h1>Doctor Dashboard</h1>
          </div>

          <div className="doctor-profile">
            <span className="doctor-avatar">
              {(doctor?.name || "D").charAt(0).toUpperCase()}
            </span>

            <div>
              <strong>{doctor?.name || "Doctor"}</strong>
              <small>
                {doctor?.specialization || "Medical professional"}
              </small>
            </div>
          </div>
        </header>

        <section className="doctor-welcome">
          <div>
            <p>MEDICASE AI · CASE REVIEW</p>
            <h2>Welcome, {doctor?.name || "Doctor"}</h2>
            <span>
              Review patient histories before consultations.
            </span>
          </div>

          <span className="doctor-welcome-icon">✚</span>
        </section>

        {error && (
          <p className="doctor-error" role="alert">
            {error}
          </p>
        )}

        <section className="doctor-stats">
          <article className="doctor-stat">
            <span>Total cases</span>
            <strong>{stats?.total_cases ?? "—"}</strong>
          </article>

          <article className="doctor-stat">
            <span>Awaiting review</span>
            <strong>{stats?.pending_cases ?? "—"}</strong>
          </article>

          <article className="doctor-stat">
            <span>Reviewed cases</span>
            <strong>{stats?.reviewed_cases ?? "—"}</strong>
          </article>
        </section>

        <section className="doctor-cases">
          <h2>Patient case records</h2>
          <p>
            Search submitted patient histories by name or case ID.
          </p>

          <input
            className="doctor-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient or case ID..."
            aria-label="Search patient cases"
          />

          {loading ? (
            <p>Loading patient cases...</p>
          ) : filteredCases.length === 0 ? (
            <div className="doctor-empty">
              <span>▤</span>
              <h3>No patient cases found</h3>
              <p>
                Cases will appear here after patient histories have
                been submitted successfully.
              </p>
            </div>
          ) : (
            <div className="doctor-case-list">
              {filteredCases.map((item) => (
                <article
                  className="doctor-case-row"
                  key={item.case_id}
                >
                  <div>
                    <strong>
                      {item.patient_name || "Unnamed patient"}
                    </strong>
                    <small>Case ID: {item.case_id}</small>
                  </div>

                  <span
                    className={`doctor-case-status ${
                      item.status === "reviewed" ? "reviewed" : ""
                    }`}
                  >
                    {item.status || "pending"}
                  </span>

                  <button
                    type="button"
                    disabled={!item.case_id}
                    onClick={() => setSelectedCaseId(item.case_id)}
                  >
                    View case
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="doctor-footer">
          MediCase AI · Confidential patient information
        </footer>
      </section>
    </main>
  );
}
