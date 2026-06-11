import { useState } from 'react'
import { Save, ChevronDown } from 'lucide-react'
import { getProfile, saveProfile, calcBMR, calcTarget, savePlan } from '../store'

const ACTIVITY_OPTIONS = [
  { label: 'Sedentary',         description: 'Desk job, little exercise',           multiplier: 1.2 },
  { label: 'Lightly active',    description: '1–3 days/week light exercise',         multiplier: 1.375 },
  { label: 'Moderately active', description: '3–5 days/week moderate training',      multiplier: 1.55 },
  { label: 'Very active',       description: '6–7 days/week hard training',          multiplier: 1.725 },
  { label: 'Super active',      description: 'Physical job + twice-daily training',  multiplier: 1.9 },
]

const MEAL_TEMPLATES = {
  2: [
    { time: '08:00', name: 'Breakfast', pct: 0.45 },
    { time: '18:00', name: 'Dinner', pct: 0.55 },
  ],
  3: [
    { time: '07:30', name: 'Breakfast', pct: 0.30 },
    { time: '13:00', name: 'Lunch', pct: 0.35 },
    { time: '19:00', name: 'Dinner', pct: 0.35 },
  ],
  4: [
    { time: '07:30', name: 'Breakfast', pct: 0.25 },
    { time: '12:00', name: 'Lunch', pct: 0.30 },
    { time: '16:00', name: 'Snack', pct: 0.15 },
    { time: '19:30', name: 'Dinner', pct: 0.30 },
  ],
  5: [
    { time: '07:30', name: 'Breakfast', pct: 0.22 },
    { time: '10:30', name: 'Morning snack', pct: 0.13 },
    { time: '13:00', name: 'Lunch', pct: 0.29 },
    { time: '16:00', name: 'Pre-workout snack', pct: 0.11 },
    { time: '19:30', name: 'Dinner', pct: 0.25 },
  ],
  6: [
    { time: '07:00', name: 'Breakfast', pct: 0.18 },
    { time: '09:30', name: 'Morning snack', pct: 0.10 },
    { time: '12:30', name: 'Lunch', pct: 0.25 },
    { time: '15:30', name: 'Pre-workout snack', pct: 0.12 },
    { time: '18:30', name: 'Post-workout meal', pct: 0.25 },
    { time: '21:00', name: 'Evening snack', pct: 0.10 },
  ],
}

function regeneratePlan(target, mealsPerDay, gymTime) {
  const templates = MEAL_TEMPLATES[mealsPerDay] || MEAL_TEMPLATES[5]
  return templates.map((t, i) => {
    let time = t.time
    // Shift pre-workout slot to 90min before gym time
    if (t.name.toLowerCase().includes('pre-workout') && gymTime) {
      const [h, m] = gymTime.split(':').map(Number)
      const pre = new Date(0, 0, 0, h, m - 90)
      time = `${String(pre.getHours()).padStart(2, '0')}:${String(pre.getMinutes()).padStart(2, '0')}`
    }
    if (t.name.toLowerCase().includes('post-workout') && gymTime) {
      const [h, m] = gymTime.split(':').map(Number)
      const post = new Date(0, 0, 0, h, m + 60)
      time = `${String(post.getHours()).padStart(2, '0')}:${String(post.getMinutes()).padStart(2, '0')}`
    }
    return { id: i + 1, name: t.name, time, calories: Math.round(target * t.pct), done: false }
  })
}

export { regeneratePlan }

