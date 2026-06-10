const USDA_KEY = 'DEMO_KEY' // replace with real key from https://fdc.nal.usda.gov/api-key-signup/

export async function searchFoods(query) {
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_KEY}`
  )
  if (!res.ok) throw new Error('Food search failed')
  const data = await res.json()
  return (data.foods || []).map(f => ({
    fdcId: f.fdcId,
    name: f.description,
    brand: f.brandOwner || '',
    calories: Math.round(
      (f.foodNutrients?.find(n => n.nutrientId === 1008)?.value) || 0
    ),
    unit: '100g',
  }))
}

// Fridge → meal suggestions via Claude (proxied through a simple backend)
// For local dev, this calls a Vite dev proxy or a deployed serverless function
export async function getFridgeMeals(ingredients, targetCalories) {
  const res = await fetch('/api/fridge-meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, targetCalories }),
  })
  if (!res.ok) throw new Error('AI suggestion failed')
  return res.json()
}
