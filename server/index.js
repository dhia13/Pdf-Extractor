const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const PDFParser = require("pdf-parse");

// app declaration
const app = express();
// json parser
app.use(express.json());
// morgan log trafic to console dev only
app.use(morgan("tiny"));
// cors config
app.use(cors());
console.log(__dirname);
//connection
app.put("/", async (req, res) => {
  try {
    console.log(req.body.url);
    const filePath1 = path.join(__dirname, "pdfFile1.pdf");
    const filePath2 = path.join(__dirname, "pdfFile2.pdf");
    const fileStream = fs.createReadStream(
      req.body.url == 1 ? filePath1 : filePath2
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=name.Pdf");
    // res.setHeader("Content-Length", fileStream.length);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, Msg: "server Err" });
  }
});
const PORT = process.env.PORT || 8000;
// db connection
app.listen(PORT, () => {
  console.log(`server is running on port http://localhost:${PORT}`);
});
