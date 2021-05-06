const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥💥💥');
  console.log(err);
  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;
const server = app.listen(port, () => console.log('running on port', port));

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥💥💥');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
