import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'

const tabs = ['All', 'Plantation', 'Drip Irrigation', 'Harvest', 'Farm House']

const photos = [
  // ── Plantation ──────────────────────────────────────────────────────────────
  {
    src: '/gallery/p1-bare-land.jpeg',
    stage: 'Stage 1',
    caption: 'Bare land — ready to begin',
    category: 'Plantation',
  },
  {
    src: '/gallery/p2-jcb-leveling.jpeg',
    stage: 'Stage 2',
    caption: 'JCB leveling the field',
    category: 'Plantation',
  },
  {
    src: '/gallery/p3-coconut-saplings.jpeg',
    stage: 'Stage 3',
    caption: 'Young coconut saplings planted on hillside',
    category: 'Plantation',
  },
  {
    src: '/gallery/p4-young-orchard-aerial.jpeg',
    stage: 'Stage 4',
    caption: 'Young Mosambi orchard — aerial view',
    category: 'Plantation',
  },
  {
    src: '/gallery/p5-young-orchard-path.jpeg',
    stage: 'Stage 5',
    caption: 'Growing orchard with farm paths',
    category: 'Plantation',
  },
  {
    src: '/gallery/p6-orchard-marked-plots.jpeg',
    stage: 'Stage 6',
    caption: 'Plots marked, trees establishing',
    category: 'Plantation',
  },
  {
    src: '/gallery/p7-mature-orchard-mountain.jpeg',
    stage: 'Stage 7',
    caption: 'Mature Mosambi orchard — mountain backdrop',
    category: 'Plantation',
  },
  {
    src: '/gallery/p8-mature-orchard-panoramic.jpeg',
    stage: 'Stage 8',
    caption: 'Panoramic view — full canopy coverage',
    category: 'Plantation',
  },
  {
    src: '/gallery/p9-mature-orchard-balcony.jpeg',
    stage: 'Stage 9',
    caption: 'Orchard viewed from farm house balcony',
    category: 'Plantation',
  },
  {
    src: '/gallery/p10-mature-orchard-full.jpeg',
    stage: 'Stage 10',
    caption: 'Full grown Mosambi orchard',
    category: 'Plantation',
  },
  {
    src: '/gallery/p11-mature-orchard-wide.jpeg',
    stage: 'Stage 11',
    caption: 'Wide orchard in perfect rows',
    category: 'Plantation',
  },
  {
    src: '/gallery/p12-mature-orchard-pole.jpeg',
    stage: 'Stage 12',
    caption: 'Mature orchard with electricity connection',
    category: 'Plantation',
  },
  {
    src: '/gallery/m1-mature-mosambi.jpeg',
    stage: 'Stage 13',
    caption: 'Dense mature Mosambi trees',
    category: 'Plantation',
  },

  // ── Drip Irrigation ─────────────────────────────────────────────────────────
  {
    src: '/gallery/d1-drip-pipe-emitter.jpeg',
    stage: 'Stage 1',
    caption: 'Drip emitter installed at sapling base',
    category: 'Drip Irrigation',
  },
  {
    src: '/gallery/d2-drip-citrus-sapling.jpeg',
    stage: 'Stage 2',
    caption: 'Citrus sapling with drip line',
    category: 'Drip Irrigation',
  },
  {
    src: '/gallery/d3-drip-lemon-tree.jpeg',
    stage: 'Stage 3',
    caption: 'Lemon tree — drip irrigation running',
    category: 'Drip Irrigation',
  },
  {
    src: '/gallery/d4-drip-tomato-rows.jpeg',
    stage: 'Stage 4',
    caption: 'Muskmelon rows with mulching & drip system',
    category: 'Drip Irrigation',
  },
  {
    src: '/gallery/d5-mulching-drip.jpeg',
    stage: 'Stage 5',
    caption: 'Organic mulching around tree with drip',
    category: 'Drip Irrigation',
  },
  {
    src: '/gallery/d6-borewell-drilling.jpeg',
    stage: 'Stage 6',
    caption: 'Borewell drilling — water source for muskmelon farm',
    category: 'Drip Irrigation',
  },
  {
    src: '/gallery/d7-flower-drip.jpeg',
    stage: 'Stage 7',
    caption: 'Flowering plant thriving on drip system',
    category: 'Drip Irrigation',
  },
  {
    src: '/gallery/m2-field-ready.jpeg',
    stage: 'Stage 8',
    caption: 'Field prepared and drip lines laid',
    category: 'Drip Irrigation',
  },

  // ── Harvest ─────────────────────────────────────────────────────────────────
  {
    src: '/gallery/h1-mango-harvest-pile.jpeg',
    stage: 'Harvest',
    caption: 'First muskmelon harvest — bumper yield',
    category: 'Harvest',
  },
  {
    src: '/gallery/h2-mangoes-on-tree.jpeg',
    stage: 'Pre-Harvest',
    caption: 'Mangoes ripening on tree',
    category: 'Harvest',
  },
  {
    src: '/gallery/h3-mango-tree-young.jpeg',
    stage: 'Growing',
    caption: 'Young mango tree with wind turbines',
    category: 'Harvest',
  },
  {
    src: '/gallery/h4-coconut-palm-young.jpeg',
    stage: 'Growing',
    caption: 'Young coconut palm on red-soil hillside',
    category: 'Harvest',
  },
  {
    src: '/gallery/m3-mango-tree-drip.jpeg',
    stage: 'Growing',
    caption: 'Mango tree on drip — healthy growth',
    category: 'Harvest',
  },

  // ── Farm House ──────────────────────────────────────────────────────────────
  {
    src: '/gallery/fh1-construction-frame.jpeg',
    stage: 'Stage 1',
    caption: 'Foundation & frame construction',
    category: 'Farm House',
  },
  {
    src: '/gallery/fh2-rcc-slab.jpeg',
    stage: 'Stage 2',
    caption: 'RCC roof slab with plumbing laid',
    category: 'Farm House',
  },
  {
    src: '/gallery/fh4-night-view.jpeg',
    stage: 'Stage 3',
    caption: 'Ground floor complete — night view',
    category: 'Farm House',
  },
  {
    src: '/gallery/fh5-completed-day.jpeg',
    stage: 'Stage 4',
    caption: 'Elevated farm house — completed',
    category: 'Farm House',
  },
  {
    src: '/gallery/fh3-completed-elevated.jpeg',
    stage: 'Stage 5',
    caption: 'Farm house with 360° orchard view',
    category: 'Farm House',
  },
]

