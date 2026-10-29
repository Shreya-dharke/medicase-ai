
import { useState } from "react";

import "./CaseIntakeForm.css";

const API_URL = "http://127.0.0.1:8000";

const initialForm = {
  patient_id: "",
  symptoms: {
    main_complaint: "",
    description: "",
    onset: "",
    duration: "",
    frequency: "",
    severity: "",
    better_or_worse_with: "",
    associated_symptoms: "",
  },
  past_medical_history: {
    no_known_history: false,
    conditions: "",
    previous_illnesses: "",
    surgeries: "",
    hospitalizations: "",
    other: "",
  },
  current_medications: {
    none_reported: false,
    items: [],
  },
  allergies: {
    no_known_allergies: false,
    items: [],
  },
  previous_treatments: {
    items: [],
  },
  additional_notes: "",
};

function SectionHeading({ number, title, description }) {
  return (
    <div className="ci-section-heading">
      <span className="ci-section-number">{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "text",
  min,
  max,
}) {
  return (
    <label className="ci-field">
      <span>
        {label}
        {required && <b className="ci-required"> *</b>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <label className="ci-field">
      <span>
        {label}
        {required && <b className="ci-required"> *</b>}
      </span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={3}
      />
    </label>
  );
}

export default function CaseIntakeForm({ patientId }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function updateTopLevel(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateSection(section, field, value) {
    setForm((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  }

  function addItem(section, item) {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        items: [...current[section].items, item],
      },
    }));
  }

  function updateItem(section, index, field, value) {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        items: current[section].items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  }

  function removeItem(section, index) {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        items: current[section].items.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    setResult(null);

    const payload = {
      ...form,
      symptoms: {
        ...form.symptoms,
        severity:
          form.symptoms.severity === ""
            ? null
            : Number(form.symptoms.severity),
      },
    };

    try {
      const response = await fetch(`${API_URL}/case-intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data.detail;
        throw new Error(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((item) => item.msg).join(", ")
              : "Unable to submit the case."
        );
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the backend. Check that FastAPI is running at http://127.0.0.1:8000."
          : err.message
      );
      setStatus("error");
    }
  }

  if (status === "success" && result) {
    return (
      <div className="ci-page">
        <section className="ci-success">
          <div className="ci-success-mark">✓</div>
          <p className="ci-kicker">SUBMISSION COMPLETE</p>
          <h1>Your health story has been recorded.</h1>
          <p>
            The information you provided has been submitted for clinical
            review. This confirmation does not represent a diagnosis.
          </p>
          <div className="ci-result-details">
            <span>Case reference</span>
            <strong>{result.case_id}</strong>
            <span>Submission status</span>
            <strong>{result.status}</strong>
          </div>
          <button
            className="ci-primary-button"
            type="button"
            onClick={() => {
              setForm(initialForm);
              setResult(null);
              setStatus("idle");
            }}
          >
            Start another intake
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="ci-page">
      <div className="ci-intro">
        <p className="ci-kicker">PATIENT HISTORY · INTAKE</p>
        <h1>Let’s start with <em>your story.</em></h1>
        <p>
          Share what you have been experiencing. Your answers will be
          organized into a patient history for your healthcare professional.
        </p>
        <div className="ci-progress">
          <span>YOUR HEALTH HISTORY</span>
          <span>5 SECTIONS</span>
        </div>
        <div className="ci-progress-track">
          <span />
        </div>
      </div>

      <form className="ci-form" onSubmit={handleSubmit}>
        <section className="ci-card">
          <SectionHeading
            number="01"
            title="Patient reference"
            description="Enter the ID of a patient already registered in this demo system."
          />
          <TextField
            label="Patient ID"
            value={form.patient_id}
            onChange={(event) =>
              updateTopLevel("patient_id", event.target.value.trim())
            }
            placeholder="Paste the registered patient's ID"
            required
          />
          <p className="ci-help">
            For development use only. This must be an existing MongoDB patient
            ID; this form does not verify your identity.
          </p>
        </section>

        <section className="ci-card">
          <SectionHeading
            number="02"
            title="What brings you here?"
            description="Tell us about the main concern you would like to discuss."
          />
          <TextField
            label="Main concern"
            value={form.symptoms.main_complaint}
            onChange={(event) =>
              updateSection("symptoms", "main_complaint", event.target.value)
            }
            placeholder="Describe your main concern"
            required
          />
          <TextArea
            label="Describe what you have experienced"
            value={form.symptoms.description}
            onChange={(event) =>
              updateSection("symptoms", "description", event.target.value)
            }
            placeholder="Explain in your own words..."
          />
          <div className="ci-grid-two">
            <TextField
              label="When did it begin?"
              value={form.symptoms.onset}
              onChange={(event) =>
                updateSection("symptoms", "onset", event.target.value)
              }
              placeholder="e.g. Last Monday"
            />
            <TextField
              label="How long has it lasted?"
              value={form.symptoms.duration}
              onChange={(event) =>
                updateSection("symptoms", "duration", event.target.value)
              }
              placeholder="e.g. Three days"
            />
            <TextField
              label="How often does it occur?"
              value={form.symptoms.frequency}
              onChange={(event) =>
                updateSection("symptoms", "frequency", event.target.value)
              }
              placeholder="e.g. Every evening"
            />
            <label className="ci-field">
              <span>Severity (1–10)</span>
              <select
                value={form.symptoms.severity}
                onChange={(event) =>
                  updateSection("symptoms", "severity", event.target.value)
                }
              >
                <option value="">Not specified</option>
                {Array.from({ length: 10 }, (_, index) => index + 1).map(
                  (number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? "— Mild" : number === 10 ? "— Most severe" : ""}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
          <TextArea
            label="What makes it better or worse?"
            value={form.symptoms.better_or_worse_with}
            onChange={(event) =>
              updateSection(
                "symptoms",
                "better_or_worse_with",
                event.target.value
              )
            }
            placeholder="Activities, rest, time of day, or other factors..."
          />
          <TextArea
            label="Other symptoms you have noticed"
            value={form.symptoms.associated_symptoms}
            onChange={(event) =>
              updateSection(
                "symptoms",
                "associated_symptoms",
                event.target.value
              )
            }
            placeholder="Mention any other symptoms..."
          />
        </section>

        <section className="ci-card">
          <SectionHeading
            number="03"
            title="Medical background"
            description="Include relevant previous or ongoing medical history."
          />
          <label className="ci-checkbox">
            <input
              type="checkbox"
              checked={form.past_medical_history.no_known_history}
              onChange={(event) => {
                const checked = event.target.checked;
                setForm((current) => ({
                  ...current,
                  past_medical_history: {
                    ...initialForm.past_medical_history,
                    no_known_history: checked,
                  },
                }));
              }}
            />
            <span>I have no known medical history to report.</span>
          </label>
          {!form.past_medical_history.no_known_history && (
            <>
              <TextArea
                label="Existing medical conditions"
                value={form.past_medical_history.conditions}
                onChange={(event) =>
                  updateSection(
                    "past_medical_history",
                    "conditions",
                    event.target.value
                  )
                }
                placeholder="Conditions diagnosed by a healthcare professional..."
              />
              <TextArea
                label="Previous illnesses"
                value={form.past_medical_history.previous_illnesses}
                onChange={(event) =>
                  updateSection(
                    "past_medical_history",
                    "previous_illnesses",
                    event.target.value
                  )
                }
                placeholder="Relevant past illnesses..."
              />
              <div className="ci-grid-two">
                <TextField
                  label="Previous surgeries"
                  value={form.past_medical_history.surgeries}
                  onChange={(event) =>
                    updateSection(
                      "past_medical_history",
                      "surgeries",
                      event.target.value
                    )
                  }
                  placeholder="If any"
                />
                <TextField
                  label="Hospitalizations"
                  value={form.past_medical_history.hospitalizations}
                  onChange={(event) =>
                    updateSection(
                      "past_medical_history",
                      "hospitalizations",
                      event.target.value
                    )
                  }
                  placeholder="If any"
                />
              </div>
              <TextArea
                label="Other relevant history"
                value={form.past_medical_history.other}
                onChange={(event) =>
                  updateSection(
                    "past_medical_history",
                    "other",
                    event.target.value
                  )
                }
                placeholder="Anything else you would like to share..."
              />
            </>
          )}
        </section>

        <section className="ci-card">
          <SectionHeading
            number="04"
            title="Medications and allergies"
            description="Report what you currently take and any known allergies."
          />
          <label className="ci-checkbox">
            <input
              type="checkbox"
              checked={form.current_medications.none_reported}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  current_medications: {
                    none_reported: event.target.checked,
                    items: [],
                  },
                }))
              }
            />
            <span>I am not currently taking any medications.</span>
          </label>

          {!form.current_medications.none_reported && (
            <div className="ci-item-group">
              <h3>Current medications</h3>
              {form.current_medications.items.map((item, index) => (
                <div className="ci-item-card" key={`med-${index}`}>
                  <TextField
                    label="Medication name"
                    value={item.name}
                    onChange={(event) =>
                      updateItem(
                        "current_medications",
                        index,
                        "name",
                        event.target.value
                      )
                    }
                    required
                  />
                  <div className="ci-grid-two">
                    <TextField
                      label="Dosage"
                      value={item.dosage_reported}
                      onChange={(event) =>
                        updateItem(
                          "current_medications",
                          index,
                          "dosage_reported",
                          event.target.value
                        )
                      }
                      placeholder="As reported"
                    />
                    <TextField
                      label="Frequency"
                      value={item.frequency_reported}
                      onChange={(event) =>
                        updateItem(
                          "current_medications",
                          index,
                          "frequency_reported",
                          event.target.value
                        )
                      }
                      placeholder="As reported"
                    />
                  </div>
                  <TextField
                    label="Reason for taking"
                    value={item.reason}
                    onChange={(event) =>
                      updateItem(
                        "current_medications",
                        index,
                        "reason",
                        event.target.value
                      )
                    }
                  />
                  <button
                    type="button"
                    className="ci-remove-button"
                    onClick={() => removeItem("current_medications", index)}
                  >
                    Remove medication
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ci-add-button"
                onClick={() =>
                  addItem("current_medications", {
                    name: "",
                    dosage_reported: "",
                    frequency_reported: "",
                    reason: "",
                  })
                }
                disabled={form.current_medications.items.length >= 20}
              >
                + Add medication
              </button>
            </div>
          )}

          <div className="ci-divider" />

          <label className="ci-checkbox">
            <input
              type="checkbox"
              checked={form.allergies.no_known_allergies}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  allergies: {
                    no_known_allergies: event.target.checked,
                    items: [],
                  },
                }))
              }
            />
            <span>I have no known allergies.</span>
          </label>

          {!form.allergies.no_known_allergies && (
            <div className="ci-item-group">
              <h3>Known allergies</h3>
              {form.allergies.items.map((item, index) => (
                <div className="ci-item-card" key={`allergy-${index}`}>
                  <TextField
                    label="Allergen or substance"
                    value={item.substance}
                    onChange={(event) =>
                      updateItem(
                        "allergies",
                        index,
                        "substance",
                        event.target.value
                      )
                    }
                    required
                  />
                  <TextField
                    label="Reported reaction"
                    value={item.reaction_reported}
                    onChange={(event) =>
                      updateItem(
                        "allergies",
                        index,
                        "reaction_reported",
                        event.target.value
                      )
                    }
                    placeholder="If known"
                  />
                  <TextArea
                    label="Additional details"
                    value={item.details}
                    onChange={(event) =>
                      updateItem("allergies", index, "details", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="ci-remove-button"
                    onClick={() => removeItem("allergies", index)}
                  >
                    Remove allergy
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ci-add-button"
                onClick={() =>
                  addItem("allergies", {
                    substance: "",
                    reaction_reported: "",
                    details: "",
                  })
                }
                disabled={form.allergies.items.length >= 20}
              >
                + Add allergy
              </button>
            </div>
          )}
        </section>

        <section className="ci-card">
          <SectionHeading
            number="05"
            title="Previous treatments and notes"
            description="Share previous treatments and any additional context."
          />
          <div className="ci-item-group">
            <h3>Previous treatments</h3>
            {form.previous_treatments.items.map((item, index) => (
              <div className="ci-item-card" key={`treatment-${index}`}>
                <TextField
                  label="Treatment"
                  value={item.treatment}
                  onChange={(event) =>
                    updateItem(
                      "previous_treatments",
                      index,
                      "treatment",
                      event.target.value
                    )
                  }
                  placeholder="Treatment or therapy"
                  required
                />
                <TextArea
                  label="Details"
                  value={item.details}
                  onChange={(event) =>
                    updateItem(
                      "previous_treatments",
                      index,
                      "details",
                      event.target.value
                    )
                  }
                />
                <TextField
                  label="Approximate date"
                  value={item.approximate_date}
                  onChange={(event) =>
                    updateItem(
                      "previous_treatments",
                      index,
                      "approximate_date",
                      event.target.value
                    )
                  }
                  placeholder="If remembered"
                />
                <TextArea
                  label="Reported response"
                  value={item.reported_response}
                  onChange={(event) =>
                    updateItem(
                      "previous_treatments",
                      index,
                      "reported_response",
                      event.target.value
                    )
                  }
                  placeholder="How it affected you, if known"
                />
                <button
                  type="button"
                  className="ci-remove-button"
                  onClick={() => removeItem("previous_treatments", index)}
                >
                  Remove treatment
                </button>
              </div>
            ))}
            <button
              type="button"
              className="ci-add-button"
              onClick={() =>
                addItem("previous_treatments", {
                  treatment: "",
                  details: "",
                  approximate_date: "",
                  reported_response: "",
                })
              }
              disabled={form.previous_treatments.items.length >= 20}
            >
              + Add previous treatment
            </button>
          </div>

          <TextArea
            label="Anything else your clinician should know?"
            value={form.additional_notes}
            onChange={(event) =>
              updateTopLevel("additional_notes", event.target.value)
            }
            placeholder="Additional context you would like to include..."
          />
        </section>

        {error && (
          <div className="ci-error" role="alert">
            <strong>We couldn't submit your case.</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="ci-submit-area">
          <p>
            Please review your answers before submitting. This form records
            information you report; it does not provide a diagnosis.
          </p>
          <button
            className="ci-primary-button"
            type="submit"
            disabled={status === "submitting"}
          >
            {status === "submitting"
              ? "Submitting your case..."
              : "Submit patient history"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
