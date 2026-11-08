import { spawnSync } from "node:child_process";
import { platform } from "node:os";
import { resolve } from "node:path";

const args = ["oazapfts", "../cloud/specs/openapi.yml", "src/api/index.ts"];

if (platform() === "win32") {
  // CLI oazapfts падает на Windows (__dirname в ESM-бандле), поэтому
  // генерируем через WSL против того же node_modules.
  const winPath = resolve(".");
  const wslPath = `/mnt/${winPath[0].toLowerCase()}${winPath.slice(2).replaceAll("\\", "/")}`;
  const result = spawnSync(
    "wsl",
    ["-d", "Ubuntu", "--", "bash", "-c", `cd ${wslPath} && npx ${args.join(" ")}`],
    { stdio: "inherit" }
  );
  process.exit(result.status ?? 1);
}

const result = spawnSync("npx", args, { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
