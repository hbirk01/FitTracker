import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Check, X, Plus } from 'lucide-react'
import { getFridgeMeals } from '../api'
import { calcTarget, getProfile, addEntry } from '../store'

export default function FridgeAI({ onLog }) {
  const [input, setInput] = useState('')
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)

  async function suggest() {
    const ingredients = input.split(',').map(s => s.trim()).filter(Boolean)
    if (ingredients.length === 0) return
    setLoading(true); setError(''); setMeals([]); setExpanded(null)
    try {
      const target = calcTarget(getProfile())
      const result = await getFridgeMeals(ingredients, target)
      if (result.demo || result.error) {
        setError(result.error || 'AI not configured on server. Set ANTHROPIC_API_KEY in backend/.env')
        return
      }
      setMeals(result.map(m => ({ ...m, ingredients: [...(m.ingredients || [])] })))
    } catch (e) {
      setError('Server error — make sure the backend is running')
    } finally {
      setLoading(false)
    }
  }

  function update(i, key, val) {
    setMeals(prev => prev.map((m, idx) => idx === i ? { ...m, [key]: val } : m))
  }

  function updateIng(mealIdx, ingIdx, val) {
    setMeals(prev => prev.map((m, i) => {
      if (i !== mealIdx) return m
      const ings = [...m.ingredients]; ings[ingIdx] = val
      return { ...m, ingredients: ings }
    }))
  }

  function removeIng(mealIdx, ingIdx) {
    setMeals(prev => prev.map((m, i) =>
      i !== mealIdx ? m : { ...m, ingredients: m.ingredients.filter((_, j) => j !== ingIdx) }
    ))
  }

  function logMeal(meal) {
    addEntry({ name: meal.name, calories: meal.calories, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    onLog?.()
  }

  return (
    <div className="px-4 pb-6 space-y-3">
      <p className="text-xs text-gray-500">Type what you have in your fridge separated by commas. Claude will suggest meals with exact calorie counts.</p>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="eggs, ground beef, rice, broccoli..."
          className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={e => e.key === 'Enter' && suggest()}
        />
        <button onClick={suggest} disabled={loading}
          className="bg-green-600 text-white px-4 py-3 rounded-xl flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 active:bg-green-700">
          <Sparkles size={14} />
          {loading ? '...' : 'Go'}
        </button>
      </div>

      {error && <p className="text-sm text-yellow-400 bg-yellow-400/10 rounded-xl px-3 py-2">{error}</p>}

      <div className="space-y-3">
        {meals.map((meal, i) => (
          <div key={i} className="bg-zinc-800 rounded-2xl overflow-hidden">
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-left px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{meal.name}</p>
                <p className="text-xs text-gray-500">{meal.mealType} · {meal.protein}g protein</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold text-sm">{meal.calories} kcal</span>
                {expanded === i ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
              </div>
            </button>

            {expanded === i && (
              <div className="border-t border-zinc-700 px-4 pt-3 pb-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-500">Meal name</label>
                  <input value={meal.name} onChange={e => update(i, 'name', e.target.value)} className="input mt-1 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Type</label>
                    <select value={meal.mealType || ''} onChange={e => update(i, 'mealType', e.target.value)} className="input mt-1 text-sm">
                      {['Breakfast','Morning Snack','Lunch','Pre-Workout','Post-Workout','Dinner','Evening Snack'].map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Calories</label>
                    <input type="number" value={meal.calories} onChange={e => update(i, 'calories', +e.target.value)} className="input mt-1 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-2">Ingredients</label>
                  <div className="space-y-1.5">
                    {(meal.ingredients || []).map((ing, j) => (
                      <div key={j} className="flex gap-2">
                        <input value={ing} onChange={e => updateIng(i, j, e.target.value)} className="input flex-1 text-sm" />
                        <button onClick={() => removeIng(i, j)} className="text-zinc-600 active:text-red-400"><X size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => setMeals(prev => prev.map((m, idx) => idx === i ? { ...m, ingredients: [...m.ingredients, ''] } : m))}
                      className="text-xs text-green-400 flex items-center gap-1">
                      <Plus size={12} /> add ingredient
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Instructions</label>
                  <textarea value={meal.instructions || ''} onChange={e => update(i, 'instructions', e.target.value)}
                    rows={2} className="input mt-1 text-sm resize-none" />
                </div>

                <button onClick={() => logMeal(meal)}
                  className="w-full bg-green-600 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 active:bg-green-700">
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
