import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { RECIPE_TEMPLATES } = require('../backend/recipes')

export default (req, res) => {
  const { mealType } = req.query
  const list = RECIPE_TEMPLATES.map(r => ({
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    mealTypes: r.mealTypes,
  }))
  res.json(mealType ? list.filter(r => r.mealTypes.includes(mealType)) : list)
}
