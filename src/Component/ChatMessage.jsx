import ReactMarkdown from "react-markdown";
import { recipes } from "../data/woolworthsMockData";
import RecipeCard from "./RecipeCard";

const ChatMessage = ({ msg }) => {
  const renderMessageContent = (text) => {
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
          const recipeData = JSON.parse(content);
          parts.push(
            <RecipeCard
              key={`recipe-data-${match.index}`}
              recipe={recipeData}
            />
          );
        } catch (e) {
          console.error("Failed to parse dynamic recipe data", e);
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
      className="message-bubble-container"
      style={{ alignSelf: msg.sender === "user" ? "flex-end" : "flex-start" }}
    >
      <div
        className={`message-bubble ${
          msg.sender === "user" ? "message-user" : "message-ai"
        }`}
      >
        {msg.sender === "ai" ? (
          renderMessageContent(msg.text)
        ) : (
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
