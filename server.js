const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(`unhandled Rejection Shuting Down...`);

  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
const DB =
  'mongodb+srv://tarun:4Pw7Xf0w0Bdg2p9A@cluster1.kcb3u5s.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB Connect successfully!');
    // Server
    const port = process.env.PORT;
    const server = app.listen(port, () => {
      console.log(`Server Listing on Port${port}`);
    });

    process.on('unhandledRejection', err => {
      console.log(`unhandled Rejection Shuting Down...`);

      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  });
