const { Sequelize, Op } = require('sequelize');

db = {};

const sequelize = new Sequelize('NODECURSE', 'AVA', '5321153211', {
  dialect: 'mssql',
  host: 'localhost',
  define: {
    timestamps: false,
  },
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

class User extends Sequelize.Model {}
class Product extends Sequelize.Model {}
class Feedback extends Sequelize.Model {}
class Cart extends Sequelize.Model {}
class TelegramCode extends Sequelize.Model {}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    telegramLogin: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    telegramVerified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    role: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    profileImage: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    registrationDate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  { sequelize, modelName: 'User' },
);

Cart.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    count: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    totalPrice: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'Cart' },
);

Product.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    imageSrc: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    qty: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sales: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  { sequelize, modelName: 'Product' },
);

Feedback.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'Feedback' },
);

TelegramCode.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    code: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'TelegramCode' },
);

User.hasOne(TelegramCode, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
});
User.hasMany(Feedback, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
User.hasOne(Cart, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
});

const getPool = () =>
  sequelize
    .authenticate()
    .then(() => console.log('Connected'))
    .catch((err) => console.error('Connection error: ', err));

const sync = () =>
  sequelize
    .sync()
    .then((result) => {
      //console.log(result);
    })
    .catch((err) => console.log(err));
module.exports = {
  getPool,
  sync,
  db,
};
