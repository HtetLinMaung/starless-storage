import { brewBlankExpressFunc } from "code-alchemy";
import fs from "fs";
import path from "path";
import isAuth from "../../../../utils/is-auth";
import sharp from "sharp";
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
  const { file_path, width, height } =
    req.body && Object.keys(req.body).length ? req.body : req.query;
  if (!fs.existsSync(file_path)) {
    return res.sendStatus(404);
  }
  const imagePath = file_path;

  const [fileName, ext] = path.basename(imagePath).split(".");
  const filePath = path.dirname(imagePath);
  // Set the response content type
  res.type(ext);

  // Resize the image using sharp
  sharp(imagePath)
    .resize(parseInt(width), parseInt(height))
    .toFile(
      path.join(
        storageFolderPath,
        filePath,
        `${fileName}_${width}x${height}.${ext}`
      ),
      (err, info) => {
        console.log(err);
        console.log(info);
      }
    );
  res.json({
    code: 200,
    message: "Resized successful.",
    data: path.join(filePath, `${fileName}_${width}x${height}.${ext}`),
  });
});
