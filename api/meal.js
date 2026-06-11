import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { RECIPE_TEMPLATES, scaleRecipe } = require('../backend/recipes')

export default (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const { recipeId, targetKcal } = req.body
  if (!targetKcal) return res.status(400).json({ error: 'targetKcal required' })
  const recipe = recipeId
    ? RECIPE_TEMPLATES.find(r => r.id === recipeId)
    : null
  if (recipeId && !recipe) return res.status(404).json({ error: 'recipe not found' })
  res.json(scaleRecipe(recipe || RECIPE_TEMPLATES[0], targetKcal))
}
