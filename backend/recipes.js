const { nutrientsFor } = require('./foods')

// Each recipe has a base serving defined by ingredient amounts (grams).
// The planner scales all amounts proportionally to hit a calorie target.
// mealTypes: which meal slots this recipe is appropriate for
const RECIPE_TEMPLATES = [
  // ── BREAKFAST ──────────────────────────────────────────
  {
    id: 'protein_oats',
    name: 'Protein Oatmeal',
    emoji: '🥣',
    mealTypes: ['Breakfast'],
    instructions: 'Microwave oats with milk for 2–3 min. Stir in protein powder. Top with blueberries.',
    base: [
      { id: 'oats',           grams: 60  },
      { id: 'whole_milk',     grams: 250 },
      { id: 'protein_powder', grams: 30  },
      { id: 'blueberries',    grams: 80  },
    ],
  },
  {
    id: 'scrambled_eggs',
    name: 'Scrambled Eggs & Toast',
    emoji: '🍳',
    mealTypes: ['Breakfast'],
    instructions: 'Whisk eggs with a splash of milk. Cook in butter on medium-low. Serve on toasted bread.',
    base: [
      { id: 'eggs',       grams: 180 }, // 3 eggs
      { id: 'whole_milk', grams: 30  },
      { id: 'butter',     grams: 10  },
      { id: 'bread',      grams: 70  },
    ],
  },
  {
    id: 'yogurt_bowl',
    name: 'Greek Yogurt Bowl',
    emoji: '🫙',
    mealTypes: ['Breakfast', 'Morning Snack'],
    instructions: 'Layer yogurt in a bowl. Top with oats, blueberries, and a drizzle of peanut butter if desired.',
    base: [
      { id: 'greek_yogurt',  grams: 200 },
      { id: 'oats',          grams: 40  },
      { id: 'blueberries',   grams: 100 },
      { id: 'peanut_butter', grams: 15  },
    ],
  },

  // ── SNACKS ─────────────────────────────────────────────
  {
    id: 'protein_shake',
    name: 'Protein Shake',
    emoji: '🥤',
    mealTypes: ['Morning Snack', 'Pre-Workout', 'Post-Workout', 'Evening Snack'],
    instructions: 'Blend or shake protein powder with cold milk until smooth.',
    base: [
      { id: 'protein_powder', grams: 35  },
      { id: 'whole_milk',     grams: 350 },
    ],
  },
  {
    id: 'pb_banana',
    name: 'Peanut Butter & Banana',
    emoji: '🥜',
    mealTypes: ['Morning Snack', 'Pre-Workout', 'Evening Snack'],
    instructions: 'Slice banana and serve with peanut butter for dipping or spread on bread.',
    base: [
      { id: 'banana',        grams: 120 },
      { id: 'peanut_butter', grams: 30  },
      { id: 'bread',         grams: 60  },
    ],
  },
  {
    id: 'cottage_blueberry',
    name: 'Cottage Cheese & Blueberries',
    emoji: '🧀',
    mealTypes: ['Morning Snack', 'Evening Snack'],
    instructions: 'Scoop cottage cheese into a bowl and top with fresh or frozen blueberries.',
    base: [
      { id: 'cottage_cheese', grams: 200 },
      { id: 'blueberries',    grams: 100 },
    ],
  },

  // ── LUNCH / DINNER ─────────────────────────────────────
  {
    id: 'beef_rice_bowl',
    name: 'Ground Beef Rice Bowl',
    emoji: '🍚',
    mealTypes: ['Lunch', 'Dinner'],
    instructions: 'Brown ground beef in a pan with olive oil. Season with salt, pepper, garlic. Serve over steamed rice with steamed broccoli on the side.',
    base: [
      { id: 'ground_beef', grams: 180 },
      { id: 'white_rice',  grams: 200 },
      { id: 'broccoli',    grams: 150 },
      { id: 'olive_oil',   grams: 12  },
    ],
  },
  {
    id: 'chicken_sweet_potato',
    name: 'Chicken & Sweet Potato',
    emoji: '🍠',
    mealTypes: ['Lunch', 'Dinner'],
    instructions: 'Season chicken with salt, pepper, paprika. Bake at 200°C (400°F) for 20 min. Bake diced sweet potato alongside with olive oil. Serve with spinach.',
    base: [
      { id: 'chicken_breast', grams: 200 },
      { id: 'sweet_potato',   grams: 220 },
      { id: 'spinach',        grams: 80  },
      { id: 'olive_oil',      grams: 15  },
    ],
  },
  {
    id: 'salmon_rice',
    name: 'Salmon & Rice',
    emoji: '🐟',
    mealTypes: ['Lunch', 'Dinner'],
    instructions: 'Pan-fry salmon in olive oil 4 min each side. Serve over rice with mixed veg stir-fried in the same pan.',
    base: [
      { id: 'salmon',    grams: 180 },
      { id: 'white_rice', grams: 180 },
      { id: 'mixed_veg', grams: 150 },
      { id: 'olive_oil', grams: 12  },
    ],
  },
  {
    id: 'beef_pasta',
    name: 'Beef & Pasta',
    emoji: '🍝',
    mealTypes: ['Lunch', 'Dinner'],
    instructions: 'Cook pasta. Brown ground beef with olive oil, garlic, diced peppers. Toss with pasta and season to taste.',
    base: [
      { id: 'ground_beef', grams: 150 },
      { id: 'pasta',       grams: 220 },
      { id: 'peppers',     grams: 100 },
      { id: 'olive_oil',   grams: 12  },
    ],
  },
  {
    id: 'chicken_rice_bowl',
    name: 'Chicken Rice Bowl',
    emoji: '🍗',
    mealTypes: ['Lunch', 'Dinner'],
    instructions: 'Slice grilled or baked chicken. Serve over rice with stir-fried mixed veg and a drizzle of olive oil.',
    base: [
      { id: 'chicken_breast', grams: 190 },
      { id: 'white_rice',     grams: 200 },
      { id: 'mixed_veg',      grams: 130 },
      { id: 'olive_oil',      grams: 10  },
    ],
  },
  {
    id: 'turkey_potato',
    name: 'Turkey & Potato',
    emoji: '🦃',
    mealTypes: ['Lunch', 'Dinner'],
    instructions: 'Brown turkey mince with olive oil and garlic. Serve with boiled potato and steamed asparagus.',
    base: [
      { id: 'turkey_mince', grams: 180 },
      { id: 'potato',       grams: 250 },
      { id: 'asparagus',    grams: 120 },
      { id: 'olive_oil',    grams: 10  },
    ],
  },

  // ── PRE/POST WORKOUT ───────────────────────────────────
  {
    id: 'preworkout_shake',
    name: 'Pre-Workout Shake',
    emoji: '⚡',
    mealTypes: ['Pre-Workout'],
    instructions: 'Shake protein powder with milk. Have banana alongside. Eat 1–2 hours before training — total pre-workout nutrition window is 3–5 hours.',
    base: [
      { id: 'protein_powder', grams: 30  },
      { id: 'whole_milk',     grams: 300 },
      { id: 'banana',         grams: 100 },
    ],
  },
  {
    id: 'postworkout_rice_chicken',
    name: 'Post-Workout Rice & Chicken',
    emoji: '💪',
    mealTypes: ['Post-Workout'],
    instructions: 'Dice and pan-fry chicken in olive oil. Microwave rice. Eat within 3–5 hours post-training — the anabolic window is much wider than the old "30-min rule" (Aragon & Schoenfeld, JISSN 2013).',
    base: [
      { id: 'chicken_breast', grams: 200 },
      { id: 'white_rice',     grams: 200 },
      { id: 'broccoli',       grams: 100 },
      { id: 'olive_oil',      grams: 10  },
    ],
  },
]

