const e = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const donwloadDir = path.join(os.homedir(), "Desktop");
const downloadDir = path.join(os.homedir(), "Downloads");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const axios = require("axios");
const Book = require("./models/pdf.model");

const runExecaFunction = async (list, slug) => {
  const { execa } = await import("execa");

  const subprocess = await execa("youtube-dl", [
    list,
    "-o",
    donwloadDir + "/pdf_crawler" + "/image" + "/webp" + "/" + slug + ".webp",
  ]);
  // await subprocess.stdout.pipe(fs.createWriteStream("stdout.txt", { flags: "a" }));
};
const DownloadImage = async (list) => {
  for (const ele of list) {
    console.log(ele);
    await runExecaFunction(ele.image_url, ele.slug);
  }
  for (const ele of list) {
    const filePath = path.join(
      donwloadDir +
        "/pdf_crawler" +
        "/image" +
        "/webp" +
        "/" +
        ele.slug +
        ".webp"
    );
    if (fs.existsSync(filePath)) {
      console.log("file nay co nhe " + ele.slug);
      Book.findOneAndUpdate(
        { id: ele.id },
        { download_image: true, image_name: ele.slug + ".webp" },
        { upsert: true },
        function (err, doc) {
          if (err) return console.log(err);
          return console.log("OK nhe");
        }
      );
    }
  }

  await delay(5000);
  axios.get("http://localhost:8181/pdf?perPage=10&page=1");
};
module.exports = DownloadImage;
