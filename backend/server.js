require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Anthropic = require('@anthropic-ai/sdk')
const { FOODS } = require('./foods')
const { RECIPE_TEMPLATES } = require('./recipes')
const { generateDayPlan, generateShoppingList } = require('./planner')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

// ── Foods ──────────────────────────────────────────────────
app.get('/api/foods', (req, res) => {
  const { category } = req.query
  const list = Object.entries(FOODS).map(([id, f]) => ({ id, ...f }))
  res.json(category ? list.filter(f => f.category === category) : list)
})

// ── Recipes ────────────────────────────────────────────────
app.get('/api/recipes', (req, res) => {
  res.json(RECIPE_TEMPLATES.map(r => ({ id: r.id, name: r.name, emoji: r.emoji, mealTypes: r.mealTypes })))
})

// ── Daily plan ─────────────────────────────────────────────
app.post('/api/plan', (req, res) => {
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
})

// ── Shopping list ──────────────────────────────────────────
app.post('/api/shopping', (req, res) => {
  const { target, mealsPerDay, gymTime, wakeTime, bedTime, days = 7 } = req.body
  if (!target) return res.status(400).json({ error: 'target required' })
  res.json(generateShoppingList({ target, mealsPerDay, gymTime, wakeTime: wakeTime || '07:00', bedTime: bedTime || '23:00', days }))
})

// ── Fridge AI ──────────────────────────────────────────────
app.post('/api/fridge', async (req, res) => {
  const { ingredients, target } = req.body
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(501).json({ error: 'ANTHROPIC_API_KEY not set in backend/.env', demo: true })
  }
  try {
    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `I need to eat ${target} calories today for lean muscle gain. I have: ${ingredients.join(', ')}.
Give me exactly 3 complete recipe ideas using these ingredients. Each should read like a real meal, not a list of raw ingredients.
Respond ONLY with a valid JSON array, no markdown:
[{"name":"Recipe Name","emoji":"🍳","calories":520,"protein":42,"mealType":"Breakfast","ingredients":["3 eggs","200ml whole milk","50g oats"],"instructions":"Two clear sentences on how to prepare it."}]`,
      }],
    })
    res.json(JSON.parse(msg.content[0].text))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(PORT, () => console.log(`FitTracker backend running on :${PORT}`))
