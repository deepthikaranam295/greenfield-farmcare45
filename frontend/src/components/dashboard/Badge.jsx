const colors = {
  active:      'bg-green-100 text-green-700',
  inactive:    'bg-gray-100 text-gray-500',
  requested:   'bg-violet-100 text-violet-700',
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
  draft:       'bg-gray-100 text-gray-600',
  submitted:   'bg-blue-100 text-blue-700',
  reviewed:    'bg-purple-100 text-purple-700',
  follow_up_required: 'bg-orange-100 text-orange-700',
  basic:       'bg-gray-100 text-gray-600',
  standard:    'bg-blue-100 text-blue-700',
  premium:     'bg-amber-100 text-amber-700',
  none:        'bg-gray-100 text-gray-400',
}

export default function Badge({ value }) {
  const cls = colors[value] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-heading font-semibold capitalize ${cls}`}>
      {value?.replace(/_/g, ' ')}
    </span>
  )
}
