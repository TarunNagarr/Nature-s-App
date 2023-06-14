const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
    app.listen(port, () => {
      console.log(`Server Listing on Port${port}`);
    });
  });
