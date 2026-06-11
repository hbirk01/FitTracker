import { useEffect, useRef } from 'react'

export function useNotifications(plan) {
  const timersRef = useRef([])

  useEffect(() => {
    // Clear old timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    if (!plan || plan.length === 0) return
    if (!('Notification' in window)) return

    async function schedule() {
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }
      if (permission !== 'granted') return

      const now = new Date()

      plan.forEach(meal => {
        if (meal.done) return
        const [h, m] = meal.time.split(':').map(Number)
        const mealTime = new Date()
        mealTime.setHours(h, m, 0, 0)

        // Also fire a 15-min warning
        const warnTime = new Date(mealTime.getTime() - 15 * 60 * 1000)

        const msUntilMeal = mealTime - now
        const msUntilWarn = warnTime - now

        if (msUntilWarn > 0) {
          const t = setTimeout(() => {
            new Notification(`⏰ ${meal.recipe?.name || meal.name} in 15 min`, {
              body: `Prep time for ${meal.name.toLowerCase()} — ${meal.recipe?.actualKcal} kcal`,
              icon: '/icon-192.png',
              tag: `warn-${meal.id}`,
            })
          }, msUntilWarn)
          timersRef.current.push(t)
        }

        if (msUntilMeal > 0) {
          const t = setTimeout(() => {
            const ingList = meal.recipe?.ingredients?.slice(0, 3).map(i => `${i.grams}g ${i.name}`).join(', ')
            new Notification(`🍽️ Time for ${meal.recipe?.name || meal.name}`, {
              body: ingList || meal.recipe?.name,
              icon: '/icon-192.png',
              tag: `meal-${meal.id}`,
            })
          }, msUntilMeal)
          timersRef.current.push(t)
        }
      })
    }

    schedule()

    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [plan])
}
