const Product = require('../../mongodb/productMongo/productMongo');

const path = require('path');
const fs = require('fs');



//create api
module.exports.createProduct = async (req, res) => {
    try {
        const { title, actualPrice, discountedPrice, discount, description, returnPolicy, outOfStock, colorHexCodes, category , subcategories } = req.body;

        ///// Create new product instance
        const newProduct = new Product({
            title,
            actualPrice,
            discountedPrice,
            discount,
            description,
            returnPolicy,
            category,
            subcategories,
            outOfStock,
            colors: colorHexCodes
        });

        ///// Add uploaded image URLs to product schema
        newProduct.images = req.files.map(file => `/uploads/${file.filename}`);

        ///// Save product to database
        await newProduct.save();

        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//update api
module.exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { title, actualPrice, discountedPrice, discount, description, returnPolicy, outOfStock, colorHexCodes , category , subcategories } = req.body;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // If there are uploaded files, delete existing images and update image URLs
        if (req.files && req.files.length > 0) {
            // Delete existing images from folder and database
            product.images.forEach(imageUrl => {
                const filename = path.basename(imageUrl);
                const imagePath = path.join('../frontend/public/uploads', filename);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Delete image file from folder
                }
            });

            product.images = []; // Remove existing image URLs from database

            // Update image URLs
            product.images = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Update other product properties
        product.title = title;
        product.actualPrice = actualPrice;
        product.discountedPrice = discountedPrice;
        product.discount = discount;
        product.description = description;
        product.returnPolicy = returnPolicy;
        product.outOfStock = outOfStock;
        product.category= category;
        product.subcategories=subcategories;
        product.colors = colorHexCodes;

        // Save updated product to database
        await product.save();

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete product
module.exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete the images associated with the product
        product.images.forEach(imageUrl => {
            // Extract filename from URL
            const filename = path.basename(imageUrl);

            // Construct full path to the image file
            const imagePath = path.join('../frontend/public/uploads', filename);

            // Check if the file exists before attempting to delete
            if (fs.existsSync(imagePath)) {
                // Delete image file from server
                fs.unlinkSync(imagePath);
            }
        });

        // Delete the product from the database
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all products
module.exports.getAllProducts = async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await Product.find();

        // Map products to include images
        const productsWithImages = products.map(product => {
            return { ...product._doc, images: product.images };
        });

        res.status(200).json({ products: productsWithImages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single product by ID
module.exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ product: { ...product._doc, images: product.images } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// search api 
module.exports.searchProducts = async (req, res) => {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ error: 'Title parameter is required' });
        }

        // Create a query object for title search
        const query = {
            title: { $regex: new RegExp(title, 'i') } // Case-insensitive regex search for title
        };

        // Perform the search query
        const products = await Product.find(query);

        if (products.length === 0) {
            return res.status(404).json({ error: `No products found with the title '${title}'` });
        }

        res.json(products);
    } catch (err) {
        console.error('Error searching for products:', err);
        res.status(500).json({ error: 'An error occurred while searching for products' });
    }
};


//// Get the Suggestion by Category 
module.exports.getSuggestionsByCategory = async (req, res) => {
    try {
        const { productId } = req.params;

        // Fetch the clicked product by its ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Fetch related products from the same category, excluding the clicked product
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: productId }
        });

        res.status(200).json(relatedProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};