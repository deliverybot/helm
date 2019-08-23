const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const fs = require("fs");
const util = require("util");

const writeFile = util.promisify(fs.writeFile);

const required = { required: true };

async function run() {
  try {
    const release = core.getInput("release", required);
    const namespace = core.getInput("namespace", required);
    const chart = core.getInput("chart", required);
    const values = core.getInput("values");
    const context = github.context;
    const deployment = context.payload.deployment;
    const opts = {
      env: {
        KUBECONFIG: "./kubeconfig.yml",
      }
    }

    await writeFile("./kubeconfig.yml", process.env.KUBECONFIG);
    await writeFile("./values.yml", values);

    if (deployment.task === "remove") {
      exec.exec("helm", ["delete", release, "--purge"], opts);
    } else {
      exec.exec("helm", [
        "upgrade", release, chart, "--install", "--wait", "--atomic",
        "--namespace", namespace, "--values"
      ], opts);
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
