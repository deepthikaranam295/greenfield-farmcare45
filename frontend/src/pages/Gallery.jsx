import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'

const photos = [
  { src: '/gallery/p1-bare-land.jpeg',              stage: 'Stage 1',  caption: 'Bare land — where it all began' },
  { src: '/gallery/p2-jcb-leveling.jpeg',           stage: 'Stage 2',  caption: 'JCB leveling the field' },
  { src: '/gallery/p4-young-orchard-aerial.jpeg',   stage: 'Stage 3',  caption: 'Young Mosambi orchard — aerial view' },
  { src: '/gallery/p5-young-orchard-path.jpeg',     stage: 'Stage 4',  caption: 'Growing orchard with farm paths' },
  { src: '/gallery/p6-orchard-marked-plots.jpeg',   stage: 'Stage 5',  caption: 'Plots marked, trees establishing' },
  { src: '/gallery/p7-mature-orchard-mountain.jpeg',stage: 'Stage 6',  caption: 'Mature Mosambi — mountain backdrop' },
  { src: '/gallery/p8-mature-orchard-panoramic.jpeg',stage: 'Stage 7', caption: 'Panoramic view — full canopy coverage' },
  { src: '/gallery/p9-mature-orchard-balcony.jpeg', stage: 'Stage 8',  caption: 'Orchard from farm house balcony' },
  { src: '/gallery/p10-mature-orchard-full.jpeg',   stage: 'Stage 9',  caption: 'Full grown Mosambi orchard' },
  { src: '/gallery/p11-mature-orchard-wide.jpeg',   stage: 'Stage 10', caption: 'Wide orchard in perfect rows' },
  { src: '/gallery/p12-mature-orchard-pole.jpeg',   stage: 'Stage 11', caption: 'Mature orchard with electricity' },
  { src: '/gallery/m1-mature-mosambi.jpeg',         stage: 'Stage 12', caption: 'Dense mature Mosambi trees' },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function PhotoCard({ photo, index, onClick }) {
  const [ref, visible] = useInView()
  return (
    <div
      ref={ref}
      onClick={() => onClick(index)}
      className="group cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${(index % 6) * 0.07}s, transform 0.55s ease ${(index % 6) * 0.07}s`,
      }}
    >
      <div className="rounded-2xl overflow-hidden bg-white shadow hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5">
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={photo.src}
            alt={photo.caption}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span
            className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full text-white tracking-wide"
            style={{ background: 'rgba(18,59,42,0.85)', backdropFilter: 'blur(6px)' }}
          >
            {photo.stage}
          </span>
        </div>
        <div className="px-4 py-3 border-t" style={{ borderColor: '#e8f5e9' }}>
          <p className="text-sm font-medium leading-snug" style={{ color: '#1a3a2a' }}>{photo.caption}</p>
        </div>
      </div>
    </div>
  )
}

