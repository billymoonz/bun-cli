import { CLI } from "@/core/cli"

function main(args: string[]) {
  CLI.execute(args)
}

main(Bun.argv.splice(2))
