# CLI Framework Template

A simple and flexible CLI framework built with TypeScript and Bun.

## Getting Started

First, create a new project using the following command:

```bash
bunx create bun-cl1 [projectName]
```

This will clone the template and install the necessary dependencies.

To run the CLI:

```bash
bun cli <command> [options]
```

## Create a New Command

1. Add a new file in `src/commands/`:

```typescript
import { Command } from "@/core/command"

export default class HelloCommand extends Command {
  prefix = "hello"
  onExecute() {
    console.log("Hello, world!")
  }
}
```

2. Run your new command:

```bash
bun cli hello
```

That's it!