function Lightbox({ index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, onNext, onPrev])

  const photo = photos[index]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.94)' }}
      onClick={onClose}
    >
      <button onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl w-12 h-12 flex items-center justify-center z-10 transition-colors">
        ‹
      </button>
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={photo.caption} className="w-full max-h-[82vh] object-contain rounded-xl" />
        <div className="mt-4 text-center">
          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white mb-2" style={{ background: '#2E7D32' }}>
            {photo.stage}
          </span>
          <p className="text-white/90 text-sm font-medium">{photo.caption}</p>
          <p className="text-white/40 text-xs mt-1">{index + 1} / {photos.length}</p>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl w-12 h-12 flex items-center justify-center z-10 transition-colors">
        ›
      </button>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all">
        ✕
      </button>
    </div>
  )
}

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)
  const [ownerRef, ownerVisible] = useInView(0.2)

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: '#0c2518', minHeight: 560 }}>
        {/* background orchard */}
        <img
          src="/gallery/p10-mature-orchard-full.jpeg"
          alt="Mosambi orchard"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center gap-12" style={{ minHeight: 560 }}>

          {/* Left text */}
          <div className="flex-1 text-white">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(116,201,154,0.15)', color: '#74c99a', border: '1px solid rgba(116,201,154,0.3)' }}
            >
              Our Farm Gallery
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl leading-tight mb-5">
              A Farm Built<br />
              <span style={{ color: '#74c99a' }}>From the Ground Up</span>
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-lg">
              From bare red soil to a thriving Mosambi orchard — every photo here
              is a real milestone from a real farm managed by our team.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { n: '12', l: 'Stages Documented' },
                { n: '100%', l: 'Real Farm Work' },
              ].map(s => (
                <div key={s.l} className="text-center px-5 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="font-extrabold text-2xl" style={{ color: '#74c99a' }}>{s.n}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Owner card */}
          <div className="flex-shrink-0 w-full max-w-xs">
            <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ border: '2px solid rgba(116,201,154,0.3)' }}
            >
              <div className="relative">
                <img
                  src="/gallery/farmer-mosambi-orchard.jpeg"
                  alt="Farm Owner"
                  className="w-full object-cover object-top"
                  style={{ height: 320 }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 px-5 py-4"
                  style={{ background: 'linear-gradient(to top, rgba(12,37,24,0.97) 0%, rgba(12,37,24,0.6) 70%, transparent 100%)' }}
                >
                  <p className="text-white font-bold text-base leading-tight">Farm Owner</p>
                  <p className="text-white/60 text-xs mt-0.5">Managing this Mosambi orchard since day one</p>
                </div>
              </div>
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{ background: 'rgba(116,201,154,0.08)' }}
              >
                <span className="text-xl">🌿</span>
                <p className="text-white/70 text-xs leading-relaxed">
                  Present on-site at every stage — from land preparation to harvest.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Section label ── */}
      <div style={{ background: '#F7FAF7', borderBottom: '1px solid #d4e8d4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center gap-3 flex-wrap">
          <span className="px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: '#123B2A' }}>
            🌿 Mosambi Orchard Journey
          </span>
          <span className="text-sm text-gray-400">{photos.length} photos · Bare land → full orchard</span>
        </div>
      </div>

      {/* ── Photo Grid ── */}
      <section className="py-14" style={{ background: '#F7FAF7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {photos.map((photo, i) => (
              <PhotoCard key={photo.src} photo={photo} index={i} onClick={setLightbox} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Owner spotlight ── */}
      <section
        ref={ownerRef}
        className="py-16"
        style={{ background: '#fff', borderTop: '1px solid #e8f5e9' }}
      >
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10"
          style={{
            opacity: ownerVisible ? 1 : 0,
            transform: ownerVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="flex-shrink-0">
            <div
              className="rounded-2xl overflow-hidden shadow-xl"
              style={{ width: 200, height: 220, border: '3px solid #d4e8d4' }}
            >
              <img
                src="/gallery/farmer-mosambi-orchard.jpeg"
                alt="Farm Owner"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
          <div>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: '#e8f5e9', color: '#2E7D32' }}
            >
              About the Farm Owner
            </span>
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4" style={{ color: '#123B2A' }}>
              The person behind this orchard
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Every tree you see in this gallery was planted, nurtured, and grown under this owner's
              vision. Starting from bare red soil, he turned an empty plot into a thriving Mosambi
              orchard — and GreenField Farm Care has been with him at every stage.
            </p>
            <div className="flex gap-6 flex-wrap">
              {[
                { icon: '🌱', label: 'Started from bare land' },
                { icon: '💧', label: 'Drip irrigation installed' },
                { icon: '🏡', label: 'Farm house built on-site' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2">
                  <span>{f.icon}</span>
                  <span className="text-sm text-gray-600 font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 text-center" style={{ background: '#123B2A' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-white mb-3">
            Want Your Farm to Look Like This?
          </h2>
          <p className="text-white/60 mb-8">
            Request a free site visit and we'll show you what's possible for your land.
          </p>
          <a
            href="/contact"
            className="inline-block font-semibold px-8 py-3 rounded-xl text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#2E7D32', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
          >
            Request Free Site Visit
          </a>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(i => (i - 1 + photos.length) % photos.length)}
          onNext={() => setLightbox(i => (i + 1) % photos.length)}
        />
      )}

    </Layout>
  )
}
