import "../styles/Filters.css"

interface Props {
  apps: string[]
  categories: string[]
  appFilter: string
  categoryFilter: string
  setAppFilter: (v: string) => void
  setCategoryFilter: (v: string) => void
}

export default function Filters({
  apps,
  categories,
  appFilter,
  categoryFilter,
  setAppFilter,
  setCategoryFilter
}: Props) {
  return (
    <div className="filters-row">
      <select className="filters-select" value={appFilter} onChange={e => setAppFilter(e.target.value)}>
        <option>All</option>
        {apps.map(app => (
          <option key={app}>{app}</option>
        ))}
      </select>

      <select
        className="filters-select"
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
      >
        <option>All</option>
        {categories.map(cat => (
          <option key={cat}>{cat}</option>
        ))}
      </select>
    </div>
  )
}