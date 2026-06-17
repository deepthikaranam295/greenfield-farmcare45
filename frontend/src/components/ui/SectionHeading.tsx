import FadeIn from './FadeIn'

interface Props {
  label?: string
  title: string
  subtitle?: string
  center?: boolean
  light?: boolean
}

export default function SectionHeading({ label, title, subtitle, center = true, light = false }: Props) {
  return (
    <FadeIn className={center ? 'text-center' : ''}>
      {label && (
        <span className={`section-label ${light ? 'text-gf-pale' : 'text-gf-mid'}`}>{label}</span>
      )}
      <h2 className={`section-heading text-3xl md:text-4xl mb-4 text-balance ${light ? 'text-white' : 'text-gf-dark'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`max-w-2xl ${center ? 'mx-auto' : ''} text-base md:text-lg leading-relaxed ${light ? 'text-white/70' : 'text-gf-muted'}`}>
          {subtitle}
        </p>
      )}
    </FadeIn>
  )
}
