const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const productModel = require("../models/product");
const fs = require("fs");

const imageStorage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000 * 1000 * 2,
  },
  fileFilter(req, file, cb) {
    if (!req.body.name) {
      return cb(new Error("Name not Defined"));
    }
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/createProduct",
  imageUpload.array("photos", 2),
  async (req, res) => {
    try {
      const files = req.files.map((file) => file.filename);
      const newProduct = await productModel.create({
        name: req.body.name,
        description: req.body.description,
        images: files,
      });
      res.status(200).json({
        status: "success",
        file: newProduct,
      });
    } catch (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }
  }
);

router.delete("/deleteProduct/:id", async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return res.status(400).json({
      status: "fail",
      message: "No Product exists with this id",
    });
  }
  if (product.images) {
    try {
      product.images.map((image) => {
        fs.unlink(`${__dirname}/../images/${image}`, function (err) {
          if (err) throw err;
        });
      });
    } catch (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }
  }
  const deleteProduct = await productModel.findByIdAndDelete(req.params.id);
  if (!deleteProduct) {
    return res.status(400).json({
      status: "fail",
      message: "No Product exists with this id",
    });
  }
  res.status(202).json({
    status: "success",
  });
});

router.patch("/updateProduct/:id", async (req, res) => {
  const { name, description } = req.body;
  const updatedUser = await productModel.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return res.status(400).json({
      status: "fail",
      message: "No Product exists with this id",
    });
  }

  res.status(200).json({
    status: "success",
    message: updatedUser,
  });
});

router.get("/getProduct/:id", async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return res.status(400).json({
      status: "fail",
      message: "No Product exists with this id",
    });
  }
  res.status(200).json({
    status: "suceess",
    product: product,
  });
});

router.get("/getProductImage/:id", async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return res.status(400).json({
      status: "fail",
      message: "No Product exists with this id",
    });
  }
  const { imageNumber } = req.query;
  if (product.images[imageNumber]) {
    let fileName = `${__dirname}/../images/${product.images[imageNumber]}`;
    res.sendFile(path.resolve(fileName), function (err) {
      if (err) {
        return res.status(400).json({
          status: "fail",
          message: err.message,
        });
      }
    });
  } else {
    return res.status(400).json({
      status: "fail",
      message: "File not Found",
    });
  }
});

module.exports = router;
