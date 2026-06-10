import { useState } from 'react'
import { searchFoods } from '../api'
import { addEntry } from '../store'

export default function FoodSearch({ onAdd }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customName, setCustomName] = useState('')
  const [customCal, setCustomCal] = useState('')

  async function search(e) {
    e.preventDefault()
    if (!q.trim()) return
    setLoading(true)
    setError('')
    try {
      setResults(await searchFoods(q))
    } catch {
      setError('Search failed — check connection')
    } finally {
      setLoading(false)
    }
  }

  function log(food) {
    addEntry({ name: food.name, calories: food.calories, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    onAdd()
    setResults([])
    setQ('')
  }

  function logCustom() {
    const cal = parseInt(customCal)
    if (!customName || isNaN(cal)) return
    addEntry({ name: customName, calories: cal, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    onAdd()
    setCustomName('')
    setCustomCal('')
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <form onSubmit={search} className="flex gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search food (e.g. chicken breast)"
          className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium active:bg-green-700">
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map(f => (
            <button
              key={f.fdcId}
              onClick={() => log(f)}
              className="w-full text-left bg-zinc-800 rounded-xl px-4 py-3 flex justify-between items-center active:bg-zinc-700"
            >
              <div>
                <p className="text-sm text-white font-medium line-clamp-1">{f.name}</p>
                {f.brand && <p className="text-xs text-gray-500">{f.brand}</p>}
              </div>
              <span className="text-green-400 text-sm font-bold ml-2">{f.calories} kcal</span>
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-zinc-800 pt-3">
        <p className="text-xs text-gray-500 mb-2">Or log manually</p>
        <div className="flex gap-2">
          <input
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Food name"
            className="flex-1 bg-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            value={customCal}
            onChange={e => setCustomCal(e.target.value)}
            placeholder="kcal"
            type="number"
            className="w-20 bg-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={logCustom} className="bg-zinc-700 text-white px-3 py-2.5 rounded-xl text-sm active:bg-zinc-600">
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
