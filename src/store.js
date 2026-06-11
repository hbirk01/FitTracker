// Persisted state via localStorage
const PROFILE_KEY = 'ft_profile'
const LOG_KEY = 'ft_log'
const PANTRY_KEY = 'ft_pantry'
const MEALS_KEY = 'ft_meals'
const PLAN_KEY = 'ft_plan'

export const DEFAULT_PROFILE = {
  name: 'Harvin',
  age: 24,
  weightKg: 65.77,
  heightCm: 172.72,
  sex: 'male',
  activityMultiplier: 1.725,
  surplus: 300,
  mealsPerDay: 5,
  gymTime: '18:00',
  wakeTime: '07:00',
  bedTime: '23:00',
}

// Protein target: 1.6–2.2 g/kg/day (Morton et al. BJSM 2018, PMC5867436)
export function calcProteinTarget(p) {
  return { min: Math.round(p.weightKg * 1.6), max: Math.round(p.weightKg * 2.2) }
}

export function calcBMR(p) {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return Math.round(p.sex === 'male' ? base + 5 : base - 161)
}

export function calcTarget(p) {
  return Math.round(calcBMR(p) * p.activityMultiplier + p.surplus)
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
}

// log: { [dateStr]: [{ id, name, calories, time }] }
export function getLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || {} } catch { return {} }
}

export function saveLog(log) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function getTodayEntries() {
  return getLog()[todayStr()] || []
}

export function addEntry(entry) {
  const log = getLog()
  const d = todayStr()
  if (!log[d]) log[d] = []
  log[d].push({ ...entry, id: Date.now() })
  saveLog(log)
}

export function removeEntry(id) {
  const log = getLog()
  const d = todayStr()
  if (log[d]) log[d] = log[d].filter(e => e.id !== id)
  saveLog(log)
}

// pantry: [{ id, name, calories, unit }]
export function getPantry() {
  try { return JSON.parse(localStorage.getItem(PANTRY_KEY)) || [] } catch { return [] }
}

export function savePantry(items) {
  localStorage.setItem(PANTRY_KEY, JSON.stringify(items))
}

// saved meals: [{ id, name, calories, foods }]
export function getMeals() {
  try { return JSON.parse(localStorage.getItem(MEALS_KEY)) || [] } catch { return [] }
}

export function saveMeals(meals) {
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals))
}

// meal plan: [{ id, mealId|null, name, calories, time, done }]
export function getPlan() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || [] } catch { return [] }
}

export function savePlan(plan) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan))
}
