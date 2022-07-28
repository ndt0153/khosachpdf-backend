const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dbConnect = require("./db");

const Book = require("./models/pdf.model");

const DownloadImage = require("./download-image");
const DownloadPDF = require("./download-pdf");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;

let port = 8181;
app.listen(port, async () => {
  console.log(`Running at port: ${port} `);
});

mongoose
  .connect(dbConnect.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.error(err);
    process.exit();
  });
app.get("/pdf", async (req, res) => {
  req = req.query;
  const perPage = 3;
  Book.find(
    {
      download_pdf: { $exists: false },
      $expr: { $lt: [{ $strLenCP: "$size" }, 9] },
    },
    "file_url id slug "
  ) // find tất cả các data
    .skip(perPage * req.page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, products) => {
      Book.countDocuments(async (err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        // console.log(products);
        let final = products.map((doc) => {
          return doc.file_url;
        });
        let final2 = final.toString().replaceAll(",", " ");
        await DownloadPDF(products);
        res.send(final); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });

  //let result = await getUserPaging(10, 2);
  //   let finalResult = await result.map((doc) => {
  //     return doc.file_url;
  //   });
  // res.send(BookList);
});
app.get("/image", async (req, res) => {
  req = req.query;
  const perPage = 10;
  Book.find({ download_image: { $exists: false } }, "image_url id slug ") // find tất cả các data
    .skip(perPage * req.page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, products) => {
      Book.countDocuments(async (err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        // console.log(products);
        let final = products.map((doc) => {
          return doc.image_url;
        });
        let final2 = final.toString().replaceAll(",", " ");
        await DownloadImage(products);
        res.send(final); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });

  //let result = await getUserPaging(10, 2);
  //   let finalResult = await result.map((doc) => {
  //     return doc.file_url;
  //   });
  // res.send(BookList);
});
