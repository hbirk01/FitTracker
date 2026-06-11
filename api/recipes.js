const { RECIPE_TEMPLATES } = require('../backend/recipes')

module.exports = (req, res) => {
  res.json(RECIPE_TEMPLATES.map(r => ({ id: r.id, name: r.name, emoji: r.emoji, mealTypes: r.mealTypes })))
}
