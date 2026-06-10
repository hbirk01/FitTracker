export default function CalorieRing({ consumed, target }) {
  const pct = Math.min(consumed / target, 1)
  const radius = 80
  const stroke = 12
  const circ = 2 * Math.PI * radius
  const dash = pct * circ
  const over = consumed > target

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" className="-rotate-90" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#1e1e1e" strokeWidth={stroke} />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={over ? '#ef4444' : '#22c55e'}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{consumed.toLocaleString()}</span>
          <span className="text-sm text-gray-400">of {target.toLocaleString()} kcal</span>
          <span className={`text-xs mt-1 font-medium ${over ? 'text-red-400' : 'text-green-400'}`}>
            {over ? `+${(consumed - target).toLocaleString()} over` : `${(target - consumed).toLocaleString()} left`}
          </span>
        </div>
      </div>
    </div>
  )
}
