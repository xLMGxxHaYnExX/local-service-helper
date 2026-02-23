import { useState, useRef, useEffect } from "react"
import "../styles/NavBar.css"

interface Props {
  onToggleMostUsed: () => void
  onViewAll: () => void
  onAddCommand?: () => void
  onExportCommands?: () => void
}

export default function NavBar({ onToggleMostUsed, onViewAll, onAddCommand, onExportCommands }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("click", onDoc)
    return () => document.removeEventListener("click", onDoc)
  }, [])

  return (
    <header className="nav-bar">
      <div className="nav-inner">
        <div className="nav-left">
          <div className="nav-logo">⚡</div>
          <div className="nav-title">Dev Command Hub</div>
        </div>

        <div className="nav-right" ref={ref}>
          <button
            className="nav-hamburger"
            aria-label="Open menu"
            onClick={() => setOpen(v => !v)}
          >
            ☰
          </button>

          {open && (
            <div className="nav-dropdown">
              <button className="nav-dropdown-item" onClick={() => { onToggleMostUsed(); setOpen(false) }}>
                Most Used
              </button>
              <button className="nav-dropdown-item" onClick={() => { onViewAll(); setOpen(false) }}>
                View All Commands
              </button>
              <button className="nav-dropdown-item" onClick={() => { onAddCommand && onAddCommand(); setOpen(false) }}>
                Add Command
              </button>
              <button className="nav-dropdown-item" onClick={() => { onExportCommands && onExportCommands(); setOpen(false) }}>
                Export Commands
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
