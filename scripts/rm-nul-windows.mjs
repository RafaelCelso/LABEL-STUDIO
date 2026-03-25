/**
 * Windows: a file literally named `nul` in the project root breaks PostCSS/Turbopack
 * (reserved device name). Remove it via extended-length path if present.
 */
import fs from "node:fs";
import path from "node:path";

if (process.platform !== "win32") {
  process.exit(0);
}

const resolved = path.resolve(path.join(process.cwd(), "nul"));
const extended = `\\\\?\\${resolved}`;

for (const p of [extended, resolved]) {
  try {
    fs.rmSync(p, { force: true });
  } catch {
    /* ignore */
  }
}
