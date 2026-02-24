import { useState, useEffect } from "react"
import type { Command } from "../types/Command"
import { createCommand, updateCommand, deleteCommand } from "../api/commands"
import "../styles/AddCommandModal.css"

interface Props {
  onClose: () => void
  onAdd: (cmd: Command) => void
  onUpdate?: (cmd: Command) => void
  onDelete?: (id: string) => void
  initial?: Partial<Command>
}

export default function AddCommandModal({ onClose, onAdd, onUpdate, onDelete, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [id, setId] = useState<string | undefined>(initial?.id ?? undefined)
  const [app, setApp] = useState(initial?.app ?? "")
  const [category, setCategory] = useState(initial?.category ?? "")
  const [type, setType] = useState<"command"|"shortcut">((initial?.type as any) ?? "command")
  const [command, setCommand] = useState(initial?.command ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [tags, setTags] = useState((initial?.tags ?? []).join(","))
  const [priority, setPriority] = useState<number>(initial?.priority ?? 500)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [commandError, setCommandError] = useState<string | null>(null)

  useEffect(() => {
    // if initial changes while modal open, update fields
    if (initial) {
      setTitle(initial.title ?? "")
      setId(initial.id ?? undefined)
      setApp(initial.app ?? "")
      setCategory(initial.category ?? "")
      setType((initial.type as any) ?? "command")
      setCommand(initial.command ?? "")
      setDescription(initial.description ?? "")
      setTags((initial.tags ?? []).join(","))
      setPriority(initial.priority ?? 500)
    }
  }, [initial])

  function makeId() {
    return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
  }

  const submit = async () => {
    const t = title.trim()
    const c = command.trim()
    setTitleError(null)
    setCommandError(null)
    if (!t) setTitleError('Title is required')
    if (!c) setCommandError('Command is required')
    if (!t || !c) return

    const finalId = (id && id.trim()) ? id.trim() : makeId()

    const payload: Partial<Command> = {
      id: finalId,
      title: t,
      app: app || "Custom",
      category: category || "Uncategorized",
      type,
      command: c,
      description: description || "",
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
      priority: Number(priority) || 500,
    }

    setSubmitting(true)
    setError(null)

    try {
      if (initial && initial.id) {
        const updated = await updateCommand(finalId, payload)
        if (updated) {
          if (onUpdate) onUpdate(updated)
          else onAdd(updated)
          onClose()
          return
        }
        setError('Failed to update command on server')
        setSubmitting(false)
        return
      }

      const created = await createCommand(payload)
      if (created) {
        onAdd(created)
        onClose()
        return
      }

      // fallback: try update if create didn't return
      try {
        const updated = await updateCommand(finalId, payload)
        if (updated) {
          if (onUpdate) onUpdate(updated)
          else onAdd(updated)
          onClose()
          return
        }
        setError('Failed to create or update command on server')
        setSubmitting(false)
      } catch (ue) {
        console.warn('update error', ue)
        setError('Failed to create or update command on server')
        setSubmitting(false)
      }
    } catch (err) {
      console.warn(err)
      setError('Unexpected error')
      setSubmitting(false)
    }
  }

  const isEdit = Boolean(initial && initial.id)

  async function handleDelete() {
    if (!id) return

    // two-step confirmation
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    try {
      setSubmitting(true)
      const ok = await deleteCommand(id)
      setSubmitting(false)
      setConfirmDelete(false)
      if (ok) {
        onClose()
        if (typeof onDelete === 'function') onDelete(id)
        return
      }
      setError('Failed to delete command on server')
    } catch (err) {
      console.warn('delete error', err)
      setError('Failed to delete command on server')
      setSubmitting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="add-modal-overlay" onClick={onClose} role="dialog">
      <div className="add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-modal-header">
          <h3>{isEdit ? 'Edit Command' : 'Add Command'}</h3>
          <button className="add-close" onClick={onClose}>✕</button>
        </div>

        <div className="add-modal-body">
          <label>ID (optional)
            <input value={id ?? ""} onChange={e => setId(e.target.value)} placeholder="custom-cmd" readOnly={isEdit} />
          </label>

          <label>Title (required)
            <input value={title} onChange={e => setTitle(e.target.value)} />
            {titleError && <div className="field-error">{titleError}</div>}
          </label>

          <label>App
            <input value={app} onChange={e => setApp(e.target.value)} placeholder="e.g. Terminal" />
          </label>

          <label>Category
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Git" />
          </label>

          <label>Command (required)
            <input value={command} onChange={e => setCommand(e.target.value)} />
            {commandError && <div className="field-error">{commandError}</div>}
          </label>

          <label>Priority
            <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} />
          </label>

          <label>Type
            <select value={type} onChange={e => setType(e.target.value as any)}>
              <option value="command">Command</option>
              <option value="shortcut">Shortcut</option>
            </select>
          </label>

          <label>Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} />
          </label>

          <label className="tags-label">Tags (comma separated)
            <input value={tags} onChange={e => setTags(e.target.value)} />
          </label>
        </div>

        <div className="add-modal-actions">
          <button className="btn" onClick={submit} disabled={submitting}>{submitting ? 'Saving…' : (isEdit ? 'Update' : 'Add')}</button>
          <button className="btn btn-ghost" onClick={() => { setConfirmDelete(false); onClose() }} disabled={submitting}>Cancel</button>
          {isEdit && (
            <>
              {!confirmDelete && (
                <button className="btn btn-danger" onClick={() => setConfirmDelete(true)} disabled={submitting} title="Delete command">🗑️</button>
              )}
              {confirmDelete && (
                <>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>Confirm Delete</button>
                  <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)} disabled={submitting}>Cancel</button>
                </>
              )}
            </>
          )}
        </div>
        {error && <div style={{ color: 'salmon', padding: 8 }}>{error}</div>}
      </div>
    </div>
  )
}
