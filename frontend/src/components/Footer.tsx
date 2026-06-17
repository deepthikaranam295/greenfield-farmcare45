import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin } from 'lucide-react'

const nav = [
  { to: '/',                label: 'Home' },
  { to: '/services',        label: 'Services' },
  { to: '/farm-monitoring', label: 'Farm Monitoring' },
  { to: '/gallery',         label: 'Gallery' },
  { to: '/about',           label: 'About Us' },
  { to: '/contact',         label: 'Contact Us' },
]

export default function Footer() {
  return (
    <footer className="bg-gf-dark text-white">
      <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gf-pale rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-gf-dark" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-heading font-bold text-white text-base leading-none">GreenField Farm Care</p>
                <p className="text-gf-pale text-[10px] tracking-widest uppercase mt-0.5">Anantapur · Andhra Pradesh</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm font-body">
              End-to-end farm management for NRI and working professionals who own land in Anantapur district.
              We take care of your farm — you enjoy the returns.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <a href="tel:+919945100567" className="flex items-center gap-2 text-white/70 hover:text-gf-pale transition-colors font-body">
                <Phone className="w-4 h-4 shrink-0" />+91 99451 00567
              </a>
              <a href="mailto:info@greenfieldfc.in" className="flex items-center gap-2 text-white/70 hover:text-gf-pale transition-colors font-body">
                <Mail className="w-4 h-4 shrink-0" />info@greenfieldfc.in
              </a>
              <span className="flex items-center gap-2 text-white/70 font-body">
                <MapPin className="w-4 h-4 shrink-0" />Anantapur, Andhra Pradesh — 515001
              </span>
            </div>
          </div>

          {/* Pages */}
          <div>
            <p className="font-heading font-semibold text-gf-pale text-sm uppercase tracking-wide mb-4">Pages</p>
            <ul className="space-y-2">
              {nav.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/60 hover:text-gf-pale text-sm font-body transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="font-heading font-semibold text-gf-pale text-sm uppercase tracking-wide mb-4">Services</p>
            <ul className="space-y-2 text-white/60 text-sm font-body">
              {['Farm Fencing', 'Drip Irrigation', 'Plantation Setup', 'Live CCTV', 'Farm Maintenance', 'Security Patrol'].map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gf-mid/30">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 font-body">
          <p>© {new Date().getFullYear()} GreenField Farm Care. All rights reserved.</p>
          <p>Made with care for Anantapur's farmland</p>
        </div>
      </div>
    </footer>
  )
}
