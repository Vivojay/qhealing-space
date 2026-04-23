// Centralised retreat catalog — shared between Retreats listing and RetreatCheckout.
// `slug` is derived once and used as the URL key.

const slugify = (s) => s.toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const _RETREATS = [
  {
    name: 'Stress Busting Retreat',
    duration: '3 — 5 Days',
    location: 'Rishikesh, Uttarakhand',
    desc:
      'An invitation to re-establish yourself as an empty vessel — devoid of stress, mental confusion, and accumulated burdens. Designed to feel like a holiday: nourishing meals, restorative massage, deep sleep — with transformative educational depth as an added gift.',
    highlights: ['Therapeutic massage', 'Fresh nourishing meals', 'Deep relaxation practices', 'Inner work sessions'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1551845728-6820a30c64e1?w=900&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&q=80',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80',
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=900&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80',
    ],
  },
  {
    name: 'Silent Meditation & Yoga',
    duration: '5 — 7 Days',
    location: 'Dharamshala, Himachal',
    desc:
      'An opportunity to re-connect with your own deeper self through silence and intentional inner work. Natural settings, vegan meals, and guided silence create the conditions for profound self-inquiry.',
    highlights: ['Complete silence practice', 'Daily meditation', 'Vegan cuisine', 'Nature immersion', 'Yoga asana', 'Prayer ceremonies'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=900&q=80',
      'https://images.unsplash.com/photo-1528319725582-ddc096101511?w=900&q=80',
      'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=900&q=80',
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900&q=80',
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=900&q=80',
    ],
  },
  {
    name: 'Chakra Balancing Retreat',
    duration: '4 — 6 Days',
    location: 'Pondicherry, Tamil Nadu',
    desc:
      'A healing immersion that invites you to take a closer look at your own energy centers. Balance multiple emotional and physical issues while experiencing the deep pleasure of nature, healing massage, and fresh air.',
    highlights: ['7-chakra healing sessions', 'Connecting with nature', 'Healing massage', 'Energy assessments', 'Daily balancing rituals'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=900&q=80',
      'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=900&q=80',
      'https://images.unsplash.com/photo-1540206395-68808572332f?w=900&q=80',
      'https://images.unsplash.com/photo-1514516816566-de580c8f76b9?w=900&q=80',
      'https://images.unsplash.com/photo-1537833633404-f02da1cb78b6?w=900&q=80',
      'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=900&q=80',
    ],
  },
  {
    name: 'Spiritual Healing Retreat',
    duration: '5 — 7 Days',
    location: 'Mcleodganj, Himachal',
    desc:
      'Through daily meditations and group exercises, this retreat invites a deeper dive into the body\'s intelligence and a connection to your inner intuitive self. A time of release, relaxation and pleasure.',
    highlights: ['Daily group meditations', 'Spiritual group exercises', 'Individual healing sessions', 'Intuition development'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80',
      'https://images.unsplash.com/photo-1502810365585-56ffa361fdde?w=900&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80',
      'https://images.unsplash.com/photo-1551655510-555dc3be8633?w=900&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80',
    ],
  },
  {
    name: 'Reiki Healing Retreat',
    duration: '4 — 5 Days',
    location: 'Goa',
    desc:
      'Through the mindful use of Reiki symbols combined with healing energy, this retreat brings health to your physical, emotional, and spiritual bodies — creating an energetic foundation for balance and alignment.',
    highlights: ['Daily Reiki sessions', 'Symbol activations', 'Self-healing techniques', 'Attunements available', 'Group healing circles'],
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=900&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80',
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=900&q=80',
      'https://images.unsplash.com/photo-1602192103205-aaae3c6a7baf?w=900&q=80',
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=900&q=80',
      'https://images.unsplash.com/photo-1591348122449-02525d70379b?w=900&q=80',
    ],
  },
  {
    name: 'Forgiveness Retreat',
    duration: '3 — 4 Days',
    location: 'Sector 56, Gurugram',
    desc:
      'An invitation to forgive people, situations — and most importantly, yourself. Through the practice of forgiveness you will bring awareness to your physical, emotional, and spiritual bodies.',
    highlights: ['Ho\'oponopono practice', 'Inner child work', 'Somatic release', 'Group sharing circles', 'Personal ceremony'],
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=90',
    gallery: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900&q=80',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=900&q=80',
      'https://images.unsplash.com/photo-1528319725582-ddc096101511?w=900&q=80',
      'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=900&q=80',
      'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=900&q=80',
      'https://images.unsplash.com/photo-1551845728-6820a30c64e1?w=900&q=80',
    ],
  },
];

export const RETREATS = _RETREATS.map((r) => ({ ...r, slug: slugify(r.name) }));

export function findRetreat(slug) {
  return RETREATS.find((r) => r.slug === slug);
}