// Compute base kcal for a recipe
function baseKcal(recipe) {
  return recipe.base.reduce((sum, item) => {
    const n = nutrientsFor(item.id, item.grams)
    return sum + (n ? n.kcal : 0)
  }, 0)
}

// Scale a recipe to a target calorie count
function scaleRecipe(recipe, targetKcal) {
  const base = baseKcal(recipe)
  if (base === 0) return null
  const scale = targetKcal / base

  const ingredients = recipe.base.map(item => {
    const grams = Math.round(item.grams * scale)
    return nutrientsFor(item.id, grams)
  }).filter(Boolean)

  const actualKcal = ingredients.reduce((s, i) => s + i.kcal, 0)
  const protein    = Math.round(ingredients.reduce((s, i) => s + i.protein, 0) * 10) / 10
  const fat        = Math.round(ingredients.reduce((s, i) => s + i.fat,     0) * 10) / 10
  const carbs      = Math.round(ingredients.reduce((s, i) => s + i.carbs,   0) * 10) / 10

  return {
    recipeId: recipe.id,
    name: recipe.name,
    emoji: recipe.emoji,
    instructions: recipe.instructions,
    ingredients,
    actualKcal,
    protein,
    fat,
    carbs,
  }
}

// Pick best recipe for a meal slot, rotating by day
function pickRecipe(mealType, dayIndex, mealIndex) {
  const options = RECIPE_TEMPLATES.filter(r => r.mealTypes.includes(mealType))
  if (options.length === 0) return RECIPE_TEMPLATES[0]
  return options[(dayIndex * 7 + mealIndex) % options.length]
}

module.exports = { RECIPE_TEMPLATES, scaleRecipe, pickRecipe, baseKcal }
