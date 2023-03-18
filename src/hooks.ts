import { Application } from "express";
import fs from "fs";
import { fileMapFolderPath, storageFolderPath } from "./constants";
import log from "./utils/log";

export const afterMasterProcessStart = async () => {
  if (!fs.existsSync(storageFolderPath)) {
    fs.mkdirSync(storageFolderPath);
  }
  if (!fs.existsSync(fileMapFolderPath)) {
    fs.mkdirSync(fileMapFolderPath);
  }
};

export const beforeServerStart = async (app: Application) => {
  log("Before server start");
  app.use((req, res, next) => {
    log("");
    console.log({
      path: req.path,
      method: req.method,
      query: req.query,
      params: req.params,
      body: req.body,
      headers: req.headers,
    });
    console.log("");
    next();
  });
};
