// All values per 100g (or per 100ml for liquids) as eaten
const FOODS = {
  // === PROTEINS ===
  ground_beef:     { name: 'Ground Beef (80/20)', emoji: '🥩', category: 'protein', kcal: 254, protein: 26, fat: 17, carbs: 0 },
  chicken_breast:  { name: 'Chicken Breast',       emoji: '🍗', category: 'protein', kcal: 165, protein: 31, fat: 3.6, carbs: 0 },
  salmon:          { name: 'Salmon',                emoji: '🐟', category: 'protein', kcal: 208, protein: 20, fat: 13,  carbs: 0 },
  eggs:            { name: 'Eggs',                  emoji: '🥚', category: 'protein', kcal: 155, protein: 13, fat: 11,  carbs: 1.1 },
  tuna:            { name: 'Canned Tuna',           emoji: '🐠', category: 'protein', kcal: 116, protein: 26, fat: 0.8, carbs: 0 },
  greek_yogurt:    { name: 'Greek Yogurt (0%)',     emoji: '🥛', category: 'protein', kcal: 59,  protein: 10, fat: 0.4, carbs: 3.6 },
  turkey_mince:    { name: 'Turkey Mince',          emoji: '🦃', category: 'protein', kcal: 189, protein: 27, fat: 9,   carbs: 0 },
  cottage_cheese:  { name: 'Cottage Cheese',        emoji: '🧀', category: 'protein', kcal: 98,  protein: 11, fat: 4.3, carbs: 3.4 },
  protein_powder:  { name: 'Whey Protein Powder',  emoji: '💪', category: 'protein', kcal: 370, protein: 75, fat: 4,   carbs: 10 },

  // === CARBS ===
  white_rice:      { name: 'White Rice (cooked)',   emoji: '🍚', category: 'carb', kcal: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  sweet_potato:    { name: 'Sweet Potato (baked)',  emoji: '🍠', category: 'carb', kcal: 90,  protein: 2,   fat: 0.1, carbs: 21 },
  oats:            { name: 'Oats (dry)',             emoji: '🌾', category: 'carb', kcal: 379, protein: 13,  fat: 6.9, carbs: 68 },
  pasta:           { name: 'Pasta (cooked)',         emoji: '🍝', category: 'carb', kcal: 131, protein: 5,   fat: 1.1, carbs: 25 },
  potato:          { name: 'Potato (boiled)',        emoji: '🥔', category: 'carb', kcal: 87,  protein: 1.9, fat: 0.1, carbs: 20 },
  bread:           { name: 'Whole Wheat Bread',     emoji: '🍞', category: 'carb', kcal: 247, protein: 13,  fat: 3.4, carbs: 41 },
  banana:          { name: 'Banana',                emoji: '🍌', category: 'carb', kcal: 89,  protein: 1.1, fat: 0.3, carbs: 23 },
  brown_rice:      { name: 'Brown Rice (cooked)',   emoji: '🍙', category: 'carb', kcal: 111, protein: 2.6, fat: 0.9, carbs: 23 },

  // === VEGETABLES ===
  broccoli:        { name: 'Broccoli',              emoji: '🥦', category: 'veg', kcal: 34,  protein: 2.8, fat: 0.4, carbs: 7 },
  mixed_veg:       { name: 'Mixed Vegetables',      emoji: '🥗', category: 'veg', kcal: 50,  protein: 2.6, fat: 0.2, carbs: 10 },
  spinach:         { name: 'Spinach',               emoji: '🌿', category: 'veg', kcal: 23,  protein: 2.9, fat: 0.4, carbs: 3.6 },
  asparagus:       { name: 'Asparagus',             emoji: '🌱', category: 'veg', kcal: 20,  protein: 2.2, fat: 0.1, carbs: 3.9 },
  peppers:         { name: 'Bell Peppers',          emoji: '🫑', category: 'veg', kcal: 31,  protein: 1,   fat: 0.3, carbs: 6 },
  zucchini:        { name: 'Zucchini',              emoji: '🥒', category: 'veg', kcal: 17,  protein: 1.2, fat: 0.3, carbs: 3.1 },

  // === DAIRY / LIQUIDS ===
  whole_milk:      { name: 'Whole Milk',            emoji: '🥛', category: 'dairy', kcal: 61,  protein: 3.2, fat: 3.3, carbs: 4.8 },
  semi_milk:       { name: 'Semi-Skimmed Milk',     emoji: '🥛', category: 'dairy', kcal: 46,  protein: 3.4, fat: 1.7, carbs: 5 },

  // === EXTRAS / FATS ===
  olive_oil:       { name: 'Olive Oil',             emoji: '🫒', category: 'extra', kcal: 884, protein: 0,   fat: 100, carbs: 0 },
  butter:          { name: 'Butter',                emoji: '🧈', category: 'extra', kcal: 717, protein: 0.9, fat: 81,  carbs: 0.1 },
  peanut_butter:   { name: 'Peanut Butter',         emoji: '🥜', category: 'extra', kcal: 588, protein: 25,  fat: 50,  carbs: 20 },

  // === FRUIT ===
  blueberries:     { name: 'Blueberries (frozen)',  emoji: '🫐', category: 'fruit', kcal: 57,  protein: 0.7, fat: 0.3, carbs: 14 },
  banana_fruit:    { name: 'Banana',                emoji: '🍌', category: 'fruit', kcal: 89,  protein: 1.1, fat: 0.3, carbs: 23 },
}

function nutrientsFor(id, grams) {
  const f = FOODS[id]
  if (!f) return null
  const scale = grams / 100
  return {
    foodId: id,
    name: f.name,
    emoji: f.emoji,
    category: f.category,
    grams,
    kcal:    Math.round(f.kcal    * scale),
    protein: Math.round(f.protein * scale * 10) / 10,
    fat:     Math.round(f.fat     * scale * 10) / 10,
    carbs:   Math.round(f.carbs   * scale * 10) / 10,
  }
}

module.exports = { FOODS, nutrientsFor }
