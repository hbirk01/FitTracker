import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Trash2, Check, History, Dumbbell, TrendingUp } from 'lucide-react'

// ── Exercise database ──────────────────────────────────────────────────────────
const EXERCISES = {
  Push: [
    { id: 'bench_press',       name: 'Bench Press',             emoji: '🏋️' },
    { id: 'incline_bench',     name: 'Incline Bench Press',     emoji: '📐' },
    { id: 'decline_bench',     name: 'Decline Bench Press',     emoji: '📉' },
    { id: 'overhead_press',    name: 'Overhead Press',          emoji: '🙌' },
    { id: 'arnold_press',      name: 'Arnold Press',            emoji: '🌀' },
    { id: 'lateral_raise',     name: 'Lateral Raise',           emoji: '🦅' },
    { id: 'front_raise',       name: 'Front Raise',             emoji: '⬆️' },
    { id: 'tricep_pushdown',   name: 'Tricep Pushdown',         emoji: '⬇️' },
    { id: 'skull_crusher',     name: 'Skull Crushers',          emoji: '💀' },
    { id: 'close_grip_bench',  name: 'Close Grip Bench',        emoji: '🤏' },
    { id: 'dips',              name: 'Dips',                    emoji: '💺' },
    { id: 'cable_fly',         name: 'Cable Fly',               emoji: '🦋' },
    { id: 'pec_deck',          name: 'Pec Deck',                emoji: '🦚' },
    { id: 'pushups',           name: 'Push-ups',                emoji: '💥' },
  ],
  Pull: [
    { id: 'deadlift',          name: 'Deadlift',                emoji: '🏗️' },
    { id: 'sumo_deadlift',     name: 'Sumo Deadlift',           emoji: '🦵' },
    { id: 'pullups',           name: 'Pull-ups',                emoji: '🧗' },
    { id: 'chinups',           name: 'Chin-ups',                emoji: '🤸' },
    { id: 'barbell_row',       name: 'Barbell Row',             emoji: '🚣' },
    { id: 'tbar_row',          name: 'T-Bar Row',               emoji: '📏' },
    { id: 'db_row',            name: 'Single Arm DB Row',       emoji: '💼' },
    { id: 'lat_pulldown',      name: 'Lat Pulldown',            emoji: '🪝' },
    { id: 'cable_row',         name: 'Seated Cable Row',        emoji: '🎿' },
    { id: 'straight_arm_pd',   name: 'Straight Arm Pulldown',   emoji: '📌' },
    { id: 'face_pull',         name: 'Face Pull',               emoji: '🎯' },
    { id: 'reverse_fly',       name: 'Reverse Fly',             emoji: '🦜' },
    { id: 'bicep_curl',        name: 'Bicep Curl',              emoji: '💪' },
    { id: 'hammer_curl',       name: 'Hammer Curl',             emoji: '🔨' },
    { id: 'preacher_curl',     name: 'Preacher Curl',           emoji: '🛐' },
    { id: 'cable_curl',        name: 'Cable Curl',              emoji: '🔗' },
  ],
  Legs: [
    { id: 'squat',             name: 'Squat',                   emoji: '🦵' },
    { id: 'rdl',               name: 'Romanian Deadlift',       emoji: '🏋️' },
    { id: 'leg_press',         name: 'Leg Press',               emoji: '🦾' },
    { id: 'hack_squat',        name: 'Hack Squat',              emoji: '⚙️' },
    { id: 'leg_curl',          name: 'Leg Curl',                emoji: '🔁' },
    { id: 'leg_extension',     name: 'Leg Extension',           emoji: '🦿' },
    { id: 'hip_thrust',        name: 'Hip Thrust',              emoji: '🍑' },
    { id: 'split_squat',       name: 'Bulgarian Split Squat',   emoji: '🏅' },
    { id: 'lunges',            name: 'Walking Lunges',          emoji: '🚶' },
    { id: 'glute_kickback',    name: 'Glute Kickback',          emoji: '🔙' },
    { id: 'calf_raise',        name: 'Standing Calf Raise',     emoji: '👟' },
    { id: 'seated_calf',       name: 'Seated Calf Raise',       emoji: '🪑' },
  ],
  Core: [
    { id: 'plank',             name: 'Plank',                   emoji: '🤸' },
    { id: 'ab_wheel',          name: 'Ab Wheel',                emoji: '⚙️' },
    { id: 'leg_raise',         name: 'Hanging Leg Raise',       emoji: '🪢' },
    { id: 'cable_crunch',      name: 'Cable Crunch',            emoji: '📎' },
    { id: 'russian_twist',     name: 'Russian Twist',           emoji: '🌀' },
    { id: 'decline_situp',     name: 'Decline Sit-up',          emoji: '📉' },
    { id: 'pallof_press',      name: 'Pallof Press',            emoji: '🎯' },
    { id: 'dead_bug',          name: 'Dead Bug',                emoji: '🐛' },
  ],
}