function PhotoCard({ photo, onClick, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      onClick={() => onClick(photo)}
      className="group cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 0.04}s, transform 0.5s ease ${index * 0.04}s`,
      }}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={photo.src}
            alt={photo.caption}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white"
            style={{ background: '#2E7D32' }}
          >
            {photo.stage}
          </span>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-gray-700 leading-snug">{photo.caption}</p>
          <p className="text-xs mt-1" style={{ color: '#2E7D32' }}>{photo.category}</p>
        </div>
      </div>
    </div>
  )
}

function Lightbox({ photo, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onNext, onPrev])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors z-10"
      >
        ‹
      </button>
      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.caption}
          className="w-full max-h-[80vh] object-contain rounded-xl"
        />
        <div className="mt-3 text-center">
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-2"
            style={{ background: '#2E7D32' }}
          >
            {photo.stage}
          </span>
          <p className="text-white text-sm font-medium">{photo.caption}</p>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors z-10"
      >
        ›
      </button>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const filtered = activeTab === 'All' ? photos : photos.filter(p => p.category === activeTab)

  const openLightbox = (photo) => {
    const idx = filtered.indexOf(photo)
    setLightbox(idx)
  }

  const closeLightbox = () => setLightbox(null)

  const prevPhoto = () => setLightbox(i => (i - 1 + filtered.length) % filtered.length)
  const nextPhoto = () => setLightbox(i => (i + 1) % filtered.length)

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: '520px', background: '#0a2317' }}
      >
        <img
          src="/gallery/p10-mature-orchard-full.jpeg"
          alt="Farm"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.45 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(18,59,42,0.97) 0%, rgba(18,59,42,0.75) 55%, rgba(18,59,42,0.2) 100%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col justify-center" style={{ minHeight: '520px' }}>
          <div className="max-w-2xl">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#a8d5b5', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Our Projects
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
              Our Work —<br />
              <span style={{ color: '#74c99a' }}>Farms We Have Transformed</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Real projects from farms we manage. Follow each farm's journey,
              stage by stage, from bare land to full plantation.
            </p>
            {/* Floating card */}
            <div
              className="inline-flex items-start gap-4 px-6 py-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.09)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <span className="text-2xl mt-0.5">👨‍🌾</span>
              <div>
                <p className="text-white font-semibold text-sm leading-snug">Meet the team behind the work</p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">
                  Present on-site at every stage —<br />
                  from land preparation to harvest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div
        className="sticky top-16 z-30 border-b"
        style={{ background: '#F7FAF7', borderColor: '#d4e8d4' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  activeTab === tab
                    ? { background: '#123B2A', color: '#fff', boxShadow: '0 2px 8px rgba(18,59,42,0.3)' }
                    : { background: '#fff', color: '#123B2A', border: '1.5px solid #a8d5b5' }
                }
              >
                {tab}
                <span
                  className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                  style={
                    activeTab === tab
                      ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                      : { background: '#e8f5e9', color: '#2E7D32' }
                  }
                >
                  {tab === 'All' ? photos.length : photos.filter(p => p.category === tab).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-12" style={{ background: '#F7FAF7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">No photos in this category yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((photo, i) => (
                <PhotoCard
                  key={photo.src}
                  photo={photo}
                  index={i}
                  onClick={openLightbox}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#123B2A' }} className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { num: '31+', label: 'Project Photos' },
              { num: '4', label: 'Farm Categories' },
              { num: '12', label: 'Plantation Stages' },
              { num: '100%', label: 'Real Farm Work' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-extrabold text-3xl" style={{ color: '#74c99a' }}>{s.num}</p>
                <p className="text-white/60 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl mb-3" style={{ color: '#123B2A' }}>
            Want Your Farm to Look Like This?
          </h2>
          <p className="text-gray-500 mb-8">
            Request a free site visit and we'll show you exactly what's possible for your land.
          </p>
          <a
            href="/contact"
            className="inline-block font-semibold px-8 py-3 rounded-xl text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#123B2A', boxShadow: '0 4px 16px rgba(18,59,42,0.3)' }}
          >
            Request Free Site Visit
          </a>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          photo={filtered[lightbox]}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </Layout>
  )
}
