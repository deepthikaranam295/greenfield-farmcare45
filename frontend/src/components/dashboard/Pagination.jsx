export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 rounded-lg border text-sm font-body disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        ← Prev
      </button>
      <span className="text-sm text-gray-500 font-body">Page {page} of {pages}</span>
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 rounded-lg border text-sm font-body disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        Next →
      </button>
    </div>
  )
}
