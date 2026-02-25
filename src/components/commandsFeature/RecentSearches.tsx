import { getRecentSearches } from "../../utils/commandsFeature/storage"
import "../../styles/commandsFeature/RecentSearches.css"

interface Props {
  onSelect: (value: string) => void
}

export default function RecentSearches({ onSelect }: Props) {
  const searches = getRecentSearches()

  if (searches.length === 0) return null

  return (
    <div className="recent-searches">
      <h3 className="recent-searches-title">🕒 Recent Searches</h3>
      <div className="recent-searches-list">
        {searches.map(search => (
          <button
            key={search}
            onClick={() => onSelect(search)}
            className="recent-search-btn"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  )
}
