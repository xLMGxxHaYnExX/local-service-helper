import { useState, useRef, useEffect } from "react"
import "../../styles/commandsFeature/NavBar.css"

interface Props {
  onToggleMostUsed: () => void
  onViewAll: () => void
  onAddCommand?: () => void
  onImportCommands?: () => void
  onExportCommands?: () => void
}

export default function NavBar({ onToggleMostUsed, onViewAll, onAddCommand, onImportCommands, onExportCommands }: Props) {
  const [open, setOpen] = useState(false)
  const [commandsOpen, setCommandsOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  // close nested submenu when main dropdown closes
  useEffect(() => {
    if (!open) {
      // schedule to avoid sync state update inside effect
      const t = setTimeout(() => setCommandsOpen(false), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  // helper to close with animation when possible
  const closeWithAnim = (after?: () => void) => {
    if (!ref.current) { setOpen(false); setCommandsOpen(false); return }
    const node = ref.current.querySelector('.nav-dropdown') as HTMLElement | null
    if (!node) { setOpen(false); setCommandsOpen(false); return }
    node.classList.add('closing')
    const onAnim = () => {
      setOpen(false)
      setCommandsOpen(false)
      node.classList.remove('closing')
      node.removeEventListener('animationend', onAnim)
      if (after) after()
    }
    node.addEventListener('animationend', onAnim)
  }

  // listen for outside clicks and Escape key to close with animation
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) {
        if (open) closeWithAnim()
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) closeWithAnim()
    }

    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

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
            onClick={() => {
              if (open) closeWithAnim()
              else setOpen(true)
            }}
          >
            ☰
          </button>

          {open && (
            <div className="nav-dropdown">
              <div className="nav-dropdown-list">

                <div>
                  <button className="nav-dropdown-item primary" onClick={() => { setCommandsOpen(v => !v) }}>
                    Commands
                  </button>

                  {commandsOpen && (
                    <div className="nav-submenu">
                      <button className="nav-dropdown-item nav-subitem" onClick={() => { closeWithAnim(() => onViewAll()) }}>
                        View All
                      </button>
                      <button className="nav-dropdown-item nav-subitem" onClick={() => { closeWithAnim(() => { if (onImportCommands) onImportCommands() }) }}>
                        Import
                      </button>
                      <button className="nav-dropdown-item nav-subitem" onClick={() => { closeWithAnim(() => { if (onExportCommands) onExportCommands() }) }}>
                        Export
                      </button>
                      <button className="nav-dropdown-item nav-subitem" onClick={() => { closeWithAnim(() => { if (onAddCommand) onAddCommand() }) }}>
                        Add
                      </button>
                      <button className="nav-dropdown-item nav-subitem" onClick={() => { closeWithAnim(() => onToggleMostUsed()) }}>
                        Most Used
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
