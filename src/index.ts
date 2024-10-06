import { readdirSync } from "fs"
import { join } from "path"

export abstract class Command {
  public prefix: string
  public aliases: string[]
  public options: `-${string}`[] = []

  constructor(prefix: string, ...aliases: string[]) {
    this.prefix = prefix
    this.aliases = aliases
  }

  addOptions(...options: `-${string}`[]) {
    this.options.push(...options)
  }

  abstract onExecute(args: string[], options: Map<`-${string}`, string>): void
}

function main(args: string[]) {
  let foundCommand: Command | null = null
  const commandFiles = readdirSync(join(__dirname, "commands")).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  )
  for (const file of commandFiles) {
    const { default: CommandFunction } = require(join(
      __dirname,
      "commands",
      file
    ))
    if (CommandFunction && typeof CommandFunction === "function") {
      const cmd = new CommandFunction()
      if (cmd instanceof Command) {
        const commandName = args[0].toLowerCase()
        if (cmd.prefix === commandName || cmd.aliases.includes(commandName)) {
          foundCommand = cmd
          break
        }
      }
    }
  }
  if (foundCommand) {
    let commandArgs: string[] = []
    const options = new Map<`-${string}`, string>()
    for (let i = 1; i < args.length; i++) {
      const arg = args[i]
      if (arg.startsWith("-")) {
        const optionName = arg
        let optionValue = "true"
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          optionValue = args[i + 1]
          i++
        }
        if (foundCommand?.options.includes(optionName as `-${string}`)) {
          options.set(optionName as `-${string}`, optionValue)
        }
      } else {
        commandArgs.push(arg)
      }
    }
    foundCommand.onExecute(commandArgs, options)
  } else {
    console.log("Command not found.")
  }
}

main(Bun.argv.splice(2))
