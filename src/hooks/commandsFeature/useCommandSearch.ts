import { useMemo } from "react"
import type { Command } from "../../types/commandsFeature/Command"

export function useCommandSearch(
  commands: Command[],
  search: string,
  appFilter: string,
  categoryFilter: string
) {
  return useMemo(() => {
    return commands.filter(cmd => {
      const matchesSearch =
        cmd.title.toLowerCase().includes(search.toLowerCase()) ||
        cmd.command.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase()) ||
        cmd.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))

      const matchesApp =
        appFilter === "All" || cmd.app === appFilter

      const matchesCategory =
        categoryFilter === "All" || cmd.category === categoryFilter

      return matchesSearch && matchesApp && matchesCategory
    })
  }, [commands, search, appFilter, categoryFilter])
}
