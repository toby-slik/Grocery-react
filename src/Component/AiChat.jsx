import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useRef, useState } from "react";

export const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // We need to keep a reference to the chat session or recreate it with history
  // For simplicity and to ensure history is synced with state, we'll recreate headers/history each time or use a ref for the chat object if we wanted,
  // but mapping state to history is robust.

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
      });

      // Prepare history for the chat
      // Gemini expects roles 'user' and 'model'
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: history,
      });

      // Add a placeholder for the AI response
      setMessages((prev) => [...prev, { text: "", sender: "ai" }]);

      const result = await chat.sendMessageStream(userMessage);

      let fullResponse = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        // Update the last message (AI's response) with new chunk
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
        // Remove the empty placeholder if it exists and replace/append error
        // Or just append error
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
              maxWidth: "80%",
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
              {msg.text}
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
