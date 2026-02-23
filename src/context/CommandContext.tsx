import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

interface ContextType {
  usage: Record<string, number>
  incrementUsage: (id: string) => void
}

const CommandContext = createContext<ContextType | null>(null)

export function CommandProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<Record<string, number>>(
    JSON.parse(localStorage.getItem("usage") || "{}")
  )

  const incrementUsage = (id: string) => {
    setUsage(prev => {
      const updated = { ...prev, [id]: (prev[id] || 0) + 1 }
      localStorage.setItem("usage", JSON.stringify(updated))
      return updated
    })
  }

  return (
    <CommandContext.Provider value={{ usage, incrementUsage }}>
      {children}
    </CommandContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommandContext() {
  const ctx = useContext(CommandContext)
  if (!ctx) throw new Error("Use inside CommandProvider")
  return ctx
}