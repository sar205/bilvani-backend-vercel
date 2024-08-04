const Category = require("../../mongodb/productCategory/productCategoryMongo");

////Category Add
module.exports.createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    const category = new Category({ name, subcategories });
    await category.save();
    res.status(201).send(category);
  } catch (err) {
    res.status(400).send(err.message);
  }
};


//// Add subcategor to the exist category 
module.exports.createSubcategory = async (req,res)=>{
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) return res.status(404).send('Category not found');

        const { subcategory } = req.body;
        category.subcategories.push(subcategory);
        await category.save();

        res.send(category);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

////Update the Category 


module.exports.upadetCategory = async(req,res)=>{
    try {
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.categoryId, { name }, { new: true });
        if (!category) return res.status(404).send('Category not found');
        res.send(category);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

///// Update the Subcategory 

module.exports.updateSubcategory = async(req,res)=>{

    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) return res.status(404).send('Category not found');

        const { subcategory } = req.body;
        const subcategoryIndex = parseInt(req.params.index);

        if (subcategoryIndex < 0 || subcategoryIndex >= category.subcategories.length)
            return res.status(404).send('Invalid subcategory index');

        category.subcategories[subcategoryIndex] = subcategory;
        await category.save();

        res.send(category);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

//// Delete Category 

module.exports.deleteCategory = async(req,res)=>{
    try {
        const category = await Category.findByIdAndDelete(req.params.categoryId);
        if (!category) return res.status(404).send('Category not found');
        res.send('Category deleted successfully');
    } catch (err) {
        res.status(400).send(err.message);
    }
}


///// Delete Subcategory 
module.exports.deleteSubcategory = async(req,res)=>{
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) return res.status(404).send('Category not found');

        const subcategoryIndex = parseInt(req.params.index);

        if (subcategoryIndex < 0 || subcategoryIndex >= category.subcategories.length)
            return res.status(404).send('Invalid subcategory index');

        category.subcategories.splice(subcategoryIndex, 1);
        await category.save();

        res.send(category);
    } catch (err) {
        res.status(400).send(err.message);
    }
}