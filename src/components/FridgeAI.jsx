import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react'
import { calcTarget, getProfile, addEntry } from '../store'

export default function FridgeAI({ onLog }) {
  const [items, setItems] = useState('')
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing] = useState(null) // { index, field }

  async function suggest() {
    if (!items.trim()) return
    setLoading(true)
    setError('')
    setMeals([])
    setExpanded(null)
    try {
      const profile = getProfile()
      const target = calcTarget(profile)
      const apiKey = import.meta.env.VITE_CLAUDE_KEY

      if (!apiKey) {
        setMeals(demoMeals(items.split(',').map(s => s.trim()), target))
        return
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 900,
          messages: [{
            role: 'user',
            content: `I'm trying to hit ${target} calories today for lean muscle gain. I have these ingredients: ${items}. Give me exactly 3 meal ideas. Respond ONLY with a valid JSON array, no markdown:
[{"name":"Meal Name","calories":450,"time":"Breakfast","ingredients":["item1","item2"],"instructions":"One concise prep sentence."}]`,
          }],
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setMeals(JSON.parse(data.content[0].text))
    } catch {
      setError('Could not get suggestions. Add VITE_CLAUDE_KEY to .env for AI mode.')
      setMeals(demoMeals(items.split(',').map(s => s.trim()), calcTarget(getProfile())))
    } finally {
      setLoading(false)
    }
  }

  function updateMeal(i, field, value) {
    setMeals(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  function updateIngredient(mealIdx, ingIdx, value) {
    setMeals(prev => prev.map((m, i) => {
      if (i !== mealIdx) return m
      const ings = [...m.ingredients]
      ings[ingIdx] = value
      return { ...m, ingredients: ings }
    }))
  }

  function removeIngredient(mealIdx, ingIdx) {
    setMeals(prev => prev.map((m, i) => {
      if (i !== mealIdx) return m
      return { ...m, ingredients: m.ingredients.filter((_, j) => j !== ingIdx) }
    }))
  }

  function addIngredient(mealIdx) {
    setMeals(prev => prev.map((m, i) =>
      i === mealIdx ? { ...m, ingredients: [...m.ingredients, ''] } : m
    ))
  }

  function logMeal(meal) {
    addEntry({
      name: meal.name,
      calories: meal.calories,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    onLog()
  }

  const apiKey = import.meta.env.VITE_CLAUDE_KEY

  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="flex gap-2">
        <input
          value={items}
          onChange={e => setItems(e.target.value)}
          placeholder="eggs, spinach, chicken, rice..."
          className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={e => e.key === 'Enter' && suggest()}
        />
        <button
          onClick={suggest}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium active:bg-green-700 flex items-center gap-1 disabled:opacity-50"
        >
          <Sparkles size={14} />
          {loading ? '...' : 'Go'}
        </button>
      </div>

      {!apiKey && (
        <p className="text-xs text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-2">
          Demo mode — add <code className="font-mono">VITE_CLAUDE_KEY</code> to .env for real AI suggestions
        </p>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="space-y-3">
        {meals.map((meal, i) => (
          <div key={i} className="bg-zinc-800 rounded-2xl overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-left px-4 py-3 flex justify-between items-center"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold">{meal.name}</p>
                <p className="text-xs text-gray-500">{meal.time}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold text-sm">{meal.calories} kcal</span>
                {expanded === i
                  ? <ChevronUp size={16} className="text-gray-500" />
                  : <ChevronDown size={16} className="text-gray-500" />
                }
              </div>
            </button>

            {/* Expanded editable body */}
            {expanded === i && (
              <div className="border-t border-zinc-700 px-4 pb-4 pt-3 space-y-4">

                {/* Editable name */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Meal name</p>
                  <input
                    value={meal.name}
                    onChange={e => updateMeal(i, 'name', e.target.value)}
                    className="input text-sm"
                  />
                </div>

                {/* Editable meal time slot */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Meal type</p>
                    <select
                      value={meal.time}
                      onChange={e => updateMeal(i, 'time', e.target.value)}
                      className="input text-sm"
                    >
                      {['Breakfast','Morning snack','Lunch','Pre-workout snack','Post-workout','Dinner','Evening snack'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Calories</p>
                    <input
                      type="number"
                      value={meal.calories}
                      onChange={e => updateMeal(i, 'calories', +e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                </div>

                {/* Editable ingredients */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Ingredients</p>
                  <div className="space-y-1.5">
                    {(meal.ingredients || []).map((ing, j) => (
                      <div key={j} className="flex gap-2 items-center">
                        <input
                          value={ing}
                          onChange={e => updateIngredient(i, j, e.target.value)}
                          className="input text-sm flex-1"
                        />
                        <button
                          onClick={() => removeIngredient(i, j)}
                          className="text-zinc-600 active:text-red-400 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addIngredient(i)}
                      className="text-xs text-green-400 active:text-green-300"
                    >
                      + add ingredient
                    </button>
                  </div>
                </div>

                {/* Editable instructions */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Instructions</p>
                  <textarea
                    value={meal.instructions || ''}
                    onChange={e => updateMeal(i, 'instructions', e.target.value)}
                    rows={2}
                    className="input text-sm resize-none"
                  />
                </div>

                <button
                  onClick={() => logMeal(meal)}
                  className="w-full bg-green-600 text-white rounded-xl py-3 text-sm font-semibold active:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Log {meal.calories} kcal
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function demoMeals(ings, target) {
  const perMeal = Math.round(target / 3)
  return [
    {
      name: 'Scrambled Eggs & Toast',
      calories: Math.round(perMeal * 0.85),
      time: 'Breakfast',
      ingredients: ['3 eggs', 'butter', '2 slices bread'],
      instructions: 'Scramble eggs in butter over medium heat, serve on toasted bread.',
    },
    {
      name: 'Chicken Rice Bowl',
      calories: perMeal,
      time: 'Lunch',
      ingredients: ['150g chicken breast', '1 cup rice', 'soy sauce', 'sesame oil'],
      instructions: 'Grill chicken, slice over steamed rice, drizzle with soy sauce and sesame oil.',
    },
    {
      name: ings.length > 0 ? `${ings[0]} Stir Fry` : 'Veggie Omelette',
      calories: Math.round(perMeal * 0.9),
      time: 'Dinner',
      ingredients: ings.slice(0, 4).concat(['olive oil', 'salt', 'pepper']),
      instructions: 'Sauté ingredients in olive oil over high heat for 5–7 minutes, season to taste.',
    },
  ]
}
