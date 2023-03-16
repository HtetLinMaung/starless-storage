import { brewBlankExpressFunc } from "code-alchemy";
import path from "path";
import fs from "fs";
import { storageFolderPath } from "../../../constants";
import isAuth from "../../../utils/is-auth";
import log from "../../../utils/log";

export default brewBlankExpressFunc(async (req, res) => {
  const method = req.method.toLowerCase();
  if (method != "post") {
    res.statusCode = 404;
    return res.end("Not found");
  }
  if (!isAuth(req)) {
    return res.sendStatus(401);
  }

  const xFileName = req.headers["x-file-name"] as string;
  const folderPath = path.join(storageFolderPath, path.dirname(xFileName));
  const fileName = path.basename(xFileName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const filePath = path.join(folderPath, fileName);
  const fileSize = parseInt(req.headers["content-length"], 10);
  const writeStream = fs.createWriteStream(filePath);
  let uploadedSize = 0;

  req.on("data", (chunk) => {
    uploadedSize += chunk.length;
    const progress = (uploadedSize / fileSize) * 100;
    log(`Uploading: ${progress.toFixed(2)}%`);
    writeStream.write(chunk);
  });

  req.on("end", () => {
    log("Upload finished");
    writeStream.end();
    res.statusCode = 200;
    res.end("File uploaded successfully");
  });
});
// curl -X POST -H "Content-Type: application/octet-stream" -H "X-File-Name: zip/Dracula.zip" --data-binary "@/home/user/Downloads/Dracula.zip" http://localhost:3000/starless-storage/upload?access_key=5e22d6dbb534e203