// Which categories each workout type surfaces first in the picker
const WORKOUT_TYPES = [
  { id: 'push',      label: 'Push',       cats: ['Push'] },
  { id: 'pull',      label: 'Pull',       cats: ['Pull'] },
  { id: 'legs',      label: 'Legs',       cats: ['Legs', 'Core'] },
  { id: 'upper',     label: 'Upper',      cats: ['Push', 'Pull'] },
  { id: 'lower',     label: 'Lower',      cats: ['Legs', 'Core'] },
  { id: 'full',      label: 'Full Body',  cats: ['Push', 'Pull', 'Legs', 'Core'] },
  { id: 'custom',    label: 'Custom',     cats: ['Push', 'Pull', 'Legs', 'Core'] },
]

const CAT = {
  Push: { text: 'text-orange-400', bg: 'bg-orange-500/10', grad: 'from-orange-500 to-red-500' },
  Pull: { text: 'text-blue-400',   bg: 'bg-blue-500/10',   grad: 'from-blue-500 to-indigo-500' },
  Legs: { text: 'text-green-400',  bg: 'bg-green-500/10',  grad: 'from-green-500 to-emerald-600' },
  Core: { text: 'text-purple-400', bg: 'bg-purple-500/10', grad: 'from-purple-500 to-violet-600' },
}

// ── Persistence ────────────────────────────────────────────────────────────────
const WK_KEY = 'ft_workouts'
function todayStr() { return new Date().toISOString().slice(0, 10) }
function load() { try { return JSON.parse(localStorage.getItem(WK_KEY)) || {} } catch { return {} } }
function persist(s) { localStorage.setItem(WK_KEY, JSON.stringify(s)) }
function blankSet(prev) { return { reps: prev?.reps ?? 8, weight: prev?.weight ?? 0, done: false } }

