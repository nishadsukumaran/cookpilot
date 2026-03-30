export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: "protein" | "dairy" | "spice" | "vegetable" | "grain" | "oil" | "other";
}

export interface Substitution {
  original: string;
  substitute: string;
  impact: string;
}

export interface CookingStep {
  number: number;
  instruction: string;
  duration?: number; // minutes
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cuisine: string;
  cookingTime: number; // minutes
  prepTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: number;
  servings: number;
  calories: number;
  tags: string[];
  aiSummary: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  substitutions: Substitution[];
}

export interface CookingProblem {
  id: string;
  problem: string;
  icon: string;
  category: "rescue" | "substitute" | "adjust" | "explain";
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "quick", label: "Quick Meals", icon: "⚡" },
  { id: "healthy", label: "Healthy", icon: "🥗" },
  { id: "indian", label: "Indian", icon: "🍛" },
  { id: "arabic", label: "Arabic", icon: "🫓" },
  { id: "chicken", label: "Chicken", icon: "🍗" },
  { id: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { id: "dessert", label: "Dessert", icon: "🍰" },
  { id: "breakfast", label: "Breakfast", icon: "🍳" },
];

export const suggestedPrompts: CookingProblem[] = [
  {
    id: "too-much-salt",
    problem: "I added too much salt",
    icon: "🧂",
    category: "rescue",
  },
  {
    id: "no-cream",
    problem: "I don't have cream",
    icon: "🥛",
    category: "substitute",
  },
  {
    id: "make-healthier",
    problem: "Make this healthier",
    icon: "💚",
    category: "adjust",
  },
  {
    id: "reduce-spice",
    problem: "Can I reduce the spice?",
    icon: "🌶️",
    category: "adjust",
  },
  {
    id: "replace-butter",
    problem: "Can I replace butter with olive oil?",
    icon: "🫒",
    category: "substitute",
  },
  {
    id: "too-watery",
    problem: "My curry is too watery",
    icon: "💧",
    category: "rescue",
  },
];

