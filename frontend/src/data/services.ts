export interface Service {
  id: string
  icon: string
  title: string
  tagline: string
  description: string
  included: string[]
  price: string
  priceNote: string
}

export interface Package {
  name: string
  badge?: string
  price: string
  period: string
  highlight: boolean
  features: string[]
  cta: string
}

export const services: Service[] = [
  {
    id: 'fencing',
    icon: '🏗️',
    title: 'Farm Boundary Fencing',
    tagline: 'Secure your land permanently',
    description: 'Professional GI wire and chain-link boundary fencing to protect your farm from encroachment, stray animals and theft.',
    included: ['GPS-based boundary survey', 'GI wire / chain-link installation', 'Corner pillar concreting', 'Gate with lock', '1-year structural warranty'],
    price: '₹45/ft',
    priceNote: 'Starting price · varies by material & terrain',
  },
  {
    id: 'irrigation',
    icon: '💧',
    title: 'Drip Irrigation System',
    tagline: 'Save water, grow more',
    description: 'End-to-end design and installation of drip or sprinkler irrigation systems tailored to your crop type and soil profile.',
    included: ['Soil and water analysis', 'System design', 'Pipe & drip-line installation', 'Motor & filter setup', 'Operator training'],
    price: '₹18,000/acre',
    priceNote: 'Subsidy available under PM-KUSUM',
  },
  {
    id: 'mapping',
    icon: '📡',
    title: 'Farm Field Mapping',
    tagline: 'Know every inch of your land',
    description: 'Drone-based aerial mapping with GPS tagging to create accurate land records and planting layout plans.',
    included: ['Drone survey', 'High-resolution aerial photos', 'GPS boundary marking', 'Soil zone mapping', 'Digital land record'],
    price: '₹3,500/acre',
    priceNote: 'One-time charge',
  },
  {
    id: 'plantation',
    icon: '🌱',
    title: 'Plantation & Crop Setup',
    tagline: 'Right crops, right way',
    description: 'Expert plantation services for mango, teak, sandalwood, vegetables, and cash crops suited to Anantapur\'s red soil and climate.',
    included: ['Crop selection consultation', 'Soil preparation & tilling', 'Quality sapling procurement', 'Planting with spacing layout', '3-month growth monitoring'],
    price: '₹12,000/acre',
    priceNote: 'Crop-specific pricing available',
  },
  {
    id: 'cameras',
    icon: '📹',
    title: 'Live Camera Installation',
    tagline: 'Watch your farm from anywhere',
    description: 'Solar-powered 4G CCTV cameras with night vision and motion alerts — accessible on your phone 24×7.',
    included: ['4G solar-powered cameras', 'Night vision & motion detection', 'Mobile app access', 'WhatsApp alert integration', '1-year hardware warranty'],
    price: '₹8,500/camera',
    priceNote: 'Includes installation & 1yr cloud storage',
  },
  {
    id: 'maintenance',
    icon: '🔧',
    title: 'Monthly Farm Maintenance',
    tagline: 'Never miss a farm activity',
    description: 'Regular scheduled visits by trained field staff for weeding, pruning, fertilising, pest inspection and general upkeep.',
    included: ['2 field visits/month', 'Weeding & pruning', 'Fertiliser application', 'Pest & disease inspection', 'WhatsApp photo report'],
    price: '₹2,500/month',
    priceNote: 'Per acre · minimum 3-month contract',
  },
  {
    id: 'security',
    icon: '🛡️',
    title: 'Farm Security Patrol',
    tagline: 'On-ground protection 24×7',
    description: 'Dedicated security personnel for regular patrol rounds, unauthorized access prevention and emergency response.',
    included: ['Trained guard deployment', 'Day & night patrol rounds', 'Entry log register', 'Emergency response protocol', 'Monthly security report'],
    price: '₹12,000/month',
    priceNote: 'Per guard · shift options available',
  },
]

export const packages: Package[] = [
  {
    name: 'Farm Ready',
    price: '₹45,000',
    period: 'one-time setup',
    highlight: false,
    features: [
      'Farm Field Mapping',
      'Boundary Fencing (up to 1 acre)',
      'Basic Drip Irrigation setup',
      'On-site consultation',
      'Digital land record',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Full Farm Manager',
    badge: 'Most Popular',
    price: '₹8,500/mo',
    period: 'per acre · min 6 months',
    highlight: true,
    features: [
      'Everything in Farm Watch',
      'Monthly maintenance visits (4/mo)',
      'Fertiliser & pest management',
      'Dedicated farm manager',
      'Monthly PDF + WhatsApp report',
      'Annual farm performance review',
    ],
    cta: 'Start Managing',
  },
  {
    name: 'Farm Watch',
    price: '₹4,500/mo',
    period: 'per acre · min 3 months',
    highlight: false,
    features: [
      'Live CCTV camera access',
      'Security patrol (2 visits/week)',
      'Monthly field visits (2/mo)',
      'WhatsApp photo updates',
      'Incident alert system',
    ],
    cta: 'Start Watching',
  },
]
