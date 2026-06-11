import { useState, useEffect } from 'react'
import { RefreshCw, Check, ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react'
import { generatePlan } from '../api'
import { getProfile, calcTarget, calcProteinTarget } from '../store'
import { useNotifications } from '../hooks/useNotifications'

const PLAN_KEY = 'ft_today_plan_v2'
const PLAN_DATE_KEY = 'ft_plan_date_v2'

function todayStr() { return new Date().toISOString().slice(0, 10) }
function loadPlan() { try { return JSON.parse(localStorage.getItem(PLAN_KEY)) } catch { return null } }
function savePlan(p) { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); localStorage.setItem(PLAN_DATE_KEY, todayStr()) }
function isStale() { return localStorage.getItem(PLAN_DATE_KEY) !== todayStr() }

export default function TodayPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
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

  async function fetchPlan(dayOffset = 0) {
    setLoading(true)
    setExpanded(null)
    try {
      const data = await generatePlan({
        target,
        mealsPerDay: profile.mealsPerDay || 5,
        gymTime: profile.gymTime || '18:00',
        wakeTime: profile.wakeTime || '07:00',
        bedTime: profile.bedTime || '23:00',
        dayIndex: dayOffset,
      })
      setPlan(data)
      savePlan(data)
    } catch (e) {
      console.error('Plan fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }

  function toggleDone(mealIdx) {
    const updated = plan.map((m, i) => i === mealIdx ? { ...m, done: !m.done } : m)
    setPlan(updated)
    savePlan(updated)
  }

  async function requestNotifications() {
    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
  }

  const consumed = plan ? plan.filter(m => m.done).reduce((s, m) => s + m.recipe.actualKcal, 0) : 0
  const proteinConsumed = plan ? plan.filter(m => m.done).reduce((s, m) => s + m.recipe.protein, 0) : 0
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
        {/* Calories */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">Calories</span>
            <span className="text-white font-semibold">
              {consumed.toLocaleString()} <span className="text-gray-500 font-normal">/ {target.toLocaleString()} kcal</span>
            </span>
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct * 100}%`,
                background: pct >= 1 ? '#ef4444' : 'linear-gradient(90deg, #22c55e, #4ade80)',
              }}
            />
          </div>
        </div>
        {/* Protein */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">Protein</span>
            <span className="text-white font-semibold">
              {Math.round(proteinConsumed)}g{' '}
              <span className="text-gray-500 font-normal">/ {proteinTarget.min}–{proteinTarget.max}g target</span>
            </span>
          </div>
          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${proteinPct * 100}%`,
                background: proteinPct >= 1 ? '#60a5fa' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 pt-0.5">
          <span>{plan.filter(m => m.done).length} of {plan.length} meals done</span>
          <span>{Math.max(0, target - consumed).toLocaleString()} kcal left</span>
        </div>
      </div>

      {/* Notification banner */}
      {notifPerm !== 'granted' && 'Notification' in window && (
        <button
          onClick={requestNotifications}
          className="w-full flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-left"
        >
          <Bell size={18} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Enable meal reminders</p>
            <p className="text-xs text-gray-500">Get notified 15 min before each meal</p>
          </div>
          <span className="text-xs text-yellow-400 font-medium">Turn on</span>
        </button>
      )}

      {notifPerm === 'granted' && (
        <div className="flex items-center gap-2 px-1">
          <Bell size={13} className="text-green-500" />
          <span className="text-xs text-gray-600">Meal reminders are on — you'll get notified 15 min before each meal</span>
        </div>
      )}

      {/* Meal cards */}
      {plan.map((meal, mealIdx) => {
        const r = meal.recipe
        const isOpen = expanded === mealIdx

        return (
          <div
            key={meal.id}
            className={`rounded-2xl overflow-hidden transition-opacity ${meal.done ? 'opacity-55' : ''}`}
          >
            <div className="bg-zinc-800">
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Check circle */}
                <div
                  onClick={() => toggleDone(mealIdx)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                    meal.done ? 'bg-green-500 border-green-500' : 'border-zinc-600 active:border-green-400'
                  }`}
                >
                  {meal.done && <Check size={13} className="text-white" />}
                </div>

                {/* Meal info — tappable to expand */}
                <button
                  onClick={() => setExpanded(isOpen ? null : mealIdx)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-base">{r.emoji}</span>
                    <p className={`text-sm font-semibold ${meal.done ? 'line-through text-gray-500' : 'text-white'}`}>
                      {r.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {meal.name} · {meal.time}
                  </p>
                </button>

                {/* Kcal + chevron */}
                <button
                  onClick={() => setExpanded(isOpen ? null : mealIdx)}
                  className="flex items-center gap-1.5 flex-shrink-0"
                >
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">{r.actualKcal} kcal</p>
                    <p className="text-xs text-gray-600">{r.protein}g protein</p>
                  </div>
                  {isOpen
                    ? <ChevronUp size={14} className="text-gray-600" />
                    : <ChevronDown size={14} className="text-gray-600" />
                  }
                </button>
              </div>

              {/* Expanded recipe detail */}
              {isOpen && (
                <div className="border-t border-zinc-700 px-4 pt-3 pb-4 space-y-4">

                  {/* Ingredients */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ingredients</p>
                    <div className="space-y-1.5">
                      {r.ingredients.map((ing, j) => (
                        <div key={j} className="flex items-center justify-between bg-zinc-900 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{ing.emoji}</span>
                            <div>
                              <p className="text-sm text-white">
                                <span className="font-semibold">{ing.grams}g</span>
                                <span className="text-gray-400 ml-1">{ing.name}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{ing.kcal} kcal</p>
                            <p className="text-xs text-gray-700">{ing.protein}g pro</p>
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

                  {/* Macros summary */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Protein', val: r.protein + 'g', color: 'text-blue-400' },
                      { label: 'Carbs',   val: r.carbs   + 'g', color: 'text-yellow-400' },
                      { label: 'Fat',     val: r.fat     + 'g', color: 'text-orange-400' },
                    ].map(m => (
                      <div key={m.label} className="bg-zinc-900 rounded-xl py-2 text-center">
                        <p className={`text-sm font-bold ${m.color}`}>{m.val}</p>
                        <p className="text-xs text-gray-600">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { toggleDone(mealIdx); setExpanded(null) }}
                    className={`w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      meal.done
                        ? 'bg-zinc-700 text-gray-400'
                        : 'bg-green-600 text-white active:bg-green-700'
                    }`}
                  >
                    <Check size={14} />
                    {meal.done ? 'Mark as not eaten' : 'Mark as eaten'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Regenerate */}
      <button
        onClick={() => fetchPlan(Math.floor(Math.random() * 7))}
        className="w-full border border-dashed border-zinc-700 text-gray-500 text-sm py-3 rounded-2xl flex items-center justify-center gap-2 active:border-green-500 active:text-green-400"
      >
        <RefreshCw size={14} /> Shuffle today&apos;s recipes
      </button>
    </div>
  )
}
