const Anthropic = require('@anthropic-ai/sdk')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const { ingredients, target } = req.body
  if (!ingredients) return res.status(400).json({ error: 'ingredients required' })
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(501).json({ error: 'ANTHROPIC_API_KEY not configured', demo: true })
  }
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `I need to eat ${target} calories today for lean muscle gain. I have: ${ingredients.join(', ')}.
Give me exactly 3 complete recipe ideas using these ingredients. Each should read like a real meal, not a list of raw ingredients.
Respond ONLY with a valid JSON array, no markdown:
[{"name":"Recipe Name","emoji":"🍳","calories":520,"protein":42,"mealType":"Breakfast","ingredients":["3 eggs","200ml whole milk","50g oats"],"instructions":"Two clear sentences on how to prepare it."}]`,
      }],
    })
    res.json(JSON.parse(msg.content[0].text))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
