import { Command, flags } from "@oclif/command";
import { TEMPLATE_NAME } from "../constants";
import { initTemplate } from "../scripts/initTemplate";

export default class Init extends Command {
  static description = "init template";

  static examples = [`$ prisma-boilerplate-generator init [OUT_FOLDER_PATH]`];

  static flags = {
    help: flags.help({ char: "h" }),
  };

  static args = [{ name: "outFolderPath" }];

  async run() {
    const { args } = this.parse(Init);

    initTemplate(args.outFolderPath || TEMPLATE_NAME);
  }
}
