import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { Readable } from "node:stream";
import { findDownloadFile } from "@/lib/download-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name) return new Response("Не указано имя файла", { status: 400 });

  const file = await findDownloadFile(name);
  if (!file) return new Response("Файл не найден", { status: 404 });

  const encodedName = encodeURIComponent(name).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  const handle = await open(
    file.path,
    constants.O_RDONLY | constants.O_NONBLOCK | (constants.O_NOFOLLOW ?? 0),
  );
  const info = await handle.stat();
  if (!info.isFile()) {
    await handle.close();
    return new Response("Файл не найден", { status: 404 });
  }
  const stream = handle.createReadStream();

  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
      "Content-Length": String(info.size),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
