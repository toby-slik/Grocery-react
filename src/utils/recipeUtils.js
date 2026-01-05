import { products } from "../data/woolworthsMockData";

// Helper to find a product matching an ingredient (simple fuzzy match)
export const findProductForIngredient = (ingredient) => {
  if (!ingredient) return null;
  const ingredientLower = ingredient.toLowerCase();

  // Manual mapping for best results based on mock data
  if (ingredientLower.includes("chicken"))
    return products.find((p) => p.name.includes("Chicken"));
  if (ingredientLower.includes("pasta"))
    return products.find((p) => p.name.includes("Pasta"));
  if (ingredientLower.includes("peas"))
    return products.find((p) => p.name.includes("Peas"));
  if (ingredientLower.includes("lemon"))
    return products.find((p) => p.name.includes("Lemon"));
  if (
    ingredientLower.includes("cheese") ||
    ingredientLower.includes("parmesan")
  )
    return products.find(
      (p) => p.name.includes("Parmesan") || p.name.includes("Cheese")
    );
  if (ingredientLower.includes("mint"))
    return products.find((p) => p.name.includes("Mint"));
  if (ingredientLower.includes("mince") || ingredientLower.includes("beef"))
    return products.find((p) => p.name.includes("Mince"));
  // Tacos specifics
  if (
    ingredientLower.includes("taco") ||
    ingredientLower.includes("shell") ||
    ingredientLower.includes("seasoning")
  )
    return products.find((p) => p.name.includes("Taco"));
  if (ingredientLower.includes("lettuce"))
    return products.find((p) => p.name.includes("Lettuce"));
  if (ingredientLower.includes("tofu"))
    return products.find((p) => p.name.includes("Tofu"));
  if (ingredientLower.includes("cornflour"))
    return products.find((p) => p.name.includes("Cornflour"));
  if (ingredientLower.includes("maple"))
    return products.find((p) => p.name.includes("Maple"));
  if (ingredientLower.includes("onion"))
    return products.find((p) => p.name.includes("Onion"));
  if (ingredientLower.includes("tomato"))
    return (
      products.find((p) => p.name.includes("Tomato")) ||
      products.find((p) => p.name.includes("Veg"))
    );
  if (ingredientLower.includes("oil"))
    return products.find((p) => p.name.includes("Oil"));
  if (ingredientLower.includes("ginger"))
    return products.find((p) => p.name.includes("Ginger"));
  if (ingredientLower.includes("soy"))
    return products.find((p) => p.name.includes("Soy"));
  if (ingredientLower.includes("honey"))
    return products.find((p) => p.name.includes("Honey"));
  if (ingredientLower.includes("veg"))
    return products.find((p) => p.name.includes("Veg"));

  // Fallback: search products for any word match
  return products.find((p) => ingredientLower.includes(p.name.toLowerCase()));
};

export const calculateRecipeCost = (recipe) => {
  if (!recipe || !recipe.ingredients) return { total: 0, perServe: 0 };

  let total = 0;
  recipe.ingredients.forEach((ing) => {
    const product = findProductForIngredient(ing);
    if (product) {
      total += product.price;
    }
  });

  const servings = recipe.servings || 4; // Default to 4 if missing
  return {
    total: total.toFixed(2),
    perServe: (total / servings).toFixed(2),
  };
};
