import { useState } from "react"
import type { Command } from "../../types/commandsFeature/Command"
import { useCommandContext } from "../../context/commandsFeature/CommandContext"
import CommandCard from "./CommandCard"
import "../../styles/commandsFeature/mostUsedDrawer.css"

interface Props {
  commands: Command[]
  open?: boolean
  setOpen?: (v: boolean) => void
  onEdit?: (cmd: Command) => void
}

export default function MostUsed({ commands, open: openProp, setOpen: setOpenProp, onEdit }: Props) {
  const usage = useCommandContext().usage
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof openProp === "boolean" ? openProp : internalOpen
  const setOpen = setOpenProp ?? setInternalOpen

  const sorted = [...commands]
    .filter(cmd => usage[cmd.id])
    .sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0))
    .slice(0, 5)

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

        {sorted.length > 0 ? (
          sorted.map(cmd => (
            <CommandCard key={cmd.id} command={cmd} onUse={() => {}} onEdit={onEdit} />
          ))
        ) : (
          <div className="most-used-empty">No usage yet — use commands to populate this list.</div>
        )}

      </aside>
    </>
  )
}
