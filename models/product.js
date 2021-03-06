const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  images: {
    type: [String],
  },
});

module.exports = mongoose.model("products", productSchema);
