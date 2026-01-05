import { useState } from "react";

const RecipeCard = ({ recipe }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recipe) return null;

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fff",
        // maxWidth: '300px', // Optional constraint, let parent handle width
        margin: "8px 0",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      }}
    >
      {/* Image Section */}
      <div
        style={{ position: "relative", height: "150px", overflow: "hidden" }}
      >
        <img
          src={recipe.image}
          alt={recipe.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Difficulty Dots (Top Right) */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "4px 8px",
            borderRadius: "12px",
            display: "flex",
            gap: "2px",
            alignItems: "center",
            fontSize: "10px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          <span>Difficulty</span>
          <div style={{ display: "flex", gap: "2px", marginLeft: "4px" }}>
            {[1, 2, 3, 4].map((dot) => (
              <div
                key={dot}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    dot <= recipe.difficulty ? "#178841" : "#ddd",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "16px" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "700",
            color: "#1a1a1a",
            lineHeight: "1.4",
          }}
        >
          {recipe.title}
        </h3>

        {/* Quick Stats */}
        <div
          style={{
            display: "flex",
            fontSize: "12px",
            color: "#666",
            marginBottom: "12px",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>⏱️</span>
            <span>{recipe.prepTime} Prep</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>🔥</span>
            <span>{recipe.cookTime} Cook</span>
          </div>
        </div>

        {/* Ingredients Preview */}
        <div style={{ marginBottom: "16px" }}>
          <p
            style={{
              margin: "0 0 4px 0",
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Ingredients ({recipe.ingredients.length})
          </p>
          <ul
            style={{
              listStyle: "disc",
              paddingLeft: "20px",
              margin: "0",
              fontSize: "13px",
              color: "#555",
            }}
          >
            {recipe.ingredients.slice(0, 3).map((ing, idx) => (
              <li key={idx} style={{ marginBottom: "2px" }}>
                {ing}
              </li>
            ))}
            {recipe.ingredients.length > 3 && (
              <li
                style={{
                  listStyle: "none",
                  color: "#178841",
                  marginTop: "4px",
                  fontSize: "12px",
                }}
              >
                +{recipe.ingredients.length - 3} more...
              </li>
            )}
          </ul>
        </div>

        {/* Expanded Details (Method) - Only visible if expanded */}
        {isExpanded && (
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: "12px",
              marginTop: "12px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "13px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Method
            </p>
            <ol
              style={{
                paddingLeft: "20px",
                margin: "0",
                fontSize: "13px",
                color: "#555",
              }}
            >
              {recipe.method.map((step, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#178841",
            color: "white",
            border: "none",
            borderRadius: "20px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            marginTop: isExpanded ? "16px" : "0",
          }}
        >
          {isExpanded ? "Close Recipe" : "View Full Recipe"}
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
