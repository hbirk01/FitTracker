import { useState, useEffect } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { getPlan, savePlan } from '../store'

const DEFAULT_SLOTS = [
  { time: '07:30', name: 'Breakfast', calories: 800 },
  { time: '10:30', name: 'Morning snack', calories: 400 },
  { time: '13:00', name: 'Lunch', calories: 900 },
  { time: '16:00', name: 'Pre-workout snack', calories: 350 },
  { time: '19:30', name: 'Dinner', calories: 650 },
]

export default function MealPlan({ calorieTarget }) {
  const [plan, setPlan] = useState([])
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTime, setNewTime] = useState('12:00')
  const [newCal, setNewCal] = useState('')

  useEffect(() => {
    const saved = getPlan()
    if (saved.length === 0) {
      // seed with defaults scaled to their target
      const total = DEFAULT_SLOTS.reduce((s, x) => s + x.calories, 0)
      const scale = calorieTarget / total
      const seeded = DEFAULT_SLOTS.map((s, i) => ({
        id: i + 1,
        name: s.name,
        time: s.time,
        calories: Math.round(s.calories * scale),
        done: false,
      }))
      setPlan(seeded)
      savePlan(seeded)
    } else {
      setPlan(saved)
    }
  }, [calorieTarget])

  function update(newPlan) {
    setPlan(newPlan)
    savePlan(newPlan)
  }

  function toggle(id) {
    update(plan.map(p => p.id === id ? { ...p, done: !p.done } : p))
  }

  function remove(id) {
    update(plan.filter(p => p.id !== id))
  }

  function addSlot() {
    const cal = parseInt(newCal)
    if (!newName || isNaN(cal)) return
    const slot = { id: Date.now(), name: newName, time: newTime, calories: cal, done: false }
    update([...plan, slot].sort((a, b) => a.time.localeCompare(b.time)))
    setNewName('')
    setNewCal('')
    setAdding(false)
  }

  const planned = plan.reduce((s, p) => s + p.calories, 0)

  return (
    <div className="px-4 pb-4 space-y-2">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
        <span>Planned: {planned.toLocaleString()} kcal</span>
        <span className={Math.abs(planned - calorieTarget) < 50 ? 'text-green-400' : 'text-yellow-400'}>
          Target: {calorieTarget.toLocaleString()} kcal
        </span>
      </div>

      {plan.map(slot => (
        <div key={slot.id} className={`bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 ${slot.done ? 'opacity-50' : ''}`}>
          <button
            onClick={() => toggle(slot.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${slot.done ? 'bg-green-500 border-green-500' : 'border-zinc-600'}`}
          >
            {slot.done && <Check size={12} className="text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${slot.done ? 'line-through text-gray-500' : 'text-white'}`}>{slot.name}</p>
            <p className="text-xs text-gray-500">{slot.time}</p>
          </div>
          <span className="text-green-400 text-sm font-bold">{slot.calories}</span>
          <button onClick={() => remove(slot.id)} className="text-zinc-600 active:text-red-400 ml-1">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="bg-zinc-800 rounded-xl px-4 py-3 space-y-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Meal name" className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
          <div className="flex gap-2">
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
            <input type="number" value={newCal} onChange={e => setNewCal(e.target.value)} placeholder="kcal" className="w-20 bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={addSlot} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium">Add</button>
            <button onClick={() => setAdding(false)} className="flex-1 bg-zinc-700 text-white py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full border border-dashed border-zinc-700 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 text-sm active:border-green-500 active:text-green-400"
        >
          <Plus size={16} /> Add meal slot
        </button>
      )}
    </div>
  )
}
