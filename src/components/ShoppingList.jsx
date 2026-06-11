import { useState, useEffect } from 'react'
import { ShoppingCart, RefreshCw, Check, Plus, Trash2 } from 'lucide-react'
import { getShoppingList } from '../api'
import { getProfile, calcTarget } from '../store'

const KEY = 'ft_shopping_v2'
function loadList() { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }
function saveList(l) { localStorage.setItem(KEY, JSON.stringify(l)) }
function getPrefs() { try { return JSON.parse(localStorage.getItem('ft_food_prefs')) || null } catch { return null } }

export default function ShoppingList() {
  const [items, setItems] = useState(loadList() || [])
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(7)
  const [customName, setCustomName] = useState('')
  const profile = getProfile()

  async function generate() {
    setLoading(true)
    try {
      const target = calcTarget(profile)
      const list = await getShoppingList({
        target,
        mealsPerDay: profile.mealsPerDay || 5,
        gymTime: profile.gymTime || '18:00',
        wakeTime: profile.wakeTime || '07:00',
        bedTime: profile.bedTime || '23:00',
        prefs: getPrefs(),
        days,
      })
      const withDone = list.map(i => ({ ...i, done: false, custom: false }))
      setItems(withDone)
      saveList(withDone)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function toggle(idx) {
    const u = items.map((i, j) => j === idx ? { ...i, done: !i.done } : i)
    setItems(u); saveList(u)
  }

  function remove(idx) {
    const u = items.filter((_, j) => j !== idx)
    setItems(u); saveList(u)
  }

  function addCustom() {
    if (!customName.trim()) return
    const u = [...items, { name: customName.trim(), display: '—', done: false, custom: true, emoji: '📦' }]
    setItems(u); saveList(u)
    setCustomName('')
  }

  const pending = items.filter(i => !i.done)
  const done = items.filter(i => i.done)

  return (
    <div className="px-4 pb-8 space-y-4">
      <div className="bg-zinc-800 rounded-2xl p-4 space-y-3">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Generate list for</p>
        <div className="flex gap-2">
          {[3, 5, 7, 14].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                days === d ? 'bg-green-600 text-white' : 'bg-zinc-700 text-gray-400'
              }`}>
              {d}d
            </button>
          ))}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:bg-green-700"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
          {loading ? 'Calculating...' : `Generate ${days}-day shopping list`}
        </button>
      </div>

      {items.length > 0 && (
        <>
          <div className="space-y-1.5">
            {pending.map((item, idx) => (
              <div key={idx} className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <button onClick={() => toggle(items.indexOf(item))} className="w-6 h-6 rounded-full border-2 border-zinc-600 flex-shrink-0" />
                <span className="text-xl">{item.emoji || '📦'}</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{item.name}</p>
                  {item.display && !item.custom && <p className="text-xs text-gray-500">{item.display}</p>}
                </div>
                <button onClick={() => remove(items.indexOf(item))} className="text-zinc-700 active:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {done.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-600">{done.length} checked off</p>
              {done.map((item, idx) => (
                <div key={idx} className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 opacity-40">
                  <button onClick={() => toggle(items.indexOf(item))} className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" />
                  </button>
                  <span className="text-xl">{item.emoji || '📦'}</span>
                  <p className="text-sm text-gray-400 line-through flex-1">{item.name}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {items.length === 0 && (
        <p className="text-center text-gray-600 text-sm py-8">Hit generate to build your shopping list</p>
      )}

      <div className="flex gap-2 pt-2">
        <input value={customName} onChange={e => setCustomName(e.target.value)}
          placeholder="Add extra item..."
          className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={e => e.key === 'Enter' && addCustom()}
        />
        <button onClick={addCustom} className="bg-zinc-700 text-white px-4 py-3 rounded-xl active:bg-zinc-600">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
