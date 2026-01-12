const ChatSurvey = ({
  surveyStep,
  setSurveyStep,
  surveyData,
  setSurveyData,
  handleSend,
}) => {
  const handleFinalize = (overriddenData = null) => {
    const data = overriddenData || surveyData;
    const parts = [];
    if (data.people) parts.push(`shopping for ${data.people}`);
    if (data.days) parts.push(`for ${data.days}`);

    const subject = data.people === "1 Person" ? "I" : "we";
    const pronoun = subject === "I" ? "I'm" : "We're";

    const intro =
      parts.length > 0
        ? `${pronoun} ${parts.join(" ")}.`
        : `${pronoun} looking for some recipe ideas.`;
    const dietary = data.dietary.trim()
      ? ` Dietary requirements: ${data.dietary}.`
      : "";

    handleSend(null, `${intro}${dietary} What should ${subject} cook?`);
  };

  if (surveyStep === 0) {
    return (
      <div className="survey-welcome-container">
        <div className="survey-welcome-card">
          <div className="survey-emoji-badge">😋</div>
          <h2 className="survey-title" style={{ fontSize: "32px" }}>
            What we cooking??
          </h2>
          <p style={{ color: "#666", maxWidth: "280px", lineHeight: "1.5" }}>
            Let's plan your perfect meal plan together in just a few steps.
          </p>
          <button
            className="survey-primary-button"
            onClick={() => setSurveyStep(1)}
          >
            Start Planning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-welcome-container">
      <div className="survey-card">
        {/* Progress Bar */}
        <div className="progress-bar-container">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="progress-step"
              style={{
                backgroundColor: s <= surveyStep ? "#008446" : "#f0f0f0",
              }}
            />
          ))}
        </div>

        {surveyStep === 1 && (
          <div className="survey-step-container">
            <h3 className="survey-title">
              How many people are you shopping for?
            </h3>
            <div className="survey-grid">
              {["1 Person", "2 People", "3-4 People", "5+ People"].map(
                (opt) => (
                  <button
                    key={opt}
                    className="survey-button"
                    onClick={() => {
                      setSurveyData({ ...surveyData, people: opt });
                      setSurveyStep(2);
                    }}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
            <button
              className="survey-nav-link survey-skip-link"
              onClick={() => {
                setSurveyData({ ...surveyData, people: "" });
                setSurveyStep(2);
              }}
            >
              Skip this step
            </button>
          </div>
        )}

        {surveyStep === 2 && (
          <div className="survey-step-container">
            <h3 className="survey-title">
              How many days are you planning for?
            </h3>
            <div className="survey-grid">
              {["1-2 Days", "3-4 Days", "Full Week", "Custom"].map((opt) => (
                <button
                  key={opt}
                  className="survey-button"
                  onClick={() => {
                    setSurveyData({ ...surveyData, days: opt });
                    setSurveyStep(3);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="survey-nav-container">
              <button
                className="survey-nav-link"
                onClick={() => setSurveyStep(1)}
              >
                Back
              </button>
              <button
                className="survey-nav-link survey-skip-link"
                onClick={() => {
                  setSurveyData({ ...surveyData, days: "" });
                  setSurveyStep(3);
                }}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {surveyStep === 3 && (
          <div className="survey-step-container">
            <h3 className="survey-title">Any dietary requirements?</h3>
            <p
              style={{
                textAlign: "center",
                color: "#666",
                fontSize: "14px",
                margin: "-10px 0 0 0",
              }}
            >
              E.g. Vegetarian, Gluten-free, or "None"
            </p>
            <textarea
              className="survey-textarea"
              placeholder="Type here..."
              value={surveyData.dietary}
              onChange={(e) =>
                setSurveyData({ ...surveyData, dietary: e.target.value })
              }
            />
            <button
              className="survey-primary-button"
              onClick={() => handleFinalize()}
            >
              Finish & Get Recipes
            </button>
            <div className="survey-nav-container">
              <button
                className="survey-nav-link"
                onClick={() => setSurveyStep(2)}
              >
                Back
              </button>
              <button
                className="survey-nav-link survey-skip-link"
                onClick={() => handleFinalize({ ...surveyData, dietary: "" })}
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSurvey;
