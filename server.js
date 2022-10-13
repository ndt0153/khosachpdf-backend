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
app.get("/fixCate1", async (req, res) => {
  const { name } = req.query;
  function to_slug(str) {
    // Chuyển hết sang chữ thường
    str = str.toLowerCase();
    str = str.replace(/-/g, "");
    // xóa dấu
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
    str = str.replace(/(đ)/g, "d");

    // Xóa ký tự đặc biệt
    str = str.replace(/([^0-9a-z-\s])/g, "");

    // Xóa khoảng trắng thay bằng ký tự -
    str = str.replace(/(\s+)/g, "-");

    // xóa phần dự - ở đầu
    str = str.replace(/^-+/g, "");

    // xóa phần dư - ở cuối
    str = str.replace(/-+$/g, "");

    // return
    return str;
  }
  Book.updateMany({ cate1: name }, [
    { $set: { cate1_slug: to_slug(name) } },
  ]).then(function (result) {
    res.send(result);
  });
});
app.get("/xoaCate1", async (req, res) => {
  Book.updateMany({}, { $unset: { cate1_slug: 1 } })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
});
app.get("/getPDF/:page", async (req, res, next) => {
  //req = req.query;
  const perPage = 10;
  let pagelist = [];
  let page = parseInt(req.params.page) || 1;

  Book.find() // find tất cả các data
    .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, books) => {
      Book.countDocuments(async (err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        // console.log(products);
        let maxPage = Math.ceil(count / perPage);
        if (page <= 3) {
          pagelist = [1, 2, 3, 4, 5];
        } else if (page >= maxPage - 2) {
          pagelist = [
            maxPage - 4,
            maxPage - 3,
            maxPage - 2,
            maxPage - 1,
            maxPage,
          ];
        } else {
          pagelist = [page - 2, page - 1, page, page + 1, page + 2];
        }
        res.send({
          books,
          pagelist,
          currentPage: page,
          maxPage,
        }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
});
app.get("/sach/:slug", async (req, res, next) => {
  Book.findOne({ slug: req.params.slug }).then((book) => {
    if (!book) {
      return res.status(404).send({
        message: "404 Not Found",
      });
    }
    res.send(book);
  });
});
app.get("/page/home", async (req, res, next) => {
  const { name } = req.query;
  let SliderBook = await Book.find({ cate2: "Tài Chính – Chứng Khoán" }).limit(
    6
  );
  let BestDownload = await Book.find({ cate1: "Java Script" }).limit(10);
  let NewBook = await Book.find({ cate1: "Marketing – Bán Hàng " }).limit(10);
  let RecommendedBook = await Book.find({ cate1: "Kinh Tế – Quản Lý" }).limit(
    10
  );
  Promise.all([SliderBook, BestDownload, NewBook, RecommendedBook]).then(
    (results) =>
      res.send({
        SliderBook: results[0],
        BestDownload: results[1],
        NewBook: results[2],
        RecommendedBook: results[3],
      })
  );
});
app.get("/cate/:name/:page?", async (req, res, next) => {
  //req = req.query;
  const perPage = 10;
  let pagelist = [];
  let page = parseInt(req.params.page) || 1;
  let name = req.params.name;
  Book.find({ $or: [{ cate1_slug: name }] }) // find tất cả các data
    .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, books) => {
      Book.countDocuments({ cate1_slug: name }, async (err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        // console.log(products);
        let maxPage = Math.ceil(count / perPage);
        if (maxPage < 4) {
          for (let i = 1; i <= maxPage; i++) {
            pagelist.push(i);
          }
        } else {
          if (page <= 3) {
            pagelist = [1, 2, 3, 4, 5];
          } else if (page >= maxPage - 2) {
            pagelist = [
              maxPage - 4,
              maxPage - 3,
              maxPage - 2,
              maxPage - 1,
              maxPage,
            ];
          } else {
            pagelist = [page - 2, page - 1, page, page + 1, page + 2];
          }
        }
        res.send({
          books,
          pagelist,
          currentPage: page,
          maxPage,
        }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
});
app.get("/search", async (req, res, next) => {
  const { name } = req.query;
  Book.find({ name: { $regex: name, $options: "i" } })
    .limit(10)
    .then((prodName) => {
      res.send(prodName);
    })
    .catch((err) => {
      console.log(err);
    });
});
