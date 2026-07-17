import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);

const windowsCandidates = [
  process.env.STRIPE_CLI_PATH,
  process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "Microsoft", "WindowsApps", "stripe.exe")
    : undefined,
  process.env.USERPROFILE
    ? join(
        process.env.USERPROFILE,
        "AppData",
        "Local",
        "Microsoft",
        "WindowsApps",
        "stripe.exe"
      )
    : undefined,
  process.env.LOCALAPPDATA
    ? join(
        process.env.LOCALAPPDATA,
        "Microsoft",
        "WinGet",
        "Links",
        "stripe.exe"
      )
    : undefined,
].filter(Boolean);

const commandCandidates = process.platform === "win32"
  ? [...windowsCandidates, "stripe.exe", "stripe"]
  : ["stripe"];

let launched = false;

for (const command of commandCandidates) {
  if (command !== "stripe" && !existsSync(command)) {
    continue;
  }

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    continue;
  }

  launched = true;

  if (typeof result.status === "number") {
    process.exit(result.status);
  }

  break;
}

if (!launched) {
  console.error(
    [
      "Stripe CLI was not found.",
      "Install it via winget:",
      "  winget install --id Stripe.StripeCli --exact",
      "Or set STRIPE_CLI_PATH to stripe.exe full path.",
    ].join("\n")
  );
  process.exit(1);
}
