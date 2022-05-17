const { getPool, sync } = require('../DB/DB');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

getPool();
sync();

module.exports = {
  getCurrentUser: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    console.log(token);
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }

    db.sequelize.models.User.findOne({
      where: { id: currentUser.id },
      attributes: { exclude: ['password'], raw: true },
    })
      .then((user) => {
        if (!user) {
          return response.status(404).send('User not found');
        }
        return response.status(200).json(user);
      })
      .catch((err) => {
        return response.status(500).json(err);
      });
  },
  SignUp: (request, response) => {
    db.sequelize.models.User.findOne({
      where: { username: request.body.username },
    })
      .then((user) => {
        if (!user) {
          db.sequelize.models.User.create({
            username: request.body.username,
            password: request.body.password,
            balance: 0,
            telegramLogin: request.body.telegramLogin,
            telegramVerified: false,
            role: 0,
            registrationDate: db.Sequelize.fn('GETDATE'),
            profileImage:
              'https://i.pinimg.com/736x/bb/f0/22/bbf022bb0f60526e32bfa4555c517c39.jpg',
          })
            .then((user) => {
              if (user) {
                return response
                  .status(200)
                  .json(JSON.stringify('User created'));
              } else {
                return response
                  .status(400)
                  .json(JSON.stringify('User not created'));
              }
            })
            .catch((err) => {
              return response.status(500).json(err);
            });
        } else {
          return response
            .status(400)
            .json(JSON.stringify('User already exists'));
        }
      })
      .catch((err) => {
        return response.status(500).json(err);
      });
  },
  SignIn: async (request, response) => {
    await db.sequelize.models.User.findOne({
      where: {
        username: request.body.username,
        password: request.body.password,
      },
      attributes: { exclude: ['password'], raw: true },
    })
      .then((user) => {
        if (!user) {
          response.status(400).json(JSON.stringify('Invalid credentials'));
        } else {
          let payload = { id: user.id, role: user.role };
          let token = jwt.sign(payload, process.env.TOKEN_SECRET, {
            expiresIn: '1800s',
          });
          console.log(jwt);
          let result = {
            jwt: token,
            user: user,
          };
          response.status(200).json(result);
        }
      })
      .catch((err) => {
        response.status(500).json(err.message);
      });
  },
  UpdateBalance: (request, response) => {
    console.log(request.body);
    if (request.body.balance == null) {
      return response.status(400).json(JSON.stringify('Balance not defined'));
    }
    token = request.headers.authorization.split(' ')[1];
    console.log(token);
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }
    console.log(currentUser.id);
    db.sequelize.models.User.findOne({
      where: { id: currentUser.id },
    }).then((user) => {
      if (!user) {
        return response.status(404).send('User not found');
      } else {
        user
          .update({
            balance: request.body.balance + user.balance,
          })
          .then((user) => {
            if (user) {
              return response.status(200).json(JSON.stringify('User updated'));
            } else {
              return response
                .status(400)
                .json(JSON.stringify('User not updated'));
            }
          });
      }
    });
  },
  SendTelegramCode: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }

    db.sequelize.models.User.findOne({
      where: { id: currentUser.id },
    })
      .then((user) => {
        if (user) {
          var data;
          var res = fetch(
            'https://api.telegram.org/bot5307025939:AAH4j720xC1kIC7I6XJXbczjWsJNi9y8qEk/getUpdates',
          )
            .then((res) => res.json())
            .then((json) => {
              console.log(json);
              data = json.result.map((item) => {
                if (item.message.from.username == user.telegramLogin) {
                  return item.message.from.id;
                }
              });
              console.log({ ...data }[1]);
              data = { ...data }[1];
              if (data.length == 0) {
                return response
                  .status(400)
                  .json(JSON.stringify('User not found'));
              } else {
                var number = Math.floor(100000 + Math.random() * 900000);
                fetch(
                  `https://api.telegram.org/bot5307025939:AAH4j720xC1kIC7I6XJXbczjWsJNi9y8qEk/sendMessage?chat_id=${data}&text=${number}`,
                ).catch((err) => {
                  return response.status(500).json(err.message);
                });
                var checkTelegramCode =
                  db.sequelize.models.TelegramCode.findOne({
                    where: {
                      userId: user.id,
                    },
                  });
                if (checkTelegramCode) {
                  db.sequelize.models.TelegramCode.update(
                    {
                      code: number,
                    },
                    {
                      where: {
                        userId: user.id,
                      },
                    },
                  ).then(() => {
                    return response
                      .status(200)
                      .json(JSON.stringify('Code sent1'));
                  });
                } else {
                  db.sequelize.models.TelegramCode.create({
                    userId: currentUser.id,
                    code: 123456,
                  }).then((code) => {
                    if (code) {
                      return response
                        .status(200)
                        .json(JSON.stringify('Code sent2'));
                    } else {
                      return response
                        .status(400)
                        .json(JSON.stringify('Code not sent'));
                    }
                  });
                }
              }
            })
            .catch((err) => {
              return response.status(500).json(err.message);
            });
        } else {
          return response.status(404).send('User not found');
        }
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },
  CheckTelegramCode: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }
    db.sequelize.models.TelegramCode.findOne({
      where: { userId: currentUser.id },
    })
      .then((code) => {
        if (code) {
          if (code.code == request.body.userCode) {
            db.sequelize.models.User.update(
              {
                telegramVerified: true,
              },
              {
                where: {
                  id: currentUser.id,
                },
              },
            ).then(() => {
              return response.status(200).json(JSON.stringify('Code correct'));
            });
          } else {
            return response.status(400).json(JSON.stringify('Code incorrect'));
          }
        } else {
          return response.status(400).json(JSON.stringify('Code not found'));
        }
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },
  SendTelegramCodeWithProducts: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }

    db.sequelize.models.User.findOne({
      where: { id: currentUser.id },
    })
      .then((user) => {
        if (user) {
          var data;
          var res = fetch(
            'https://api.telegram.org/bot5307025939:AAH4j720xC1kIC7I6XJXbczjWsJNi9y8qEk/getUpdates',
          )
            .then((res) => res.json())
            .then((json) => {
              console.log(json);
              data = json.result.map((item) => {
                if (item.message.from.username == user.telegramLogin) {
                  return item.message.from.id;
                }
              });
              console.log({ ...data }[1]);
              data = { ...data }[1];
              if (data.length == 0) {
                return response
                  .status(400)
                  .json(JSON.stringify('User not found'));
              } else {
                var number = Math.floor(100000 + Math.random() * 900000);
                var cart = db.sequelize.models.Cart.findAll({
                  where: {
                    userId: currentUser.id,
                  },
                })
                  .then((cart) => {
                    var price = 0;
                    cart.forEach((item) => {
                      price += item.totalPrice;
                    });
                    console.log(price);
                    console.log(user.balance);
                    if (price > user.balance) {
                      return response
                        .status(400)
                        .json(JSON.stringify('Not enough money'));
                    }

                    var allProducts = [];
                    cart.forEach((item) => {
                      allProducts.push(item.productId);
                    });
                    var products = db.sequelize.models.Product.findAll({
                      where: {
                        id: allProducts,
                      },
                    }).then((products) => {
                      var productsToSend = [];
                      products.forEach((item) => {
                        productsToSend.push(item.name);
                      });

                      var productsWithKey = productsToSend.map(
                        (item) =>
                          `${item} : ${Math.random()
                            .toString(16)
                            .substr(2, 22)
                            .toUpperCase()}\n\n`,
                      );
                      console.log(productsWithKey);

                      fetch(
                        `https://api.telegram.org/bot5307025939:AAH4j720xC1kIC7I6XJXbczjWsJNi9y8qEk/sendMessage?chat_id=${data}&text=${productsWithKey.join(
                          '',
                        )}`,
                      ).catch((err) => {
                        return response.status(500).json(err.message);
                      });

                      console.log('PRICE', price);
                      console.log('USER BALANCE', user.balance);
                      db.sequelize.models.User.update(
                        {
                          balance: user.balance - price,
                        },
                        {
                          where: {
                            id: currentUser.id,
                          },
                        },
                      ).then(() => {
                        db.sequelize.models.Cart.destroy({
                          where: {
                            userId: currentUser.id,
                          },
                        }).then(() => {
                          return response.status(204).json('Success');
                        });
                      });
                    });
                  })
                  .catch((err) => {
                    return response.status(500).json(err.message);
                  });
              }
            })
            .catch((err) => {
              return response.status(500).json(err.message);
            });
        } else {
          return response.status(404).send('User not found');
        }
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },

  CheckTelegramChat: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }
    db.sequelize.models.User.findOne({
      where: { id: currentUser.id },
    })
      .then((user) => {
        if (user) {
          var data;
          var res = fetch(
            'https://api.telegram.org/bot5307025939:AAH4j720xC1kIC7I6XJXbczjWsJNi9y8qEk/getUpdates',
          )
            .then((res) => res.json())
            .then((json) => {
              console.log(json);
              data = json.result.map((item) => {
                if (item.message.from.username == user.telegramLogin) {
                  return item.message.from.id;
                }
              });
              console.log({ ...data }[1]);
              data = { ...data }[1];
              if (data.length == 0) {
                return response
                  .status(400)
                  .json(JSON.stringify('User not found'));
              } else {
                return response.status(200).json(JSON.stringify('User found'));
              }
            })
            .catch((err) => {
              return response.status(500).json(err.message);
            });
        } else {
          return response.status(404).send('User not found');
        }
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },

  AddProductToCart: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }
    db.sequelize.models.User.findOne({
      where: { id: currentUser.id },
    })
      .then((user) => {
        if (user) {
          console.log(request.body.productId);
          db.sequelize.models.Cart.findOne({
            where: {
              userId: currentUser.id,
              productId: request.body.productId,
            },
          }).then((cart) => {
            if (cart) {
              return response
                .status(400)
                .json(JSON.stringify('Product already in cart'));
            } else {
              db.sequelize.models.Product.findOne({
                where: {
                  id: request.body.productId,
                },
              }).then((product) => {
                db.sequelize.models.Cart.create({
                  userId: currentUser.id,
                  productId: request.body.productId,
                  count: request.body.count,
                  totalPrice: request.body.count * product.price,
                }).then((cart) => {
                  if (cart) {
                    return response.status(200).json(JSON.stringify('Added'));
                  }
                  return response.status(400).json(JSON.stringify('Not added'));
                });
              });
            }
          });
        } else {
          return response.status(404).send('User not found');
        }
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },
  GetProductsFromCart: (request, response) => {
    token = request.headers.authorization.split(' ')[1];
    var currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (currentUser === null) {
      return response.status(401).json(JSON.stringify('Unauthorized'));
    }
    db.sequelize.models.User.findOne({
      where: { id: currentUser.id },
    })
      .then((user) => {
        if (user) {
          db.sequelize.models.Cart.findAll({
            where: {
              userId: currentUser.id,
            },
          }).then((cart) => {
            if (cart) {
              var products = [];
              cart.forEach((item) => {
                products.push(item.productId);
              });
              db.sequelize.models.Product.findAll({
                where: {
                  id: products,
                },
              }).then((products) => {
                if (products) {
                  return response.status(200).json(products);
                } else {
                  return response
                    .status(400)
                    .json(JSON.stringify('No products'));
                }
              });
            } else {
              return response.status(400).json(JSON.stringify('No products'));
            }
          });
        } else {
          return response.status(404).send('User not found');
        }
      })
      .catch((err) => {
        return response.status(500).json(err.message);
      });
  },
};
