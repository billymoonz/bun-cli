# TypeScript/Bun CLI Template

This repository provides a template for building Command Line Interface (CLI) applications using TypeScript and Bun. It supports dynamically loading commands, parsing arguments and options, and is designed to be extensible for future commands.

## Features

- **Dynamic Command Loading**: Commands are automatically loaded from the `commands` directory.
- **Argument Parsing**: Command-line arguments are parsed into commands and options.
- **Type Safety**: TypeScript ensures type safety for commands and options.
- **Extensible**: Easily extend the CLI by adding new commands to the `commands` folder.
- **Option Support**: Supports both flag-style options (`-flag`) and key-value options (`-option value`).

## Requirements

- **Bun**: This CLI template is built to run using [Bun](https://bun.sh/). Make sure you have Bun installed before proceeding.
- **TypeScript**: The template is written in TypeScript, so you'll need TypeScript support.

## Getting Started

### 1. Clone the Repository

```bash
git clone http://github.com/billymoonz/bun-cli.git
cd bun-cli
```

### 2. Directory Structure

- `src/commands/`: Directory where individual command files are stored. Each file should define one command.

### 3. Adding a New Command

To add a new command, create a new file in the `src/commands/` directory. The command must extend the abstract `Command` class and implement the `onExecute()` method.

```typescript
// src/commands/TestCommand.ts

import { Command } from "../index"

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

This will call the `test` command with the option `-name JohnDoe`.

### 5. Main CLI Logic

The main entry point of the CLI is defined in `src/index.ts`. It reads arguments from the command line, dynamically loads available commands, and executes the matching command if found.

```typescript
import { readdirSync } from "fs"
import { join } from "path"

export abstract class Command {...}

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

        if (foundCommand?.options.has(optionName as `-${string}`)) {
          options.set(optionName as `-${string}`, optionValue)
        } else {
          console.log(`Invalid option: ${optionName}`)
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
```

### 6. Command Structure

Each command must:

- Extend the `Command` class.
- Implement the `onExecute(args: string[], options: Map<`-${string}`, string>)` method.
- Add valid options using `this.addOptions("-option")`.

### Example:

You can create a new command like this:

```typescript
// src/commands/GreetCommand.ts

import { Command } from "../index"

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

Running the new command:

```bash
bun run src/index.ts greet -name John -greeting Hi
```

Would output:

```
Hi, John!
```

### 7. Customizing the CLI

- To add new commands, simply create new classes in the `src/commands` directory.
- Modify the `Command` class to suit your application's needs, adding methods like `validateOptions()` or `getHelp()` as necessary.
