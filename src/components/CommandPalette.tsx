import { useEffect, useState, useMemo, useRef } from "react"
import type { Command } from "../types/Command"
import { useCommandContext } from "../context/CommandContext"
import "../styles/palette.css"
import Fuse from "fuse.js"

interface Props {
  commands: Command[]
}

export default function CommandPalette({ commands }: Props) {

  const { usage, incrementUsage } = useCommandContext()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const fuse = useMemo(
    () =>
      new Fuse<Command>(commands, {
        keys: ["title", "command"],
        threshold: 0.4,
      }),
    [commands]
  )

  const filtered = useMemo(() => {
    const base = search
      ? fuse.search(search).map(result => result.item)
      : commands

    return [...base].sort((a, b) => {
      const usageScore = (usage[b.id] || 0) - (usage[a.id] || 0)
      const priorityScore = b.priority - a.priority
      return usageScore !== 0 ? usageScore : priorityScore
    })
  }, [commands, search, fuse, usage])

  const visible = filtered.slice(0, 8)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-command-palette", handler as EventListener)
    return () => window.removeEventListener("open-command-palette", handler as EventListener)
  }, [])

  // close when clicking outside the modal (click on overlay)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {

      // Ctrl + K toggle
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
        setSelectedIndex(0)
        setSearch("")
        return
      }

      if (!open) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < visible.length - 1 ? prev + 1 : 0
        )
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : visible.length - 1
        )
      }

      if (e.key === "Enter") {
        e.preventDefault()
        const selected = visible[selectedIndex]
        if (selected) {
          navigator.clipboard.writeText(selected.command)
          incrementUsage(selected.id)
          setOpen(false)
          setSearch("")
          setSelectedIndex(0)
        }
      }

      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)

  }, [open, filtered, selectedIndex, incrementUsage, visible.length, visible])

  if (!open) return null

  return (
    <div
      className="palette-overlay"
      ref={overlayRef as unknown as React.RefObject<HTMLDivElement>}
      onClick={(e) => {
        // close if click target is overlay (outside modal)
        if (e.target === overlayRef.current) {
          setOpen(false)
        }
      }}
    >
      <div className="palette-modal" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="palette-input"
          placeholder="Search commands..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setSelectedIndex(0)
          }}
        />

        {visible.length === 0 ? (
            <div className="no-results" role="status" aria-live="polite">
                No commands found
            </div>
            ) : (
            <ul className="results">
        {visible.map((cmd, index) => (
          <div
            key={cmd.id}
            className={`palette-item ${
              index === selectedIndex ? "selected" : ""
            }`}
            onClick={() => {
              navigator.clipboard.writeText(cmd.command)
              incrementUsage(cmd.id)
              setOpen(false)
              setSearch("")
              setSelectedIndex(0)
            }}
          >
            <strong>{cmd.title}</strong>
            <div className="palette-command">
              {cmd.command}
            </div>
          </div>
        ))}
          </ul>
        )}
      </div>
    </div>
  )
}