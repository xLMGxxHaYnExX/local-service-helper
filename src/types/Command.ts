export interface Command {
  id: string
  app: string
  category: string
  type: "command" | "shortcut"
  title: string
  command: string
  description: string
  tags: string[]
  priority: number
}