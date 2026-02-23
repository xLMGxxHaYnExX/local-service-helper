import { useState } from "react"
import type { Command } from "../types/Command"
import "../styles/AddCommandModal.css"

interface Props {
  onClose: () => void
  onAdd: (cmd: Command) => void
}

function makeId() {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
}

export default function AddCommandModal({ onClose, onAdd }: Props) {
  const [title, setTitle] = useState("")
  const [app, setApp] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState<"command"|"shortcut">("command")
  const [command, setCommand] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [priority, setPriority] = useState<number>(500)

  const submit = () => {
    const t = title.trim()
    const c = command.trim()
    if (!t || !c) return

    const cmd: Command = {
      id: makeId(),
      title: t,
      app: app || "Custom",
      category: category || "Uncategorized",
      type,
      command: c,
      description: description || "",
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
      priority: Number(priority) || 500
    }

    onAdd(cmd)
    onClose()
  }

  return (
    <div className="add-modal-overlay" onClick={onClose} role="dialog">
      <div className="add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-modal-header">
          <h3>Add Command</h3>
          <button className="add-close" onClick={onClose}>✕</button>
        </div>

        <div className="add-modal-body">
          <label>Title (required)
            <input value={title} onChange={e => setTitle(e.target.value)} />
          </label>

          <label>App
            <input value={app} onChange={e => setApp(e.target.value)} placeholder="e.g. Terminal" />
          </label>

          <label>Category
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Git" />
          </label>

          <label>Type
            <select value={type} onChange={e => setType(e.target.value as any)}>
              <option value="command">Command</option>
              <option value="shortcut">Shortcut</option>
            </select>
          </label>

          <label>Command (required)
            <input value={command} onChange={e => setCommand(e.target.value)} />
          </label>

          <label>Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} />
          </label>

          <label>Tags (comma separated)
            <input value={tags} onChange={e => setTags(e.target.value)} />
          </label>

          <label>Priority
            <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} />
          </label>
        </div>

        <div className="add-modal-actions">
          <button className="btn" onClick={submit}>Add</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
