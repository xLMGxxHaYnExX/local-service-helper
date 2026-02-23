import { useState } from "react"
import commandsData from "./data/commands.json"
import type { Command } from "./types/Command"
import { useCommandSearch } from "./hooks/useCommandSearch"
import SearchBar from "./components/SearchBar"
// Filters handled on AllCommandsPage
import CommandCard from "./components/CommandCard"
import { addRecentSearch, getUserCommands, addUserCommand } from "./utils/storage"
import AddCommandModal from "./components/AddCommandModal"
import MostUsed from "./components/MostUsed"
import AllCommandsPage from "./components/AllCommandsPage"
import CommandPalette from "./components/CommandPalette"
import NavBar from "./components/NavBar"
import "./styles/App.css"

export default function App() {
  const [commands, setCommands] = useState<Command[]>(() => {
    try {
      const file = commandsData as Command[]
      const user = getUserCommands()
      return [...user, ...file]
    } catch {
      return commandsData as Command[]
    }
  })

  const [search, setSearch] = useState("")
  const filtered = useCommandSearch(
    commands,
    search,
    "All",
    "All"
  )

  const handleUse = (id: string) => {
    const usage = JSON.parse(localStorage.getItem("usage") || "{}")
    usage[id] = (usage[id] || 0) + 1
    localStorage.setItem("usage", JSON.stringify(usage))
  }

  const [mostUsedOpen, setMostUsedOpen] = useState(false)
  const [showAllPage, setShowAllPage] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const handleAdd = (cmd: Command) => {
    // persist user command and merge into state
    addUserCommand(cmd)
    setCommands(prev => [cmd, ...prev])
  }

  const exportCommands = () => {
    const blob = new Blob([JSON.stringify(commands, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'commands-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <NavBar
        onToggleMostUsed={() => setMostUsedOpen(v => !v)}
        onViewAll={() => { setShowAllPage(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onAddCommand={() => setAddOpen(true)}
        onExportCommands={exportCommands}
      />

      {!showAllPage && (
        <>
          <div className="hero">
            <div className="hero-inner">
              <SearchBar
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  const v = value.trim()
                  if (v === "") return
                  const q = v.toLowerCase()
                  const hasMatch = commands.some(cmd =>
                    cmd.title.toLowerCase().includes(q) ||
                    cmd.command.toLowerCase().includes(q) ||
                    cmd.description.toLowerCase().includes(q) ||
                    cmd.tags.some(t => t.toLowerCase().includes(q))
                  )
                  if (hasMatch) addRecentSearch(value)
                }}
              />
            </div>
          </div>

          <div className="app-container">
            <CommandPalette commands={commands} />

            <MostUsed commands={commands} open={mostUsedOpen} setOpen={setMostUsedOpen} />

            {search.trim() !== "" && (
              <div>
                {filtered.length === 0 ? (
                  <div className="no-results" role="status" aria-live="polite">No commands found</div>
                ) : (
                  filtered.map(cmd => (
                    <CommandCard key={cmd.id} command={cmd} onUse={handleUse} />
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {addOpen && (
        <AddCommandModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      )}

      {showAllPage && (
        <div className="all-page-wrap">
          <AllCommandsPage commands={commands} onClose={() => { setShowAllPage(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
      )}
    </>
  )
}
