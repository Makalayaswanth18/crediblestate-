export function formatPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(price % 10_000_000 === 0 ? 0 : 1)} Cr`
  if (price >= 100_000) return `₹${(price / 100_000).toFixed(price % 100_000 === 0 ? 0 : 1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export function buildWaLink(
  phone: string | null | undefined,
  propertyTitle: string,
): string {
  if (!phone) return '#'
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const message = `Hi, I saw your property "${propertyTitle}" on CredibleState. Is it still available? I would like to schedule a visit.`
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
