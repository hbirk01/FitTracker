const { generateShoppingList } = require('../backend/planner')

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const { target, mealsPerDay, gymTime, wakeTime, bedTime, days = 7 } = req.body
  if (!target) return res.status(400).json({ error: 'target required' })
  res.json(generateShoppingList({
    target,
    mealsPerDay: mealsPerDay || 5,
    gymTime: gymTime || '18:00',
    wakeTime: wakeTime || '07:00',
    bedTime: bedTime || '23:00',
    days,
  }))
}
