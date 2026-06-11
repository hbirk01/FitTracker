import { useState, useEffect } from 'react'
import { getFoods } from '../api'

const PREF_KEY = 'ft_food_prefs'
const DEFAULT = {
  proteins: ['ground_beef', 'chicken_breast', 'eggs'],
  carbs: ['white_rice', 'sweet_potato', 'oats'],
  vegs: ['broccoli', 'mixed_veg', 'spinach'],
}

function loadPrefs() { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || DEFAULT } catch { return DEFAULT } }
function savePrefs(p) { localStorage.setItem(PREF_KEY, JSON.stringify(p)) }

const CATEGORY_MAP = { protein: 'proteins', carb: 'carbs', veg: 'vegs' }
const LABELS = { proteins: 'Proteins', carbs: 'Carbs', vegs: 'Vegetables' }
const MIN_PER_CAT = 1

export default function FoodPrefs({ onChange }) {
  const [allFoods, setAllFoods] = useState([])
  const [prefs, setPrefs] = useState(loadPrefs())
  const [saved, setSaved] = useState(false)

  useEffect(() => { getFoods().then(setAllFoods).catch(console.error) }, [])

  function toggle(food) {
    const key = CATEGORY_MAP[food.category]
    if (!key) return
    const current = prefs[key]
    const isOn = current.includes(food.id)
    if (isOn && current.length <= MIN_PER_CAT) return // need at least 1
    const next = isOn ? current.filter(id => id !== food.id) : [...current, food.id]
    setPrefs(prev => ({ ...prev, [key]: next }))
  }

  function save() {
    savePrefs(prefs)
    // Bust cached plan so it regenerates with new prefs
    localStorage.removeItem('ft_plan_date')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onChange?.()
  }

  const grouped = { proteins: [], carbs: [], vegs: [] }
  allFoods.forEach(f => {
    const key = CATEGORY_MAP[f.category]
    if (key) grouped[key].push(f)
  })

  return (
    <div className="px-4 pb-8 space-y-6">
      <p className="text-xs text-gray-500">
        Select your preferred foods in each category. Your daily plan will rotate through your choices so meals stay varied.
      </p>

      {(['proteins', 'carbs', 'vegs']).map(cat => (
        <div key={cat}>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            {LABELS[cat]} <span className="text-green-500 ml-1">{prefs[cat].length} selected</span>
          </p>
          <div className="space-y-2">
            {grouped[cat].map(food => {
              const on = prefs[cat].includes(food.id)
              return (
                <button
                  key={food.id}
                  onClick={() => toggle(food)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    on
                      ? 'bg-green-500/10 border-green-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-gray-400'
                  }`}
                >
                  <span className="text-2xl">{food.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">{food.name}</p>
                    <p className="text-xs text-gray-600">{food.kcal} kcal/100g · {food.protein}g protein/100g</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    on ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                  }`}>
                    {on && <span className="text-white text-xs">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <button
        onClick={save}
        className={`w-full py-4 rounded-2xl font-semibold text-sm transition-colors ${
          saved ? 'bg-green-700 text-white' : 'bg-green-600 text-white active:bg-green-700'
        }`}
      >
        {saved ? 'Saved! Plan will refresh.' : 'Save Food Preferences'}
      </button>
    </div>
  )
}
