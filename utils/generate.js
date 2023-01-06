const ora = require("ora"); // SPINNER A
const path = require("path");
const execa = require("execa");
const alert = require("cli-alerts");
const copy = require("copy-template-dir");
const { green: g, yellow: y, dim: d } = require("chalk"); // deconstruct chalk and call green w/ alias: 'g'

const spinner = ora({ text: "" }); // SPINNER B
const questions = require("./questions");

module.exports = async () => {
  const vars = await questions();
  const outDir = vars.name;
  const inDirPath = path.join(__dirname, `../template`);
  console.log("inDirPath: ", inDirPath);
  const outDirPath = path.join(process.cwd(), outDir);

  copy(inDirPath, outDirPath, vars, async (err, createdFiles) => {
    if (err) throw err;

    console.log(d(`\nCreating files in ${g(`./${outDir}`)} directory:\n`));

    createdFiles.forEach((filePath) => {
      const fileName = path.basename(filePath);
      console.log(`${g(`CREATED`)}: ${fileName}`);
    });

    spinner.start(
      `${y(`DEPENDENCIES`)} installing...\n\n${d(`It may take a moment...`)}`
    ); // SPINNER C
    process.chdir(outDirPath); // change directory path for 'dedupe' to 'outDirPath', rather than default CWD

    const pkgs = [
      `meow`,
      `chalk`,
      `cli-alerts`,
      `cli-welcome`,
      `cli-meow-help`,
      `cli-handle-error`,
      `cli-handle-unhandled`,
    ];

    await execa(`npm`, [`install`, ...pkgs]); // from execa; w/ spread operator in front of last const... installs all listed dependencies
    await execa(`npm`, [`install`, `prettier`, `-D`]); // installs 'prettier' as dev dependency
    await execa(`npm`, [`dedupe`]); // from execa; to run shell/terminal commands from js
    spinner.succeed(`${g(`DEPENDENCIES`)} INSTALLED!`); // SPINNER D

    alert({
      type: `success`,
      name: `ALL DONE`,
      msg: `\n\n${createdFiles.length} files created in ${d(
        `./${outDir}`
      )} directory`,
    });
  });
};