function fmtDate(str) {
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function WorkoutLog() {
  const [sessions, setSessions] = useState(load)
  const [view, setView] = useState('today')         // 'today' | 'history'
  const [picking, setPicking] = useState(false)
  const [expanded, setExpanded] = useState({})       // exId → bool
  const [histExpanded, setHistExpanded] = useState({}) // dateStr → bool
  const [showProgress, setShowProgress] = useState({}) // exId → bool

  const today = todayStr()
  const session = sessions[today] || { type: 'custom', exercises: [] }

  function saveSession(patch) {
    const next = { ...sessions, [today]: { ...session, ...patch } }
    setSessions(next)
    persist(next)
  }

  function saveExercises(exercises) { saveSession({ exercises }) }

  // ── History helpers ──────────────────────────────────────────────────────────
  function prevSets(exId) {
    const past = Object.keys(sessions).filter(d => d !== today).sort().reverse()
    for (const d of past) {
      const ex = sessions[d]?.exercises?.find(e => e.id === exId)
      if (ex) return ex.sets
    }
    return []
  }

  function prevBest(exId) {
    const past = Object.keys(sessions).filter(d => d !== today).sort().reverse()
    for (const d of past) {
      const ex = sessions[d]?.exercises?.find(e => e.id === exId)
      if (ex?.sets?.length) return ex.sets.reduce((b, s) => s.weight >= b.weight ? s : b, ex.sets[0])
    }
    return null
  }

  // Last N session results for an exercise (for progress view)
  function exHistory(exId, n = 4) {
    return Object.keys(sessions)
      .filter(d => d !== today)
      .sort().reverse()
      .slice(0, 20)
      .reduce((acc, d) => {
        const ex = sessions[d]?.exercises?.find(e => e.id === exId)
        if (ex?.sets?.length) acc.push({ date: d, sets: ex.sets })
        return acc
      }, [])
      .slice(0, n)
  }

  // ── Exercise CRUD ────────────────────────────────────────────────────────────
  function addExercise(ex, cat) {
    if (session.exercises.find(e => e.id === ex.id)) return
    const last = prevSets(ex.id)
    const sets = last.length ? last.map(s => blankSet(s)) : [blankSet(), blankSet(), blankSet()]
    saveExercises([...session.exercises, { id: ex.id, name: ex.name, emoji: ex.emoji, cat, sets }])
    setExpanded(e => ({ ...e, [ex.id]: true }))
    setPicking(false)
  }

  function removeExercise(id) { saveExercises(session.exercises.filter(e => e.id !== id)) }

  function mutateEx(exId, fn) {
    saveExercises(session.exercises.map(e => e.id === exId ? fn(e) : e))
  }

  function addSet(exId) {
    mutateEx(exId, e => ({ ...e, sets: [...e.sets, blankSet(e.sets[e.sets.length - 1])] }))
  }
  function removeSet(exId) {
    mutateEx(exId, e => ({ ...e, sets: e.sets.slice(0, -1) }))
  }
  function updateSet(exId, i, field, val) {
    mutateEx(exId, e => ({ ...e, sets: e.sets.map((s, j) => j === i ? { ...s, [field]: val } : s) }))
  }
  function toggleDone(exId, i) {
    mutateEx(exId, e => ({ ...e, sets: e.sets.map((s, j) => j === i ? { ...s, done: !s.done } : s) }))
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets  = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0)
  const volume    = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.done).reduce((m, s) => m + s.weight * s.reps, 0), 0)
  const addedIds  = new Set(session.exercises.map(e => e.id))

  const histDates = Object.keys(sessions).filter(d => d !== today).sort().reverse()

  const currentType = WORKOUT_TYPES.find(t => t.id === (session.type || 'custom')) || WORKOUT_TYPES[6]
  const pickerCats = currentType.cats

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pb-6 space-y-3">

      {/* View toggle */}
      <div className="flex bg-zinc-800 rounded-2xl p-1 gap-1">
        {[{ id: 'today', label: 'Today', icon: Dumbbell }, { id: 'history', label: 'History', icon: History }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              view === v.id ? 'bg-zinc-700 text-white' : 'text-zinc-500'
            }`}>
            <v.icon size={14} />
            {v.label}
          </button>
        ))}
      </div>

      {/* ── TODAY VIEW ────────────────────────────────────────────────────────── */}
      {view === 'today' && <>

        {/* Workout type selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {WORKOUT_TYPES.map(t => (
            <button key={t.id} onClick={() => saveSession({ type: t.id })}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                session.type === t.id || (!session.type && t.id === 'custom')
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-zinc-700 text-zinc-400 bg-zinc-800'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Summary bar */}
        <div className="bg-zinc-800 rounded-2xl p-4 flex">
          <div className="flex-1 text-center">
            <p className="text-xl font-bold text-white">{session.exercises.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">exercises</p>
          </div>
          <div className="flex-1 text-center border-x border-zinc-700">
            <p className="text-xl font-bold text-white">
              {doneSets}<span className="text-gray-500 text-sm font-normal">/{totalSets}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">sets done</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xl font-bold text-green-400">
              {volume > 0 ? `${(volume / 1000).toFixed(1)}t` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">volume</p>
          </div>
        </div>

        {/* Exercise cards */}
        {session.exercises.map(ex => {
          const c = CAT[ex.cat] || CAT.Push
          const isOpen = expanded[ex.id] !== false
          const best = prevBest(ex.id)
          const done = ex.sets.filter(s => s.done).length
          const hist = exHistory(ex.id)
          const showProg = showProgress[ex.id]

          return (
            <div key={ex.id} className="bg-zinc-800 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {ex.emoji}
                </div>
                <button className="flex-1 text-left min-w-0" onClick={() => setExpanded(e => ({ ...e, [ex.id]: !isOpen }))}>
                  <p className="text-sm font-semibold text-white leading-snug">{ex.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{ex.cat}</span>
                    <span className="text-xs text-gray-600">{done}/{ex.sets.length} sets</span>
                  </div>
                </button>
                {hist.length > 0 && (
                  <button onClick={() => setShowProgress(p => ({ ...p, [ex.id]: !showProg }))}
                    className={`p-1.5 transition-colors ${showProg ? 'text-green-400' : 'text-zinc-600'}`}>
                    <TrendingUp size={14} />
                  </button>
                )}
                <button onClick={() => removeExercise(ex.id)} className="p-1.5 text-zinc-600 active:text-red-400">
                  <Trash2 size={14} />
                </button>
                <button onClick={() => setExpanded(e => ({ ...e, [ex.id]: !isOpen }))} className="p-1.5 text-zinc-600">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Progress history */}
              {showProg && hist.length > 0 && (
                <div className="border-t border-zinc-700 px-4 py-3 bg-zinc-900/50">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent progress</p>
                  <div className="space-y-1.5">
                    {hist.map(h => {
                      const top = h.sets.reduce((b, s) => s.weight >= b.weight ? s : b, h.sets[0])
                      const vol = h.sets.reduce((n, s) => n + s.weight * s.reps, 0)
                      return (
                        <div key={h.date} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{fmtDate(h.date)}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white font-medium">{top.weight}kg × {top.reps}</span>
                            <span className="text-xs text-gray-600">{h.sets.length} sets · {vol.toLocaleString()}kg vol</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Sets */}
              {isOpen && (
                <div className="border-t border-zinc-700 px-4 pt-3 pb-4">
                  {best && (
                    <p className="text-xs text-gray-600 mb-3">
                      Previous best — <span className="text-gray-400 font-medium">{best.weight}kg × {best.reps} reps</span>
                    </p>
                  )}
                  <div className="grid grid-cols-[24px_1fr_1fr_36px] gap-2 px-1 mb-2">
                    <span className="text-xs text-gray-600 text-center">#</span>
                    <span className="text-xs text-gray-600 text-center">Reps</span>
                    <span className="text-xs text-gray-600 text-center">kg</span>
                    <span />
                  </div>
                  <div className="space-y-2">
                    {ex.sets.map((set, i) => (
                      <div key={i} className={`grid grid-cols-[24px_1fr_1fr_36px] gap-2 items-center transition-opacity ${set.done ? 'opacity-40' : ''}`}>
                        <span className="text-xs text-gray-600 text-center font-medium">{i + 1}</span>
                        <input type="number" min="1" value={set.reps}
                          onChange={e => updateSet(ex.id, i, 'reps', +e.target.value)}
                          className="bg-zinc-900 rounded-xl py-2.5 text-center text-sm font-semibold text-white w-full focus:outline-none focus:ring-1 focus:ring-green-500" />
                        <input type="number" min="0" step="0.5" value={set.weight}
                          onChange={e => updateSet(ex.id, i, 'weight', +e.target.value)}
                          className="bg-zinc-900 rounded-xl py-2.5 text-center text-sm font-semibold text-white w-full focus:outline-none focus:ring-1 focus:ring-green-500" />
                        <button onClick={() => toggleDone(ex.id, i)}
                          className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            set.done ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-500 active:bg-green-600 active:text-white'
                          }`}>
                          <Check size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => addSet(ex.id)}
                      className="flex-1 py-2.5 rounded-xl border border-dashed border-zinc-700 text-xs text-gray-500 flex items-center justify-center gap-1.5 active:border-green-500 active:text-green-400 transition-colors">
                      <Plus size={12} /> Add set
                    </button>
                    {ex.sets.length > 1 && (
                      <button onClick={() => removeSet(ex.id)}
                        className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs text-zinc-600 active:text-red-400">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Add exercise */}
        <button onClick={() => setPicking(p => !p)}
          className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            picking ? 'bg-zinc-700 text-gray-400' : 'bg-green-600 text-white active:bg-green-700'
          }`}>
          <Plus size={16} />
          {picking ? 'Cancel' : 'Add Exercise'}
        </button>

        {/* Exercise picker */}
        {picking && (
          <div className="space-y-5 pb-2">
            {/* Show type-relevant cats first, then others collapsed */}
            {[...new Set([...pickerCats, ...Object.keys(EXERCISES)])].map(cat => {
              const list = EXERCISES[cat]
              if (!list) return null
              const c = CAT[cat]
              const isPrimary = pickerCats.includes(cat)
              return (
                <div key={cat}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2.5 ${c.text}`}>
                    {cat}
                    {!isPrimary && <span className="text-zinc-600 font-normal ml-2 normal-case tracking-normal">other</span>}
                  </p>
                  <div className="space-y-2">
                    {list.map(ex => {
                      const isAdded = addedIds.has(ex.id)
                      return (
                        <button key={ex.id} onClick={() => addExercise(ex, cat)} disabled={isAdded}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-colors ${
                            isAdded
                              ? 'border-zinc-800 bg-zinc-800/40 opacity-40 cursor-default'
                              : 'border-zinc-700 bg-zinc-800 active:border-green-500'
                          }`}>
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.grad} flex items-center justify-center text-lg flex-shrink-0`}>
                            {ex.emoji}
                          </div>
                          <span className="text-sm text-white flex-1">{ex.name}</span>
                          {isAdded
                            ? <span className="text-xs text-green-500">✓</span>
                            : <Plus size={14} className="text-zinc-600 flex-shrink-0" />
                          }
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>}

      {/* ── HISTORY VIEW ──────────────────────────────────────────────────────── */}
      {view === 'history' && (
        histDates.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-4xl">📋</p>
              <p className="text-gray-500 text-sm">No past workouts yet</p>
              <p className="text-gray-600 text-xs">Complete today's workout to start your log</p>
            </div>
          )
          : (
            <div className="space-y-3">
              {histDates.map(d => {
                const s = sessions[d]
                if (!s?.exercises?.length) return null
                const isOpen = histExpanded[d]
                const vol = s.exercises.reduce((n, ex) => n + ex.sets.reduce((m, set) => m + set.weight * set.reps, 0), 0)
                const type = WORKOUT_TYPES.find(t => t.id === s.type)
                return (
                  <div key={d} className="bg-zinc-800 rounded-2xl overflow-hidden">
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                      onClick={() => setHistExpanded(e => ({ ...e, [d]: !isOpen }))}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{fmtDate(d)}</p>
                          {type && type.id !== 'custom' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{type.label}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.exercises.length} exercises · {s.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                          {vol > 0 && ` · ${(vol / 1000).toFixed(1)}t volume`}
                        </p>
                      </div>
                      {isOpen ? <ChevronUp size={15} className="text-zinc-600" /> : <ChevronDown size={15} className="text-zinc-600" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-zinc-700 divide-y divide-zinc-700/50">
                        {s.exercises.map(ex => {
                          const c = CAT[ex.cat] || CAT.Push
                          const best = ex.sets.length ? ex.sets.reduce((b, s) => s.weight >= b.weight ? s : b, ex.sets[0]) : null
                          const exVol = ex.sets.reduce((n, s) => n + s.weight * s.reps, 0)
                          return (
                            <div key={ex.id} className="flex items-center gap-3 px-4 py-3">
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-lg flex-shrink-0`}>
                                {ex.emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium">{ex.name}</p>
                                <p className="text-xs text-gray-600">{ex.sets.length} sets{best && best.weight > 0 ? ` · best ${best.weight}kg × ${best.reps}` : ''}</p>
                              </div>
                              {exVol > 0 && <p className="text-xs text-gray-500 flex-shrink-0">{exVol.toLocaleString()}kg</p>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
      )}
    </div>
  )
}
