const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const fs = require("fs");
const util = require("util");

const writeFile = util.promisify(fs.writeFile);

const required = { required: true };

/**
 * Status marks the deployment status. Only activates if token is set as an
 * input to the job.
 *
 * @param {string} state
 */
async function status(state) {
  try {
    const context = github.context;
    const deployment = context.payload.deployment;
    const token = core.getInput("token");
    if (!token || !deployment) {
      core.debug("Not setting deployment status")
      return;
    }

    const client = new github.GitHub(token);
    const url = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`

    await client.repos.createDeploymentStatus({
      ...context.repo,
      deployment_id: deployment.id,
      state,
      log_url: url,
    });
  } catch (error) {
    core.warning(`Failed to set deployment status: ${error.message}`);
  }
}

/**
 * Run executes the helm deployment.
 */
async function run() {
  try {
    await status("pending");

    const release = core.getInput("release", required);
    const namespace = core.getInput("namespace", required);
    const chart = core.getInput("chart", required);
    const values = core.getInput("values") || "{}";
    const dryRun = core.getInput("dry-run");

    // Load in the github context and deployment event.
    const context = github.context;
    const task = (context.payload.deployment &&
                  context.payload.deployment.task) || "deploy";

    // Setup command options and arguments.
    const opts = { env: {} };
    const args = [
      "upgrade", release, chart,
      "--install", "--wait", "--atomic",
      "--namespace", namespace,
      "--values", "./values.yml",
    ];
    if (dryRun) args.push("--dry-run");

    // Setup necessary files.
    if (process.env.KUBECONFIG_FILE) {
      opts.env.KUBECONFIG = "./kubeconfig.yml";
      await writeFile(opts.env.KUBECONFIG, process.env.KUBECONFIG_FILE);
    }
    await writeFile("./values.yml", values);

    // Actually execute the deployment here.
    if (task === "remove") {
      await exec.exec("helm", ["delete", release, "--purge"], opts);
    } else {
      await exec.exec("helm", args, opts);
    }

    await status("success");
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
    await status("failure");
  }
}

run();
