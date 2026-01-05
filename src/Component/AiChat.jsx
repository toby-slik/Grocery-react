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

  /* State to track if the user wants to stick to the bottom */
  const [isStickToBottom, setIsStickToBottom] = useState(true);

  // We need to keep a reference to the chat session or recreate it with history
  // For simplicity and to ensure history is synced with state, we'll recreate headers/history each time or use a ref for the chat object if we wanted,
  // but mapping state to history is robust.

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      // If the user is within 50px of the bottom, we consider them "at the bottom" so we stick
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

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
        systemInstruction: `**Role:** You are the official AI Personal Shopper for Woolworths. You are a culinary expert, a budget-conscious strategist, and a friendly guide all rolled into one. 

**Context Data:**
Here are some products currently in stock:
${productList}

Here are some recipes you know:
${recipeList}

**Core Directives:**
1. **Culinary Inspiration:** If a user mentions an ingredient, suggest a complementary item or a quick meal idea.
2. **Wayfinding:** Direct users to specific aisles or departments.
3. **Budget Consciousness:** Highlight Store Brand (Private Label) alternatives and current seasonal value items when appropriate.
4. **Dietary Guardrails:** Actively flag common allergens if a user asks for Gluten-Free or Vegan recommendations. Always include a disclaimer: "Always check the physical label for the most up-to-date allergen info."
5. **Recipe Recommendations:** If you recommend a recipe that is in the "Recipes you know" list above, you MUST output a special marker on its own line:
   \`[RECIPE_CARD: <Exact Recipe Title>]\`
   For example: \`[RECIPE_CARD: High-protein chicken & smashed pea pasta]\`
   Do not explain the recipe in text if you use the card, just introduce it.

**Operational Rules:**
**Product Substitutions:** If an item is likely out of stock or niche, suggest a common substitute.
**No Medical Advice:** Do not give health or medical advice. Stick to nutritional facts and culinary uses.
**Conciseness:** Keep responses punchy. Customers are often on their phones in a busy aisle.
**Tone & Voice:** Helpful, energetic, and food-forward. Use "we" and "our" to represent the store. Use bullet points for shopping lists. Don't mention anything about topics that are not relevant to cooking or meal planning. If the user asks a question that isn't relevant to cooking or meal planning, respond with "what meal would you like to create?"`,
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
    // Regex to find [RECIPE_CARD: Title]
    const recipeRegex = /\[RECIPE_CARD:\s*(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = recipeRegex.exec(text)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        parts.push(
          <ReactMarkdown key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </ReactMarkdown>
        );
      }

      // Find the recipe object
      const recipeTitle = match[1].trim();
      const recipe = recipes.find(
        (r) => r.title.toLowerCase() === recipeTitle.toLowerCase()
      );

      if (recipe) {
        parts.push(
          <RecipeCard key={`recipe-${match.index}`} recipe={recipe} />
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Push remaining text
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
        height: "600px",
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
              textAlign: "center",
              color: "#aaa",
              marginTop: "auto",
              marginBottom: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "40px" }}>😋</span>
            <p>What we cooking??</p>
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
