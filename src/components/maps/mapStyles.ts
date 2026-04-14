/**
 * Custom Google Maps styles — muted silver base with brand-purple accents.
 * Keeps the map clean and premium without competing with the UI chrome.
 */
export const brandMapStyles: google.maps.MapTypeStyle[] = [
  // Base geometry — light silver
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },

  // Roads — subtle purple tint
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#e8e0f0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#ddd0ed' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#c8b8da' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a7a9a' }],
  },

  // Water — soft blue-gray
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dfe8f0' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9db4cc' }],
  },

  // Parks — muted sage green
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e5ede5' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8aaa8a' }],
  },

  // Hide non-essential POIs
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.government',
    stylers: [{ visibility: 'off' }],
  },

  // Transit — very subtle
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }],
  },
  {
    featureType: 'transit.station',
    stylers: [{ visibility: 'off' }],
  },

  // Administrative labels — light
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6D28D9' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9580b0' }],
  },
]
