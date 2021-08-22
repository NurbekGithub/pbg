import { Command, flags } from "@oclif/command";
import { TEMPLATE_NAME } from "../constants";
import { model } from "../scripts/model";

export default class DefaultAll extends Command {
  static description = "generate routes, services and types for all models";

  static examples = [`$ prisma-boilerplate-generator default-all`];

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" }),
  };

  static args = [{ name: "outFolderPath" }];

  async run() {
    const { args, flags } = this.parse(DefaultAll);

    await model(args.outFolderPath || TEMPLATE_NAME);
    const name = flags.name ?? "world";
    this.log(`hello ${name} from ./src/commands/hello.ts`);
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`);
    }
  }
}
