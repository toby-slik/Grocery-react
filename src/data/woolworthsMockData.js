export const products = [
  {
    id: "p1",
    name: "Woolworths High Protein Pasta 375g",
    price: 3.0,
    category: "Pantry",
    inStock: true,
  },
  {
    id: "p2",
    name: "Woolworths RSPCA Approved Chicken Breast Fillet 500g",
    price: 11.0,
    category: "Meat & Poultry",
    inStock: true,
  },
  {
    id: "p3",
    name: "Woolworths Frozen Peas 500g",
    price: 2.2,
    category: "Freezer",
    inStock: true,
  },
  {
    id: "p4",
    name: "Fresh Lemon",
    price: 0.95,
    category: "Fruit & Veg",
    inStock: true,
  },
  {
    id: "p5",
    name: "Woolworths Parmesan Cheese Block 200g",
    price: 6.5,
    category: "Dairy",
    inStock: true,
  },
  {
    id: "p6",
    name: "Fresh Mint Bunch",
    price: 3.0,
    category: "Fruit & Veg",
    inStock: true,
  },
  {
    id: "p7",
    name: "Woolworths Greek Style Yoghurt 1kg",
    price: 5.5,
    category: "Dairy",
    inStock: true,
  },
];

export const recipes = [
  {
    id: "r1",
    title: "High-protein chicken & smashed pea pasta",
    prepTime: "10m",
    cookTime: "15m",
    servings: 4,
    pricePerServe: "$4.80",
    difficulty: 2, // 1-4 scale
    calories: "620",
    image:
      "https://foodhub.scene7.com/is/image/woolworthsltdprod/2107-high-protein-chicken-and-smashed-pea-pasta:Square-1300x1300",
    tags: ["Dinner", "High Protein", "Pasta", "Budget"],
    ingredients: [
      "375g Woolworths High Protein Pasta",
      "500g Woolworths RSPCA Approved Chicken Breast Fillet, diced",
      "2 cups Woolworths Frozen Peas",
      "1 Lemon, zested and juiced",
      "1/2 cup Parmesan cheese, grated",
      "1/4 cup Fresh mint leaves, chopped",
      "2 tbsp Olive oil",
      "Salt and pepper to taste",
    ],
    method: [
      "Cook the pasta in a large pot of boiling salted water according to packet directions, adding the peas for the last 2 minutes of cooking time.",
      "Meanwhile, heat oil in a large frying pan over medium-high heat. Cook chicken, stirring, for 5-6 minutes or until browned and cooked through.",
      "Reserve 1/2 cup of the pasta cooking water. Drain pasta and peas. Return to the pot.",
      "Add the chicken, lemon zest, lemon juice, parmesan, mint and reserved cooking water to the pasta. Toss to combine.",
      "Season with salt and pepper. Serve immediately, topped with extra parmesan if desired.",
    ],
  },
  {
    id: "r2",
    title: "Easy 15-Minute Tacos",
    prepTime: "5m",
    cookTime: "10m",
    servings: 4,
    pricePerServe: "$3.50",
    difficulty: 1,
    calories: "450",
    image:
      "https://foodhub.scene7.com/is/image/woolworthsltdprod/1908-easy-beef-tacos:Square-1300x1300",
    // Note: Using a real woolies image link style if possible, or placeholder.
    tags: ["Dinner", "Mexican", "Quick", "Family Favourite"],
    ingredients: [
      "500g Beef Mince",
      "1 packet Taco Seasoning",
      "12 Taco Shells",
      "Lettuce, shredded",
      "Tomato, diced",
      "Cheese, grated",
    ],
    method: [
      "Brown the mince in a pan over medium heat.",
      "Add taco seasoning and a splash of water, simmer for 5 minutes.",
      "Heat taco shells according to box instructions.",
      "Serve mince in shells topped with salad and cheese.",
    ],
  },
];
