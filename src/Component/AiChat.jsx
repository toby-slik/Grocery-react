import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useRef, useState } from "react";
import "../css/AiChat.css";
import { products, recipes } from "../data/woolworthsMockData";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import ChatSurvey from "./ChatSurvey";

export const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const [isStickToBottom, setIsStickToBottom] = useState(true);
  const [surveyStep, setSurveyStep] = useState(0);
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

    if (surveyStep > 0) setSurveyStep(0);

    const newMessages = [...messages, { text: userMessage, sender: "user" }];
    setMessages(newMessages);

    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GoogleGenAI);

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

      const chat = model.startChat({ history });

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
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">Woolworths AI Assistant</div>

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="chat-history"
      >
        {messages.length === 0 && (
          <ChatSurvey
            surveyStep={surveyStep}
            setSurveyStep={setSurveyStep}
            surveyData={surveyData}
            setSurveyData={setSurveyData}
            handleSend={handleSend}
          />
        )}

        {messages.map((msg, index) => (
          <ChatMessage key={index} msg={msg} />
        ))}

        {loading && messages[messages.length - 1]?.sender === "user" && (
          <div className="typing-indicator">Typing...</div>
        )}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        loading={loading}
        handleSend={handleSend}
      />
    </div>
  );
};
