const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const User = require('./models/User')

mongoose.Promise = global.Promise;
// DB setup
mongoose.connect(process.env.MONGO_URI, function(err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log(`Connection established to "${db.name}" mongoDB.`);
  }
});

mongoose.connection
  .once('open', () => console.log('Good to go!'))
  .on('error', error => {
    console.warn('Warning', error);
  });

// App setup
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'))

// Routes
require('./routes/accountRoutes')(app);
require('./routes/categoryRoutes')(app);
require('./routes/productRoutes')(app);
require('./routes/productSearchRoutes')(app);


if (process.env.NODE_ENV === 'production') {
  // express will serve up production assets, like main.js or main.css
  app.use(express.static(path.join(__dirname, 'client', 'public')));

  // express will serve up index.html file if it doesnt recognize the route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'public', 'index.html'));
  });
}

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} locally`);
});
