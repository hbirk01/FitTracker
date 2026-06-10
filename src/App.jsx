import { useState, useEffect, useCallback } from 'react'
import { UtensilsCrossed, CalendarDays, Refrigerator, ShoppingBasket, SlidersHorizontal } from 'lucide-react'
import CalorieRing from './components/CalorieRing'
import FoodSearch from './components/FoodSearch'
import FridgeAI from './components/FridgeAI'
import MealPlan from './components/MealPlan'
import ShoppingList from './components/ShoppingList'
import Settings from './components/Settings'
import { getTodayEntries, removeEntry, calcTarget, calcBMR, getProfile } from './store'

const TABS = [
  { id: 'log', icon: UtensilsCrossed, label: 'Log' },
  { id: 'plan', icon: CalendarDays, label: 'Plan' },
  { id: 'fridge', icon: Refrigerator, label: 'Fridge AI' },
  { id: 'shop', icon: ShoppingBasket, label: 'Shop' },
  { id: 'settings', icon: SlidersHorizontal, label: 'Settings' },
]

export default function App() {
  const [tab, setTab] = useState('log')
  const [entries, setEntries] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [profileVersion, setProfileVersion] = useState(0)
  const profile = getProfile()
  const target = calcTarget(profile)
  const bmr = calcBMR(profile)

  const refresh = useCallback(() => setEntries(getTodayEntries()), [])
  useEffect(() => { refresh() }, [refresh])

  const consumed = entries.reduce((s, e) => s + e.calories, 0)

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <div className="px-4 pt-12 pb-2 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-white">Hey, {profile.name} 👋</h1>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">BMR {bmr.toLocaleString()}</p>
          <p className="text-xs text-green-400 font-medium">Target {target.toLocaleString()} kcal</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {tab === 'log' && (
          <>
            <CalorieRing consumed={consumed} target={target} />
            <div className="px-4 mb-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-full bg-green-600 text-white py-3 rounded-2xl font-medium text-sm active:bg-green-700"
              >
                {showSearch ? 'Close' : '+ Log Food'}
              </button>
            </div>
            {showSearch && <FoodSearch onAdd={() => { refresh(); setShowSearch(false) }} />}
            <div className="px-4 space-y-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Today&apos;s log</p>
              {entries.length === 0 && (
                <p className="text-center text-gray-600 text-sm py-8">Nothing logged yet — start eating! 💪</p>
              )}
              {entries.map(e => (
                <div key={e.id} className="bg-zinc-800 rounded-xl px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white font-medium line-clamp-1">{e.name}</p>
                    <p className="text-xs text-gray-500">{e.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 text-sm font-bold">{e.calories} kcal</span>
                    <button onClick={() => { removeEntry(e.id); refresh() }} className="text-zinc-600 text-xl leading-none active:text-red-400">×</button>
                  </div>
                </div>
              ))}
              {entries.length > 0 && (
                <div className="bg-zinc-900 rounded-xl px-4 py-3 flex justify-between items-center border border-zinc-800">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className={`text-sm font-bold ${consumed >= target ? 'text-red-400' : 'text-green-400'}`}>
                    {consumed.toLocaleString()} / {target.toLocaleString()} kcal
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'plan' && (
          <div className="pt-4">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Meal Schedule</h2>
              <p className="text-xs text-gray-500">Your daily eating plan for {target.toLocaleString()} kcal</p>
            </div>
            <MealPlan calorieTarget={target} />
          </div>
        )}

        {tab === 'fridge' && (
          <div className="pt-4">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Fridge → Meal AI</h2>
              <p className="text-xs text-gray-500">Type what you have, get meal ideas with calorie counts</p>
            </div>
            <FridgeAI onLog={() => { refresh(); setTab('log') }} />
          </div>
        )}

        {tab === 'pantry' && (
          <div className="pt-4">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Pantry</h2>
              <p className="text-xs text-gray-500">Track what&apos;s in your kitchen</p>
            </div>
            <Pantry />
          </div>
        )}

        {tab === 'shop' && (
          <div className="pt-4">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Shopping List</h2>
              <p className="text-xs text-gray-500">What you need to buy</p>
            </div>
            <ShoppingList />
          </div>
        )}

        {tab === 'settings' && (
          <div className="pt-4">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Your Profile</h2>
              <p className="text-xs text-gray-500">Adjust stats, activity, meals, and gym time</p>
            </div>
            <Settings onSave={() => { setProfileVersion(v => v + 1); setTab('plan') }} />
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-zinc-900 border-t border-zinc-800 flex">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors ${tab === id ? 'text-green-400' : 'text-zinc-600'}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
