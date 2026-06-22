export default function StatCard({ icon, label, value, sub, color = 'green', onClick, active }) {
  const colors = {
    green:  'bg-gf-pale text-gf-dark',
    blue:   'bg-blue-50 text-blue-700',
    amber:  'bg-amber-50 text-amber-700',
    red:    'bg-red-50 text-red-700',
    gray:   'bg-gray-100 text-gray-600',
  }
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border flex items-start gap-4 w-full text-left transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${active ? 'border-gf-mid ring-2 ring-gf-mid/20' : 'border-gray-100'}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-body uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-heading font-bold text-2xl text-gf-dark">{value}</p>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </Tag>
  )
}
