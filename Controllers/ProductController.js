const { getPool, sync } = require('../DB/DB');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

getPool();
sync();

module.exports = {
  GetAllProducts: (request, response) => {
    db.sequelize.models.Product.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'], raw: true },
    })
      .then((products) => {
        if (!products) {
          response.status(404).send('Products not found');
        }
        response.status(200).json(products);
      })
      .catch((err) => {
        response.status(500).json(err);
      });
  },
  AddProduct: (request, response) => {
    db.sequelize.models.Product.create({
      name: request.body.name,
      category: request.body.category,
      imageSrc: request.body.imageSrc,
      price: request.body.price,
      description: request.body.description,
      sales: 0,
    })
      .then((product) => {
        console.log(product);
        if (product) {
          response.status(200).json(JSON.stringify('Product added'));
        } else {
          response.status(400).json(JSON.stringify('Product not added'));
        }
      })
      .catch((err) => {
        response.status(500).json(err);
      });
  },
  GetProductById: (request, response) => {
    db.sequelize.models.Product.findOne({
      where: { id: request.query.id },
      attributes: { exclude: ['createdAt', 'updatedAt'], raw: true },
    })
      .then((product) => {
        if (!product) {
          return response.status(404).send('Product not found');
        }
        return response.status(200).json(product);
      })
      .catch((err) => {
        return response.status(500).json(err);
      });
  },
  UpdateProduct: (request, response) => {
    db.sequelize.models.Product.update(
      {
        name: request.body.name,
        category: request.body.category,
        imageSrc: request.body.imageSrc,
        price: request.body.price,
        description: request.body.description,
      },
      {
        where: { id: request.params.id },
      },
    )
      .then((product) => {
        if (product) {
          response.status(200).json(JSON.stringify('Product updated'));
        } else {
          response.status(400).json(JSON.stringify('Product not updated'));
        }
      })
      .catch((err) => {
        response.status(500).json(err);
      });
  },
  DeleteProduct: (request, response) => {
    db.sequelize.models.Product.destroy({
      where: { id: request.params.id },
    })
      .then((product) => {
        if (product) {
          response.status(200).json(JSON.stringify('Product deleted'));
        } else {
          response.status(400).json(JSON.stringify('Product not deleted'));
        }
      })
      .catch((err) => {
        response.status(500).json(err);
      });
  },
  AddProductFeedback: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser == null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }

    db.sequelize.models.Feedback.create({
      userId: currentUser.id,
      productId: request.body.productId,
      description: request.body.description,
    })
      .then((feedback) => {
        if (feedback) {
          return response.status(200).json(JSON.stringify('Feedback added'));
        } else {
          return response
            .status(400)
            .json(JSON.stringify('Feedback not added'));
        }
      })
      .catch((err) => {
        return response.status(500).json(err);
      });
  },
  GetProductFeedback: (request, response) => {
    db.sequelize.models.Feedback.findAll({
      where: { productId: request.query.id },
      attributes: { exclude: ['createdAt', 'updatedAt'], raw: true },
    }).then((feedback) => {
      if (!feedback) {
        return response.status(404).send('Feedback not found');
      }
      var users = [];
      feedback.forEach((element) => {
        users.push(element.userId);
      });
      db.sequelize.models.User.findAll({
        where: { id: users },
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'password',
            'balance',
            'telegramLogin',
            'telegramVerified',
            'role',
          ],
          raw: true,
        },
      })
        .then((users) => {
          if (!users) {
            return response.status(404).send('Users not found');
          }
          var feedbacks = [];
          feedback.forEach((element) => {
            users.forEach((user) => {
              if (element.userId === user.id) {
                feedbacks.push({
                  user: user,
                  description: element.description,
                });
              }
            });
          });
          return response.status(200).json(feedbacks);
        })
        .catch((err) => {
          return response.status(500).json(err);
        });
    });
  },
  GetProductsByCategoryAndName: (request, response) => {
    db.sequelize.models.Product.findAll({
      where: {
        name: {
          [Op.like]: '%' + request.query.name + '%',
        },
      },
      attributes: { exclude: ['createdAt', 'updatedAt'], raw: true },
    })
      .then((products) => {
        if (products.length == 0) {
          db.sequelize.models.Product.findAll({
            where: {
              category: request.query.category,
            },
            attributes: { exclude: ['createdAt', 'updatedAt'], raw: true },
          }).then((products) => {
            if (products == 0) {
              return response.status(404).send('Products not found');
            } else {
              return response.status(200).json(products);
            }
          });
        } else {
          return response.status(200).json(products);
        }
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },
  GetProductsByCategory: (request, response) => {
    db.sequelize.models.Product.findAll({
      where: {
        category: request.query.category,
      },
      attributes: { exclude: ['createdAt', 'updatedAt'], raw: true },
    })
      .then((products) => {
        if (products.length == 0) {
          return response.status(404).send('Products not found');
        }
        return response.status(200).json(products);
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },
};
