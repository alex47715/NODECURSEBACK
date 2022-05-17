const express = require('express');
const productController = require('../Controllers/ProductController');

let router = express.Router();

router.get('/product/all', productController.GetAllProducts);
router.post('/product/add', productController.AddProduct);
router.get('/product/get', productController.GetProductById);
router.get('/product/search', productController.GetProductsByCategoryAndName);
router.get('/product/search/category', productController.GetProductsByCategory);
router.put('/product/update:id', productController.UpdateProduct);
router.delete('/product/delete:id', productController.DeleteProduct);
router.post('/product/feedback/add', productController.AddProductFeedback);
router.get('/product/feedback/get', productController.GetProductFeedback);

module.exports = router;
