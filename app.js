const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const uploadRoute = require("./routes/productUpload");

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const port = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("Database Successfully Connected");
});

app.use("/api/products", uploadRoute);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
