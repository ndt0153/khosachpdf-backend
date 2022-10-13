const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BookSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String },
  fileName: { type: String },
  size: { type: String },
  file_url: { type: String },
  image_url: { type: String },
  des: { type: String },
  page: { type: String },
  cate1: { type: String },
  cate2: { type: String },
  author: { type: String },
  download_image: { type: Boolean },
  image_name: { type: String },
  download_pdf: { type: Boolean },
  pdf_name: { type: String },
  cate1_slug: { type: String },
  cate2_slug: { type: String },
});
module.exports = mongoose.model("Book", BookSchema, "Books");
