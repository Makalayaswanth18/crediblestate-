// Coordinates for Hyderabad localities — used for property maps
// when no exact lat/lng is set. Slightly imprecise (locality center)
// but good enough for MVP. Agents can later pin exact location.

export type LatLng = { lat: number; lng: number }

const LOCALITY_COORDS: Record<string, LatLng> = {
  // West / IT corridor
  kondapur: { lat: 17.4626, lng: 78.3667 },
  gachibowli: { lat: 17.4400, lng: 78.3489 },
  madhapur: { lat: 17.4483, lng: 78.3915 },
  'hitec city': { lat: 17.4485, lng: 78.3908 },
  'hitech city': { lat: 17.4485, lng: 78.3908 },
  'financial district': { lat: 17.4156, lng: 78.3489 },
  nanakramguda: { lat: 17.4154, lng: 78.3399 },
  tellapur: { lat: 17.4669, lng: 78.2826 },
  miyapur: { lat: 17.4954, lng: 78.3580 },
  kukatpally: { lat: 17.4849, lng: 78.4138 },
  manikonda: { lat: 17.4015, lng: 78.3849 },

  // Central
  'banjara hills': { lat: 17.4156, lng: 78.4364 },
  'jubilee hills': { lat: 17.4274, lng: 78.4106 },
  ameerpet: { lat: 17.4374, lng: 78.4486 },
  'himayat nagar': { lat: 17.4023, lng: 78.4831 },
  begumpet: { lat: 17.4435, lng: 78.4716 },
  somajiguda: { lat: 17.4185, lng: 78.4673 },

  // East / North
  secunderabad: { lat: 17.4399, lng: 78.4983 },
  uppal: { lat: 17.4060, lng: 78.5594 },
  kompally: { lat: 17.5391, lng: 78.4811 },

  // South / Airport
  shamshabad: { lat: 17.2403, lng: 78.4294 },
  attapur: { lat: 17.3743, lng: 78.4344 },
  mehdipatnam: { lat: 17.3937, lng: 78.4376 },

  // Old city
  charminar: { lat: 17.3616, lng: 78.4747 },
  abids: { lat: 17.3911, lng: 78.4751 },
}

// Default fallback — center of Hyderabad
const HYDERABAD_CENTER: LatLng = { lat: 17.3850, lng: 78.4867 }

export function getCoordsForLocality(locality: string | null | undefined): LatLng {
  if (!locality) return HYDERABAD_CENTER
  const key = locality.toLowerCase().trim()
  return LOCALITY_COORDS[key] || HYDERABAD_CENTER
}

/**
 * Build an OpenStreetMap embed URL for a given location.
 * Box is roughly 1km around the marker.
 */
export function osmEmbedUrl(coords: LatLng, zoom: number = 15): string {
  const delta = 0.008 // ~800m
  const bbox = [
    coords.lng - delta,
    coords.lat - delta,
    coords.lng + delta,
    coords.lat + delta,
  ].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`
}

/**
 * Build a Google Maps deep link for "Directions" or "View on Maps"
 */
export function googleMapsUrl(coords: LatLng, label: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}&query_place_id=${encodeURIComponent(label)}`
}

export function googleMapsDirectionsUrl(coords: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
}
