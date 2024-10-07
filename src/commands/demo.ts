import { Command } from "@/core/command"

export default class HelloCommand extends Command {
  prefix = "hello"
  description = "A basic greeting command."
  options = ["greeting", "name"]

  onExecute(args: string[], options: Record<string, string>): void {
    const greeting = options.greeting ?? "Hello"
    const name = options.name ?? "World"
    console.log(`${greeting}, ${name}!`)
  }
}
