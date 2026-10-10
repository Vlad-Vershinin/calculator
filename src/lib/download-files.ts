import { lstat, readdir } from "node:fs/promises";
import { basename, join } from "node:path";

export type DownloadFile = { name: string; size: number };

export function getDownloadDirectory() {
  return process.env.DOWNLOAD_FILES_DIR || "/var/www/calculator-files";
}

function isAllowedFileName(name: string) {
  return Boolean(name) &&
    name === basename(name) &&
    !name.startsWith(".") &&
    !name.includes("\\") &&
    !name.includes("\0");
}

export async function listDownloadFiles(): Promise<DownloadFile[]> {
  try {
    const directory = getDownloadDirectory();
    const entries = await readdir(/*turbopackIgnore: true*/ directory, { withFileTypes: true });
    const files = await Promise.all(entries
      .filter((entry) => entry.isFile() && isAllowedFileName(entry.name))
      .map(async ({ name }) => ({
        name,
        size: (await lstat(join(/*turbopackIgnore: true*/ directory, name))).size,
      })));

    return files.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function findDownloadFile(name: string) {
  if (!isAllowedFileName(name)) return null;

  try {
    const path = join(/*turbopackIgnore: true*/ getDownloadDirectory(), name);
    const info = await lstat(path);
    return info.isFile() ? { path, size: info.size } : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
