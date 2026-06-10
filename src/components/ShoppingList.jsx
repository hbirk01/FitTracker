import { useState } from 'react'
import { Plus, Trash2, Check, ShoppingCart } from 'lucide-react'
import { getPlan, getPantry } from '../store'

function useShoppingList() {
  const KEY = 'ft_shopping'
  function get() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
  function save(l) { localStorage.setItem(KEY, JSON.stringify(l)) }
  return { get, save }
}

export default function ShoppingList() {
  const store = useShoppingList()
  const [items, setItems] = useState(store.get)
  const [name, setName] = useState('')

  function update(next) { setItems(next); store.save(next) }
  function add() {
    if (!name.trim()) return
    update([...items, { id: Date.now(), name: name.trim(), done: false }])
    setName('')
  }
  function toggle(id) { update(items.map(i => i.id === id ? { ...i, done: !i.done } : i)) }
  function remove(id) { update(items.filter(i => i.id !== id)) }
  function clearDone() { update(items.filter(i => !i.done)) }

  function generateFromPlan() {
    const plan = getPlan()
    const pantry = getPantry().map(p => p.name.toLowerCase())
    const planNames = plan.map(p => p.name)
    const existing = new Set(items.map(i => i.name.toLowerCase()))

    // Extract meal-based ingredients not already in pantry or list
    const suggestions = planNames
      .filter(n => !pantry.includes(n.toLowerCase()) && !existing.has(n.toLowerCase()))
      .slice(0, 8)
      .map(n => ({ id: Date.now() + Math.random(), name: n, done: false }))

    if (suggestions.length > 0) {
      update([...items, ...suggestions])
    }
  }

  const pending = items.filter(i => !i.done)
  const done = items.filter(i => i.done)

  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="flex gap-2">
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Add item..."
          className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button onClick={add} className="bg-green-600 text-white px-4 py-3 rounded-xl active:bg-green-700">
          <Plus size={16} />
        </button>
      </div>

      <button
        onClick={generateFromPlan}
        className="w-full bg-zinc-800 text-green-400 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 active:bg-zinc-700"
      >
        <ShoppingCart size={14} /> Generate from meal plan
      </button>

      {items.length === 0 && (
        <p className="text-center text-gray-600 text-sm py-6">No items yet — add manually or generate from your plan</p>
      )}

      <div className="space-y-1.5">
        {pending.map(item => (
          <div key={item.id} className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <button onClick={() => toggle(item.id)} className="w-5 h-5 rounded-full border-2 border-zinc-600 flex-shrink-0" />
            <span className="flex-1 text-sm text-white">{item.name}</span>
            <button onClick={() => remove(item.id)} className="text-zinc-600 active:text-red-400"><Trash2 size={14} /></button>
          </div>
        ))}

        {done.length > 0 && (
          <>
            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-gray-500">{done.length} checked off</p>
              <button onClick={clearDone} className="text-xs text-red-400 active:text-red-300">Clear done</button>
            </div>
            {done.map(item => (
              <div key={item.id} className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 opacity-40">
                <button onClick={() => toggle(item.id)} className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" />
                </button>
                <span className="flex-1 text-sm text-gray-400 line-through">{item.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
