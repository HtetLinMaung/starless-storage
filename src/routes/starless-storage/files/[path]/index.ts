import { brewBlankExpressFunc } from "code-alchemy";
import path from "path";
import fs from "fs";
import mime from "mime";
import { storageFolderPath } from "../../../../constants";
import isAuth from "../../../../utils/is-auth";

export default brewBlankExpressFunc(async (req, res) => {
  const method = req.method.toLowerCase();
  const filePath = req.params.path;
  if (method != "get" || !fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  if (!isAuth(req)) {
    return res.sendStatus(401);
  }

  const preview = req.query.preview;
  const stream = req.query.stream;

  const fileName = path.basename(filePath);
  const contentType = mime.getType(filePath);
  const file = path.join(storageFolderPath, filePath);
  const stat = fs.statSync(file);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(file, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename=${fileName}`,
    };
    if (preview == "yes" || stream == "yes") {
      delete head["Content-Disposition"];
    }
    res.writeHead(206, head);
    fileStream.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename=${fileName}`,
    };
    if (preview == "yes" || stream == "yes") {
      delete head["Content-Disposition"];
    }
    res.writeHead(200, head);
    fs.createReadStream(file).pipe(res);
  }
});
