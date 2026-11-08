export function getPublicProperties(properties) {
  return properties.filter(
    (property) =>
      property.moderationStatus === 'approved' &&
      property.availabilityStatus === 'available' &&
      property.recordStatus === 'active' &&
      property.sellerStatus === 'active',
  )
}

export function formatPrice(price, purpose, frequency) {
  const formatted =
    price >= 10_000_000
      ? `${trimDecimal(price / 10_000_000)} Cr`
      : price >= 100_000
        ? `${trimDecimal(price / 100_000)} Lac`
        : new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(
            price,
          )

  const suffix =
    purpose === 'rent'
      ? ` / ${frequency === 'year' ? 'year' : 'month'}`
      : ''

  return `PKR ${formatted}${suffix}`
}

function trimDecimal(value) {
  return value.toFixed(2).replace(/\.?0+$/, '')
}
