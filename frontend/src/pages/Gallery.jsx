import { useState } from 'react'
import Layout from '../components/Layout'

const tabs = ['All', 'Fencing', 'Drip Irrigation', 'Plantation', 'Security', 'Before & After']

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gf-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            Our Work — Farms We Have Transformed
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Real projects from farms we manage. Every photo tells a story of a farm that
            went from neglected to fully managed.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-10 bg-gf-offwhite sticky top-16 z-30 border-b border-gf-pale shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-heading font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gf-mid text-white shadow-sm'
                    : 'bg-white text-gf-dark border border-gf-pale hover:border-gf-light hover:text-gf-mid'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-32 bg-gf-offwhite">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-7xl mb-8">📸</div>
          <h2 className="section-heading text-3xl mb-4">
            Project Photos Coming Soon
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            We are currently completing our first farm installations.
            Real photos from real farms will be added here as each project is completed.
          </p>
          <div className="bg-gf-pale rounded-2xl px-8 py-6 inline-block text-sm text-gf-dark font-heading font-medium">
            🌱 First farms being set up — check back soon
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-gf-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-2xl md:text-3xl text-center mb-10">
            What Our Gallery Will Show
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🌿',
                title: 'Fencing Projects',
                desc: 'Before and after photos of perimeter fencing across different farm terrains.',
              },
              {
                icon: '💧',
                title: 'Drip Irrigation',
                desc: 'Installation process photos and completed systems showing layout and coverage.',
              },
              {
                icon: '🌱',
                title: 'Plantation Work',
                desc: 'Sapling procurement, bed preparation, planting day and early growth photos.',
              },
              {
                icon: '📷',
                title: 'Camera Setups',
                desc: 'Camera installation angles, coverage maps and live view screenshots.',
              },
              {
                icon: '🔧',
                title: 'Maintenance Visits',
                desc: 'Monthly field visit reports with photo evidence of work done.',
              },
              {
                icon: '✨',
                title: 'Before & After',
                desc: 'The same farm from day one to fully managed — the most requested category.',
              },
            ].map(item => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-gf-pale text-center"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-heading font-semibold text-gf-dark text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Preview */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
              Before & After
            </span>
            <h2 className="section-heading text-3xl md:text-4xl mt-2">
              The Transformation We Deliver
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border-2 border-red-200">
              <div className="bg-red-50 px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs font-heading font-semibold text-red-600 uppercase tracking-wide">
                  Before
                </span>
              </div>
              <div className="bg-gray-100 h-56 flex items-center justify-center">
                <p className="text-gray-400 text-sm font-body">Farm photos coming soon</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-gf-light">
              <div className="bg-gf-pale px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gf-light" />
                <span className="text-xs font-heading font-semibold text-gf-dark uppercase tracking-wide">
                  After
                </span>
              </div>
              <div className="bg-gf-pale/50 h-56 flex items-center justify-center">
                <p className="text-gf-mid text-sm font-body">Transformation photos coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
