# TypeScript/Bun CLI with YAML Configuration

This repository provides a flexible CLI framework built with TypeScript and Bun. The framework includes dynamic command loading, argument parsing, and YAML-based configuration management. It is designed to be extensible and easy to use for building custom CLI applications.

## Features

- **Dynamic Command Loading**: Automatically loads available commands from the `commands` directory.
- **Argument Parsing**: Supports parsing of arguments and options passed from the command line.
- **TypeScript Support**: Ensures type safety and maintainability.
- **YAML Configuration**: Uses a YAML file (`config.yml`) for managing configurations, such as enabling/disabling debugging.
- **Extensible Architecture**: Easily extend the CLI by adding new commands to the `commands` folder.
- **Option Support**: Handles both flag-style (`-flag`) and key-value options (`-option value`).

## Requirements

- **Bun**: The CLI is built to run using [Bun](https://bun.sh/). Ensure that Bun is installed on your system.
- **TypeScript**: The project is written in TypeScript, so TypeScript support is required for development.

## Getting Started

### 1. Clone the Repository

```bash
bunx create bun-cl1 [project_name]
cd bun-cli
```

### 2. Directory Structure

The core of the CLI is organized as follows:

- `src/commands/`: Holds individual command files. Each file defines one command by extending the `Command` class.
- `src/config.ts`: Handles YAML-based configuration management.

### 3. Adding a New Command

To add a new command, create a file inside the `src/commands/` directory. The command must extend the `Command` class and implement the `onExecute()` method.

```typescript
// src/commands/TestCommand.ts

export default class TestCommand extends Command {
  constructor() {
    super("test", "t") // Command prefix and aliases
    this.addOptions("-name") // Define valid options
  }

  onExecute(args: string[], options: Map<`-${string}`, string>): void {
    console.log("Arguments:", args)
    console.log("Options:", options)
  }
}
```

### 4. Running the CLI

You can run the CLI using Bun:

```bash
bun run src/index.ts <command> [args] [options]
```

For example:

```bash
bun run src/index.ts test -name JohnDoe
```

This executes the `test` command with the option `-name JohnDoe`.

### 5. YAML Configuration Management

The CLI uses a YAML-based configuration system to store and manage settings. The configuration file (`config.yml`) will be created automatically if it doesn’t exist.

Default configuration (`config.yml`):

```yaml
DEBUGGING: false
```

You can access or modify configuration values in your commands:

```typescript
// Accessing and modifying config within a command
const debugMode = CLI.yamlConfig.getValue("DEBUGGING")
CLI.yamlConfig.setValue("DEBUGGING", true)
```

### 6. Command Structure

Each command must:

- Extend the `Command` class.
- Implement the `onExecute(args: string[], options: Map<`-${string}`, string>)` method.
- Define valid options using `this.addOptions("-option")`.

### Example:

```typescript
// src/commands/GreetCommand.ts

export default class GreetCommand extends Command {
  constructor() {
    super("greet", "hello") // Command prefix and alias
    this.addOptions("-name", "-greeting") // Define valid options
  }

  onExecute(args: string[], options: Map<`-${string}`, string>): void {
    const name = options.get("-name") || "World"
    const greeting = options.get("-greeting") || "Hello"
    console.log(`${greeting}, ${name}!`)
  }
}
```

Run this command with:

```bash
bun run src/index.ts greet -name John -greeting Hi
```

This will output:

```
Hi, John!
```

### 7. Main CLI Logic

The entry point for the CLI is located in `src/index.ts`. It loads available commands from the `commands` directory and parses the arguments/options from the command line.

```typescript
// src/index.ts

import { readdirSync } from "fs"
import { join } from "path"
import { Config } from "./config"

export abstract class Command {
  public prefix: string
  public aliases: string[]
  public options: `-${string}`[] = []

  constructor(prefix: string, ...aliases: string[]) {
    this.prefix = prefix
    this.aliases = aliases
  }

  addOptions(...options: `-${string}`[]): void {
    this.options.push(...options)
  }

  abstract onExecute(args: string[], options: Map<`-${string}`, string>): void
}

export class CLI {
  static yamlConfig = new Config<{
    DEBUGGING: boolean
  }>("config.yml", { DEBUGGING: false })

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

  static findCommand(commandName: string): Command | null {
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
          if (cmd.prefix === commandName || cmd.aliases.includes(commandName)) {
            return cmd
          }
        }
      }
    }
    return null
  }

  static parseArgs(
    args: string[],
    command: Command
  ): { commandArgs: string[]; options: Map<`-${string}`, string> } {
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
        if (command.options.includes(optionName as `-${string}`)) {
          options.set(optionName as `-${string}`, optionValue)
        }
      } else {
        commandArgs.push(arg)
      }
    }
    return { commandArgs, options }
  }
}

function main(args: string[]): void {
  CLI.execute(args)
}

main(Bun.argv.splice(2))
```

### 8. Customizing the CLI

- Add new commands by creating classes in the `src/commands/` directory.
- Customize the `Command` class to add new functionalities like validation or help messages.
- Use the YAML config system to manage your CLI settings.
