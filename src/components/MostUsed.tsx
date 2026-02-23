import { useState } from "react"
import type { Command } from "../types/Command"
import { useCommandContext } from "../context/CommandContext"
import CommandCard from "./CommandCard"
import "../styles/mostUsedDrawer.css"

interface Props {
  commands: Command[]
  open?: boolean
  setOpen?: (v: boolean) => void
}

export default function MostUsed({ commands, open: openProp, setOpen: setOpenProp }: Props) {
  const usage = useCommandContext().usage
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof openProp === "boolean" ? openProp : internalOpen
  const setOpen = setOpenProp ?? setInternalOpen

  const sorted = [...commands]
    .filter(cmd => usage[cmd.id])
    .sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0))
    .slice(0, 5)

  if (sorted.length === 0) return null

  return (
    <>
      {open && (
        <div
          className="most-used-backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`most-used-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <h2 className="most-used-title">🔥 Most Used</h2>

        {sorted.map(cmd => (
          <CommandCard key={cmd.id} command={cmd} onUse={() => {}} />
        ))}

        {/* Removed View All button from drawer - navigation should be triggered from NavBar only */}
      </aside>
    </>
  )
}