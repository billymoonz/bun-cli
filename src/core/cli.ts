import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { Command } from "@/core/command"

export class CLI {
  static execute(args: string[]): void {
    if (args.length === 0) {
      console.log("No command provided.")
      return
    }
    const foundCommand = CLI.findCommand(args[0].toLowerCase())
    if (foundCommand) {
      const { commandArgs, options } = CLI.parseArgs(args, foundCommand)
      foundCommand.onExecute(commandArgs, options)
    } else {
      console.log("Command not found.")
    }
  }

  static async askYesNoQuestion(question: string): Promise<boolean> {
    console.log(`${question} (y/n)`)
    const reader = Bun.stdin.stream().getReader()
    const { value } = await reader.read()
    const userInput = new TextDecoder().decode(value).trim().toLowerCase()
    if (userInput === "y" || userInput === "yes") {
      return true
    } else if (userInput === "n" || userInput === "no") {
      return false
    } else {
      console.log("Invalid input. Please answer 'y' or 'n'.")
      return CLI.askYesNoQuestion(question)
    }
  }

  static findCommand(commandName: string): Command | null {
    const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    )
    for (const file of commandFiles) {
      const { default: CommandFunction } = require(join(
        __dirname,
        "..",
        "commands",
        file
      ))
      if (CommandFunction && typeof CommandFunction === "function") {
        const cmd = new CommandFunction()
        if (cmd instanceof Command) {
          if (cmd.prefix === commandName || cmd.aliases.includes(commandName)) {
            return cmd
          }
        }
      }
    }
    return null
  }

  static getVersion(): string | null {
    try {
      const packageJsonPath = join(process.cwd(), "package.json")
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
      return packageJson.version
    } catch {
      console.error("An error occurred loading CLI version.")
      return null
    }
  }

  static parseArgs(
    args: string[],
    command: Command
  ): { commandArgs: string[]; options: Record<string, string> } {
    let commandArgs: string[] = []
    const options = {} as Record<string, string>
    for (let i = 1; i < args.length; i++) {
      const arg = args[i]
      if (arg.startsWith("-")) {
        const optionName = arg.substring(1)
        let optionValue = "true"
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          optionValue = args[i + 1]
          i++
        }
        if (command.options.includes(optionName)) {
          options[optionName] = optionValue
        }
      } else {
        commandArgs.push(arg)
      }
    }
    return { commandArgs, options }
  }
}
