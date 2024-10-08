import { existsSync, readdirSync, readFileSync } from "fs"
import path from "path"
import { Command } from "@/core/command"

export class CLI {
  // === High-Level Command Execution ===
  static execute(args: string[]): void {
    if (args.length === 0) {
      console.error(
        "No command provided. Use 'help' to see the list of available commands."
      )
      return
    }
    const foundCommand = CLI.findCommand(args[0].toLowerCase())
    if (foundCommand) {
      const { commandArgs, options } = CLI.parseArgs(args, foundCommand)
      foundCommand.onExecute(commandArgs, options)
    } else {
      console.error("Command not found.")
    }
  }

  // === Command Handling Methods ===
  static findCommand(commandName: string): Command | null {
    const commands = this.getCommands()
    for (const cmd of commands) {
      if (cmd.prefix === commandName || cmd.aliases.includes(commandName)) {
        return cmd
      }
    }
    return null
  }

  static getCommands(): Command[] {
    const commandsDir = path.join(__dirname, "..", "commands")
    if (!existsSync(commandsDir)) {
      console.error("Commands directory not found.")
      return []
    }
    const commandFiles = readdirSync(commandsDir).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    )
    const commands: Command[] = []
    for (const file of commandFiles) {
      const { default: CommandFunction } = require(path.join(commandsDir, file))
      if (CommandFunction && typeof CommandFunction === "function") {
        const cmd = new CommandFunction()
        if (cmd instanceof Command) {
          commands.push(cmd)
        }
      }
    }
    return commands
  }

  private static parseArgs(
    args: string[],
    command: Command
  ): { commandArgs: string[]; options: Record<string, string> } {
    const commandArgs: string[] = []
    const options = {} as Record<string, string>
    for (let i = 1; i < args.length; i++) {
      const arg = args[i]
      if (arg.startsWith("--")) {
        const optionName = arg.substring(2)
        let optionValue = "true"
        if (optionName.startsWith("no-")) {
          optionValue = "false"
        }
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          optionValue = args[i + 1]
          i++
        }
        if (command.options.includes(optionName)) {
          options[optionName] = optionValue
        }
      } else if (arg.startsWith("-")) {
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

  // === User Interaction Methods ===
  static async confirm(question: string): Promise<boolean> {
    const reader = Bun.stdin.stream().getReader()
    while (true) {
      console.log(`${question} (y/n)`)
      const { value } = await reader.read()
      const userInput = new TextDecoder().decode(value).trim().toLowerCase()
      if (userInput === "y" || userInput === "yes") {
        reader.releaseLock()
        return true
      } else if (userInput === "n" || userInput === "no") {
        reader.releaseLock()
        return false
      } else {
        console.error("Invalid input. Please answer 'y' or 'n'.")
      }
    }
  }

  static async confirmWithDefault(
    question: string,
    defaultYes: boolean = true
  ): Promise<boolean> {
    const defaultPrompt = defaultYes ? "[Y/n]" : "[y/N]"
    const reader = Bun.stdin.stream().getReader()
    while (true) {
      console.log(`${question} ${defaultPrompt}`)
      const { value } = await reader.read()
      const userInput = new TextDecoder().decode(value).trim().toLowerCase()
      reader.releaseLock()
      if (userInput === "" && defaultYes) return true
      if (userInput === "" && !defaultYes) return false
      if (userInput === "y" || userInput === "yes") return true
      if (userInput === "n" || userInput === "no") return false
      console.error("Invalid input. Please answer 'y' or 'n'.")
    }
  }

  static async selectOption(options: string[]): Promise<string> {
    const reader = Bun.stdin.stream().getReader()
    while (true) {
      console.log("Please choose one of the following options:")
      options.forEach((option, index) => {
        console.log(`${index + 1}: ${option}`)
      })
      console.log("Enter the number of your choice:")
      const { value } = await reader.read()
      const userInput = new TextDecoder().decode(value).trim()
      if (/^\d+$/.test(userInput)) {
        const selectedIndex = parseInt(userInput, 10)
        if (selectedIndex > 0 && selectedIndex <= options.length) {
          reader.releaseLock()
          return options[selectedIndex - 1]
        }
      }
      console.error(
        "Invalid input. Please enter a valid number corresponding to the options listed."
      )
    }
  }

  static async input(question: string): Promise<string> {
    const reader = Bun.stdin.stream().getReader()
    console.log(question)
    while (true) {
      const { value } = await reader.read()
      const userInput = new TextDecoder().decode(value).trim()
      reader.releaseLock()
      return userInput
    }
  }

  // === Utility Methods ===
  static getVersion(): string | null {
    try {
      const packageJsonPath = path.join(process.cwd(), "package.json")
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
      return packageJson.version
    } catch {
      console.error("An error occurred loading CLI version.")
      return null
    }
  }

  static displayHelp(): void {
    const commands = this.getCommands()
    console.log("Available Commands:")
    for (const cmd of commands) {
      console.log(`- ${cmd.prefix}: ${cmd.description}`)
    }
  }
}
