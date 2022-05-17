const express = require('express');
const userController = require('../Controllers/UserController');

let router = express.Router();

router.get('/current', userController.getCurrentUser);
router.post('/signup', userController.SignUp);
router.post('/signin', userController.SignIn);
router.put('/addbalance', userController.UpdateBalance);
router.get('/telegram/send', userController.SendTelegramCode);
router.post('/telegram/send/cart', userController.SendTelegramCodeWithProducts);
router.post('/telegram/verify', userController.CheckTelegramCode);
router.get('/telegram/checkchat', userController.CheckTelegramChat);
router.post('/cart/add', userController.AddProductToCart);
router.get('/cart/get', userController.GetProductsFromCart);

module.exports = router;
