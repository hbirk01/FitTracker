const BASE = '/api'

async function post(path, body) {
  const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function get(path) {
  const r = await fetch(BASE + path)
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export const getFoods = (category) => get(`/foods${category ? `?category=${category}` : ''}`)
export const getRecipes = (mealType) => get(`/recipes${mealType ? `?mealType=${encodeURIComponent(mealType)}` : ''}`)
export const scaleMeal = (recipeId, targetKcal) => post('/meal', { recipeId, targetKcal })
export const generatePlan = (opts) => post('/plan', opts)
export const getShoppingList = (opts) => post('/shopping', opts)
export const getFridgeMeals = (ingredients, target) => post('/fridge', { ingredients, target })
