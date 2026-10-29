
import "./LandingPage.css";

export default function LandingPage({
  onStart,
  onRegister,
  onLogin,
  onDoctorLogin,
}) {
  return (
    <main className="landing">
      <nav className="navbar">
        <a
          className="brand"
          href="#"
          aria-label="MediCase AI home"
          onClick={(event) => event.preventDefault()}
        >
          <span className="brand-mark">M</span>
          <span>
            <strong>MediCase</strong>
            <small>INTELLIGENT PATIENT INTAKE</small>
          </span>
        </a>

        <div className="nav-links">
          <a href="#approach">Our approach</a>
          <a href="#process">How it works</a>
        </div>

        <div className="nav-actions">
          <button
            className="doctor-nav-cta"
            type="button"
            onClick={onDoctorLogin}
          >
            Doctor Login <span aria-hidden="true">↗</span>
          </button>

          <button
            className="nav-cta"
            type="button"
            onClick={onStart}
          >
            Begin intake <span aria-hidden="true">↗</span>
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            A clearer start to every consultation
          </div>

          <h1>
            Every patient
            <br />
            has a story.
            <br />
            <span>Let’s understand it.</span>
          </h1>

          <p className="hero-description">
            A thoughtful, structured way to share your health history
            before meeting your doctor. Your experience, organized
            into information that matters.
          </p>

          <div className="hero-actions">
            <button className="primary-cta" onClick={onStart}>
              Start your health story <span aria-hidden="true">→</span>
            </button>

            <a className="secondary-cta" href="#process">
              Discover how it works
            </a>
          </div>

          <div className="trust-note">
            <span aria-hidden="true">✳</span>
            Your story, clearly organized. Your care, guided by your clinician.
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="Illustration of an organized patient case"
        >
          <div className="visual-topline">
            <span>THE PATIENT PICTURE</span>
            <span className="visual-indicator">
              ● PRE-CONSULTATION
            </span>
          </div>

          <div className="document-card">
            <div className="document-heading">
              <div>
                <span className="document-kicker">PATIENT RECORD</span>
                <h2>A more complete picture.</h2>
              </div>
              <div className="document-icon" aria-hidden="true">
                ✳
              </div>
            </div>

            <div className="record-row">
              <span className="record-number">01</span>
              <div className="record-content">
                <strong>Presenting concern</strong>
                <span>The reason for today’s visit</span>
              </div>
              <span className="record-check">✓</span>
            </div>

            <div className="record-row">
              <span className="record-number">02</span>
              <div className="record-content">
                <strong>Symptom history</strong>
                <span>Onset, duration and experience</span>
              </div>
              <span className="record-check">✓</span>
            </div>

            <div className="record-row">
              <span className="record-number">03</span>
              <div className="record-content">
                <strong>Medical background</strong>
                <span>Conditions, medication and allergies</span>
              </div>
              <span className="record-check">✓</span>
            </div>

            <div className="record-footer">
              <span className="footer-symbol">M</span>
              <span>
                Structured information. No automated diagnosis.
              </span>
            </div>
          </div>

          <div className="visual-caption">
            <span className="caption-line" />
            BETTER CONTEXT. MORE MEANINGFUL CONVERSATIONS.
          </div>
        </div>
      </section>

      <section className="principle-strip" id="approach">
        <div>
          <span className="principle-number">01 / LISTEN</span>
          <strong>Start with your experience</strong>
          <p>Describe your concerns in your own words.</p>
        </div>

        <div>
          <span className="principle-number">02 / ORGANIZE</span>
          <strong>Bring the details together</strong>
          <p>Turn your answers into a structured case history.</p>
        </div>

        <div>
          <span className="principle-number">03 / PREPARE</span>
          <strong>Help your doctor prepare</strong>
          <p>Present your history for clinical review.</p>
        </div>
      </section>

      <section className="process-section" id="process">
        <div>
          <span className="section-label">
            A MORE THOUGHTFUL PROCESS
          </span>
          <h2>
            Less time recalling.
            <br />
            More time understanding.
          </h2>
        </div>

        <div className="process-copy">
          <p>
            MediCase AI guides patients through relevant questions and
            organizes the information they provide into a clear case
            summary for the healthcare professional.
          </p>

          <button className="text-cta" onClick={onStart}>
            Prepare your case <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <footer className="site-footer">
        <a
          className="footer-brand"
          href="#"
          onClick={(event) => event.preventDefault()}
        >
          <span className="brand-mark">M</span>
          <strong>MediCase AI</strong>
        </a>

        <span>
          Patient-reported information, organized with care.
        </span>

        <span>
          Designed to support—not replace—clinical judgment.
        </span>

        <button
          type="button"
          className="doctor-footer-link"
          onClick={onDoctorLogin}
        >
          Healthcare professional? Doctor Login →
        </button>
      </footer>
    </main>
  );
}
