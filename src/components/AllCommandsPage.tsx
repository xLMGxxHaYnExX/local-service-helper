import { useMemo, useState } from "react"
import type { Command } from "../types/Command"
import Filters from "./Filters"
import CommandCard from "./CommandCard"
import "../styles/AllCommandsPage.css"
import { useCommandSearch } from "../hooks/useCommandSearch"

interface Props {
  commands: Command[]
  onClose?: () => void
  onEdit?: (cmd: Command) => void
}

export default function AllCommandsPage({ commands, onClose, onEdit }: Props) {
  const [appFilter, setAppFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  const filtered = useCommandSearch(commands, "", appFilter, categoryFilter)

  const apps = useMemo(() => [...new Set(commands.map(c => c.app))], [commands])
  const categories = useMemo(() => [...new Set(commands.map(c => c.category))], [commands])

  return (
    <div className="all-commands-page">
      <div className="all-commands-header">
        <h2>All Commands</h2>
        {onClose && (
          <button className="all-commands-back" onClick={onClose}>Back</button>
        )}
      </div>

      <Filters
        apps={apps}
        categories={categories}
        appFilter={appFilter}
        categoryFilter={categoryFilter}
        setAppFilter={setAppFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <div className="all-commands-list">
        {filtered.map(cmd => (
          <CommandCard key={cmd.id} command={cmd} onUse={() => {}} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}
