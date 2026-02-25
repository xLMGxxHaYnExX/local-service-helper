import type { Command } from "../../types/commandsFeature/Command"

export function getUsage(): Record<string, number> {
  return JSON.parse(localStorage.getItem("usage") || "{}")
}

export function incrementUsage(id: string) {
  const usage = getUsage()
  usage[id] = (usage[id] || 0) + 1
  localStorage.setItem("usage", JSON.stringify(usage))
}

export function getRecentSearches(): string[] {
  return JSON.parse(localStorage.getItem("recentSearches") || "[]")
}

export function addRecentSearch(search: string) {
  if (!search.trim()) return

  const recent = getRecentSearches().filter(s => s !== search)
  const updated = [search, ...recent].slice(0, 8)

  localStorage.setItem("recentSearches", JSON.stringify(updated))
}

export function getUserCommands(): Command[] {
  return JSON.parse(localStorage.getItem("userCommands") || "[]")
}

export function addUserCommand(cmd: Command) {
  const existing = getUserCommands()
  const updated = [cmd, ...existing]
  localStorage.setItem("userCommands", JSON.stringify(updated))
}
