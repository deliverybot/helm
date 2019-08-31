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
      target_url: url,
    });
  } catch (error) {
    core.warning(`Failed to set deployment status: ${error.message}`);
  }
}

function releaseName(name, track) {
  if (track !== "stable") {
    return `${name}-${track}`
  }
  return name
}

function chartName(name) {
  if (name === "app") {
    return "/usr/src/charts/app"
  }
  return name
}

function getValues(values) {
  if (!values) {
    return "{}"
  }
  if (typeof values === "object") {
    return JSON.stringify(values)
  }
  return values
}

function getInput(name, options) {
  const context = github.context;
  const deployment = context.payload.deployment;
  let val = core.getInput(name, { ...options, required: false })
  if (deployment) {
    if (deployment[name]) val = deployment[name];
    if (deployment.payload[name]) val = deployment.payload[name];
  }
  if (options && options.required && !val) {
    throw new Error(`Input required and not supplied: ${name}`);
  }
  core.debug(`param: ${name} = "${val}"`)
  return val
}

/**
 * Run executes the helm deployment.
 */
async function run() {
  try {
    await status("pending");

    const track = getInput("track") || "stable";
    const release = releaseName(getInput("release", required), track);
    const namespace = getInput("namespace", required);
    const chart = chartName(getInput("chart", required));
    const values = getValues(getInput("values"));
    const dryRun = getInput("dry-run");
    const task = getInput("task");
    const version = getInput("version");

    // Setup command options and arguments.
    const opts = { env: {} };
    const args = [
      "upgrade", release, chart,
      "--install", "--wait", "--atomic",
      "--namespace", namespace,
      "--values", "./values.yml",
    ];
    if (dryRun) args.push("--dry-run");
    if (version) args.push(`--set=version=${version}`)

    // Stable track only deploys service and ingress resources. Any other track
    // name can be treated like a canary deployment.
    if (track !== "stable") {
      args.push(
        "--set=service.enabled=false",
        "--set=ingress.enabled=false",
      )
    }

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
