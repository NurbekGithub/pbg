import { Command, flags } from "@oclif/command";
import { TEMPLATE_NAME } from "../constants";
import { generateAllDefault } from "../scripts/default-all";

export default class DefaultAll extends Command {
  static description = "generate routes, services and types for all prisma models";

  static examples = [`$ prisma-boilerplate-generator default-all [OUT_FOLDER_PATH]`];

  static flags = {
    help: flags.help({ char: "h" }),
  };

  static args = [{ name: "outFolderPath" }];

  async run() {
    const { args } = this.parse(DefaultAll);

    await generateAllDefault(args.outFolderPath || TEMPLATE_NAME);
  }
}
