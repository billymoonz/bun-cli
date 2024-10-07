import { Command } from "@/core/command"
import { CLI } from "@/core/cli"

export default class VersionCommand extends Command {
  prefix = "version"
  aliases = ["--version", "-v"]
  description = "View the current CLI version."

  onExecute(args: string[], options: Record<string, string>): void {
    console.log(CLI.getVersion())
  }
}