export default function Settings({ onSave }) {
  const [p, setP] = useState(getProfile())
  const [saved, setSaved] = useState(false)

  const bmr = calcBMR(p)
  const target = calcTarget(p)

  function set(key, val) { setP(prev => ({ ...prev, [key]: val })) }

  function handleSave() {
    saveProfile(p)
    const newPlan = regeneratePlan(target, p.mealsPerDay || 5, p.gymTime || '18:00')
    savePlan(newPlan)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSave()
  }

  const activityIdx = ACTIVITY_OPTIONS.findIndex(a => Math.abs(a.multiplier - p.activityMultiplier) < 0.01)

  return (
    <div className="px-4 pb-8 space-y-5">
      {/* Live preview */}
      <div className="bg-zinc-800 rounded-2xl p-4 flex justify-between">
        <div className="text-center">
          <p className="text-xs text-gray-500">BMR</p>
          <p className="text-lg font-bold text-white">{bmr.toLocaleString()}</p>
          <p className="text-xs text-gray-500">kcal</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">TDEE</p>
          <p className="text-lg font-bold text-white">{Math.round(bmr * p.activityMultiplier).toLocaleString()}</p>
          <p className="text-xs text-gray-500">kcal</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Target</p>
          <p className="text-lg font-bold text-green-400">{target.toLocaleString()}</p>
          <p className="text-xs text-gray-500">kcal</p>
        </div>
      </div>

      <Section title="Personal Info">
        <Field label="Name">
          <input value={p.name} onChange={e => set('name', e.target.value)}
            className="input" placeholder="Your name" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age">
            <input type="number" value={p.age} onChange={e => set('age', +e.target.value)}
              className="input" />
          </Field>
          <Field label="Sex">
            <select value={p.sex} onChange={e => set('sex', e.target.value)} className="input">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Weight (kg)">
            <input type="number" step="0.1" value={p.weightKg} onChange={e => set('weightKg', +e.target.value)}
              className="input" />
          </Field>
          <Field label="Height (cm)">
            <input type="number" value={p.heightCm} onChange={e => set('heightCm', +e.target.value)}
              className="input" />
          </Field>
        </div>
      </Section>

      <Section title="Activity & Goal">
        <Field label="Activity level">
          <div className="space-y-2">
            {ACTIVITY_OPTIONS.map((a, i) => (
              <button key={i} onClick={() => set('activityMultiplier', a.multiplier)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  Math.abs(p.activityMultiplier - a.multiplier) < 0.01
                    ? 'border-green-500 bg-green-500/10 text-white'
                    : 'border-zinc-700 bg-zinc-800 text-gray-300'
                }`}>
                <span className="font-medium">{a.label}</span>
                <span className="text-gray-500 text-xs ml-2">{a.description}</span>
              </button>
            ))}
          </div>
        </Field>

        <p className="text-xs text-gray-600 -mt-1 px-1">
          These are estimates (±10–15% individual variation). Track your weight for 2–3 weeks and adjust your target by ±100 kcal if not trending as expected.
        </p>

        <Field label={`Calorie surplus: +${p.surplus} kcal`}>
          <input type="range" min="0" max="600" step="50" value={p.surplus}
            onChange={e => set('surplus', +e.target.value)}
            className="w-full accent-green-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Maintain</span><span>Lean bulk</span><span>Bulk</span>
          </div>
        </Field>
      </Section>

      <Section title="Gym & Meal Schedule">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wake up">
            <input type="time" value={p.wakeTime || '07:00'} onChange={e => set('wakeTime', e.target.value)}
              className="input" />
          </Field>
          <Field label="Bedtime">
            <input type="time" value={p.bedTime || '23:00'} onChange={e => set('bedTime', e.target.value)}
              className="input" />
          </Field>
        </div>

        <Field label="Gym time">
          <input type="time" value={p.gymTime || '18:00'} onChange={e => set('gymTime', e.target.value)}
            className="input" />
          <p className="text-xs text-gray-600 mt-1">Pre/post-workout meals adjust automatically around this time</p>
        </Field>

        <Field label={`Meals per day: ${p.mealsPerDay || 5}`}>
          <input type="range" min="2" max="6" step="1" value={p.mealsPerDay || 5}
            onChange={e => set('mealsPerDay', +e.target.value)}
            className="w-full accent-green-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Saving will regenerate your meal plan with {p.mealsPerDay || 5} meals totalling {target.toLocaleString()} kcal
          </p>
        </Field>
      </Section>

      <button onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
          saved ? 'bg-green-700 text-white' : 'bg-green-600 text-white active:bg-green-700'
        }`}>
        <Save size={16} />
        {saved ? 'Saved! Meal plan updated.' : 'Save & Regenerate Plan'}
      </button>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-400">{label}</label>
      {children}
    </div>
  )
}
