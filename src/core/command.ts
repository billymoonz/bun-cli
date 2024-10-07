export abstract class Command {
  public prefix: string = ""
  public aliases: string[] = []
  public options: string[] = []
  public description: string = ""

  constructor(prefix: string, ...aliases: string[]) {
    this.prefix = prefix
    this.aliases = aliases
  }

  abstract onExecute(args: string[], options: Record<string, string>): void
}
