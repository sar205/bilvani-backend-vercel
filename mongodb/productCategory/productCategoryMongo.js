
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subcategories: [{ type: String }] // Store subcategories directly within the parent category
});

const Category = mongoose.model('Product-Category', categorySchema);

module.exports = Category;
