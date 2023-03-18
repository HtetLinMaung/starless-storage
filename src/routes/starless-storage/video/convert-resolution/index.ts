import { brewBlankExpressFunc } from "code-alchemy";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import isAuth from "../../../../utils/is-auth";
import { storageFolderPath } from "../../../../constants";
import getResolutionSize from "../../../../utils/get-resolution-size";

export default brewBlankExpressFunc(async (req, res) => {
  const method = req.method.toLowerCase();
  if (method != "post" && method != "get") {
    return res.sendStatus(404);
  }
  if (!isAuth(req)) {
    req.body || req.query;
    return res.sendStatus(401);
  }
  const { file_path, resolution } =
    req.body && Object.keys(req.body).length ? req.body : req.query;
  if (!fs.existsSync(file_path)) {
    return res.sendStatus(404);
  }
  const fileName = path.basename(file_path);
  const folderPath = path.join(storageFolderPath, path.dirname(file_path));
  const [name, ext] = fileName.split(".");

  const outputFilePath = path.join(folderPath, `${name}_${resolution}.${ext}`);
  ffmpeg(path.join(storageFolderPath, file_path))
    .output(outputFilePath)
    .videoCodec("libx264")
    .audioCodec("aac")
    .size(getResolutionSize(resolution))
    .on("end", () => {
      console.log(`Video converted to ${resolution}`);
    })
    .on("error", (err) => {
      console.error(`Error converting video to ${resolution}:`, err);
    })
    .run();

  res.json({
    code: 200,
    message: "Video conversion started",
    data: outputFilePath.replace(storageFolderPath, ""),
  });
});
