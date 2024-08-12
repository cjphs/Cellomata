const presetRulesets = new Map()

const req = require.context('./presets', true, /\.js$/)
req.keys().forEach(key => {
  const preset = req(key).default
  const name = key.split('/')[1].split('.')[0]
  presetRulesets.set(name, preset)
})

export default presetRulesets
