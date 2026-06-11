import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { FOODS } = require('../backend/foods')

export default (req, res) => {
  const { category } = req.query
  const list = Object.entries(FOODS).map(([id, f]) => ({ id, ...f }))
  res.json(category ? list.filter(f => f.category === category) : list)
}
