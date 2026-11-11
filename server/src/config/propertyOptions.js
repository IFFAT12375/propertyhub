export const lahoreAreas = Object.freeze([
  'Askari 11',
  'Bahria Town',
  'DHA Phase 5',
  'DHA Phase 6',
  'Garden Town',
  'Gulberg',
  'Johar Town',
  'Lahore Cantt',
  'Model Town',
  'Valencia Town',
  'WAPDA Town',
])

export const propertyTypesByCategory = Object.freeze({
  residential: Object.freeze(['house', 'apartment', 'plot']),
  commercial: Object.freeze(['office', 'shop', 'warehouse']),
})

export const propertyTypes = Object.freeze(
  Object.values(propertyTypesByCategory).flat(),
)
