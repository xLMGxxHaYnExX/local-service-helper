import { useState, useEffect } from "react"
import type { Command } from "./types/Command"
import { fetchAllCommands } from "./api/commands"
import { useCommandSearch } from "./hooks/useCommandSearch"
import SearchBar from "./components/SearchBar"
// Filters handled on AllCommandsPage
import CommandCard from "./components/CommandCard"
import { addRecentSearch, getUserCommands } from "./utils/storage"
import AddCommandModal from "./components/AddCommandModal"
import MostUsed from "./components/MostUsed"
import AllCommandsPage from "./components/AllCommandsPage"
import CommandPalette from "./components/CommandPalette"
import NavBar from "./components/NavBar"
import "./styles/App.css"
import { bulkSaveCommands } from "./api/commands"
import { useRef } from "react"

export default function App() {
  const [commands, setCommands] = useState<Command[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      const user = getUserCommands()
      const data = await fetchAllCommands()
      if (mounted) setCommands([...user, ...data])
    }

    load()

    // log for debugging: commands state after initial load
    // small timeout to allow fetch path to set state
    setTimeout(() => console.debug("[App] initial commands count:", (window as any).__DEV_CMDS_COUNT || "unknown"), 300)

    return () => { mounted = false }
  }, [])

  const [search, setSearch] = useState("")
  const filtered = useCommandSearch(
    commands,
    search,
    "All",
    "All"
  )

  useEffect(() => {
    console.debug("[App] commands:", commands.length, "filtered:", filtered.length, "search:", JSON.stringify(search))
  }, [commands, filtered, search])

  const handleUse = (id: string) => {
    const usage = JSON.parse(localStorage.getItem("usage") || "{}")
    usage[id] = (usage[id] || 0) + 1
    localStorage.setItem("usage", JSON.stringify(usage))
  }

  const [mostUsedOpen, setMostUsedOpen] = useState(false)
  const [showAllPage, setShowAllPage] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editCommand, setEditCommand] = useState<Command | null>(null)

  const handleAdd = (cmd: Command) => {
    // merge newly created command into state (backend already persisted it)
    setCommands(prev => [cmd, ...prev])
  }

  const handleUpdate = (cmd: Command) => {
    setCommands(prev => prev.map(p => p.id === cmd.id ? cmd : p))
  }

  const handleDelete = (id: string) => {
    setCommands(prev => prev.filter(p => p.id !== id))
    // also remove from recent usage if present
    try {
      const usage = JSON.parse(localStorage.getItem('usage') || '{}')
      if (usage[id]) { delete usage[id]; localStorage.setItem('usage', JSON.stringify(usage)) }
    } catch (e) {}
  }

  const exportCommands = () => {
    // download export file
    const blob = new Blob([JSON.stringify(commands, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'commands-export.json'
    a.click()
    URL.revokeObjectURL(url)

    // best-effort: save all commands to backend
    ;(async () => {
      try {
        const payload = commands.map(c => ({
          id: c.id,
          app: c.app,
          category: c.category,
          type: c.type,
          title: c.title,
          command: c.command,
          description: c.description,
          tags: c.tags,
          priority: c.priority,
        }))

        const result = await bulkSaveCommands(payload)
        console.info(`Export: saved ${result.saved.length}, failed ${result.failed.length}`)
      } catch (err) {
        console.warn('Export: failed to save commands to backend', err)
      }
    })()
  }

  const onImportCommands = () => {
    fileInputRef.current?.click()
  }

  const handleFile = async (file?: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) throw new Error('Import JSON must be an array')
      const payload = parsed.map((item: any) => ({
        id: item.id,
        app: item.app,
        category: item.category,
        type: item.type,
        title: item.title,
        command: item.command,
        description: item.description,
        tags: item.tags || (typeof item.tagsJson === 'string' ? JSON.parse(item.tagsJson || '[]') : []),
        priority: item.priority,
      }))

      const res = await bulkSaveCommands(payload)
      // merge saved items into state
      if (res.saved.length) setCommands(prev => [...res.saved, ...prev])
      console.info(`Import: saved ${res.saved.length}, failed ${res.failed.length}`)
    } catch (err) {
      console.warn('Import failed', err)
    }
  }

  return (
    <>
      <NavBar
        onToggleMostUsed={() => setMostUsedOpen(v => !v)}
        onViewAll={() => { setShowAllPage(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onAddCommand={() => setAddOpen(true)}
        onImportCommands={onImportCommands}
        onExportCommands={exportCommands}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
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

            <MostUsed commands={commands} open={mostUsedOpen} setOpen={setMostUsedOpen} onEdit={(cmd) => { setEditCommand(cmd); setAddOpen(true) }} />

            {search.trim() !== "" && (
              <div>
                {filtered.length === 0 ? (
                  <div className="no-results" role="status" aria-live="polite">No commands found</div>
                ) : (
                  filtered.map(cmd => (
                    <CommandCard key={cmd.id} command={cmd} onUse={handleUse} onEdit={(c) => { setEditCommand(c); setAddOpen(true) }} />
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {addOpen && (
        <AddCommandModal
          onClose={() => { setAddOpen(false); setEditCommand(null) }}
          onAdd={(cmd) => { handleAdd(cmd); setEditCommand(null) }}
          onUpdate={(cmd) => { handleUpdate(cmd); setEditCommand(null) }}
          onDelete={(id) => { handleDelete(id); setEditCommand(null) }}
          initial={editCommand ?? undefined}
        />
      )}

      {showAllPage && (
        <div className="all-page-wrap">
          <AllCommandsPage commands={commands} onClose={() => { setShowAllPage(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onEdit={(cmd) => { setEditCommand(cmd); setAddOpen(true) }} />
        </div>
      )}
    </>
  )
}
