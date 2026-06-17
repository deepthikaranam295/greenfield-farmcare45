import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gf-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gf-pale rounded-full flex items-center justify-center">
                <span className="text-gf-dark font-heading font-bold text-sm">GF</span>
              </div>
              <span className="font-heading font-bold text-lg">GreenField Farm Care</span>
            </div>
            <p className="text-gf-pale/80 text-sm leading-relaxed">
              End-to-end farm management in Anantapur district, Andhra Pradesh.
            </p>
            <p className="text-gf-pale/60 text-xs mt-3">
              Serving city-based farm owners who want peace of mind.
            </p>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="font-heading font-semibold text-gf-pale mb-3 text-sm uppercase tracking-wide">
              Service Areas
            </h4>
            <ul className="space-y-1 text-sm text-white/80">
              <li>Anantapur District (primary)</li>
              <li>Kurnool District (expanding)</li>
              <li>Kadapa District (expanding)</li>
              <li>Chittoor District (expanding)</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-gf-pale mb-3 text-sm uppercase tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+919945100567" className="hover:text-gf-pale transition-colors">
                  +91 99451 00567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>💬</span>
                <a
                  href="https://wa.me/919945100567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gf-pale transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Anantapur, Andhra Pradesh</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              {['Services', 'About', 'Contact'].map(p => (
                <Link
                  key={p}
                  to={`/${p.toLowerCase()}`}
                  className="text-xs text-gf-pale/70 hover:text-gf-pale transition-colors"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gf-mid/30 mt-10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} GreenField Farm Care. All rights reserved. · Anantapur, AP
        </div>
      </div>
    </footer>
  )
}
