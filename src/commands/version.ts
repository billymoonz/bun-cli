import { Command } from "@/core/command"
import { CLI } from "@/core/cli"

export default class VersionCommand extends Command {
  prefix = "version"
  aliases = ["--version", "-v"]

  onExecute(args: string[], options: Map<`-${string}`, string>): void {
    console.log(CLI.getVersion())
  }
}