export const recipes: Recipe[] = [
  {
    id: "butter-chicken",
    title: "Butter Chicken",
    description:
      "Rich, creamy tomato-based curry with tender marinated chicken pieces. A beloved North Indian classic with a perfect balance of spice and comfort.",
    image: "/images/butter-chicken.jpg",
    cuisine: "Indian",
    cookingTime: 45,
    prepTime: 20,
    difficulty: "Medium",
    rating: 4.9,
    servings: 4,
    calories: 490,
    tags: ["Most Authentic", "Fan Favorite", "Chicken"],
    aiSummary:
      "The #1 rated butter chicken recipe — uses kasuri methi and a slow-simmered tomato base for authentic flavor. Perfectly balanced spice level.",
    ingredients: [
      { name: "Chicken thighs", amount: 800, unit: "g", category: "protein" },
      { name: "Yogurt", amount: 200, unit: "ml", category: "dairy" },
      { name: "Butter", amount: 60, unit: "g", category: "dairy" },
      { name: "Heavy cream", amount: 150, unit: "ml", category: "dairy" },
      { name: "Tomato puree", amount: 400, unit: "g", category: "vegetable" },
      { name: "Onion", amount: 2, unit: "large", category: "vegetable" },
      { name: "Garlic", amount: 6, unit: "cloves", category: "vegetable" },
      { name: "Ginger", amount: 2, unit: "inch", category: "vegetable" },
      { name: "Garam masala", amount: 2, unit: "tsp", category: "spice" },
      { name: "Kasuri methi", amount: 1, unit: "tbsp", category: "spice" },
      { name: "Turmeric", amount: 1, unit: "tsp", category: "spice" },
      { name: "Red chili powder", amount: 1.5, unit: "tsp", category: "spice" },
      { name: "Cumin powder", amount: 1, unit: "tsp", category: "spice" },
      { name: "Salt", amount: 1, unit: "to taste", category: "spice" },
      { name: "Oil", amount: 2, unit: "tbsp", category: "oil" },
      { name: "Sugar", amount: 1, unit: "tsp", category: "other" },
    ],
    steps: [
      {
        number: 1,
        instruction:
          "Marinate chicken with yogurt, turmeric, chili powder, and salt. Refrigerate for at least 30 minutes, ideally 2 hours.",
        duration: 30,
        tip: "Longer marination means more tender and flavorful chicken.",
      },
      {
        number: 2,
        instruction:
          "Heat oil in a pan and sear the marinated chicken pieces until golden on both sides. Set aside.",
        duration: 8,
        tip: "Don't move the chicken too much — let it get a nice char.",
      },
      {
        number: 3,
        instruction:
          "In the same pan, melt butter. Add finely chopped onions and cook until golden brown.",
        duration: 10,
      },
      {
        number: 4,
        instruction:
          "Add ginger-garlic paste and cook for 2 minutes until the raw smell disappears.",
        duration: 2,
      },
      {
        number: 5,
        instruction:
          "Add tomato puree, cumin powder, and remaining spices. Cook on medium heat until oil separates from the masala.",
        duration: 12,
        tip: "The oil separating is the key sign that the masala is properly cooked.",
      },
      {
        number: 6,
        instruction:
          "Add the seared chicken pieces to the gravy. Simmer on low heat for 10 minutes.",
        duration: 10,
      },
      {
        number: 7,
        instruction:
          "Stir in heavy cream and sugar. Add crushed kasuri methi. Simmer for 3 more minutes.",
        duration: 3,
        tip: "Crush the kasuri methi between your palms to release its aroma.",
      },
      {
        number: 8,
        instruction:
          "Finish with a dollop of butter. Serve hot with naan or basmati rice.",
        tip: "Garnish with fresh cream swirl and a sprinkle of kasuri methi.",
      },
    ],
    substitutions: [
      {
        original: "Heavy cream",
        substitute: "Cashew paste",
        impact: "Slightly nuttier, lower calories, still creamy. Authentic alternative.",
      },
      {
        original: "Butter",
        substitute: "Olive oil",
        impact:
          "Loses the signature buttery richness. Healthier but changes the dish character.",
      },
      {
        original: "Chicken thighs",
        substitute: "Paneer cubes",
        impact: "Becomes Paneer Butter Masala. Vegetarian-friendly, equally delicious.",
      },
    ],
  },
  {
    id: "chicken-biryani",
    title: "Chicken Biryani",
    description:
      "Fragrant layered rice dish with aromatic spices, tender chicken, and caramelized onions. The crown jewel of Indian cuisine.",
    image: "/images/chicken-biryani.jpg",
    cuisine: "Indian",
    cookingTime: 60,
    prepTime: 30,
    difficulty: "Hard",
    rating: 4.8,
    servings: 6,
    calories: 550,
    tags: ["Most Authentic", "Special Occasion", "Chicken"],
    aiSummary:
      "A Hyderabadi-style dum biryani with perfectly layered rice and chicken. The saffron and fried onion technique gives it that restaurant quality.",
    ingredients: [
      { name: "Basmati rice", amount: 500, unit: "g", category: "grain" },
      { name: "Chicken", amount: 1000, unit: "g", category: "protein" },
      { name: "Yogurt", amount: 200, unit: "ml", category: "dairy" },
      { name: "Onions", amount: 4, unit: "large", category: "vegetable" },
      { name: "Tomatoes", amount: 3, unit: "medium", category: "vegetable" },
      { name: "Saffron strands", amount: 1, unit: "pinch", category: "spice" },
      { name: "Whole spices (bay leaf, cardamom, cloves, cinnamon)", amount: 1, unit: "set", category: "spice" },
      { name: "Biryani masala", amount: 2, unit: "tbsp", category: "spice" },
      { name: "Green chilies", amount: 4, unit: "pieces", category: "vegetable" },
      { name: "Mint leaves", amount: 1, unit: "cup", category: "vegetable" },
      { name: "Coriander leaves", amount: 1, unit: "cup", category: "vegetable" },
      { name: "Ghee", amount: 4, unit: "tbsp", category: "oil" },
      { name: "Oil", amount: 4, unit: "tbsp", category: "oil" },
      { name: "Salt", amount: 1, unit: "to taste", category: "spice" },
    ],
    steps: [
      {
        number: 1,
        instruction:
          "Wash and soak basmati rice for 30 minutes. Drain and set aside.",
        duration: 30,
        tip: "Soaking makes rice grains elongate beautifully.",
      },
      {
        number: 2,
        instruction:
          "Slice onions thinly and deep fry until golden brown and crispy. Set aside on paper towels.",
        duration: 15,
        tip: "These fried onions are the secret to great biryani flavor.",
      },
      {
        number: 3,
        instruction:
          "Marinate chicken with yogurt, biryani masala, half the fried onions, mint, coriander, and salt for 30 minutes.",
        duration: 30,
      },
      {
        number: 4,
        instruction:
          "Boil water with whole spices and salt. Cook rice until 70% done. Drain immediately.",
        duration: 8,
        tip: "The rice should still have a bite — it will finish cooking in the dum.",
      },
      {
        number: 5,
        instruction:
          "In a heavy-bottomed pot, spread the marinated chicken as the bottom layer.",
        duration: 2,
      },
      {
        number: 6,
        instruction:
          "Layer the partially cooked rice over the chicken. Top with saffron milk, remaining fried onions, ghee, and mint.",
        duration: 5,
      },
      {
        number: 7,
        instruction:
          "Seal the pot with aluminum foil or dough, then place a tight lid. Cook on high heat for 3 minutes, then very low heat for 25 minutes.",
        duration: 28,
        tip: "Don't open the lid! The steam (dum) is what cooks everything perfectly.",
      },
      {
        number: 8,
        instruction:
          "Let it rest 5 minutes, then gently mix layers. Serve with raita and mirchi ka salan.",
        duration: 5,
      },
    ],
    substitutions: [
      {
        original: "Saffron",
        substitute: "Turmeric + food color",
        impact: "Loses the delicate saffron aroma. Color similar, but flavor is different.",
      },
      {
        original: "Ghee",
        substitute: "Butter",
        impact: "Slightly less nutty aroma. Acceptable substitute with minimal impact.",
      },
      {
        original: "Chicken",
        substitute: "Lamb",
        impact: "Richer, more traditional. Increase cooking time by 15 min for tender meat.",
      },
    ],
  },
  {
    id: "paneer-butter-masala",
    title: "Paneer Butter Masala",
    description:
      "Soft paneer cubes in a luxurious, creamy tomato gravy. The vegetarian sibling of butter chicken that stands strong on its own.",
    image: "/images/paneer-butter-masala.jpg",
    cuisine: "Indian",
    cookingTime: 35,
    prepTime: 15,
    difficulty: "Easy",
    rating: 4.7,
    servings: 4,
    calories: 420,
    tags: ["Quickest", "Vegetarian", "Comfort Food"],
    aiSummary:
      "Quick and satisfying vegetarian curry. This version uses the restaurant trick of soaking paneer in warm water for extra softness.",
    ingredients: [
      { name: "Paneer", amount: 400, unit: "g", category: "dairy" },
      { name: "Butter", amount: 40, unit: "g", category: "dairy" },
      { name: "Heavy cream", amount: 100, unit: "ml", category: "dairy" },
      { name: "Tomato puree", amount: 350, unit: "g", category: "vegetable" },
      { name: "Onion", amount: 1, unit: "large", category: "vegetable" },
      { name: "Cashews", amount: 15, unit: "pieces", category: "other" },
      { name: "Garlic", amount: 4, unit: "cloves", category: "vegetable" },
      { name: "Ginger", amount: 1, unit: "inch", category: "vegetable" },
      { name: "Garam masala", amount: 1.5, unit: "tsp", category: "spice" },
      { name: "Kasuri methi", amount: 1, unit: "tsp", category: "spice" },
      { name: "Red chili powder", amount: 1, unit: "tsp", category: "spice" },
      { name: "Sugar", amount: 1, unit: "tsp", category: "other" },
      { name: "Salt", amount: 1, unit: "to taste", category: "spice" },
    ],
    steps: [
      {
        number: 1,
        instruction:
          "Soak paneer cubes in warm salted water for 10 minutes to make them soft and spongy.",
        duration: 10,
        tip: "This restaurant trick keeps paneer soft even after cooking.",
      },
      {
        number: 2,
        instruction:
          "Soak cashews in hot water for 10 minutes, then blend into a smooth paste.",
        duration: 10,
      },
      {
        number: 3,
        instruction: "Melt butter, sauté chopped onions until translucent. Add ginger-garlic paste.",
        duration: 7,
      },
      {
        number: 4,
        instruction:
          "Add tomato puree and spices. Cook until the gravy thickens and oil separates.",
        duration: 10,
      },
      {
        number: 5,
        instruction:
          "Stir in cashew paste and cream. Simmer for 3 minutes on low heat.",
        duration: 3,
      },
      {
        number: 6,
        instruction:
          "Drain paneer and gently fold into the gravy. Simmer for 2 minutes. Finish with kasuri methi and butter.",
        duration: 2,
        tip: "Don't stir too vigorously or the paneer may crumble.",
      },
    ],
    substitutions: [
      {
        original: "Paneer",
        substitute: "Tofu (extra firm)",
        impact: "Vegan-friendly. Press and pan-fry tofu first for better texture.",
      },
      {
        original: "Heavy cream",
        substitute: "Coconut cream",
        impact: "Adds slight coconut flavor. Works well, slightly different character.",
      },
    ],
  },
  {
    id: "shakshuka",
    title: "Shakshuka",
    description:
      "Eggs poached in a vibrant, spiced tomato and pepper sauce. A Middle Eastern breakfast staple that makes any meal feel special.",
    image: "/images/shakshuka.jpg",
    cuisine: "Middle Eastern",
    cookingTime: 25,
    prepTime: 10,
    difficulty: "Easy",
    rating: 4.6,
    servings: 3,
    calories: 310,
    tags: ["Quickest", "Healthy", "Breakfast", "Vegetarian"],
    aiSummary:
      "Simple yet stunning one-pan dish. The key is getting the tomato sauce thick and flavorful before adding eggs.",
    ingredients: [
      { name: "Eggs", amount: 6, unit: "large", category: "protein" },
      { name: "Canned tomatoes", amount: 800, unit: "g", category: "vegetable" },
      { name: "Red bell pepper", amount: 2, unit: "medium", category: "vegetable" },
      { name: "Onion", amount: 1, unit: "large", category: "vegetable" },
      { name: "Garlic", amount: 4, unit: "cloves", category: "vegetable" },
      { name: "Cumin", amount: 2, unit: "tsp", category: "spice" },
      { name: "Paprika", amount: 1, unit: "tsp", category: "spice" },
      { name: "Cayenne pepper", amount: 0.5, unit: "tsp", category: "spice" },
      { name: "Olive oil", amount: 3, unit: "tbsp", category: "oil" },
      { name: "Fresh parsley", amount: 1, unit: "handful", category: "vegetable" },
      { name: "Feta cheese", amount: 50, unit: "g", category: "dairy" },
      { name: "Salt & pepper", amount: 1, unit: "to taste", category: "spice" },
    ],
    steps: [
      {
        number: 1,
        instruction:
          "Heat olive oil in a large skillet. Sauté diced onion and bell pepper until softened.",
        duration: 6,
      },
      {
        number: 2,
        instruction: "Add garlic, cumin, paprika, and cayenne. Cook for 1 minute until fragrant.",
        duration: 1,
      },
      {
        number: 3,
        instruction:
          "Pour in canned tomatoes, breaking them up with a spoon. Season with salt and pepper. Simmer until thickened.",
        duration: 10,
        tip: "The sauce should be thick enough to hold the eggs in little wells.",
      },
      {
        number: 4,
        instruction:
          "Make wells in the sauce and crack eggs into them. Cover and cook until whites are set but yolks are still runny.",
        duration: 6,
        tip: "For firmer yolks, cover and cook 1-2 minutes longer.",
      },
      {
        number: 5,
        instruction:
          "Crumble feta over the top, sprinkle with fresh parsley. Serve immediately with crusty bread.",
        tip: "Eat directly from the pan for the authentic experience!",
      },
    ],
    substitutions: [
      {
        original: "Feta cheese",
        substitute: "Goat cheese",
        impact: "Creamier, slightly tangier. Both are traditional options.",
      },
      {
        original: "Eggs",
        substitute: "Silken tofu (cubed)",
        impact: "Vegan alternative. Different texture but absorbs the sauce beautifully.",
      },
    ],
  },
  {
    id: "machboos",
    title: "Machboos",
    description:
      "Aromatic Gulf-style spiced rice with tender chicken, dried limes, and a complex baharat spice blend. The soul of Arabian comfort food.",
    image: "/images/machboos.jpg",
    cuisine: "Arabic",
    cookingTime: 50,
    prepTime: 20,
    difficulty: "Medium",
    rating: 4.7,
    servings: 5,
    calories: 520,
    tags: ["Most Authentic", "Special Occasion", "Chicken"],
    aiSummary:
      "A signature Gulf dish where the rice is cooked in the chicken broth for maximum flavor. The loomi (dried lime) is the secret ingredient.",
    ingredients: [
      { name: "Chicken", amount: 1000, unit: "g", category: "protein" },
      { name: "Basmati rice", amount: 400, unit: "g", category: "grain" },
      { name: "Onions", amount: 3, unit: "large", category: "vegetable" },
      { name: "Tomatoes", amount: 3, unit: "medium", category: "vegetable" },
      { name: "Baharat spice mix", amount: 2, unit: "tbsp", category: "spice" },
      { name: "Loomi (dried lime)", amount: 3, unit: "pieces", category: "spice" },
      { name: "Turmeric", amount: 1, unit: "tsp", category: "spice" },
      { name: "Cinnamon stick", amount: 1, unit: "piece", category: "spice" },
      { name: "Cardamom pods", amount: 4, unit: "pieces", category: "spice" },
      { name: "Garlic", amount: 5, unit: "cloves", category: "vegetable" },
      { name: "Vegetable oil", amount: 4, unit: "tbsp", category: "oil" },
      { name: "Rose water", amount: 1, unit: "tbsp", category: "other" },
      { name: "Salt", amount: 1, unit: "to taste", category: "spice" },
    ],
    steps: [
      {
        number: 1,
        instruction:
          "Season chicken with baharat, turmeric, and salt. Let it rest for 15 minutes.",
        duration: 15,
      },
      {
        number: 2,
        instruction:
          "Heat oil and brown the chicken on all sides. Remove and set aside.",
        duration: 8,
      },
      {
        number: 3,
        instruction:
          "In the same pot, fry sliced onions until deeply caramelized. Add garlic and cook briefly.",
        duration: 12,
        tip: "Dark, caramelized onions are essential for the rich color.",
      },
      {
        number: 4,
        instruction:
          "Add chopped tomatoes, whole spices, and loomi. Cook until tomatoes break down.",
        duration: 5,
      },
      {
        number: 5,
        instruction:
          "Return chicken to the pot, add water to cover. Simmer until chicken is cooked through.",
        duration: 20,
      },
      {
        number: 6,
        instruction:
          "Remove chicken. Measure the broth, add soaked rice, and cook until rice is done and liquid is absorbed.",
        duration: 15,
        tip: "Use exactly 1.5x broth to rice ratio for perfect texture.",
      },
      {
        number: 7,
        instruction:
          "Layer rice and chicken on a serving platter. Sprinkle with rose water and garnish with fried onions and nuts.",
        tip: "Serve with a fresh salad and tangy daqoos (tomato sauce).",
      },
    ],
    substitutions: [
      {
        original: "Loomi",
        substitute: "Lime zest + pinch of black pepper",
        impact: "Approximates the citrusy tang. Authentic loomi has a deeper, smokier note.",
      },
      {
        original: "Baharat",
        substitute: "Garam masala + pinch of paprika",
        impact: "Different spice profile but similar warmth. Not traditional but workable.",
      },
    ],
  },
  {
    id: "grilled-chicken-salad",
    title: "Grilled Chicken Salad",
    description:
      "A hearty, protein-packed salad with juicy grilled chicken, crisp greens, and a bright lemon herb dressing.",
    image: "/images/grilled-chicken-salad.jpg",
    cuisine: "International",
    cookingTime: 20,
    prepTime: 15,
    difficulty: "Easy",
    rating: 4.5,
    servings: 2,
    calories: 350,
    tags: ["Quickest", "Healthiest", "High Protein"],
    aiSummary:
      "The healthiest option in your collection with 42g protein per serving. The key is the marinade that keeps the chicken juicy.",
    ingredients: [
      { name: "Chicken breast", amount: 400, unit: "g", category: "protein" },
      { name: "Mixed salad greens", amount: 200, unit: "g", category: "vegetable" },
      { name: "Cherry tomatoes", amount: 150, unit: "g", category: "vegetable" },
      { name: "Cucumber", amount: 1, unit: "medium", category: "vegetable" },
      { name: "Red onion", amount: 0.5, unit: "medium", category: "vegetable" },
      { name: "Avocado", amount: 1, unit: "medium", category: "vegetable" },
      { name: "Olive oil", amount: 3, unit: "tbsp", category: "oil" },
      { name: "Lemon juice", amount: 2, unit: "tbsp", category: "other" },
      { name: "Honey", amount: 1, unit: "tsp", category: "other" },
      { name: "Garlic", amount: 2, unit: "cloves", category: "vegetable" },
      { name: "Dried oregano", amount: 1, unit: "tsp", category: "spice" },
      { name: "Salt & pepper", amount: 1, unit: "to taste", category: "spice" },
    ],
    steps: [
      {
        number: 1,
        instruction:
          "Mix olive oil, lemon juice, garlic, oregano, honey, salt, and pepper for the dressing. Reserve half for salad.",
        duration: 3,
      },
      {
        number: 2,
        instruction:
          "Marinate chicken breast with the other half of the dressing for 10 minutes.",
        duration: 10,
      },
      {
        number: 3,
        instruction:
          "Grill chicken on high heat for 5-6 minutes per side until cooked through. Rest for 3 minutes.",
        duration: 15,
        tip: "Let it rest! This redistributes juices for much more tender chicken.",
      },
      {
        number: 4,
        instruction:
          "Assemble salad greens, halved cherry tomatoes, sliced cucumber, red onion rings, and diced avocado.",
        duration: 3,
      },
      {
        number: 5,
        instruction:
          "Slice the rested chicken and arrange over the salad. Drizzle with remaining dressing.",
        tip: "Add a squeeze of fresh lemon and a crack of black pepper right before eating.",
      },
    ],
    substitutions: [
      {
        original: "Chicken breast",
        substitute: "Grilled tofu or halloumi",
        impact: "Lower protein but still satisfying. Halloumi adds a salty, chewy bite.",
      },
      {
        original: "Avocado",
        substitute: "Roasted chickpeas",
        impact: "Different texture, more crunch, similar healthy fats. Budget-friendly.",
      },
    ],
  },
];

export const continueRecipes = [
  { recipeId: "butter-chicken", currentStep: 5, totalSteps: 8 },
  { recipeId: "shakshuka", currentStep: 3, totalSteps: 5 },
];

export const savedRecipeIds = [
  "butter-chicken",
  "chicken-biryani",
  "shakshuka",
];

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function getRecipesByTag(tag: string): Recipe[] {
  return recipes.filter((r) =>
    r.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function scaleIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  newServings: number
): Ingredient[] {
  const ratio = newServings / originalServings;
  return ingredients.map((ing) => ({
    ...ing,
    amount: Math.round(ing.amount * ratio * 100) / 100,
  }));
}
