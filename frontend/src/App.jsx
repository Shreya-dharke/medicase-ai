
import { useState } from "react";

import LandingPage from "./LandingPage.jsx";
import RegisterPage from "./RegisterPage.jsx";
import LoginPage from "./LoginPage.jsx";
import CaseIntakeForm from "./CaseIntakeForm.jsx";
import AIChatPage from "./AIChatPage.jsx";
import DoctorLogin from "./DoctorLogin.jsx";
import DoctorDashboard from "./DoctorDashboard.jsx";

import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");

  // Existing patient state
  const [patientId, setPatientId] = useState("");

  // Doctor authentication state
  const [doctor, setDoctor] = useState(null);
  const [doctorToken, setDoctorToken] = useState("");

  // Patient navigation
  function handlePatientLogin(data) {
    setPatientId(data.patient_id);
    setPage("chat");
  }

  // Doctor navigation
  function handleDoctorLogin(data) {
    setDoctor(data.doctor);
    setDoctorToken(data.access_token);
    setPage("doctor-dashboard");
  }

  function handleDoctorLogout() {
    setDoctor(null);
    setDoctorToken("");
    setPage("home");
  }

  function handleBackHome() {
    setPage("home");
  }

  return (
    <div className="mc-app">
      {/* Landing page */}
      {page === "home" && (
        <LandingPage
          onStart={() => setPage("register")}
          onRegister={() => setPage("register")}
          onLogin={() => setPage("login")}
          onDoctorLogin={() => setPage("doctor-login")}
        />
      )}

      {/* Patient registration */}
      {page === "register" && (
        <RegisterPage
          onBack={handleBackHome}
          onLogin={() => setPage("login")}
        />
      )}

      {/* Patient login */}
      {page === "login" && (
        <LoginPage
          onBack={handleBackHome}
          onRegister={() => setPage("register")}
          onLoginSuccess={handlePatientLogin}
        />
      )}

      {/* Patient AI conversation */}
      {page === "chat" && (
        <AIChatPage
          patientId={patientId}
          onBack={handleBackHome}
        />
      )}

      {/* Existing patient intake form */}
      {page === "intake" && (
        <main className="mc-intake-shell">
          <header className="mc-intake-topbar">
            <button
              className="mc-back-link"
              type="button"
              onClick={handleBackHome}
            >
              ← Back to MediCase
            </button>

            <span className="mc-topbar-note">
              PATIENT INTAKE · PRIVATE SESSION
            </span>
          </header>

          <CaseIntakeForm patientId={patientId} />
        </main>
      )}

      {/* Doctor login */}
      {page === "doctor-login" && (
        <DoctorLogin
          onBack={handleBackHome}
          onLoginSuccess={handleDoctorLogin}
        />
      )}

      {/* Protected doctor dashboard view */}
      {page === "doctor-dashboard" && doctor && doctorToken && (
        <DoctorDashboard
          doctor={doctor}
          token={doctorToken}
          onLogout={handleDoctorLogout}
        />
      )}
    </div>
  );
}
