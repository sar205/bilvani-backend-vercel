
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
 
});

const Subcategory = mongoose.model('Product-Subcategory', subcategorySchema);

module.exports = Subcategory;
