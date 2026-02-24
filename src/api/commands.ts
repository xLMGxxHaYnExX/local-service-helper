import type { Command } from "../types/Command"

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000"

async function tryFetchWithFallback(fullUrl: string, relativePath: string, options?: RequestInit) {
  try {
    return await fetch(fullUrl, options)
  } catch (err) {
    console.warn('fetch to', fullUrl, 'failed, retrying relative path', relativePath, err)
    try {
      return await fetch(relativePath, options)
    } catch (err2) {
      console.warn('relative fetch also failed', relativePath, err2)
      throw err2
    }
  }
}

function normalize(item: any): Command {
  let tags: string[] = []
  if (Array.isArray(item.tags)) tags = item.tags
  else if (typeof item.tagsJson === "string") {
    try { tags = JSON.parse(item.tagsJson) } catch { tags = [] }
  }

  return {
    id: item.id,
    app: item.app || "",
    category: item.category || "",
    type: item.type || "command",
    title: item.title || item.id || "",
    command: item.command || "",
    description: item.description || "",
    tags,
    priority: typeof item.priority === "number" ? item.priority : 0,
  }
}

export async function fetchAllCommands(): Promise<Command[]> {
  try {
    const res = await tryFetchWithFallback(`${API_BASE}/api/commands`, `/api/commands`)
    if (!res.ok) throw new Error(`status:${res.status}`)
    const raw = await res.json()
    const arr = Array.isArray(raw) ? raw : []
    return arr.map(normalize)
  } catch (err) {
    console.warn("fetchAllCommands failed", err)
    return []
  }
}

export async function fetchCommandById(id: string): Promise<Command | null> {
  try {
    const res = await tryFetchWithFallback(`${API_BASE}/api/commands/${encodeURIComponent(id)}`, `/api/commands/${encodeURIComponent(id)}`)
    if (!res.ok) return null
    const raw = await res.json()
    return normalize(raw)
  } catch (err) {
    console.warn("fetchCommandById failed", err)
    return null
  }

}

export async function createCommand(payload: Partial<Command>): Promise<Command | null> {
  try {
    // backend expects tagsJson (string) rather than tags array in some implementations
    const bodyPayload: any = { ...payload }
    if (Array.isArray(bodyPayload.tags)) {
      bodyPayload.tagsJson = JSON.stringify(bodyPayload.tags)
      delete bodyPayload.tags
    }

    const res = await tryFetchWithFallback(`${API_BASE}/api/commands`, `/api/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.warn("createCommand failed status", res.status, errText)
      return null
    }
    const raw = await res.json()
    return normalize(raw)
  } catch (err) {
    console.warn("createCommand failed", err)
    return null
  }
}

export async function updateCommand(id: string, payload: Partial<Command>): Promise<Command | null> {
  try {
    const bodyPayload: any = { ...payload }
    if (Array.isArray(bodyPayload.tags)) {
      bodyPayload.tagsJson = JSON.stringify(bodyPayload.tags)
      delete bodyPayload.tags
    }

    const putOptions: RequestInit = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    }

    const res = await tryFetchWithFallback(`${API_BASE}/api/commands/${encodeURIComponent(id)}`, `/api/commands/${encodeURIComponent(id)}`, putOptions)

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.warn("updateCommand failed status", res.status, errText)

      // If the server returns 404 Not Found for the PUT, try the relative PUT path directly
      if (res.status === 404) {
        try {
          console.warn('updateCommand received 404 — attempting PUT to relative /api/commands/:id')
          const relPath = `/api/commands/${encodeURIComponent(id)}`
          const relRes = await fetch(relPath, putOptions)
          if (relRes.ok) {
            const rawRel = await relRes.json().catch(() => null)
            if (rawRel) return normalize(rawRel)
          }
          const relText = await relRes.text().catch(() => '')
          console.warn('relative PUT failed', relRes.status, relText)
        } catch (pe) {
          console.warn('relative PUT attempt failed', pe)
        }

        // As a last resort, try POST upsert (may return 409 if already exists)
        try {
          console.warn('attempting POST upsert to /api/commands as last resort')
          const postRes = await tryFetchWithFallback(`${API_BASE}/api/commands`, `/api/commands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
          })
          if (postRes.ok) {
            const rawPost = await postRes.json().catch(() => null)
            if (rawPost) return normalize(rawPost)
          } else {
            const postErr = await postRes.text().catch(() => '')
            console.warn('POST upsert also failed', postRes.status, postErr)
          }
        } catch (pe) {
          console.warn('POST upsert attempt failed', pe)
        }
      }

      return null
    }

    const raw = await res.json()
    return normalize(raw)
  } catch (err) {
    console.warn("updateCommand failed", err)
    return null
  }
}

export async function deleteCommand(id: string): Promise<boolean> {
  try {
    const res = await tryFetchWithFallback(`${API_BASE}/api/commands/${encodeURIComponent(id)}`, `/api/commands/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.warn('deleteCommand failed', res.status, txt)
      return false
    }
    return true
  } catch (err) {
    console.warn('deleteCommand failed', err)
    return false
  }
}

export async function bulkSaveCommands(commands: Partial<Command>[]): Promise<{ saved: Command[]; failed: Partial<Command>[] }>{
  const saved: Command[] = []
  const failed: Partial<Command>[] = []

  for (const cmd of commands) {
    try {
      const created = await createCommand(cmd)
      if (created) { saved.push(created); continue }

      // try update if create failed (maybe exists)
      if (cmd.id) {
        const updated = await updateCommand(cmd.id, cmd)
        if (updated) { saved.push(updated); continue }
      }

      failed.push(cmd)
    } catch (err) {
      console.warn('bulkSaveCommands item failed', err)
      failed.push(cmd)
    }
  }

  return { saved, failed }
}
