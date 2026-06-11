const { scaleRecipe, pickRecipe } = require('./recipes')
const { FOODS, nutrientsFor } = require('./foods')

function toMins(t) {
  const [h, m] = (t || '00:00').split(':').map(Number)
  return h * 60 + m
}
function toTime(mins) {
  const clamped = Math.max(0, Math.min(1439, mins))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}
function shiftTime(base, delta) { return toTime(toMins(base || '18:00') + delta) }

// Place a meal at `frac` (0–1) within the eating window [wake+60 .. bed-60]
function windowTime(wake, bed, frac) {
  const start = toMins(wake || '07:00') + 60
  const end   = toMins(bed  || '23:00') - 60
  return toTime(start + Math.round(Math.max(0, end - start) * frac))
}

const MEAL_TEMPLATES = {
  2: [
    { name: 'Breakfast', timeFn: (g, w, b) => windowTime(w, b, 0.0),  pct: 0.38 },
    { name: 'Dinner',    timeFn: (g, w, b) => windowTime(w, b, 1.0),  pct: 0.62 },
  ],
  3: [
    { name: 'Breakfast', timeFn: (g, w, b) => windowTime(w, b, 0.0),  pct: 0.25 },
    { name: 'Lunch',     timeFn: (g, w, b) => windowTime(w, b, 0.45), pct: 0.35 },
    { name: 'Dinner',    timeFn: (g, w, b) => windowTime(w, b, 1.0),  pct: 0.40 },
  ],
  4: [
    { name: 'Breakfast',   timeFn: (g, w, b) => windowTime(w, b, 0.0),  pct: 0.20 },
    { name: 'Lunch',       timeFn: (g, w, b) => windowTime(w, b, 0.4),  pct: 0.30 },
    { name: 'Pre-Workout', timeFn: (g, w, b) => shiftTime(g, -90),       pct: 0.13 },
    { name: 'Dinner',      timeFn: (g, w, b) => windowTime(w, b, 1.0),  pct: 0.37 },
  ],
  5: [
    { name: 'Breakfast',     timeFn: (g, w, b) => windowTime(w, b, 0.0),  pct: 0.18 },
    { name: 'Morning Snack', timeFn: (g, w, b) => windowTime(w, b, 0.28), pct: 0.10 },
    { name: 'Lunch',         timeFn: (g, w, b) => windowTime(w, b, 0.50), pct: 0.27 },
    { name: 'Pre-Workout',   timeFn: (g, w, b) => shiftTime(g, -90),       pct: 0.10 },
    { name: 'Dinner',        timeFn: (g, w, b) => windowTime(w, b, 1.0),  pct: 0.35 },
  ],
  6: [
    { name: 'Breakfast',     timeFn: (g, w, b) => windowTime(w, b, 0.0),  pct: 0.15 },
    { name: 'Morning Snack', timeFn: (g, w, b) => windowTime(w, b, 0.22), pct: 0.08 },
    { name: 'Lunch',         timeFn: (g, w, b) => windowTime(w, b, 0.45), pct: 0.25 },
    { name: 'Pre-Workout',   timeFn: (g, w, b) => shiftTime(g, -90),       pct: 0.10 },
    { name: 'Post-Workout',  timeFn: (g, w, b) => shiftTime(g,  60),       pct: 0.17 },
    { name: 'Dinner',        timeFn: (g, w, b) => windowTime(w, b, 1.0),  pct: 0.25 },
  ],
}

const PROTEIN_POWDER_DAILY_CAP = 60 // 2 scoops max per day

function generateDayPlan({ target, mealsPerDay = 5, gymTime = '18:00', wakeTime = '07:00', bedTime = '23:00', dayIndex = 0 }) {
  const templates = MEAL_TEMPLATES[mealsPerDay] || MEAL_TEMPLATES[5]
  let ppUsed = 0 // track grams of protein_powder used today

  return templates.map((tmpl, mealIdx) => {
    const mealKcal = Math.round(target * tmpl.pct)
    const time = tmpl.timeFn(gymTime, wakeTime, bedTime)

    // If we've already hit the daily cap, pick a recipe without protein powder
    const excludeIngredients = ppUsed >= PROTEIN_POWDER_DAILY_CAP ? ['protein_powder'] : []
    const recipe = pickRecipe(tmpl.name, dayIndex, mealIdx, excludeIngredients)

    // Cap protein_powder to whatever budget remains
    const ppRemaining = Math.max(0, PROTEIN_POWDER_DAILY_CAP - ppUsed)
    const maxGrams = { protein_powder: ppRemaining }
    const scaled = scaleRecipe(recipe, mealKcal, maxGrams)

    // Accumulate protein_powder used
    const ppIngredient = scaled?.ingredients?.find(i => i.foodId === 'protein_powder')
    if (ppIngredient) ppUsed += ppIngredient.grams

    return {
      id: `${dayIndex}-${mealIdx}`,
      done: false,
      name: tmpl.name,
      time,
      targetKcal: mealKcal,
      recipe: scaled,
    }
  })
}

// Shopping list: accumulate ingredient totals across N days
function generateShoppingList({ target, mealsPerDay = 5, gymTime = '18:00', wakeTime = '07:00', bedTime = '23:00', days = 7 }) {
  const totals = {}
  for (let d = 0; d < days; d++) {
    const meals = generateDayPlan({ target, mealsPerDay, gymTime, wakeTime, bedTime, dayIndex: d })
    meals.forEach(meal => {
      meal.recipe.ingredients.forEach(ing => {
        if (!totals[ing.foodId]) {
          totals[ing.foodId] = { name: ing.name, emoji: ing.emoji, grams: 0 }
        }
        totals[ing.foodId].grams += ing.grams
      })
    })
  }
  return Object.values(totals)
    .map(t => ({
      ...t,
      display: t.grams >= 1000
        ? `${(t.grams / 1000).toFixed(1)} kg`
        : `${Math.round(t.grams)} g`,
    }))
    .sort((a, b) => b.grams - a.grams)
}

module.exports = { generateDayPlan, generateShoppingList }
