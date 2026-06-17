import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import FadeIn from '../components/ui/FadeIn'
import SectionHeading from '../components/ui/SectionHeading'

type Category = 'all' | 'fencing' | 'irrigation' | 'plantation' | 'cameras' | 'security'

interface Project {
  id: number
  title: string
  location: string
  category: Category
  tag: string
  color: string
  emoji: string
  desc: string
}

const projects: Project[] = [
  { id: 1, title: 'GI Wire Fencing — 6 Acres', location: 'Tadipatri Mandal', category: 'fencing', tag: 'Fencing', color: 'bg-amber-50', emoji: '🏗️', desc: 'Complete boundary fencing with reinforced corner pillars and double-wire gate for vehicle access.' },
  { id: 2, title: 'Drip Irrigation — Tomato Farm', location: 'Gorantla Mandal', category: 'irrigation', tag: 'Irrigation', color: 'bg-blue-50', emoji: '💧', desc: 'Full drip system for 4 acres of tomato plantation. 40% water savings vs flood irrigation.' },
  { id: 3, title: 'Mango Orchard Setup', location: 'Kanekal Mandal', category: 'plantation', tag: 'Plantation', color: 'bg-green-50', emoji: '🥭', desc: '200 Alphonso mango saplings planted with proper spacing, irrigation and fertiliser schedule.' },
  { id: 4, title: '4G CCTV — 3 Camera Setup', location: 'Hindupur Mandal', category: 'cameras', tag: 'Cameras', color: 'bg-purple-50', emoji: '📹', desc: 'Three solar-powered cameras covering main gate, crop area and water tank with night vision.' },
  { id: 5, title: 'Teak Plantation — 10 Acres', location: 'Rayadurg Mandal', category: 'plantation', tag: 'Plantation', color: 'bg-green-50', emoji: '🌳', desc: '500 teak saplings planted with spacing and bund alignment. 10-year investment grade crop.' },
  { id: 6, title: 'Chain-Link Fencing — 12 Acres', location: 'Dharmavaram', category: 'fencing', tag: 'Fencing', color: 'bg-amber-50', emoji: '🏗️', desc: 'Heavy-duty chain link with barbed wire top for maximum security on a large farm plot.' },
  { id: 7, title: 'Sprinkler System — Groundnut', location: 'Uravakonda Mandal', category: 'irrigation', tag: 'Irrigation', color: 'bg-blue-50', emoji: '🌊', desc: 'Overhead sprinkler system for 8 acres of groundnut cultivation with auto-timer.' },
  { id: 8, title: 'Security Patrol — Corporate Farm', location: 'Anantapur Town', category: 'security', tag: 'Security', color: 'bg-red-50', emoji: '🛡️', desc: '24×7 guard deployment with CCTV integration and monthly security audit reports.' },
  { id: 9, title: 'Papaya + Banana Intercrop', location: 'Kadiri Mandal', category: 'plantation', tag: 'Plantation', color: 'bg-green-50', emoji: '🍌', desc: 'Mixed plantation strategy maximising income from 5 acres with complementary crop setup.' },
]

const categories: { key: Category; label: string }[] = [
  { key: 'all',        label: 'All Projects' },
  { key: 'fencing',   label: 'Fencing' },
  { key: 'irrigation',label: 'Irrigation' },
  { key: 'plantation',label: 'Plantation' },
  { key: 'cameras',   label: 'CCTV Cameras' },
  { key: 'security',  label: 'Security' },
]

const beforeAfter = [
  { label: 'Before: Unfenced, unused land', emoji: '🌵', bg: 'bg-red-50', desc: 'Encroachment risk, animals entering, no visibility of what\'s happening.' },
  { label: 'After: Secured, productive farm', emoji: '🌿', bg: 'bg-green-50', desc: 'Fenced, irrigated, planted and monitored — generating returns within 12 months.' },
]

export default function Gallery() {
  const [active, setActive] = useState<Category>('all')

  const filtered = active === 'all' ? projects : projects.filter(p => p.category === active)

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-white py-20 md:py-28">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="section-label text-gf-pale">Projects & Gallery</span>
            <h1 className="section-heading text-white text-4xl md:text-5xl mt-2 mb-5">
              Real Farms. Real Results.
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-body">
              Browse completed projects across Anantapur district — from fencing and irrigation to
              full farm setups with live camera monitoring.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="section-pad bg-gf-offwhite">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter pills */}
          <FadeIn>
            <div className="flex flex-wrap gap-2 justify-center mb-12">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActive(cat.key)}
                  className={`px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all duration-200 ${
                    active === cat.key
                      ? 'bg-gf-mid text-white shadow-md'
                      : 'bg-white text-gf-muted border border-gray-200 hover:border-gf-mid hover:text-gf-mid'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Project grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map(project => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="card overflow-hidden group cursor-default"
                >
                  {/* Image placeholder */}
                  <div className={`${project.color} h-48 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300`}>
                    {project.emoji}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-heading font-semibold text-gf-light bg-gf-pale px-2 py-0.5 rounded-full">
                        {project.tag}
                      </span>
                      <span className="text-xs text-gray-400 font-body flex items-center gap-1">
                        📍 {project.location}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-gf-dark text-base mb-1">{project.title}</h3>
                    <p className="text-gf-muted text-sm font-body leading-relaxed">{project.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-gf-muted font-body py-16">No projects in this category yet.</p>
          )}
        </div>
      </section>

      {/* Before & After */}
      <section className="section-pad bg-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Transformation" title="Before & After" subtitle="The difference a professional farm management team makes." />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {beforeAfter.map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.12}>
                <div className={`${item.bg} rounded-2xl p-8 text-center border border-gray-100`}>
                  <div className="text-5xl mb-4">{item.emoji}</div>
                  <p className="font-heading font-bold text-gf-dark text-lg mb-2">{item.label}</p>
                  <p className="text-gf-muted text-sm font-body">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-8 text-center">
            <p className="text-gf-muted text-sm font-body mb-5">
              Ready to transform your farm? We'll send you a before & after plan after the free site visit.
            </p>
            <Link to="/contact" className="btn-primary">
              Book Free Site Visit <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </Layout>
  )
}
