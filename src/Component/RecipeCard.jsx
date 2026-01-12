import { useState } from "react";
import { calculateRecipeCost } from "../utils/recipeUtils";
import ShopRecipeModal from "./ShopRecipeModal";

const NutritionModal = ({ nutrition, onClose }) => {
  if (!nutrition) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          &times;
        </button>

        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#1a1a1a",
          }}
        >
          Nutrition Information
        </h2>
        <p style={{ fontSize: "14px", marginBottom: "16px", color: "#666" }}>
          Servings: {nutrition.servings}
        </p>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "8px 4px", fontWeight: "600" }}>
                  Nutrient
                </th>
                <th style={{ padding: "8px 4px", fontWeight: "600" }}>
                  Qty Per Serving
                </th>
                <th style={{ padding: "8px 4px", fontWeight: "600" }}>% DI*</th>
                <th style={{ padding: "8px 4px", fontWeight: "600" }}>
                  Qty Per 100g
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Energy", key: "energy" },
                { label: "Protein", key: "protein" },
                { label: "Fat, Total", key: "fatTotal" },
                { label: "Saturated", key: "saturated" },
                { label: "Carbohydrate", key: "carbs" },
                { label: "Sugars", key: "sugars" },
                { label: "Dietary Fibre", key: "fiber" },
                { label: "Sodium", key: "sodium" },
              ].map((row, idx) => (
                <tr key={row.key} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px 4px", color: "#333" }}>
                    {row.label}
                  </td>
                  <td style={{ padding: "8px 4px", fontWeight: "500" }}>
                    {nutrition.perServing[row.key]}
                  </td>
                  <td style={{ padding: "8px 4px" }}>
                    {nutrition.diPerServing
                      ? nutrition.diPerServing[row.key] || "-"
                      : "-"}
                  </td>
                  <td style={{ padding: "8px 4px", color: "#666" }}>
                    {nutrition.per100g[row.key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          style={{
            fontSize: "11px",
            color: "#888",
            marginTop: "16px",
            lineHeight: "1.4",
          }}
        >
          *Percentage daily intakes are based on an average adult diet of 8700
          kJ. All quantities stated above are averages.
        </p>
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  // Dynamic cost calculation
  const { perServe: estCostPerServe } = calculateRecipeCost(recipe);

  // Use dynamic cost if valid (~$0 means specific products missing, fallback to static if available)
  const displayCost =
    estCostPerServe && estCostPerServe > 0
      ? `$${estCostPerServe}`
      : recipe.pricePerServe;

  if (!recipe) return null;

  return (
    <>
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#fff",
          margin: "8px 0",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        {/* Image Section */}
        <div
          style={{ position: "relative", height: "150px", overflow: "hidden" }}
        >
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
              }}
            >
              No Image
            </div>
          )}

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
              flexWrap: "wrap",
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
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>🍽️</span>
              <span>{recipe.servings} Serves</span>
            </div>
            {displayCost && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#178841",
                  fontWeight: "bold",
                }}
              >
                <span>💰</span>
                <span>{displayCost}/serve (Est.)</span>
              </div>
            )}
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
              {(isIngredientsExpanded
                ? recipe.ingredients
                : recipe.ingredients.slice(0, 3)
              ).map((ing, idx) => (
                <li key={idx} style={{ marginBottom: "2px" }}>
                  {ing}
                </li>
              ))}
              {recipe.ingredients.length > 3 && (
                <button
                  onClick={() =>
                    setIsIngredientsExpanded(!isIngredientsExpanded)
                  }
                  style={{
                    border: "none",
                    background: "none",
                    padding: "0",
                    color: "#178841",
                    marginTop: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: "600",
                    textDecoration: "underline",
                  }}
                >
                  {isIngredientsExpanded
                    ? "Show less"
                    : `+${recipe.ingredients.length - 3} more...`}
                </button>
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

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: isExpanded ? "16px" : "0",
            }}
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#fff",
                color: "#178841",
                border: "1px solid #178841",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {isExpanded ? "Close" : "View Method"}
            </button>
            <button
              onClick={() => setShowShopModal(true)}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#178841",
                color: "white",
                border: "none",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>🛒</span> Shop Recipe
            </button>
          </div>

          {/* Nutrition Summary */}
          {recipe.nutrition && (
            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                  }}
                >
                  Nutrition per serving
                </span>
                <button
                  onClick={() => setShowNutrition(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#178841",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  more
                </button>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {/* Energy Icon */}
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    border: "3px solid #d4e157", // Light green
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#333",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>⚡</span>
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    {recipe.nutrition.perServing.energy}
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    {recipe.nutrition.diPerServing?.energy} of daily energy
                    intake*
                  </div>
                </div>
              </div>

              {/* Key Macros Grid */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                  textAlign: "center",
                }}
              >
                {[
                  {
                    label: "Protein",
                    value: recipe.nutrition.perServing.protein,
                  },
                  { label: "Fat", value: recipe.nutrition.perServing.fatTotal },
                  { label: "Carbs", value: recipe.nutrition.perServing.carbs },
                  {
                    label: "Sugars",
                    value: recipe.nutrition.perServing.sugars,
                  },
                ].map((macro) => (
                  <div
                    key={macro.label}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <span style={{ fontSize: "10px", color: "#666" }}>
                      {macro.label}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                      }}
                    >
                      {macro.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showNutrition && (
        <NutritionModal
          nutrition={recipe.nutrition}
          onClose={() => setShowNutrition(false)}
        />
      )}

      {showShopModal && (
        <ShopRecipeModal
          recipe={recipe}
          onClose={() => setShowShopModal(false)}
        />
      )}
    </>
  );
};

export default RecipeCard;
