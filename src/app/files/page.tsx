import Link from "next/link";
import { listDownloadFiles } from "@/lib/download-files";
import styles from "./files.module.css";

export const dynamic = "force-dynamic";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  const units = ["КБ", "МБ", "ГБ", "ТБ"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(size)} ${units[unit]}`;
}

export default async function FilesPage() {
  const files = await listDownloadFiles();

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <Link className={styles.back} href="/">← К калькулятору</Link>
        <h1>Файлы для скачивания</h1>
        <p className={styles.description}>Файлы из каталога, загруженные на сервер по FTP.</p>

        {files.length ? (
          <ul className={styles.list}>
            {files.map((file) => (
              <li key={file.name}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.size}>{formatSize(file.size)}</span>
                <a href={`/api/files?name=${encodeURIComponent(file.name)}`} download={file.name}>Скачать</a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>В каталоге пока нет файлов.</p>
        )}
      </section>
    </main>
  );
}
