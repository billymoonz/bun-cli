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
