import { useState } from 'react'
import { CalendarDays, Refrigerator, ShoppingBasket, SlidersHorizontal, Utensils, Dumbbell } from 'lucide-react'
import TodayPlan from './components/TodayPlan'
import FridgeAI from './components/FridgeAI'
import ShoppingList from './components/ShoppingList'
import Settings from './components/Settings'
import FoodPrefs from './components/FoodPrefs'
import WorkoutLog from './components/WorkoutLog'
import { calcTarget, calcBMR, calcProteinTarget, getProfile } from './store'

const TABS = [
  { id: 'today',    icon: CalendarDays,       label: 'Today' },
  { id: 'workout',  icon: Dumbbell,           label: 'Workout' },
  { id: 'fridge',   icon: Refrigerator,       label: 'Fridge' },
  { id: 'shop',     icon: ShoppingBasket,     label: 'Shop' },
  { id: 'settings', icon: SlidersHorizontal,  label: 'Settings' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [profileKey, setProfileKey] = useState(0)
  const profile = getProfile()
  const target = calcTarget(profile)
  const bmr = calcBMR(profile)
  const proteinTarget = calcProteinTarget(profile)

  function refreshProfile() { setProfileKey(k => k + 1) }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-white">Hey, {profile.name} 👋</h1>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Protein {proteinTarget.min}–{proteinTarget.max}g/day</p>
          <p className="text-xs text-green-400 font-medium">Target {target.toLocaleString()} kcal</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {tab === 'today' && <TodayPlan key={profileKey} />}

        {tab === 'workout' && (
          <div className="pt-2">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Today's Workout</h2>
              <p className="text-xs text-gray-500">Track sets, reps, and weight — previous bests auto-loaded</p>
            </div>
            <WorkoutLog />
          </div>
        )}

        {tab === 'fridge' && (
          <div className="pt-2">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Fridge → Meal AI</h2>
              <p className="text-xs text-gray-500">Tell us what you have, get meal ideas with exact portions</p>
            </div>
            <FridgeAI />
          </div>
        )}

        {tab === 'shop' && (
          <div className="pt-2">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Shopping List</h2>
              <p className="text-xs text-gray-500">Auto-calculated from your meal plan</p>
            </div>
            <ShoppingList />
          </div>
        )}

        {tab === 'foods' && (
          <div className="pt-2">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Food Preferences</h2>
              <p className="text-xs text-gray-500">Pick your proteins, carbs, and veg — your plan rotates through these</p>
            </div>
            <FoodPrefs onChange={() => { refreshProfile() }} />
          </div>
        )}

        {tab === 'settings' && (
          <div className="pt-2">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-bold text-white">Your Profile</h2>
              <p className="text-xs text-gray-500">Stats, activity level, gym time, meals per day</p>
            </div>
            <Settings onSave={() => { refreshProfile(); setTab('today') }} />
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-zinc-900 border-t border-zinc-800 flex">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors ${tab === id ? 'text-green-400' : 'text-zinc-600'}`}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
