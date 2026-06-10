import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getPantry, savePantry } from '../store'

export default function Pantry() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [cal, setCal] = useState('')

  useEffect(() => { setItems(getPantry()) }, [])

  function update(next) { setItems(next); savePantry(next) }

  function add() {
    if (!name.trim()) return
    update([...items, { id: Date.now(), name: name.trim(), calories: parseInt(cal) || 0 }])
    setName('')
    setCal('')
  }

  function remove(id) { update(items.filter(i => i.id !== id)) }

  return (
    <div className="px-4 pb-4 space-y-2">
      <p className="text-xs text-gray-500 mb-2">{items.length} item{items.length !== 1 ? 's' : ''} in pantry</p>

      <div className="flex gap-2">
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Item name (e.g. eggs)"
          className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <input
          value={cal} onChange={e => setCal(e.target.value)}
          placeholder="kcal"
          type="number"
          className="w-20 bg-zinc-800 rounded-xl px-3 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
        />
        <button onClick={add} className="bg-green-600 text-white px-4 py-3 rounded-xl active:bg-green-700">
          <Plus size={16} />
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-600 text-sm py-6">Your pantry is empty — add items above</p>
      )}

      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.id} className="bg-zinc-800 rounded-xl px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm text-white">{item.name}</p>
              {item.calories > 0 && <p className="text-xs text-gray-500">{item.calories} kcal/100g</p>}
            </div>
            <button onClick={() => remove(item.id)} className="text-zinc-600 active:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
