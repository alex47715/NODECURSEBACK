const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const userRoute = require('./Routes/UserRoute');
const productRoute = require('./Routes/ProductRoute');

const app = express();

app.use(bodyParser.json());
var allowedOrigins = ['http://localhost:8080', 'http://localhost:8081'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  }),
);

app.use('/User', userRoute);
app.use('/Product', productRoute);

app.listen(3000, () => {
  console.log(`Listening to http://localhost:3000`);
});
