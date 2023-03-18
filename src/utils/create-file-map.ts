import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import server from "starless-server";
import { fileMapFolderPath } from "../constants";

export default function createFileMap(filePath: string) {
  const data = {
    id: v4(),
    filePath,
    timestamps: new Date().toISOString(),
  };
  server.sharedMemory.set(data.id, filePath);
  fs.writeFile(
    path.join(fileMapFolderPath, `${data.id}.json`),
    JSON.stringify(data),
    (err) => {
      if (err) throw err;
    }
  );

  return data;
}
