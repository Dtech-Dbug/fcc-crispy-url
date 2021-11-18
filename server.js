require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();
const mongoose = require("mongoose");
// Basic Configuration
const port = process.env.PORT || 3000;
//conn. mongoDb w/ mongoose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => console.log("DB CONNECTED"));

// define schema
let urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: Number,
});
const Model = mongoose.model("Model", urlSchema);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  console.log("hmm");
  try {
    let url = new URL(req.body.url);
    let originalUrl = req.body.url;

    let shortUrl = Math.floor(Math.random() * 1000);
    console.log("req recvd, processing");

    // ! if url uses ftp protocol, throw error response
    if (url.protocol === "ftp:") {
      res.json({
        error: "invalid url",
      });
    } else {
      // saving url
      let savedUrl = await new Model({
        originalUrl,
        shortUrl,
      }).save();
      console.log(savedUrl);

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    }
  } catch (e) {
    // if invalid url
    // typeerror is returned
    // check instance of typeerrror

    if (e instanceof TypeError)
      res.json({
        error: "invalid url",
      });
  }
});

//redirect url
app.get("/api/shorturl/:short", async (req, res) => {
  let short = req.params.short;

  let search = await Model.findOne({ shortUrl: short }).exec();
  console.log("search rsult", search);
  res.redirect(search.originalUrl);
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
