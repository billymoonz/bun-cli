import { Command } from "../index"

export default class TestCommand extends Command {
  constructor() {
    super("test")
    this.addOptions("-name")
  }
  onExecute(args: string[], options: Map<string, string>): void {
    console.log(args)
    console.log(options)
  }
}
