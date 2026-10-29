
import { useEffect, useRef, useState } from "react";
import "./AIChatPage.css";
const API_URL = "http://127.0.0.1:8000/ai/intake-chat";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "mr", label: "मराठी" },
];

const welcomeMessages = {
  en: "Hello! I'm MediCase AI. I'll ask a few questions about your health history to help prepare information for your doctor. What health concern would you like to discuss today?",
  hi: "नमस्ते! मैं MediCase AI हूँ। मैं आपके स्वास्थ्य से जुड़ी कुछ जानकारी पूछूँगा, ताकि डॉक्टर के लिए जानकारी तैयार की जा सके। आज आपको क्या परेशानी हो रही है?",
  mr: "नमस्कार! मी MediCase AI आहे. डॉक्टरांसाठी माहिती तयार करण्यासाठी मी तुमच्या आरोग्याबद्दल काही प्रश्न विचारेन. आज तुम्हाला काय त्रास होत आहे?",
};

const placeholders = {
  en: "Type your answer here...",
  hi: "अपना जवाब यहाँ लिखें...",
  mr: "तुमचे उत्तर येथे लिहा...",
};

export default function AIChatPage({ patientId, onBack, onFinish }) {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    { role: "assistant", content: welcomeMessages.en },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setError("");
    setMessages((current) => {
      const withoutWelcome =
        current.length === 1 &&
        current[0].role === "assistant" &&
        Object.values(welcomeMessages).includes(current[0].content);

      if (withoutWelcome) {
        return [{
          role: "assistant",
          content: welcomeMessages[nextLanguage],
        }];
      }

      return current;
    });
  }

  async function sendMessage(event) {
    event.preventDefault();

    const message = input.trim();
    if (!message || loading) return;

    const history = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    setMessages((current) => [
      ...current,
      { role: "user", content: message },
    ]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          message,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "The AI could not respond. Please try again."
        );
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to MediCase AI. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aic-page">
      <header className="aic-header">
        <button className="aic-brand" type="button" onClick={onBack}>
          <span className="aic-brand-mark">M</span>
          <span>MediCase <span>AI</span></span>
        </button>

        <div className="aic-header-label">
          PATIENT HISTORY INTAKE
        </div>

        <button className="aic-back" type="button" onClick={onBack}>
          ← Back
        </button>
      </header>

      <section className="aic-layout">
        <aside className="aic-sidebar">
          <span className="aic-eyebrow">YOUR HEALTH STORY</span>
          <h1>Let’s understand your story.</h1>
          <p>
            Share your health concerns in your own words. MediCase AI
            will organize your answers to help your doctor review them.
          </p>

          <div className="aic-language-block">
            <label htmlFor="aic-language">Conversation language</label>
            <select
              id="aic-language"
              value={language}
              onChange={(event) => changeLanguage(event.target.value)}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="aic-privacy-note">
            <span aria-hidden="true">✳</span>
            <p>
              Please share only information you are comfortable
              providing. Your answers are for patient history-taking,
              not a diagnosis.
            </p>
          </div>

          {patientId && (
            <p className="aic-patient-ref">
              Patient session connected
            </p>
          )}
        </aside>

        <section className="aic-chat">
          <div className="aic-chat-top">
            <div>
              <h2>Patient conversation</h2>
              <p>Answer in your selected language.</p>
            </div>
            <span className="aic-status">
              <span /> AI INTAKE
            </span>
          </div>

          <div className="aic-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`aic-message-row ${
                  message.role === "user" ? "is-user" : "is-ai"
                }`}
                key={`${index}-${message.role}`}
              >
                {message.role === "assistant" && (
                  <span className="aic-avatar">M</span>
                )}
                <div className="aic-bubble">
                  <span className="aic-message-label">
                    {message.role === "user" ? "YOU" : "MEDICASE AI"}
                  </span>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="aic-message-row is-ai">
                <span className="aic-avatar">M</span>
                <div className="aic-bubble">
                  <span className="aic-message-label">MEDICASE AI</span>
                  <p className="aic-typing">Preparing a response...</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="aic-error" role="alert">
              {error}
            </div>
          )}

          <form className="aic-composer" onSubmit={sendMessage}>
            <label className="aic-input-label" htmlFor="aic-message">
              Your response
            </label>
            <div className="aic-input-row">
              <textarea
                id="aic-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={placeholders[language]}
                rows={2}
                maxLength={3000}
                disabled={loading}
                required
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button type="submit" disabled={loading || !input.trim()}>
                {loading ? "Sending..." : "Send"}
                {!loading && <span aria-hidden="true"> →</span>}
              </button>
            </div>
            <p className="aic-composer-hint">
              Press Enter to send · Shift + Enter for a new line
            </p>
          </form>

          <div className="aic-chat-footer">
            <span>AI-generated responses may contain errors.</span>
            {onFinish && (
              <button type="button" onClick={() => onFinish(messages)}>
                Finish conversation
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
