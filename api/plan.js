import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { generateDayPlan } = require('../backend/planner')

export default (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const { target, mealsPerDay, gymTime, wakeTime, bedTime, dayIndex = 0 } = req.body
  if (!target) return res.status(400).json({ error: 'target required' })
  res.json(generateDayPlan({
    target,
    mealsPerDay: mealsPerDay || 5,
    gymTime: gymTime || '18:00',
    wakeTime: wakeTime || '07:00',
    bedTime: bedTime || '23:00',
    dayIndex,
  }))
}
