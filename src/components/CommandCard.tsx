import { useState } from "react"
import { useCommandContext } from "../context/CommandContext"
import type { Command } from "../types/Command"
import "../styles/CommandCard.css"

interface Props {
  command: Command
  onUse: (id: string) => void
}

export default function CommandCard({ command, onUse }: Props) {
  const { incrementUsage } = useCommandContext()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command.command)
      onUse(command.id)
      incrementUsage(command.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore clipboard errors
    }
  }

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      copy()
    }
  }

  return (
    <div className="command-card">
      <strong>{command.title}</strong>
      <div className="command-card-meta">
        {command.app} | {command.category}
      </div>

      <pre
        className={`command-card-pre ${copied ? 'copied' : ''}`}
        onClick={copy}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`Copy command: ${command.command}`}
      >
        {command.command}
      </pre>

      <p className="command-card-description">{command.description}</p>
    </div>
  )
}
