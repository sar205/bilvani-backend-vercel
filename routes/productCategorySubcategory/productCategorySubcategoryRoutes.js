const express = require('express');

const router = express.Router();

const {createCategory,createSubcategory, upadetCategory, updateSubcategory, deleteCategory,deleteSubcategory} = require('../../controller/productCategory-Subcategory/productCategorySubCategoryControl');


router.route('/api/categories').post(createCategory);
router.route('/api/categories/:categoryId/subcategories').post(createSubcategory);

router.route('/api/categories/:categoryId').put(upadetCategory);
router.route('/api/categories/:categoryId/subcategories/:index').put(updateSubcategory);

router.route('/api/categories/:categoryId').delete(deleteCategory);
router.route('/api/categories/:categoryId/subcategories/:index').delete(deleteSubcategory);

module.exports = router ; 