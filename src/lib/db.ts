import { createDbWorker } from "sql.js-httpvfs"

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL(
  "sql.js-httpvfs/dist/sql-wasm.wasm",
  import.meta.url,
);

const config = {
  from: "inline" as const,
  config: {
    serverMode: "full" as const,
    requestChunkSize: 4096,
    url: "/words.db"
  }
};

const worker = await createDbWorker(
  [config],
  workerUrl.toString(),
  wasmUrl.toString(),
);

export async function getWordsByQuery(query: string) {
  const results = await worker.db.query(`select * from words where word like ? order by count desc limit 5`, [query])
  return results.map((row: any) => row.word);
}
