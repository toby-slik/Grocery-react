import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { findProductForIngredient } from "../utils/recipeUtils";

const ShopRecipeModal = ({ recipe, onClose }) => {
  const { addToCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (!recipe) return;

    const initialItems = recipe.ingredients.map((ing) => {
      const product = findProductForIngredient(ing);
      return {
        ingredient: ing,
        product: product || null,
        quantity: 1,
        selected: true,
      };
    });
    setSelectedItems(initialItems);
  }, [recipe]);

  useEffect(() => {
    const total = selectedItems.reduce((acc, item) => {
      if (item.selected && item.product) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 0);
    setTotalCost(total);
  }, [selectedItems]);

  const handleQuantityChange = (index, change) => {
    const newItems = [...selectedItems];
    const newQty = newItems[index].quantity + change;
    if (newQty >= 1) {
      newItems[index].quantity = newQty;
      setSelectedItems(newItems);
    }
  };

  const handleAddToCart = () => {
    selectedItems.forEach((item) => {
      if (item.selected && item.product) {
        addToCart(item.product, item.quantity);
      }
    });
    onClose();
    // Maybe show a success toast here
    alert(`Added items to cart! Total: $${totalCost.toFixed(2)}`);
  };

  if (!recipe) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "800px",
          height: "90vh",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
            Shop recipe
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
              {recipe.ingredients.length} Ingredients
            </h3>
            <p style={{ color: "#666", fontSize: "14px" }}>{recipe.title}</p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {selectedItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                }}
              >
                {/* Left: Ingredient Name (Header) */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    {item.ingredient}
                  </p>
                  {item.product ? (
                    <div style={{ display: "flex", gap: "16px" }}>
                      {/* Product Img */}
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          backgroundColor: "#f9f9f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                          />
                        ) : (
                          <span style={{ fontSize: "24px" }}>📦</span>
                        )}
                      </div>
                      {/* Product Details */}
                      <div>
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            margin: "0 0 4px 0",
                          }}
                        >
                          {item.product.name}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{ fontSize: "16px", fontWeight: "bold" }}
                          >
                            ${item.product.price.toFixed(2)}
                          </span>
                          {/* Example badge */}
                          {item.product.inStock && (
                            <span
                              style={{
                                fontSize: "10px",
                                backgroundColor: "#e8f5e9",
                                color: "#1b5e20",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              IN STOCK
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "#d32f2f",
                        fontSize: "14px",
                        marginTop: "8px",
                      }}
                    >
                      Product not found in store.
                    </div>
                  )}
                </div>

                {/* Right: Quantity & Actions */}
                {item.product && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #178841",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => handleQuantityChange(idx, -1)}
                        style={{
                          padding: "8px 12px",
                          background: "#178841",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        -
                      </button>
                      <span style={{ padding: "0 12px", fontSize: "14px" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(idx, 1)}
                        style={{
                          padding: "8px 12px",
                          background: "#178841",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      style={{
                        marginTop: "8px",
                        padding: "6px 16px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        background: "white",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Swap
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f9f9f9",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleAddToCart}
            style={{
              backgroundColor: "#178841",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>Add To Cart</span>
            <span
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              ${totalCost.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopRecipeModal;
