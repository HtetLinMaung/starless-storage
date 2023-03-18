import { brewBlankExpressFunc } from "code-alchemy";
import ytdl from "ytdl-core";
import fs from "fs";
import isAuth from "../../../../utils/is-auth";
import path from "path";
import { storageFolderPath } from "../../../../constants";

export default brewBlankExpressFunc(async (req, res) => {
  const method = req.method.toLowerCase();
  if (method != "post" && method != "get") {
    return res.sendStatus(404);
  }
  if (!isAuth(req)) {
    req.body || req.query;
    return res.sendStatus(401);
  }
  const { url, download_path } =
    req.body && Object.keys(req.body).length ? req.body : req.query;

  const videoInfo = await ytdl.getInfo(url);
  const videoFormat = ytdl.chooseFormat(videoInfo.formats, {
    filter: "audioandvideo",
  }); // Choose the format with the highest quality

  if (!videoFormat) {
    console.log("No video format found");
    return;
  }

  const videoStream = ytdl(url, { format: videoFormat });
  let videoFileName = `${videoInfo.videoDetails.title}.${videoFormat.container}`;

  if (download_path) {
    videoFileName = videoFileName
      .replaceAll("/", "")
      .replaceAll(" ", "_")
      .replaceAll("?", "");
    const videoFilePath = path.join(
      storageFolderPath,
      download_path,
      videoFileName
    );
    const videoWriteStream = fs.createWriteStream(videoFilePath);

    videoStream.pipe(videoWriteStream);

    videoWriteStream.on("finish", () => {
      console.log(`Video downloaded to ${videoFilePath}`);
    });
    res.json({
      code: 200,
      message: "Video downloading started...",
      data: path.join(download_path, videoFileName),
    });
  } else {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${videoFileName}`
    );
    videoStream.pipe(res);
  }
});

// http://localhost:3000/starless-storage/youtue/download?url=https://www.youtube.com/watch?v=cuHDQhDhvPE&t=45s&download_path=/&access_key=5e22d6dbb534e203
