import { CLI } from "@/core/cli"
import { Command } from "@/core/command"

export default class HelpCommand extends Command {
  prefix = "help"
  description = "See the list of available commands."

  onExecute(args: string[], options: Record<string, string>): void {
    CLI.displayHelp()
  }
}
