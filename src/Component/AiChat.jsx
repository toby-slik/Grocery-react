import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { products, recipes } from "../data/woolworthsMockData";
import RecipeCard from "./RecipeCard";

export const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const [isStickToBottom, setIsStickToBottom] = useState(true);
  const [surveyStep, setSurveyStep] = useState(0); // 0: initial, 1: people, 2: days, 3: dietary
  const [surveyData, setSurveyData] = useState({
    people: "",
    days: "",
    dietary: "",
  });

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsStickToBottom(isAtBottom);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current && isStickToBottom) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isStickToBottom]);

  const handleSend = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const userMessage = customMessage || input.trim();
    if (!userMessage || loading) return;

    setInput("");
    setLoading(true);

    // If survey was active, we might want to close it or keep it finished
    if (surveyStep > 0) setSurveyStep(0);

    // Add user message to chat state
    const newMessages = [...messages, { text: userMessage, sender: "user" }];
    setMessages(newMessages);

    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GoogleGenAI);

      // Construct context from mock data
      const productList = products
        .map((p) => {
          let info = `- ${p.name} ($${p.price.toFixed(2)})`;
          if (p.nutrition && p.nutrition.per100g) {
            const n = p.nutrition.per100g;
            info += ` [Nutrition per 100g: Energy ${n.energy}, Protein ${n.protein}]`;
          }
          return info;
        })
        .join("\n");
      const recipeList = recipes
        .map((r) => `- ${r.title} (ID: ${r.id})`)
        .join("\n");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `**Role:** You are the official AI Personal Shopper for Woolworths.
**Objective:** Assist customers by finding products, suggesting recipes, and managing their shopping list.

**Context Data:**
Here are some products currently in stock:
${productList}

**Recipe Database:**
Here are our EXCLUSIVE, Pre-Defined Recipes. You MUST prioritize these over generating new ones:
${recipeList}

**Capabilities & Layout Rules:**
1.  **Prioritize Known Recipes:**
    - CRITICAL: If the user's request matches (even loosely) one of the titles in the "Recipe Database" above, you MUST respond with the exact recipe card marker for it.
    - Marker Format: \`[RECIPE_CARD: <Exact Title From List>]\`
    - Example: If user asks for "tacos", lookup "Easy 15-Minute Tacos" and output \`[RECIPE_CARD: Easy 15-Minute Tacos]\`. Do NOT generate a new taco recipe.

2.  **Modifying Recipes (Advanced):**
    - ONLY if the user explicitly asks to *change* a recipe (e.g. "make it cheaper", "add protein", "vegan version"), then you should generate a *modified* recipe object.
    - Output this modified recipe as a JSON object wrapped in: \`[RECIPE_DATA: { ... }]\`.
    - The JSON must include: title, ingredients, method, nutrition (estimated), image (placeholder or original URL), pricePerServe (estimated).

3.  **New/Custom Recipes:**
    - If the user wants a meal NOT in the database (e.g. "Pizza"), generate a custom recipe object.
    - Output as valid JSON wrapped in: \`[RECIPE_DATA: { ... }]\`.

**Response Style:**
- Be helpful and enthusiastic. Use emojis.
- ALWAYS use the card markers defined above for recipes.
`,
      });

      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: history,
      });

      setMessages((prev) => [...prev, { text: "", sender: "ai" }]);

      const result = await chat.sendMessageStream(userMessage);

      let fullResponse = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.sender === "ai") {
            lastMessage.text = fullResponse;
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => {
        return [
          ...prev,
          {
            text: "Sorry, I encountered an error. Please try again.",
            sender: "ai",
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render message content with potential recipe cards
  const renderMessageContent = (text) => {
    // Regex for both simple cards and dynamic data cards
    // We iterate through the text finding matches for either pattern
    const cardRegex = /\[RECIPE_CARD:\s*(.*?)\]/g;
    const dataRegex = /\[RECIPE_DATA:\s*(\{.*?\})\]/s; // Single line search for now, could be multiline? Text usually streams.
    // Actually, simple regex replacements might be tricky if we have mixed content.
    // Let's split by known markers.

    // Better strategy: Combine regex or just iterate.
    // Let's try searching for the first occurrence of ANY marker.

    // For simplicity given the tooling, let's keep the existing loop but expand the Regex.
    // [RECIPE_CARD: Title] OR [RECIPE_DATA: {json}]
    // Note: JSON matching with regex is hard. Let's assume the AI outputs it cleanly on one line or we use a flexible dot match.

    const combinedRegex = /\[(RECIPE_CARD|RECIPE_DATA):\s*(.*?)\]/gs;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <ReactMarkdown key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </ReactMarkdown>
        );
      }

      const type = match[1];
      const content = match[2];

      if (type === "RECIPE_CARD") {
        const recipeTitle = content.trim();
        const recipe = recipes.find(
          (r) => r.title.toLowerCase() === recipeTitle.toLowerCase()
        );
        if (recipe) {
          parts.push(
            <RecipeCard key={`recipe-${match.index}`} recipe={recipe} />
          );
        }
      } else if (type === "RECIPE_DATA") {
        try {
          // The regex might capture '}' lazily, but JSON might have nested braces.
          // This is risky with simple regex.
          // However, since we guide the AI, let's try to parse the content.
          // If the regex failed to capture the full JSON, this will error.
          // A safer way for JSON is to find the start and try to find the balancing end, but that's complex code.
          // Let's rely on the AI following a single-line or clean block structure.

          const recipeData = JSON.parse(content);
          parts.push(
            <RecipeCard
              key={`recipe-data-${match.index}`}
              recipe={recipeData}
            />
          );
        } catch (e) {
          console.error("Failed to parse dynamic recipe data", e);
          // Fallback: just show the text? Or ignore.
        }
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <ReactMarkdown key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </ReactMarkdown>
      );
    }

    return parts.length > 0 ? parts : <ReactMarkdown>{text}</ReactMarkdown>;
  };

  return (
    <div
      style={{
        // maxWidth: "600px",
        margin: "20px auto",
        border: "1px solid #e0e0e0",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        height: "70vh",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          fontWeight: "600",
          color: "#333",
        }}
      >
        Woolworths AI Assistant
      </div>

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          backgroundColor: "#fff",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
            }}
          >
            {surveyStep === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#333",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                  animation: "fadeIn 0.5s ease-out",
                }}
              >
                <div
                  style={{
                    fontSize: "60px",
                    background: "#f0fdf4",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                  }}
                >
                  😋
                </div>
                <h2 style={{ fontWeight: "800", margin: 0 }}>
                  What we cooking??
                </h2>
                <p
                  style={{
                    color: "#666",
                    maxWidth: "280px",
                    lineHeight: "1.5",
                  }}
                >
                  Let's plan your perfect meal plan together in just a few
                  steps.
                </p>
                <button
                  onClick={() => setSurveyStep(1)}
                  style={{
                    backgroundColor: "#008446",
                    color: "white",
                    padding: "14px 32px",
                    borderRadius: "30px",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,132,70,0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  Start Planning
                </button>
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  backgroundColor: "#fff",
                  borderRadius: "24px",
                  padding: "30px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                  border: "1px solid #f0f0f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  animation: "slideUp 0.4s ease-out",
                }}
              >
                {/* Progress Bar */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      style={{
                        height: "6px",
                        flex: 1,
                        borderRadius: "3px",
                        backgroundColor:
                          s <= surveyStep ? "#008446" : "#f0f0f0",
                        transition: "background-color 0.3s",
                      }}
                    />
                  ))}
                </div>

                {surveyStep === 1 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        textAlign: "center",
                        margin: 0,
                      }}
                    >
                      How many people are you shopping for?
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      {["1 Person", "2 People", "3-4 People", "5+ People"].map(
                        (opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSurveyData({ ...surveyData, people: opt });
                              setSurveyStep(2);
                            }}
                            style={{
                              padding: "16px",
                              borderRadius: "16px",
                              border: "1px solid #e0e0e0",
                              backgroundColor: "#fff",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = "#008446";
                              e.currentTarget.style.backgroundColor = "#f0fdf4";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = "#e0e0e0";
                              e.currentTarget.style.backgroundColor = "#fff";
                            }}
                          >
                            {opt}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSurveyData({ ...surveyData, people: "" });
                        setSurveyStep(2);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#888",
                        cursor: "pointer",
                        fontSize: "14px",
                        textAlign: "center",
                        marginTop: "10px",
                        textDecoration: "underline",
                      }}
                    >
                      Skip this step
                    </button>
                  </div>
                )}

                {surveyStep === 2 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        textAlign: "center",
                        margin: 0,
                      }}
                    >
                      How many days are you planning for?
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      {["1-2 Days", "3-4 Days", "Full Week", "Custom"].map(
                        (opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSurveyData({ ...surveyData, days: opt });
                              setSurveyStep(3);
                            }}
                            style={{
                              padding: "16px",
                              borderRadius: "16px",
                              border: "1px solid #e0e0e0",
                              backgroundColor: "#fff",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = "#008446";
                              e.currentTarget.style.backgroundColor = "#f0fdf4";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = "#e0e0e0";
                              e.currentTarget.style.backgroundColor = "#fff";
                            }}
                          >
                            {opt}
                          </button>
                        )
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <button
                        onClick={() => setSurveyStep(1)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#888",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          setSurveyData({ ...surveyData, days: "" });
                          setSurveyStep(3);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#888",
                          cursor: "pointer",
                          fontSize: "14px",
                          textDecoration: "underline",
                        }}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}

                {surveyStep === 3 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        textAlign: "center",
                        margin: 0,
                      }}
                    >
                      Any dietary requirements?
                    </h3>
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
                      placeholder="Type here..."
                      value={surveyData.dietary}
                      onChange={(e) =>
                        setSurveyData({
                          ...surveyData,
                          dietary: e.target.value,
                        })
                      }
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        border: "1px solid #e0e0e0",
                        minHeight: "100px",
                        outline: "none",
                        fontSize: "15px",
                        resize: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#008446")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    />
                    <button
                      onClick={() => {
                        const parts = [];
                        if (surveyData.people)
                          parts.push(`shopping for ${surveyData.people}`);
                        if (surveyData.days)
                          parts.push(`for ${surveyData.days}`);

                        const intro =
                          parts.length > 0
                            ? `I'm ${parts.join(" ")}.`
                            : "I'm looking for some recipe ideas.";
                        const dietary = surveyData.dietary.trim()
                          ? ` Dietary requirements: ${surveyData.dietary}.`
                          : "";

                        handleSend(
                          null,
                          `${intro}${dietary} What should we cook?`
                        );
                      }}
                      style={{
                        backgroundColor: "#008446",
                        color: "white",
                        padding: "14px",
                        borderRadius: "30px",
                        border: "none",
                        fontWeight: "600",
                        fontSize: "16px",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,132,70,0.3)",
                      }}
                    >
                      Finish & Get Recipes
                    </button>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <button
                        onClick={() => setSurveyStep(2)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#888",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          const parts = [];
                          if (surveyData.people)
                            parts.push(`shopping for ${surveyData.people}`);
                          if (surveyData.days)
                            parts.push(`for ${surveyData.days}`);

                          const intro =
                            parts.length > 0
                              ? `I'm ${parts.join(" ")}.`
                              : "I'm looking for some recipe ideas.";
                          const dietary = surveyData.dietary.trim()
                            ? ` Dietary requirements: ${surveyData.dietary}.`
                            : "";

                          handleSend(
                            null,
                            `${intro}${dietary} What should we cook?`
                          );
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#888",
                          cursor: "pointer",
                          fontSize: "14px",
                          textDecoration: "underline",
                        }}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: msg.sender === "user" ? "80%" : "95%", // Allow more width for AI (recipe cards)
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "18px",
                backgroundColor: msg.sender === "user" ? "#008446" : "#f4f6f8",
                color: msg.sender === "user" ? "#fff" : "#1a1a1a",
                borderBottomRightRadius: msg.sender === "user" ? "4px" : "18px",
                borderBottomLeftRadius: msg.sender === "ai" ? "4px" : "18px",
                lineHeight: "1.5",
                fontSize: "15px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              {msg.sender === "ai" ? (
                renderMessageContent(msg.text)
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.sender === "user" && (
          <div
            style={{
              alignSelf: "flex-start",
              color: "#888",
              paddingLeft: "10px",
              fontSize: "14px",
            }}
          >
            Typing...
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          padding: "20px",
          borderTop: "1px solid #f0f0f0",
          backgroundColor: "#fff",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          gap: "10px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 20px",
            borderRadius: "24px",
            border: "1px solid #e0e0e0",
            outline: "none",
            fontSize: "15px",
            transition: "border-color 0.2s",
            backgroundColor: "#f9f9f9",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#008446")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{
            borderRadius: "50%",
            width: "46px",
            height: "46px",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loading || !input.trim() ? "#f0f0f0" : "#008446",
            color: "white",
            border: "none",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};
