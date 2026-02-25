import type { Command } from "../../types/commandsFeature/Command"
import "../../styles/commandsFeature/ImportPreviewModal.css"
import React from "react"

interface Props {
  items: Partial<Command>[]
  onClose: () => void
  onConfirm: (items: Partial<Command>[]) => void
  importing: boolean
  progress: number // 0..1
}

export default function ImportPreviewModal({ items, onClose, onConfirm, importing, progress }: Props) {
  const [local, setLocal] = React.useState<Partial<Command>[]>(items)
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({})
  const [errors, setErrors] = React.useState<Record<number, string>>({})

  React.useEffect(() => setLocal(items), [items])

  function toggleExpand(i: number) {
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }))
  }

  function updateJson(i: number, text: string) {
    try {
      const parsed = JSON.parse(text)
      setLocal(prev => {
        const copy = prev.slice()
        copy[i] = parsed
        return copy
      })
      setErrors(prev => { const c = { ...prev }; delete c[i]; return c })
    } catch (err: unknown) {
      setErrors(prev => ({ ...prev, [i]: (err as Error)?.message ?? 'Invalid JSON' }))
    }
  }

  const allValid = Object.keys(errors).length === 0

  return (
    <div className="import-preview-overlay" onClick={onClose} role="dialog">
      <div className="import-preview" onClick={e => e.stopPropagation()}>
        <div className="import-preview-header">
          <h3>Import Preview</h3>
          <button className="add-close" onClick={onClose}>✕</button>
        </div>

        <div className="import-preview-body">
          <div className="import-count">{local.length} item{local.length !== 1 ? 's' : ''} found</div>
          <div className="import-list">
            {local.slice(0, 200).map((it, idx) => (
              <div className="import-item" key={idx}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div className="import-item-title">{String(it.title ?? it.id ?? '(no title)')}</div>
                    <div className="import-item-sub">{String(it.command ?? '')}</div>
                  </div>
                  <div>
                    <button className="btn btn-ghost" onClick={() => toggleExpand(idx)}>{expanded[idx] ? 'Close' : 'Edit JSON'}</button>
                  </div>
                </div>

                {expanded[idx] && (
                  <div style={{marginTop:8}}>
                    <textarea className="import-json-edit" defaultValue={JSON.stringify(it, null, 2)} onChange={e => updateJson(idx, e.target.value)} />
                    {errors[idx] && <div className="field-error">{errors[idx]}</div>}
                  </div>
                )}
              </div>
            ))}
            {local.length > 200 && <div className="import-more">Showing first 200 items</div>}
          </div>
        </div>

        <div className="import-preview-actions">
          {!importing && (
            <>
              <button className="btn" onClick={() => { if (allValid) onConfirm(local) }} disabled={!allValid}>Import</button>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </>
          )}

          {importing && (
            <div className="import-progress-wrap">
              <div className="import-progress-bar">
                <div className="import-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="import-progress-text">{Math.round(progress * 100)}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
