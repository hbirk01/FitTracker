import { useState, useEffect } from 'react'
import { RefreshCw, Check, ChevronDown, ChevronUp, Bell, ArrowLeftRight, Loader2 } from 'lucide-react'
import { generatePlan, getRecipes, scaleMeal } from '../api'
import { getProfile, calcTarget, calcProteinTarget } from '../store'
import { useNotifications } from '../hooks/useNotifications'

const PLAN_KEY = 'ft_today_plan_v3'
const PLAN_DATE_KEY = 'ft_plan_date_v3'

const PORTION_OPTIONS = [
  { label: '½×', value: 0.5 },
  { label: '¾×', value: 0.75 },
  { label: '1×',  value: 1 },
  { label: '1¼×', value: 1.25 },
  { label: '1½×', value: 1.5 },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }
function loadPlan() { try { return JSON.parse(localStorage.getItem(PLAN_KEY)) } catch { return null } }
function savePlan(p) { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); localStorage.setItem(PLAN_DATE_KEY, todayStr()) }
function isStale() { return localStorage.getItem(PLAN_DATE_KEY) !== todayStr() }

function scaled(val, portion) { return Math.round(val * portion * 10) / 10 }

export default function TodayPlan() {
  const [plan, setPlan]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [expanded, setExpanded]   = useState(null)
  const [swapOpen, setSwapOpen]   = useState(null)   // mealIdx with swap panel open
  const [swapping, setSwapping]   = useState(null)   // recipeId being swapped in
  const [allRecipes, setAllRecipes] = useState([])
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  const profile = getProfile()
  const target = calcTarget(profile)
  const proteinTarget = calcProteinTarget(profile)

  useNotifications(plan)

  useEffect(() => {
    const cached = loadPlan()
    if (cached && !isStale()) { setPlan(cached); return }
    fetchPlan()
  }, [])

  useEffect(() => {
    getRecipes().then(setAllRecipes).catch(() => {})
  }, [])

  async function fetchPlan(dayOffset = 0) {
    setLoading(true)
    setExpanded(null)
    setSwapOpen(null)
    try {
      const data = await generatePlan({
        target,
        mealsPerDay: profile.mealsPerDay || 5,
        gymTime: profile.gymTime || '18:00',
        wakeTime: profile.wakeTime || '07:00',
        bedTime: profile.bedTime || '23:00',
        dayIndex: dayOffset,
      })
      // Ensure portionScale defaults
      const withDefaults = data.map(m => ({ ...m, portionScale: 1 }))
      setPlan(withDefaults)
      savePlan(withDefaults)
    } catch (e) {
      console.error('Plan fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }

  function updatePlan(updated) { setPlan(updated); savePlan(updated) }

  // After any done/portion change, spread remaining calorie budget across undone meals
  function redistribute(updatedPlan) {
    const consumed = updatedPlan
      .filter(m => m.done)
      .reduce((s, m) => s + m.recipe.actualKcal * (m.portionScale || 1), 0)
    const remaining = Math.max(0, target - consumed)
    const undone = updatedPlan.filter(m => !m.done)
    const totalUndoneTarget = undone.reduce((s, m) => s + m.targetKcal, 0)
    if (undone.length === 0 || totalUndoneTarget === 0) return updatedPlan
    return updatedPlan.map(m => {
      if (m.done) return m
      const idealKcal = remaining * (m.targetKcal / totalUndoneTarget)
      const newScale = idealKcal / m.recipe.actualKcal
      // Round to nearest 0.05, clamp to sensible range
      const clamped = Math.round(Math.max(0.25, Math.min(2.5, newScale)) * 20) / 20
      return { ...m, portionScale: clamped }
    })
  }

  function toggleDone(mealIdx) {
    const next = plan.map((m, i) => i === mealIdx ? { ...m, done: !m.done } : m)
    updatePlan(redistribute(next))
  }

  function setPortion(mealIdx, value) {
    // Changing portion on an undone meal just previews; on a done meal, redistributes
    const next = plan.map((m, i) => i === mealIdx ? { ...m, portionScale: value } : m)
    const meal = plan[mealIdx]
    updatePlan(meal.done ? redistribute(next) : next)
  }

  async function swapRecipe(mealIdx, recipeId) {
    setSwapping(recipeId)
    try {
      const meal = plan[mealIdx]
      const newRecipe = await scaleMeal(recipeId, meal.targetKcal)
      updatePlan(plan.map((m, i) => i === mealIdx
        ? { ...m, recipe: newRecipe, portionScale: 1, done: false }
        : m
      ))
      setSwapOpen(null)
    } catch (e) {
      console.error('Swap failed:', e)
    } finally {
      setSwapping(null)
    }
  }

  async function requestNotifications() {
    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
  }

  const consumed = plan
    ? plan.filter(m => m.done).reduce((s, m) => s + scaled(m.recipe.actualKcal, m.portionScale || 1), 0)
    : 0
  const proteinConsumed = plan
    ? plan.filter(m => m.done).reduce((s, m) => s + scaled(m.recipe.protein, m.portionScale || 1), 0)
    : 0
  const pct = plan ? Math.min(consumed / target, 1) : 0
  const proteinPct = Math.min(proteinConsumed / proteinTarget.min, 1)

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <RefreshCw size={28} className="text-green-500 animate-spin" />
      <p className="text-gray-400 text-sm">Building your meal plan...</p>
    </div>
  )

  if (!plan) return null

  return (
    <div className="px-4 pb-6 space-y-3">

      {/* Progress summary */}
      <div className="bg-zinc-800 rounded-2xl p-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">Calories</span>
            <span className="text-white font-semibold">
              {Math.round(consumed).toLocaleString()} <span className="text-gray-500 font-normal">/ {target.toLocaleString()} kcal</span>
            </span>
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct * 100}%`, background: pct >= 1 ? '#ef4444' : 'linear-gradient(90deg, #22c55e, #4ade80)' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">Protein</span>
            <span className="text-white font-semibold">
              {Math.round(proteinConsumed)}g{' '}
              <span className="text-gray-500 font-normal">/ {proteinTarget.min}–{proteinTarget.max}g target</span>
            </span>
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${proteinPct * 100}%`, background: proteinPct >= 1 ? '#60a5fa' : 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 pt-0.5">
          <span>{plan.filter(m => m.done).length} of {plan.length} meals done</span>
          <span>{Math.max(0, Math.round(target - consumed)).toLocaleString()} kcal left</span>
        </div>
      </div>

      {/* Notification banner */}
      {notifPerm !== 'granted' && 'Notification' in window && (
        <button onClick={requestNotifications}
          className="w-full flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-left">
          <Bell size={18} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Enable meal reminders</p>
            <p className="text-xs text-gray-500">Get notified 15 min before each meal</p>
          </div>
          <span className="text-xs text-yellow-400 font-medium">Turn on</span>
        </button>
      )}

      {/* Meal cards */}
      {plan.map((meal, mealIdx) => {
        const r = meal.recipe
        const portion = meal.portionScale || 1
        const isOpen = expanded === mealIdx
        const isSwapOpen = swapOpen === mealIdx

        const displayKcal    = Math.round(r.actualKcal * portion)
        const displayProtein = scaled(r.protein, portion)
        const displayCarbs   = scaled(r.carbs, portion)
        const displayFat     = scaled(r.fat, portion)

        // Recipes available to swap into this slot
        const swapOptions = allRecipes.filter(
          rec => rec.mealTypes.includes(meal.name) && rec.id !== r.recipeId
        )

        return (
          <div key={meal.id} className={`rounded-2xl overflow-hidden transition-opacity ${meal.done ? 'opacity-55' : ''}`}>
            <div className="bg-zinc-800">

              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div onClick={() => toggleDone(mealIdx)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                    meal.done ? 'bg-green-500 border-green-500' : 'border-zinc-600 active:border-green-400'
                  }`}>
                  {meal.done && <Check size={13} className="text-white" />}
                </div>

                <button onClick={() => { setExpanded(isOpen ? null : mealIdx); setSwapOpen(null) }}
                  className="flex-1 text-left min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base">{r.emoji}</span>
                    <p className={`text-sm font-semibold ${meal.done ? 'line-through text-gray-500' : 'text-white'}`}>
                      {r.name}
                    </p>
                    {portion !== 1 && (
                      <span className="text-xs text-amber-400 font-medium">{portion}×</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{meal.name} · {meal.time}</p>
                </button>

                {/* Swap button */}
                <button onClick={() => { setSwapOpen(isSwapOpen ? null : mealIdx); setExpanded(null) }}
                  className={`p-1.5 transition-colors ${isSwapOpen ? 'text-green-400' : 'text-zinc-600'}`}>
                  <ArrowLeftRight size={14} />
                </button>

                <button onClick={() => { setExpanded(isOpen ? null : mealIdx); setSwapOpen(null) }}
                  className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">{displayKcal} kcal</p>
                    <p className="text-xs text-gray-600">{displayProtein}g protein</p>
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
                </button>
              </div>

              {/* Swap panel */}
              {isSwapOpen && (
                <div className="border-t border-zinc-700 px-4 pt-3 pb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2.5">Swap this meal</p>
                  {swapOptions.length === 0
                    ? <p className="text-xs text-gray-600">No alternatives for this slot</p>
                    : (
                      <div className="space-y-2">
                        {swapOptions.map(rec => (
                          <button key={rec.id} onClick={() => swapRecipe(mealIdx, rec.id)} disabled={!!swapping}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-left active:border-green-500 transition-colors">
                            <span className="text-xl flex-shrink-0">{rec.emoji}</span>
                            <span className="text-sm text-white flex-1">{rec.name}</span>
                            {swapping === rec.id
                              ? <Loader2 size={14} className="text-green-400 animate-spin flex-shrink-0" />
                              : <ArrowLeftRight size={13} className="text-zinc-600 flex-shrink-0" />
                            }
                          </button>
                        ))}
                      </div>
                    )
                  }
                </div>
              )}

              {/* Expanded recipe detail */}
              {isOpen && (
                <div className="border-t border-zinc-700 px-4 pt-3 pb-4 space-y-4">

                  {/* Portion controls */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Portion</p>
                    <div className="flex gap-2">
                      {PORTION_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => setPortion(mealIdx, opt.value)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            portion === opt.value
                              ? 'bg-green-600 text-white'
                              : 'bg-zinc-900 text-gray-400 active:bg-zinc-700'
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ingredients</p>
                    <div className="space-y-1.5">
                      {r.ingredients.map((ing, j) => (
                        <div key={j} className="flex items-center justify-between bg-zinc-900 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{ing.emoji}</span>
                            <p className="text-sm text-white">
                              <span className="font-semibold">{Math.round(ing.grams * portion)}g</span>
                              <span className="text-gray-400 ml-1">{ing.name}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{Math.round(ing.kcal * portion)} kcal</p>
                            <p className="text-xs text-gray-700">{scaled(ing.protein, portion)}g pro</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">How to make it</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{r.instructions}</p>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Protein', val: displayProtein + 'g', color: 'text-blue-400' },
                      { label: 'Carbs',   val: displayCarbs   + 'g', color: 'text-yellow-400' },
                      { label: 'Fat',     val: displayFat     + 'g', color: 'text-orange-400' },
                    ].map(m => (
                      <div key={m.label} className="bg-zinc-900 rounded-xl py-2 text-center">
                        <p className={`text-sm font-bold ${m.color}`}>{m.val}</p>
                        <p className="text-xs text-gray-600">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => { toggleDone(mealIdx); setExpanded(null) }}
                    className={`w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      meal.done ? 'bg-zinc-700 text-gray-400' : 'bg-green-600 text-white active:bg-green-700'
                    }`}>
                    <Check size={14} />
                    {meal.done ? 'Mark as not eaten' : 'Mark as eaten'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Shuffle */}
      <button onClick={() => fetchPlan(Math.floor(Math.random() * 7))}
        className="w-full border border-dashed border-zinc-700 text-gray-500 text-sm py-3 rounded-2xl flex items-center justify-center gap-2 active:border-green-500 active:text-green-400">
        <RefreshCw size={14} /> Shuffle today&apos;s recipes
      </button>
    </div>
  )
}
